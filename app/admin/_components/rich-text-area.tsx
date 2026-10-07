"use client"

import { useEffect, useRef, useState } from "react"
import { useEditor, useEditorState, EditorContent, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Placeholder } from "@tiptap/extension-placeholder"
import { Image } from "@tiptap/extension-image"
import { uploadImage } from "./upload"

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: number
  /** "simple": negrita, cursiva y listas (hero, sobre mí...).
   *  "full": editor tipo entrada de WordPress — títulos, subrayado, tachado,
   *  cita, separador, enlaces e imágenes (subir, arrastrar o pegar). */
  variant?: "simple" | "full"
  /** v2.1.0 — id del label visible (Field): da nombre accesible al editor. */
  labelledBy?: string
  /** Ayuda / error del campo (Field) para lectores de pantalla. */
  describedBy?: string
  invalid?: boolean
}

// Editor rico headless — la UI del toolbar es nuestra, no la que trae Tiptap
// por defecto. Solo quedan registradas las marcas/nodos con botón visible:
// todo lo demás del StarterKit está desactivado a propósito, para que el HTML
// resultante sea exactamente el que el sanitizador del lado público espera
// (ver components/portfolio/rich-text.tsx — SIMPLE_TAGS / FULL_TAGS).
function buildExtensions(variant: "simple" | "full", placeholder: string) {
  if (variant === "simple") {
    return [
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
      Placeholder.configure({ placeholder }),
    ]
  }
  return [
    StarterKit.configure({
      // h3/h4: dentro del detalle del proyecto cada bloque ya cuelga de un
      // <h3> de sección ("EL DESAFÍO"...), así que los títulos del contenido
      // bajan un nivel para no romper la jerarquía del documento.
      heading: { levels: [3, 4] },
      code: false,
      codeBlock: false,
      link: {
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer nofollow" },
      },
    }),
    Image.configure({ inline: false, allowBase64: false }),
    Placeholder.configure({ placeholder }),
  ]
}

function altFromFilename(name: string) {
  return name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim()
}

export default function RichTextArea({ value, onChange, placeholder, minHeight, variant = "simple", labelledBy, describedBy, invalid }: Props) {
  const [uploading, setUploading] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)
  const editorRef = useRef<Editor | null>(null)

  // Sube N imágenes en paralelo y las inserta en orden en `pos` (drop) o en
  // la posición del cursor (botón / pegar). Vive en un ref porque los
  // handlers de editorProps se registran una sola vez al crear el editor.
  const insertFilesRef = useRef<(files: File[], pos?: number) => void>(() => {})
  insertFilesRef.current = async (files, pos) => {
    const ed = editorRef.current
    if (!ed || files.length === 0) return
    setError(null)
    setUploading(n => n + files.length)
    const results = await Promise.allSettled(files.map(uploadImage))
    setUploading(n => n - files.length)

    const nodes = results.flatMap((r, i) =>
      r.status === "fulfilled" ? [{ type: "image", attrs: { src: r.value, alt: altFromFilename(files[i].name) } }] : []
    )
    const failed = results.find((r): r is PromiseRejectedResult => r.status === "rejected")
    if (failed) setError(failed.reason instanceof Error ? failed.reason.message : "Error al subir la imagen")
    if (nodes.length === 0) return

    const chain = ed.chain().focus()
    if (pos !== undefined) chain.insertContentAt(pos, nodes)
    else chain.insertContent(nodes)
    chain.run()
  }

  const editor = useEditor({
    immediatelyRender: false,
    extensions: buildExtensions(variant, placeholder || ""),
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      // El contenteditable no tenía nombre accesible (AM-1).
      attributes: {
        role: "textbox",
        "aria-multiline": "true",
        ...(labelledBy ? { "aria-labelledby": labelledBy } : {}),
        ...(describedBy ? { "aria-describedby": describedBy } : {}),
        ...(invalid ? { "aria-invalid": "true" } : {}),
      },
      ...(variant === "full" ? {
      handleDrop: (view, event, _slice, moved) => {
        if (moved) return false
        const files = Array.from(event.dataTransfer?.files ?? []).filter(f => f.type.startsWith("image/"))
        if (files.length === 0) return false
        event.preventDefault()
        const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos
        insertFilesRef.current(files, pos)
        return true
      },
      handlePaste: (_view, event) => {
        const files = Array.from(event.clipboardData?.files ?? []).filter(f => f.type.startsWith("image/"))
        if (files.length === 0) return false
        event.preventDefault()
        insertFilesRef.current(files)
        return true
      },
    // {} y no undefined: Tiptap mezcla las opciones con spread, así que un
    // undefined explícito pisa su default {} y rompe la creación de la vista.
      } : {}),
    },
  })
  editorRef.current = editor

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

  // Tiptap v3 no re-renderiza el componente en cada transacción: los estados
  // activos del toolbar se derivan con useEditorState para que sigan al cursor.
  const live = useEditorState({
    editor,
    selector: ({ editor: e }) => e ? {
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      bulletList: e.isActive("bulletList"),
      orderedList: e.isActive("orderedList"),
      blockquote: e.isActive("blockquote"),
      link: e.isActive("link"),
      image: e.isActive("image"),
      imageAlt: (e.getAttributes("image").alt as string | undefined) ?? "",
      block: e.isActive("heading", { level: 3 }) ? "h3" : e.isActive("heading", { level: 4 }) ? "h4" : "p",
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    } : null,
  })

  // v2.1.0 — useEditorState solo se recalcula en la primera transacción del
  // editor. Si el contenido ya viene al montar (editar un proyecto existente)
  // no hay transacción, `live` quedaba en null para siempre y este componente
  // devolvía null: el editor era INVISIBLE en "Editar proyecto". El editor se
  // muestra apenas existe; el toolbar usa el estado por defecto hasta tener
  // el real (que llega con el primer foco o tecla).
  if (!editor) return null
  const s = live ?? {
    bold: false, italic: false, underline: false, strike: false, bulletList: false,
    orderedList: false, blockquote: false, link: false, image: false, imageAlt: "",
    block: "p", canUndo: false, canRedo: false,
  }

  const btn = (active: boolean) => `admin-richtext-btn${active ? " active" : ""}`

  const openLink = () => {
    setLinkUrl((editor.getAttributes("link").href as string | undefined) ?? "")
    setLinkOpen(true)
  }

  const applyLink = () => {
    const href = linkUrl.trim()
    const chain = editor.chain().focus().extendMarkRange("link")
    if (!href) {
      chain.unsetLink().run()
    } else if (editor.state.selection.empty && !editor.isActive("link")) {
      // Sin texto seleccionado: inserta la URL misma como texto enlazado
      chain.insertContent({ type: "text", text: href, marks: [{ type: "link", attrs: { href } }] }).run()
    } else {
      chain.setLink({ href }).run()
    }
    setLinkOpen(false)
  }

  const setBlock = (block: string) => {
    const chain = editor.chain().focus()
    if (block === "p") chain.setParagraph().run()
    else chain.setHeading({ level: block === "h3" ? 3 : 4 }).run()
  }

  return (
    <div
      className={`admin-richtext${variant === "full" ? " admin-richtext--full" : ""}`}
      style={minHeight ? ({ "--rt-min-h": `${minHeight}px` } as React.CSSProperties) : undefined}
    >
      <div className="admin-richtext-toolbar" role="toolbar" aria-label="Formato de texto">
        {variant === "full" && (
          <>
            <select
              className="admin-richtext-select"
              value={s.block}
              onChange={e => setBlock(e.target.value)}
              aria-label="Tipo de bloque"
            >
              <option value="p">Párrafo</option>
              <option value="h3">Título</option>
              <option value="h4">Subtítulo</option>
            </select>
            <span className="admin-richtext-sep" aria-hidden="true" />
          </>
        )}

        <button type="button" className={btn(s.bold)} onClick={() => editor.chain().focus().toggleBold().run()}
          aria-label="Negrita" aria-pressed={s.bold} title="Negrita (Ctrl+B)"><strong>B</strong></button>
        <button type="button" className={btn(s.italic)} onClick={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Cursiva" aria-pressed={s.italic} title="Cursiva (Ctrl+I)"><em>I</em></button>
        {variant === "full" && (
          <>
            <button type="button" className={btn(s.underline)} onClick={() => editor.chain().focus().toggleUnderline().run()}
              aria-label="Subrayado" aria-pressed={s.underline} title="Subrayado (Ctrl+U)"><u>U</u></button>
            <button type="button" className={btn(s.strike)} onClick={() => editor.chain().focus().toggleStrike().run()}
              aria-label="Tachado" aria-pressed={s.strike} title="Tachado"><s>S</s></button>
          </>
        )}

        <span className="admin-richtext-sep" aria-hidden="true" />

        <button type="button" className={btn(s.bulletList)} onClick={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Lista con viñetas" aria-pressed={s.bulletList} title="Lista con viñetas">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <circle cx="2.5" cy="4" r="1" fill="currentColor" stroke="none" /><line x1="6" y1="4" x2="14" y2="4" />
            <circle cx="2.5" cy="8" r="1" fill="currentColor" stroke="none" /><line x1="6" y1="8" x2="14" y2="8" />
            <circle cx="2.5" cy="12" r="1" fill="currentColor" stroke="none" /><line x1="6" y1="12" x2="14" y2="12" />
          </svg>
        </button>
        <button type="button" className={btn(s.orderedList)} onClick={() => editor.chain().focus().toggleOrderedList().run()}
          aria-label="Lista numerada" aria-pressed={s.orderedList} title="Lista numerada">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
            <text x="0" y="5.5" fontSize="4.5" fill="currentColor" stroke="none">1.</text><line x1="6" y1="4" x2="14" y2="4" />
            <text x="0" y="9.5" fontSize="4.5" fill="currentColor" stroke="none">2.</text><line x1="6" y1="8" x2="14" y2="8" />
            <text x="0" y="13.5" fontSize="4.5" fill="currentColor" stroke="none">3.</text><line x1="6" y1="12" x2="14" y2="12" />
          </svg>
        </button>

        {variant === "full" && (
          <>
            <button type="button" className={btn(s.blockquote)} onClick={() => editor.chain().focus().toggleBlockquote().run()}
              aria-label="Cita" aria-pressed={s.blockquote} title="Cita">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2 9.5C2 6.5 3.6 4.4 6.2 3.5l.5 1.1C5 5.4 4.3 6.6 4.2 7.8H6.5V13H2V9.5Zm7.5 0c0-3 1.6-5.1 4.2-6l.5 1.1c-1.7.8-2.4 2-2.5 3.2H14V13H9.5V9.5Z" />
              </svg>
            </button>
            <button type="button" className="admin-richtext-btn" onClick={() => editor.chain().focus().setHorizontalRule().run()}
              aria-label="Separador" title="Separador">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <line x1="2" y1="8" x2="14" y2="8" />
              </svg>
            </button>

            <span className="admin-richtext-sep" aria-hidden="true" />

            <button type="button" className={btn(s.link || linkOpen)} onClick={() => (linkOpen ? setLinkOpen(false) : openLink())}
              aria-label="Enlace" aria-pressed={s.link} aria-expanded={linkOpen} title="Enlace">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6.5 9.5a3 3 0 0 0 4.2 0l2.3-2.3a3 3 0 0 0-4.2-4.2l-.9.9" />
                <path d="M9.5 6.5a3 3 0 0 0-4.2 0L3 8.8A3 3 0 0 0 7.2 13l.9-.9" />
              </svg>
            </button>
            <button type="button" className="admin-richtext-btn" onClick={() => fileRef.current?.click()}
              aria-label="Insertar imagen" title="Insertar imagen (también puedes arrastrar o pegar)" disabled={uploading > 0}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1.75" y="2.75" width="12.5" height="10.5" rx="1.5" />
                <circle cx="5.5" cy="6.25" r="1.25" />
                <path d="m14.25 10.5-3.5-3.5-6.5 6.25" />
              </svg>
            </button>
            <input
              ref={fileRef} type="file" multiple hidden
              accept=".jpg,.jpeg,.png,.webp,.gif,.avif,.svg,image/*"
              onChange={e => {
                insertFilesRef.current(Array.from(e.target.files ?? []))
                e.target.value = ""
              }}
            />

            <span className="admin-richtext-spacer" />

            <button type="button" className="admin-richtext-btn" onClick={() => editor.chain().focus().undo().run()}
              disabled={!s.canUndo} aria-label="Deshacer" title="Deshacer (Ctrl+Z)">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 3 2 6l3 3" /><path d="M2 6h7.5a4.5 4.5 0 0 1 0 9H6" />
              </svg>
            </button>
            <button type="button" className="admin-richtext-btn" onClick={() => editor.chain().focus().redo().run()}
              disabled={!s.canRedo} aria-label="Rehacer" title="Rehacer (Ctrl+Shift+Z)">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="m11 3 3 3-3 3" /><path d="M14 6H6.5a4.5 4.5 0 0 0 0 9H10" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Barra contextual: edición de enlace o texto alternativo de la imagen seleccionada */}
      {variant === "full" && linkOpen && (
        <div className="admin-richtext-context">
          <span className="admin-richtext-context-label">URL</span>
          <input
            className="admin-input admin-richtext-context-input"
            value={linkUrl}
            autoFocus
            placeholder="https://…"
            onChange={e => setLinkUrl(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") { e.preventDefault(); applyLink() }
              if (e.key === "Escape") { e.preventDefault(); setLinkOpen(false); editor.commands.focus() }
            }}
          />
          <button type="button" className="admin-richtext-context-btn" onClick={applyLink}>Aplicar</button>
          {s.link && (
            <button type="button" className="admin-richtext-context-btn admin-richtext-context-btn--ghost"
              onClick={() => { editor.chain().focus().extendMarkRange("link").unsetLink().run(); setLinkOpen(false) }}>
              Quitar
            </button>
          )}
        </div>
      )}
      {variant === "full" && !linkOpen && s.image && (
        <div className="admin-richtext-context">
          <span className="admin-richtext-context-label">Texto alt</span>
          <input
            className="admin-input admin-richtext-context-input"
            value={s.imageAlt}
            placeholder="Describe la imagen para lectores de pantalla"
            onChange={e => editor.chain().updateAttributes("image", { alt: e.target.value }).run()}
          />
          <button type="button" className="admin-richtext-context-btn admin-richtext-context-btn--ghost"
            onClick={() => editor.chain().focus().deleteSelection().run()}>
            Eliminar
          </button>
        </div>
      )}

      <EditorContent editor={editor} className="admin-textarea admin-textarea--richtext" />

      {variant === "full" && (uploading > 0 || error) && (
        <div className={`admin-richtext-status${error && uploading === 0 ? " is-error" : ""}`} role="status">
          {uploading > 0 ? `Subiendo ${uploading === 1 ? "imagen" : `${uploading} imágenes`}…` : `✕ ${error}`}
        </div>
      )}
    </div>
  )
}
