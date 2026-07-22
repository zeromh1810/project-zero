"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { useTheme } from "@/lib/context/theme-context"
import { buildHeroTerrain } from "@/lib/webgl/hero-terrain"
import { useScrollParallax } from "@/hooks/use-scroll-parallax"

// ─── Types ────────────────────────────────────────────────────────────────────

interface HeroData {
  titleLine1: string
  titleLine2: string
  titleLine3: string
  subtitle: string
}

interface SlideProject {
  id: number
  title: string
  category: string
  thumbnail: string
}

const DEFAULT: HeroData = {
  titleLine1: "Diseño",
  titleLine2: "experiencias",
  titleLine3: "digitales.",
  subtitle:
    "Product Designer & Frontend Developer. Cinco años creando productos que equilibran estética refinada con funcionalidad real.",
}

/**
 * Stack positions — index 0 = frente, 2 = fondo
 * Offsets más grandes (20/38px) para que la profundidad sea claramente legible.
 * Opacidades más agresivas para crear separación real entre planos.
 */
const DEPTH = [
  { x:  0, y:  0, s: 1.000, o: 1.00, z: 4 },
  { x: 20, y: 20, s: 0.940, o: 0.60, z: 3 },
  { x: 38, y: 38, s: 0.882, o: 0.32, z: 2 },
]

interface HeroSectionProps {
  onNavigateContact: () => void
  onNavigateAbout: () => void
}

// ═══════════════════════════════════════════════════════════════════════════════
// HeroSection
// ═══════════════════════════════════════════════════════════════════════════════

export function HeroSection({ onNavigateContact, onNavigateAbout }: HeroSectionProps) {
  const { darkRef } = useTheme()
  const terrainContainerRef = useRef<HTMLDivElement>(null)
  const terrainCleanupRef   = useRef<(() => void) | null>(null)
  const wrapRef             = useRef<HTMLDivElement>(null)
  const scrollHintRef  = useRef<HTMLDivElement>(null)

  const [hero,   setHero]   = useState<HeroData>(DEFAULT)
  const [slides, setSlides] = useState<SlideProject[]>([])

  useScrollParallax(wrapRef, 0.35)

  // ── Blur progresivo ──────────────────────────────────────────────────────────
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const onScroll = () => {
      const vh = window.innerHeight
      const p  = Math.max(0, Math.min(1, (window.scrollY - vh * 0.3) / (vh * 0.6)))
      el.style.filter = p > 0 ? `blur(${(p * 18).toFixed(1)}px)` : ""
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // ── Disolución escalonada al scroll ─────────────────────────────────────────
  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let active = false
    const t = setTimeout(() => { active = true }, 1500)
    const onScroll = () => {
      if (!active) return
      const vh     = window.innerHeight
      const titleEl = wrap.querySelector<HTMLElement>(".hero-title")
      const subEl   = wrap.querySelector<HTMLElement>(".hero-sub")
      const ctaEl   = wrap.querySelector<HTMLElement>(".hero-cta")
      if (ctaEl) {
        const p = Math.max(0, Math.min(1, (window.scrollY - vh * 0.10) / (vh * 0.35)))
        ctaEl.style.transform = `translateY(${8 * p}px) scale(${(1 - p * 0.06).toFixed(3)})`
        ctaEl.style.opacity   = `${Math.max(0, 1 - p * 1.5).toFixed(3)}`
      }
      if (subEl) {
        const p = Math.max(0, Math.min(1, (window.scrollY - vh * 0.20) / (vh * 0.35)))
        subEl.style.transform = `translateY(${14 * p}px)`
        subEl.style.opacity   = `${Math.max(0, 1 - p * 1.3).toFixed(3)}`
      }
      if (titleEl) {
        const p = Math.max(0, Math.min(1, (window.scrollY - vh * 0.15) / (vh * 0.45)))
        titleEl.style.transform = `translateY(${-36 * p}px)`
        titleEl.style.opacity   = `${Math.max(0, 1 - p * 0.8).toFixed(3)}`
      }
      if (window.scrollY < vh * 0.08) {
        if (titleEl) { titleEl.style.transform = ""; titleEl.style.opacity = "" }
        if (subEl)   { subEl.style.transform   = ""; subEl.style.opacity   = "" }
        if (ctaEl)   { ctaEl.style.transform   = ""; ctaEl.style.opacity   = "" }
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => { clearTimeout(t); window.removeEventListener("scroll", onScroll) }
  }, [])

  // ── Scroll hint ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const hint = scrollHintRef.current
    if (!hint) return
    const onScroll = () => hint.classList.toggle("scroll-hint--hidden", window.scrollY > 48)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // ── Data ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    let ignore = false
    fetch("/api/admin/hero", { cache: "no-store" })
      .then(r => r.json()).then(d => { if (!ignore) setHero({ ...DEFAULT, ...d }) }).catch(() => {})
    return () => { ignore = true }
  }, [])

  useEffect(() => {
    let ignore = false
    fetch("/api/admin/projects", { cache: "no-store" })
      .then(r => r.json())
      .then((d: SlideProject[]) => { if (!ignore) setSlides(d.filter(p => p.thumbnail).slice(0, 5)) })
      .catch(() => {})
    return () => { ignore = true }
  }, [])

  // ── WebGL hero terrain (isotipo hexagon) ─────────────────────────────────────
  useEffect(() => {
    const id = setTimeout(() => {
      if (!terrainContainerRef.current) return
      if (terrainCleanupRef.current) terrainCleanupRef.current()
      terrainCleanupRef.current = buildHeroTerrain(
        terrainContainerRef.current,
        () => darkRef.current
      )
    }, 80)
    return () => {
      clearTimeout(id)
      if (terrainCleanupRef.current) { terrainCleanupRef.current(); terrainCleanupRef.current = null }
    }
  }, [darkRef])

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="section-full">
      <div ref={terrainContainerRef} className="hero-terrain-container" aria-hidden="true" />

      <div className="hero-wrap hero-wrap--split" ref={wrapRef}>

        {/* ── LEFT: texto hero ─────────────────────────────────────────────── */}
        <div className="hero-left">
          <h1 className="hero-title">
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
            <div className="scroll-mouse"><div className="scroll-dot" /></div>
            <span className="scroll-label">Scroll</span>
          </div>
        </div>

        {/* ── RIGHT: galería stacked deck ──────────────────────────────────── */}
        <div className="hero-right">
          {slides.length > 0 && <DeckGallery slides={slides} />}
        </div>

      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// DeckGallery — Stacked Depth Deck
// ═══════════════════════════════════════════════════════════════════════════════

function DeckGallery({ slides }: { slides: SlideProject[] }) {
  const [order,  setOrder]  = useState(() => slides.map((_, i) => i))
  const cardRefs    = useRef<(HTMLDivElement | null)[]>([])
  const counterRef  = useRef<HTMLSpanElement>(null)
  const titleRef    = useRef<HTMLSpanElement>(null)
  const busy        = useRef(false)
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const galleryRef  = useRef<HTMLDivElement>(null)
  const tiltFrameRef = useRef<number>(0)

  const handleTiltMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    cancelAnimationFrame(tiltFrameRef.current)
    tiltFrameRef.current = requestAnimationFrame(() => {
      const el = galleryRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      el.style.transform = `perspective(1000px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`
      el.style.transition = "transform 80ms linear"
    })
  }, [])

  const handleTiltLeave = useCallback(() => {
    cancelAnimationFrame(tiltFrameRef.current)
    const el = galleryRef.current
    if (!el) return
    el.style.transition = "transform 600ms cubic-bezier(0.16, 1, 0.3, 1)"
    el.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)"
  }, [])

  // ── Deal ─────────────────────────────────────────────────────────────────────
  const deal = useCallback(() => {
    if (busy.current || slides.length < 2) return
    busy.current = true

    import("animejs/lib/anime.es.js").then(m => {
      const anime = (m.default ?? m) as any
      const frontIdx = order[0]
      const frontEl  = cardRefs.current[frontIdx]
      if (!frontEl) { busy.current = false; return }

      const tl = anime.timeline({})

      // Eyebrow counter sale
      tl.add({
        targets: [counterRef.current, titleRef.current].filter(Boolean),
        opacity: [1, 0],
        translateY: [0, -6],
        duration: 220,
        easing: "easeInCubic",
      })

      // Carta frontal sube y sale con leve rotación
      tl.add({
        targets: frontEl,
        translateY: [0, "-128%"],
        rotate:     [0, -5],
        opacity:    [1, 0],
        scale:      [1, 0.96],
        duration: 480,
        easing: "easeInExpo",
      }, 0)

      // Cartas traseras avanzan a sus nuevas posiciones
      order.slice(1).forEach((cardIdx, posIdx) => {
        const el   = cardRefs.current[cardIdx]
        const from = DEPTH[Math.min(posIdx + 1, DEPTH.length - 1)]
        const to   = DEPTH[Math.min(posIdx, DEPTH.length - 1)]
        if (!el) return
        tl.add({
          targets: el,
          translateX: [from.x, to.x],
          translateY: [from.y, to.y],
          scale:      [from.s, to.s],
          opacity:    [from.o, to.o],
          duration: 520,
          easing: "easeOutExpo",
        }, 120 + posIdx * 40)
      })

      // Eyebrow counter entra con nuevos valores
      tl.add({
        targets: [counterRef.current, titleRef.current].filter(Boolean),
        opacity: [0, 1],
        translateY: [6, 0],
        duration: 320,
        easing: "easeOutExpo",
        begin: () => setOrder(prev => [...prev.slice(1), prev[0]]),
      }, 540)

      setTimeout(() => {
        const pos = DEPTH[DEPTH.length - 1]
        if (frontEl) {
          frontEl.style.transform = `translateX(${pos.x}px) translateY(${pos.y}px) scale(${pos.s})`
          frontEl.style.opacity   = String(pos.o)
          frontEl.style.zIndex    = String(pos.z)
          frontEl.style.rotate    = "0deg"
        }
        busy.current = false
      }, 900)
    })
  }, [order, slides.length])

  // ── Auto-avance ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (slides.length < 2) return
    timerRef.current = setTimeout(deal, 4500)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [deal, slides.length])

  // ── Entrada escalonada ────────────────────────────────────────────────────────
  useEffect(() => {
    import("animejs/lib/anime.es.js").then(m => {
      const a = (m.default ?? m) as any
      order.slice(0, DEPTH.length).forEach((cardIdx, posIdx) => {
        const el  = cardRefs.current[cardIdx]
        const pos = DEPTH[posIdx]
        if (!el) return
        a({
          targets: el,
          opacity:    [0, pos.o],
          translateX: [pos.x + 28, pos.x],
          translateY: [pos.y + 18, pos.y],
          scale:      [pos.s * 0.90, pos.s],
          duration: 900,
          delay: 600 + posIdx * 130,
          easing: "easeOutExpo",
        })
      })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const frontIdx    = order[0]
  const frontProject = slides[frontIdx]

  return (
    <div className="deck-gallery" ref={galleryRef} onMouseMove={handleTiltMove} onMouseLeave={handleTiltLeave}>

      {/* ── Eyebrow: label + línea + contador ── */}
      <div className="deck-eyebrow">
        <span className="deck-eyebrow-label">Proyectos</span>
        <span className="deck-eyebrow-line" />
        <span ref={counterRef} className="deck-eyebrow-counter">
          {String(frontIdx + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </span>
      </div>

      {/* ── Stack de cartas ── */}
      <div className="deck-stage">
        {order.slice(0, DEPTH.length).map((cardIdx, posIdx) => {
          const p   = slides[cardIdx]
          const pos = DEPTH[posIdx]
          const isFront = posIdx === 0
          return (
            <div
              key={cardIdx}
              ref={el => { cardRefs.current[cardIdx] = el }}
              className={`deck-card${isFront ? " deck-card--front" : ""}`}
              style={{
                zIndex:    pos.z,
                opacity:   0,
                transform: `translateX(${pos.x}px) translateY(${pos.y}px) scale(${pos.s})`,
                cursor:    isFront ? "pointer" : "default",
              }}
              onClick={isFront ? deal : undefined}
              aria-label={isFront ? `Ver siguiente proyecto: ${slides[order[1]]?.title}` : undefined}
            >
              <img src={p.thumbnail} alt={p.title} className="deck-card-img" />

              {isFront && (
                <div className="deck-card-overlay">
                  <span className="deck-card-category">{p.category}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Meta: título activo + dots ── */}
      <div className="deck-meta">
        <span ref={titleRef} className="deck-meta-title">
          {frontProject?.title ?? ""}
        </span>
        <div className="deck-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`deck-dot${order[0] === i ? " deck-dot--active" : ""}`}
              onClick={() => !busy.current && order[0] !== i && deal()}
              aria-label={`Proyecto ${i + 1}`}
            />
          ))}
        </div>
      </div>

    </div>
  )
}
