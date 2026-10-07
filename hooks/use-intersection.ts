"use client"

import { useEffect, useRef, type RefObject } from "react"

// Lee un token de duración del DS (ej. "60ms" → 60). Fallback si no existe.
function readMsToken(name: string, fallback: number) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  const n = parseFloat(raw)
  if (Number.isNaN(n)) return fallback
  return raw.endsWith("ms") ? n : n * 1000
}

export function useIntersection(
  containerRef: RefObject<HTMLElement | null>,
  callback: (el: Element) => void,
  deps: unknown[] = [],
  threshold: number = 0.15
) {
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Cleanup previous observer if exists
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }

    const timers: number[] = []

    // Small delay to ensure DOM is fully updated after section change
    const timeoutId = setTimeout(() => {
      if (!containerRef.current) return

      // Stagger por LOTE, no por índice global: cada callback del observer
      // trae los elementos que entraron juntos al viewport, y solo entre esos
      // se reparte el retraso (step × posición, con tope). Antes el retraso
      // salía de la posición del nodo en toda la página con una curva
      // cuadrática — un elemento que aparecía solo al fondo esperaba hasta
      // ~4s. Tokens: --stagger-step / --stagger-max (design-tokens.css).
      const step = readMsToken("--stagger-step", 60)
      const max  = readMsToken("--stagger-max", 360)
      const reveal = readMsToken("--dur-reveal", 480)

      observerRef.current = new IntersectionObserver(
        (entries) => {
          const batch = entries
            .filter((e) => e.isIntersecting)
            .map((e) => e.target as HTMLElement)
            // orden de lectura: arriba→abajo, izquierda→derecha
            .sort((a, b) => {
              const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect()
              return Math.abs(ra.top - rb.top) > 4 ? ra.top - rb.top : ra.left - rb.left
            })

          batch.forEach((node, i) => {
            const delay = Math.min(i * step, max)
            node.style.transitionDelay = `${delay}ms`
            callback(node)
            observerRef.current?.unobserve(node)
            // El delay inline queda pegado al elemento y retrasaría cualquier
            // transición posterior (un hover, por ejemplo): se limpia apenas
            // termina el reveal.
            timers.push(window.setTimeout(() => { node.style.transitionDelay = "" }, delay + reveal + 400))
          })
        },
        { threshold, rootMargin: "50px" }
      )

      const nodes = containerRef.current.querySelectorAll<HTMLElement>(".anim-up, .p-card, .p-stat--animated")
      nodes.forEach((node) => {
        node.classList.remove("visible", "in")
        observerRef.current?.observe(node)
      })
    }, 50)

    return () => {
      clearTimeout(timeoutId)
      timers.forEach(clearTimeout)
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, callback, threshold, ...deps])
}
