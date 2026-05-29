"use client"

import { useState, useEffect } from "react"

interface HeroData {
  titleLine1: string
  titleLine2: string
  titleLine3: string
  subtitle: string
}

const DEFAULT: HeroData = {
  titleLine1: "Diseño",
  titleLine2: "experiencias",
  titleLine3: "digitales.",
  subtitle: "Product Designer & Frontend Developer. Cinco años creando productos que equilibran estética refinada con funcionalidad real.",
}

interface Props {
  onToast: (msg: string, type: "ok" | "err") => void
}

export default function HeroTab({ onToast }: Props) {
  const [data, setData] = useState<HeroData>(DEFAULT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/admin/hero", { cache: "no-store" })
      .then(r => r.json())
      .then(d => setData({ ...DEFAULT, ...d }))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function set(field: keyof HeroData, value: string) {
    setData(prev => ({ ...prev, [field]: value }))
  }

  async function save() {
    setSaving(true)
    try {
      await fetch("/api/admin/hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      onToast("Hero actualizado", "ok")
    } catch {
      onToast("Error al guardar", "err")
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
          <div className="admin-section-title">Hero</div>
          <div className="admin-section-sub">Título principal y subtítulo de la portada</div>
        </div>
        <button className="btn-p" onClick={save} disabled={saving}>
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>

      <div className="admin-card">
        <div className="admin-card-title">Título principal</div>

        <div className="admin-field">
          <label className="admin-label">Línea 1</label>
          <input className="admin-input" value={data.titleLine1}
            onChange={e => set("titleLine1", e.target.value)} placeholder="Diseño" />
        </div>
        <div className="admin-field">
          <label className="admin-label">Línea 2 — énfasis (color acento)</label>
          <input className="admin-input" value={data.titleLine2}
            onChange={e => set("titleLine2", e.target.value)} placeholder="experiencias" />
        </div>
        <div className="admin-field">
          <label className="admin-label">Línea 3</label>
          <input className="admin-input" value={data.titleLine3}
            onChange={e => set("titleLine3", e.target.value)} placeholder="digitales." />
        </div>

        {/* Preview */}
        <div style={{
          marginTop: 20, padding: "20px 24px", borderRadius: 14,
          background: "var(--bg3)", border: "1px solid var(--border)"
        }}>
          <div className="s-label" style={{ marginBottom: 8 }}>Vista previa</div>
          <div style={{
            fontFamily: "var(--portfolio-heading-font)",
            fontSize: 32, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1, color: "var(--txt)"
          }}>
            {data.titleLine1}<br />
            <em style={{ fontStyle: "normal", color: "var(--accent)" }}>{data.titleLine2}</em><br />
            {data.titleLine3}
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-title">Subtítulo</div>
        <div className="admin-field">
          <label className="admin-label">Texto descriptivo</label>
          <textarea className="admin-textarea" value={data.subtitle}
            onChange={e => set("subtitle", e.target.value)}
            placeholder="Descripción breve que acompaña el título…" />
        </div>
      </div>
    </>
  )
}
