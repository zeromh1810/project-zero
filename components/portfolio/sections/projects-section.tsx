"use client"

import { useState, useEffect, useRef } from "react"
import { PROJECTS, type Project } from "@/lib/data/projects"
import { ProjectCard } from "../project-card"
import { HeroSection } from "./hero-section"
import { BrandsSection } from "./brands-section"
import { BlogPreviewSection } from "./blog-preview-section"

interface ProjectsSectionProps {
  onNavigateContact: () => void
  onNavigateAbout: () => void
  onSelectProject: (project: Project) => void
}

// Bento pattern: featured at positions 0 and 3 (per group of 4)
function getBentoVariant(i: number): "featured" | "compact" {
  const pos = i % 4
  return pos === 0 || pos === 3 ? "featured" : "compact"
}

export function ProjectsSection({ onNavigateContact, onNavigateAbout, onSelectProject }: ProjectsSectionProps) {
  const [projects, setProjects] = useState<Project[]>(PROJECTS)
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let ignore = false
    fetch("/api/admin/projects", { cache: "no-store" })
      .then(r => r.json())
      .then(d => { if (!ignore && Array.isArray(d) && d.length) setProjects(d) })
      .catch(() => {})
    return () => { ignore = true }
  }, [])

  // Scroll-driven alpha: semitransparente → sólido al entrar al viewport
  useEffect(() => {
    const el = sheetRef.current
    if (!el) return

    const update = () => {
      const isDark = document.documentElement.classList.contains("dark")
      const rect   = el.getBoundingClientRect()
      const navH   = 64
      // alpha va de 0.82 → 1.0 mientras el top del sheet viaja
      // desde el borde inferior del viewport hasta el navbar
      const progress = Math.max(0, Math.min(1,
        (window.innerHeight - rect.top) / (window.innerHeight - navH)
      ))
      const alpha = (0.82 + 0.18 * progress).toFixed(3)
      el.style.background = isDark
        ? `rgba(6, 12, 26, ${alpha})`
        : `rgba(240, 244, 251, ${alpha})`
    }

    window.addEventListener("scroll", update, { passive: true })
    update()
    return () => window.removeEventListener("scroll", update)
  }, [])

  return (
    <>
      <HeroSection onNavigateContact={onNavigateContact} onNavigateAbout={onNavigateAbout} />

      <div className="projects-sheet" ref={sheetRef}>
        <div className="section">
          <div className="projects-hero">
            <div className="s-label anim-up">Portafolio seleccionado</div>

            <h2 className="s-title projects-title">
              <span className="p-title-word">
                <span className="p-title-word-inner">Proyectos</span>
              </span>
              {" "}
              <span className="p-title-word">
                <span className="p-title-word-inner">que</span>
              </span>
              <br />
              <span className="p-title-word">
                <span className="p-title-word-inner">me</span>
              </span>
              {" "}
              <span className="p-title-word">
                <span className="p-title-word-inner">definen</span>
              </span>
            </h2>

            <p className="projects-subtitle anim-up">
              Proceso visible. Impacto medible.
              <br />
              Cada número en estas tarjetas es verificable.
            </p>
          </div>

          <div className="projects-bento">
            {projects.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                variant={getBentoVariant(i)}
                index={i}
                onClick={() => onSelectProject(project)}
              />
            ))}
          </div>
        </div>

        <BrandsSection />
        <BlogPreviewSection />
      </div>
    </>
  )
}
