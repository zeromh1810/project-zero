"use client"

import { useState } from "react"

export type ToastType = "success" | "error" | "warning" | "info"

export interface AdminToastProps {
  type: ToastType
  title: string
  message?: string
  onClose: () => void
  isLeaving?: boolean
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

export default function AdminToast({ type, title, message, onClose, isLeaving }: AdminToastProps) {
  const [paused, setPaused] = useState(false)

  return (
    <div
      className={`admin-toast-v2 admin-toast-v2--${type}${isLeaving ? " leaving" : ""}`}
      role="alert"
      aria-live="polite"
      aria-label={`${LABELS[type]}: ${title}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="admin-toast-v2__icon">{ICONS[type]}</div>

      <div className="admin-toast-v2__body">
        <span className="admin-toast-v2__title">{title}</span>
        {message && <span className="admin-toast-v2__msg">{message}</span>}
      </div>

      <button
        className="admin-toast-v2__close"
        onClick={onClose}
        aria-label="Cerrar notificación"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M2 2l10 10M12 2L2 12" />
        </svg>
      </button>

      <div className={`admin-toast-v2__bar${paused ? " paused" : ""}`} />
    </div>
  )
}
