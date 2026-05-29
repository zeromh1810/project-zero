"use client"

import { useRef, useEffect, useState } from "react"
import { useTheme } from "@/lib/context/theme-context"
import { useLogo } from "@/lib/hooks/use-logo"

type Section = "trabajos" | "sobre" | "cv" | "contacto" | "design-system"

interface NavbarProps {
  currentSection: Section
  onNavigate: (section: Section) => void
  onProfileClick: () => void
}

const NAV_ITEMS: { key: Section; label: string }[] = [
  { key: "trabajos", label: "Trabajos" },
  { key: "sobre", label: "Sobre Mí" },
  { key: "cv", label: "CV" },
  { key: "contacto", label: "Contacto" },
  { key: "design-system", label: "Project Zero DS" },
]

export function Navbar({ currentSection, onNavigate, onProfileClick }: NavbarProps) {
  const { isDark, toggleTheme } = useTheme()
  const logo = useLogo()
  const navCenterRef = useRef<HTMLDivElement>(null)
  const pillRef = useRef<HTMLSpanElement>(null)
  const [pillReady, setPillReady] = useState(false)

  const logoUrl = isDark
    ? (logo.darkUrl || logo.lightUrl)
    : (logo.lightUrl || logo.darkUrl)
  const logoText = logo.fallbackText || "A·Studio"

  // Measure active button and animate the pill
  useEffect(() => {
    const container = navCenterRef.current
    const pill = pillRef.current
    if (!container || !pill) return

    const activeBtn = container.querySelector(`[data-section="${currentSection}"]`) as HTMLElement
    if (!activeBtn) return

    const containerRect = container.getBoundingClientRect()
    const btnRect = activeBtn.getBoundingClientRect()

    pill.style.left = `${btnRect.left - containerRect.left}px`
    pill.style.width = `${btnRect.width}px`

    // On first render, skip transition so pill appears instantly
    if (!pillReady) {
      pill.style.transition = "none"
      setPillReady(true)
      // Re-enable transition after first paint
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (pillRef.current) {
            pillRef.current.style.transition =
              "left 350ms cubic-bezier(0.34, 1.56, 0.64, 1), width 350ms cubic-bezier(0.34, 1.56, 0.64, 1)"
          }
        })
      })
    }
  }, [currentSection, pillReady])

  return (
    <nav className="navbar">
      <div className="nav-logo" onClick={() => onNavigate("trabajos")} style={{ cursor: "pointer" }}>
        {logoUrl ? (
          <img src={logoUrl} alt={logoText} className="nav-logo-img" />
        ) : (
          <>
            <span className="nav-logo-dot" />
            {logoText}
          </>
        )}
      </div>

      <div className="nav-center" ref={navCenterRef}>
        {/* Sliding pill background */}
        <span ref={pillRef} className="nav-pill" aria-hidden="true" />

        {NAV_ITEMS.map(({ key, label }) => (
          <button
            key={key}
            data-section={key}
            className={`nav-item${currentSection === key ? " active" : ""}`}
            onClick={() => onNavigate(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="nav-right">
        <button
          className="theme-btn"
          aria-label={isDark ? "Modo claro" : "Modo oscuro"}
          onClick={toggleTheme}
          title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          style={{
            ["--knob-position" as string]: isDark ? "16px" : "2px",
            ["--knob-color" as string]: isDark ? "var(--txt)" : "var(--txt)",
          }}
        />
        <button className="btn-profile" onClick={onProfileClick}>
          Perfil
        </button>
      </div>
    </nav>
  )
}
