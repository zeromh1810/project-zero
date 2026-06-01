"use client"

import { useRef, useEffect, useState } from "react"
import Link from "next/link"
import { useTheme } from "@/lib/context/theme-context"
import { useLogo } from "@/lib/hooks/use-logo"
import { SunIcon, MoonIcon } from "./icons"

type Section = "trabajos" | "sobre" | "cv" | "contacto" | "design-system"

interface NavbarProps {
  currentSection: Section
  onNavigate: (section: Section) => void
  onProfileClick: () => void
}

const SECTION_ITEMS: { key: Section; label: string }[] = [
  { key: "sobre",         label: "Sobre Mí" },
  { key: "cv",            label: "CV" },
  { key: "contacto",      label: "Contacto" },
  { key: "design-system", label: "Project Zero DS" },
]

export function Navbar({ currentSection, onNavigate, onProfileClick }: NavbarProps) {
  const { isDark, toggleTheme } = useTheme()
  const logo = useLogo()
  const navCenterRef = useRef<HTMLDivElement>(null)
  const pillRef      = useRef<HTMLSpanElement>(null)
  const [pillReady, setPillReady] = useState(false)
  const [activeKey, setActiveKey] = useState<string>(
    currentSection === "trabajos" ? "home" : currentSection
  )

  const logoUrl  = isDark ? (logo.darkUrl || logo.lightUrl) : (logo.lightUrl || logo.darkUrl)
  const logoText = logo.fallbackText || "Project Zero"

  // Sync activeKey when section changes from outside
  useEffect(() => {
    if (currentSection !== "trabajos") setActiveKey(currentSection)
  }, [currentSection])

  // Move pill to the active element
  useEffect(() => {
    const container = navCenterRef.current
    const pill      = pillRef.current
    if (!container || !pill) return

    const el = container.querySelector(`[data-nav="${activeKey}"]`) as HTMLElement
    if (!el) return

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

  function goHome() {
    onNavigate("trabajos")
    setActiveKey("home")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function goTrabajos() {
    onNavigate("trabajos")
    setActiveKey("trabajos")
    // Scroll to projects sheet after section renders
    requestAnimationFrame(() => {
      const sheet = document.querySelector(".projects-sheet") as HTMLElement
      if (sheet) sheet.scrollIntoView({ behavior: "smooth", block: "start" })
    })
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

        {/* Home */}
        <button
          data-nav="home"
          className={`nav-item${activeKey === "home" ? " active" : ""}`}
          onClick={goHome}
        >
          Home
        </button>

        {/* Trabajos — ancla a projects-sheet */}
        <button
          data-nav="trabajos"
          className={`nav-item${activeKey === "trabajos" ? " active" : ""}`}
          onClick={goTrabajos}
        >
          Trabajos
        </button>

        {/* Rest of sections */}
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

        {/* Blog link */}
        <Link href="/blog" className="nav-item">Blog</Link>
      </div>

      <div className="nav-right">
        {/* Theme toggle — dual icon */}
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

        <button className="btn-profile" onClick={onProfileClick}>
          Perfil
        </button>
      </div>
    </nav>
  )
}
