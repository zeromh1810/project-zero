"use client"

import { useState, useCallback } from "react"
import { EmailIcon, LinkedInIcon, GitHubIcon } from "../icons"
import { sendContactEmail } from "@/app/actions/contact"

type FormStatus = "idle" | "loading" | "success" | "error"

interface FormState {
  name: string
  email: string
  msg: string
}

const CONTACT_LINKS = [
  {
    Icon: EmailIcon,
    label: "Email",
    value: "c.hickmann86@gmail.com",
    href: "mailto:c.hickmann86@gmail.com",
  },
  {
    Icon: LinkedInIcon,
    label: "LinkedIn",
    value: "linkedin.com/in/alejandro",
    href: "https://linkedin.com/in/alejandro",
  },
  {
    Icon: GitHubIcon,
    label: "GitHub",
    value: "github.com/alejandro",
    href: "https://github.com/alejandro",
  },
]

export function ContactSection() {
  const [formState, setFormState] = useState<FormState>({ name: "", email: "", msg: "" })
  const [formStatus, setFormStatus] = useState<FormStatus>("idle")
  const [errorMessage, setErrorMessage] = useState<string>("")

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formState.name || !formState.email || !formState.msg) return

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
      setFormStatus("error")
      setErrorMessage(result.error || "Error al enviar el mensaje")
      setTimeout(() => {
        setFormStatus("idle")
      }, 3000)
    }
  }, [formState])

  return (
    <div className="section section--contact anim-up">
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
            {CONTACT_LINKS.map(({ Icon, label, value, href }) => (
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
        <form className="contact-form-card anim-up" onSubmit={handleSubmit} noValidate>
          <div className="fld">
            <input
              id="contact-name"
              className="fi"
              type="text"
              name="name"
              placeholder=" "
              autoComplete="name"
              value={formState.name}
              onChange={(e) => setFormState((s) => ({ ...s, name: e.target.value }))}
              required
            />
            <label className="fl" htmlFor="contact-name">Nombre completo *</label>
          </div>
          <div className="fld">
            <input
              id="contact-email"
              className="fi"
              type="email"
              name="email"
              placeholder=" "
              autoComplete="email"
              value={formState.email}
              onChange={(e) => setFormState((s) => ({ ...s, email: e.target.value }))}
              required
            />
            <label className="fl" htmlFor="contact-email">Email *</label>
          </div>
          <div className="fld">
            <textarea
              id="contact-msg"
              className="ft"
              name="message"
              placeholder=" "
              rows={5}
              value={formState.msg}
              onChange={(e) => setFormState((s) => ({ ...s, msg: e.target.value }))}
              required
            />
            <label className="fl" htmlFor="contact-msg">Cuéntame sobre tu proyecto…</label>
          </div>
          <button
            type="submit"
            className={`fsub${formStatus === "success" ? " ok" : ""}${formStatus === "error" ? " err" : ""}`}
            disabled={formStatus === "loading"}
            aria-busy={formStatus === "loading"}
          >
            {formStatus === "idle" && "Enviar mensaje →"}
            {formStatus === "loading" && "Enviando…"}
            {formStatus === "success" && "Mensaje enviado ✓"}
            {formStatus === "error" && "Error al enviar — intenta de nuevo"}
          </button>
          {formStatus === "error" && (
            <p className="form-error-msg" role="alert" aria-live="assertive">
              {errorMessage || "No se pudo enviar el mensaje. Intenta de nuevo."}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
