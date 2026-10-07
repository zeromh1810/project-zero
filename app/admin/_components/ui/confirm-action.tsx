"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { TrashIcon } from "@/components/portfolio/icons"

interface ConfirmActionProps {
  /** Acción a confirmar (ej. borrar). Puede ser async. */
  onConfirm: () => void | Promise<void>
  /** Texto del botón inicial. */
  label?: string
  /** Pregunta visible al pedir confirmación. */
  question?: string
  confirmLabel?: string
  /** Nombre del elemento afectado, para el nombre accesible ("Eliminar «Mi post»"). */
  itemName?: string
  icon?: ReactNode
  disabled?: boolean
}

// Confirmación destructiva en línea (DS v2.1.0, AM-2). Un solo patrón para
// todo lo irreversible del admin — antes Proyectos confirmaba y Blog borraba
// al instante (y el borrado se commitea a GitHub: desaparece del sitio).
// Al pedir confirmación el foco va a "Cancelar" (la opción segura); ESC
// cancela; mientras corre la acción, los botones quedan deshabilitados.
export function ConfirmAction({
  onConfirm,
  label = "Eliminar",
  question = "¿Eliminar?",
  confirmLabel = "Sí, eliminar",
  itemName,
  icon = <TrashIcon />,
  disabled,
}: ConfirmActionProps) {
  const [asking, setAsking] = useState(false)
  const [busy, setBusy] = useState(false)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (asking) cancelRef.current?.focus()
  }, [asking])

  const cancel = () => {
    setAsking(false)
    // devolver el foco al botón original
    requestAnimationFrame(() => triggerRef.current?.focus())
  }

  const confirm = async () => {
    setBusy(true)
    try { await onConfirm() } finally { setBusy(false); setAsking(false) }
  }

  if (!asking) {
    return (
      <button
        ref={triggerRef}
        type="button"
        className="a-btn a-btn--danger-ghost a-btn--sm"
        onClick={() => setAsking(true)}
        disabled={disabled}
        aria-label={itemName ? `${label} «${itemName}»` : undefined}
      >
        {icon}
        {label}
      </button>
    )
  }

  return (
    <div
      className="a-confirm"
      role="group"
      aria-label={itemName ? `Confirmar: ${label.toLowerCase()} «${itemName}»` : "Confirmar acción"}
      onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); cancel() } }}
    >
      <span className="a-confirm-q">{question}</span>
      <button type="button" className="a-btn a-btn--danger a-btn--sm" onClick={confirm} disabled={busy} aria-busy={busy || undefined}>
        {busy ? "Eliminando…" : confirmLabel}
      </button>
      <button ref={cancelRef} type="button" className="a-btn a-btn--ghost a-btn--sm" onClick={cancel} disabled={busy}>
        Cancelar
      </button>
    </div>
  )
}
