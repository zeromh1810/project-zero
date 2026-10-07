"use client"

import { useRef, useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "@/lib/context/theme-context"
import { useLogo } from "@/lib/hooks/use-logo"
import { SunIcon, MoonIcon, ArrowLeftIcon } from "./icons"

import { switchThemeWithTransition } from "@/lib/theme-transition"

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
export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()
  // Revelado circular desde el botón presionado (lib/theme-transition.ts).
  // El ícono que pasa a activo gira al entrar (.theme-switched, ver CSS).
  const switchTo = (dark: boolean) => (e: React.MouseEvent<HTMLButtonElement>) => {
    if (dark === isDark) return
    const r = e.currentTarget.getBoundingClientRect()
    document.documentElement.classList.add("theme-switched")
    switchThemeWithTransition(toggleTheme, dark, { x: r.left + r.width / 2, y: r.top + r.height / 2 })
  }
  return (
    <div className="theme-toggle" role="group" aria-label="Modo de color">
      <button
        className={`theme-toggle-btn${!isDark ? " active" : ""}`}
        onClick={switchTo(false)}
        aria-label="Modo claro"
        aria-pressed={!isDark}
      >
        <SunIcon />
      </button>
      <button
        className={`theme-toggle-btn${isDark ? " active" : ""}`}
        onClick={switchTo(true)}
        aria-label="Modo oscuro"
        aria-pressed={isDark}
      >
        <MoonIcon />
      </button>
    </div>
  )
}

// ── Zero design system ────────────────────────────────────────────────────
// El DS es público: muestra cómo está construido el sitio. En anchos medios
// el nombre completo no cabe junto a las demás secciones: se abrevia a
// "Zero DS".
function DsNavLink({ active = false }: { active?: boolean }) {
  return (
    // Sin aria-label: el nombre accesible es el texto visible (WCAG 2.5.3);
    // la versión oculta con display:none no se anuncia.
    <Link href="/design-system" data-nav="ds" className={`nav-item nav-item--ds${active ? " active" : ""}`}
      aria-current={active ? "page" : undefined}>
      <span className="nav-ds-full">Zero design system</span>
      <span className="nav-ds-short">Zero DS</span>
    </Link>
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
      // Depende de la medición de DOM (getBoundingClientRect) de arriba, que
      // solo puede ocurrir en un effect — marca que ya se hizo el primer
      // posicionamiento sin transición, antes de reactivarla un frame después.
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

  // Sincroniza activeKey con la sección activa (salvo "trabajos", que usa su
  // propio estado inicial "home") para que la píldora de usePill seleccione
  // el nav-item correcto tras una navegación por código, no solo por click.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (currentSection !== "trabajos") setActiveKey(currentSection)
  }, [currentSection])

  // Scroll-spy (M-19): dentro de "trabajos" la página tiene dos zonas — el
  // hero (Home) y la grilla (Trabajos). La píldora sigue a la que está bajo
  // el navbar, así refleja dónde está el usuario y no solo el último click.
  useEffect(() => {
    if (currentSection !== "trabajos") return
    let raf = 0
    const update = () => {
      raf = 0
      const sheet = document.querySelector(".projects-sheet")
      if (!sheet) return
      const next = sheet.getBoundingClientRect().top <= 96 ? "trabajos" : "home"
      setActiveKey((k) => (k === next ? k : next))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    window.addEventListener("scroll", onScroll, { passive: true })
    update()
    return () => { window.removeEventListener("scroll", onScroll); if (raf) cancelAnimationFrame(raf) }
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
      <button type="button" className="nav-logo" onClick={goHome} aria-label={`${logoText} — Inicio`}>
        {logoUrl
          ? <img src={logoUrl} alt="" className="nav-logo-img" />
          : <><span className="nav-logo-dot" aria-hidden="true" />{logoText}</>}
      </button>

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
        <DsNavLink />
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

  const activeKey = pathname.startsWith("/blog") ? "blog" : pathname.startsWith("/design-system") ? "ds" : "home"
  const { navCenterRef, pillRef } = usePill(activeKey)

  // Escribe el destino en sessionStorage y navega al portfolio
  function goToSection(section: string, scroll?: string) {
    sessionStorage.setItem(NAV_SESSION_KEY, JSON.stringify({ section, scroll }))
    router.push("/")
  }

  return (
    <nav className="navbar">
      <Link href="/" className="nav-logo" aria-label={`${logoText} — Inicio`}>
        {logoUrl
          ? <img src={logoUrl} alt="" className="nav-logo-img" />
          : <><span className="nav-logo-dot" aria-hidden="true" />{logoText}</>}
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
        <DsNavLink active={activeKey === "ds"} />
      </div>

      <div className="nav-right">
        <ThemeToggle />
        <Link href="/" className="btn-profile" style={{ textDecoration: "none" }} aria-label="Volver al portafolio"><ArrowLeftIcon className="btn-arrow-back" /> <span className="nav-back-label" aria-hidden="true">Portafolio</span></Link>
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
