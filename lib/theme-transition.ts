"use client"

import { flushSync } from "react-dom"

// Cambio de tema con revelado circular desde el botón (N-10 del plan).
// Usa la View Transitions API, que solo toma una captura de la pantalla:
// no modifica el WebGL ni nada del fondo 3D — el canvas sigue renderizando
// igual, la transición solo recorta la captura nueva con un círculo.
// Sin soporte o con prefers-reduced-motion: cambio directo, como antes.
export function switchThemeWithTransition(
  toggle: () => void,
  nextDark: boolean,
  origin?: { x: number; y: number },
) {
  const root = document.documentElement
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> } }

  if (!doc.startViewTransition || reduced) {
    toggle()
    return
  }

  const x = origin?.x ?? window.innerWidth - 80
  const y = origin?.y ?? 32
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))

  // Durante la captura se apagan las transiciones de color (body: 0.4s):
  // si no, dentro del círculo se vería además un fundido de fondo encima.
  root.classList.add("theme-vt")
  const vt = doc.startViewTransition(() => {
    flushSync(toggle)
    // El ThemeProvider aplica la clase en un effect; acá se aplica ya, para
    // que la captura "nueva" tenga el tema nuevo. El effect la deja igual.
    root.classList.toggle("dark", nextDark)
    root.classList.toggle("light", !nextDark)
  })

  vt.ready.then(() => {
    root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 520, easing: "cubic-bezier(0.16, 1, 0.3, 1)", pseudoElement: "::view-transition-new(root)" },
    )
  }).catch(() => {})
  vt.finished.finally(() => root.classList.remove("theme-vt"))
}
