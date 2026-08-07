"use client"

import { useRef, useEffect, useState } from "react"
import { useTheme } from "@/lib/context/theme-context"
import { buildHeroTerrain } from "@/lib/webgl/hero-terrain"
import SplitText from "../split-text"
import { RichText } from "../rich-text"

// ─── Types ────────────────────────────────────────────────────────────────────

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

// Las animaciones de entrada (.hero-sub, .hero-cta, .hero-portrait) usan
// animation-fill-mode:forwards para no "saltar" al estado final apenas
// termina de jugar la animación — pero ese mismo forwards le sigue ganando
// la cascada a cualquier estilo inline que el scroll escriba después
// (opacity/transform quedan pegados al valor final de la animación para
// siempre, aunque el JS de scroll escriba otra cosa: el elemento nunca se
// desvanece ni se mueve visualmente). Por eso hay que liberar la animación
// apenas termina de jugar.
//
// El bug real estaba en CÓMO se liberaba: poner solo `animation:none` saca
// la animación de la cascada, pero esa misma regla declara `opacity:0`
// como valor BASE (fuera del keyframe) — sin la animación pisándolo, el
// elemento vuelve exactamente a ese opacity:0 de golpe, y como el scroll
// todavía no escribió nada (usuario recién recargó y no hizo scroll), se
// queda invisible para siempre. Por eso "cargan y después desaparecen".
// Fix: al liberar, fijar explícitamente el estado final visible (mismo
// valor al que ya había llegado el keyframe) ANTES de sacar la animación,
// para que la cascada tenga algo visible de dónde partir hasta que el
// scroll tome el control.
function releaseEntranceAnimation(e: React.AnimationEvent<HTMLElement>) {
  const el = e.currentTarget
  el.style.opacity   = "1"
  el.style.transform = "none"
  el.style.filter    = "none"
  el.style.animation = "none"
}

export function HeroSection({ onNavigateContact, onNavigateAbout }: HeroSectionProps) {
  const { darkRef } = useTheme()
  const terrainContainerRef = useRef<HTMLDivElement>(null)
  const terrainCleanupRef   = useRef<(() => void) | null>(null)
  const wrapRef             = useRef<HTMLDivElement>(null)
  const portraitRef         = useRef<HTMLDivElement>(null)
  const scrollHintRef  = useRef<HTMLDivElement>(null)

  const [hero, setHero] = useState<HeroData>(DEFAULT)
  // El título es editable desde /admin y llega vía fetch después del mount
  // — sin esto, SplitText animaría primero el texto DEFAULT de placeholder
  // y, apenas resuelva el fetch, se vería un segundo "flash" de entrada con
  // el texto real. Esperamos a que el fetch resuelva (éxito o error) para
  // recién ahí montar el SplitText, así anima una sola vez con el texto
  // definitivo.
  const [heroLoaded, setHeroLoaded] = useState(false)

  // ── Scroll: parallax + disolución, todo en un solo listener con rAF ────────
  // Antes eran 4 listeners de scroll independientes (parallax de texto,
  // parallax+disolución del retrato, blur de texto/terreno, disolución
  // escalonada de título/sub/cta), cada uno leyendo/escribiendo el DOM por su
  // cuenta en cada evento — encolados acá en un solo rAF para que la
  // transición no se sienta a los tirones (menos layout thrashing).
  // El parallax base del texto corre siempre, igual que antes; el resto de
  // la disolución espera ~1.65s (cubre el delay+duración más largo entre
  // .hero-sub/.hero-cta/.hero-portrait) para no pelear visualmente con sus
  // animaciones de entrada — ver releaseEntranceAnimation arriba, que las
  // libera de animation-fill-mode:forwards apenas terminan de jugar.
  useEffect(() => {
    const wrap     = wrapRef.current
    const portrait = portraitRef.current
    const terrain  = terrainContainerRef.current
    const hint     = scrollHintRef.current
    if (!wrap) return

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let active = false
    // Al activar, vuelve a evaluar la posición de scroll actual: si el
    // usuario ya scrolleó durante los primeros 1.65s (antes de que esto
    // corriera), el estado de disolución quedaría "colgado" en el valor de
    // la entrada hasta el próximo evento de scroll si no se fuerza acá.
    const activateTimer = reduced ? null : setTimeout(() => { active = true; apply() }, 1650)

    let rafId = 0
    const apply = () => {
      rafId = 0
      const y  = window.scrollY
      const vh = window.innerHeight

      if (hint) hint.classList.toggle("scroll-hint--hidden", y > 48)
      if (reduced) return

      // Parallax base del bloque de texto
      wrap.style.transform = `translateY(${(y * 0.35).toFixed(1)}px)`

      if (!active) return

      // Blur progresivo — texto + terreno, misma curva. El terreno además
      // funde a 0 (no solo desenfoca) para que desaparezca limpio antes de
      // que el projects-sheet lo tape del todo, en vez de quedar como un
      // resplandor difuso detrás del sheet semitransparente.
      // IMPORTANTE: esto va en .hero-left, NO en .hero-wrap — .hero-portrait
      // vive dentro de .hero-wrap (para compartir su contenedor centrado con
      // el texto), y filter en CSS blurea visualmente a TODOS los
      // descendientes del elemento que lo tiene. Ponerlo en .hero-wrap
      // hacía que el retrato recibiera este blur MÁS el suyo propio (más
      // abajo) sumados — hasta ~32px en vez de los 14px diseñados.
      // blur(0px), no "" — un string vacío LIMPIA el inline y deja que la
      // cascada decida, y si el elemento tiene un filter/opacity BASE
      // declarado en su regla CSS (como .hero-portrait, más abajo: su
      // filter:blur(10px) es el estado "antes de la animación de entrada"),
      // la cascada cae ahí en vez de en "sin blur". Mismo bug que ya
      // habíamos visto con opacity — acá aplica a filter, y por eso el
      // blur "se activaba solo": bastaba con volver a pp/pBlur=0 para que
      // el "" revelara el blur(10px) base del retrato.
      const heroLeft = wrap.querySelector<HTMLElement>(".hero-left")
      const pBlur = Math.max(0, Math.min(1, (y - vh * 0.3) / (vh * 0.6)))
      const blur  = `blur(${(pBlur * 18).toFixed(1)}px)`
      if (heroLeft) heroLeft.style.filter = blur
      if (terrain) {
        terrain.style.filter  = blur
        terrain.style.opacity = `${(1 - pBlur).toFixed(3)}`
      }

      // Disolución escalonada del texto — cta primero, luego sub. El título
      // ya no participa: su animación de entrada ahora es el SplitText
      // (ver JSX más abajo), y no queremos que el scroll le pise ese efecto
      // con otra transición encima.
      const subEl   = wrap.querySelector<HTMLElement>(".hero-sub")
      const ctaEl   = wrap.querySelector<HTMLElement>(".hero-cta")
      if (ctaEl) {
        const p = Math.max(0, Math.min(1, (y - vh * 0.10) / (vh * 0.35)))
        ctaEl.style.transform = `translateY(${8 * p}px) scale(${(1 - p * 0.06).toFixed(3)})`
        ctaEl.style.opacity   = `${Math.max(0, 1 - p * 1.5).toFixed(3)}`
      }
      if (subEl) {
        const p = Math.max(0, Math.min(1, (y - vh * 0.20) / (vh * 0.35)))
        subEl.style.transform = `translateY(${14 * p}px)`
        subEl.style.opacity   = `${Math.max(0, 1 - p * 1.3).toFixed(3)}`
      }

      // Retrato — su propia curva (más rápida que el 0.35 del texto, para que
      // la figura "cruce" el texto en vez de moverse pegada a él) + disolución
      // sincronizada con la misma ventana que el resto.
      if (portrait) {
        const py = Math.min(y * 0.5, 220)
        const pp = Math.max(0, Math.min(1, (y - vh * 0.15) / (vh * 0.5)))
        portrait.style.transform = `translateY(${(-py).toFixed(1)}px) scale(${(1 - pp * 0.05).toFixed(3)})`
        portrait.style.opacity   = `${Math.max(0, 1 - pp * 1.1).toFixed(3)}`
        portrait.style.filter    = `blur(${(pp * 14).toFixed(1)}px)`
      }
      // Nota: no hace falta un "reset cerca del tope" — los clamps de arriba
      // (Math.max(0, ...)) ya devuelven exactamente p=0 en y=0, así que las
      // fórmulas SIEMPRE escriben el valor de reposo correcto (opacity:1,
      // transform:none) de forma explícita. Un reset a "" (como había antes)
      // no es más prolijo, es PEOR: borra el valor ya calculado y deja que
      // la cascada decida — y para .hero-sub/.hero-cta/.hero-portrait esa
      // cascada cae en el opacity:0 base de su regla CSS una vez que
      // releaseEntranceAnimation ya fijó animation:none, dejándolos
      // invisibles para siempre. Ese era justamente el bug: al volver cerca
      // del tope, ese reset "apagaba" todo salvo el título (que nunca tuvo
      // opacity:0 propio ni animación en sí mismo).
    }

    const onScroll = () => {
      if (rafId) return
      rafId = requestAnimationFrame(apply)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    apply()
    return () => {
      if (activateTimer) clearTimeout(activateTimer)
      if (rafId) cancelAnimationFrame(rafId)
      window.removeEventListener("scroll", onScroll)
    }
  }, [])

  // ── Data ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    let ignore = false
    fetch("/api/admin/hero", { cache: "no-store" })
      .then(r => r.json()).then(d => { if (!ignore) setHero({ ...DEFAULT, ...d }) }).catch(() => {})
      .finally(() => { if (!ignore) setHeroLoaded(true) })
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

      <div className="hero-wrap hero-wrap--portrait" ref={wrapRef}>

        {/* ── LEFT: texto hero ─────────────────────────────────────────────── */}
        <div className="hero-left">
          <h1 className="hero-title">
            {heroLoaded ? (
              // Sin ScrollTrigger ni ninguna dependencia de la posición de
              // scroll a propósito: el título siempre está visible al
              // cargar (above the fold), nunca debería depender del scroll
              // para decidir si animar. La versión anterior (gsap/SplitText
              // + ScrollTrigger) sí dependía de eso y causó un bug real en
              // producción — el texto quedaba invisible para siempre si el
              // componente se remontaba con la página ya scrolleada (pasa
              // al volver del detalle de un proyecto). Esta versión en CSS
              // puro anima apenas se monta, sin ese riesgo, y de paso saca
              // del bundle ~130KB comprimidos de gsap que solo se usaban acá.
              <>
                <SplitText tag="span" text={hero.titleLine1} className="hero-title-line" />
                <br />
                <SplitText tag="span" text={hero.titleLine2} className="hero-title-line hero-title-line--accent" />
                <br />
                <SplitText tag="span" text={hero.titleLine3} className="hero-title-line" />
              </>
            ) : (
              // Placeholder estático (sin animar) mientras /api/admin/hero
              // resuelve — ver comentario de heroLoaded arriba. Misma
              // estructura que el resultado final para no saltar de layout,
              // pero invisible: son valores DEFAULT hardcodeados, no el
              // título real, así que no deben llegar a verse — solo ocupan
              // el espacio hasta que heroLoaded confirma el texto definitivo.
              <span style={{ visibility: "hidden" }}>
                <span className="hero-title-line">{hero.titleLine1}</span>
                <br />
                <span className="hero-title-line hero-title-line--accent">{hero.titleLine2}</span>
                <br />
                <span className="hero-title-line">{hero.titleLine3}</span>
              </span>
            )}
          </h1>

          <RichText text={hero.subtitle} className="hero-sub" onAnimationEnd={releaseEntranceAnimation} />

          <div className="hero-cta" onAnimationEnd={releaseEntranceAnimation}>
            <button className="btn-p btn-magnetic" onClick={onNavigateContact}>
              Trabajemos juntos <span>→</span>
            </button>
            <button className="btn-g btn-magnetic" onClick={onNavigateAbout}>
              Sobre mí
            </button>
          </div>
        </div>

        {/* ── Retrato — dentro de .hero-wrap para compartir su mismo
            contenedor centrado con el texto (ver comentario en el CSS).
            .hero-portrait: entrada + parallax de scroll (ref, vía JS).
            .hero-portrait-float: loop idle independiente (puro CSS) para
            que el personaje se sienta "vivo" sin pelear con las
            transformaciones de scroll del div padre ──────────────────── */}
        <div className="hero-portrait" ref={portraitRef} onAnimationEnd={releaseEntranceAnimation}>
          <div className="hero-portrait-float">
            <img
              src="/hero-carlos.png"
              alt="Carlos Felipe Rojas Hickmann"
              className="hero-portrait-img"
              draggable={false}
              loading="lazy"
            />
          </div>
        </div>

        {/* ── scroll-hint: hermano directo de .hero-wrap (no de .hero-left)
            a propósito — ver comentario de z-index en .hero-left en el CSS,
            si viviera dentro de .hero-left heredaría su containing block y
            "bottom:40px" dejaría de anclarse al fondo real del viewport. ── */}
        <div className="scroll-hint" ref={scrollHintRef} aria-hidden="true">
          <div className="scroll-mouse"><div className="scroll-dot" /></div>
          <span className="scroll-label">Scroll</span>
        </div>
      </div>
    </div>
  )
}
