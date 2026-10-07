"use client"

import { useState } from "react"
import Link from "next/link"
import { MonitorIcon, UserIcon, EmailIcon, BlogIcon, LayersIcon } from "./icons"

type Section = "trabajos" | "sobre" | "contacto"

interface BottomNavProps {
  currentSection: Section
  onNavigate: (section: Section) => void
}

const TABS: { key: Section; label: string; Icon: typeof MonitorIcon }[] = [
  { key: "trabajos", label: "Trabajos", Icon: MonitorIcon },
  { key: "sobre",    label: "Sobre mí", Icon: UserIcon },
  { key: "contacto", label: "Contacto", Icon: EmailIcon },
]

export function BottomNav({ currentSection, onNavigate }: BottomNavProps) {
  // Habilita el pop del ícono activo solo tras un toque real (ver CSS).
  const [touched, setTouched] = useState(false)
  return (
    <nav className={`bottom-nav${touched ? " bottom-nav--touched" : ""}`} aria-label="Navegación principal">
      {TABS.map(({ key, label, Icon }) => (
        <button
          key={key}
          className={`bottom-tab${currentSection === key ? " active" : ""}`}
          onClick={() => { setTouched(true); onNavigate(key) }}
          aria-label={label}
          aria-current={currentSection === key ? "page" : undefined}
        >
          <Icon />
          {label}
        </button>
      ))}
      <Link href="/blog" className="bottom-tab" style={{ textDecoration: "none" }} aria-label="Blog">
        <BlogIcon />
        Blog
      </Link>
      <Link href="/design-system" className="bottom-tab" style={{ textDecoration: "none" }} aria-label="Zero DS: Zero design system">
        <LayersIcon />
        Zero DS
      </Link>
    </nav>
  )
}
