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

  // Blur progresivo al hacer scroll: mismo principio que el CodePen
  // (filter:blur en el contenido, no backdrop-filter en el panel encima).
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
