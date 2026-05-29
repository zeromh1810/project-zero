"use client"

import { MonitorIcon, UserIcon, DocumentIcon, EmailIcon, LayersIcon } from "./icons"

type Section = "trabajos" | "sobre" | "cv" | "contacto" | "design-system"

interface BottomNavProps {
  currentSection: Section
  onNavigate: (section: Section) => void
}

const TABS: { key: Section; label: string; Icon: typeof MonitorIcon }[] = [
  { key: "trabajos", label: "Trabajos", Icon: MonitorIcon },
  { key: "sobre", label: "Sobre mí", Icon: UserIcon },
  { key: "cv", label: "CV", Icon: DocumentIcon },
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
    </nav>
  )
}
