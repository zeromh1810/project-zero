"use client"

import { useEffect, useRef, useState } from "react"

interface SplitTextProps {
  text: string
  className?: string
  tag?: keyof React.JSX.IntrinsicElements
  /**
   * "line" (default): la línea completa sube desde una máscara — es la
   * entrada del hero. "chars": carácter por carácter, solo para textos
   * cortos (≤ ~8 caracteres); en titulares largos se siente lento.
   */
  mode?: "line" | "chars"
  /** Posición de la línea dentro del bloque (modo "line"): define su retraso. */
  index?: number
  /** Retraso entre líneas (modo "line") o entre caracteres (modo "chars"), en ms. */
  delay?: number
  /** Duración de la animación de cada línea/carácter, en ms. */
  duration?: number
  onLetterAnimationComplete?: () => void
}

// Reveal de texto en CSS puro — sin dependencias.
// Reemplaza una versión anterior basada en gsap/SplitText + ScrollTrigger:
// esa combinación agregaba ~130KB comprimidos de JS para animar, en este
// sitio, únicamente las 3 líneas del título del hero. Con @keyframes el
// navegador corre la animación en el compositor (GPU), sin tocar el hilo
// principal por frame.
//
// Tampoco depende de la posición de scroll, así que no puede quedar con un
// punto de disparo inalcanzable si el componente se remonta con la página
// ya scrolleada (ver hero-section.tsx — bug real reproducido en producción
// tras volver del detalle de un proyecto).
//
// v2.0.0: el modo por defecto pasó de carácter a línea. Con 1250ms por
// carácter + 50ms de stagger, "Productos digitales" tardaba ~2.2s en
// resolverse y el subtítulo/CTAs aparecían antes que el título. Por línea:
// 700ms (--dur-hero) + 90ms entre líneas → el bloque queda legible < 1s.
export default function SplitText({
  text,
  className = "",
  tag = "span",
  mode = "line",
  index = 0,
  delay,
  duration,
  onLetterAnimationComplete,
}: SplitTextProps) {
  const containerRef = useRef<HTMLElement>(null)
  const onCompleteRef = useRef(onLetterAnimationComplete)
  const [reducedMotion, setReducedMotion] = useState(false)
  // Una vez que termina de animar, se vuelve a texto plano — no hace falta
  // que los spans persistan, y es lo que permite que un className con
  // gradiente + background-clip:text funcione (necesita texto propio en el
  // elemento, no hijos con el texto adentro — ver .hero-title-line--accent).
  const [done, setDone] = useState(false)

  const step = delay ?? (mode === "line" ? 90 : 50)
  const dur  = duration ?? (mode === "line" ? 700 : 1250)

  useEffect(() => {
    onCompleteRef.current = onLetterAnimationComplete
  }, [onLetterAnimationComplete])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lee matchMedia (externo, no existe en SSR), no hay forma de derivarlo durante el render
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  }, [])

  const chars = Array.from(text)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza con el setTimeout de abajo (sistema externo), no es derivable durante el render
    setDone(false)
    if (reducedMotion || chars.length === 0) {
      setDone(true)
      onCompleteRef.current?.()
      return
    }
    const total = mode === "line"
      ? index * step + dur
      : (chars.length - 1) * step + dur
    const id = setTimeout(() => {
      setDone(true)
      onCompleteRef.current?.()
    }, total)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo debe re-correr si cambia el texto/timing, no en cada re-render
  }, [text, reducedMotion, mode, index, step, dur])

  const Tag = tag as React.ElementType

  if (done || reducedMotion) {
    return <Tag ref={containerRef} className={`split-parent ${className}`}>{text}</Tag>
  }

  return (
    <Tag ref={containerRef} className={`split-parent ${className}`} aria-label={text}>
      {mode === "line" ? (
        <span className="split-line-mask" aria-hidden="true">
          <span
            className="split-line-inner"
            style={{ animationDelay: `${index * step}ms`, animationDuration: `${dur}ms` }}
          >
            {text}
          </span>
        </span>
      ) : (
        <span aria-hidden="true">
          {chars.map((char, i) => (
            <span
              key={i}
              className="split-char"
              style={{ animationDelay: `${i * step}ms`, animationDuration: `${dur}ms` }}
            >
              {char === " " ? " " : char}
            </span>
          ))}
        </span>
      )}
    </Tag>
  )
}
