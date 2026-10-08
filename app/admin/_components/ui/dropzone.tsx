"use client"

import { useRef, useState, useId, type DragEvent } from "react"
import { useLatest, usePresence } from "@/lib/motion"
import { UploadIcon, ImageIcon } from "@/components/portfolio/icons"

interface DropzoneProps {
  /** URL actual (si hay imagen cargada). */
  value?: string
  /** Sube el archivo y devuelve la URL (o lanza error con mensaje). */
  onUpload: (file: File) => Promise<void>
  onRemove?: () => void
  /** Etiqueta accesible y visible del área ("Imagen de portada"). */
  label: string
  /** Formatos y límites, ej. "JPG, PNG o WebP · máx. 2 MB". */
  hint?: string
  accept?: string
  /** Proporción del preview, ej. "16 / 9". */
  aspect?: string
  /** Fondo del preview (logos claros/oscuros). */
  previewBg?: string
  disabled?: boolean
}

// Dropzone único del admin (DS v2.1.0, AM-5/AM-6). Reemplaza tres versiones
// distintas (Blog, Logo, Marcas) y corrige dos problemas:
//  - el área era un <div onClick> (no operable con teclado) → ahora <button>;
//  - el blog decía "arrastra una imagen" sin aceptar drop → drop real.
// Con imagen cargada, "Cambiar" y "Quitar" quedan SIEMPRE visibles bajo el
// preview (antes aparecían solo con hover: invisibles en touch y con teclado).
export function Dropzone({
  value, onUpload, onRemove, label, hint, accept = "image/*", aspect = "16 / 9", previewBg, disabled,
}: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const err = usePresence(!!error)
  const errText = useLatest(error, err.exiting)

  const handle = async (file?: File | null) => {
    if (!file) return
    if (accept !== "*" && accept.startsWith("image/") && !file.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen.")
      return
    }
    setError(null)
    setUploading(true)
    try { await onUpload(file) }
    catch (err) { setError(err instanceof Error ? err.message : "No se pudo subir el archivo.") }
    finally { setUploading(false) }
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (!disabled && !uploading) handle(e.dataTransfer.files?.[0])
  }

  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined

  return (
    <div className="a-drop">
      <div className="a-field-label" id={`${id}-label`}>{label}</div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => { handle(e.target.files?.[0]); e.target.value = "" }}
      />

      {value ? (
        <>
          <div className="a-drop-preview" style={{ aspectRatio: aspect, background: previewBg }}>
            <img src={value} alt="" />
            {uploading && <div className="a-drop-busy"><span className="admin-spinner" aria-hidden="true" />Subiendo…</div>}
          </div>
          <div className="a-drop-actions">
            <button type="button" className="a-btn a-btn--ghost a-btn--sm" onClick={() => inputRef.current?.click()}
              disabled={disabled || uploading} aria-describedby={describedBy}>
              <UploadIcon /> Cambiar
            </button>
            {onRemove && (
              <button type="button" className="a-btn a-btn--danger-ghost a-btn--sm" onClick={onRemove} disabled={disabled || uploading}>
                Quitar
              </button>
            )}
          </div>
        </>
      ) : (
        <button
          type="button"
          className={`a-drop-zone${dragging ? " is-dragging" : ""}`}
          style={{ aspectRatio: aspect }}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          disabled={disabled || uploading}
          aria-labelledby={`${id}-label`}
          aria-describedby={describedBy}
          aria-busy={uploading || undefined}
        >
          {uploading ? (
            <><span className="admin-spinner" aria-hidden="true" /><span>Subiendo…</span></>
          ) : (
            <>
              <span className="a-drop-icon">{dragging ? <UploadIcon size={22} /> : <ImageIcon size={22} />}</span>
              <span className="a-drop-text">{dragging ? "Suelta para subir" : <>Arrastra una imagen o <u>elige un archivo</u></>}</span>
            </>
          )}
        </button>
      )}

      {err.mounted && (
        <p id={err.exiting ? undefined : errorId} className={`a-field-error${err.exiting ? " is-exiting" : ""}`} role={err.exiting ? undefined : "alert"}>{errText}</p>
      )}
      {hint && <p id={hintId} className="a-field-hint">{hint}</p>}
    </div>
  )
}
