"use client"

import { useState, useEffect } from "react"
import { useTheme } from "@/lib/context/theme-context"
import { useLogo } from "@/lib/hooks/use-logo"
import dynamic from "next/dynamic"

const ProjectsTab = dynamic(() => import("./_components/projects-tab"), { ssr: false })
const HeroTab     = dynamic(() => import("./_components/hero-tab"),     { ssr: false })
const AboutTab    = dynamic(() => import("./_components/about-tab"),    { ssr: false })
const CVTab       = dynamic(() => import("./_components/cv-tab"),       { ssr: false })
const LogoTab     = dynamic(() => import("./_components/logo-tab"),     { ssr: false })

type Tab = "proyectos" | "hero" | "sobre" | "cv" | "logo"
type ToastState = { msg: string; type: "ok" | "err" } | null

const TABS: { id: Tab; label: string }[] = [
  { id: "proyectos", label: "Proyectos" },
  { id: "hero",      label: "Hero" },
  { id: "sobre",     label: "Sobre mí" },
  { id: "cv",        label: "CV" },
  { id: "logo",      label: "Logo" },
]

export default function AdminPage() {
  const { isDark, toggleTheme } = useTheme()
  const logo = useLogo()
  const adminLogoUrl = isDark
    ? (logo.darkUrl || logo.lightUrl)
    : (logo.lightUrl || logo.darkUrl)
  const [auth, setAuth] = useState(false)
  const [pass, setPass] = useState("")
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tab, setTab]   = useState<Tab>("proyectos")
  const [toast, setToast] = useState<ToastState>(null)

  useEffect(() => {
    fetch("/api/admin/auth")
      .then(r => r.json())
      .then(d => { if (d.authenticated) setAuth(true) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (isDark) document.documentElement.classList.add("dark")
    else document.documentElement.classList.remove("dark")
  }, [isDark])

  function showToast(msg: string, type: "ok" | "err") {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function login() {
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
        <div className="admin-login-card" style={{ textAlign: "center", color: "var(--txt3)" }}>
          Verificando sesión…
        </div>
      </div>
    )
  }

  /* ── LOGIN ── */
  if (!auth) {
    return (
      <div className="admin-login-wrap">
        <div className="admin-login-card">
          <div className="admin-login-logo">
            <span className="admin-login-dot" />
            A·Studio
          </div>
          <div className="admin-login-sub">Panel de administración</div>

          <div className="admin-login-field">
            <label className="admin-login-label">Contraseña</label>
            <input
              className="admin-login-input"
              type="password"
              value={pass}
              autoFocus
              onChange={e => { setPass(e.target.value); setError(false) }}
              onKeyDown={e => e.key === "Enter" && login()}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="admin-login-error">Contraseña incorrecta</div>
          )}

          <button className="btn-p" style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
            onClick={login}>
            Entrar
          </button>

          <a href="/" style={{
            display: "block", marginTop: 16, fontSize: 13,
            color: "var(--txt3)", textDecoration: "none", textAlign: "center"
          }}>
            ← Volver al portafolio
          </a>
        </div>
      </div>
    )
  }

  /* ── DASHBOARD ── */
  return (
    <div className="admin-wrapper">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-logo">
          {adminLogoUrl ? (
            <img src={adminLogoUrl} alt={logo.fallbackText || "Logo"} className="nav-logo-img" />
          ) : (
            <>
              <span className="nav-logo-dot" />
              {logo.fallbackText || "A·Studio"}
            </>
          )}
          <span className="admin-nav-badge">Admin</span>
        </div>

        <div className="nav-right">
          <button className="theme-btn" onClick={toggleTheme}
            style={{
              "--knob-position": isDark ? "18px" : "2px",
              "--knob-color": isDark ? "#f5f5f7" : "#1d1d1f",
            } as React.CSSProperties}
            aria-label="Toggle tema"
          />
          <a href="/" target="_blank" rel="noreferrer"
            className="btn-profile" style={{ textDecoration: "none" }}>
            <span className="admin-nav-portfolio-label">Ver portafolio</span>
            <span>↗</span>
          </a>
          <button className="btn-profile" onClick={logout}>
            Salir
          </button>
        </div>
      </nav>

      {/* Tab bar */}
      <div className="admin-tabbar">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`admin-tab${tab === t.id ? " active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="admin-container">
        {tab === "proyectos" && <ProjectsTab onToast={showToast} />}
        {tab === "hero"      && <HeroTab     onToast={showToast} />}
        {tab === "sobre"     && <AboutTab    onToast={showToast} />}
        {tab === "cv"        && <CVTab       onToast={showToast} />}
        {tab === "logo"      && <LogoTab     onToast={showToast} />}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`admin-toast ${toast.type}`}>
          {toast.type === "ok" ? "✓" : "✕"} {toast.msg}
        </div>
      )}
    </div>
  )
}
