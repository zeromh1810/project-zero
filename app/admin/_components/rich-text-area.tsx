"use client"

import { useEffect } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Placeholder } from "@tiptap/extension-placeholder"

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: number
}

// Editor rico headless — la UI del toolbar es nuestra, no la que trae Tiptap
// por defecto. Solo quedan registradas las marcas/nodos con botón visible
// (bold, italic, bulletList, orderedList): todo lo demás del StarterKit
// (heading, blockquote, code, link, underline, strike...) está desactivado
// a propósito, para que el HTML resultante sea exactamente el que el
// sanitizador del lado público espera (ver components/portfolio/rich-text.tsx).
export default function RichTextArea({ value, onChange, placeholder, minHeight }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        link: false,
        strike: false,
        underline: false,
      }),
      Placeholder.configure({ placeholder: placeholder || "" }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  // El value llega por fetch async (efecto del tab padre) después del mount
  // inicial — hay que empujar ese contenido al editor cuando cambia desde
  // afuera, pero solo si de verdad es distinto al que el editor ya tiene
  // (si no, cada re-render pisaría la posición del cursor mientras se escribe).
  useEffect(() => {
    if (!editor) return
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [value, editor])

  if (!editor) return null

  return (
    <div className="admin-richtext" style={minHeight ? ({ "--rt-min-h": `${minHeight}px` } as React.CSSProperties) : undefined}>
      <div className="admin-richtext-toolbar" role="toolbar" aria-label="Formato de texto">
        <button
          type="button"
          className={`admin-richtext-btn${editor.isActive("bold") ? " active" : ""}`}
          onClick={() => editor.chain().focus().toggleBold().run()}
          aria-label="Negrita" aria-pressed={editor.isActive("bold")} title="Negrita"
        ><strong>B</strong></button>
        <button
          type="button"
          className={`admin-richtext-btn${editor.isActive("italic") ? " active" : ""}`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Cursiva" aria-pressed={editor.isActive("italic")} title="Cursiva"
        ><em>I</em></button>
        <span className="admin-richtext-sep" aria-hidden="true" />
        <button
          type="button"
          className={`admin-richtext-btn${editor.isActive("bulletList") ? " active" : ""}`}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Lista con viñetas" aria-pressed={editor.isActive("bulletList")} title="Lista con viñetas"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <circle cx="2.5" cy="4" r="1" fill="currentColor" stroke="none" /><line x1="6" y1="4" x2="14" y2="4" />
            <circle cx="2.5" cy="8" r="1" fill="currentColor" stroke="none" /><line x1="6" y1="8" x2="14" y2="8" />
            <circle cx="2.5" cy="12" r="1" fill="currentColor" stroke="none" /><line x1="6" y1="12" x2="14" y2="12" />
          </svg>
        </button>
        <button
          type="button"
          className={`admin-richtext-btn${editor.isActive("orderedList") ? " active" : ""}`}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          aria-label="Lista numerada" aria-pressed={editor.isActive("orderedList")} title="Lista numerada"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
            <text x="0" y="5.5" fontSize="4.5" fill="currentColor" stroke="none">1.</text><line x1="6" y1="4" x2="14" y2="4" />
            <text x="0" y="9.5" fontSize="4.5" fill="currentColor" stroke="none">2.</text><line x1="6" y1="8" x2="14" y2="8" />
            <text x="0" y="13.5" fontSize="4.5" fill="currentColor" stroke="none">3.</text><line x1="6" y1="12" x2="14" y2="12" />
          </svg>
        </button>
      </div>
      <EditorContent editor={editor} className="admin-textarea admin-textarea--richtext" />
    </div>
  )
}
