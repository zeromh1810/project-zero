"use client"

import { useEffect, useRef, type ReactNode } from "react"

/**
 * Envoltorio para componentes reales dentro de la documentación:
 * - Les agrega `.visible`/`.in` (en el sitio lo hace el IntersectionObserver
 *   del portfolio al entrar al viewport; sin eso las cards quedan en opacity 0).
 * - Bloquea la navegación: un click en una tarjeta o un link de ejemplo no
 *   debe sacar al usuario del DS ni disparar el morph hacia el detalle.
 */
export function Live({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    ref.current?.querySelectorAll(".p-card, .anim-up, .blog-card-anim").forEach((el) => el.classList.add("visible", "in"))
  })
  return (
    <div
      ref={ref}
      className={`doc-live ${className}`}
      onClickCapture={(e) => {
        const a = (e.target as HTMLElement).closest("a")
        if (a) { e.preventDefault(); e.stopPropagation() }
      }}
    >
      {children}
    </div>
  )
}
