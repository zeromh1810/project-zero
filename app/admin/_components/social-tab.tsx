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

        {/* Replica fiel del .footer real */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "40px 32px 36px",
          background: "var(--bg3)",
          borderRadius: 16,
          borderTop: "1px solid var(--border)",
          boxShadow: "inset 0 1px 0 var(--border)",
          overflow: "hidden",
        }}>
          {/* ✦ mark */}
          <div style={{
            fontSize: 18,
            color: "var(--accent)",
            opacity: 0.8,
            marginBottom: 16,
          }}>
            ✦
          </div>

          {/* Brand */}
          <div style={{
            fontFamily: "var(--portfolio-heading-font)",
            fontSize: 22,
            fontWeight: 700,
            color: "var(--txt)",
            letterSpacing: "-0.03em",
            marginBottom: 8,
          }}>
            {footer.brand || "Project Zero"}
          </div>

          {/* Tagline */}
          <div style={{
            fontSize: 13,
            color: "var(--txt3)",
            textAlign: "center",
            lineHeight: 1.5,
            marginBottom: 28,
          }}>
            {footer.tagline || "Product Designer & Frontend Developer · Santiago"}
          </div>

          {/* Social icons */}
          {(social.linkedin || social.instagram || social.github) ? (
            <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
              {social.linkedin && (
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 40, height: 40, borderRadius: "9999px",
                  border: "1px solid var(--border)", color: "var(--txt3)",
                }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </div>
              )}
              {social.instagram && (
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 40, height: 40, borderRadius: "9999px",
                  border: "1px solid var(--border)", color: "var(--txt3)",
                }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </div>
              )}
              {social.github && (
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 40, height: 40, borderRadius: "9999px",
                  border: "1px solid var(--border)", color: "var(--txt3)",
                }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
                  </svg>
                </div>
              )}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: "var(--txt3)", fontStyle: "italic", marginBottom: 28 }}>
              Sin redes configuradas
            </div>
          )}

          {/* Copyright */}
          <div style={{ fontSize: 12, color: "var(--txt3)", opacity: 0.7 }}>
            {footer.copy || "© 2026 Carlos Felipe Rojas Hickmann"}
          </div>
        </div>
      </div>
    </>
  )
}
