"use client"

import { useState, useEffect } from "react"
import type { ToastType } from "./admin-toast"
import { invalidateSocial } from "@/lib/hooks/use-social"
import { invalidateFooter } from "@/lib/hooks/use-footer"

interface Props {
  onToast: (title: string, type: ToastType, msg?: string) => void
}

interface SocialForm {
  linkedin:  string
  instagram: string
  github:    string
  email:     string
}

interface FooterForm {
  brand:   string
  tagline: string
  copy:    string
}

const SOCIAL_EMPTY: SocialForm = { linkedin: "", instagram: "", github: "", email: "" }
const FOOTER_EMPTY: FooterForm = {
  brand:   "Project Zero",
  tagline: "Product Designer & Frontend Developer · Santiago",
  copy:    "© 2026 Carlos Felipe Rojas Hickmann",
}

const SOCIAL_FIELDS: { key: keyof SocialForm; label: string; placeholder: string; prefix: string }[] = [
  { key: "linkedin",  label: "LinkedIn",  placeholder: "https://linkedin.com/in/tu-perfil", prefix: "in" },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/tu-usuario",  prefix: "IG" },
  { key: "github",    label: "GitHub",    placeholder: "https://github.com/tu-usuario",     prefix: "GH" },
  { key: "email",     label: "Email",     placeholder: "tu@email.com",                      prefix: "✉"  },
]

export default function SocialTab({ onToast }: Props) {
  const [social, setSocial]         = useState<SocialForm>(SOCIAL_EMPTY)
  const [savedSocial, setSavedSocial] = useState<SocialForm>(SOCIAL_EMPTY)
  const [savingSocial, setSavingSocial] = useState(false)
  const [loadingSocial, setLoadingSocial] = useState(true)

  const [footer, setFooter]         = useState<FooterForm>(FOOTER_EMPTY)
  const [savedFooter, setSavedFooter] = useState<FooterForm>(FOOTER_EMPTY)
  const [savingFooter, setSavingFooter] = useState(false)
  const [loadingFooter, setLoadingFooter] = useState(true)

  const hasSocialChanges = JSON.stringify(social) !== JSON.stringify(savedSocial)
  const hasFooterChanges = JSON.stringify(footer) !== JSON.stringify(savedFooter)

  useEffect(() => {
    setLoadingSocial(true)
    fetch("/api/admin/social", { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        const loaded = { ...SOCIAL_EMPTY, ...d }
        setSocial(loaded)
        setSavedSocial(loaded)
      })
      .catch(() => onToast("Error cargando redes sociales", "error"))
      .finally(() => setLoadingSocial(false))
  }, [])

  useEffect(() => {
    setLoadingFooter(true)
    fetch("/api/admin/footer", { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        const loaded = { ...FOOTER_EMPTY, ...d }
        setFooter(loaded)
        setSavedFooter(loaded)
      })
      .catch(() => onToast("Error cargando footer", "error"))
      .finally(() => setLoadingFooter(false))
  }, [])

  async function handleSaveSocial() {
    setSavingSocial(true)
    try {
      const res = await fetch("/api/admin/social", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(social),
      })
      if (!res.ok) throw new Error()
      setSavedSocial({ ...social })
      invalidateSocial()
      onToast("Redes sociales guardadas", "success")
    } catch {
      onToast("Error al guardar", "error")
    } finally {
      setSavingSocial(false)
    }
  }

  async function handleSaveFooter() {
    setSavingFooter(true)
    try {
      const res = await fetch("/api/admin/footer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(footer),
      })
      if (!res.ok) throw new Error()
      setSavedFooter({ ...footer })
      invalidateFooter()
      onToast("Footer guardado", "success")
    } catch {
      onToast("Error al guardar", "error")
    } finally {
      setSavingFooter(false)
    }
  }

  if (loadingSocial || loadingFooter) {
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
          <div className="admin-section-title">Footer</div>
          <div className="admin-section-sub">
            Contenido del pie de página y redes sociales
          </div>
        </div>
      </div>

      {/* Footer text content */}
      <div className="admin-card">
        <div className="admin-card-title">Contenido del footer</div>

        <div className="admin-field">
          <label className="admin-label">Nombre / Marca</label>
          <input
            className="admin-input"
            type="text"
            value={footer.brand}
            onChange={e => setFooter(prev => ({ ...prev, brand: e.target.value }))}
            placeholder="Project Zero"
          />
        </div>

        <div className="admin-field">
          <label className="admin-label">Tagline</label>
          <input
            className="admin-input"
            type="text"
            value={footer.tagline}
            onChange={e => setFooter(prev => ({ ...prev, tagline: e.target.value }))}
            placeholder="Product Designer & Frontend Developer · Santiago"
          />
        </div>

        <div className="admin-field" style={{ marginBottom: 0 }}>
          <label className="admin-label">Copyright</label>
          <input
            className="admin-input"
            type="text"
            value={footer.copy}
            onChange={e => setFooter(prev => ({ ...prev, copy: e.target.value }))}
            placeholder="© 2026 Carlos Felipe Rojas Hickmann"
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
          <button
            className="btn-p"
            onClick={handleSaveFooter}
            disabled={savingFooter || !hasFooterChanges}
          >
            {savingFooter ? "Guardando…" : hasFooterChanges ? "Guardar footer" : "Sin cambios"}
          </button>
        </div>
      </div>

      {/* Social links */}
      <div className="admin-card">
        <div className="admin-card-title">Redes sociales</div>
        {SOCIAL_FIELDS.map(({ key, label, placeholder, prefix }) => (
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
                value={social[key]}
                onChange={e => setSocial(prev => ({ ...prev, [key]: e.target.value }))}
                placeholder={placeholder}
                style={{ paddingLeft: 36 }}
              />
            </div>
            {social[key] && (
              <div className="admin-input-hint" style={{ marginTop: 4 }}>
                <a href={key === "email" ? `mailto:${social[key]}` : social[key]}
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
          Deja en blanco los campos que no quieras mostrar.
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
          <button
            className="btn-p"
            onClick={handleSaveSocial}
            disabled={savingSocial || !hasSocialChanges}
          >
            {savingSocial ? "Guardando…" : hasSocialChanges ? "Guardar redes" : "Sin cambios"}
          </button>
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
            {footer.brand || "Project Zero"}
          </span>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "var(--txt3)", marginBottom: 2 }}>
              {footer.tagline || "Product Designer & Frontend Developer · Santiago"}
            </div>
            <div style={{ fontSize: 11, color: "var(--txt3)" }}>
              {footer.copy || "© 2026 Carlos Felipe Rojas Hickmann"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            {[
              { key: "linkedin" as const, label: "in" },
              { key: "instagram" as const, label: "IG" },
              { key: "github" as const, label: "GH" },
            ].filter(({ key }) => social[key]).map(({ key, label }) => (
              <div key={key} style={{
                width: 28, height: 28, borderRadius: "50%",
                border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 700, color: "var(--txt3)",
              }}>
                {label}
              </div>
            ))}
            {!social.linkedin && !social.instagram && !social.github && (
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
