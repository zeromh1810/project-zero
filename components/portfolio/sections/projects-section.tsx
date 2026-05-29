"use client"

import { useState, useEffect } from "react"
import { PROJECTS, type Project } from "@/lib/data/projects"
import { ProjectCard } from "../project-card"
import { HeroSection } from "./hero-section"

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

  useEffect(() => {
    fetch("/api/admin/projects", { cache: "no-store" })
      .then(r => r.json())
      .then(d => { if (Array.isArray(d) && d.length) setProjects(d) })
      .catch(() => {})
  }, [])

  return (
    <>
      <HeroSection onNavigateContact={onNavigateContact} onNavigateAbout={onNavigateAbout} />

      <div className="projects-sheet">
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
      </div>
    </>
  )
}
