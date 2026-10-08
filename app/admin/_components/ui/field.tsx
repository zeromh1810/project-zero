"use client"

import { useId, type ReactNode } from "react"
import { useLatest, usePresence } from "@/lib/motion"

/** Props que Field inyecta en el control: conectan label, ayuda y error. */
export interface FieldControlProps {
  id: string
  "aria-describedby"?: string
  "aria-invalid"?: true
  "aria-required"?: true
}

interface FieldProps {
  label: string
  /** Texto de ayuda bajo el campo (formato, límites). */
  hint?: ReactNode
  /** Mensaje de error; si existe, marca el control como inválido. */
  error?: string
  required?: boolean
  /** Contenido extra a la derecha del label (ej. contador "3/10"). */
  aside?: ReactNode
  className?: string
  /** El control recibe id + aria-* para quedar asociado al label (AM-1).
   *  `meta.labelId` sirve a controles que no son <input> (editor rico → aria-labelledby). */
  children: (control: FieldControlProps, meta: { labelId: string; invalid: boolean }) => ReactNode
}

// Campo del admin (DS v2.1.0). Antes: 40 <label> y 0 htmlFor en todo el panel
// — ningún input tenía nombre accesible. Field genera el id, lo conecta al
// label y describe el control con la ayuda y el error (aria-describedby).
// El error se muestra BAJO el campo, no en un toast.
export function Field({ label, hint, error, required, aside, className = "", children }: FieldProps) {
  const id = useId()
  // El error entra al validar y se desvanece al corregirlo, con su texto
  // hasta el final de la salida (lib/motion).
  const err = usePresence(!!error)
  const errText = useLatest(error, err.exiting)
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined

  return (
    <div className={`a-field${error ? " a-field--error" : ""} ${className}`}>
      <div className="a-field-head">
        <label className="a-field-label" htmlFor={id} id={`${id}-label`}>
          {label}
          {required && <span className="a-field-req" aria-hidden="true"> *</span>}
        </label>
        {aside && <span className="a-field-aside">{aside}</span>}
      </div>
      {children({
        id,
        "aria-describedby": describedBy,
        ...(error ? { "aria-invalid": true as const } : {}),
        ...(required ? { "aria-required": true as const } : {}),
      }, { labelId: `${id}-label`, invalid: !!error })}
      {err.mounted && (
        <p id={err.exiting ? undefined : errorId} className={`a-field-error${err.exiting ? " is-exiting" : ""}`}>{errText}</p>
      )}
      {hint && <p id={hintId} className="a-field-hint">{hint}</p>}
    </div>
  )
}
