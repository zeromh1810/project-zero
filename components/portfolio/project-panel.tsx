"use client"

import { useState } from "react"
import { useTheme } from "@/lib/context/theme-context"
import type { Project } from "@/lib/data/projects"

interface ProjectPanelProps {
  project: Project
  onClose: () => void
}

const EXIT_DURATION = 380

export function ProjectPanel({ project, onClose }: ProjectPanelProps) {
  const { isDark } = useTheme()
  const [exiting, setExiting] = useState(false)

  const handleClose = () => {
    setExiting(true)
    setTimeout(onClose, EXIT_DURATION)
  }

  return (
    <div
      className={`project-view${exiting ? " project-view--exiting" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
    >
      <div className="project-view-backdrop" onClick={handleClose} />
      <div className="project-view-panel">
        {/* Hero image */}
        <div className="pv-hero">
          <div
            style={{
              width: "100%",
              height: "100%",
              background: isDark ? project.gradient : project.lightGradient,
              backgroundImage: `radial-gradient(ellipse at 35% 45%, ${project.accentColor}44 0%, transparent 55%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: "clamp(64px,12vw,100px)", lineHeight: 1 }}>
              {project.emoji}
            </span>
          </div>
          <button className="pv-close" onClick={handleClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="pv-body">
          {/* Meta + title */}
          <div className="pv-meta">
            <span className="pv-cat">{project.category}</span>
            <span className="pv-year">{project.year}</span>
          </div>
          <h2 className="pv-title">{project.title}</h2>
          <p className="pv-short">{project.desc}</p>

          {/* KPI strip */}
          <div className="pv-kpis">
            {project.kpis.map((k) => (
              <div key={k.lbl} className="pv-kpi">
                <div className="pv-kpi-val">{k.val}</div>
                <div className="pv-kpi-lbl">{k.lbl}</div>
              </div>
            ))}
          </div>

          {/* Case study — inicio */}
          <div className="pv-section">
            <div className="pv-section-title">El desafío</div>
            <p className="pv-text">{project.intro}</p>
          </div>

          {/* Case study — proceso */}
          <div className="pv-section">
            <div className="pv-section-title">Proceso</div>
            <p className="pv-text">{project.process}</p>
          </div>

          {/* Resultado callout */}
          <div className="pv-result">
            <strong>Resultados — </strong>
            {project.result}
          </div>

          {/* Tags */}
          <div className="pv-tags">
            {project.tags.map((t) => (
              <span key={t} className="pv-tag">
                {t}
              </span>
            ))}
          </div>

          <div className="pv-divider" />
          <div className="pv-actions">
            <button className="btn-p">Ver proyecto live →</button>
            <button className="btn-g" onClick={handleClose}>
              ← Volver
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
