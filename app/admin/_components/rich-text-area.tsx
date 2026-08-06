"use client"

import { useRef } from "react"

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: number
}

// Envuelve la selección actual del textarea en <strong>/<em> — el mismo
// markup que RichText (components/portfolio/rich-text.tsx) sabe interpretar
// del lado público. No hay estado "activo/inactivo" por selección: cada
// click envuelve, no hay toggle de-formatear.
export default function RichTextArea({ value, onChange, placeholder, minHeight }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null)

  function wrap(tag: "strong" | "em") {
    const el = ref.current
    if (!el) return
    const { selectionStart, selectionEnd } = el
    if (selectionStart === selectionEnd) return // nada seleccionado, no hay qué envolver

    const selected = value.slice(selectionStart, selectionEnd)
    const before   = value.slice(0, selectionStart)
    const after    = value.slice(selectionEnd)
    const open     = `<${tag}>`
    const close    = `</${tag}>`

    onChange(`${before}${open}${selected}${close}${after}`)

    // Restaura el foco y selección sobre el texto recién envuelto —
    // requestAnimationFrame porque el value nuevo llega por props un tick
    // después del onChange (estado del padre, no del propio textarea).
    requestAnimationFrame(() => {
      el.focus()
      const start = selectionStart + open.length
      el.setSelectionRange(start, start + selected.length)
    })
  }

  return (
    <div className="admin-richtext">
      <div className="admin-richtext-toolbar" role="toolbar" aria-label="Formato de texto">
        <button type="button" className="admin-richtext-btn" onClick={() => wrap("strong")} aria-label="Negrita" title="Negrita — selecciona texto primero">
          <strong>B</strong>
        </button>
        <button type="button" className="admin-richtext-btn" onClick={() => wrap("em")} aria-label="Cursiva" title="Cursiva — selecciona texto primero">
          <em>I</em>
        </button>
      </div>
      <textarea
        ref={ref}
        className="admin-textarea admin-textarea--richtext"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={minHeight ? { minHeight } : undefined}
      />
    </div>
  )
}
