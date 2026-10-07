"use client"

import type { ReactNode } from "react"
import * as Dialog from "@radix-ui/react-dialog"

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: ReactNode
  /** Acciones (botones). El primero recibe el foco si tiene autoFocus. */
  actions: ReactNode
  onCancel: () => void
}

// Diálogo de decisión (DS v2.1.0): role="alertdialog", foco atrapado, ESC =
// cancelar. Se usa cuando la decisión bloquea la navegación (ej. cambiar de
// tab con cambios sin guardar); para confirmar una acción sobre un elemento
// de una lista se prefiere ConfirmAction en línea.
export function ConfirmDialog({ open, title, description, actions, onCancel }: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onCancel() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="a-sheet-overlay" />
        <Dialog.Content className="a-dialog" role="alertdialog">
          <Dialog.Title className="a-dialog-title">{title}</Dialog.Title>
          {description
            ? <Dialog.Description className="a-dialog-desc">{description}</Dialog.Description>
            : <Dialog.Description className="sr-only">{title}</Dialog.Description>}
          <div className="a-dialog-actions">{actions}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
