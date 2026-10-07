"use client"

import type { ReactNode } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { CloseIcon } from "@/components/portfolio/icons"

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  /** Barra de acciones fija al pie (Guardar / Cancelar). */
  footer?: ReactNode
}

// Panel lateral de edición (DS v2.1.0, AM-4). Antes era un div con overlay:
// sin role="dialog", sin ESC, sin trap de foco y con el fondo tabulable.
// Radix Dialog trae todo eso + retorno del foco al botón que lo abrió.
// Entra en --dur-enter con ease-out y sale en --dur-exit con ease-in (más
// rápido), vía data-state de Radix; reduced-motion lo desactiva (admin.css).
export function Sheet({ open, onOpenChange, title, description, children, footer }: SheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="a-sheet-overlay" />
        <Dialog.Content className="a-sheet">
          <header className="a-sheet-head">
            <div>
              <Dialog.Title className="a-sheet-title">{title}</Dialog.Title>
              {description
                ? <Dialog.Description className="a-sheet-desc">{description}</Dialog.Description>
                : <Dialog.Description className="sr-only">Panel de edición</Dialog.Description>}
            </div>
            <Dialog.Close className="a-icon-btn" aria-label="Cerrar panel">
              <CloseIcon />
            </Dialog.Close>
          </header>
          <div className="a-sheet-body">{children}</div>
          {footer && <footer className="a-sheet-foot">{footer}</footer>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
