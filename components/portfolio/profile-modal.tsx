"use client"

interface ProfileModalProps {
  onClose: () => void
  onNavigateContact: () => void
}

const SOCIAL_LINKS = ["GitHub", "LinkedIn", "Email"]

export function ProfileModal({ onClose, onNavigateContact }: ProfileModalProps) {
  const handleContact = () => {
    onClose()
    onNavigateContact()
  }

  return (
    <div
      className="overlay"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <button className="modal-x" onClick={onClose} aria-label="Cerrar">
          ✕
        </button>
        <div className="m-av">A</div>
        <div className="m-name">Alejandro Silva</div>
        <div className="m-role">Product Designer & Frontend Dev · Santiago</div>
        <div className="m-links">
          {SOCIAL_LINKS.map((link) => (
            <span key={link} className="m-link">
              {link}
            </span>
          ))}
        </div>
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
