"use client"

import { useEffect, useRef, useState, type KeyboardEvent } from "react"
import { motionMs } from "@/lib/motion"
import { CloseIcon } from "@/components/portfolio/icons"
import type { FieldControlProps } from "./field"

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  /** Props de Field (id, aria-describedby…) para el input interno. */
  control: FieldControlProps
  max?: number
  placeholder?: string
  /** Normaliza cada tag (ej. a minúsculas). */
  normalize?: (raw: string) => string
}

// Input de etiquetas (DS v2.1.0). Reemplaza tres implementaciones (Blog,
// Proyectos, Sobre mí). Enter o coma agrega; Backspace en vacío quita la
// última; cada chip tiene su botón de quitar con nombre accesible; al llegar
// al máximo el input se deshabilita y lo dice.
export function TagInput({ value, onChange, control, max = 10, placeholder = "Escribe y presiona Enter", normalize = (s) => s.trim() }: TagInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const full = value.length >= max
  // Etiquetas saliendo: se ven achicándose --dur-exit antes de quitarse.
  const [leaving, setLeaving] = useState<string[]>([])
  // El timer de salida usa siempre la lista actual (dos borrados seguidos no
  // deben revivir el primero).
  const valueRef = useRef(value)
  useEffect(() => { valueRef.current = value })
  const remove = (tag: string) => {
    if (leaving.includes(tag)) return
    setLeaving((l) => [...l, tag])
    window.setTimeout(() => {
      setLeaving((l) => l.filter((t) => t !== tag))
      // Se actualiza la referencia en el acto: si otro borrado vence antes del
      // próximo render, parte de esta lista y no de la anterior.
      const next = valueRef.current.filter((t) => t !== tag)
      valueRef.current = next
      onChange(next)
    }, motionMs("--dur-exit"))
  }

  const add = (raw: string) => {
    const tag = normalize(raw.replace(/,+$/, ""))
    if (!tag || value.includes(tag) || full) return
    onChange([...value, tag])
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      add(e.currentTarget.value)
      e.currentTarget.value = ""
    } else if (e.key === "Backspace" && !e.currentTarget.value && value.length) {
      remove(value[value.length - 1])
    }
  }

  return (
    <div className="admin-chips-wrap" onClick={() => inputRef.current?.focus()}>
      {value.map((tag) => (
        <span key={tag} className={`admin-chip${leaving.includes(tag) ? " is-exiting" : ""}`}>
          {tag}
          <button
            type="button"
            className="admin-chip-x"
            onClick={(e) => { e.stopPropagation(); remove(tag) }}
            aria-label={`Quitar etiqueta ${tag}`}
          >
            <CloseIcon size={12} />
          </button>
        </span>
      ))}
      <input
        {...control}
        ref={inputRef}
        className="admin-chip-input"
        placeholder={full ? `Máximo ${max}` : placeholder}
        disabled={full}
        onKeyDown={onKeyDown}
        onBlur={(e) => { if (e.target.value.trim()) { add(e.target.value); e.target.value = "" } }}
      />
    </div>
  )
}
