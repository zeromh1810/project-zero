"use client"

import type { ToastType } from "./admin-toast"
import { invalidateLogo } from "@/lib/hooks/use-logo"
import { Field } from "./ui/field"
import { Dropzone } from "./ui/dropzone"
import { Card, SectionHeader } from "./ui/display"
import { UnsavedBar } from "./ui/dirty"
import { useResource } from "./ui/use-resource"

interface Props {
  onToast: (title: string, type: ToastType, msg?: string) => void
}

interface LogoForm {
  lightUrl: string
  darkUrl: string
  fallbackText: string
  /** v2.1.0 — Favicon del sitio (data URL). Vacío: se usa el isotipo del logo. */
  faviconUrl: string
}

const EMPTY: LogoForm = { lightUrl: "", darkUrl: "", fallbackText: "", faviconUrl: "" }

const ICON_TYPES = ["image/svg+xml", "image/png", "image/x-icon", "image/vnd.microsoft.icon"]

// Favicon: SVG, PNG o ICO, cuadrado y liviano (se sirve en cada pestaña del
// sitio desde /brand-icon). Se guarda inline como los SVG del logo.
async function readIcon(file: File): Promise<string> {
  const isSvg = file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg")
  const isIco = file.name.toLowerCase().endsWith(".ico")
  if (!isSvg && !isIco && !ICON_TYPES.includes(file.type)) throw new Error("Usa un archivo SVG, PNG o ICO")
  if (file.size > 100 * 1024) throw new Error("El favicon supera el límite de 100 KB")
  const url = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"))
    reader.readAsDataURL(file)
  })
  if (!isSvg && !isIco) {
    const { w, h } = await new Promise<{ w: number; h: number }>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight })
      img.onerror = () => reject(new Error("No se pudo leer la imagen"))
      img.src = url
    })
    if (w !== h) throw new Error(`El favicon debe ser cuadrado (este mide ${w}×${h}px)`)
    if (w < 48) throw new Error(`El favicon debe medir al menos 48×48px (este mide ${w}×${h}px)`)
  }
  return url
}

// El SVG se guarda inline como data URL (lo commitea la API de logo); no pasa
// por /api/admin/upload.
async function readSvg(file: File): Promise<string> {
  if (!file.name.toLowerCase().endsWith(".svg") && file.type !== "image/svg+xml") {
    throw new Error("Solo se aceptan archivos .svg")
  }
  if (file.size > 500 * 1024) throw new Error("El SVG supera el límite de 500 KB")
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error("No se pudo leer el archivo SVG"))
    reader.readAsDataURL(file)
  })
}

// Logo (DS v2.1.0). Antes: 46 estilos inline (el tab con más), botones
// "Cambiar/Quitar" con #2997ff/#ef4444 a 11px (3.02:1) y un dropzone propio.
// Ahora: Dropzone del DS con el fondo de cada modo, vista previa del navbar
// real en claro y oscuro, y guardado con cambios sin guardar.
export default function LogoTab({ onToast }: Props) {
  const r = useResource<LogoForm>({ key: "logo", url: "/api/admin/logo", defaults: EMPTY, onToast, label: "Logo", onSaved: invalidateLogo })
  const { data, set } = r
  const text = data.fallbackText || "Project Zero"

  // Función, no componente: declarado dentro del render sería un tipo nuevo en
  // cada render (se re-montaría siempre).
  const navPreview = (mode: "light" | "dark") => {
    const url = mode === "light" ? (data.lightUrl || data.darkUrl) : (data.darkUrl || data.lightUrl)
    return (
      <div key={mode} className={`a-logo-preview a-logo-preview--${mode}`}>
        <span className="a-logo-preview-mode">{mode === "light" ? "Modo claro" : "Modo oscuro"}</span>
        <div className="a-logo-preview-bar">
          {url ? <img src={url} alt="" /> : <span className="a-logo-preview-text"><span className="nav-logo-dot" aria-hidden="true" />{text}</span>}
          <span className="a-logo-preview-nav" aria-hidden="true"><i /><i /><i /></span>
        </div>
      </div>
    )
  }

  // Vista previa del favicon en una pestaña del navegador, en ambos temas.
  const tabPreview = (mode: "light" | "dark") => (
    <div key={mode} className={`a-tab-preview a-tab-preview--${mode}`}>
      <span className="a-logo-preview-mode">{mode === "light" ? "Navegador claro" : "Navegador oscuro"}</span>
      <div className="a-tab-preview-bar">
        <div className="a-tab-preview-tab">
          {/* eslint-disable-next-line @next/next/no-img-element -- data URL de 16px, next/image no aporta */}
          <img src={data.faviconUrl || "/brand-icon"} alt="" width={16} height={16} />
          <span>Project Zero | Portafolio de trabajos</span>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <SectionHeader title="Logo" description="Logo de la barra de navegación del sitio y del admin." />

      {r.loading ? <div className="a-card"><div className="skeleton skeleton-line" style={{ width: "40%" }} /><div className="skeleton skeleton-line" /></div> : (
        <>
          <Card title="Vista previa del navbar">
            <div className="a-row-2">
              {navPreview("light")}
              {navPreview("dark")}
            </div>
          </Card>

          <Card title="Archivos SVG" description="Sube una versión para cada modo. Si solo subes una, se usa en ambos.">
            <div className="a-row-2">
              <Dropzone label="Versión para modo claro" hint="SVG · máx. 500 KB" accept=".svg,image/svg+xml" aspect="3 / 1"
                previewBg="var(--primitive-color-neutral-0)" value={data.lightUrl || undefined}
                onUpload={async file => set("lightUrl", await readSvg(file))} onRemove={() => set("lightUrl", "")} />
              <Dropzone label="Versión para modo oscuro" hint="SVG · máx. 500 KB" accept=".svg,image/svg+xml" aspect="3 / 1"
                previewBg="var(--primitive-color-neutral-950)" value={data.darkUrl || undefined}
                onUpload={async file => set("darkUrl", await readSvg(file))} onRemove={() => set("darkUrl", "")} />
            </div>
          </Card>

          <Card title="Favicon" description="El ícono de la pestaña del navegador y de los favoritos. Si no subes uno, se usa el isotipo de tu logo.">
            <div className="a-row-2">
              <div className="a-favicon-drop">
              <Dropzone label="Archivo del favicon" hint="SVG, o PNG/ICO cuadrado de 512×512px · máx. 100 KB" accept=".svg,.png,.ico,image/svg+xml,image/png,image/x-icon"
                aspect="1 / 1" previewBg="var(--bg2)" value={data.faviconUrl || undefined}
                onUpload={async file => set("faviconUrl", await readIcon(file))} onRemove={() => set("faviconUrl", "")} />
              </div>
              <div className="a-tab-previews">
                {tabPreview("light")}
                {tabPreview("dark")}
                {!data.faviconUrl && <p className="a-field-hint">Vista previa con el isotipo del logo (respaldo).</p>}
              </div>
            </div>
          </Card>

          <Card title="Texto de respaldo">
            <Field label="Nombre del sitio" hint="Se muestra cuando no hay ningún SVG subido. Máx. 40 caracteres." aside={`${data.fallbackText.length}/40`}>
              {(p) => <input {...p} className="admin-input" maxLength={40} placeholder="Project Zero" value={data.fallbackText} onChange={e => set("fallbackText", e.target.value)} />}
            </Field>
          </Card>

          <UnsavedBar dirty={r.dirty} saving={r.saving} onSave={r.save} onDiscard={r.discard} />
        </>
      )}
    </>
  )
}
