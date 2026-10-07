"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ArrowRightIcon } from "./icons"
import * as Dialog from "@radix-ui/react-dialog"

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

// Debe coincidir con la salida del CSS (.overlay--exiting: --dur-exit 160ms).
const EXIT_DURATION = 160

// v2.0.0 — Montado sobre Radix Dialog (ya en deps por la galería): trae foco
// inicial dentro del modal, trap de foco, retorno del foco al botón "Perfil"
// al cerrar, ESC y aria-labelledby/-describedby. Antes era un div con
// role="dialog" sin nada de eso, y ESC se escuchaba en dos lugares.
// La salida sigue animada: el Dialog queda abierto durante EXIT_DURATION
// con la clase de salida y recién después el padre lo desmonta.
export function ProfileModal({ onClose, onNavigateContact }: ProfileModalProps) {
  const [exiting, setExiting]       = useState(false)
  const [profile, setProfile]       = useState<ProfileData>(DEFAULT)
  const [photoError, setPhotoError] = useState(false)
  // Evita doble cierre si se aprieta ESC durante la animación de salida
  const closingRef = useRef(false)

  // Retorno del foco al control que abrió el modal (el botón "Perfil").
  // Radix lo hace al pasar open→false, pero acá el padre desmonta el
  // Dialog todavía abierto (para dejar correr la animación de salida), y
  // en ese camino el foco se perdía en <body>.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    return () => {
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true })
    }
  }, [])

  useEffect(() => {
    let ignore = false
    fetch("/api/admin/profile", { cache: "no-store" })
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(d => { if (!ignore) { setProfile({ ...DEFAULT, ...d }); setPhotoError(false) } })
      .catch(() => {})
    return () => { ignore = true }
  }, [])

  const closeThen = useCallback((after?: () => void) => {
    if (closingRef.current) return
    closingRef.current = true
    setExiting(true)
    setTimeout(() => { onClose(); after?.() }, EXIT_DURATION)
  }, [onClose])

  const initials = profile.name.trim().charAt(0).toUpperCase() || "C"

  const links: { label: string; href: string }[] = [
    profile.linkedin  && { label: "LinkedIn",  href: profile.linkedin },
    profile.github    && { label: "GitHub",    href: profile.github },
    profile.instagram && { label: "Instagram", href: profile.instagram },
  ].filter(Boolean) as { label: string; href: string }[]

  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open) closeThen() }}>
      <Dialog.Portal>
        <Dialog.Overlay className={`overlay${exiting ? " overlay--exiting" : ""}`}>
          <Dialog.Content className="modal" aria-describedby="profile-modal-role">
            <Dialog.Close className="modal-x" aria-label="Cerrar">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </Dialog.Close>

            {/* Avatar */}
            <div className="m-av">
              {profile.photoUrl && !photoError ? (
                <img
                  src={profile.photoUrl}
                  alt=""
                  className="m-av-img"
                  onError={() => setPhotoError(true)}
                />
              ) : (
                <span aria-hidden="true">{initials}</span>
              )}
            </div>

            <Dialog.Title className="m-name">{profile.name}</Dialog.Title>
            <Dialog.Description id="profile-modal-role" className="m-role">{profile.role}</Dialog.Description>

            {links.length > 0 && (
              <div className="m-links">
                {links.map(({ label, href }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="m-link">
                    {label}
                  </a>
                ))}
              </div>
            )}

            <button
              className="btn-p btn-shine m-cta"
              onClick={() => closeThen(onNavigateContact)}
            >
              Contactar <ArrowRightIcon className="btn-arrow" />
            </button>

            {/* Discreto a pedido: el acceso al admin no compite con "Contactar". */}
            <a href="/admin" className="m-admin-link link-underline">
              Acceso administrador
            </a>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
