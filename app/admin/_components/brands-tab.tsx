"use client"

import { useState, useEffect } from "react"
import type { ToastType } from "./admin-toast"
import { Dropzone } from "./ui/dropzone"
import { ConfirmAction } from "./ui/confirm-action"
import { Card, EmptyState, SectionHeader } from "./ui/display"
import { PlusIcon, ImageIcon, CloseIcon } from "@/components/portfolio/icons"

interface Brand { id: string; lightLogo: string; darkLogo: string }
interface Slot { key: string; light: string; dark: string }
interface Props { onToast: (title: string, type: ToastType, msg?: string) => void }

const MAX_FILE_SIZE = 600 * 1024 // 600 KB
const makeSlot = (): Slot => ({ key: String(Date.now() + Math.random()), light: "", dark: "" })

function fileToDataUrl(file: File): Promise<string> {
  if (file.size > MAX_FILE_SIZE) {
    return Promise.reject(new Error(`El archivo supera 600 KB (${(file.size / 1024).toFixed(0)} KB)`))
  }
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"))
    reader.readAsDataURL(file)
  })
}

// Marcas (DS v2.1.0). Antes: borrar SIN confirmación, 35 estilos inline,
// botones a 11px con #2997ff/#ef4444 (3.02–3.3:1) y un dropzone propio.
// Ahora: confirmación destructiva, Dropzone del DS con el fondo de cada modo
// y el título alineado con lo que muestra el sitio ("Han confiado en mí").
// Las llamadas a /api/admin/brands no cambiaron.
export default function BrandsTab({ onToast }: Props) {
  const [brands, setBrands]   = useState<Brand[]>([])
  const [slots, setSlots]     = useState<Slot[]>([makeSlot()])
  const [adding, setAdding]   = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/brands", { cache: "no-store" })
      .then(r => r.json())
      .then(d => setBrands(Array.isArray(d.brands) ? d.brands : []))
      .catch(() => onToast("Error cargando marcas", "error"))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps -- carga única
  }, [])

  const patch = (key: string, p: Partial<Slot>) => setSlots(prev => prev.map(s => s.key === key ? { ...s, ...p } : s))
  const filled = slots.filter(s => s.light || s.dark)

  async function add() {
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
        if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || "No se pudo agregar") }
        added.push(await res.json())
      }
      setBrands(prev => [...prev, ...added])
      setSlots([makeSlot()])
      onToast(added.length === 1 ? "Marca agregada" : `${added.length} marcas agregadas`, "success")
    } catch (e) {
      onToast("Error al guardar", "error", e instanceof Error ? e.message : undefined)
    } finally { setAdding(false) }
  }

  async function remove(id: string) {
    try {
      const res = await fetch(`/api/admin/brands?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setBrands(prev => prev.filter(b => b.id !== id))
      onToast("Marca eliminada", "success")
    } catch { onToast("Error al eliminar", "error") }
  }

  return (
    <>
      <SectionHeader title="Marcas" description="Logos de la sección «Han confiado en mí» del portafolio." />

      <Card title="Agregar marcas" description="Sube cada logo en su versión para fondo claro y oscuro. Si solo subes una, se usa en ambos modos.">
        <ul className="a-brand-slots">
          {slots.map((s, i) => (
            <li key={s.key} className="a-brand-slot">
              <div className="a-brand-slot-head">
                <span className="a-field-label">Marca {i + 1}</span>
                {slots.length > 1 && (
                  <button type="button" className="a-icon-btn" onClick={() => setSlots(prev => prev.filter(x => x.key !== s.key))} aria-label={`Quitar marca ${i + 1} de la lista`}>
                    <CloseIcon />
                  </button>
                )}
              </div>
              <div className="a-row-2">
                <Dropzone label="Fondo claro" hint="SVG, PNG, WebP o JPG · máx. 600 KB" accept=".svg,.png,.webp,.jpg,.jpeg,image/*" aspect="3 / 1"
                  previewBg="#ffffff" value={s.light || undefined}
                  onUpload={async f => patch(s.key, { light: await fileToDataUrl(f) })} onRemove={() => patch(s.key, { light: "" })} />
                <Dropzone label="Fondo oscuro" hint="SVG, PNG, WebP o JPG · máx. 600 KB" accept=".svg,.png,.webp,.jpg,.jpeg,image/*" aspect="3 / 1"
                  previewBg="#0a0b12" value={s.dark || undefined}
                  onUpload={async f => patch(s.key, { dark: await fileToDataUrl(f) })} onRemove={() => patch(s.key, { dark: "" })} />
              </div>
            </li>
          ))}
        </ul>
        <div className="a-actions-row">
          <button type="button" className="a-btn a-btn--ghost" onClick={() => setSlots(prev => [...prev, makeSlot()])}>
            <PlusIcon /> Otra marca
          </button>
          <button type="button" className="a-btn a-btn--primary" onClick={add} disabled={adding || filled.length === 0} aria-busy={adding || undefined}>
            {adding ? "Agregando…" : filled.length > 1 ? `Agregar ${filled.length} marcas` : "Agregar al portafolio"}
          </button>
        </div>
      </Card>

      <Card title={`En el portafolio${brands.length ? ` · ${brands.length}` : ""}`}>
        {loading ? (
          <div className="a-brand-grid" aria-busy="true">{[0, 1, 2].map(i => <div key={i} className="a-brand-card skeleton" style={{ height: 120 }} />)}</div>
        ) : brands.length === 0 ? (
          <EmptyState icon={<ImageIcon />} title="Aún no hay marcas" description="Agrega la primera arriba: aparecerá en la sección «Han confiado en mí»." />
        ) : (
          <ul className="a-brand-grid">
            {brands.map((b, i) => (
              <li key={b.id} className="a-brand-card">
                <div className="a-brand-logos">
                  <span className="a-brand-logo a-brand-logo--light">{(b.lightLogo || b.darkLogo) && <img src={b.lightLogo || b.darkLogo} alt="" />}</span>
                  <span className="a-brand-logo a-brand-logo--dark">{(b.darkLogo || b.lightLogo) && <img src={b.darkLogo || b.lightLogo} alt="" />}</span>
                </div>
                <div className="a-brand-card-foot">
                  <span className="a-item-meta">Marca {i + 1}</span>
                  <ConfirmAction itemName={`marca ${i + 1}`} question="¿Eliminar?" onConfirm={() => remove(b.id)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  )
}
