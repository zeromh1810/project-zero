"use client"

import { useEffect, useRef, useState } from "react"

interface SplitTextProps {
  text: string
  className?: string
  tag?: keyof React.JSX.IntrinsicElements
  /** Delay entre el inicio de cada carácter, en ms. */
  delay?: number
  /** Duración de la animación de cada carácter, en ms. */
  duration?: number
  onLetterAnimationComplete?: () => void
}

// Reveal de texto carácter por carácter, en CSS puro — sin dependencias.
// Reemplaza una versión anterior basada en gsap/SplitText + ScrollTrigger:
// esa combinación agregaba ~130KB comprimidos de JS (gsap + el plugin
// SplitText + ScrollTrigger) para animar, en este sitio, únicamente las
// 3 líneas del título del hero — nada más en el proyecto usaba gsap.
// Este componente reproduce el mismo efecto visual (opacity 0→1,
// translateY 40px→0, ~50ms de stagger por letra) con @keyframes CSS,
// que el navegador puede correr en el compositor (GPU) sin tocar el
// hilo principal por frame — más liviano que un tween JS por carácter.
//
// También evita por completo la clase de bug que tenía la versión con
// ScrollTrigger: como no depende en absoluto de la posición de scroll,
// no puede quedar con un punto de disparo inalcanzable si el componente
// se remonta con la página ya scrolleada (ver hero-section.tsx —
// bug real reproducido en producción tras volver del detalle de un
// proyecto).
export default function SplitText({
  text,
  className = "",
  tag = "span",
  delay = 50,
  duration = 1250,
  onLetterAnimationComplete,
}: SplitTextProps) {
  const containerRef = useRef<HTMLElement>(null)
  const onCompleteRef = useRef(onLetterAnimationComplete)
  const [reducedMotion, setReducedMotion] = useState(false)
  // Una vez que termina de animar, se vuelve a texto plano — no hace
  // falta que los spans por-carácter persistan, y es lo que permite que
  // un className con gradiente + background-clip:text funcione (necesita
  // texto propio en el elemento, no hijos con el texto adentro — ver
  // .hero-title-line--accent en portfolio.css).
  const [done, setDone] = useState(false)

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
    const total = (chars.length - 1) * delay + duration
    const id = setTimeout(() => {
      setDone(true)
      onCompleteRef.current?.()
    }, total)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo debe re-correr si cambia el texto/timing, no en cada re-render
  }, [text, reducedMotion, delay, duration])

  const Tag = tag as React.ElementType

  return (
    <Tag ref={containerRef} className={`split-parent ${className}`} aria-label={text}>
      {done || reducedMotion ? (
        text
      ) : (
        <span aria-hidden="true">
          {chars.map((char, i) => (
            <span
              key={i}
              className="split-char"
              style={{ animationDelay: `${i * delay}ms`, animationDuration: `${duration}ms` }}
            >
              {char === " " ? " " : char}
            </span>
          ))}
        </span>
      )}
    </Tag>
  )
}
