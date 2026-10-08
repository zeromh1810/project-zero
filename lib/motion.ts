"use client"

import { createElement, useEffect, useRef, useState, type ReactNode } from "react"

// Entradas y salidas (Zero design system v2.1.0) — el lado React de
// styles/motion.css. Lo que React desmonta no puede animar su salida: estas
// utilidades lo mantienen montado el tiempo exacto del token de salida y
// recién ahí lo retiran.
//
// El estado NUNCA depende de animationend: se usa un timer con la duración
// del token. Si la animación se corta (pestaña oculta, otro cambio encima,
// movimiento reducido), la UI igual llega a su estado final. Un cambio nuevo
// en plena salida la reemplaza (interrumpible).

/** Un token de tiempo en ms, sin importar la unidad. El CSS minificado
 *  reescribe `420ms` como `.42s`: leerlo con parseFloat a secas da 0.42ms. */
export function tokenMs(token: string, fallback = 0): number {
  if (typeof window === "undefined") return fallback
  const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim()
  const n = parseFloat(raw)
  if (Number.isNaN(n)) return fallback
  return raw.endsWith("ms") ? n : raw.endsWith("s") ? n * 1000 : n
}

/** Duración de un token de motion en ms (0 con movimiento reducido). */
export function motionMs(token = "--dur-exit"): number {
  if (typeof window === "undefined") return 0
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return 0
  return tokenMs(token)
}

/**
 * Presencia: `mounted` sigue en true durante la salida y `exiting` indica
 * que hay que aplicar la clase de salida.
 *
 *   const p = usePresence(open)
 *   {p.mounted && <div className={p.exiting ? "m-exit" : "m-enter"} />}
 */
export function usePresence(show: boolean, exitToken = "--dur-exit") {
  const [mounted, setMounted] = useState(show)
  // Ajuste en render (no en un effect): volver a mostrar cancela la salida.
  if (show && !mounted) setMounted(true)
  const exiting = mounted && !show

  useEffect(() => {
    if (!exiting) return
    const t = window.setTimeout(() => setMounted(false), motionMs(exitToken))
    return () => window.clearTimeout(t)
  }, [exiting, exitToken])

  return { mounted, exiting }
}

/**
 * Último valor no vacío mientras dura la salida: un mensaje de error que se
 * va tiene que seguir mostrando su texto mientras se desvanece.
 */
export function useLatest<T>(value: T | null | undefined, keep: boolean): T | null | undefined {
  const [last, setLast] = useState(value)
  if (value && value !== last) setLast(value)
  return value || (keep ? last : value)
}

/**
 * Cambio de vista con salida y entrada: la vista anterior sale (--dur-exit)
 * y recién después entra la nueva (--dur-enter). `render(key)` construye la
 * vista de una clave, así durante la salida se sigue viendo la anterior.
 */
export function Switch({ k, render, className = "", onShown }: {
  k: string
  render: (key: string) => ReactNode
  className?: string
  /** Se llama cuando la vista nueva ya está en pantalla (no en el primer render). */
  onShown?: (key: string) => void
}) {
  const [shown, setShown] = useState(k)
  const exiting = k !== shown
  const onShownRef = useRef(onShown)
  useEffect(() => { onShownRef.current = onShown })

  useEffect(() => {
    if (!exiting) return
    const t = window.setTimeout(() => setShown(k), motionMs("--dur-exit"))
    return () => window.clearTimeout(t)
  }, [exiting, k])

  // Después del commit de la vista nueva (no en el primer render): así
  // onShown encuentra su DOM, p. ej. para enfocar su título.
  const firstRef = useRef(true)
  useEffect(() => {
    if (firstRef.current) { firstRef.current = false; return }
    onShownRef.current?.(shown)
  }, [shown])

  return createElement("div", {
    key: shown,
    className: `m-view ${className}`.trim(),
    "data-phase": exiting ? "exit" : "enter",
  }, render(shown))
}

/**
 * Salida de un elemento de lista ANTES de una acción que lo elimina
 * (borrar un proyecto, un post, una marca): el ítem sale, corre la acción y,
 * si sigue en el DOM (la acción falló y la lista no lo quitó), vuelve a entrar.
 */
export async function leaveThen(el: Element | null, action: () => void | Promise<void>) {
  if (el) el.classList.add("m-leaving")
  const ms = motionMs("--dur-exit")
  if (el && ms) await new Promise((r) => window.setTimeout(r, ms))
  try {
    await action()
  } finally {
    if (el?.isConnected) el.classList.remove("m-leaving")
  }
}

/* ── Zero design system: crossfade y revelado (guiados por ui-ux-pro-max) ── */

export type MotionDir = "up" | "down" | "left" | "right" | "none"

/**
 * Transición entre vistas "fade through" (Material; reglas `no-blocking-animation`,
 * `navigation-direction`, `interruptible`): la anterior se desvanece rápido,
 * inerte, y después aparece la nueva con dirección. La nueva se monta al
 * instante; nunca hay dos vistas legibles a la vez (un crossfade superponía
 * dos páginas de texto). Las dos capas comparten la clave de
 * su vista, así la saliente es la misma instancia (no se vuelve a montar).
 * Un cambio en plena transición reemplaza la capa saliente.
 *   up/down    → página adelante/atrás (entra desde abajo / desde arriba)
 *   left/right → pestaña siguiente/anterior (entra desde la derecha / izquierda)
 */
export function Crossfade({ k, render, dir = "up", size = "lg", appear = true, className = "" }: {
  k: string
  render: (key: string) => ReactNode
  dir?: MotionDir
  /** lg: página (sale en --dur-hover, entra en --dur-reveal) · sm: pestaña (--dur-press / --dur-enter) */
  size?: "lg" | "sm"
  /** false: no anima el primer montaje (p. ej. pestañas dentro de una página que ya entra). */
  appear?: boolean
  className?: string
}) {
  const [state, setState] = useState<{ cur: string; prev: string | null; dir: MotionDir; changed: boolean }>({ cur: k, prev: null, dir, changed: false })
  // Ajuste en render: la vista mostrada pasa a ser la saliente.
  if (k !== state.cur) setState({ cur: k, prev: state.cur, dir, changed: true })

  useEffect(() => {
    if (state.prev === null) return
    const t = window.setTimeout(() => setState((s) => ({ ...s, prev: null })), motionMs(size === "lg" ? "--dur-hover" : "--dur-press"))
    return () => window.clearTimeout(t)
  }, [state.prev, size])

  const layer = (key: string, out: boolean) => createElement("div", {
    key: `v-${key}`,
    // is-after: entró por un cambio → espera a que la anterior se vaya (la
    // clase se mantiene aunque la saliente ya no esté: el delay no cambia
    // a mitad de la animación).
    className: out ? "m-xfade-out" : state.changed ? "m-xfade-in is-after" : appear ? "m-xfade-in" : "m-xfade-still",
    "aria-hidden": out || undefined,
    inert: out || undefined,
  }, render(key))

  return createElement("div", { className: `m-xfade m-xfade--${size} ${className}`.trim(), "data-dir": state.dir },
    state.prev !== null && state.prev !== state.cur ? layer(state.prev, true) : null,
    layer(state.cur, false))
}

/**
 * Revelado al entrar en pantalla (preset Scroll Reveal de ui-ux-pro-max:
 * disparado al cruzar ~90% del viewport, 300–400ms, 8–16px, se revierte al
 * volver a quedar debajo). Sin JS o con movimiento reducido no se oculta nada
 * (fallback: el atributo data-reveal solo lo pone este hook). Lo que ya está
 * en pantalla al aparecer se marca visible sin animar: la página ya entra
 * con su crossfade (`excessive-motion`).
 */
export function useReveal(root: { current: HTMLElement | null }, selector: string) {
  useEffect(() => {
    const el = root.current
    if (!el || motionMs("--dur-reveal-sm") === 0 || typeof IntersectionObserver === "undefined") return
    el.setAttribute("data-reveal", "on")
    const seen = new WeakSet<Element>()
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) e.target.classList.add("is-in")
        else if (e.boundingClientRect.top > 0) e.target.classList.remove("is-in", "is-instant")
      }
    }, { rootMargin: "0px 0px -10% 0px" })
    const scan = () => {
      el.querySelectorAll(selector).forEach((t) => {
        if (seen.has(t)) return
        seen.add(t)
        if (t.getBoundingClientRect().top < window.innerHeight * 0.9) t.classList.add("is-in", "is-instant")
        io.observe(t)
      })
    }
    scan()
    const mo = new MutationObserver(scan)
    mo.observe(el, { childList: true, subtree: true })
    return () => { io.disconnect(); mo.disconnect(); el.removeAttribute("data-reveal") }
  }, [root, selector])
}
