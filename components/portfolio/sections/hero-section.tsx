"use client"

import { useRef, useEffect, useState } from "react"
import { useTheme } from "@/lib/context/theme-context"
import { buildDustField } from "@/lib/webgl/dust-field"
import { useScrollParallax } from "@/hooks/use-scroll-parallax"

interface HeroData {
  titleLine1: string
  titleLine2: string
  titleLine3: string
  subtitle: string
}

const DEFAULT: HeroData = {
  titleLine1: "Diseño",
  titleLine2: "experiencias",
  titleLine3: "digitales.",
  subtitle:
    "Product Designer & Frontend Developer. Cinco años creando productos que equilibran estética refinada con funcionalidad real.",
}

interface HeroSectionProps {
  onNavigateContact: () => void
  onNavigateAbout: () => void
}

export function HeroSection({ onNavigateContact, onNavigateAbout }: HeroSectionProps) {
  const { darkRef } = useTheme()
  const dustCanvasRef = useRef<HTMLCanvasElement>(null)
  const dustCleanupRef = useRef<(() => void) | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const scrollHintRef = useRef<HTMLDivElement>(null)
  const [hero, setHero] = useState<HeroData>(DEFAULT)

  // Pure-transform parallax — no opacity change
  useScrollParallax(wrapRef, 0.35)

  // ── Blur progresivo en el wrap ────────────────────────────────────────────
  // filter:blur en el contenido (no backdrop-filter en el panel encima).
  // Empieza al 30% del scroll y alcanza 18px al 90%.
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const onScroll = () => {
      const vh = window.innerHeight
      const progress = Math.max(0, Math.min(1, (window.scrollY - vh * 0.3) / (vh * 0.6)))
      el.style.filter = progress > 0 ? `blur(${(progress * 18).toFixed(1)}px)` : ""
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // ── Hero content dissolution ────────────────────────────────────────────
  // Cada elemento del hero sale con timing y dirección distintos:
  //   CTA     → fade+scale, sale primero  (10%–45% viewport scroll)
  //   Subtitle → deriva levemente abajo   (20%–55% viewport scroll)
  //   Title   → asciende hacia arriba     (15%–60% viewport scroll)
  // Se activa 1.5s post-mount para no conflictuar con las entrance animations.
  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let active = false
    const enableTimer = setTimeout(() => { active = true }, 1500)

    const onScroll = () => {
      if (!active) return
      const vh = window.innerHeight

      const titleEl = wrap.querySelector<HTMLElement>(".hero-title")
      const subEl   = wrap.querySelector<HTMLElement>(".hero-sub")
      const ctaEl   = wrap.querySelector<HTMLElement>(".hero-cta")

      // CTA exits first — sale rápido y pequeño
      if (ctaEl) {
        const p = Math.max(0, Math.min(1, (window.scrollY - vh * 0.10) / (vh * 0.35)))
        ctaEl.style.transform = `translateY(${8 * p}px) scale(${(1 - p * 0.06).toFixed(3)})`
        ctaEl.style.opacity   = `${Math.max(0, 1 - p * 1.5).toFixed(3)}`
      }

      // Subtitle drifts down slightly while fading
      if (subEl) {
        const p = Math.max(0, Math.min(1, (window.scrollY - vh * 0.20) / (vh * 0.35)))
        subEl.style.transform = `translateY(${14 * p}px)`
        subEl.style.opacity   = `${Math.max(0, 1 - p * 1.3).toFixed(3)}`
      }

      // Title ascends upward — the last to leave, most dramatic
      if (titleEl) {
        const p = Math.max(0, Math.min(1, (window.scrollY - vh * 0.15) / (vh * 0.45)))
        titleEl.style.transform = `translateY(${-36 * p}px)`
        titleEl.style.opacity   = `${Math.max(0, 1 - p * 0.8).toFixed(3)}`
      }

      // Reset inline styles when back at top (restores CSS animation fill-mode)
      if (window.scrollY < vh * 0.08) {
        if (titleEl) { titleEl.style.transform = ""; titleEl.style.opacity = "" }
        if (subEl)   { subEl.style.transform   = ""; subEl.style.opacity   = "" }
        if (ctaEl)   { ctaEl.style.transform   = ""; ctaEl.style.opacity   = "" }
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      clearTimeout(enableTimer)
      window.removeEventListener("scroll", onScroll)
    }
  }, [])

  // Scroll indicator fades when user starts scrolling
  useEffect(() => {
    const hint = scrollHintRef.current
    if (!hint) return
    const onScroll = () => {
      hint.classList.toggle("scroll-hint--hidden", window.scrollY > 48)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    fetch("/api/admin/hero", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setHero({ ...DEFAULT, ...d }))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const id = setTimeout(() => {
      if (!dustCanvasRef.current) return
      if (dustCleanupRef.current) dustCleanupRef.current()
      dustCleanupRef.current = buildDustField(dustCanvasRef.current, () => darkRef.current)
    }, 50)

    return () => {
      clearTimeout(id)
      if (dustCleanupRef.current) {
        dustCleanupRef.current()
        dustCleanupRef.current = null
      }
    }
  }, [darkRef])

  return (
    <div className="section-full">
      <canvas ref={dustCanvasRef} id="dust-canvas" aria-hidden="true" />

      <div className="hero-wrap" ref={wrapRef}>
        <h1 className="hero-title">
          {/* Each line lives inside an overflow:hidden mask — text rises from below the clip */}
          <span className="hero-line-wrap">
            <span className="hero-line-inner" style={{ animationDelay: "0.05s" }}>
              {hero.titleLine1}
            </span>
          </span>
          <br />
          <span className="hero-line-wrap">
            <span className="hero-line-inner" style={{ animationDelay: "0.18s" }}>
              <em>{hero.titleLine2}</em>
            </span>
          </span>
          <br />
          <span className="hero-line-wrap">
            <span className="hero-line-inner" style={{ animationDelay: "0.30s" }}>
              {hero.titleLine3}
            </span>
          </span>
        </h1>

        <p className="hero-sub">{hero.subtitle}</p>

        <div className="hero-cta">
          <button className="btn-p btn-magnetic" onClick={onNavigateContact}>
            Trabajemos juntos <span>→</span>
          </button>
          <button className="btn-g btn-magnetic" onClick={onNavigateAbout}>
            Sobre mí
          </button>
        </div>

        <div className="scroll-hint" ref={scrollHintRef} aria-hidden="true">
          <div className="scroll-mouse">
            <div className="scroll-dot" />
          </div>
          <span className="scroll-label">Scroll</span>
        </div>

      </div>
    </div>
  )
}
