"use client"

import type { ReactNode } from "react"

// Componentes de presentación del admin (DS v2.1.0). Reemplazan las filas,
// badges y vacíos que cada tab escribía con estilos inline distintos (AU-2).

/** Estado editorial de un elemento (borrador, publicado, aviso). Texto ≥12px y contraste AA en ambos temas. */
export function StatusBadge({ tone, children }: { tone: "draft" | "live" | "warning" | "neutral"; children: ReactNode }) {
  return <span className={`a-badge a-badge--${tone}`}>{children}</span>
}

/** Fila de lista (Proyectos, Blog, Marcas): media, título, meta y acciones. */
export function ListItem({
  media, title, meta, badge, actions, active,
}: {
  media?: ReactNode
  title: ReactNode
  meta?: ReactNode
  badge?: ReactNode
  actions?: ReactNode
  /** Elemento en edición. */
  active?: boolean
}) {
  return (
    <li className={`a-item${active ? " is-active" : ""}`} aria-current={active ? "true" : undefined}>
      {media && <div className="a-item-media">{media}</div>}
      <div className="a-item-body">
        <div className="a-item-title-row">
          <span className="a-item-title">{title}</span>
          {badge}
        </div>
        {meta && <div className="a-item-meta">{meta}</div>}
      </div>
      {actions && <div className="a-item-actions">{actions}</div>}
    </li>
  )
}

/** Estado vacío con una acción concreta (no solo un emoji y un texto). */
export function EmptyState({ icon, title, description, action }: {
  icon: ReactNode
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="a-empty">
      <span className="a-empty-icon" aria-hidden="true">{icon}</span>
      <p className="a-empty-title">{title}</p>
      {description && <p className="a-empty-desc">{description}</p>}
      {action}
    </div>
  )
}

/** Esqueleto de lista mientras carga — misma forma que ListItem. */
export function ListSkeleton({ rows = 3, label = "Cargando" }: { rows?: number; label?: string }) {
  return (
    <ul className="a-list" aria-busy="true" aria-label={label}>
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className="a-item a-item--skeleton" aria-hidden="true">
          <div className="a-item-media skeleton" />
          <div className="a-item-body">
            <div className="skeleton skeleton-line" style={{ width: `${55 - i * 8}%` }} />
            <div className="skeleton skeleton-line" style={{ width: "30%" }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

/** Encabezado de sección de cada tab: h1 real (AT-3) + descripción + acción. */
export function SectionHeader({ title, description, action }: { title: string; description?: ReactNode; action?: ReactNode }) {
  return (
    <header className="a-section-head">
      <div>
        <h1 className="a-section-title">{title}</h1>
        {description && <p className="a-section-desc">{description}</p>}
      </div>
      {action}
    </header>
  )
}

/** Card con título h2 — agrupa campos relacionados. */
export function Card({ title, description, children, className = "" }: { title?: string; description?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`a-card ${className}`}>
      {title && <h2 className="a-card-title">{title}</h2>}
      {description && <p className="a-card-desc">{description}</p>}
      {children}
    </section>
  )
}
