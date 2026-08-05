"use client"

import { useRef, useEffect, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SplitText as GSAPSplitText } from "gsap/SplitText"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(ScrollTrigger, GSAPSplitText, useGSAP)

type SplitType = "chars" | "words" | "lines" | "words, chars"

interface SplitTextProps {
  text: string
  className?: string
  delay?: number
  duration?: number
  ease?: string
  splitType?: SplitType
  from?: gsap.TweenVars
  to?: gsap.TweenVars
  threshold?: number
  rootMargin?: string
  textAlign?: React.CSSProperties["textAlign"]
  tag?: keyof React.JSX.IntrinsicElements
  onLetterAnimationComplete?: () => void
}

// Adaptado de https://reactbits.dev/text-animations/split-text — misma
// lógica de animación (GSAP SplitText + ScrollTrigger), portado a TS y con
// un guard de prefers-reduced-motion que el original no trae: sin esto,
// alguien con esa preferencia del SO igual ve el texto entrar carácter por
// carácter, que es exactamente el tipo de movimiento que esa preferencia
// pide evitar.
export default function SplitText({
  text,
  className = "",
  delay = 50,
  duration = 1.25,
  ease = "power3.out",
  splitType = "chars",
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = "-100px",
  textAlign = "center",
  tag = "p",
  onLetterAnimationComplete,
}: SplitTextProps) {
  const ref = useRef<HTMLElement>(null)
  const animationCompletedRef = useRef(false)
  const onCompleteRef = useRef(onLetterAnimationComplete)
  const [fontsLoaded, setFontsLoaded] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    onCompleteRef.current = onLetterAnimationComplete
  }, [onLetterAnimationComplete])

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  }, [])

  useEffect(() => {
    if (document.fonts.status === "loaded") {
      setFontsLoaded(true)
    } else {
      document.fonts.ready.then(() => setFontsLoaded(true))
    }
  }, [])

  useGSAP(
    () => {
      if (!ref.current || !text || !fontsLoaded || reducedMotion) return
      if (animationCompletedRef.current) return
      const el = ref.current

      const startPct = (1 - threshold) * 100
      const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin)
      const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0
      const marginUnit = marginMatch ? marginMatch[2] || "px" : "px"
      const sign =
        marginValue === 0 ? "" : marginValue < 0 ? `-=${Math.abs(marginValue)}${marginUnit}` : `+=${marginValue}${marginUnit}`
      const start = `top ${startPct}%${sign}`

      let targets: Element[] | undefined
      const assignTargets = (self: GSAPSplitText) => {
        if (splitType.includes("chars") && self.chars.length) targets = self.chars
        if (!targets && splitType.includes("words") && self.words.length) targets = self.words
        if (!targets && splitType.includes("lines") && self.lines.length) targets = self.lines
        if (!targets) targets = self.chars || self.words || self.lines
      }

      const splitInstance = new GSAPSplitText(el, {
        type: splitType,
        smartWrap: true,
        autoSplit: splitType === "lines",
        linesClass: "split-line",
        wordsClass: "split-word",
        charsClass: "split-char",
        reduceWhiteSpace: false,
        onSplit: (self: GSAPSplitText) => {
          assignTargets(self)
          return gsap.fromTo(
            targets!,
            { ...from },
            {
              ...to,
              duration,
              ease,
              stagger: delay / 1000,
              scrollTrigger: {
                trigger: el,
                start,
                once: true,
                fastScrollEnd: true,
                anticipatePin: 0.4,
              },
              onComplete: () => {
                animationCompletedRef.current = true
                // Revierte los spans por-carácter a texto plano apenas
                // termina de animar — no hace falta que persistan (el
                // ripple del hero terrain no depende de esto, por ejemplo),
                // y deja el elemento en un estado más simple para
                // selección de texto / lectores de pantalla. También es lo
                // que permite que un className con gradiente + background-
                // clip:text funcione en el elemento (necesita texto propio,
                // no hijos con el texto adentro — ver .hero-title-line--accent
                // en portfolio.css).
                try {
                  splitInstance.revert()
                } catch {
                  /* noop */
                }
                onCompleteRef.current?.()
              },
              willChange: "transform, opacity",
              force3D: true,
            }
          )
        },
      })

      return () => {
        ScrollTrigger.getAll().forEach(st => {
          if (st.trigger === el) st.kill()
        })
        try {
          splitInstance.revert()
        } catch {
          /* noop */
        }
      }
    },
    {
      dependencies: [text, delay, duration, ease, splitType, JSON.stringify(from), JSON.stringify(to), threshold, rootMargin, fontsLoaded, reducedMotion],
      scope: ref,
    }
  )

  const Tag = tag as React.ElementType
  const style: React.CSSProperties = {
    textAlign,
    overflow: "hidden",
    display: "inline-block",
    whiteSpace: "normal",
    wordWrap: "break-word",
    // Con reduced motion nunca corre el tween de GSAP — el texto debe
    // arrancar visible y sin transform, o se quedaría pegado al estado
    // `from` (típicamente opacity:0) para siempre. No reutilizamos `to`
    // acá porque sus valores son vars de GSAP (ej. `y`), no CSS real —
    // asignarlos tal cual a `style` no aplicaría ninguna transformación.
    ...(reducedMotion ? { opacity: 1, transform: "none" } : undefined),
  }

  return (
    <Tag ref={ref} style={style} className={`split-parent ${className}`}>
      {text}
    </Tag>
  )
}
