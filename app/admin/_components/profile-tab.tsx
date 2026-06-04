"use client"

import { useState, useEffect, useRef } from "react"
import type { ToastType } from "./admin-toast"

interface ProfileData {
  name:      string
  role:      string
  photoUrl:  string
  github:    string
  linkedin:  string
  instagram: string
}

const DEFAULT: ProfileData = {
  name:      "Carlos Felipe Rojas Hickmann",
  role:      "Product Designer & Frontend Developer · Santiago",
  photoUrl:  "",
  github:    "",
  linkedin:  "",
  instagram: "",
}

const LINK_FIELDS: { key: keyof ProfileData; label: string; placeholder: string; prefix: string }[] = [
  { key: "linkedin",  label: "LinkedIn",  placeholder: "https://linkedin.com/in/tu-perfil",   prefix: "in" },
  { key: "github",    label: "GitHub",    placeholder: "https://github.com/tu-usuario",       prefix: "GH" },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/tu-usuario",    prefix: "IG" },
]

interface Props {
  onToast: (title: string, type: ToastType, msg?: string) => void
}

export default function ProfileTab({ onToast }: Props) {
  const [data,           setData]          = useState<ProfileData>(DEFAULT)
  const [saved,          setSaved]         = useState<ProfileData>(DEFAULT)
  const [loading,        setLoading]       = useState(true)
  const [saving,         setSaving]        = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [localPreview,   setLocalPreview]  = useState("")
  const photoRef = useRef<HTMLInputElement>(null)

  const hasChanges = JSON.stringify(data) !== JSON.stringify(saved)

  useEffect(() => {
    let ignore = false
    fetch("/api/admin/profile", { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        if (!ignore) {
          const loaded = { ...DEFAULT, ...d }
          setData(loaded)
          setSaved(loaded)
        }
      })
      .catch(() => onToast("Error cargando perfil", "error"))
      .finally(() => { if (!ignore) setLoading(false) })
    return () => { ignore = true }
  }, [])

  function set<K extends keyof ProfileData>(field: K, value: ProfileData[K]) {
    setData(prev => ({ ...prev, [field]: value }))
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const objectUrl = URL.createObjectURL(file)
    setLocalPreview(objectUrl)
    setUploadingPhoto(true)

    try {
      const fd = new FormData()
      fd.append("file", file)
      const res  = await fetch("/api/admin/upload", { method: "POST", body: fd })
      const json = await res.json()
      if (json.url) {
        set("photoUrl", json.url)
      } else {
        onToast("Error al subir imagen", "error", json.error)
      }
    } catch {
      onToast("Error al subir imagen", "error")
    } finally {
      URL.revokeObjectURL(objectUrl)
      setLocalPreview("")
      setUploadingPhoto(false)
      e.target.value = ""
    }
  }

  async function save() {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/profile", {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      setSaved({ ...data })
      onToast("Perfil guardado", "success")
    } catch {
      onToast("Error al guardar", "error")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" /> Cargando…
      </div>
    )
  }

  const avatarUrl  = localPreview || data.photoUrl
  const initials   = data.name.trim().charAt(0).toUpperCase() || "C"

  return (
    <>
      <div className="admin-section-header">
        <div>
          <div className="admin-section-title">Perfil</div>
          <div className="admin-section-sub">Datos del modal de perfil público</div>
        </div>
        <button className="btn-p" onClick={save} disabled={saving || !hasChanges}>
          {saving ? "Guardando…" : hasChanges ? "Guardar cambios" : "Sin cambios"}
        </button>
      </div>

      {/* Foto de perfil */}
      <div className="admin-card">
        <div className="admin-card-title">Foto de perfil</div>

        {avatarUrl && (
          <div className="about-admin-photo-preview" style={{ marginBottom: 0 }}>
            <img src={avatarUrl} alt="Foto de perfil" />
          </div>
        )}

        <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: avatarUrl ? 14 : 0 }}>
          <input
            ref={photoRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: "none" }}
            onChange={handlePhotoUpload}
          />
          <button
            className="btn-g"
            onClick={() => photoRef.current?.click()}
            disabled={uploadingPhoto}
            style={{ fontSize: 13 }}
          >
            {uploadingPhoto ? "Subiendo…" : avatarUrl ? "Cambiar foto" : "Subir foto"}
          </button>
          {data.photoUrl && !uploadingPhoto && (
            <button
              className="btn-profile"
              onClick={() => set("photoUrl", "")}
              style={{ color: "var(--error)", borderColor: "var(--error)" }}
            >
              Quitar foto
            </button>
          )}
        </div>
        <div className="admin-input-hint" style={{ marginTop: 8 }}>
          JPG, PNG o WebP · máx. 8 MB · Cuadrada o retrato (1:1 o 3:4) recomendado
        </div>
      </div>

      {/* Datos personales */}
      <div className="admin-card">
        <div className="admin-card-title">Datos personales</div>
        <div className="admin-field">
          <label className="admin-label">Nombre completo</label>
          <input
            className="admin-input"
            value={data.name}
            onChange={e => set("name", e.target.value)}
            placeholder="Carlos Felipe Rojas Hickmann"
          />
        </div>
        <div className="admin-field" style={{ marginBottom: 0 }}>
          <label className="admin-label">Cargo / Rol</label>
          <input
            className="admin-input"
            value={data.role}
            onChange={e => set("role", e.target.value)}
            placeholder="Product Designer & Frontend Developer · Santiago"
          />
        </div>
      </div>

      {/* Links */}
      <div className="admin-card">
        <div className="admin-card-title">Redes sociales</div>
        {LINK_FIELDS.map(({ key, label, placeholder, prefix }) => (
          <div key={key} className="admin-field">
            <label className="admin-label">{label}</label>
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                fontSize: 11, fontWeight: 700, color: "var(--txt3)",
                letterSpacing: "0.04em", pointerEvents: "none", userSelect: "none",
              }}>
                {prefix}
              </span>
              <input
                className="admin-input"
                type="url"
                value={data[key] as string}
                onChange={e => set(key, e.target.value)}
                placeholder={placeholder}
                style={{ paddingLeft: 36 }}
              />
            </div>
            {data[key] && (
              <div className="admin-input-hint" style={{ marginTop: 4 }}>
                <a
                  href={data[key] as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--accent)", textDecoration: "none", fontSize: 12 }}
                >
                  Verificar enlace ↗
                </a>
              </div>
            )}
          </div>
        ))}
        <div className="admin-input-hint">Deja en blanco los que no quieras mostrar en el modal.</div>
      </div>

      {/* Preview del modal */}
      <div className="admin-card" style={{ marginBottom: 24 }}>
        <div className="admin-card-title">Vista previa del modal</div>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "32px 24px",
          background: "var(--bg2)",
          borderRadius: 20,
          border: "1px solid var(--border)",
          maxWidth: 320,
          margin: "0 auto",
        }}>
          {/* Avatar */}
          <div style={{
            width: 88, height: 88, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--accent) 0%, #5ac8fa 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 32, fontWeight: 700, color: "white",
            marginBottom: 16, border: "2px solid var(--border)",
            overflow: "hidden",
          }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={data.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            ) : (
              initials
            )}
          </div>

          {/* Name & role */}
          <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em", marginBottom: 4, textAlign: "center" }}>
            {data.name || "Tu nombre"}
          </div>
          <div style={{ fontSize: 13, color: "var(--txt2)", marginBottom: 20, textAlign: "center" }}>
            {data.role || "Tu cargo"}
          </div>

          {/* Links */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 20 }}>
            {data.linkedin && (
              <span style={{ padding: "6px 14px", borderRadius: 980, border: "1px solid var(--border)", fontSize: 12, color: "var(--txt2)" }}>
                LinkedIn
              </span>
            )}
            {data.github && (
              <span style={{ padding: "6px 14px", borderRadius: 980, border: "1px solid var(--border)", fontSize: 12, color: "var(--txt2)" }}>
                GitHub
              </span>
            )}
            {data.instagram && (
              <span style={{ padding: "6px 14px", borderRadius: 980, border: "1px solid var(--border)", fontSize: 12, color: "var(--txt2)" }}>
                Instagram
              </span>
            )}
            {!data.linkedin && !data.github && !data.instagram && (
              <span style={{ fontSize: 12, color: "var(--txt3)", fontStyle: "italic" }}>Sin redes configuradas</span>
            )}
          </div>

          <div style={{
            width: "100%", padding: "10px 0", borderRadius: 980,
            background: "var(--accent)", color: "white",
            fontSize: 14, fontWeight: 600, textAlign: "center",
          }}>
            Contactar
          </div>
        </div>
      </div>
    </>
  )
}
