"use client"

import { useRef, type KeyboardEvent } from "react"
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
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div className="admin-chips-wrap" onClick={() => inputRef.current?.focus()}>
      {value.map((tag) => (
        <span key={tag} className="admin-chip">
          {tag}
          <button
            type="button"
            className="admin-chip-x"
            onClick={(e) => { e.stopPropagation(); onChange(value.filter((t) => t !== tag)) }}
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
