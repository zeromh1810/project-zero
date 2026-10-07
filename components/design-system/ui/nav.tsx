"use client"

import { createContext, useContext, type ReactNode } from "react"
import { ArrowRightIcon } from "@/components/portfolio/icons"

/** Navegación interna del DS (el shell la provee; las páginas no importan el registro). */
export const NavContext = createContext<(id: string) => void>(() => {})

/** Enlace a otra página del DS. */
export function PageLink({ to, children }: { to: string; children: ReactNode }) {
  const go = useContext(NavContext)
  return <button type="button" className="doc-link" onClick={() => go(to)}>{children}</button>
}

/** Tarjeta de navegación (página de inicio). */
export function PageCard({ to, title, desc }: { to: string; title: string; desc: string }) {
  const go = useContext(NavContext)
  return (
    <button type="button" className="doc-card" onClick={() => go(to)}>
      <span className="doc-card-title">{title} <ArrowRightIcon /></span>
      <span className="doc-card-desc">{desc}</span>
    </button>
  )
}
