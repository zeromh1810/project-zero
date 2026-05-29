"use client"

import { useState, useRef, KeyboardEvent, ChangeEvent } from "react"

interface KPI { val: string; lbl: string }

export interface ProjectData {
  id?: number
  slug?: string
  title: string
  category: string
  year: number
  desc: string
  emoji: string
  stat: string
  accentColor: string
  gradient: string
  lightGradient: string
  tags: string[]
  kpis: KPI[]
  intro: string
  process: string
  result: string
  thumbnail?: string
  gallery?: string[]
}

const EMPTY: ProjectData = {
  title: "", category: "", year: new Date().getFullYear(),
  desc: "", emoji: "✦", stat: "", accentColor: "#2997ff",
  gradient: "linear-gradient(135deg, #001428 0%, #002050 40%, #0a1a60 100%)",
  lightGradient: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 40%, #93c5fd 100%)",
  tags: [], kpis: [{ val: "", lbl: "" }, { val: "", lbl: "" }, { val: "", lbl: "" }],
  intro: "", process: "", result: "",
  thumbnail: "", gallery: ["", "", "", "", "", ""],
}

interface Props {
  initial?: ProjectData | null
  onSave: (data: ProjectData) => Promise<void>
  onClose: () => void
  saving: boolean
}

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData()
  fd.append("file", file)
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || "Error al subir")
  }
  const { url } = await res.json()
  return url
}

export default function ProjectForm({ initial, onSave, onClose, saving }: Props) {
  const [form, setForm] = useState<ProjectData>(() => {
    if (!initial) return EMPTY
    return {
      ...EMPTY,
      ...initial,
      gallery: Array.from({ length: 6 }, (_, i) => initial.gallery?.[i] ?? ""),
    }
  })
  const [tagInput, setTagInput] = useState("")
  const chipInputRef = useRef<HTMLInputElement>(null)
  const thumbInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [uploadingThumb, setUploadingThumb] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState<boolean[]>(Array(6).fill(false))
  const [uploadError, setUploadError] = useState<string | null>(null)

  function set(field: keyof ProjectData, value: unknown) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function setKPI(index: number, field: keyof KPI, value: string) {
    const kpis = [...form.kpis]
    kpis[index] = { ...kpis[index], [field]: value }
    set("kpis", kpis)
  }

  function addTag() {
    const t = tagInput.trim()
    if (t && !form.tags.includes(t)) set("tags", [...form.tags, t])
    setTagInput("")
  }

  function removeTag(tag: string) {
    set("tags", form.tags.filter(t => t !== tag))
  }

  function onTagKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag() }
    if (e.key === "Backspace" && !tagInput && form.tags.length) set("tags", form.tags.slice(0, -1))
  }

  async function handleThumbChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingThumb(true)
    setUploadError(null)
    try {
      const url = await uploadFile(file)
      set("thumbnail", url)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Error al subir")
    } finally {
      setUploadingThumb(false)
      e.target.value = ""
    }
  }

  async function handleGalleryChange(e: ChangeEvent<HTMLInputElement>, slot: number) {
    const file = e.target.files?.[0]
    if (!file) return
    const next = [...(uploadingGallery)]
    next[slot] = true
    setUploadingGallery(next)
    setUploadError(null)
    try {
      const url = await uploadFile(file)
      const gallery = [...(form.gallery ?? Array(6).fill(""))]
      gallery[slot] = url
      set("gallery", gallery)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Error al subir")
    } finally {
      const n = [...(uploadingGallery)]
      n[slot] = false
      setUploadingGallery(n)
      e.target.value = ""
    }
  }

  function removeGallerySlot(slot: number) {
    const gallery = [...(form.gallery ?? Array(6).fill(""))]
    gallery[slot] = ""
    set("gallery", gallery)
  }

  async function handleSubmit() {
    if (!form.title.trim()) return
    const cleaned = {
      ...form,
      gallery: (form.gallery ?? []).filter(Boolean),
      thumbnail: form.thumbnail || undefined,
    }
    await onSave(cleaned)
  }

  const gallery6 = Array.from({ length: 6 }, (_, i) => form.gallery?.[i] ?? "")

  return (
    <>
      <div className="admin-panel-overlay" onClick={onClose} />
      <div className="admin-panel">
        <div className="admin-panel-header">
          <div className="admin-panel-title">
            {initial ? "Editar proyecto" : "Nuevo proyecto"}
          </div>
          <button className="modal-x" onClick={onClose}>✕</button>
        </div>

        <div className="admin-panel-body">

          {/* ── BÁSICO ── */}
          <div className="admin-card-title">Información básica</div>
          <div className="admin-row-3" style={{ marginBottom: 12 }}>
            <div className="admin-field">
              <label className="admin-label">Título</label>
              <input className="admin-input" value={form.title}
                onChange={e => set("title", e.target.value)} placeholder="Ej: E-commerce Redesign" />
            </div>
            <div className="admin-field">
              <label className="admin-label">Categoría</label>
              <input className="admin-input" value={form.category}
                onChange={e => set("category", e.target.value)} placeholder="Ej: UX/UI Design" />
            </div>
            <div className="admin-field">
              <label className="admin-label">Año</label>
              <input className="admin-input" type="number" value={form.year}
                onChange={e => set("year", Number(e.target.value))} min={2000} max={2099} />
            </div>
          </div>
          <div className="admin-field">
            <label className="admin-label">Descripción corta</label>
            <input className="admin-input" value={form.desc}
              onChange={e => set("desc", e.target.value)} placeholder="Una línea que resume el proyecto" />
          </div>

          {/* ── THUMBNAIL ── */}
          <div className="admin-card-title" style={{ marginTop: 20 }}>Thumbnail de la tarjeta</div>
          <div className="admin-field">
            <input ref={thumbInputRef} type="file" accept="image/*"
              style={{ display: "none" }} onChange={handleThumbChange} />

            {form.thumbnail ? (
              <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", aspectRatio: "16/10", border: "1.5px solid var(--border)" }}>
                <img src={form.thumbnail} alt="Thumbnail"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "0")}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="admin-btn-sm" style={{ color: "white", borderColor: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.15)" }}
                      onClick={() => thumbInputRef.current?.click()}>
                      Cambiar
                    </button>
                    <button className="admin-btn-sm admin-btn-danger" style={{ background: "rgba(239,68,68,0.25)" }}
                      onClick={() => set("thumbnail", "")}>
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => thumbInputRef.current?.click()}
                disabled={uploadingThumb}
                style={{
                  width: "100%", aspectRatio: "16/10", borderRadius: 12, display: "flex",
                  flexDirection: "column", alignItems: "center", justifyContent: "center",
                  border: "1.5px dashed var(--border)", background: "var(--bg3)", gap: 8,
                  cursor: "pointer", color: "var(--txt3)", fontSize: 14, transition: "all 0.2s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--accent)" }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--txt3)" }}
              >
                {uploadingThumb ? (
                  <><div className="admin-spinner" /> Subiendo…</>
                ) : (
                  <>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span>Click para subir thumbnail</span>
                    <span style={{ fontSize: 12 }}>JPG, PNG o WebP · máx. 8 MB</span>
                  </>
                )}
              </button>
            )}
            <div className="admin-input-hint">Se muestra como fondo de la tarjeta en el portafolio</div>
          </div>

          {/* ── GALERÍA ── */}
          <div className="admin-card-title" style={{ marginTop: 20 }}>Galería de resultados</div>
          <div className="admin-input-hint" style={{ marginBottom: 12 }}>
            Sube hasta 6 imágenes del proyecto. Los espacios vacíos mostrarán un placeholder generado.
          </div>

          <div className="admin-gallery-grid">
            {gallery6.map((url, slot) => (
              <div key={slot}>
                <input
                  ref={el => { galleryInputRefs.current[slot] = el }}
                  type="file" accept="image/*" style={{ display: "none" }}
                  onChange={e => handleGalleryChange(e, slot)}
                />
                {url ? (
                  <div style={{ position: "relative", aspectRatio: "4/3", borderRadius: 10, overflow: "hidden", border: "1.5px solid var(--border)" }}>
                    <img src={url} alt={`Galería ${slot + 1}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{
                      position: "absolute", top: 6, right: 6,
                    }}>
                      <button className="admin-btn-sm admin-btn-danger"
                        style={{ padding: "4px 8px", fontSize: 10, background: "rgba(239,68,68,0.85)", color: "white", border: "none" }}
                        onClick={() => removeGallerySlot(slot)}>
                        ✕
                      </button>
                    </div>
                    <div style={{
                      position: "absolute", bottom: 0, left: 0, right: 0, padding: "4px 6px",
                      background: "rgba(0,0,0,0.55)", fontSize: 10, color: "rgba(255,255,255,0.8)",
                      textAlign: "center",
                    }}>
                      {slot + 1} / 6
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => galleryInputRefs.current[slot]?.click()}
                    disabled={uploadingGallery[slot]}
                    style={{
                      width: "100%", aspectRatio: "4/3", borderRadius: 10, display: "flex",
                      flexDirection: "column", alignItems: "center", justifyContent: "center",
                      border: "1.5px dashed var(--border)", background: "var(--bg3)",
                      cursor: "pointer", color: "var(--txt3)", fontSize: 11, gap: 4,
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--accent)" }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--txt3)" }}
                  >
                    {uploadingGallery[slot] ? (
                      <div className="admin-spinner" style={{ width: 14, height: 14 }} />
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        <span>Imagen {slot + 1}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>

          {uploadError && (
            <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", fontSize: 13 }}>
              ✕ {uploadError}
            </div>
          )}

          {/* ── VISUAL ── */}
          <div className="admin-card-title" style={{ marginTop: 20 }}>Visual</div>
          <div className="admin-row-3" style={{ marginBottom: 12 }}>
            <div className="admin-field">
              <label className="admin-label">Emoji</label>
              <input className="admin-input" value={form.emoji}
                onChange={e => set("emoji", e.target.value)} placeholder="🛍" />
            </div>
            <div className="admin-field">
              <label className="admin-label">Stat badge</label>
              <input className="admin-input" value={form.stat}
                onChange={e => set("stat", e.target.value)} placeholder="+34% conversión" />
            </div>
            <div className="admin-field">
              <label className="admin-label">Color acento</label>
              <div className="admin-color-preview">
                <input type="color" value={form.accentColor}
                  onChange={e => set("accentColor", e.target.value)}
                  style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border)", cursor: "pointer", padding: 2, background: "var(--bg3)" }} />
                <input className="admin-input" value={form.accentColor}
                  onChange={e => set("accentColor", e.target.value)} placeholder="#2997ff" />
              </div>
            </div>
          </div>
          <div className="admin-field">
            <label className="admin-label">Gradiente oscuro</label>
            <input className="admin-input" value={form.gradient}
              onChange={e => set("gradient", e.target.value)} />
          </div>
          <div className="admin-field">
            <label className="admin-label">Gradiente claro</label>
            <input className="admin-input" value={form.lightGradient}
              onChange={e => set("lightGradient", e.target.value)} />
          </div>

          {/* ── TAGS ── */}
          <div className="admin-card-title" style={{ marginTop: 20 }}>Tags</div>
          <div className="admin-field">
            <div className="admin-chips-wrap" onClick={() => chipInputRef.current?.focus()}>
              {form.tags.map(tag => (
                <span key={tag} className="admin-chip">
                  {tag}
                  <button className="admin-chip-x" onClick={() => removeTag(tag)}>✕</button>
                </span>
              ))}
              <input ref={chipInputRef} className="admin-chip-input" value={tagInput}
                onChange={e => setTagInput(e.target.value)} onKeyDown={onTagKey} onBlur={addTag}
                placeholder={form.tags.length === 0 ? "Escribe un tag y presiona Enter" : ""} />
            </div>
            <div className="admin-input-hint">Presiona Enter o coma para agregar</div>
          </div>

          {/* ── KPIs ── */}
          <div className="admin-card-title" style={{ marginTop: 20 }}>KPIs</div>
          <div className="admin-kpi-header">
            <span className="admin-kpi-col-label">Valor</span>
            <span className="admin-kpi-col-label">Etiqueta</span>
          </div>
          <div className="admin-kpi-grid" style={{ marginBottom: 4 }}>
            {form.kpis.map((kpi, i) => (
              <div key={i} className="admin-kpi-row">
                <input className="admin-input" value={kpi.val}
                  onChange={e => setKPI(i, "val", e.target.value)}
                  placeholder={["+34%", "12k", "4 meses"][i]} />
                <input className="admin-input" value={kpi.lbl}
                  onChange={e => setKPI(i, "lbl", e.target.value)}
                  placeholder={["Conversión", "Usuarios", "Duración"][i]} />
              </div>
            ))}
          </div>

          {/* ── CASO DE ESTUDIO ── */}
          <div className="admin-card-title" style={{ marginTop: 20 }}>Caso de estudio</div>
          <div className="admin-field">
            <label className="admin-label">Introducción / Problema</label>
            <textarea className="admin-textarea" style={{ minHeight: 120 }} value={form.intro}
              onChange={e => set("intro", e.target.value)}
              placeholder="Describe el contexto y el desafío inicial..." />
          </div>
          <div className="admin-field">
            <label className="admin-label">Proceso</label>
            <textarea className="admin-textarea" style={{ minHeight: 120 }} value={form.process}
              onChange={e => set("process", e.target.value)}
              placeholder="Explica cómo abordaste el problema..." />
          </div>
          <div className="admin-field">
            <label className="admin-label">Resultado</label>
            <textarea className="admin-textarea" style={{ minHeight: 100 }} value={form.result}
              onChange={e => set("result", e.target.value)}
              placeholder="Describe el impacto y los resultados obtenidos..." />
          </div>
        </div>

        <div className="admin-panel-footer">
          <button className="btn-p" style={{ flex: 1, justifyContent: "center" }}
            onClick={handleSubmit} disabled={saving || !form.title.trim()}>
            {saving ? "Guardando…" : "Guardar proyecto"}
          </button>
          <button className="btn-g" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </>
  )
}
