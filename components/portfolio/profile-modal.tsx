"use client"

interface ProfileModalProps {
  onClose: () => void
  onNavigateContact: () => void
}

const SOCIAL_LINKS = [
  { label: "GitHub",   href: "https://github.com/zeromh1810",               target: "_blank" },
  { label: "LinkedIn", href: "https://linkedin.com/in/carlos-rojas-hickmann", target: "_blank" },
  { label: "Email",    href: "mailto:c.hickmann86@gmail.com",                target: undefined },
]

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
        <div className="m-av">C</div>
        <div className="m-name">Carlos Felipe Rojas Hickmann</div>
        <div className="m-role">Product Designer & Frontend Developer · Santiago</div>
        <div className="m-links">
          {SOCIAL_LINKS.map(({ label, href, target }) => (
            <a
              key={label}
              href={href}
              target={target}
              rel={target === "_blank" ? "noopener noreferrer" : undefined}
              className="m-link"
            >
              {label}
            </a>
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
