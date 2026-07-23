"use client"

import { useRef, useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "@/lib/context/theme-context"
import { useLogo } from "@/lib/hooks/use-logo"
import { SunIcon, MoonIcon } from "./icons"

export const NAV_SESSION_KEY = "portfolio-nav-target"

type Section = "trabajos" | "sobre" | "contacto"

// ── Portfolio mode props ──────────────────────────────────────────────────
interface PortfolioProps {
  mode: "portfolio"
  currentSection: Section
  onNavigate: (section: Section, scrollTarget?: string) => void
  onProfileClick: () => void
}

// ── Blog mode props ───────────────────────────────────────────────────────
interface BlogProps {
  mode: "blog"
}

type AppNavbarProps = PortfolioProps | BlogProps

// Nav items shared between both modes
const SECTION_ITEMS: { key: Section; label: string }[] = [
  { key: "sobre",    label: "Sobre Mí" },
  { key: "contacto", label: "Contacto" },
]

// ── Theme toggle (shared) ─────────────────────────────────────────────────
function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()
  return (
    <div className="theme-toggle" role="group" aria-label="Modo de color">
      <button
        className={`theme-toggle-btn${!isDark ? " active" : ""}`}
        onClick={() => isDark && toggleTheme()}
        aria-label="Modo claro"
        aria-pressed={!isDark}
      >
        <SunIcon />
      </button>
      <button
        className={`theme-toggle-btn${isDark ? " active" : ""}`}
        onClick={() => !isDark && toggleTheme()}
        aria-label="Modo oscuro"
        aria-pressed={isDark}
      >
        <MoonIcon />
      </button>
    </div>
  )
}

// ── Pill animation hook ───────────────────────────────────────────────────
function usePill(activeKey: string) {
  const navCenterRef = useRef<HTMLDivElement>(null)
  const pillRef      = useRef<HTMLSpanElement>(null)
  const [pillReady, setPillReady] = useState(false)

  useEffect(() => {
    const container = navCenterRef.current
    const pill      = pillRef.current
    if (!container || !pill) return

    const el = container.querySelector(`[data-nav="${activeKey}"]`) as HTMLElement
    if (!el) { pill.style.width = "0"; return }

    const cRect = container.getBoundingClientRect()
    const eRect = el.getBoundingClientRect()
    pill.style.left  = `${eRect.left - cRect.left}px`
    pill.style.width = `${eRect.width}px`

    if (!pillReady) {
      pill.style.transition = "none"
      setPillReady(true)
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (pillRef.current)
          pillRef.current.style.transition =
            "left 350ms cubic-bezier(0.34,1.56,0.64,1), width 350ms cubic-bezier(0.34,1.56,0.64,1)"
      }))
    }
  }, [activeKey, pillReady])

  return { navCenterRef, pillRef }
}

// ── PORTFOLIO NAVBAR ──────────────────────────────────────────────────────
function PortfolioNavbar({ currentSection, onNavigate, onProfileClick }: Omit<PortfolioProps, "mode">) {
  const { isDark } = useTheme()
  const logo = useLogo()
  const logoUrl  = isDark ? (logo.darkUrl || logo.lightUrl) : (logo.lightUrl || logo.darkUrl)
  const logoText = logo.fallbackText || "Project Zero"

  const [activeKey, setActiveKey] = useState<string>(
    currentSection === "trabajos" ? "home" : currentSection
  )

  useEffect(() => {
    if (currentSection !== "trabajos") setActiveKey(currentSection)
  }, [currentSection])

  const { navCenterRef, pillRef } = usePill(activeKey)

  function goHome() {
    onNavigate("trabajos")
    setActiveKey("home")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function goTrabajos() {
    // scrollTarget "projects" is applied instantly by portfolio.tsx's own
    // layout effect (same mechanism as the project-detail "Volver" flow) —
    // no more hero flash + delayed smooth scroll down to the grid.
    onNavigate("trabajos", "projects")
    setActiveKey("trabajos")
  }

  function goSection(key: Section) {
    onNavigate(key)
    setActiveKey(key)
    window.scrollTo({ top: 0, behavior: "instant" })
  }

  return (
    <nav className="navbar">
      <div className="nav-logo" onClick={goHome} style={{ cursor: "pointer" }}>
        {logoUrl
          ? <img src={logoUrl} alt={logoText} className="nav-logo-img" />
          : <><span className="nav-logo-dot" />{logoText}</>}
      </div>

      <div className="nav-center" ref={navCenterRef}>
        <span ref={pillRef} className="nav-pill" aria-hidden="true" />

        <button data-nav="home" className={`nav-item${activeKey === "home" ? " active" : ""}`} onClick={goHome}>
          Home
        </button>
        <button data-nav="trabajos" className={`nav-item${activeKey === "trabajos" ? " active" : ""}`} onClick={goTrabajos}>
          Trabajos
        </button>
        {SECTION_ITEMS.map(({ key, label }) => (
          <button
            key={key}
            data-nav={key}
            className={`nav-item${activeKey === key ? " active" : ""}`}
            onClick={() => goSection(key)}
          >
            {label}
          </button>
        ))}
        <Link href="/blog" data-nav="blog" className="nav-item">Blog</Link>
      </div>

      <div className="nav-right">
        <ThemeToggle />
        <button className="btn-profile" onClick={onProfileClick}>Perfil</button>
      </div>
    </nav>
  )
}

// ── BLOG NAVBAR ───────────────────────────────────────────────────────────
function BlogNavbarInner() {
  const { isDark } = useTheme()
  const logo     = useLogo()
  const pathname = usePathname()
  const router   = useRouter()

  const logoUrl  = isDark ? (logo.darkUrl || logo.lightUrl) : (logo.lightUrl || logo.darkUrl)
  const logoText = logo.fallbackText || "Project Zero"

  const activeKey = pathname.startsWith("/blog") ? "blog" : "home"
  const { navCenterRef, pillRef } = usePill(activeKey)

  // Escribe el destino en sessionStorage y navega al portfolio
  function goToSection(section: string, scroll?: string) {
    sessionStorage.setItem(NAV_SESSION_KEY, JSON.stringify({ section, scroll }))
    router.push("/")
  }

  return (
    <nav className="navbar">
      <Link href="/" className="nav-logo" style={{ textDecoration: "none", color: "inherit" }}>
        {logoUrl
          ? <img src={logoUrl} alt={logoText} className="nav-logo-img" />
          : <><span className="nav-logo-dot" />{logoText}</>}
      </Link>

      <div className="nav-center" ref={navCenterRef}>
        <span ref={pillRef} className="nav-pill" aria-hidden="true" />

        <button data-nav="home"     className="nav-item" onClick={() => router.push("/")}>Home</button>
        <button data-nav="trabajos" className="nav-item" onClick={() => goToSection("trabajos", "projects")}>Trabajos</button>
        {SECTION_ITEMS.map(({ key, label }) => (
          <button key={key} data-nav={key} className="nav-item" onClick={() => goToSection(key)}>
            {label}
          </button>
        ))}
        <Link href="/blog" data-nav="blog" className={`nav-item${activeKey === "blog" ? " active" : ""}`}>
          Blog
        </Link>
      </div>

      <div className="nav-right">
        <ThemeToggle />
        <Link href="/" className="btn-profile" style={{ textDecoration: "none" }}>← Portafolio</Link>
      </div>
    </nav>
  )
}

// ── UNIFIED EXPORT ────────────────────────────────────────────────────────
export function AppNavbar(props: AppNavbarProps) {
  if (props.mode === "blog") return <BlogNavbarInner />
  return (
    <PortfolioNavbar
      currentSection={props.currentSection}
      onNavigate={props.onNavigate}
      onProfileClick={props.onProfileClick}
    />
  )
}
