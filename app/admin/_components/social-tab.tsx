"use client"

import { useState, useEffect } from "react"
import type { ToastType } from "./admin-toast"
import { invalidateSocial } from "@/lib/hooks/use-social"

interface Props {
  onToast: (title: string, type: ToastType, msg?: string) => void
}

interface SocialForm {
  linkedin:  string
  instagram: string
  github:    string
  email:     string
}

const EMPTY: SocialForm = { linkedin: "", instagram: "", github: "", email: "" }

const FIELDS: { key: keyof SocialForm; label: string; placeholder: string; prefix: string }[] = [
  {
    key: "linkedin",
    label: "LinkedIn",
    placeholder: "https://linkedin.com/in/tu-perfil",
    prefix: "in",
  },
  {
    key: "instagram",
    label: "Instagram",
    placeholder: "https://instagram.com/tu-usuario",
    prefix: "IG",
  },
  {
    key: "github",
    label: "GitHub",
    placeholder: "https://github.com/tu-usuario",
    prefix: "GH",
  },
  {
    key: "email",
    label: "Email",
    placeholder: "tu@email.com",
    prefix: "✉",
  },
]

export default function SocialTab({ onToast }: Props) {
  const [form, setForm]     = useState<SocialForm>(EMPTY)
  const [saved, setSaved]   = useState<SocialForm>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const hasChanges = JSON.stringify(form) !== JSON.stringify(saved)

  useEffect(() => {
    setLoading(true)
    fetch("/api/admin/social", { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        const loaded = { ...EMPTY, ...d }
        setForm(loaded)
        setSaved(loaded)
      })
      .catch(() => onToast("Error cargando redes sociales", "error"))
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/social", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setSaved({ ...form })
      invalidateSocial()
      onToast("Redes sociales guardadas", "success")
    } catch {
      onToast("Error al guardar", "error")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: "48px 0", display: "flex", justifyContent: "center", alignItems: "center", gap: 10, color: "var(--txt3)", fontSize: 14 }}>
        <div className="admin-spinner" />
        Cargando…
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <div className="admin-section-header">
        <div>
          <div className="admin-section-title">Redes sociales</div>
          <div className="admin-section-sub">
            URLs que aparecen en el footer y en la sección Sobre mí
          </div>
        </div>
        <button
          className="btn-p"
          onClick={handleSave}
          disabled={saving || !hasChanges}
        >
          {saving ? "Guardando…" : hasChanges ? "Guardar cambios" : "Sin cambios"}
        </button>
      </div>

      {/* Fields */}
      <div className="admin-card">
        {FIELDS.map(({ key, label, placeholder, prefix }) => (
          <div key={key} className="admin-field">
            <label className="admin-label">{label}</label>
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                fontSize: 11, fontWeight: 700, color: "var(--txt3)",
                letterSpacing: "0.04em", pointerEvents: "none", userSelect: "none",
              }}>
                {prefix}
              </span>
              <input
                className="admin-input"
                type={key === "email" ? "email" : "url"}
                value={form[key]}
                onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                placeholder={placeholder}
                style={{ paddingLeft: 36 }}
              />
            </div>
            {form[key] && (
              <div className="admin-input-hint" style={{ marginTop: 4 }}>
                <a href={key === "email" ? `mailto:${form[key]}` : form[key]}
                  target={key === "email" ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  style={{ color: "var(--accent)", textDecoration: "none", fontSize: 12 }}>
                  Verificar enlace ↗
                </a>
              </div>
            )}
          </div>
        ))}
        <div className="admin-input-hint" style={{ marginTop: 4 }}>
          Deja en blanco los campos que no quieras mostrar. Los íconos solo aparecen cuando hay URL.
        </div>
      </div>

      {/* Preview */}
      <div className="admin-card">
        <div className="admin-card-title">Vista previa — Footer</div>
        <div style={{
          padding: "16px 24px",
          background: "var(--bg3)",
          borderRadius: 10,
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: 16,
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--txt2)", fontFamily: "var(--portfolio-heading-font)" }}>
            A·Studio
          </span>
          <span style={{ fontSize: 12, color: "var(--txt3)", textAlign: "center" }}>
            © 2026 A·Studio
          </span>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            {[
              { key: "linkedin" as const, label: "in" },
              { key: "instagram" as const, label: "IG" },
              { key: "github" as const, label: "GH" },
            ].filter(({ key }) => form[key]).map(({ key, label }) => (
              <div key={key} style={{
                width: 28, height: 28, borderRadius: "50%",
                border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 700, color: "var(--txt3)",
              }}>
                {label}
              </div>
            ))}
            {!form.linkedin && !form.instagram && !form.github && (
              <span style={{ fontSize: 12, color: "var(--txt3)", fontStyle: "italic" }}>
                Sin redes configuradas
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
