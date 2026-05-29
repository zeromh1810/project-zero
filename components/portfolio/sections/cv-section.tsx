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
      alert("El link del CV aún no ha sido configurado. Accede al administrador para agregarlo.")
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
      </div>
    </div>
  )
}
