"use client"

import { useState } from "react"
import type { ToastType } from "./admin-toast"
import { uploadImage } from "./upload"
import { Field } from "./ui/field"
import { Dropzone } from "./ui/dropzone"
import { Card, SectionHeader } from "./ui/display"
import { UnsavedBar } from "./ui/dirty"
import { useResource } from "./ui/use-resource"

interface ProfileData {
  name:      string
  role:      string
  photoUrl:  string
  github:    string
  linkedin:  string
  instagram: string
}

const DEFAULT: ProfileData = { name: "", role: "", photoUrl: "", github: "", linkedin: "", instagram: "" }

const LINKS: { key: "linkedin" | "github" | "instagram"; label: string; placeholder: string }[] = [
  { key: "linkedin",  label: "LinkedIn",  placeholder: "https://linkedin.com/in/tu-perfil" },
  { key: "github",    label: "GitHub",    placeholder: "https://github.com/tu-usuario" },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/tu-usuario" },
]

const URL_RE = /^https?:\/\/\S+\.\S+/

interface Props {
  onToast: (title: string, type: ToastType, msg?: string) => void
}

// Perfil (DS v2.1.0) — alimenta el modal "Perfil" del sitio. Field + Dropzone,
// URLs validadas antes de guardar (antes se aceptaba cualquier texto y el
// link quedaba roto en el modal) y vista previa del modal real.
export default function ProfileTab({ onToast }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const check = (d: ProfileData) => {
    const e: Record<string, string> = {}
    if (!d.name.trim()) e.name = "Escribe tu nombre."
    for (const { key, label } of LINKS) if (d[key] && !URL_RE.test(d[key])) e[key] = `El link de ${label} debe empezar con https://`
    setErrors(e)
    return Object.keys(e).length === 0
  }
  const r = useResource<ProfileData>({ key: "perfil", url: "/api/admin/profile", defaults: DEFAULT, onToast, label: "Perfil", validate: check })
  const { data, set } = r
  const initial = data.name.trim().charAt(0).toUpperCase() || "C"

  return (
    <>
      <SectionHeader title="Perfil" description="Datos del modal «Perfil» del sitio: nombre, rol, foto y redes." />

      {r.loading ? <div className="a-card"><div className="skeleton skeleton-line" style={{ width: "40%" }} /><div className="skeleton skeleton-line" /></div> : (
        <div className="a-split">
          <div>
            <Card title="Identidad">
              <Field label="Nombre" required error={errors.name}>
                {(p) => <input {...p} className="admin-input" autoComplete="name" value={data.name} onChange={e => set("name", e.target.value)} />}
              </Field>
              <Field label="Rol" hint="Una línea bajo el nombre, ej. «Product Designer · Santiago».">
                {(p) => <input {...p} className="admin-input" value={data.role} onChange={e => set("role", e.target.value)} />}
              </Field>
              <Dropzone label="Foto" hint="Cuadrada, al menos 400×400 px. JPG o PNG." aspect="1 / 1"
                value={data.photoUrl || undefined}
                onUpload={async file => set("photoUrl", await uploadImage(file))}
                onRemove={() => set("photoUrl", "")} />
            </Card>

            <Card title="Redes" description="Se muestran como botones en el modal. Deja vacío lo que no uses.">
              {LINKS.map(({ key, label, placeholder }) => (
                <Field key={key} label={label} error={errors[key]}>
                  {(p) => <input {...p} className="admin-input" type="url" inputMode="url" placeholder={placeholder}
                    value={data[key]} onChange={e => { set(key, e.target.value); if (errors[key]) setErrors(x => ({ ...x, [key]: "" })) }} />}
                </Field>
              ))}
            </Card>
          </div>

          {/* Vista previa del modal real del sitio (mismas clases) */}
          <figure className="a-preview a-preview--sticky" aria-label="Vista previa del modal de perfil">
            <figcaption className="a-preview-label">Vista previa</figcaption>
            <div className="modal a-preview-modal">
              <div className="m-av">{data.photoUrl ? <img src={data.photoUrl} alt="" className="m-av-img" /> : <span aria-hidden="true">{initial}</span>}</div>
              <div className="m-name">{data.name || "Tu nombre"}</div>
              <div className="m-role">{data.role || "Tu rol"}</div>
              {LINKS.some(l => data[l.key]) && (
                <div className="m-links">{LINKS.filter(l => data[l.key]).map(l => <span key={l.key} className="m-link">{l.label}</span>)}</div>
              )}
            </div>
          </figure>
        </div>
      )}

      <UnsavedBar dirty={r.dirty} saving={r.saving} onSave={r.save} onDiscard={() => { r.discard(); setErrors({}) }} />
    </>
  )
}
