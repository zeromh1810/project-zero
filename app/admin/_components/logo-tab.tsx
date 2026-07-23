"use client"

import { useState, useEffect, useRef, ChangeEvent } from "react"

import type { ToastType } from "./admin-toast"
import { invalidateLogo } from "@/lib/hooks/use-logo"

interface Props {
  onToast: (title: string, type: ToastType, msg?: string) => void
}

interface LogoForm {
  lightUrl: string
  darkUrl: string
  fallbackText: string
}

const EMPTY: LogoForm = { lightUrl: "", darkUrl: "", fallbackText: "Project Zero" }

async function uploadSvg(file: File): Promise<string> {
  if (!file.name.toLowerCase().endsWith(".svg") && file.type !== "image/svg+xml") {
    throw new Error("Solo se aceptan archivos .svg")
  }
  if (file.size > 500 * 1024) {
    throw new Error("El SVG supera el límite de 500 KB")
  }
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error("No se pudo leer el archivo SVG"))
    reader.readAsDataURL(file)
  })
}

/* ── Zona de upload individual ── */
function UploadZone({
  label,
  bgStyle,
  url,
  uploading,
  onFile,
  onRemove,
}: {
  label: string
  bgStyle: React.CSSProperties
  url: string
  uploading: boolean
  onFile: (file: File) => void
  onRemove: () => void
}) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) onFile(file)
  }

  return (
    <div>
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
        textTransform: "uppercase", color: "var(--txt3)", marginBottom: 10,
      }}>
        {label}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".svg,image/svg+xml"
        style={{ display: "none" }}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0]
          if (file) onFile(file)
          e.target.value = ""
        }}
      />

      {url ? (
        /* ── Preview con fondo del modo correspondiente ── */
        <div style={{
          ...bgStyle,
          borderRadius: 14,
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          minHeight: 80,
        }}>
          <img
            src={url}
            alt={`Logo ${label}`}
            loading="lazy"
            style={{ height: 32, width: "auto", maxWidth: 140, objectFit: "contain", display: "block" }}
          />
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <button
              onClick={() => inputRef.current?.click()}
              style={{
                padding: "6px 12px", borderRadius: 7, border: "none",
                background: "#2997ff", color: "white", fontSize: 11,
                fontWeight: 600, cursor: "pointer",
                boxShadow: "0 2px 8px rgba(41,151,255,0.35)",
                transition: "opacity 150ms ease",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              Cambiar
            </button>
            <button
              onClick={onRemove}
              style={{
                padding: "6px 12px", borderRadius: 7, border: "none",
                background: "#ef4444", color: "white", fontSize: 11,
                fontWeight: 600, cursor: "pointer",
                boxShadow: "0 2px 8px rgba(239,68,68,0.35)",
                transition: "opacity 150ms ease",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              Quitar
            </button>
          </div>
        </div>
      ) : (
        /* ── Drop zone vacía ── */
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragging ? "var(--accent)" : "var(--border)"}`,
            borderRadius: 14,
            padding: "28px 20px",
            textAlign: "center",
            cursor: uploading ? "default" : "pointer",
            background: dragging ? "rgba(41,151,255,0.05)" : "var(--bg3)",
            transition: "all 0.2s ease",
            minHeight: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {uploading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--txt2)" }}>
              <div className="admin-spinner" />
              <span style={{ fontSize: 13 }}>Subiendo…</span>
            </div>
          ) : (
            <div style={{ color: "var(--txt3)" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.5" style={{ margin: "0 auto 8px", display: "block" }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--txt)", marginBottom: 2 }}>
                Subir SVG
              </div>
              <div style={{ fontSize: 11 }}>Arrastra o haz click · máx. 500 KB</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Main component ── */
export default function LogoTab({ onToast }: Props) {
  const [form, setForm] = useState<LogoForm>(EMPTY)
  const [saved, setSaved] = useState<LogoForm>(EMPTY)
  const [uploadingLight, setUploadingLight] = useState(false)
  const [uploadingDark, setUploadingDark]  = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const hasChanges = JSON.stringify(form) !== JSON.stringify(saved)

  useEffect(() => {
    fetch("/api/admin/logo", { cache: "no-store" })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(d => {
        const loaded: LogoForm = { ...EMPTY, ...d }
        setForm(loaded)
        setSaved(loaded)
      })
      .catch(() => onToast("Error cargando logo", "error"))
      .finally(() => setLoading(false))
  }, [])

  async function handleUpload(file: File, variant: "light" | "dark") {
    if (variant === "light") setUploadingLight(true)
    else setUploadingDark(true)
    try {
      const url = await uploadSvg(file)
      setForm(prev => ({ ...prev, [variant === "light" ? "lightUrl" : "darkUrl"]: url }))
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Error al subir", "error")
    } finally {
      if (variant === "light") setUploadingLight(false)
      else setUploadingDark(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/logo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setSaved({ ...form })
      invalidateLogo()
      if (data._githubWarning) {
        onToast("Logo guardado localmente", "warning", "No se pudo sincronizar con GitHub. Los cambios se perderán en el próximo deploy.")
      } else {
        onToast("Logo guardado correctamente", "success")
      }
    } catch {
      onToast("Error al guardar", "error")
    } finally {
      setSaving(false)
    }
  }

  const activeUrl = form.lightUrl || form.darkUrl

  if (loading) {
    return (
      <div style={{ padding: "48px 0", display: "flex", justifyContent: "center", alignItems: "center", gap: 10, color: "var(--txt3)", fontSize: 14 }}>
        <div className="admin-spinner" />
        Cargando logo…
      </div>
    )
  }

  return (
    <>
      {/* ── Header ── */}
      <div className="admin-section-header">
        <div>
          <div className="admin-section-title">Logo del sitio</div>
          <div className="admin-section-sub">
            Personaliza el logo y el texto de la barra de navegación
          </div>
        </div>
        <button
          className="btn-p"
          onClick={handleSave}
          disabled={saving || !hasChanges}
        >
          {saving ? "Guardando…" : hasChanges ? "Guardar cambios" : "Sin cambios"}
        </button>
      </div>

      {/* ── Texto por defecto ── */}
      <div className="admin-card" style={{ marginBottom: 16 }}>
        <div className="admin-card-title">Texto por defecto</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "flex-end" }}>
          <div className="admin-field" style={{ marginBottom: 0 }}>
            <label className="admin-label">Nombre del sitio</label>
            <input
              className="admin-input"
              value={form.fallbackText}
              onChange={e => setForm(prev => ({ ...prev, fallbackText: e.target.value }))}
              placeholder="Project Zero"
              maxLength={40}
            />
          </div>
          {/* Live preview */}
          <div style={{
            height: 42,
            padding: "0 16px",
            background: "var(--bg3)",
            border: "1.5px solid var(--border)",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "var(--portfolio-heading-font)",
            fontWeight: 700,
            fontSize: 15,
            color: "var(--txt)",
            whiteSpace: "nowrap",
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)", display: "inline-block", flexShrink: 0 }} />
            {form.fallbackText || "Project Zero"}
          </div>
        </div>
        <div className="admin-input-hint" style={{ marginTop: 8 }}>
          Se muestra cuando no hay ningún archivo SVG subido. Máx. 40 caracteres.
        </div>
      </div>

      {/* ── Logos por modo ── */}
      <div className="admin-card" style={{ marginBottom: 16 }}>
        <div className="admin-card-title">Logos por modo de visualización</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <UploadZone
            label="Versión modo claro"
            bgStyle={{
              background: "rgba(248,248,248,0.95)",
              border: "1.5px solid rgba(0,0,0,0.08)",
            }}
            url={form.lightUrl}
            uploading={uploadingLight}
            onFile={file => handleUpload(file, "light")}
            onRemove={() => setForm(prev => ({ ...prev, lightUrl: "" }))}
          />
          <UploadZone
            label="Versión modo oscuro"
            bgStyle={{
              background: "rgba(10,10,10,0.92)",
              border: "1.5px solid rgba(255,255,255,0.08)",
            }}
            url={form.darkUrl}
            uploading={uploadingDark}
            onFile={file => handleUpload(file, "dark")}
            onRemove={() => setForm(prev => ({ ...prev, darkUrl: "" }))}
          />
        </div>

        <div className="admin-input-hint" style={{ marginTop: 12 }}>
          Puedes subir solo uno y se usará para ambos modos. SVG con fondo transparente recomendado.
          Proporciones sugeridas: 120 × 32 px.
        </div>
      </div>

      {/* ── Vista previa de la navbar ── */}
      {activeUrl && (
        <div className="admin-card" style={{ marginBottom: 16 }}>
          <div className="admin-card-title">Cómo se verá en la navbar</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Light navbar simulation */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--txt3)", marginBottom: 6 }}>
                Modo claro
              </div>
              <div style={{
                background: "rgba(248,248,248,0.88)",
                border: "1px solid rgba(0,0,0,0.07)",
                borderRadius: 12,
                padding: "0 20px",
                height: 52,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  {(form.lightUrl || form.darkUrl) ? (
                    <img
                      src={form.lightUrl || form.darkUrl}
                      alt="logo"
                      loading="lazy"
                      style={{ height: 24, width: "auto", objectFit: "contain" }}
                    />
                  ) : (
                    <span style={{ fontFamily: "var(--portfolio-heading-font)", fontWeight: 700, fontSize: 14, color: "#1d1d1f", display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
                      {form.fallbackText || "Project Zero"}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#6e6e73" }}>
                  <span>Trabajos</span><span>Sobre Mí</span><span>CV</span>
                </div>
                <div style={{ width: 60, height: 24, borderRadius: 12, background: "rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.08)" }} />
              </div>
            </div>
            {/* Dark navbar simulation */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--txt3)", marginBottom: 6 }}>
                Modo oscuro
              </div>
              <div style={{
                background: "rgba(0,0,0,0.78)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 12,
                padding: "0 20px",
                height: 52,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  {(form.darkUrl || form.lightUrl) ? (
                    <img
                      src={form.darkUrl || form.lightUrl}
                      alt="logo"
                      loading="lazy"
                      style={{ height: 24, width: "auto", objectFit: "contain" }}
                    />
                  ) : (
                    <span style={{ fontFamily: "var(--portfolio-heading-font)", fontWeight: 700, fontSize: 14, color: "#f5f5f7", display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
                      {form.fallbackText || "Project Zero"}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#86868b" }}>
                  <span>Trabajos</span><span>Sobre Mí</span><span>CV</span>
                </div>
                <div style={{ width: 60, height: 24, borderRadius: 12, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.08)" }} />
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ── Estado sin logo ── */}
      {!activeUrl && !uploadingLight && !uploadingDark && (
        <div className="admin-card" style={{ textAlign: "center", padding: "32px 24px" }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>✦</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--txt)", marginBottom: 4 }}>
            Sin logo SVG subido
          </div>
          <div style={{ fontSize: 13, color: "var(--txt3)" }}>
            La navbar mostrará el texto &quot;{form.fallbackText || "Project Zero"}&quot; como identidad visual.
          </div>
        </div>
      )}
    </>
  )
}
