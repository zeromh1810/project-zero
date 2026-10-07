"use client"

import { useEffect, useRef, useState } from "react"

export type ToastType = "success" | "error" | "warning" | "info"

export interface AdminToastProps {
  type: ToastType
  title: string
  message?: string
  /** Se llama cuando terminó de salir (auto-dismiss o cierre manual). */
  onClose: () => void
  /** Duración visible antes de salir. Errores duran más. */
  duration?: number
}

const ICONS: Record<ToastType, React.ReactNode> = {
  success: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="10" cy="10" r="8" />
      <path d="M6.5 10.5l2.5 2.5 4.5-5" />
    </svg>
  ),
  error: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="10" cy="10" r="8" />
      <path d="M7.5 7.5l5 5M12.5 7.5l-5 5" />
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 3.5L17.5 16.5H2.5L10 3.5z" />
      <path d="M10 9v3M10 13.5v.5" />
    </svg>
  ),
  info: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="10" cy="10" r="8" />
      <path d="M10 9.5V14" />
      <circle cx="10" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  ),
}

const LABELS: Record<ToastType, string> = {
  success: "Éxito",
  error: "Error",
  warning: "Advertencia",
  info: "Información",
}

const EXIT_MS = 200

// Toast del admin (DS v2.1.0, AA-2). Antes la "pausa" con hover solo congelaba
// la barra de progreso: los timers seguían y el toast se cerraba igual (la
// barra mentía). Ahora el temporizador es del propio toast y se pausa de
// verdad con hover o con foco (para leer o alcanzar el botón de cerrar).
// role="status" para éxito/info (no interrumpe); role="alert" para error y
// advertencia. Errores duran más (6s) porque suelen traer un mensaje.
export default function AdminToast({ type, title, message, onClose, duration }: AdminToastProps) {
  const total = duration ?? (type === "error" || type === "warning" ? 6000 : 4000)
  const [paused, setPaused] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const remaining = useRef(total)
  const startedAt = useRef(0)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const close = () => {
    if (timer.current) clearTimeout(timer.current)
    setLeaving(true)
    timer.current = setTimeout(onClose, EXIT_MS)
  }

  useEffect(() => {
    if (leaving) return
    if (paused) {
      if (timer.current) clearTimeout(timer.current)
      remaining.current -= performance.now() - startedAt.current
      return
    }
    startedAt.current = performance.now()
    timer.current = setTimeout(close, Math.max(0, remaining.current))
    return () => { if (timer.current) clearTimeout(timer.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- close es estable en la práctica
  }, [paused, leaving])

  return (
    <div
      className={`admin-toast-v2 admin-toast-v2--${type}${leaving ? " leaving" : ""}`}
      role={type === "error" || type === "warning" ? "alert" : "status"}
      aria-label={`${LABELS[type]}: ${title}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="admin-toast-v2__icon">{ICONS[type]}</div>

      <div className="admin-toast-v2__body">
        <span className="admin-toast-v2__title">{title}</span>
        {message && <span className="admin-toast-v2__msg">{message}</span>}
      </div>

      <button className="admin-toast-v2__close" onClick={close} aria-label="Cerrar notificación">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M2 2l10 10M12 2L2 12" />
        </svg>
      </button>

      <div
        className={`admin-toast-v2__bar${paused ? " paused" : ""}`}
        style={{ animationDuration: `${total}ms` }}
      />
    </div>
  )
}
