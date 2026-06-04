"use client"

import { useState, useEffect, useRef } from "react"

interface ProfileModalProps {
  onClose: () => void
  onNavigateContact: () => void
}

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
  github:    "https://github.com/zeromh1810",
  linkedin:  "https://linkedin.com/in/carlos-rojas-hickmann",
  instagram: "",
}

const EXIT_DURATION = 200

export function ProfileModal({ onClose, onNavigateContact }: ProfileModalProps) {
  const [exiting, setExiting]       = useState(false)
  const [profile, setProfile]       = useState<ProfileData>(DEFAULT)
  const [photoError, setPhotoError] = useState(false)
  // Ref-based guard prevents double-close when ESC is pressed during exit animation
  const closingRef = useRef(false)

  useEffect(() => {
    let ignore = false
    fetch("/api/admin/profile", { cache: "no-store" })
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(d => { if (!ignore) { setProfile({ ...DEFAULT, ...d }); setPhotoError(false) } })
      .catch(() => {})
    return () => { ignore = true }
  }, [])

  const handleClose = () => {
    if (closingRef.current) return
    closingRef.current = true
    setExiting(true)
    setTimeout(onClose, EXIT_DURATION)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const handleContact = () => {
    if (closingRef.current) return
    closingRef.current = true
    setExiting(true)
    setTimeout(() => {
      onClose()
      onNavigateContact()
    }, EXIT_DURATION)
  }

  const initials = profile.name.trim().charAt(0).toUpperCase() || "C"

  const links: { label: string; href: string; external: boolean }[] = [
    profile.linkedin  && { label: "LinkedIn",  href: profile.linkedin,  external: true },
    profile.github    && { label: "GitHub",    href: profile.github,    external: true },
    profile.instagram && { label: "Instagram", href: profile.instagram, external: true },
  ].filter(Boolean) as { label: string; href: string; external: boolean }[]

  return (
    <div
      className={`overlay${exiting ? " overlay--exiting" : ""}`}
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="modal">
        <button className="modal-x" onClick={handleClose} aria-label="Cerrar">
          ✕
        </button>

        {/* Avatar */}
        <div className="m-av">
          {profile.photoUrl && !photoError ? (
            <img
              src={profile.photoUrl}
              alt={profile.name}
              className="m-av-img"
              onError={() => setPhotoError(true)}
            />
          ) : (
            initials
          )}
        </div>

        <div className="m-name">{profile.name}</div>
        <div className="m-role">{profile.role}</div>

        {links.length > 0 && (
          <div className="m-links">
            {links.map(({ label, href, external }) => (
              <a
                key={label}
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className="m-link"
              >
                {label}
              </a>
            ))}
          </div>
        )}

        <button
          className="btn-p"
          style={{ width: "100%", justifyContent: "center" }}
          onClick={handleContact}
        >
          Contactar
        </button>
        <a
          href="/admin"
          className="btn-g"
          style={{ width: "100%", justifyContent: "center", textDecoration: "none", marginTop: 8, display: "inline-flex" }}
        >
          Acceso a administrador
        </a>
      </div>
    </div>
  )
}
