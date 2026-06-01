"use client"

import { useRef, useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "@/lib/context/theme-context"
import { useLogo } from "@/lib/hooks/use-logo"
import { SunIcon, MoonIcon } from "./icons"

const NAV_ITEMS = [
  { label: "Trabajos",       href: "/" },
  { label: "Sobre Mí",       href: "/?s=sobre" },
  { label: "CV",             href: "/?s=cv" },
  { label: "Contacto",       href: "/?s=contacto" },
  { label: "Project Zero DS",href: "/?s=design-system" },
  { label: "Blog",           href: "/blog" },
]

export function BlogNavbar() {
  const { isDark, toggleTheme } = useTheme()
  const logo    = useLogo()
  const pathname = usePathname()

  const navCenterRef = useRef<HTMLDivElement>(null)
  const pillRef      = useRef<HTMLSpanElement>(null)
  const [pillReady, setPillReady] = useState(false)

  const logoUrl  = isDark ? (logo.darkUrl || logo.lightUrl) : (logo.lightUrl || logo.darkUrl)
  const logoText = logo.fallbackText || "Project Zero"

  // Animate pill to active item
  useEffect(() => {
    const container = navCenterRef.current
    const pill      = pillRef.current
    if (!container || !pill) return

    const active = container.querySelector(`[data-active="true"]`) as HTMLElement
    if (!active) { pill.style.width = "0"; return }

    const cRect = container.getBoundingClientRect()
    const aRect = active.getBoundingClientRect()
    pill.style.left  = `${aRect.left - cRect.left}px`
    pill.style.width = `${aRect.width}px`

    if (!pillReady) {
      pill.style.transition = "none"
      setPillReady(true)
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (pillRef.current)
          pillRef.current.style.transition =
            "left 350ms cubic-bezier(0.34,1.56,0.64,1), width 350ms cubic-bezier(0.34,1.56,0.64,1)"
      }))
    }
  }, [pathname, pillReady])

  return (
    <nav className="navbar">
      <Link href="/" className="nav-logo" style={{ textDecoration: "none", color: "inherit" }}>
        {logoUrl
          ? <img src={logoUrl} alt={logoText} className="nav-logo-img" />
          : <><span className="nav-logo-dot" />{logoText}</>}
      </Link>

      <div className="nav-center" ref={navCenterRef}>
        <span ref={pillRef} className="nav-pill" aria-hidden="true" />
        {NAV_ITEMS.map(({ label, href }) => {
          const isActive = href === "/blog"
            ? pathname.startsWith("/blog")
            : false
          return (
            <Link
              key={href}
              href={href}
              data-active={isActive}
              className={`nav-item${isActive ? " active" : ""}`}
            >
              {label}
            </Link>
          )
        })}
      </div>

      <div className="nav-right">
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
        <Link href="/" className="btn-profile" style={{ textDecoration: "none" }}>
          ← Portafolio
        </Link>
      </div>
    </nav>
  )
}
