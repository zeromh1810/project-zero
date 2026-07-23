"use client"

import { useState, useEffect, useRef, ChangeEvent } from "react"
import type { ToastType } from "./admin-toast"

interface Brand {
  id: string
  lightLogo: string
  darkLogo: string
}

interface Slot {
  key: string
  light: string
  dark: string
  upL: boolean
  upD: boolean
}

interface Props {
  onToast: (title: string, type: ToastType, msg?: string) => void
}

function makeSlot(): Slot {
  return { key: String(Date.now() + Math.random()), light: "", dark: "", upL: false, upD: false }
}

const MAX_FILE_SIZE = 600 * 1024 // 600 KB

function fileToDataUrl(file: File): Promise<string> {
  if (file.size > MAX_FILE_SIZE) {
    return Promise.reject(new Error(`El archivo supera el límite de 600 KB (${(file.size / 1024).toFixed(0)} KB)`))
  }
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"))
    reader.readAsDataURL(file)
  })
}

function UploadZone({
  label,
  bg,
  url,
  uploading,
  onFile,
  onRemove,
}: {
  label: string
  bg: React.CSSProperties
  url: string
  uploading: boolean
  onFile: (f: File) => void
  onRemove: () => void
}) {
  const [drag, setDrag] = useState(false)
  const ref = useRef<HTMLInputElement>(null)

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--txt3)", marginBottom: 8 }}>
        {label}
      </div>
      <input
        ref={ref}
        type="file"
        accept=".svg,.png,.webp,.jpg,.jpeg,image/svg+xml,image/png,image/webp,image/jpeg"
        style={{ display: "none" }}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""
        }}
      />
      {url ? (
        <div style={{ ...bg, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, minHeight: 72 }}>
          <img src={url} alt="" loading="lazy" style={{ height: 32, width: "auto", maxWidth: 130, objectFit: "contain" }} />
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => ref.current?.click()}
              style={{ padding: "5px 10px", borderRadius: 6, border: "none", background: "#2997ff", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
              Cambiar
            </button>
            <button onClick={onRemove}
              style={{ padding: "5px 10px", borderRadius: 6, border: "none", background: "#ef4444", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
              Quitar
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !uploading && ref.current?.click()}
          onDragOver={e => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) onFile(f) }}
          style={{
            border: `2px dashed ${drag ? "var(--accent)" : "var(--border)"}`,
            borderRadius: 12, minHeight: 72, display: "flex", alignItems: "center",
            justifyContent: "center", cursor: uploading ? "default" : "pointer",
            background: drag ? "rgba(41,151,255,0.05)" : "var(--bg3)",
            transition: "all 0.18s ease",
          }}
        >
          {uploading ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center", color: "var(--txt2)", fontSize: 13 }}>
              <div className="admin-spinner" /> Subiendo…
            </div>
          ) : (
            <div style={{ textAlign: "center", color: "var(--txt3)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto 4px", display: "block" }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <div style={{ fontSize: 12 }}>SVG · PNG · WebP · JPG</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function BrandsTab({ onToast }: Props) {
  const [brands,   setBrands]  = useState<Brand[]>([])
  const [slots,    setSlots]   = useState<Slot[]>([makeSlot()])
  const [adding,   setAdding]  = useState(false)
  const [loading,  setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/admin/brands", { cache: "no-store" })
      .then(r => r.json())
      .then(d => setBrands(Array.isArray(d.brands) ? d.brands : []))
      .catch(() => onToast("Error cargando marcas", "error"))
      .finally(() => setLoading(false))
  }, [])

  function patchSlot(key: string, patch: Partial<Slot>) {
    setSlots(prev => prev.map(s => s.key === key ? { ...s, ...patch } : s))
  }

  async function handleUpload(key: string, file: File, v: "light" | "dark") {
    patchSlot(key, v === "light" ? { upL: true } : { upD: true })
    try {
      const url = await fileToDataUrl(file)
      patchSlot(key, v === "light" ? { light: url } : { dark: url })
    } catch (e) {
      onToast(e instanceof Error ? e.message : "Error al subir", "error")
    } finally {
      patchSlot(key, v === "light" ? { upL: false } : { upD: false })
    }
  }

  function removeSlot(key: string) {
    setSlots(prev => prev.length > 1 ? prev.filter(s => s.key !== key) : prev)
  }

  const anyBusy = slots.some(s => s.upL || s.upD)
  const anyFilled = slots.some(s => s.light || s.dark)

  async function handleAdd() {
    const filled = slots.filter(s => s.light || s.dark)
    if (!filled.length) { onToast("Sube al menos un logo", "warning"); return }
    setAdding(true)
    try {
      const added: Brand[] = []
      for (const s of filled) {
        const res = await fetch("/api/admin/brands", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lightLogo: s.light, darkLogo: s.dark }),
        })
        if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
        added.push(await res.json())
      }
      setBrands(prev => [...prev, ...added])
      setSlots([makeSlot()])
      onToast(added.length === 1 ? "Marca agregada" : `${added.length} marcas agregadas`, "success")
    } catch (e) {
      onToast(e instanceof Error ? e.message : "Error al guardar", "error")
    } finally {
      setAdding(false)
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/brands?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setBrands(prev => prev.filter(b => b.id !== id))
      onToast("Marca eliminada", "success")
    } catch {
      onToast("Error al eliminar", "error")
    } finally {
      setDeleting(null)
    }
  }

  return (
    <>
      <div className="admin-section-header">
        <div>
          <div className="admin-section-title">He trabajado con</div>
          <div className="admin-section-sub">Logos que aparecen en el slider del portafolio</div>
        </div>
      </div>

      {/* ── Agregar ── */}
      <div className="admin-card" style={{ marginBottom: 16 }}>
        <div className="admin-card-title" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <span>Agregar logos</span>
          <button
            onClick={() => setSlots(prev => [...prev, makeSlot()])}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "5px 12px", borderRadius: 7, border: "none",
              background: "rgba(41,151,255,0.12)", color: "#2997ff",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Agregar otro logo
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {slots.map((slot, idx) => (
            <div key={slot.key}>
              {slots.length > 1 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--txt3)" }}>Logo #{idx + 1}</span>
                  <button
                    onClick={() => removeSlot(slot.key)}
                    style={{ padding: "3px 10px", borderRadius: 6, border: "none", background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                  >
                    Quitar
                  </button>
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <UploadZone
                  label="Versión modo claro"
                  bg={{ background: "rgba(248,248,248,0.95)", border: "1.5px solid rgba(0,0,0,0.08)" }}
                  url={slot.light} uploading={slot.upL}
                  onFile={f => handleUpload(slot.key, f, "light")}
                  onRemove={() => patchSlot(slot.key, { light: "" })}
                />
                <UploadZone
                  label="Versión modo oscuro"
                  bg={{ background: "rgba(10,10,10,0.92)", border: "1.5px solid rgba(255,255,255,0.08)" }}
                  url={slot.dark} uploading={slot.upD}
                  onFile={f => handleUpload(slot.key, f, "dark")}
                  onRemove={() => patchSlot(slot.key, { dark: "" })}
                />
              </div>
              {idx < slots.length - 1 && (
                <div style={{ height: 1, background: "var(--border)", marginTop: 16 }} />
              )}
            </div>
          ))}
        </div>

        <div className="admin-input-hint" style={{ marginTop: 14, marginBottom: 14 }}>
          Si subes solo una versión se usará para ambos modos. SVG recomendado · máx. 600 KB por archivo.
        </div>
        <button
          className="btn-p"
          onClick={handleAdd}
          disabled={adding || anyBusy || !anyFilled}
        >
          {adding ? "Guardando…" : slots.filter(s => s.light || s.dark).length > 1 ? `Agregar ${slots.filter(s => s.light || s.dark).length} logos al slider` : "Agregar al slider"}
        </button>
      </div>

      {/* ── Lista ── */}
      <div className="admin-card">
        <div className="admin-card-title">
          Logos en el slider
          <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 500, color: "var(--txt3)" }}>
            ({brands.length})
          </span>
        </div>

        {loading ? (
          <div style={{ padding: "24px 0", display: "flex", gap: 10, alignItems: "center", color: "var(--txt3)", fontSize: 14 }}>
            <div className="admin-spinner" /> Cargando…
          </div>
        ) : brands.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--txt3)", fontSize: 14 }}>
            Aún no hay logos. Agrega el primero arriba.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {brands.map((b, idx) => (
              <div key={b.id} style={{
                display: "grid", gridTemplateColumns: "90px 90px 1fr auto",
                gap: 10, alignItems: "center", padding: "10px 12px",
                background: "var(--bg3)", borderRadius: 10, border: "1px solid var(--border)",
              }}>
                <div style={{ background: "#f5f5f5", borderRadius: 8, padding: "8px 10px", display: "flex", alignItems: "center", justifyContent: "center", height: 48 }}>
                  {b.lightLogo
                    ? <img src={b.lightLogo} alt="" loading="lazy" style={{ maxHeight: 30, maxWidth: 80, objectFit: "contain" }} />
                    : <span style={{ fontSize: 10, color: "#aaa" }}>—</span>}
                </div>
                <div style={{ background: "#0a0a0a", borderRadius: 8, padding: "8px 10px", display: "flex", alignItems: "center", justifyContent: "center", height: 48 }}>
                  {b.darkLogo
                    ? <img src={b.darkLogo} alt="" loading="lazy" style={{ maxHeight: 30, maxWidth: 80, objectFit: "contain" }} />
                    : <span style={{ fontSize: 10, color: "#555" }}>—</span>}
                </div>
                <div style={{ fontSize: 12, color: "var(--txt3)" }}>Logo #{idx + 1}</div>
                <button
                  onClick={() => handleDelete(b.id)}
                  disabled={deleting === b.id}
                  style={{
                    padding: "5px 12px", borderRadius: 7, border: "none",
                    background: "rgba(239,68,68,0.12)", color: "#ef4444",
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  {deleting === b.id ? "…" : "Eliminar"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
