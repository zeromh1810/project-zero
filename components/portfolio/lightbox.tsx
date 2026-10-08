"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { flushSync } from "react-dom"
import * as Dialog from "@radix-ui/react-dialog"
import { tokenMs } from "@/lib/motion"
import { GalleryPlaceholder, type GalleryItem } from "./gallery-placeholder"

/* ═══════════════════════════════════════════════════════════════════════════
   Lightbox — visor de la galería del detalle (Zero design system v2.2.0)

   - Abre desde la miniatura: la imagen crece desde su rect (FLIP con
     clip-path, así el recorte "cover" de la miniatura se abre hasta la
     imagen completa sin deformarse) y al cerrar vuelve a la miniatura de la
     imagen que estás viendo, no a la que abriste.
   - Cambio de imagen como carrusel: la actual sale de pantalla hacia un lado
     y la siguiente entra pegada a ella desde el otro, moviéndose juntas
     (continuidad espacial). Van lado a lado con un hueco, nunca superpuestas.
     El arrastre usa la misma pista: la vecina asoma desde el borde y sigue
     al dedo. Con movimiento reducido es un fundido sin superposición.
   - Todo es interrumpible: cada navegación o arrastre cancela la animación
     en curso y parte desde donde quedó (el estado nunca depende de
     animationend).
   - Gestos con alternativa visible: arrastre horizontal = anterior/siguiente
     (botones y miniaturas hacen lo mismo); arrastre hacia abajo = cerrar
     (botón ×, Esc y tocar fuera de la imagen hacen lo mismo).
   - Tiempos, curvas y distancias salen de los tokens (--dur-*, --ease-*,
     --lightbox-*); con movimiento reducido solo hay fundidos.
   ═══════════════════════════════════════════════════════════════════════════ */

interface LightboxProps {
  items: GalleryItem[]
  startIndex: number
  /** Título del proyecto: nombra el diálogo y el texto alternativo. */
  title: string
  /** Miniatura de la grilla para el índice dado: origen y destino del morph. */
  getOrigin: (index: number) => HTMLElement | null
  onClose: () => void
}

type Dir = 1 | -1

const PEEK_KEY = "pz-lightbox-peek"

function readTokens() {
  const cs = getComputedStyle(document.documentElement)
  const num = (name: string, fallback: number) => parseFloat(cs.getPropertyValue(name)) || fallback
  const str = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback
  // Duraciones con el lector compartido del DS: el CSS minificado las sirve en
  // segundos (`.42s`), y parseFloat a secas las dejaba en 0.42ms (instantáneas).
  const ms = tokenMs
  return {
    enter: ms("--dur-enter", 240),
    exit: ms("--dur-exit", 160),
    reveal: ms("--dur-reveal", 480),
    exitLg: ms("--dur-exit-lg", 320),
    easeOut: str("--ease-out", "cubic-bezier(0.16, 1, 0.3, 1)"),
    easeIn: str("--ease-in", "cubic-bezier(0.7, 0, 0.84, 0)"),
    easeStandard: str("--ease-standard", "cubic-bezier(0.25, 0.46, 0.45, 0.94)"),
    slide: ms("--lightbox-slide-duration", 420),
    slideGap: num("--lightbox-slide-gap", 48),
    swipe: num("--lightbox-swipe-distance", 60),
    dismiss: num("--lightbox-dismiss-distance", 120),
    flick: num("--lightbox-flick-velocity", 0.45),
    peek: num("--lightbox-peek-distance", 28),
    peekDuration: ms("--lightbox-peek-duration", 640),
    peekDelay: ms("--lightbox-peek-delay", 240),
  }
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

/** Corre una animación y deja su estado final como estilo inline.
 *  Resuelve false si otra animación la canceló antes de terminar.
 *  Regla del DS: el estado no depende del fin de la animación — un timer con
 *  la duración del token la cierra si `finished` no llega (pestaña en segundo
 *  plano, frames congelados). */
function play(el: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions): Promise<boolean> {
  const anim = el.animate(keyframes, { ...options, fill: "forwards" })
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      if (anim.playState === "running") anim.finish()
    }, Number(options.duration ?? 0) + Number(options.delay ?? 0) + 50)
    anim.finished.then(
      () => {
        clearTimeout(timer)
        try { anim.commitStyles() } catch { /* nodo ya desmontado */ }
        anim.cancel()
        resolve(true)
      },
      () => { clearTimeout(timer); resolve(false) },
    )
  })
}

/** Congela el estado visual actual (aunque haya una animación a medias)
 *  como estilo inline y cancela lo que estuviera corriendo. */
function freeze(el: HTMLElement) {
  const cs = getComputedStyle(el)
  const state = { transform: cs.transform, opacity: cs.opacity }
  el.getAnimations().forEach((a) => a.cancel())
  el.style.transform = state.transform === "none" ? "" : state.transform
  el.style.opacity = state.opacity
  el.style.clipPath = ""
  return state
}

/** Espera a que la imagen tenga tamaño (para medir el morph y no mostrarla a
 *  medio cargar). Por eventos y con tope: `decode()` puede no resolver nunca
 *  en una pestaña en segundo plano. */
function ready(el: HTMLElement): Promise<void> {
  if (!(el instanceof HTMLImageElement) || (el.complete && el.naturalWidth > 0)) return Promise.resolve()
  return new Promise((resolve) => {
    const done = () => { clearTimeout(timer); resolve() }
    const timer = setTimeout(done, 3000)
    el.addEventListener("load", done, { once: true })
    el.addEventListener("error", done, { once: true })
  })
}

const inViewport = (r: DOMRect) =>
  r.width > 0 && r.bottom > 0 && r.right > 0 && r.top < window.innerHeight && r.left < window.innerWidth

/** Transformación + recorte que hacen que `frame` (en su rect final, sin
 *  transformar) se vea exactamente como la miniatura `origin` (object-fit:
 *  cover, centrada, con su radio). */
function morphFrom(frame: DOMRect, origin: DOMRect, originRadius: number) {
  const scale = Math.max(origin.width / frame.width, origin.height / frame.height)
  const insetX = (frame.width - origin.width / scale) / 2
  const insetY = (frame.height - origin.height / scale) / 2
  const dx = origin.left + origin.width / 2 - (frame.left + frame.width / 2)
  const dy = origin.top + origin.height / 2 - (frame.top + frame.height / 2)
  return {
    transform: `translate(${dx}px, ${dy}px) scale(${scale})`,
    clipPath: `inset(${insetY}px ${insetX}px round ${originRadius / scale}px)`,
  }
}

const radiusOf = (el: Element) => parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0
const pad = (n: number) => String(n).padStart(2, "0")

export function Lightbox({ items, startIndex, title, getOrigin, onClose }: LightboxProps) {
  const count = items.length
  // `index` es la imagen en pantalla; `active` es a dónde vamos (la tira de
  // miniaturas responde al instante aunque la imagen siga en transición).
  const [index, setIndex] = useState(startIndex)
  const [active, setActive] = useState(startIndex)
  const [closing, setClosing] = useState(false)

  const rootRef = useRef<HTMLDivElement | null>(null)
  const scrimRef = useRef<HTMLDivElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  // Frames montados por índice: el actual y, durante un cambio o un
  // arrastre, la vecina que entra (`incoming`).
  const nodesRef = useRef(new Map<number, HTMLElement>())
  const [incoming, setIncoming] = useState<number | null>(null)
  const incomingRef = useRef<number | null>(null)
  const pendingRef = useRef<number | null>(null)
  const indexRef = useRef(startIndex)
  const targetRef = useRef(startIndex)
  const runRef = useRef(0)
  const openedRef = useRef(false)
  const closingRef = useRef(false)
  const dragRef = useRef<{
    id: number; x0: number; y0: number; axis: "x" | "y" | null
    dx: number; dy: number; lastX: number; lastY: number; lastT: number; vx: number; vy: number
  } | null>(null)

  const item = items[index]

  const frameEl = () => nodesRef.current.get(indexRef.current) ?? null
  const incomingEl = () => (incomingRef.current === null ? null : nodesRef.current.get(incomingRef.current) ?? null)
  const setNode = (i: number) => (node: HTMLElement | null) => {
    if (node) nodesRef.current.set(i, node)
    else nodesRef.current.delete(i)
  }
  const wrap = (i: number) => ((i % count) + count) % count
  const xOf = (el: HTMLElement) => {
    const tf = getComputedStyle(el).transform
    return tf === "none" ? 0 : new DOMMatrixReadOnly(tf).m41
  }
  /** Separación entre los centros de dos imágenes vecinas en la pista: la que
   *  sale termina fuera del escenario y nunca se tocan (hueco = slide-gap). */
  const slideDistance = (a: HTMLElement | null, b: HTMLElement | null, gap: number) => {
    const stageW = stageRef.current?.clientWidth ?? window.innerWidth
    return stageW / 2 + Math.max(a?.offsetWidth ?? 0, b?.offsetWidth ?? 0) / 2 + gap
  }

  /** Monta la vecina `i` del lado `dir`, ya fuera de pantalla (antes de pintar). */
  const mountIncoming = (i: number, dir: Dir) => {
    incomingRef.current = i
    flushSync(() => setIncoming(i))
    const el = incomingEl()
    if (!el) return
    el.getAnimations().forEach((a) => a.cancel())
    el.style.opacity = ""
    el.style.clipPath = ""
    el.style.transform = `translateX(${dir * slideDistance(frameEl(), el, readTokens().slideGap)}px)`
  }

  const unmountIncoming = () => {
    incomingRef.current = null
    flushSync(() => setIncoming(null))
  }

  /** La vecina pasa a ser la actual (mismo nodo: no hay parpadeo). */
  const commit = (to: number) => {
    pendingRef.current = null
    indexRef.current = to
    incomingRef.current = null
    flushSync(() => { setIndex(to); setIncoming(null) })
    const el = frameEl()
    if (el) {
      el.getAnimations().forEach((a) => a.cancel())
      el.style.transform = ""
      el.style.opacity = ""
    }
  }

  /** Interrumpir = llevar al final lo que esté en curso, al instante. */
  const settle = () => {
    if (incomingRef.current === null) return
    nodesRef.current.forEach((n) => n.getAnimations().forEach((a) => a.cancel()))
    if (pendingRef.current === incomingRef.current) commit(incomingRef.current)
    else {
      unmountIncoming()
      const el = frameEl()
      if (el) { el.style.transform = ""; el.style.opacity = "" }
    }
  }

  const setChrome = (value: number | null) => {
    rootRef.current?.style.setProperty("--lb-chrome", value === null ? "1" : String(value))
  }

  /* ── Pista de deslizar (swipe-clarity) ──────────────────────────────────
     En pantallas táctiles las flechas quedan abajo, lejos de la imagen, y el
     gesto natural es arrastrar. La primera vez por sesión, la imagen se asoma
     hacia la siguiente y vuelve: dice "esto se desliza" sin texto ni tutorial.
     Cualquier toque o tecla la corta (es una animación más del frame). */
  const peekHint = useCallback((el: HTMLElement) => {
    if (count < 2 || !window.matchMedia("(pointer: coarse)").matches) return
    try {
      if (sessionStorage.getItem(PEEK_KEY)) return
      sessionStorage.setItem(PEEK_KEY, "1")
    } catch { /* sin storage: se muestra igual */ }
    const t = readTokens()
    if (runRef.current !== 0 || closingRef.current) return
    play(el, [
      { transform: "none" },
      { transform: `translateX(${-t.peek}px)`, offset: 0.4, easing: t.easeOut },
      { transform: "none" },
    ], { duration: t.peekDuration, delay: t.peekDelay, easing: t.easeStandard })
  }, [count])

  /* ── Abrir: scrim + morph desde la miniatura ─────────────────────────── */
  const runOpen = useCallback(() => {
    const el = frameEl()
    const scrim = scrimRef.current
    const t = readTokens()
    const reduced = prefersReducedMotion()
    if (scrim) play(scrim, [{ opacity: 0 }, { opacity: 1 }], { duration: t.enter, easing: t.easeOut })
    if (!el) return
    el.style.opacity = "0"
    const origin = getOrigin(startIndex)
    ready(el).then(async () => {
      if (runRef.current !== 0 || closingRef.current) return
      el.style.opacity = ""
      const o = origin?.getBoundingClientRect()
      let ok: boolean
      if (reduced || !origin || !o || !inViewport(o)) {
        ok = await play(el, reduced
          ? [{ opacity: 0 }, { opacity: 1 }]
          : [{ opacity: 0, transform: "scale(0.96)" }, { opacity: 1, transform: "none" }],
          { duration: t.enter, easing: t.easeOut })
      } else {
        const m = morphFrom(el.getBoundingClientRect(), o, radiusOf(origin))
        ok = await play(el, [
          { transform: m.transform, clipPath: m.clipPath },
          { transform: "none", clipPath: `inset(0px 0px round ${radiusOf(el)}px)` },
        ], { duration: t.reveal, easing: t.easeOut })
      }
      if (ok && !reduced) peekHint(el)
    })
  }, [getOrigin, startIndex, peekHint])

  // Radix monta el portal en una segunda pasada, así que el arranque se
  // engancha al ref del contenido (llega con el frame y el scrim ya puestos).
  const contentRef = useCallback((node: HTMLDivElement | null) => {
    rootRef.current = node
    if (node && !openedRef.current) {
      openedRef.current = true
      runOpen()
    }
  }, [runOpen])

  /* ── Navegar: pista de carrusel, interrumpible ──────────────────────── */
  const runNav = async (token: number, dir: Dir) => {
    const t = readTokens()
    const reduced = prefersReducedMotion()
    const to = targetRef.current
    // Un cambio en curso hacia otra imagen termina al instante y se sigue desde ahí.
    if (incomingRef.current !== null && incomingRef.current !== to) settle()
    if (to === indexRef.current) return
    if (incomingRef.current !== to) mountIncoming(to, dir)
    const out = frameEl()
    const inc = incomingEl()
    if (!out || !inc) { commit(to); return }
    pendingRef.current = to
    if (!(inc instanceof HTMLImageElement) || !(inc.complete && inc.naturalWidth > 0)) {
      inc.style.visibility = "hidden"
      await ready(inc)
      inc.style.visibility = ""
      if (token !== runRef.current) return
    }
    out.getAnimations().forEach((a) => a.cancel())
    inc.getAnimations().forEach((a) => a.cancel())
    out.style.clipPath = ""

    let ok: boolean
    if (reduced) {
      // Fundido sin superposición: la actual se apaga y después aparece la otra.
      inc.style.transform = ""
      ok = (await Promise.all([
        play(out, [{ opacity: 1 }, { opacity: 0 }], { duration: t.exit, easing: t.easeIn }),
        play(inc, [{ opacity: 0 }, { opacity: 1 }], { duration: t.enter, delay: t.exit, easing: t.easeOut }),
      ])).every(Boolean)
    } else {
      // Las dos se mueven juntas: misma distancia, misma curva. Si venían de un
      // arrastre, parten desde donde las dejó el dedo.
      const outX = xOf(out)
      const startIn = outX + dir * slideDistance(out, inc, t.slideGap)
      const opts = { duration: t.slide, easing: t.easeOut }
      ok = (await Promise.all([
        play(out, [{ transform: `translateX(${outX}px)`, opacity: 1 }, { transform: `translateX(${outX - startIn}px)`, opacity: 1 }], opts),
        play(inc, [{ transform: `translateX(${startIn}px)`, opacity: 1 }, { transform: "translateX(0px)", opacity: 1 }], opts),
      ])).every(Boolean)
    }
    if (!ok || token !== runRef.current) return
    commit(to)
  }

  const navigate = useCallback((to: number, dir: Dir) => {
    if (closingRef.current || count < 2) return
    const next = wrap(to)
    if (next === targetRef.current && next === indexRef.current) return
    targetRef.current = next
    setActive(next)
    void runNav(++runRef.current, dir)
  }, [count]) // eslint-disable-line react-hooks/exhaustive-deps -- runNav solo usa refs

  const prev = () => navigate(targetRef.current - 1, -1)
  const next = () => navigate(targetRef.current + 1, 1)

  /* ── Cerrar: vuelve a la miniatura de la imagen actual ──────────────── */
  const close = useCallback(async () => {
    if (closingRef.current) return
    closingRef.current = true
    runRef.current++
    settle()
    setClosing(true)
    setChrome(null)
    const t = readTokens()
    const reduced = prefersReducedMotion()
    const el = frameEl()
    const scrim = scrimRef.current
    const origin = getOrigin(indexRef.current)

    const steps: Promise<boolean>[] = []
    if (scrim) {
      const from = getComputedStyle(scrim).opacity
      scrim.getAnimations().forEach((a) => a.cancel())
      steps.push(play(scrim, [{ opacity: from }, { opacity: 0 }], { duration: t.exitLg, easing: t.easeStandard }))
    }
    if (el) {
      const from = freeze(el)
      const o = origin?.getBoundingClientRect()
      if (!reduced && origin && o && inViewport(o)) {
        // Rect sin transformar: se mide con el transform apagado (síncrono, no se pinta).
        el.style.transform = ""
        const rect = el.getBoundingClientRect()
        el.style.transform = from.transform === "none" ? "" : from.transform
        const m = morphFrom(rect, o, radiusOf(origin))
        // Llega a la miniatura → desacelera (ease-out); sale más rápido que entró.
        steps.push(play(el, [
          { transform: from.transform, opacity: from.opacity, clipPath: `inset(0px 0px round ${radiusOf(el)}px)` },
          { transform: m.transform, opacity: 1, clipPath: m.clipPath },
        ], { duration: t.exitLg, easing: t.easeOut }))
      } else {
        steps.push(play(el, reduced
          ? [{ opacity: from.opacity }, { opacity: 0 }]
          : [{ transform: from.transform, opacity: from.opacity }, { transform: "scale(0.96)", opacity: 0 }],
          { duration: t.exit, easing: t.easeIn }))
      }
    }
    await Promise.all(steps)
    onClose()
    // El foco vuelve a la miniatura de la imagen que estabas viendo (Radix no
    // lo hace solo porque el diálogo se desmonta abierto).
    // (timer y no rAF: rAF no corre con la pestaña en segundo plano).
    setTimeout(() => origin?.focus({ preventScroll: true }), 0)
  }, [getOrigin, onClose]) // eslint-disable-line react-hooks/exhaustive-deps -- settle/frameEl solo usan refs

  /* ── Teclado ─────────────────────────────────────────────────────────── */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const keys: Record<string, () => void> = {
      ArrowLeft: prev,
      ArrowRight: next,
      Home: () => navigate(0, -1),
      End: () => navigate(count - 1, 1),
    }
    const fn = keys[e.key]
    if (fn) { e.preventDefault(); fn() }
  }

  /* ── Gestos: el frame sigue al dedo en tiempo real ──────────────────── */
  const springBack = () => {
    const el = frameEl()
    const inc = incomingEl()
    const scrim = scrimRef.current
    const t = readTokens()
    setChrome(null)
    if (el) {
      const from = freeze(el)
      play(el, [{ transform: from.transform, opacity: from.opacity }, { transform: "none", opacity: 1 }],
        { duration: t.enter, easing: t.easeOut })
    }
    if (inc) {
      // La vecina vuelve a su lugar fuera de pantalla y se desmonta.
      const idx = incomingRef.current
      const x = xOf(inc)
      const side = Math.sign(x) || 1
      play(inc, [{ transform: `translateX(${x}px)` }, { transform: `translateX(${side * slideDistance(el, inc, t.slideGap)}px)` }],
        { duration: t.enter, easing: t.easeOut })
        .then((ok) => { if (ok && incomingRef.current === idx && pendingRef.current === null) unmountIncoming() })
    }
    if (scrim) {
      const from = getComputedStyle(scrim).opacity
      scrim.style.opacity = ""
      play(scrim, [{ opacity: from }, { opacity: 1 }], { duration: t.enter, easing: t.easeOut })
    }
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || closingRef.current || !e.isPrimary) return
    if ((e.target as HTMLElement).closest("button")) return
    dragRef.current = {
      id: e.pointerId, x0: e.clientX, y0: e.clientY, axis: null,
      dx: 0, dy: 0, lastX: e.clientX, lastY: e.clientY, lastT: e.timeStamp, vx: 0, vy: 0,
    }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current
    if (!d || e.pointerId !== d.id) return
    d.dx = e.clientX - d.x0
    d.dy = e.clientY - d.y0
    const dt = Math.max(e.timeStamp - d.lastT, 1)
    d.vx = (e.clientX - d.lastX) / dt
    d.vy = (e.clientY - d.lastY) / dt
    d.lastX = e.clientX; d.lastY = e.clientY; d.lastT = e.timeStamp

    if (!d.axis) {
      if (Math.hypot(d.dx, d.dy) < 8) return
      d.axis = Math.abs(d.dx) > Math.abs(d.dy) ? "x" : "y"
      stageRef.current?.setPointerCapture(e.pointerId)
      // El gesto manda: lo que estuviera en curso termina al instante.
      runRef.current++
      settle()
      targetRef.current = indexRef.current
      setActive(indexRef.current)
      const cur = frameEl()
      if (cur) {
        cur.getAnimations().forEach((a) => a.cancel())
        cur.style.clipPath = ""
        cur.style.opacity = "1"
      }
    }
    const el = frameEl()
    if (!el) return
    if (d.axis === "x" && count > 1) {
      // La vecina del lado hacia donde arrastras asoma pegada y sigue al dedo.
      const dir: Dir = d.dx < 0 ? 1 : -1
      const nb = wrap(indexRef.current + dir)
      if (incomingRef.current !== nb) mountIncoming(nb, dir)
      const inc = incomingEl()
      el.style.transform = `translateX(${d.dx}px)`
      if (inc) inc.style.transform = `translateX(${d.dx + dir * slideDistance(el, inc, readTokens().slideGap)}px)`
    } else if (d.axis === "y") {
      // Hacia abajo cierra; hacia arriba solo cede un poco (resistencia).
      const y = d.dy > 0 ? d.dy : d.dy * 0.2
      const progress = Math.min(Math.max(y, 0) / 400, 1)
      el.style.transform = `translate(${d.dx * 0.3}px, ${y}px) scale(${1 - progress * 0.25})`
      el.style.opacity = "1"
      if (scrimRef.current) {
        scrimRef.current.getAnimations().forEach((a) => a.cancel())
        scrimRef.current.style.opacity = String(1 - progress * 0.7)
      }
      setChrome(1 - progress)
    }
  }

  const onPointerUp = (e: React.PointerEvent) => {
    const d = dragRef.current
    if (!d || e.pointerId !== d.id) return
    dragRef.current = null
    if (!d.axis) {
      // Toque sin arrastre fuera de la imagen = cerrar (como el scrim de un modal).
      if (e.target === stageRef.current) close()
      return
    }
    const t = readTokens()
    if (d.axis === "x" && count > 1 && (Math.abs(d.dx) > t.swipe || Math.abs(d.vx) > t.flick)) {
      const dir: Dir = d.dx < 0 ? 1 : -1
      navigate(targetRef.current + dir, dir)
    } else if (d.axis === "y" && (d.dy > t.dismiss || d.vy > t.flick)) {
      close()
    } else {
      springBack()
    }
  }

  const onPointerCancel = () => {
    if (!dragRef.current) return
    const hadAxis = dragRef.current.axis
    dragRef.current = null
    if (hadAxis) springBack()
  }

  /* ── Precarga de vecinas ─────────────────────────────────────────────── */
  useEffect(() => {
    for (const offset of [1, -1]) {
      const src = items[(index + offset + count) % count]?.src
      if (src) new Image().src = src
    }
  }, [index, items, count])

  if (!item) return null

  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open) close() }}>
      <Dialog.Portal>
        <Dialog.Overlay ref={scrimRef} className="lb-scrim" />
        <Dialog.Content
          ref={contentRef}
          className="lb"
          data-closing={closing ? "" : undefined}
          aria-describedby={undefined}
          onKeyDown={handleKeyDown}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <Dialog.Title className="sr-only">Galería de {title}</Dialog.Title>

          <header className="lb-bar lb-bar--top">
            <p className="lb-count" aria-hidden="true">
              <span className="lb-count-now">{pad(index + 1)}</span>
              <span className="lb-count-sep">/</span>
              <span>{pad(count)}</span>
            </p>
            <p className="lb-caption">
              <span className="lb-caption-project">{title}</span>
              <span className="lb-caption-label">{item.label}</span>
            </p>
            <button type="button" className="lb-btn lb-close" onClick={close} aria-label="Cerrar galería">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </header>

          <div
            ref={stageRef}
            className="lb-stage"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
          >
            {(incoming !== null && incoming !== index ? [index, incoming] : [index]).map((i) => {
              const it = items[i]
              const current = i === index
              return (
                <div key={i} className="lb-slide" aria-hidden={current ? undefined : true}>
                  {it.src ? (
                    <img
                      ref={setNode(i)}
                      className="lb-frame"
                      src={it.src}
                      alt={`${title} — ${it.label}`}
                      draggable={false}
                    />
                  ) : (
                    <div
                      ref={setNode(i)}
                      className="lb-frame lb-frame--placeholder"
                      role="img"
                      aria-label={`${title} — ${it.label} (imagen de ejemplo)`}
                    >
                      <GalleryPlaceholder item={it} large />
                    </div>
                  )}
                </div>
              )
            })}

            {/* Con mouse: flechas a los costados de la imagen, donde se buscan.
                Cada una es una columna entera clickeable (Fitts); el círculo es
                solo la parte visible. En táctil se ocultan y mandan las de abajo. */}
            {count > 1 && <>
              <button type="button" className="lb-side lb-side--prev" onClick={prev} aria-label="Imagen anterior">
                <span className="lb-side-btn"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg></span>
              </button>
              <button type="button" className="lb-side lb-side--next" onClick={next} aria-label="Imagen siguiente">
                <span className="lb-side-btn"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg></span>
              </button>
            </>}
          </div>

          {count > 1 && (
            <footer className="lb-bar lb-bar--bottom">
              <button type="button" className="lb-btn lb-btn--touch" onClick={prev} aria-label="Imagen anterior">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <ul className="lb-strip">
                {items.map((it, i) => (
                  <li key={it.id} className="lb-strip-item">
                    <button
                      type="button"
                      className="lb-thumb"
                      aria-label={`${it.label}, ${i + 1} de ${count}`}
                      aria-current={i === active ? "true" : undefined}
                      onClick={() => navigate(i, i > targetRef.current ? 1 : -1)}
                    >
                      <span className="lb-thumb-img">
                        {it.src
                          ? <img src={it.src} alt="" loading="lazy" draggable={false} />
                          : <GalleryPlaceholder item={it} />}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <button type="button" className="lb-btn lb-btn--touch" onClick={next} aria-label="Imagen siguiente">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </footer>
          )}

          <p className="sr-only" role="status">
            Imagen {index + 1} de {count}: {item.label}
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
