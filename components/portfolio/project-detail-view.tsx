"use client"

import { useState, useEffect } from "react"
import type { Project } from "@/lib/data/projects"
import { GalleryModal, PlaceholderThumb, type GalleryItem } from "./gallery-modal"
import { useLogo } from "@/lib/hooks/use-logo"

interface ProjectDetailViewProps {
  project: Project
  isDark: boolean
  onToggleTheme: () => void
  onBack: () => void
}

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
  const [modalOpen, setModalOpen] = useState(false)
  const [modalIndex, setModalIndex] = useState(0)
  const logo = useLogo()
  const logoUrl = isDark
    ? (logo.darkUrl || logo.lightUrl)
    : (logo.lightUrl || logo.darkUrl)
  const logoText = logo.fallbackText || "Project Zero"

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(t)
  }, [])

  const galleryItems = buildGalleryItems(project)

  return (
    <div className={`detail-wrapper ${mounted ? "mounted" : ""}`}>
      {/* NAVBAR */}
      <header className="detail-navbar">
        <div className="detail-navbar-left">
          <button className="detail-breadcrumb-link" onClick={onBack}>
            {logoUrl ? (
              <img src={logoUrl} alt={logoText} className="nav-logo-img" style={{ verticalAlign: "middle" }} />
            ) : (
              logoText
            )}
          </button>
          <span className="detail-breadcrumb-sep">/</span>
          <button className="detail-breadcrumb-link" onClick={onBack}>Trabajos</button>
          <span className="detail-breadcrumb-sep">/</span>
          <span className="detail-breadcrumb-current">{project.title}</span>
        </div>
        <div className="detail-navbar-right">
          <button className="theme-toggle-btn" onClick={onToggleTheme} aria-label="Toggle theme">
            <span className={`toggle-track ${isDark ? "dark" : "light"}`}>
              <span className="toggle-thumb" />
            </span>
          </button>
        </div>
      </header>

      <main className="detail-main">
        {/* LEFT — Content */}
        <div className="detail-content">
          <button className="detail-back-link" onClick={onBack}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Todos los proyectos
          </button>

          <div className="detail-tags">
            <span className="detail-tag-primary">{project.category}</span>
            <span className="detail-tag-year">{project.year}</span>
          </div>

          <h1 className="detail-title">
            {project.title.split(" ").map((word, i, arr) => (
              <span key={i}>{word}{i < arr.length - 1 && <br />}</span>
            ))}
          </h1>

          <p className="detail-description">{project.desc}</p>

          <section className="detail-section">
            <h3 className="detail-section-label">EL DESAFÍO</h3>
            <p className="detail-section-text" dangerouslySetInnerHTML={{
              __html: project.intro.replace(/(\d+%)/g, "<strong>$1</strong>"),
            }} />
          </section>

          <section className="detail-section">
            <h3 className="detail-section-label">PROCESO</h3>
            <p className="detail-section-text" dangerouslySetInnerHTML={{
              __html: project.process
                .replace(/(confianza)/gi, "<strong>$1</strong>")
                .replace(/(insight clave)/gi, "<strong>$1</strong>"),
            }} />
          </section>

          <section className="detail-section">
            <h3 className="detail-section-label">EL RESULTADO</h3>
            <p className="detail-section-text" dangerouslySetInnerHTML={{
              __html: project.result.replace(/(\+?\d+%|\$[\d.]+[MK]?)/g, "<strong>$1</strong>"),
            }} />
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
            <h3 className="detail-section-label">GALERÍA DE RESULTADOS</h3>
            <div className="detail-gallery-grid">
              {galleryItems.map((item, index) => (
                <button
                  key={item.id}
                  className="detail-gallery-item"
                  onClick={() => { setModalIndex(index); setModalOpen(true) }}
                  aria-label={`Ver ${item.label}`}
                  style={{ position: "relative", overflow: "hidden" }}
                >
                  {item.src ? (
                    <img
                      src={item.src}
                      alt={item.label}
                      style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
                    />
                  ) : (
                    <PlaceholderThumb item={item} />
                  )}
                  {/* Hover label */}
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    padding: "8px 10px", background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)",
                    fontSize: 10, color: "rgba(255,255,255,0.8)", textAlign: "left",
                    opacity: 0, transition: "opacity 0.2s ease",
                    fontWeight: 600, letterSpacing: "0.04em",
                  }} className="gallery-item-label">
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
            <h4 className="detail-sidebar-label">DETALLES</h4>
            <div className="detail-sidebar-item">
              <span className="detail-sidebar-key">Rol</span>
              <span className="detail-sidebar-value">Lead Designer</span>
            </div>
            <div className="detail-sidebar-item">
              <span className="detail-sidebar-key">Año</span>
              <span className="detail-sidebar-value">{project.year}</span>
            </div>
            <div className="detail-sidebar-item">
              <span className="detail-sidebar-key">Duración</span>
              <span className="detail-sidebar-value">
                {project.kpis.find((k) => k.lbl === "Duración")?.val ?? "4 meses"}
              </span>
            </div>
            <div className="detail-sidebar-item">
              <span className="detail-sidebar-key">Impacto</span>
              <span className="detail-sidebar-value detail-sidebar-highlight">{project.stat}</span>
            </div>
          </div>

          <div className="detail-sidebar-actions">
            <a href="#" className="detail-btn-primary">
              Ver proyecto live
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <button className="detail-btn-secondary" onClick={onBack}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Volver
            </button>
          </div>
        </aside>
      </main>

      <GalleryModal
        items={galleryItems}
        currentIndex={modalIndex}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onNavigate={setModalIndex}
      />
    </div>
  )
}
