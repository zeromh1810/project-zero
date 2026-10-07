"use client"

import { useState, useCallback, useRef } from "react"
import { EmailIcon, LinkedInIcon, GitHubIcon, InstagramIcon, ArrowRightIcon } from "../icons"
import { sendContactEmail } from "@/app/actions/contact"
import { useSocial } from "@/lib/hooks/use-social"

type FormStatus = "idle" | "loading" | "success" | "error"
type Field = "name" | "email" | "msg"

interface FormState {
  name: string
  email: string
  msg: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Validación por campo (MI-5): antes, con noValidate y un `return` silencioso,
// enviar el formulario vacío no hacía nada — ni un mensaje. Ahora cada campo
// se valida al salir de él y al enviar, con el error bajo el campo
// (aria-describedby + aria-invalid) y foco al primero inválido.
function validate(field: Field, value: string): string {
  const v = value.trim()
  if (field === "name")  return v ? "" : "Escribe tu nombre."
  if (field === "email") return !v ? "Escribe tu email." : EMAIL_RE.test(v) ? "" : "Revisa el email: parece incompleto."
  return v.length >= 10 ? "" : v ? "Cuéntame un poco más (mínimo 10 caracteres)." : "Cuéntame sobre tu proyecto."
}

function displayUrl(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")
}

export function ContactSection() {
  const social = useSocial()
  const [formState, setFormState] = useState<FormState>({ name: "", email: "", msg: "" })
  const [errors, setErrors] = useState<Record<Field, string>>({ name: "", email: "", msg: "" })
  const [formStatus, setFormStatus] = useState<FormStatus>("idle")
  const [errorMessage, setErrorMessage] = useState<string>("")
  // Sacude el formulario (N-13). Se reinicia la animación quitando y
  // poniendo la clase (no con `key`: re-montar el form le quitaba el foco
  // al primer campo inválido).
  const formRef = useRef<HTMLFormElement>(null)
  const shake = () => {
    const el = formRef.current
    if (!el) return
    el.classList.remove("is-shaking")
    void el.offsetWidth // fuerza reflow para reiniciar la animación
    el.classList.add("is-shaking")
  }
  const nameRef  = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const msgRef   = useRef<HTMLTextAreaElement>(null)

  const contactLinks = [
    social.email    && { Icon: EmailIcon,     label: "Email",     value: social.email,    href: `mailto:${social.email}` },
    social.linkedin && { Icon: LinkedInIcon,  label: "LinkedIn",  value: displayUrl(social.linkedin),  href: social.linkedin },
    social.instagram && { Icon: InstagramIcon, label: "Instagram", value: displayUrl(social.instagram), href: social.instagram },
    social.github   && { Icon: GitHubIcon,    label: "GitHub",    value: displayUrl(social.github),   href: social.github },
  ].filter(Boolean) as { Icon: React.ComponentType<{className?: string}>; label: string; value: string; href: string }[]

  const setField = (field: Field, value: string) => {
    setFormState((s) => ({ ...s, [field]: value }))
    // Si el campo ya mostraba un error, se re-valida mientras escribe (el
    // mensaje desaparece apenas queda bien); si no, se espera al blur.
    if (errors[field]) setErrors((e) => ({ ...e, [field]: validate(field, value) }))
    if (formStatus === "error") setFormStatus("idle")
  }

  const onBlur = (field: Field) => () => {
    const value = formState[field]
    if (value) setErrors((e) => ({ ...e, [field]: validate(field, value) }))
  }

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    const next = {
      name:  validate("name", formState.name),
      email: validate("email", formState.email),
      msg:   validate("msg", formState.msg),
    }
    setErrors(next)
    const firstInvalid = (["name", "email", "msg"] as Field[]).find((f) => next[f])
    if (firstInvalid) {
      const target = { name: nameRef, email: emailRef, msg: msgRef }[firstInvalid]
      target.current?.focus()
      shake()
      return
    }

    setFormStatus("loading")
    setErrorMessage("")

    const result = await sendContactEmail({
      name: formState.name,
      email: formState.email,
      message: formState.msg,
    })

    if (result.success) {
      setFormStatus("success")
      setTimeout(() => {
        setFormState({ name: "", email: "", msg: "" })
        setFormStatus("idle")
      }, 3000)
    } else {
      // El error se queda hasta el próximo intento (antes se borraba solo a los 3s).
      setFormStatus("error")
      setErrorMessage(result.error || "Error al enviar el mensaje")
    }
  }, [formState])

  const fieldProps = (field: Field) => ({
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? `contact-${field}-error` : undefined,
    onBlur: onBlur(field),
  })

  // Función, no componente: un componente declarado dentro del render es un
  // tipo nuevo en cada render y re-montaría (y re-animaría) el mensaje en
  // cada tecla.
  const fieldError = (field: Field) =>
    errors[field] ? <p id={`contact-${field}-error`} className="fld-error">{errors[field]}</p> : null

  return (
    <div className="section section--contact">
      <div className="s-head anim-up">
        <div className="s-label">Hablemos</div>
        <h2 className="s-title">Contacto</h2>
      </div>

      <div className="contact-split">
        {/* LEFT: info column */}
        <div className="contact-info anim-up">
          <h3 className="contact-tagline">
            ¿Tienes un proyecto
            <br />
            en mente? <em>Hablemos.</em>
          </h3>
          <p className="contact-sub">
            Me especializo en proyectos de diseño y desarrollo digital. Cuéntame qué necesitas — te
            respondo en menos de 24 horas.
          </p>

          {/* Direct contact links — proper anchors for accessibility */}
          <div className="contact-links">
            {contactLinks.map(({ Icon, label, value, href }) => (
              <a
                key={label}
                href={href}
                className="contact-link-item"
                target={href.startsWith("mailto") ? undefined : "_blank"}
                rel={href.startsWith("mailto") ? undefined : "noopener noreferrer"}
              >
                <div className="contact-link-icon">
                  <Icon />
                </div>
                <div className="contact-link-text">
                  <div className="contact-link-label">{label}</div>
                  <div className="contact-link-value">{value}</div>
                </div>
              </a>
            ))}
          </div>

          {/* Availability */}
          <div className="contact-avail">
            <span className="avail-dot" />
            Disponible para proyectos · 2026
          </div>
        </div>

        {/* RIGHT: form card */}
        <form
          ref={formRef}
          className="contact-form-card anim-up"
          onAnimationEnd={(e) => { if (e.animationName === "form-shake") e.currentTarget.classList.remove("is-shaking") }}
          onSubmit={handleSubmit}
          noValidate
        >
          <div className={`fld${errors.name ? " has-error" : ""}`}>
            <input
              ref={nameRef}
              id="contact-name"
              className="fi"
              type="text"
              name="name"
              placeholder=" "
              autoComplete="name"
              value={formState.name}
              onChange={(e) => setField("name", e.target.value)}
              required
              {...fieldProps("name")}
            />
            <label className="fl" htmlFor="contact-name">Nombre completo *</label>
          </div>
          {fieldError("name")}
          <div className={`fld${errors.email ? " has-error" : ""}`}>
            <input
              ref={emailRef}
              id="contact-email"
              className="fi"
              type="email"
              name="email"
              placeholder=" "
              autoComplete="email"
              inputMode="email"
              value={formState.email}
              onChange={(e) => setField("email", e.target.value)}
              required
              {...fieldProps("email")}
            />
            <label className="fl" htmlFor="contact-email">Email *</label>
          </div>
          {fieldError("email")}
          <div className={`fld${errors.msg ? " has-error" : ""}`}>
            <textarea
              ref={msgRef}
              id="contact-msg"
              className="ft"
              name="message"
              placeholder=" "
              rows={5}
              value={formState.msg}
              onChange={(e) => setField("msg", e.target.value)}
              required
              {...fieldProps("msg")}
            />
            <label className="fl" htmlFor="contact-msg">Cuéntame sobre tu proyecto… *</label>
          </div>
          {fieldError("msg")}
          <button
            type="submit"
            className={`fsub${formStatus === "success" ? " ok" : ""}${formStatus === "error" ? " err" : ""}`}
            disabled={formStatus === "loading"}
            aria-busy={formStatus === "loading"}
          >
            {formStatus === "idle" && <>Enviar mensaje <ArrowRightIcon className="btn-arrow" /></>}
            {formStatus === "loading" && <><span className="fsub-spinner" aria-hidden="true" />Enviando…</>}
            {formStatus === "success" && (
              <>
                <svg className="fsub-check" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
                Mensaje enviado
              </>
            )}
            {formStatus === "error" && "Reintentar envío"}
          </button>
          {/* Estado para lectores de pantalla: éxito (polite) y error (alert). */}
          <p className="sr-only" aria-live="polite">
            {formStatus === "success" ? "Mensaje enviado. Te respondo en menos de 24 horas." : ""}
          </p>
          {formStatus === "error" && (
            <p className="form-error-msg" role="alert">
              {errorMessage || "No se pudo enviar el mensaje. Intenta de nuevo."}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
