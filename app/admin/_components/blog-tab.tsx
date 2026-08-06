"use client"

import { useState, useEffect, useRef, ChangeEvent, KeyboardEvent } from "react"
import type { ToastType } from "./admin-toast"
import RichTextArea from "./rich-text-area"

interface BlogPost {
  id: string; slug: string; title: string; content: string
  image: string; category: string; tags: string[]; publishedAt: string; draft: boolean
}

interface Props { onToast: (title: string, type: ToastType, msg?: string) => void }

const CATEGORIES = ["Diseño", "Desarrollo", "Producto", "UX Research", "Case Study"]
const EMPTY_FORM = { title: "", content: "", image: "", category: "Diseño", draft: false, tags: [] as string[] }

async function uploadImage(file: File): Promise<string> {
  const fd = new FormData(); fd.append("file", file)
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd })
  if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || "Error al subir") }
  return (await res.json()).url
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" })
}

export default function BlogTab({ onToast }: Props) {
  const [posts,    setPosts]    = useState<BlogPost[]>([])
  const [form,     setForm]     = useState(EMPTY_FORM)
  const [editId,   setEditId]   = useState<string | null>(null)
  const [saving,   setSaving]   = useState(false)
  const [loading,  setLoading]  = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [uploading,setUploading]= useState(false)
  const imgRef    = useRef<HTMLInputElement>(null)
  const tagInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch("/api/admin/blog", { cache: "no-store" })
      .then(r => r.json())
      .then(d => setPosts(Array.isArray(d.posts) ? d.posts : []))
      .catch(() => onToast("Error cargando entradas", "error"))
      .finally(() => setLoading(false))
  }, [])

  async function handleUpload(file: File) {
    setUploading(true)
    try {
      const url = await uploadImage(file)
      setForm(prev => ({ ...prev, image: url }))
    } catch (e) {
      onToast(e instanceof Error ? e.message : "Error al subir imagen", "error")
    } finally { setUploading(false) }
  }

  function addTag(raw: string) {
    const tag = raw.trim().toLowerCase().replace(/,+$/, "")
    if (!tag || form.tags.includes(tag) || form.tags.length >= 10) return
    setForm(p => ({ ...p, tags: [...p.tags, tag] }))
  }

  function removeTag(tag: string) {
    setForm(p => ({ ...p, tags: p.tags.filter(t => t !== tag) }))
  }

  function handleTagKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag(e.currentTarget.value)
      e.currentTarget.value = ""
    } else if (e.key === "Backspace" && !e.currentTarget.value && form.tags.length) {
      setForm(p => ({ ...p, tags: p.tags.slice(0, -1) }))
    }
  }

  function startEdit(post: BlogPost) {
    setEditId(post.id)
    setForm({
      title: post.title, content: post.content, image: post.image,
      category: post.category, draft: post.draft, tags: post.tags || [],
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function cancelEdit() { setEditId(null); setForm(EMPTY_FORM) }

  async function handleSave() {
    if (!form.title.trim()) { onToast("El título es obligatorio", "warning"); return }
    setSaving(true)
    try {
      const isEdit = editId !== null
      const res = await fetch("/api/admin/blog", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { id: editId, ...form } : form),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      const saved = await res.json()
      const warned = Boolean(saved._githubWarning)
      if (isEdit) {
        setPosts(prev => prev.map(p => p.id === saved.id ? saved : p))
        warned
          ? onToast("Entrada guardada localmente", "warning", "No se pudo sincronizar con GitHub. Los cambios se perderán en el próximo deploy.")
          : onToast("Entrada actualizada", "success")
        cancelEdit()
      } else {
        setPosts(prev => [saved, ...prev])
        setForm(EMPTY_FORM)
        warned
          ? onToast("Entrada guardada localmente", "warning", "No se pudo sincronizar con GitHub. Los cambios se perderán en el próximo deploy.")
          : onToast("Entrada publicada", "success")
      }
    } catch (e) {
      onToast(e instanceof Error ? e.message : "Error al guardar", "error")
    } finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/blog?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setPosts(prev => prev.filter(p => p.id !== id))
      if (editId === id) cancelEdit()
      data._githubWarning
        ? onToast("Entrada eliminada localmente", "warning", "No se pudo sincronizar con GitHub. La entrada podría reaparecer en el próximo deploy.")
        : onToast("Entrada eliminada", "success")
    } catch { onToast("Error al eliminar", "error") }
    finally { setDeleting(null) }
  }

  const isEditing = editId !== null

  return (
    <>
      <div className="admin-section-header">
        <div>
          <div className="admin-section-title">Blog</div>
          <div className="admin-section-sub">
            {isEditing ? "Editando entrada — modifica los campos y guarda los cambios" : "Crea y gestiona las entradas del blog"}
          </div>
        </div>
        {isEditing && (
          <button className="btn-g" onClick={cancelEdit}>Cancelar edición</button>
        )}
      </div>

      {/* ── Form ── */}
      <div className="admin-card" style={{ marginBottom: 16 }}>
        <div className="admin-card-title">{isEditing ? "Editar entrada" : "Nueva entrada"}</div>

        {/* Title */}
        <div className="admin-field">
          <label className="admin-label">Título *</label>
          <input className="admin-input" value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            placeholder="Título de la entrada…" maxLength={120} />
        </div>

        {/* Category + draft row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, marginBottom: 14, alignItems: "flex-end" }}>
          <div className="admin-field" style={{ marginBottom: 0 }}>
            <label className="admin-label">Categoría</label>
            <select className="admin-input" value={form.category}
              onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              style={{ cursor: "pointer" }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "var(--txt2)", cursor: "pointer", paddingBottom: 10 }}>
            <input type="checkbox" checked={form.draft}
              onChange={e => setForm(p => ({ ...p, draft: e.target.checked }))} />
            Guardar como borrador
          </label>
        </div>

        {/* Tags */}
        <div className="admin-field">
          <label className="admin-label">
            Tags
            <span style={{ fontWeight: 400, marginLeft: 6, color: "var(--txt3)" }}>
              ({form.tags.length}/10) — Enter o coma para añadir
            </span>
          </label>
          <div
            className="admin-chips-wrap"
            onClick={() => tagInputRef.current?.focus()}
          >
            {form.tags.map(tag => (
              <span key={tag} className="admin-chip">
                {tag}
                <button
                  className="admin-chip-x"
                  onClick={e => { e.stopPropagation(); removeTag(tag) }}
                  aria-label={`Eliminar tag ${tag}`}
                >×</button>
              </span>
            ))}
            <input
              ref={tagInputRef}
              className="admin-chip-input"
              placeholder={form.tags.length >= 10 ? "Máx. 10 tags" : "Escribe un tag…"}
              disabled={form.tags.length >= 10}
              onKeyDown={handleTagKeyDown}
              onBlur={e => { if (e.target.value.trim()) { addTag(e.target.value); e.target.value = "" } }}
            />
          </div>
          <div className="admin-input-hint">Los tags mejoran la búsqueda y el filtrado en el blog.</div>
        </div>

        {/* Image */}
        <div className="admin-field">
          <label className="admin-label">Imagen de portada</label>
          <input ref={imgRef} type="file" accept=".jpg,.jpeg,.png,.webp,.svg,image/*"
            style={{ display: "none" }}
            onChange={(e: ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = "" }} />
          {form.image ? (
            <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", marginBottom: 8 }}>
              <img src={form.image} alt="" loading="lazy" style={{ width: "100%", aspectRatio: "16/7", objectFit: "cover", display: "block" }} />
              <button onClick={() => setForm(p => ({ ...p, image: "" }))}
                style={{ position: "absolute", top: 10, right: 10, padding: "4px 10px", borderRadius: 6, border: "none", background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 11, cursor: "pointer" }}>
                Quitar
              </button>
            </div>
          ) : (
            <div onClick={() => !uploading && imgRef.current?.click()}
              style={{ border: `2px dashed var(--border)`, borderRadius: 12, padding: "24px 16px", textAlign: "center", cursor: "pointer", background: "var(--bg3)" }}>
              {uploading ? (
                <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center", color: "var(--txt2)", fontSize: 13 }}>
                  <div className="admin-spinner" /> Subiendo…
                </div>
              ) : (
                <div style={{ color: "var(--txt3)", fontSize: 13 }}>
                  Haz click o arrastra una imagen · JPG, PNG, WebP
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="admin-field">
          <label className="admin-label">Contenido *</label>
          <RichTextArea
            value={form.content}
            onChange={v => setForm(p => ({ ...p, content: v }))}
            placeholder="Escribe el contenido de la entrada…"
            minHeight={200}
          />
          <div className="admin-input-hint">
            {form.content.length} caracteres · Los primeros 100 aparecerán como resumen en el portafolio.
          </div>
        </div>

        <button className="btn-p" onClick={handleSave} disabled={saving || uploading}>
          {saving ? "Guardando…" : isEditing ? "Guardar cambios" : form.draft ? "Guardar borrador" : "Publicar entrada"}
        </button>
      </div>

      {/* ── List ── */}
      <div className="admin-card">
        <div className="admin-card-title">
          Entradas guardadas
          <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 500, color: "var(--txt3)" }}>
            ({posts.length})
          </span>
        </div>

        {loading ? (
          <div style={{ padding: "24px 0", display: "flex", gap: 10, alignItems: "center", color: "var(--txt3)", fontSize: 14 }}>
            <div className="admin-spinner" /> Cargando…
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--txt3)", fontSize: 14 }}>
            Aún no hay entradas. Crea la primera arriba.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {posts.map(post => (
              <div key={post.id} style={{
                display: "grid", gridTemplateColumns: "64px 1fr auto",
                gap: 12, alignItems: "center", padding: "12px 14px",
                background: editId === post.id ? "rgba(41,151,255,0.06)" : "var(--bg3)",
                border: `1px solid ${editId === post.id ? "rgba(41,151,255,0.25)" : "var(--border)"}`,
                borderRadius: 12, transition: "border-color 150ms ease, background 150ms ease",
              }}>
                {/* Thumb */}
                <div style={{ width: 64, height: 44, borderRadius: 8, overflow: "hidden", background: "var(--bg)", flexShrink: 0 }}>
                  {post.image
                    ? <img src={post.image} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <div style={{ width: "100%", height: "100%", background: "var(--glass)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--txt3)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      </div>}
                </div>
                {/* Info */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--txt)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {post.title}
                    </span>
                    {post.draft && (
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", padding: "2px 7px", borderRadius: 4, background: "rgba(245,158,11,0.15)", color: "var(--warning)", flexShrink: 0 }}>
                        BORRADOR
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--txt3)", display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <span>{post.category}</span>
                    <span>{formatDate(post.publishedAt)}</span>
                    {(post.tags || []).length > 0 && (
                      <span style={{ color: "var(--accent)" }}>
                        {post.tags.map(t => `#${t}`).join(" ")}
                      </span>
                    )}
                  </div>
                </div>
                {/* Actions */}
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button onClick={() => editId === post.id ? cancelEdit() : startEdit(post)}
                    style={{ padding: "5px 12px", borderRadius: 7, border: "none", background: editId === post.id ? "rgba(41,151,255,0.15)" : "var(--glass-hover)", color: editId === post.id ? "var(--accent)" : "var(--txt2)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    {editId === post.id ? "Cancelar" : "Editar"}
                  </button>
                  <button onClick={() => handleDelete(post.id)} disabled={deleting === post.id}
                    style={{ padding: "5px 12px", borderRadius: 7, border: "none", background: "rgba(239,68,68,0.10)", color: "#ef4444", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    {deleting === post.id ? "…" : "Eliminar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
