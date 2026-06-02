"use client"

import { useState, useEffect } from "react"

interface CVData {
  link: string
  title: string
  subtitle: string
  updatedAt: string
}

const DEFAULT: CVData = {
  link: "",
  title: "Curriculum Vitae",
  subtitle: "Diseñador de Producto & Frontend Developer",
  updatedAt: "Enero 2025",
}

export function CVSection() {
  const [cv, setCv] = useState<CVData>(DEFAULT)
  const [noLinkMsg, setNoLinkMsg] = useState(false)

  useEffect(() => {
    fetch("/api/admin/cv", { cache: "no-store" })
      .then(r => r.json())
      .then(d => setCv({ ...DEFAULT, ...d }))
      .catch(() => {})
  }, [])

  function handleOpen() {
    if (cv.link) {
      window.open(cv.link, "_blank", "noreferrer")
    } else {
      setNoLinkMsg(true)
      setTimeout(() => setNoLinkMsg(false), 3500)
    }
  }

  return (
    <div className="section" style={{ paddingTop: 96 }}>
      <div className="s-head anim-up">
        <div className="s-label">Currículum</div>
        <h2 className="s-title">Mi CV</h2>
      </div>
      <div className="cv-card">
        <div className="cv-icon" aria-hidden="true">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
        <div className="cv-title">{cv.title}</div>
        <div className="cv-sub">
          {cv.subtitle}
          <br />
          Actualizado · {cv.updatedAt}
        </div>
        <button
          className="btn-p"
          style={{ width: "100%", justifyContent: "center" }}
          onClick={handleOpen}
        >
          {cv.link ? "Abrir PDF ↗" : "Descargar PDF ↓"}
        </button>
        {noLinkMsg && (
          <p
            role="status"
            style={{
              marginTop: 10, fontSize: 13, textAlign: "center",
              color: "var(--warning)", lineHeight: 1.4,
            }}
          >
            El CV aún no está configurado. Accede al administrador para añadirlo.
          </p>
        )}
      </div>
    </div>
  )
}
