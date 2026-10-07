"use client"

import type { ToastType } from "./admin-toast"
import { type AboutData, type Stat } from "@/lib/types/about"
import RichTextArea from "./rich-text-area"
import { uploadImage } from "./upload"
import { Field } from "./ui/field"
import { TagInput } from "./ui/tag-input"
import { Dropzone } from "./ui/dropzone"
import { Card, SectionHeader } from "./ui/display"
import { UnsavedBar } from "./ui/dirty"
import { useResource } from "./ui/use-resource"
import { ExternalIcon } from "@/components/portfolio/icons"

const DEFAULT: AboutData = {
  bio1: "", bio2: "", skills: [],
  stats: [{ value: "", label: "" }, { value: "", label: "" }, { value: "", label: "" }],
  badge: "", available: true, cvUrl: "", photoUrl: "",
}

interface Props {
  onToast: (title: string, type: ToastType, msg?: string) => void
}

// Sobre mí (DS v2.1.0): Field/Dropzone/TagInput, stats con label por campo
// (antes columnas "Valor/Etiqueta" sin asociar), disponibilidad como switch
// y guardado con aviso de cambios sin guardar. Mismo payload.
export default function AboutTab({ onToast }: Props) {
  const r = useResource<AboutData>({ key: "sobre", url: "/api/admin/about", defaults: DEFAULT, onToast, label: "Sobre mí" })
  const { data, set } = r

  function setStat(i: number, field: keyof Stat, value: string) {
    const stats = [...data.stats]
    stats[i] = { ...stats[i], [field]: value }
    set("stats", stats)
  }

  return (
    <>
      <SectionHeader
        title="Sobre mí"
        description="Biografía, foto, habilidades y estadísticas de la sección «Sobre mí»."
        action={<a className="a-btn a-btn--ghost" href="/" target="_blank" rel="noreferrer"><ExternalIcon /> Ver en el sitio</a>}
      />

      {r.loading ? <div className="a-card"><div className="skeleton skeleton-line" style={{ width: "40%" }} /><div className="skeleton skeleton-line" /></div> : (
        <>
          <Card title="Biografía" description="Dos párrafos. Usa negrita para las ideas clave.">
            <Field label="Párrafo 1">
              {(p, m) => <RichTextArea value={data.bio1} onChange={v => set("bio1", v)} labelledBy={m.labelId} describedBy={p["aria-describedby"]} />}
            </Field>
            <Field label="Párrafo 2">
              {(p, m) => <RichTextArea value={data.bio2} onChange={v => set("bio2", v)} labelledBy={m.labelId} describedBy={p["aria-describedby"]} />}
            </Field>
          </Card>

          <Card title="Foto y disponibilidad">
            <Dropzone label="Foto" hint="Vertical 4:5 recomendado. JPG o PNG." aspect="4 / 5"
              value={data.photoUrl || undefined}
              onUpload={async file => set("photoUrl", await uploadImage(file))}
              onRemove={() => set("photoUrl", "")} />
            <div className="a-row-2">
              <Field label="Texto del badge" hint="Ej. «Disponible para freelance».">
                {(p) => <input {...p} className="admin-input" value={data.badge} onChange={e => set("badge", e.target.value)} />}
              </Field>
              <Field label="Disponibilidad" hint={data.available ? "Se muestra el punto verde animado." : "Sin indicador de disponibilidad."}>
                {(p) => (
                  <label className="a-switch">
                    <input {...p} type="checkbox" role="switch" checked={data.available} onChange={e => set("available", e.target.checked)} />
                    <span className="a-switch-track" aria-hidden="true" />
                    <span>Disponible</span>
                  </label>
                )}
              </Field>
            </div>
            <Field label="Link al CV (opcional)" hint="Si lo dejas vacío, no se muestra el botón «Ver CV».">
              {(p) => <input {...p} className="admin-input" type="url" inputMode="url" placeholder="https://" value={data.cvUrl} onChange={e => set("cvUrl", e.target.value)} />}
            </Field>
          </Card>

          <Card title="Habilidades">
            <Field label="Stack y herramientas" hint="Enter o coma para agregar." aside={`${data.skills.length}`}>
              {(p) => <TagInput control={p} value={data.skills} onChange={v => set("skills", v)} max={30} />}
            </Field>
          </Card>

          <Card title="Estadísticas" description="Tres cifras. Cuentan de 0 al valor cuando aparecen en el sitio.">
            <div className="a-kpis">
              {data.stats.map((stat, i) => (
                <fieldset key={i} className="a-kpi">
                  <legend className="sr-only">Estadística {i + 1}</legend>
                  <Field label={`Valor ${i + 1}`}>
                    {(p) => <input {...p} className="admin-input" value={stat.value} placeholder={["5+", "40+", "18"][i]} onChange={e => setStat(i, "value", e.target.value)} />}
                  </Field>
                  <Field label={`Etiqueta ${i + 1}`}>
                    {(p) => <input {...p} className="admin-input" value={stat.label} placeholder={["Años exp.", "Proyectos", "Clientes"][i]} onChange={e => setStat(i, "label", e.target.value)} />}
                  </Field>
                </fieldset>
              ))}
            </div>
          </Card>

          <UnsavedBar dirty={r.dirty} saving={r.saving} onSave={r.save} onDiscard={r.discard} />
        </>
      )}
    </>
  )
}
