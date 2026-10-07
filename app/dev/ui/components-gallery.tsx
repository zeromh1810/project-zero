"use client"

import { useState } from "react"
import { Field } from "@/app/admin/_components/ui/field"
import { ConfirmAction } from "@/app/admin/_components/ui/confirm-action"
import { Dropzone } from "@/app/admin/_components/ui/dropzone"
import { Sheet } from "@/app/admin/_components/ui/sheet"
import { ListItem, StatusBadge, EmptyState, ListSkeleton, SectionHeader, Card } from "@/app/admin/_components/ui/display"
import { UnsavedBar } from "@/app/admin/_components/ui/dirty"
import { FolderIcon, PlusIcon, EditIcon, ImageIcon } from "@/components/portfolio/icons"

// Galería de componentes del admin en todos sus estados — banco de pruebas del
// QA (ui-audit, teclado, capturas) y fuente de los ejemplos del DS.
export default function ComponentsGallery() {
  const [title, setTitle] = useState("")
  const [touched, setTouched] = useState(false)
  const [sheet, setSheet] = useState(false)
  const [img, setImg] = useState<string | undefined>("/hero-carlos.png")

  return (
    <div className="admin-wrapper">
      <main className="admin-container" style={{ paddingTop: 32 }}>
        <SectionHeader title="Componentes del admin" description="DS v2.1.0 — banco de pruebas" action={<button className="a-btn a-btn--primary"><PlusIcon /> Acción primaria</button>} />

        <Card title="Field">
          <Field label="Título" required hint="Máximo 120 caracteres." error={touched && !title.trim() ? "Escribe un título." : undefined} aside={`${title.length}/120`}>
            {(p) => <input {...p} className="admin-input" value={title} onChange={(e) => setTitle(e.target.value)} onBlur={() => setTouched(true)} />}
          </Field>
          <Field label="Categoría" hint="Se muestra como etiqueta en la card.">
            {(p) => <select {...p} className="admin-input"><option>Diseño</option><option>Desarrollo</option></select>}
          </Field>
          <Field label="Con error" error="Revisa el formato del email.">
            {(p) => <input {...p} className="admin-input" defaultValue="carlos@" />}
          </Field>
        </Card>

        <Card title="Botones">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="a-btn a-btn--primary">Guardar</button>
            <button className="a-btn a-btn--ghost">Cancelar</button>
            <button className="a-btn a-btn--danger">Eliminar</button>
            <button className="a-btn a-btn--danger-ghost">Quitar</button>
            <button className="a-btn a-btn--primary" disabled>Sin cambios</button>
            <button className="a-icon-btn" aria-label="Editar"><EditIcon /></button>
          </div>
        </Card>

        <Card title="ConfirmAction">
          <ConfirmAction itemName="Design Thinking" onConfirm={() => new Promise((r) => setTimeout(r, 600))} />
        </Card>

        <Card title="Dropzone">
          <Dropzone label="Imagen de portada" hint="JPG, PNG o WebP · máx. 2 MB" value={img}
            onUpload={async () => { setImg("/hero-carlos.png") }} onRemove={() => setImg(undefined)} aspect="16 / 7" />
          <Dropzone label="Vacío" hint="Arrastra o elige un archivo" onUpload={async () => { throw new Error("Simulado: el archivo supera 2 MB.") }} />
        </Card>

        <Card title="Lista">
          <ul className="a-list">
            <ListItem media={<ImageIcon />} title="Design Thinking: de la empatía al prototipo" meta={<><span>Diseño</span><span>12 may 2026</span></>}
              badge={<StatusBadge tone="live">Publicado</StatusBadge>}
              actions={<><button className="a-btn a-btn--ghost a-btn--sm"><EditIcon /> Editar</button><ConfirmAction itemName="Design Thinking" onConfirm={() => {}} /></>} />
            <ListItem active media={<ImageIcon />} title="Sistemas de diseño escalables" meta={<span>Desarrollo</span>}
              badge={<StatusBadge tone="draft">Borrador</StatusBadge>} actions={<button className="a-btn a-btn--ghost a-btn--sm">Cancelar edición</button>} />
          </ul>
        </Card>

        <Card title="Carga y vacío">
          <ListSkeleton rows={2} />
          <div style={{ height: 16 }} />
          <EmptyState icon={<FolderIcon />} title="Aún no hay entradas" description="Crea la primera y aparecerá en el blog del sitio."
            action={<button className="a-btn a-btn--primary"><PlusIcon /> Nueva entrada</button>} />
        </Card>

        <Card title="Sheet">
          <button className="a-btn a-btn--ghost" onClick={() => setSheet(true)}>Abrir panel</button>
          <Sheet open={sheet} onOpenChange={setSheet} title="Editar proyecto" description="Los cambios se publican al guardar."
            footer={<><button className="a-btn a-btn--ghost" onClick={() => setSheet(false)}>Cancelar</button><button className="a-btn a-btn--primary">Guardar</button></>}>
            <Field label="Título" required>{(p) => <input {...p} className="admin-input" defaultValue="Amelia" />}</Field>
          </Sheet>
        </Card>

        <UnsavedBar dirty onSave={() => {}} onDiscard={() => {}} />
      </main>
    </div>
  )
}
