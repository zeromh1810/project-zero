"use client"

import { useRef, useCallback } from "react"
import { ArrowRightIcon } from "./icons"
import { useTheme } from "@/lib/context/theme-context"
import type { Project } from "@/lib/data/projects"
import { CountUp } from "./count-up"

interface ProjectCardProps {
  project: Project
  onClick: () => void
  variant?: "featured" | "compact"
  index: number
}

// Predicts the detail page's .detail-hero-image rect from the current
// viewport width alone, before that page even exists in the DOM — mirrors
// .detail-main / .detail-content's actual CSS at each of its FOUR
// breakpoints (styles/portfolio.css) instead of assuming the image sits
// centered on the whole viewport, which is off by hundreds of px at wide
// viewports once the sidebar column and the centered, capped .detail-main
// enter the math. Verified against the real measured rect at 2560px
// (ultra-wide tier): predicted and actual matched exactly once this tier
// was accounted for — before, this tier alone was off by ~70px. Vertical
// position isn't predictable this way (it depends on the title's wrapped
// line count), so top stays a fixed guess — the post-mount measurement in
// project-detail-view.tsx corrects both axes against the real element once
// it exists; this just gets the pre-nav growth animation landing close
// enough that the correction is barely visible instead of a second jump.
function predictHeroRect(vw: number) {
  let left: number
  let width: number

  if (vw <= 640) {
    left  = 16
    width = vw - 32
  } else if (vw <= 1024) {
    left  = 24
    width = vw - 48
  } else if (vw <= 1920) {
    const containerWidth  = Math.min(vw, 1280)
    const containerLeft   = Math.max(0, (vw - containerWidth) / 2)
    const contentColWidth = containerWidth - 32 * 2 - 48 - 320 // padding, gap, sidebar
    left  = containerLeft + 32
    width = Math.min(720, contentColWidth)
  } else {
    // Ultra-wide (≥1921px): .detail-main max-width 1480px, sidebar 400px,
    // gap 64px, padding 56px 64px 96px.
    const containerWidth  = Math.min(vw, 1480)
    const containerLeft   = Math.max(0, (vw - containerWidth) / 2)
    const contentColWidth = containerWidth - 64 * 2 - 64 - 400
    left  = containerLeft + 64
    width = Math.min(720, contentColWidth)
  }

  return { left, width, height: width * (10 / 16) }
}

export function ProjectCard({ project, onClick, variant = "featured", index }: ProjectCardProps) {
  const { isDark } = useTheme()
  const cardRef = useRef<HTMLAnchorElement>(null)
  const thumbRef = useRef<HTMLImageElement>(null)
  const frameRef = useRef<number>(0)

  // Manual "morph" instead of the native View Transitions API: that API's
  // update callback needs the DOM to settle synchronously, but Next's
  // App Router navigation to a force-dynamic route is asynchronous, so it
  // reliably threw "InvalidStateError: Transition was aborted". This clones
  // the clicked thumbnail into a fixed-position element that survives the
  // route change (it's appended to <body>, outside the React tree that
  // unmounts), grows it toward the detail page's hero-image footprint, then
  // hands off to the real content once project-detail-view.tsx mounts
  // (see its cleanup effect) — same "image takes over" feel, no API to fight.
  // Es un <a href> real: Ctrl/Cmd/Shift/middle-click y "abrir en pestaña
  // nueva" se dejan al navegador. Solo el click primario sin modificadores
  // se intercepta para hacer el morph antes de navegar.
  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced || !thumbRef.current || !project.thumbnail) {
      onClick()
      return
    }

    const thumb = thumbRef.current
    const rect = thumb.getBoundingClientRect()
    const radius = getComputedStyle(thumb).borderRadius

    // Backdrop fades in (var(--bg), theme-aware) behind the growing clone
    // so the detail page's background is already settling in while the
    // image rises, instead of the clone reading as floating over the old
    // grid until the hard cut. Sits just under the clone in z-index.
    const backdrop = document.createElement("div")
    backdrop.id = "project-morph-backdrop"
    backdrop.style.cssText = `
      position: fixed;
      inset: 0;
      background: var(--bg);
      opacity: 0;
      z-index: 9998;
      pointer-events: none;
      transition: opacity 480ms cubic-bezier(0.16, 1, 0.3, 1);
    `
    document.body.appendChild(backdrop)

    const clone = document.createElement("img")
    clone.src = project.thumbnail
    clone.id = "project-morph-clone"
    clone.style.cssText = `
      position: fixed;
      top: 0; left: 0;
      width: ${rect.width}px; height: ${rect.height}px;
      transform: translate(${rect.left}px, ${rect.top}px);
      object-fit: cover;
      border-radius: ${radius};
      z-index: 9999;
      pointer-events: none;
      will-change: transform, width, height, border-radius;
      transition: transform 480ms cubic-bezier(0.16, 1, 0.3, 1),
                  width 480ms cubic-bezier(0.16, 1, 0.3, 1),
                  height 480ms cubic-bezier(0.16, 1, 0.3, 1),
                  border-radius 480ms cubic-bezier(0.16, 1, 0.3, 1);
    `
    document.body.appendChild(clone)

    const target = predictHeroRect(window.innerWidth)
    const targetTop = 460

    requestAnimationFrame(() => {
      clone.style.width         = `${target.width}px`
      clone.style.height        = `${target.height}px`
      clone.style.transform     = `translate(${target.left}px, ${targetTop}px)`
      clone.style.borderRadius  = "20px"
      backdrop.style.opacity    = "1"
    })

    window.setTimeout(onClick, 480)
  }, [onClick, project.thumbnail])

  // Tilt solo con mouse/trackpad real y sin reduced-motion: en touch los
  // eventos de mouse emulados lo dejaban torcido tras el tap. v2.0.0: 4° (antes
  // 6–8°) y sin scale extra — el zoom del thumbnail ya comunica el hover;
  // apilar tilt + scale + zoom + doble sombra era ruido.
  const canTilt = useCallback(() =>
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!canTilt()) return
    cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(() => {
      const card = cardRef.current
      if (!card) return
      const rect = card.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      const intensity = 4
      // Solo variables: el transform lo compone .p-card.visible en el CSS
      // (así :active puede sumar el scale de presión encima del tilt).
      card.style.setProperty("--rx", `${(-y * intensity).toFixed(2)}deg`)
      card.style.setProperty("--ry", `${(x * intensity).toFixed(2)}deg`)
      card.style.transition = "transform 80ms linear, filter var(--dur-hover) var(--ease-standard)"
    })
  }, [canTilt])

  const handleMouseLeave = useCallback(() => {
    cancelAnimationFrame(frameRef.current)
    const card = cardRef.current
    if (!card) return
    if (!card.style.getPropertyValue("--rx")) return
    card.style.transition = "transform 550ms var(--ease-out), filter var(--dur-hover) var(--ease-standard)"
    card.style.setProperty("--rx", "0deg")
    card.style.setProperty("--ry", "0deg")
    // Al terminar el retorno se suelta el transition inline: vuelven a regir
    // los tiempos del CSS (incluido el press de :active).
    window.setTimeout(() => {
      if (card.style.getPropertyValue("--rx") === "0deg") card.style.transition = ""
    }, 600)
  }, [])

  const num = String(index + 1).padStart(2, "0")

  return (
    <a
      ref={cardRef}
      href={`/projects/${project.id}`}
      className={`p-card p-card--${variant}`}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-label={`Ver proyecto: ${project.title}`}
    >
      {/* Background gradient */}
      <div
        className="p-card-bg"
        style={{ background: isDark ? project.gradient : project.lightGradient }}
      />

      {/* Thumbnail — o, si el proyecto no tiene, un estado vacío diseñado
          (UI-10): el número del proyecto en grande, en trazo, sobre su
          propio gradiente. El overlay inferior va siempre: sin él, el texto
          blanco quedaba sobre el gradiente claro y casi no se leía. */}
      {project.thumbnail ? (
        <img
          ref={thumbRef}
          src={project.thumbnail}
          alt=""
          className="p-card-thumb"
          loading="lazy"
        />
      ) : (
        <div className="p-card-empty" aria-hidden="true">
          <span className="p-card-empty-num">{num}</span>
        </div>
      )}
      <div className="p-card-thumb-overlay" />

      {/* Project index number */}
      <span className="p-card-num" aria-hidden="true">{num}</span>

      {/* Stat badge */}
      <span className="p-stat p-stat--animated"><CountUp text={project.stat} /></span>

      {/* Card bottom info */}
      <div className="p-card-info">
        <div className="p-cat">{project.category}</div>
        <div className="p-name">{project.title}</div>

        {variant === "featured" && (
          <>
            <p className="p-desc">{project.desc}</p>
            <div className="p-meta">
              <span className="p-year">{project.year}</span>
              <span className="p-cta-hint">Ver caso <ArrowRightIcon className="btn-arrow" /></span>
            </div>
          </>
        )}
      </div>
    </a>
  )
}
