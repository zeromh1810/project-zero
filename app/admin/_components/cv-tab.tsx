"use client"

import { useState, useEffect } from "react"

interface CVData {
  link: string
  title: string
  subtitle: string
  updatedAt: string
}

const DEFAULT: CVData = {
  link: "",
  title: "Curriculum Vitae",
  subtitle: "Diseñador de Producto & Frontend Developer",
  updatedAt: "Enero 2025",
}

import type { ToastType } from "./admin-toast"

interface Props {
  onToast: (title: string, type: ToastType, msg?: string) => void
}

export default function CVTab({ onToast }: Props) {
  const [data, setData] = useState<CVData>(DEFAULT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/admin/cv", { cache: "no-store" })
      .then(r => r.json())
      .then(d => setData({ ...DEFAULT, ...d }))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function set(field: keyof CVData, value: string) {
    setData(prev => ({ ...prev, [field]: value }))
  }

  async function save() {
    setSaving(true)
    try {
      await fetch("/api/admin/cv", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      onToast("CV actualizado", "success")
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
          <div className="admin-section-title">CV</div>
          <div className="admin-section-sub">Enlace y metadatos del currículum</div>
        </div>
        <button className="btn-p" onClick={save} disabled={saving}>
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>

      <div className="admin-card">
        <div className="admin-card-title">Enlace al CV</div>
        <div className="admin-field">
          <label className="admin-label">URL del PDF</label>
          <input
            className="admin-input"
            type="url"
            value={data.link}
            onChange={e => set("link", e.target.value)}
            placeholder="https://drive.google.com/file/d/... o /cv.pdf"
          />
          <div className="admin-input-hint">
            Puede ser un enlace a Google Drive, Dropbox, o una URL directa al PDF.
            Si el archivo está en la carpeta <code>/public</code>, escribe <code>/nombre.pdf</code>
          </div>
        </div>

        {data.link && (
          <a href={data.link} target="_blank" rel="noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 13, color: "var(--accent)", textDecoration: "none",
              marginTop: 4
            }}>
            Abrir enlace actual →
          </a>
        )}
      </div>

      <div className="admin-card">
        <div className="admin-card-title">Metadatos</div>
        <div className="admin-field">
          <label className="admin-label">Título</label>
          <input className="admin-input" value={data.title}
            onChange={e => set("title", e.target.value)} placeholder="Curriculum Vitae" />
        </div>
        <div className="admin-field">
          <label className="admin-label">Subtítulo / Rol</label>
          <input className="admin-input" value={data.subtitle}
            onChange={e => set("subtitle", e.target.value)}
            placeholder="Diseñador de Producto & Frontend Developer" />
        </div>
        <div className="admin-field">
          <label className="admin-label">Fecha de actualización</label>
          <input className="admin-input" value={data.updatedAt}
            onChange={e => set("updatedAt", e.target.value)} placeholder="Enero 2025" />
        </div>

        {/* Preview */}
        <div style={{
          marginTop: 16, padding: "20px 24px", borderRadius: 14,
          background: "var(--bg3)", border: "1px solid var(--border)", textAlign: "center"
        }}>
          <div className="s-label" style={{ marginBottom: 10 }}>Vista previa</div>
          <div style={{ fontSize: 36, marginBottom: 10 }}>📄</div>
          <div style={{
            fontFamily: "var(--portfolio-heading-font)", fontSize: 16,
            fontWeight: 700, color: "var(--txt)", marginBottom: 4
          }}>
            {data.title}
          </div>
          <div style={{ fontSize: 13, color: "var(--txt2)", marginBottom: 16, lineHeight: 1.5 }}>
            {data.subtitle}<br />
            <span style={{ opacity: 0.7 }}>Actualizado · {data.updatedAt}</span>
          </div>
          <div style={{
            display: "inline-block", padding: "8px 20px", borderRadius: 980,
            background: "var(--accent)", color: "white", fontSize: 13, fontWeight: 500
          }}>
            {data.link ? "Abrir PDF ↗" : "Descargar PDF ↓"}
          </div>
        </div>
      </div>
    </>
  )
}
