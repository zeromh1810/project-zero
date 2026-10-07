"use client"

import { useState, useRef, type ChangeEvent } from "react"
import RichTextArea from "./rich-text-area"
import { uploadImage as uploadFile } from "./upload"
import { Field } from "./ui/field"
import { TagInput } from "./ui/tag-input"
import { Dropzone } from "./ui/dropzone"
import { Sheet } from "./ui/sheet"
import { useDirty, isSameData } from "./ui/dirty"
import { PlusIcon, CloseIcon } from "@/components/portfolio/icons"

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
  /** v2.1.0 — los lee el detalle público (rol y CTA "Ver proyecto live"). */
  role?: string
  liveUrl?: string
}

const EMPTY: ProjectData = {
  title: "", category: "", year: new Date().getFullYear(),
  desc: "", emoji: "", stat: "", accentColor: "#2997ff",
  gradient: "linear-gradient(135deg, #001428 0%, #002050 40%, #0a1a60 100%)",
  lightGradient: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 40%, #93c5fd 100%)",
  tags: [], kpis: [{ val: "", lbl: "" }, { val: "", lbl: "" }, { val: "", lbl: "" }],
  intro: "", process: "", result: "",
  thumbnail: "", gallery: ["", "", "", "", "", ""], role: "", liveUrl: "",
}

interface Props {
  initial?: ProjectData | null
  onSave: (data: ProjectData) => Promise<void>
  onClose: () => void
  saving: boolean
}

function validate(f: ProjectData) {
  return {
    title: f.title.trim() ? "" : "Escribe el título del proyecto.",
    category: f.category.trim() ? "" : "Indica la categoría (se muestra en la card).",
    liveUrl: !f.liveUrl || /^https?:\/\/\S+\.\S+/.test(f.liveUrl) ? "" : "La URL debe empezar con https://",
  }
}

// Panel de proyecto (DS v2.1.0). Antes: un div con overlay (sin ESC, sin trap
// de foco), "Cambiar/Eliminar" del thumbnail visibles solo con hover, 30
// estilos inline y guardar sin título fallaba en silencio. Ahora es un Sheet
// (Radix), con Field/Dropzone/TagInput, validación por campo y aviso de
// cambios sin guardar. El payload es el mismo (+ role/liveUrl opcionales).
export default function ProjectForm({ initial, onSave, onClose, saving }: Props) {
  const [form, setForm] = useState<ProjectData>(() => {
    if (!initial) return EMPTY
    return { ...EMPTY, ...initial, gallery: Array.from({ length: 6 }, (_, i) => initial.gallery?.[i] ?? "") }
  })
  const [snapshot] = useState(form)
  const [errors, setErrors] = useState({ title: "", category: "", liveUrl: "" })
  const [askDiscard, setAskDiscard] = useState(false)
  const [galleryError, setGalleryError] = useState<string | null>(null)
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null)
  const galleryInputs = useRef<(HTMLInputElement | null)[]>([])

  const dirty = !isSameData(form, snapshot)
  useDirty("project-form", dirty, () => submit())

  function set<K extends keyof ProjectData>(field: K, value: ProjectData[K]) {
    setForm(prev => ({ ...prev, [field]: value }))
    if (field in errors && errors[field as keyof typeof errors]) setErrors(e => ({ ...e, [field]: "" }))
  }

  function setKPI(index: number, key: keyof KPI, value: string) {
    const kpis = [...form.kpis]
    kpis[index] = { ...kpis[index], [key]: value }
    set("kpis", kpis)
  }

  async function onGallery(e: ChangeEvent<HTMLInputElement>, slot: number) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setGalleryError(null); setUploadingSlot(slot)
    try {
      const url = await uploadFile(file)
      const g = [...(form.gallery ?? Array(6).fill(""))]; g[slot] = url
      set("gallery", g)
    } catch (err) {
      setGalleryError(err instanceof Error ? err.message : "No se pudo subir la imagen.")
    } finally { setUploadingSlot(null) }
  }

  function removeSlot(slot: number) {
    const g = [...(form.gallery ?? Array(6).fill(""))]; g[slot] = ""
    set("gallery", g)
  }

  async function submit() {
    const next = validate(form)
    setErrors(next)
    if (next.title || next.category || next.liveUrl) return
    // Cadena vacía, nunca undefined: la API hace { ...guardado, ...body } y
    // JSON.stringify omite los undefined — quitar el thumbnail (o vaciar rol /
    // URL) y guardar NO lo quitaba (bug previo). El sitio trata "" como vacío.
    await onSave({
      ...form,
      gallery: (form.gallery ?? []).filter(Boolean),
      thumbnail: form.thumbnail || "",
      role: form.role?.trim() ?? "",
      liveUrl: form.liveUrl?.trim() ?? "",
    })
  }

  function requestClose(force = false) {
    if (dirty && !force) { setAskDiscard(true); return }
    onClose()
  }

  const gallery6 = Array.from({ length: 6 }, (_, i) => form.gallery?.[i] ?? "")

  return (
    <Sheet
      open
      onOpenChange={(o) => { if (!o) requestClose() }}
      title={initial ? "Editar proyecto" : "Nuevo proyecto"}
      description="Los cambios se publican en el portafolio al guardar."
      footer={askDiscard ? (
        <div className="a-confirm" role="group" aria-label="Cambios sin guardar">
          <span className="a-confirm-q">¿Descartar los cambios?</span>
          <button type="button" className="a-btn a-btn--danger a-btn--sm" onClick={() => requestClose(true)}>Descartar</button>
          <button type="button" className="a-btn a-btn--ghost a-btn--sm" autoFocus onClick={() => setAskDiscard(false)}>Seguir editando</button>
        </div>
      ) : (
        <>
          <button type="button" className="a-btn a-btn--ghost" onClick={() => requestClose()}>Cancelar</button>
          <button type="button" className="a-btn a-btn--primary" onClick={submit} disabled={saving} aria-busy={saving || undefined}>
            {saving ? "Guardando…" : "Guardar proyecto"}
          </button>
        </>
      )}
    >
      {/* ── Información básica ── */}
      <h3 className="a-group-title">Información básica</h3>
      <Field label="Título" required error={errors.title}>
        {(p) => <input {...p} className="admin-input" value={form.title} placeholder="Ej: Amelia — centro de ayuda con IA"
          onChange={e => set("title", e.target.value)} onBlur={() => setErrors(x => ({ ...x, title: validate(form).title }))} />}
      </Field>
      <div className="a-row-3">
        <Field label="Categoría" required error={errors.category}>
          {(p) => <input {...p} className="admin-input" value={form.category} placeholder="Ej: Product Design"
            onChange={e => set("category", e.target.value)} />}
        </Field>
        <Field label="Año">
          {(p) => <input {...p} className="admin-input" type="number" inputMode="numeric" min={2000} max={2099} value={form.year}
            onChange={e => set("year", Number(e.target.value))} />}
        </Field>
        <Field label="Rol" hint="Aparece en el detalle del proyecto.">
          {(p) => <input {...p} className="admin-input" value={form.role ?? ""} placeholder="Lead Designer"
            onChange={e => set("role", e.target.value)} />}
        </Field>
      </div>
      <Field label="Descripción corta" hint="Una línea: se muestra en la card del portafolio.">
        {(p) => <input {...p} className="admin-input" value={form.desc} placeholder="Qué resolviste y para quién"
          onChange={e => set("desc", e.target.value)} />}
      </Field>
      <Field label="URL del proyecto publicado" error={errors.liveUrl} hint="Opcional. Si la dejas vacía, el detalle no muestra «Ver proyecto live».">
        {(p) => <input {...p} className="admin-input" type="url" inputMode="url" value={form.liveUrl ?? ""} placeholder="https://"
          onChange={e => set("liveUrl", e.target.value)} onBlur={() => setErrors(x => ({ ...x, liveUrl: validate(form).liveUrl }))} />}
      </Field>

      {/* ── Imágenes ── */}
      <h3 className="a-group-title">Imágenes</h3>
      <Dropzone label="Thumbnail de la card" hint="Fondo de la tarjeta en el portafolio. JPG, PNG o WebP · máx. 8 MB." aspect="16 / 10"
        value={form.thumbnail || undefined}
        onUpload={async file => set("thumbnail", await uploadFile(file))}
        onRemove={() => set("thumbnail", "")} />

      <div className="a-field">
        <div className="a-field-head">
          <span className="a-field-label" id="gallery-label">Galería de resultados</span>
          <span className="a-field-aside">{gallery6.filter(Boolean).length}/6</span>
        </div>
        <ul className="a-gallery" aria-labelledby="gallery-label">
          {gallery6.map((url, slot) => (
            <li key={slot} className="a-gallery-slot">
              <input ref={el => { galleryInputs.current[slot] = el }} type="file" accept="image/*" hidden onChange={e => onGallery(e, slot)} />
              {url ? (
                <>
                  <img src={url} alt="" loading="lazy" />
                  <button type="button" className="a-gallery-remove" onClick={() => removeSlot(slot)} aria-label={`Quitar imagen ${slot + 1} de 6`}>
                    <CloseIcon />
                  </button>
                  <span className="a-gallery-num" aria-hidden="true">{slot + 1}</span>
                </>
              ) : (
                <button type="button" className="a-gallery-add" onClick={() => galleryInputs.current[slot]?.click()}
                  disabled={uploadingSlot !== null} aria-label={`Subir imagen ${slot + 1} de 6`} aria-busy={uploadingSlot === slot || undefined}>
                  {uploadingSlot === slot ? <span className="admin-spinner" aria-hidden="true" /> : <><PlusIcon /><span>{slot + 1}</span></>}
                </button>
              )}
            </li>
          ))}
        </ul>
        {galleryError && <p className="a-field-error" role="alert">{galleryError}</p>}
        <p className="a-field-hint">Los espacios vacíos muestran un placeholder generado en el detalle.</p>
      </div>

      {/* ── Card en el portafolio ── */}
      <h3 className="a-group-title">Card en el portafolio</h3>
      <div className="a-row-2">
        <Field label="Stat de la card" hint="Cifra de impacto, ej. «+34% conversión».">
          {(p) => <input {...p} className="admin-input" value={form.stat} onChange={e => set("stat", e.target.value)} />}
        </Field>
        <Field label="Color de acento">
          {(p) => (
            <div className="a-color">
              <input type="color" value={form.accentColor} onChange={e => set("accentColor", e.target.value)} aria-label="Elegir color de acento" />
              <input {...p} className="admin-input" value={form.accentColor} onChange={e => set("accentColor", e.target.value)} />
            </div>
          )}
        </Field>
      </div>
      <Field label="Gradiente (modo oscuro)" hint="CSS linear-gradient. Fondo de la card cuando no hay thumbnail.">
        {(p) => <input {...p} className="admin-input admin-input--mono" value={form.gradient} onChange={e => set("gradient", e.target.value)} />}
      </Field>
      <Field label="Gradiente (modo claro)">
        {(p) => <input {...p} className="admin-input admin-input--mono" value={form.lightGradient} onChange={e => set("lightGradient", e.target.value)} />}
      </Field>
      <Field label="Etiquetas" hint="Enter o coma para agregar." aside={`${form.tags.length}/10`}>
        {(p) => <TagInput control={p} value={form.tags} onChange={t => set("tags", t)} />}
      </Field>

      {/* ── KPIs ── */}
      <h3 className="a-group-title">KPIs</h3>
      <div className="a-kpis">
        {form.kpis.map((kpi, i) => (
          <fieldset key={i} className="a-kpi">
            <legend className="sr-only">KPI {i + 1}</legend>
            <Field label={`Valor ${i + 1}`}>
              {(p) => <input {...p} className="admin-input" value={kpi.val} placeholder={["+34%", "12k", "4 meses"][i]} onChange={e => setKPI(i, "val", e.target.value)} />}
            </Field>
            <Field label={`Etiqueta ${i + 1}`} hint={i === 2 ? "«Duración» se muestra en el detalle." : undefined}>
              {(p) => <input {...p} className="admin-input" value={kpi.lbl} placeholder={["Conversión", "Usuarios", "Duración"][i]} onChange={e => setKPI(i, "lbl", e.target.value)} />}
            </Field>
          </fieldset>
        ))}
      </div>

      {/* ── Caso de estudio ── */}
      <h3 className="a-group-title">Caso de estudio</h3>
      {([
        ["intro", "Introducción / problema", "Describe el contexto y el desafío inicial…", 120],
        ["process", "Proceso", "Explica cómo abordaste el problema…", 120],
        ["result", "Resultado", "Describe el impacto y los resultados obtenidos…", 100],
      ] as const).map(([key, label, ph, h]) => (
        <Field key={key} label={label}>
          {(p, meta) => <RichTextArea variant="full" value={form[key]} minHeight={h} placeholder={ph}
            labelledBy={meta.labelId} describedBy={p["aria-describedby"]} onChange={v => set(key, v)} />}
        </Field>
      ))}

      <Field label="Emoji (opcional)" hint="Solo para la lista del admin; no se muestra en el sitio.">
        {(p) => <input {...p} className="admin-input" value={form.emoji} maxLength={4} onChange={e => set("emoji", e.target.value)} />}
      </Field>
    </Sheet>
  )
}
