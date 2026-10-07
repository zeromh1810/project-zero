"use client"

import { useRef, useState, useCallback } from "react"
import { ArrowRightIcon } from "../icons"
import { useMagnetic } from "@/hooks/use-magnetic"

interface ClosingCtaProps {
  email?: string
  onNavigateContact: () => void
}

// Cierre de la página (M-9 / plan 4.6): antes el recorrido terminaba en el
// footer informativo, sin una última invitación a contactar. Copy real,
// tomado de la sección Contacto — nada inventado.
//
// Micro-interacciones: glow de acento que sigue al puntero dentro de la
// banda (N-16, solo variables --gx/--gy, sin re-render), CTA magnético
// (N-5) y copiar email con check que se dibuja + aviso para lectores de
// pantalla (N-12).
export function ClosingCta({ email, onNavigateContact }: ClosingCtaProps) {
  const bandRef = useRef<HTMLElement>(null)
  const rafRef = useRef(0)
  const [copied, setCopied] = useState(false)
  const magnetic = useMagnetic()

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return
    const band = bandRef.current
    if (!band) return
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      const r = band.getBoundingClientRect()
      band.style.setProperty("--gx", `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`)
      band.style.setProperty("--gy", `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`)
    })
  }, [])

  const copyEmail = useCallback(async () => {
    if (!email) return
    try {
      await navigator.clipboard.writeText(email)
    } catch {
      // Sin permiso de portapapeles (http, iframe): se abre el cliente de correo.
      window.location.href = `mailto:${email}`
      return
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }, [email])

  return (
    <section ref={bandRef} className="closing-cta" onPointerMove={onPointerMove} aria-labelledby="closing-cta-title">
      <div className="closing-cta-glow" aria-hidden="true" />
      <div className="closing-cta-inner">
        <div className="s-label">Hablemos</div>
        <h2 id="closing-cta-title" className="closing-cta-title">
          ¿Tienes un proyecto en mente?
        </h2>
        <p className="closing-cta-sub">
          Cuéntame qué necesitas — te respondo en menos de 24 horas.
        </p>
        <div className="closing-cta-actions">
          <button className="btn-p btn-magnetic btn-shine" onClick={onNavigateContact} {...magnetic}>
            Trabajemos juntos <ArrowRightIcon className="btn-arrow" />
          </button>
          {email && (
            <button
              type="button"
              className={`closing-cta-copy${copied ? " is-copied" : ""}`}
              onClick={copyEmail}
              aria-label={copied ? "Email copiado" : `Copiar email ${email}`}
            >
              <span className="closing-cta-copy-icon" aria-hidden="true">
                <svg className="icon-copy" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="11" height="11" rx="2" />
                  <path d="M5 15V6a2 2 0 0 1 2-2h9" />
                </svg>
                <svg className="icon-check" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              </span>
              <span className="closing-cta-email">{email}</span>
            </button>
          )}
        </div>
        <span className="sr-only" aria-live="polite">{copied ? "Email copiado al portapapeles" : ""}</span>
      </div>
    </section>
  )
}
