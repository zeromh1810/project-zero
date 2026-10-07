"use client"

import { useState, useEffect, useId, type FormEvent } from "react"
import { useTheme } from "@/lib/context/theme-context"
import { useLogo } from "@/lib/hooks/use-logo"
import { ThemeToggle } from "@/components/portfolio/app-navbar"
import { ArrowLeftIcon } from "@/components/portfolio/icons"
import AdminDashboard from "./_components/admin-dashboard"

export default function AdminPage() {
  const { isDark } = useTheme()
  const logo = useLogo()
  const logoUrl = isDark ? (logo.darkUrl || logo.lightUrl) : (logo.lightUrl || logo.darkUrl)
  const [auth, setAuth] = useState(false)
  const [pass, setPass] = useState("")
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const id = useId()

  useEffect(() => {
    fetch("/api/admin/auth")
      .then(r => r.json())
      .then(d => { if (d.authenticated) setAuth(true) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // v2.1.0 — la clase .dark la aplica el ThemeProvider; acá había un segundo
  // effect que la volvía a escribir (y no tocaba .light).

  async function login(e: FormEvent) {
    e.preventDefault()
    if (!pass || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pass }),
      })
      if (res.ok) {
        setAuth(true)
        setError(false)
      } else {
        setError(true)
        setPass("")
      }
    } catch {
      setError(true)
      setPass("")
    } finally {
      setSubmitting(false)
    }
  }

  async function logout() {
    await fetch("/api/admin/auth", { method: "DELETE" }).catch(() => {})
    setAuth(false)
    setPass("")
  }

  if (loading) {
    return (
      <div className="admin-login-wrap">
        <div className="admin-login-card admin-login-card--status" role="status">
          <span className="admin-spinner" aria-hidden="true" /> Verificando sesión…
        </div>
      </div>
    )
  }

  /* ── LOGIN ──
     v2.1.0: <form> real (Enter nativo, gestores de contraseñas), label
     asociado, autocomplete="current-password", error anunciado y conectado
     al campo, logo real y el mismo toggle de tema del sitio. */
  if (!auth) {
    const inputId = `${id}-pass`
    const errorId = `${id}-error`
    return (
      <div className="admin-login-wrap">
        <div className="admin-login-theme"><ThemeToggle /></div>
        <form className="admin-login-card" onSubmit={login} noValidate>
          <h1 className="admin-login-logo">
            {logoUrl
              ? <img src={logoUrl} alt={logo.fallbackText || "Project Zero"} className="admin-login-logo-img" />
              : <><span className="admin-login-dot" aria-hidden="true" />{logo.fallbackText || "Project Zero"}</>}
          </h1>
          <p className="admin-login-sub">Panel de administración</p>

          <div className="admin-login-field">
            <label className="admin-login-label" htmlFor={inputId}>Contraseña</label>
            <div className="admin-login-input-wrap">
              <input
                id={inputId}
                name="password"
                className={`admin-login-input${error ? " is-invalid" : ""}`}
                type={showPass ? "text" : "password"}
                autoComplete="current-password"
                value={pass}
                autoFocus
                required
                aria-invalid={error || undefined}
                aria-describedby={error ? errorId : undefined}
                onChange={e => { setPass(e.target.value); setError(false) }}
              />
              <button
                type="button"
                className="admin-login-reveal"
                onClick={() => setShowPass(v => !v)}
                aria-pressed={showPass}
                aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPass ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>

          {error && (
            <p id={errorId} className="admin-login-error" role="alert">
              Contraseña incorrecta. Inténtalo de nuevo.
            </p>
          )}

          <button type="submit" className="a-btn a-btn--primary admin-login-submit" disabled={!pass || submitting} aria-busy={submitting || undefined}>
            {submitting ? <><span className="admin-spinner admin-spinner--on-accent" aria-hidden="true" /> Entrando…</> : "Entrar"}
          </button>

          <a href="/" className="admin-login-back link-underline">
            <ArrowLeftIcon className="btn-arrow-back" /> Volver al portafolio
          </a>
        </form>
      </div>
    )
  }

  /* ── DASHBOARD ── */
  return <AdminDashboard onLogout={logout} />
}
