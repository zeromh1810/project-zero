"use client"

import { useState, useEffect, useRef } from "react"
import { useTheme } from "@/lib/context/theme-context"
import { useLogo } from "@/lib/hooks/use-logo"
import dynamic from "next/dynamic"
import AdminToast, { type ToastType } from "./_components/admin-toast"

const ProjectsTab       = dynamic(() => import("./_components/projects-tab"), { ssr: false })
const HeroTab           = dynamic(() => import("./_components/hero-tab"),     { ssr: false })
const AboutTab          = dynamic(() => import("./_components/about-tab"),    { ssr: false })
const CVTab             = dynamic(() => import("./_components/cv-tab"),       { ssr: false })
const LogoTab           = dynamic(() => import("./_components/logo-tab"),     { ssr: false })
const SocialTab         = dynamic(() => import("./_components/social-tab"),   { ssr: false })
const BrandsTab         = dynamic(() => import("./_components/brands-tab"),   { ssr: false })
const BlogTab           = dynamic(() => import("./_components/blog-tab"),     { ssr: false })
const DesignSystemSection = dynamic(
  () => import("@/components/portfolio/sections/design-system-section").then(m => ({ default: m.DesignSystemSection })),
  { ssr: false }
)

type Tab = "proyectos" | "hero" | "sobre" | "cv" | "logo" | "footer" | "marcas" | "blog" | "ds"
type ToastState = { title: string; msg?: string; type: ToastType } | null

const TABS: { id: Tab; label: string }[] = [
  { id: "proyectos", label: "Proyectos" },
  { id: "hero",      label: "Hero" },
  { id: "sobre",     label: "Sobre mí" },
  { id: "cv",        label: "CV" },
  { id: "logo",      label: "Logo" },
  { id: "footer",    label: "Footer" },
  { id: "marcas",    label: "Marcas" },
  { id: "blog",      label: "Blog" },
  { id: "ds",        label: "Design System" },
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
  const [tab, setTab]       = useState<Tab>("proyectos")
  const [toast, setToast]   = useState<ToastState>(null)
  const [toastLeaving, setToastLeaving] = useState(false)

  const dismissTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const leavingTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  function showToast(title: string, type: ToastType, msg?: string) {
    if (dismissTimer.current)  clearTimeout(dismissTimer.current)
    if (leavingTimer.current)  clearTimeout(leavingTimer.current)
    setToast({ title, type, msg })
    setToastLeaving(false)
    leavingTimer.current = setTimeout(() => setToastLeaving(true), 3800)
    dismissTimer.current = setTimeout(() => { setToast(null); setToastLeaving(false) }, 4000)
  }

  function closeToast() {
    if (dismissTimer.current) clearTimeout(dismissTimer.current)
    if (leavingTimer.current) clearTimeout(leavingTimer.current)
    setToastLeaving(true)
    dismissTimer.current = setTimeout(() => { setToast(null); setToastLeaving(false) }, 200)
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
            Project Zero
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
              {logo.fallbackText || "Project Zero"}
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
      {tab !== "ds" && (
        <div className="admin-container">
          {tab === "proyectos" && <ProjectsTab onToast={showToast} />}
          {tab === "hero"      && <HeroTab     onToast={showToast} />}
          {tab === "sobre"     && <AboutTab    onToast={showToast} />}
          {tab === "cv"        && <CVTab       onToast={showToast} />}
          {tab === "logo"      && <LogoTab     onToast={showToast} />}
          {tab === "footer"    && <SocialTab   onToast={showToast} />}
          {tab === "marcas"    && <BrandsTab   onToast={showToast} />}
          {tab === "blog"      && <BlogTab     onToast={showToast} />}
        </div>
      )}
      {tab === "ds" && <DesignSystemSection adminMode />}

      {/* Toast */}
      {toast && (
        <AdminToast
          type={toast.type}
          title={toast.title}
          message={toast.msg}
          onClose={closeToast}
          isLeaving={toastLeaving}
        />
      )}
    </div>
  )
}
