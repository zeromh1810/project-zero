"use client"

import RichTextArea from "./rich-text-area"
import type { ToastType } from "./admin-toast"
import { Field } from "./ui/field"
import { Card, SectionHeader } from "./ui/display"
import { UnsavedBar } from "./ui/dirty"
import { useResource } from "./ui/use-resource"
import { ExternalIcon } from "@/components/portfolio/icons"

interface HeroData {
  titleLine1: string
  titleLine2: string
  titleLine3: string
  subtitle: string
}

const DEFAULT: HeroData = { titleLine1: "", titleLine2: "", titleLine3: "", subtitle: "" }

interface Props {
  onToast: (title: string, type: ToastType, msg?: string) => void
}

// Hero (DS v2.1.0): campos con label asociado, vista previa con los MISMOS
// estilos del sitio (clase hero-title, no un estilo inline aproximado),
// guardado en la barra de cambios sin guardar y aviso al salir.
export default function HeroTab({ onToast }: Props) {
  const r = useResource<HeroData>({ key: "hero", url: "/api/admin/hero", defaults: DEFAULT, onToast, label: "Hero" })
  const { data, set } = r

  return (
    <>
      <SectionHeader
        title="Hero"
        description="Título principal y subtítulo de la portada."
        action={<a className="a-btn a-btn--ghost" href="/" target="_blank" rel="noreferrer"><ExternalIcon /> Ver en el sitio</a>}
      />

      {r.loading ? <div className="a-card"><div className="skeleton skeleton-line" style={{ width: "40%" }} /><div className="skeleton skeleton-line" /></div> : (
        <>
          <Card title="Título principal" description="Tres líneas. La segunda va en color de acento.">
            <Field label="Línea 1">
              {(p) => <input {...p} className="admin-input" value={data.titleLine1} onChange={e => set("titleLine1", e.target.value)} />}
            </Field>
            <Field label="Línea 2 — énfasis (color de acento)">
              {(p) => <input {...p} className="admin-input" value={data.titleLine2} onChange={e => set("titleLine2", e.target.value)} />}
            </Field>
            <Field label="Línea 3">
              {(p) => <input {...p} className="admin-input" value={data.titleLine3} onChange={e => set("titleLine3", e.target.value)} />}
            </Field>

            <figure className="a-preview" aria-label="Vista previa del título">
              <figcaption className="a-preview-label">Vista previa</figcaption>
              <p className="a-preview-hero">
                {data.titleLine1}<br />
                <span className="a-preview-accent">{data.titleLine2}</span><br />
                {data.titleLine3}
              </p>
            </figure>
          </Card>

          <Card title="Subtítulo" description="Una o dos frases. Aparece bajo el título.">
            <Field label="Texto descriptivo">
              {(p, meta) => <RichTextArea value={data.subtitle} onChange={v => set("subtitle", v)}
                labelledBy={meta.labelId} describedBy={p["aria-describedby"]} placeholder="Descripción breve que acompaña el título…" />}
            </Field>
          </Card>

          <UnsavedBar dirty={r.dirty} saving={r.saving} onSave={r.save} onDiscard={r.discard} />
        </>
      )}
    </>
  )
}
