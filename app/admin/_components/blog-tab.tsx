"use client"

import { useState, useEffect } from "react"
import type { ToastType } from "./admin-toast"
import RichTextArea from "./rich-text-area"
import { plainText } from "@/lib/types/blog"
import { uploadImage } from "./upload"
import { Field } from "./ui/field"
import { TagInput } from "./ui/tag-input"
import { Dropzone } from "./ui/dropzone"
import { Sheet } from "./ui/sheet"
import { ConfirmAction } from "./ui/confirm-action"
import { ListItem, StatusBadge, EmptyState, ListSkeleton, SectionHeader } from "./ui/display"
import { useDirty, isSameData } from "./ui/dirty"
import { PlusIcon, EditIcon, ImageIcon, FolderIcon, ExternalIcon } from "@/components/portfolio/icons"

interface BlogPost {
  id: string; slug: string; title: string; content: string
  image: string; category: string; tags: string[]; publishedAt: string; draft: boolean
}

interface Props { onToast: (title: string, type: ToastType, msg?: string) => void }

type Form = { title: string; content: string; image: string; category: string; draft: boolean; tags: string[] }

const CATEGORIES = ["Diseño", "Desarrollo", "Producto", "UX Research", "Case Study"]
const EMPTY_FORM: Form = { title: "", content: "", image: "", category: "Diseño", draft: false, tags: [] }
const GITHUB_WARN = "No se pudo sincronizar con GitHub. Los cambios se perderán en el próximo deploy."

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" })
}

function validate(form: Form) {
  return {
    title: form.title.trim() ? "" : "Escribe un título para la entrada.",
    content: plainText(form.content).trim() ? "" : "La entrada necesita contenido.",
  }
}

// Blog (DS v2.1.0). Antes: formulario fijo arriba de la lista, botones con
// estilos inline, borrar SIN confirmación (y el borrado se commitea a GitHub),
// "arrastra una imagen" sin drop real y labels sin asociar.
// Ahora sigue el mismo modelo que Proyectos: lista + panel lateral de edición,
// borrado confirmado, validación por campo y aviso de cambios sin guardar.
// Las llamadas a /api/admin/blog y su payload no cambiaron.
export default function BlogTab({ onToast }: Props) {
  const [posts, setPosts]     = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<{ id: string | null } | null>(null)
  const [form, setForm]       = useState<Form>(EMPTY_FORM)
  const [snapshot, setSnapshot] = useState<Form>(EMPTY_FORM)
  const [errors, setErrors]   = useState({ title: "", content: "" })
  const [saving, setSaving]   = useState(false)
  const [askDiscard, setAskDiscard] = useState(false)

  useEffect(() => {
    fetch("/api/admin/blog", { cache: "no-store" })
      .then(r => r.json())
      .then(d => setPosts(Array.isArray(d.posts) ? d.posts : []))
      .catch(() => onToast("Error cargando entradas", "error"))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps -- carga única
  }, [])

  const dirty = editing !== null && !isSameData(form, snapshot)
  useDirty("blog", dirty, () => save())

  function open(post?: BlogPost) {
    const f: Form = post
      ? { title: post.title, content: post.content, image: post.image, category: post.category, draft: post.draft, tags: post.tags || [] }
      : EMPTY_FORM
    setForm(f); setSnapshot(f); setErrors({ title: "", content: "" }); setAskDiscard(false)
    setEditing({ id: post?.id ?? null })
  }

  function close(force = false) {
    if (dirty && !force) { setAskDiscard(true); return }
    setEditing(null); setAskDiscard(false)
  }

  async function save() {
    const next = validate(form)
    setErrors(next)
    if (next.title || next.content) {
      onToast("Revisa los campos marcados", "warning")
      return
    }
    setSaving(true)
    try {
      const isEdit = editing?.id != null
      const res = await fetch("/api/admin/blog", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { id: editing!.id, ...form } : form),
      })
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || "Error al guardar") }
      const saved = await res.json()
      setPosts(prev => isEdit ? prev.map(p => p.id === saved.id ? saved : p) : [saved, ...prev])
      saved._githubWarning
        ? onToast("Entrada guardada localmente", "warning", GITHUB_WARN)
        : onToast(isEdit ? "Entrada actualizada" : form.draft ? "Borrador guardado" : "Entrada publicada", "success")
      setSnapshot(form)
      setEditing(null)
    } catch (e) {
      onToast(e instanceof Error ? e.message : "Error al guardar", "error")
    } finally { setSaving(false) }
  }

  async function remove(id: string) {
    try {
      const res = await fetch(`/api/admin/blog?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setPosts(prev => prev.filter(p => p.id !== id))
      data._githubWarning
        ? onToast("Entrada eliminada localmente", "warning", "No se pudo sincronizar con GitHub. La entrada podría reaparecer en el próximo deploy.")
        : onToast("Entrada eliminada", "success")
    } catch { onToast("Error al eliminar", "error") }
  }

  const drafts = posts.filter(p => p.draft).length
  const chars = plainText(form.content).length

  return (
    <>
      <SectionHeader
        title="Blog"
        description={loading ? "Cargando entradas…" : `${posts.length} entrada${posts.length === 1 ? "" : "s"}${drafts ? ` · ${drafts} borrador${drafts === 1 ? "" : "es"}` : ""}`}
        action={<button type="button" className="a-btn a-btn--primary" onClick={() => open()}><PlusIcon /> Nueva entrada</button>}
      />

      {loading ? (
        <ListSkeleton rows={4} label="Cargando entradas" />
      ) : posts.length === 0 ? (
        <EmptyState icon={<FolderIcon />} title="Aún no hay entradas"
          description="Crea la primera: aparecerá en el blog del sitio y en la home."
          action={<button type="button" className="a-btn a-btn--primary" onClick={() => open()}><PlusIcon /> Nueva entrada</button>} />
      ) : (
        <ul className="a-list">
          {posts.map(post => (
            <ListItem
              key={post.id}
              active={editing?.id === post.id}
              media={post.image ? <img src={post.image} alt="" loading="lazy" /> : <ImageIcon />}
              title={post.title}
              badge={<StatusBadge tone={post.draft ? "draft" : "live"}>{post.draft ? "Borrador" : "Publicado"}</StatusBadge>}
              meta={<>
                <span>{post.category}</span>
                <span>{formatDate(post.publishedAt)}</span>
                {(post.tags || []).length > 0 && <span>{post.tags.map(t => `#${t}`).join(" ")}</span>}
              </>}
              actions={<>
                {!post.draft && (
                  <a className="a-icon-btn" href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" aria-label={`Ver «${post.title}» en el sitio`}>
                    <ExternalIcon />
                  </a>
                )}
                <button type="button" className="a-btn a-btn--ghost a-btn--sm" onClick={() => open(post)} aria-label={`Editar «${post.title}»`}>
                  <EditIcon /> Editar
                </button>
                <ConfirmAction itemName={post.title} question="¿Eliminar la entrada?" onConfirm={() => remove(post.id)} />
              </>}
            />
          ))}
        </ul>
      )}

      <Sheet
        open={editing !== null}
        onOpenChange={(o) => { if (!o) close() }}
        title={editing?.id ? "Editar entrada" : "Nueva entrada"}
        description={editing?.id ? "Los cambios se publican al guardar." : "Se publica al guardar, salvo que la marques como borrador."}
        footer={askDiscard ? (
          <div className="a-confirm" role="group" aria-label="Cambios sin guardar">
            <span className="a-confirm-q">¿Descartar los cambios?</span>
            <button type="button" className="a-btn a-btn--danger a-btn--sm" onClick={() => close(true)}>Descartar</button>
            <button type="button" className="a-btn a-btn--ghost a-btn--sm" autoFocus onClick={() => setAskDiscard(false)}>Seguir editando</button>
          </div>
        ) : (
          <>
            <button type="button" className="a-btn a-btn--ghost" onClick={() => close()}>Cancelar</button>
            <button type="button" className="a-btn a-btn--primary" onClick={save} disabled={saving} aria-busy={saving || undefined}>
              {saving ? "Guardando…" : editing?.id ? "Guardar cambios" : form.draft ? "Guardar borrador" : "Publicar entrada"}
            </button>
          </>
        )}
      >
        <Field label="Título" required error={errors.title} aside={`${form.title.length}/120`}>
          {(p) => <input {...p} className="admin-input" value={form.title} maxLength={120}
            onChange={e => { setForm(f => ({ ...f, title: e.target.value })); if (errors.title) setErrors(x => ({ ...x, title: "" })) }}
            onBlur={() => setErrors(x => ({ ...x, title: validate(form).title }))} />}
        </Field>

        <div className="a-row-2">
          <Field label="Categoría">
            {(p) => <select {...p} className="admin-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>}
          </Field>
          <Field label="Estado" hint={form.draft ? "No se muestra en el sitio." : "Visible en el blog al guardar."}>
            {(p) => (
              <label className="a-switch">
                <input {...p} type="checkbox" role="switch" checked={form.draft} onChange={e => setForm(f => ({ ...f, draft: e.target.checked }))} />
                <span className="a-switch-track" aria-hidden="true" />
                <span>Borrador</span>
              </label>
            )}
          </Field>
        </div>

        <Field label="Etiquetas" hint="Enter o coma para agregar. Mejoran la búsqueda y el filtrado del blog." aside={`${form.tags.length}/10`}>
          {(p) => <TagInput control={p} value={form.tags} onChange={tags => setForm(f => ({ ...f, tags }))} max={10}
            normalize={s => s.trim().toLowerCase()} />}
        </Field>

        <Dropzone label="Imagen de portada" hint="JPG, PNG o WebP. Se recorta a 16:9 en las cards." aspect="16 / 7"
          value={form.image || undefined}
          onUpload={async file => { const url = await uploadImage(file); setForm(f => ({ ...f, image: url })) }}
          onRemove={() => setForm(f => ({ ...f, image: "" }))} />

        <Field label="Contenido" required error={errors.content} hint={`${chars} caracteres · los primeros 100 se usan como resumen en el sitio.`}>
          {(_p, meta) => (
            <RichTextArea variant="full" value={form.content} minHeight={240} placeholder="Escribe el contenido de la entrada…"
              labelledBy={meta.labelId} describedBy={_p["aria-describedby"]} invalid={meta.invalid}
              onChange={v => { setForm(f => ({ ...f, content: v })); if (errors.content) setErrors(x => ({ ...x, content: "" })) }} />
          )}
        </Field>
      </Sheet>
    </>
  )
}
