"use client"

import { useState } from "react"
import type { ToastType } from "./admin-toast"
import { invalidateSocial } from "@/lib/hooks/use-social"
import { invalidateFooter } from "@/lib/hooks/use-footer"
import { Field } from "./ui/field"
import { Card, SectionHeader } from "./ui/display"
import { UnsavedBar } from "./ui/dirty"
import { useResource } from "./ui/use-resource"
import { ExternalIcon } from "@/components/portfolio/icons"

interface Props {
  onToast: (title: string, type: ToastType, msg?: string) => void
}

interface SocialForm { linkedin: string; instagram: string; github: string; email: string }
interface FooterForm { brand: string; tagline: string; copy: string }

const SOCIAL_EMPTY: SocialForm = { linkedin: "", instagram: "", github: "", email: "" }
const FOOTER_EMPTY: FooterForm = { brand: "", tagline: "", copy: "" }

const SOCIAL_FIELDS: { key: keyof SocialForm; label: string; placeholder: string; hint: string }[] = [
  { key: "linkedin",  label: "LinkedIn",  placeholder: "https://linkedin.com/in/tu-perfil", hint: "Footer, Contacto y CTA de cierre." },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/tu-usuario",  hint: "Footer y Contacto." },
  { key: "github",    label: "GitHub",    placeholder: "https://github.com/tu-usuario",     hint: "Footer y Contacto." },
  { key: "email",     label: "Email",     placeholder: "tu@email.com",                      hint: "Contacto y botón «Copiar» del CTA de cierre." },
]

const URL_RE = /^https?:\/\/\S+\.\S+/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Redes y footer (DS v2.1.0). Antes: "Footer" en la navegación aunque editaba
// también las redes, dos botones de guardar, prefijos de texto (in, IG, GH, ✉)
// pegados sobre el input y links sin validar. Ahora: un solo guardado para lo
// que cambió, validación de URL/email y dónde aparece cada dato en el sitio.
export default function SocialTab({ onToast }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const checkSocial = (d: SocialForm) => {
    const e: Record<string, string> = {}
    for (const f of SOCIAL_FIELDS) {
      const v = d[f.key]
      if (!v) continue
      if (f.key === "email" ? !EMAIL_RE.test(v) : !URL_RE.test(v))
        e[f.key] = f.key === "email" ? "Revisa el email." : "El link debe empezar con https://"
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const social = useResource<SocialForm>({ key: "redes", url: "/api/admin/social", defaults: SOCIAL_EMPTY, onToast, label: "Redes", validate: checkSocial, onSaved: invalidateSocial })
  const footer = useResource<FooterForm>({ key: "footer", url: "/api/admin/footer", defaults: FOOTER_EMPTY, onToast, label: "Footer", onSaved: invalidateFooter })

  const loading = social.loading || footer.loading
  const dirty = social.dirty || footer.dirty
  const saving = social.saving || footer.saving

  async function saveAll() {
    if (social.dirty) await social.save()
    if (footer.dirty) await footer.save()
  }

  return (
    <>
      <SectionHeader
        title="Redes y footer"
        description="Links a tus redes y textos del pie de página."
        action={<a className="a-btn a-btn--ghost" href="/" target="_blank" rel="noreferrer"><ExternalIcon /> Ver en el sitio</a>}
      />

      {loading ? <div className="a-card"><div className="skeleton skeleton-line" style={{ width: "40%" }} /><div className="skeleton skeleton-line" /></div> : (
        <>
          <Card title="Redes sociales" description="Deja vacío lo que no uses: ese ícono no se muestra.">
            {SOCIAL_FIELDS.map(({ key, label, placeholder, hint }) => (
              <Field key={key} label={label} hint={hint} error={errors[key]}
                aside={social.data[key] && !errors[key] ? (
                  <a className="a-link-sm" href={key === "email" ? `mailto:${social.data[key]}` : social.data[key]}
                    target={key === "email" ? undefined : "_blank"} rel="noopener noreferrer">
                    Probar link <ExternalIcon size={12} />
                  </a>
                ) : undefined}>
                {(p) => <input {...p} className="admin-input" type={key === "email" ? "email" : "url"} inputMode={key === "email" ? "email" : "url"}
                  autoComplete={key === "email" ? "email" : "url"} placeholder={placeholder} value={social.data[key]}
                  onChange={e => { social.set(key, e.target.value); if (errors[key]) setErrors(x => ({ ...x, [key]: "" })) }} />}
              </Field>
            ))}
          </Card>

          <Card title="Footer">
            <Field label="Nombre / marca">
              {(p) => <input {...p} className="admin-input" value={footer.data.brand} onChange={e => footer.set("brand", e.target.value)} />}
            </Field>
            <Field label="Tagline" hint="Una línea bajo la marca.">
              {(p) => <input {...p} className="admin-input" value={footer.data.tagline} onChange={e => footer.set("tagline", e.target.value)} />}
            </Field>
            <Field label="Copyright">
              {(p) => <input {...p} className="admin-input" value={footer.data.copy} onChange={e => footer.set("copy", e.target.value)} />}
            </Field>
          </Card>

          <UnsavedBar dirty={dirty} saving={saving} onSave={saveAll}
            onDiscard={() => { social.discard(); footer.discard(); setErrors({}) }} />
        </>
      )}
    </>
  )
}
