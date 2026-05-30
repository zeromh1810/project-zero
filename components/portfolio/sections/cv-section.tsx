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
        <div className="cv-icon">📄</div>
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
