"use client"

import { useCallback } from "react"

// Pull magnético para los CTA principales (hero, cierre). Patrón del DS:
// el JS escribe SOLO las custom properties --mx/--my, y .btn-magnetic (CSS)
// compone translate(var(--mx), var(--my)) con los mismos scale de :hover /
// :active que usan .btn-p/.btn-g. Escribir style.transform directo pisaría
// esos estados (un inline siempre gana) y el botón perdería el feedback de
// presión — bug ya visto en este proyecto.
//
// Fuerza ×0.3 con tope de ±8px: el botón nunca sale de su propia área de
// click (guía de la skill ui-ux-pro-max, Hover Micro-interaction).
// Solo con puntero fino y sin prefers-reduced-motion.
const STRENGTH = 0.3
const MAX = 8

function enabled() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function useMagnetic() {
  const onPointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse" || !enabled()) return
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    const clamp = (v: number) => Math.max(-MAX, Math.min(MAX, v))
    el.style.setProperty("--mx", `${clamp((e.clientX - r.left - r.width / 2) * STRENGTH).toFixed(1)}px`)
    el.style.setProperty("--my", `${clamp((e.clientY - r.top - r.height / 2) * STRENGTH).toFixed(1)}px`)
  }, [])

  const onPointerLeave = useCallback((e: React.PointerEvent<HTMLElement>) => {
    e.currentTarget.style.setProperty("--mx", "0px")
    e.currentTarget.style.setProperty("--my", "0px")
  }, [])

  return { onPointerMove, onPointerLeave }
}
