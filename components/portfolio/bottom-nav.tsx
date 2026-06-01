"use client"

import Link from "next/link"
import { MonitorIcon, UserIcon, EmailIcon, LayersIcon, BlogIcon } from "./icons"

type Section = "trabajos" | "sobre" | "contacto" | "design-system"

interface BottomNavProps {
  currentSection: Section
  onNavigate: (section: Section) => void
}

const TABS: { key: Section; label: string; Icon: typeof MonitorIcon }[] = [
  { key: "trabajos", label: "Trabajos", Icon: MonitorIcon },
  { key: "sobre", label: "Sobre mí", Icon: UserIcon },
  { key: "contacto", label: "Contacto", Icon: EmailIcon },
  { key: "design-system", label: "DS", Icon: LayersIcon },
]

export function BottomNav({ currentSection, onNavigate }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      {TABS.map(({ key, label, Icon }) => (
        <button
          key={key}
          className={`bottom-tab${currentSection === key ? " active" : ""}`}
          onClick={() => onNavigate(key)}
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
    </nav>
  )
}
