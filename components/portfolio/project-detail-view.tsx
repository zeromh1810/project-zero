"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { Project } from "@/lib/data/projects"
import { GalleryPlaceholder, type GalleryItem } from "./gallery-placeholder"
import { Lightbox } from "./lightbox"
import { useLogo } from "@/lib/hooks/use-logo"
import { RichText } from "./rich-text"
import { ThemeToggle } from "./app-navbar"

// Resalta coincidencias solo en los nodos de texto del HTML — nunca dentro de
// una etiqueta, para no inyectar <strong> en un src/href (p. ej. "%20" en una URL).
function highlightText(html: string, re: RegExp) {
  return html
    .split(/(<[^>]*>)/)
    .map(part => (part.startsWith("<") ? part : part.replace(re, "<strong>$1</strong>")))
    .join("")
}

interface ProjectDetailViewProps {
  project: Project
  isDark: boolean
  onToggleTheme: () => void
  onBack: (scrollTarget?: "projects") => void
}

// Exit animation duration — matches the .exiting CSS transition below.
// Kept shorter than the ~500-600ms entrance stagger (exits read better
// faster than they enter).
const EXIT_DURATION = 300

const PLACEHOLDER_TYPES: GalleryItem["placeholderType"][] = [
  "desktop", "mobile", "components", "flow", "research", "final",
]
const PLACEHOLDER_LABELS = [
  "Vista general", "Vista móvil", "Sistema de componentes",
  "Flujo de usuario", "Investigación", "Diseño final",
]

function buildGalleryItems(project: Project): GalleryItem[] {
  const uploaded = project.gallery ?? []
  return Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    src: uploaded[i] || undefined,
    label: uploaded[i] ? `Imagen ${i + 1}` : PLACEHOLDER_LABELS[i],
    gradient: project.gradient,
    accent: project.accentColor,
    placeholderType: PLACEHOLDER_TYPES[i],
  }))
}

export function ProjectDetailView({
  project,
  isDark,
  onToggleTheme,
  onBack,
}: ProjectDetailViewProps) {
  const [mounted, setMounted] = useState(false)
  const [exiting, setExiting] = useState(false)
  // Índice abierto en el lightbox (null = cerrado). Las miniaturas son el
  // origen y el destino del morph del lightbox.
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([])
  const getThumb = useCallback((i: number) => thumbRefs.current[i] ?? null, [])
  const closeLightbox = useCallback(() => setLightboxIndex(null), [])
  const logo = useLogo()
  const logoUrl = isDark
    ? (logo.darkUrl || logo.lightUrl)
    : (logo.lightUrl || logo.darkUrl)
  const logoText = logo.fallbackText || "Project Zero"

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(t)
  }, [])

  // Hands off from the grown thumbnail clone + backdrop (see project-card.tsx)
  // to the real content: both live on <body>, outside this component's tree,
  // so they survive the route change and need manual cleanup here.
  //
  // Tried twice to snap the clone onto .detail-hero-image's real measured
  // rect before fading (once in a plain useEffect, once in a
  // useLayoutEffect that also forced scroll to 0 itself first) — both times
  // something inside Next's navigation re-scrolled the page AFTER our
  // measurement, so the read rect didn't match what actually got painted,
  // producing wildly wrong (large negative) coordinates. Not a race we can
  // reliably win from here. A plain fade over the already-matching backdrop
  // is simpler and has no race to lose.
  //
  // The backdrop must fade too, not just get removed at the end: it's fully
  // opaque and sits above the real content (z-index 9998 vs the page's own
  // stacking), so while it stayed solid the content's own entrance
  // animation (mounted, below) was running the whole time invisibly behind
  // it — clone and content never actually appeared to cross-fade, the
  // content just "popped in" already-finished the instant the backdrop was
  // removed. Fading both together lets the real content show through as it
  // happens.
  useEffect(() => {
    const clone = document.getElementById("project-morph-clone")
    const backdrop = document.getElementById("project-morph-backdrop")
    if (!clone && !backdrop) return
    if (clone) {
      clone.style.transition = "opacity 400ms cubic-bezier(0.16, 1, 0.3, 1)"
      clone.style.opacity = "0"
    }
    if (backdrop) {
      backdrop.style.transition = "opacity 400ms cubic-bezier(0.16, 1, 0.3, 1)"
      backdrop.style.opacity = "0"
    }
    const t = setTimeout(() => {
      clone?.remove()
      backdrop?.remove()
    }, 400)
    return () => clearTimeout(t)
  }, [])

  const handleBack = useCallback((scrollTarget?: "projects") => {
    if (exiting) return
    setExiting(true)
    setTimeout(() => onBack(scrollTarget), EXIT_DURATION)
  }, [exiting, onBack])

  const galleryItems = buildGalleryItems(project)
  const duration = project.kpis.find((k) => k.lbl === "Duración")?.val

  return (
    <div className={`detail-wrapper ${mounted ? "mounted" : ""}${exiting ? " exiting" : ""}`}>
      {/* NAVBAR */}
      <header className="detail-navbar">
        <div className="detail-navbar-left">
          <button className="detail-breadcrumb-link" onClick={() => handleBack()}>
            {logoUrl ? (
              <img src={logoUrl} alt={logoText} className="nav-logo-img" style={{ verticalAlign: "middle" }} />
            ) : (
              logoText
            )}
          </button>
          <span className="detail-breadcrumb-sep">/</span>
          <button className="detail-breadcrumb-link" onClick={() => handleBack("projects")}>Trabajos</button>
          <span className="detail-breadcrumb-sep">/</span>
          <span className="detail-breadcrumb-current">{project.title}</span>
        </div>
        <div className="detail-navbar-right">
          {/* Mismo toggle que el navbar principal (antes un switch distinto). */}
          <ThemeToggle />
        </div>
      </header>

      <main className="detail-main">
        {/* LEFT — Content */}
        <div className="detail-content">
          <button className="detail-back-link" onClick={() => handleBack("projects")}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Todos los proyectos
          </button>

          <div className="detail-tags">
            <span className="detail-tag-primary">{project.category}</span>
            <span className="detail-tag-year">{project.year}</span>
          </div>

          <h1 className="detail-title">{project.title}</h1>

          <p className="detail-description">{project.desc}</p>

          {project.thumbnail && (
            <div className="detail-hero-image">
              <img src={project.thumbnail} alt={project.title} />
            </div>
          )}

          <section className="detail-section">
            <h2 className="detail-section-label">EL DESAFÍO</h2>
            <RichText
              text={highlightText(project.intro, /(\d+%)/g)}
              variant="full"
              className="detail-section-text"
            />
          </section>

          <section className="detail-section">
            <h2 className="detail-section-label">PROCESO</h2>
            <RichText
              text={highlightText(project.process, /(confianza|insight clave)/gi)}
              variant="full"
              className="detail-section-text"
            />
          </section>

          <section className="detail-section">
            <h2 className="detail-section-label">EL RESULTADO</h2>
            <RichText
              text={highlightText(project.result, /(\+?\d+%|\$[\d.]+[MK]?)/g)}
              variant="full"
              className="detail-section-text"
            />
          </section>

          <div className="detail-impact-box">
            <div className="detail-impact-label">Impacto cuantificado</div>
            <div className="detail-impact-metrics">
              {project.kpis.map((kpi, i) => (
                <span key={i}>
                  <span className="detail-impact-value">{kpi.val}</span>{" "}{kpi.lbl.toLowerCase()}
                  {i < project.kpis.length - 1 && <span className="detail-impact-sep">·</span>}
                </span>
              ))}
            </div>
          </div>

          {/* Gallery */}
          <section className="detail-gallery-section">
            <h2 className="detail-section-label">GALERÍA DE RESULTADOS</h2>
            <div className="detail-gallery-grid">
              {galleryItems.map((item, index) => (
                <button
                  key={item.id}
                  ref={(node) => { thumbRefs.current[index] = node }}
                  className="detail-gallery-item"
                  onClick={() => setLightboxIndex(index)}
                  aria-haspopup="dialog"
                  aria-label={`Ver ${item.label}`}
                  style={{ position: "relative", overflow: "hidden" }}
                >
                  {item.src ? (
                    <img
                      src={item.src}
                      alt=""
                      loading="lazy"
                      style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
                    />
                  ) : (
                    <GalleryPlaceholder item={item} />
                  )}
                  {/* Hover label */}
                  <div className="gallery-item-label">
                    {item.label}
                  </div>
                </button>
              ))}
            </div>
          </section>

          <div className="detail-skills">
            {project.tags.map((tag) => (
              <span key={tag} className="detail-skill-tag">{tag}</span>
            ))}
          </div>
        </div>

        {/* RIGHT — Sidebar */}
        <aside className="detail-sidebar">
          <div className="detail-sidebar-section">
            <h2 className="detail-sidebar-label">DETALLES</h2>
            <div className="detail-sidebar-item">
              <span className="detail-sidebar-key">Rol</span>
              <span className="detail-sidebar-value">{project.role || "Lead Designer"}</span>
            </div>
            <div className="detail-sidebar-item">
              <span className="detail-sidebar-key">Año</span>
              <span className="detail-sidebar-value">{project.year}</span>
            </div>
            {/* Sin dato real no se muestra (antes caía en "4 meses" inventado). */}
            {duration && (
              <div className="detail-sidebar-item">
                <span className="detail-sidebar-key">Duración</span>
                <span className="detail-sidebar-value">{duration}</span>
              </div>
            )}
            <div className="detail-sidebar-item">
              <span className="detail-sidebar-key">Impacto</span>
              <span className="detail-sidebar-value detail-sidebar-highlight">{project.stat}</span>
            </div>
          </div>

          <div className="detail-sidebar-actions">
            {/* Antes apuntaba a href="#" en todos los proyectos: un CTA muerto. */}
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="detail-btn-primary">
                Ver proyecto live
                <svg className="btn-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            )}
            <button className="detail-btn-secondary" onClick={() => handleBack("projects")}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Volver
            </button>
          </div>
        </aside>
      </main>

      {lightboxIndex !== null && (
        <Lightbox
          items={galleryItems}
          startIndex={lightboxIndex}
          title={project.title}
          getOrigin={getThumb}
          onClose={closeLightbox}
        />
      )}
    </div>
  )
}
