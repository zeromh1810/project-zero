"use client"

import { useEffect, useRef, useState } from "react"

interface CountUpProps {
  /** Texto final, ej. "20 mil usuarios únicos", "Funding $2.4M seed", "40+". */
  text: string
  /** Duración de la cuenta, en ms. */
  duration?: number
  className?: string
}

// Cuenta ascendente del primer número que aparezca en `text` (N-7/N-8 del
// plan), una sola vez, al entrar al viewport. Conserva prefijo, sufijo y
// decimales ("$2.4M" cuenta 0.0 → 2.4). Sin número, o con reduced-motion,
// muestra el texto tal cual.
//
// El ancho no salta: una copia invisible del texto final (.count-up-sizer)
// fija la caja y el número vivo se superpone en la misma celda de grid.
// Lectores de pantalla leen siempre el valor final (aria-label), nunca la
// cuenta intermedia.
const NUM = /(\d+(?:[.,]\d+)?)/

export function CountUp({ text, duration = 700, className = "" }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const match = text.match(NUM)
  const target = match ? parseFloat(match[1].replace(",", ".")) : 0
  const decimals = match && /[.,]/.test(match[1]) ? match[1].split(/[.,]/)[1].length : 0
  const sep = match && match[1].includes(",") ? "," : "."
  // SSR y primer render: texto final (nada que esconder si el JS no corre).
  const [value, setValue] = useState<number | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !match) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let raf = 0
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      io.disconnect()
      const start = performance.now()
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration)
        const eased = 1 - Math.pow(1 - t, 3) // ease-out cúbico
        setValue(target * eased)
        if (t < 1) raf = requestAnimationFrame(tick)
        else setValue(null) // vuelve al texto original exacto
      }
      setValue(0)
      raf = requestAnimationFrame(tick)
    }, { threshold: 0.4 })
    io.observe(el)
    return () => { io.disconnect(); cancelAnimationFrame(raf) }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-corre solo si cambia el texto
  }, [text, duration])

  const live = value === null || !match
    ? text
    : text.replace(NUM, value.toFixed(decimals).replace(".", sep))

  return (
    <span ref={ref} className={`count-up ${className}`} aria-label={text}>
      <span className="count-up-sizer" aria-hidden="true">{text}</span>
      <span className="count-up-live" aria-hidden="true">{live}</span>
    </span>
  )
}
