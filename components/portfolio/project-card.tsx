"use client"

import { useRef, useCallback } from "react"
import { useTheme } from "@/lib/context/theme-context"
import type { Project } from "@/lib/data/projects"

interface ProjectCardProps {
  project: Project
  onClick: () => void
  variant?: "featured" | "compact"
  index: number
}

export function ProjectCard({ project, onClick, variant = "featured", index }: ProjectCardProps) {
  const { isDark } = useTheme()
  const cardRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<number>(0)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(() => {
      const card = cardRef.current
      if (!card) return
      const rect = card.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      const intensity = variant === "featured" ? 6 : 8
      card.style.transform = `perspective(900px) rotateX(${-y * intensity}deg) rotateY(${x * intensity}deg) translateZ(10px) scale(1.015)`
      card.style.transition = "transform 80ms linear"
    })
  }, [variant])

  const handleMouseLeave = useCallback(() => {
    cancelAnimationFrame(frameRef.current)
    const card = cardRef.current
    if (!card) return
    card.style.transition = "transform 550ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 400ms ease, opacity 0.65s cubic-bezier(0.16,1,0.3,1)"
    card.style.transform = ""
  }, [])

  const num = String(index + 1).padStart(2, "0")

  return (
    <div
      ref={cardRef}
      className={`p-card p-card--${variant}`}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      aria-label={`Ver proyecto: ${project.title}`}
    >
      {/* Background gradient */}
      <div
        className="p-card-bg"
        style={{ background: isDark ? project.gradient : project.lightGradient }}
      />

      {/* Thumbnail */}
      {project.thumbnail && (
        <>
          <img
            src={project.thumbnail}
            alt={project.title}
            className="p-card-thumb"
          />
          <div className="p-card-thumb-overlay" />
        </>
      )}

      {/* Project index number */}
      <span className="p-card-num" aria-hidden="true">{num}</span>

      {/* Stat badge */}
      <span className="p-stat p-stat--animated">{project.stat}</span>

      {/* Card bottom info */}
      <div className="p-card-info">
        <div className="p-cat">{project.category}</div>
        <div className="p-name">{project.title}</div>

        {variant === "featured" && (
          <>
            <p className="p-desc">{project.desc}</p>
            <div className="p-meta">
              <span className="p-year">{project.year}</span>
              <span className="p-cta-hint">Ver caso <span aria-hidden="true">→</span></span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
