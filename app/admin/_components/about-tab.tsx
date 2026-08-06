"use client"

import { useState, useEffect, useRef, KeyboardEvent } from "react"
import type { ToastType } from "./admin-toast"
import { type AboutData, type Stat } from "@/lib/types/about"
import RichTextArea from "./rich-text-area"

const DEFAULT: AboutData = {
  bio1: "Soy <strong>diseñador de producto y desarrollador frontend</strong> con base en Santiago, Chile.",
  bio2: "Mi proceso combina investigación profunda con ejecución meticulosa.",
  skills: ["Figma", "Prototyping", "User Research", "Design Systems", "React", "TypeScript"],
  stats: [
    { value: "5+", label: "Años exp." },
    { value: "40+", label: "Proyectos" },
    { value: "18", label: "Clientes" },
  ],
  badge: "Disponible para freelance",
  available: true,
  cvUrl: "",
  photoUrl: "",
}

interface Props {
  onToast: (title: string, type: ToastType, msg?: string) => void
}

export default function AboutTab({ onToast }: Props) {
  const [data,           setData]          = useState<AboutData>(DEFAULT)
  const [loading,        setLoading]        = useState(true)
  const [saving,         setSaving]         = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [localPreview,   setLocalPreview]   = useState("")
  const [skillInput,     setSkillInput]     = useState("")
  const skillRef  = useRef<HTMLInputElement>(null)
  const photoRef  = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let ignore = false
    fetch("/api/admin/about", { cache: "no-store" })
      .then(r => r.json())
      .then(d => { if (!ignore) setData({ ...DEFAULT, ...d }) })
      .catch(() => {})
      .finally(() => { if (!ignore) setLoading(false) })
    return () => { ignore = true }
  }, [])

  function set<K extends keyof AboutData>(field: K, value: AboutData[K]) {
    setData(prev => ({ ...prev, [field]: value }))
  }

  function setStat(i: number, field: keyof Stat, value: string) {
    const stats = [...data.stats]
    stats[i] = { ...stats[i], [field]: value }
    set("stats", stats)
  }

  function addSkill() {
    const s = skillInput.trim()
    if (s && !data.skills.includes(s)) set("skills", [...data.skills, s])
    setSkillInput("")
  }

  function removeSkill(skill: string) {
    set("skills", data.skills.filter(s => s !== skill))
  }

  function onSkillKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addSkill() }
    if (e.key === "Backspace" && !skillInput && data.skills.length) {
      set("skills", data.skills.slice(0, -1))
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Immediate local preview before the upload completes
    const objectUrl = URL.createObjectURL(file)
    setLocalPreview(objectUrl)
    setUploadingPhoto(true)

    try {
      const fd = new FormData()
      fd.append("file", file)
      const res  = await fetch("/api/admin/upload", { method: "POST", body: fd })
      const json = await res.json()
      if (json.url) {
        set("photoUrl", json.url)
      } else {
        onToast("Error al subir imagen", "error", json.error)
      }
    } catch {
      onToast("Error al subir imagen", "error")
    } finally {
      URL.revokeObjectURL(objectUrl)
      setLocalPreview("")
      setUploadingPhoto(false)
      e.target.value = ""
    }
  }

  async function save() {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      const saved = await res.json()
      saved._githubWarning
        ? onToast("Sección guardada localmente", "warning", "No se pudo sincronizar con GitHub. Los cambios se perderán en el próximo deploy.")
        : onToast("Sección actualizada", "success")
    } catch {
      onToast("Error al guardar", "error")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" /> Cargando…
      </div>
    )
  }

  return (
    <>
      <div className="admin-section-header">
        <div>
          <div className="admin-section-title">Sobre mí</div>
          <div className="admin-section-sub">Biografía, foto, habilidades y estadísticas</div>
        </div>
        <button className="btn-p" onClick={save} disabled={saving}>
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>

      {/* Foto de perfil */}
      <div className="admin-card">
        <div className="admin-card-title">Foto de perfil</div>

        {(localPreview || data.photoUrl) && (
          <div className="about-admin-photo-preview">
            <img src={localPreview || data.photoUrl} alt="Foto de perfil" loading="lazy" />
          </div>
        )}

        <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: (localPreview || data.photoUrl) ? 14 : 0 }}>
          <input
            ref={photoRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: "none" }}
            onChange={handlePhotoUpload}
          />
          <button
            className="btn-g"
            onClick={() => photoRef.current?.click()}
            disabled={uploadingPhoto}
            style={{ fontSize: 13 }}
          >
            {uploadingPhoto
              ? "Subiendo…"
              : data.photoUrl
              ? "Cambiar foto"
              : "Subir foto"}
          </button>

          {data.photoUrl && !uploadingPhoto && (
            <button
              className="btn-profile"
              onClick={() => set("photoUrl", "")}
              style={{ color: "var(--error)", borderColor: "var(--error)" }}
            >
              Quitar foto
            </button>
          )}
        </div>

        <div className="admin-input-hint" style={{ marginTop: 8 }}>
          JPG, PNG o WebP · máx. 8 MB · Recomendado: formato retrato (3:4), mínimo 600×800 px
        </div>
      </div>

      {/* Bio */}
      <div className="admin-card">
        <div className="admin-card-title">Biografía</div>
        <div className="admin-field">
          <label className="admin-label">Párrafo 1</label>
          <RichTextArea value={data.bio1} onChange={v => set("bio1", v)} minHeight={88} />
        </div>
        <div className="admin-field">
          <label className="admin-label">Párrafo 2</label>
          <RichTextArea value={data.bio2} onChange={v => set("bio2", v)} minHeight={88} />
        </div>
      </div>

      {/* Stats */}
      <div className="admin-card">
        <div className="admin-card-title">Estadísticas</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
          <span className="admin-kpi-col-label" style={{ flex: 1, fontSize: 10 }}>Número</span>
          <span className="admin-kpi-col-label" style={{ flex: 2, fontSize: 10 }}>Etiqueta</span>
        </div>
        <div className="admin-stats-grid">
          {data.stats.map((stat, i) => (
            <div key={i} style={{ display: "flex", gap: 8 }}>
              <input className="admin-input" style={{ flex: 1 }} value={stat.value}
                onChange={e => setStat(i, "value", e.target.value)} placeholder="5+" />
              <input className="admin-input" style={{ flex: 2 }} value={stat.label}
                onChange={e => setStat(i, "label", e.target.value)} placeholder="Años exp." />
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="admin-card">
        <div className="admin-card-title">Stack & Herramientas</div>
        <div className="admin-field">
          <div className="admin-chips-wrap" onClick={() => skillRef.current?.focus()}>
            {data.skills.map(skill => (
              <span key={skill} className="admin-chip">
                {skill}
                <button className="admin-chip-x" onClick={() => removeSkill(skill)}>✕</button>
              </span>
            ))}
            <input
              ref={skillRef}
              className="admin-chip-input"
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={onSkillKey}
              onBlur={addSkill}
              placeholder={data.skills.length === 0 ? "Escribe una habilidad y presiona Enter" : ""}
            />
          </div>
          <div className="admin-input-hint">Presiona Enter o coma para agregar</div>
        </div>
      </div>

      {/* CV */}
      <div className="admin-card" style={{ marginBottom: 16 }}>
        <div className="admin-card-title">Currículum (CV)</div>
        <div className="admin-field" style={{ marginBottom: 0 }}>
          <label className="admin-label">Link al archivo PDF del CV</label>
          <input
            className="admin-input"
            value={data.cvUrl}
            onChange={e => set("cvUrl", e.target.value)}
            placeholder="https://drive.google.com/... o /cv.pdf"
            type="url"
          />
          <div className="admin-input-hint">
            El botón &quot;Ver CV&quot; en la sección Sobre mí abrirá este link en una nueva pestaña.
          </div>
        </div>
        {data.cvUrl && (
          <a
            href={data.cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-block", marginTop: 10, fontSize: 13, color: "var(--accent)" }}
          >
            Previsualizar → {data.cvUrl}
          </a>
        )}
      </div>

      {/* Badge */}
      <div className="admin-card">
        <div className="admin-card-title">Badge de disponibilidad</div>
        <div className="admin-field">
          <label className="admin-label">Texto del badge</label>
          <input className="admin-input" value={data.badge}
            onChange={e => set("badge", e.target.value)} placeholder="Disponible para freelance" />
        </div>
        <div className="admin-toggle-row">
          <label className="admin-toggle">
            <input type="checkbox" checked={data.available}
              onChange={e => set("available", e.target.checked)} />
            <div className="admin-toggle-track" />
          </label>
          <span className="admin-toggle-label">
            {data.available ? "Disponible" : "No disponible"} — controla el punto verde pulsante
          </span>
        </div>
      </div>
    </>
  )
}
