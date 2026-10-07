"use client"

/* eslint-disable @next/next/no-img-element -- documentación: capturas PNG y
   miniaturas que el admin ya muestra con <img>; next/image no aporta aquí. */

import { useState } from "react"
import projectsJson from "@/data/projects.json"
import type { Project } from "@/lib/data/projects"
import AdminToast, { type ToastType } from "@/app/admin/_components/admin-toast"
import { Field } from "@/app/admin/_components/ui/field"
import { Dropzone } from "@/app/admin/_components/ui/dropzone"
import { ConfirmAction } from "@/app/admin/_components/ui/confirm-action"
import { ConfirmDialog } from "@/app/admin/_components/ui/confirm-dialog"
import { Sheet } from "@/app/admin/_components/ui/sheet"
import { TagInput } from "@/app/admin/_components/ui/tag-input"
import { EmptyState, ListItem, ListSkeleton, StatusBadge } from "@/app/admin/_components/ui/display"
import { UnsavedBar } from "@/app/admin/_components/ui/dirty"
import { EditIcon, FolderIcon, PlusIcon, TrashIcon } from "@/components/portfolio/icons"
import {
  A11yChecklist, Anatomy, Capture, DocPage, Example, Prose, Redline, Rules, Section, StateMatrix, UsageRule, Variants, WhenToUse,
} from "../ui/doc"
import { PageLink } from "../ui/nav"

const PROJECTS = projectsJson as unknown as Project[]
const noop = () => {}

/* ═══════════════════════════════ Campo ═══════════════════════════════ */

function TitleField({ error, value = "", hint = true, required = true }: { error?: string; value?: string; hint?: boolean; required?: boolean }) {
  return (
    <Field label="Título" required={required} hint={hint ? "Aparece en la tarjeta y en el detalle. Máx. 60 caracteres." : undefined} error={error} className="doc-w-sm">
      {(c) => <input {...c} className="admin-input" defaultValue={value} />}
    </Field>
  )
}

export function PageCampo() {
  const [tags, setTags] = useState<string[]>(PROJECTS[0].tags.slice(0, 3))
  return (
    <DocPage
      eyebrow="Componentes del admin"
      title="Campo"
      status="nuevo"
      summary={<p>Todo control del panel va dentro de un Campo: etiqueta visible arriba, ayuda opcional y el error debajo. El componente conecta etiqueta, ayuda y error con el control para lectores de pantalla — el diseño solo decide el texto.</p>}
      tabs={[
        { id: "uso", label: "Uso", content: <>
          <Section title="Cuándo usarlo">
            <WhenToUse
              use={["Para cualquier input, textarea, select o editor del admin.", "Cuando el dato tiene formato (URL, email) y conviene una ayuda."]}
              avoid={[{ text: "Para subir imágenes", instead: <PageLink to="dropzone">Dropzone</PageLink> }, { text: "En el formulario público", instead: <PageLink to="formulario">el campo flotante</PageLink> }]}
            />
          </Section>
          <Section title="Variantes">
            <Variants items={[
              { name: "Texto", desc: "Con ayuda y obligatorio.", demo: <TitleField value="App Finanzas Personales" /> },
              { name: "Con error", desc: "El error aparece sobre la ayuda, en rojo y anunciado.", demo: <TitleField error="Escribe un título" /> },
              { name: "Etiquetas", desc: "TagInput: Enter o coma para agregar.", demo: <Field label="Habilidades" hint="Hasta 10." className="doc-w-sm">{(c) => <TagInput value={tags} onChange={setTags} control={c} />}</Field> },
            ]} />
          </Section>
          <Section title="Reglas">
            <Rules>
              <UsageRule
                title="Etiqueta siempre visible, arriba"
                doText="La etiqueta describe el dato; el placeholder no se usa como etiqueta."
                doDemo={<TitleField value="" />}
                dontText="Solo placeholder: al escribir desaparece y el campo queda sin nombre."
                dontDemo={<div className="a-field doc-w-sm"><input className="admin-input" placeholder="Título del proyecto" aria-label="Título" /></div>}
              />
              <UsageRule
                title="El error dice qué hacer"
                doText="«Escribe una URL completa, con https://» se corrige al leerlo."
                doDemo={<Field label="URL publicada" error="Escribe una URL completa, con https://" className="doc-w-sm">{(c) => <input {...c} className="admin-input" defaultValue="amelia.latam" />}</Field>}
                dontText="«Error» o «Inválido» obliga a adivinar."
                dontDemo={<Field label="URL publicada" error="Inválido" className="doc-w-sm">{(c) => <input {...c} className="admin-input" defaultValue="amelia.latam" />}</Field>}
              />
            </Rules>
          </Section>
        </> },
        { id: "estilo", label: "Estilo", content: <>
          <Section title="Anatomía">
            <Anatomy parts={[
              { n: 1, label: "Etiqueta", detail: "con * si es obligatorio", x: 30, y: 26 },
              { n: 2, label: "Control", detail: "alto 44px", x: 50, y: 48 },
              { n: 3, label: "Ayuda o error", detail: "debajo del control", x: 45, y: 72 },
            ]}><TitleField value="Amelia" /></Anatomy>
          </Section>
          <Section title="Medidas"><Redline label="Input del admin"><input className="admin-input doc-x-input-w" defaultValue="Amelia" aria-label="Ejemplo" /></Redline></Section>
          <Section title="Estados">
            <StateMatrix
              states={[{ label: "Reposo" }, { label: "Hover", pseudo: "hover" }, { label: "Foco", pseudo: "focus" }, { label: "Error", extra: { error: true } }, { label: "Deshabilitado", extra: { disabled: true } }]}
              render={({ pseudo, extra }) => <input className="admin-input" data-pseudo={pseudo} defaultValue="Amelia" aria-label="Ejemplo" aria-invalid={extra?.error ? true : undefined} disabled={!!extra?.disabled} />}
            />
          </Section>
        </> },
        { id: "contenido", label: "Contenido", content: (
          <Section title="Escribir etiquetas, ayudas y errores">
            <div className="doc-table-wrap"><table className="doc-table">
              <thead><tr><th scope="col">Pieza</th><th scope="col">Guía</th><th scope="col">Ejemplo</th></tr></thead>
              <tbody>
                <tr><td>Etiqueta</td><td>Sustantivo corto, sin dos puntos</td><td>URL publicada</td></tr>
                <tr><td>Ayuda</td><td>Dónde aparece o qué formato; una frase</td><td>Aparece en la tarjeta y en el detalle.</td></tr>
                <tr><td>Error</td><td>Qué hacer, en imperativo</td><td>Escribe un título</td></tr>
              </tbody>
            </table></div>
          </Section>
        ) },
        { id: "a11y", label: "Accesibilidad", content: (
          <Section title="Lista de chequeo">
            <A11yChecklist
              built={["label con htmlFor generado (useId).", "aria-describedby a la ayuda y al error; aria-invalid y aria-required.", "Al guardar con errores, el foco va al primer campo inválido."]}
              designer={["Escribe la ayuda antes de que haga falta un error.", "No pidas datos que el sitio no usa."]}
            />
          </Section>
        ) },
        { id: "codigo", label: "Código", content: (
          <Section title="Uso">
            <Example code={`import { Field } from "../ui/field"\n\n<Field label="Título" required hint="Máx. 60 caracteres." error={errors.title}>\n  {(control) => (\n    <input {...control} className="admin-input"\n      value={title} onChange={e => setTitle(e.target.value)} />\n  )}\n</Field>`}>
              <TitleField />
            </Example>
          </Section>
        ) },
      ]}
    />
  )
}

/* ═══════════════════════════════ Dropzone ═══════════════════════════════ */

function DemoDrop({ initial }: { initial?: string }) {
  const [url, setUrl] = useState<string | undefined>(initial)
  // En la documentación no se sube nada: se previsualiza el archivo local.
  return (
    <div className="doc-w-sm">
      <Dropzone label="Imagen de portada" hint="JPG o PNG, 1600×1000px." value={url}
        onUpload={async (f) => setUrl(URL.createObjectURL(f))} onRemove={() => setUrl(undefined)} aspect="16 / 10" />
    </div>
  )
}

export function PageDropzone() {
  return (
    <DocPage
      eyebrow="Componentes del admin"
      title="Dropzone"
      status="nuevo"
      summary={<p>Sube una imagen arrastrándola o eligiéndola. Con imagen, muestra la vista previa con las acciones <strong>Cambiar</strong> y <strong>Quitar</strong> siempre visibles — no escondidas en un hover.</p>}
      tabs={[
        { id: "uso", label: "Uso", content: <>
          <Section title="Variantes" intro={<p>Puedes probarlo: el archivo solo se previsualiza, no se sube.</p>}>
            <Variants items={[
              { name: "Vacío", desc: "Invita a arrastrar o elegir.", demo: <DemoDrop /> },
              { name: "Con imagen", desc: "Vista previa y acciones visibles.", demo: <DemoDrop initial={PROJECTS[0].thumbnail} /> },
            ]} />
          </Section>
          <Section title="Reglas">
            <Rules>
              <UsageRule
                title="Acciones a la vista"
                doText="Cambiar y Quitar debajo de la imagen: se descubren en táctil y con teclado."
                doDemo={<DemoDrop initial={PROJECTS[1].thumbnail} />}
                dontText="Acciones que aparecen solo con hover: en móvil no existen."
                dontDemo={<div className="doc-w-sm"><div className="a-field-label">Imagen de portada</div><div className="a-drop-preview doc-x-ratio"><img src={PROJECTS[1].thumbnail} alt="" /></div></div>}
              />
              <UsageRule
                title="Indica formato y tamaño antes"
                doText="La ayuda dice formato y medida ideal."
                doDemo={<DemoDrop />}
                dontText="Sin ayuda, la persona descubre el requisito recién al fallar."
                dontDemo={<div className="doc-w-sm"><Dropzone label="Imagen de portada" onUpload={async () => {}} aspect="16 / 10" /></div>}
              />
            </Rules>
          </Section>
        </> },
        { id: "estilo", label: "Estilo", content: (
          <Section title="Estados">
            <StateMatrix
              states={[{ label: "Reposo" }, { label: "Hover", pseudo: "hover" }, { label: "Foco", pseudo: "focus" }]}
              render={({ pseudo }) => <button type="button" className="a-drop-zone doc-x-ratio" data-pseudo={pseudo}><span className="a-drop-text">Arrastra una imagen o <u>elige un archivo</u></span></button>}
            />
          </Section>
        ) },
        { id: "a11y", label: "Accesibilidad", content: (
          <Section title="Lista de chequeo">
            <A11yChecklist
              built={["Es un <button>: se activa con teclado (arrastrar no es la única vía).", "Etiqueta y ayuda conectadas; aria-busy mientras sube.", "Errores (tipo de archivo, red) se muestran y anuncian."]}
              designer={["Las imágenes de vista previa son decorativas: el contexto lo da la etiqueta."]}
            />
          </Section>
        ) },
        { id: "codigo", label: "Código", content: (
          <Section title="Uso">
            <Example code={`<Dropzone\n  label="Imagen de portada"\n  hint="JPG o PNG, 1600×1000px."\n  value={thumbnail}\n  onUpload={async (file) => setThumbnail(await upload(file))}\n  onRemove={() => setThumbnail("")}\n  aspect="16 / 10"\n/>`}><DemoDrop /></Example>
          </Section>
        ) },
      ]}
    />
  )
}

/* ═══════════════════════════════ Confirmación ═══════════════════════════════ */

function DialogDemo() {
  const [open, setOpen] = useState(false)
  return <>
    <button type="button" className="a-btn a-btn--ghost" onClick={() => setOpen(true)}>Abrir diálogo</button>
    <ConfirmDialog open={open} onCancel={() => setOpen(false)} title="Tienes cambios sin guardar"
      description={<>Si vas a <strong>Blog</strong> sin guardar, se pierden los cambios de <strong>Hero</strong>.</>}
      actions={<>
        <button type="button" className="a-btn a-btn--ghost" autoFocus onClick={() => setOpen(false)}>Seguir editando</button>
        <button type="button" className="a-btn a-btn--danger-ghost" onClick={() => setOpen(false)}>Descartar</button>
        <button type="button" className="a-btn a-btn--primary" onClick={() => setOpen(false)}>Guardar y continuar</button>
      </>} />
  </>
}

function StaticDialog({ actions }: { actions: React.ReactNode }) {
  return (
    <div className="a-dialog doc-x-static" role="presentation">
      <p className="a-dialog-title">Tienes cambios sin guardar</p>
      <p className="a-dialog-desc">Si vas a <strong>Blog</strong> sin guardar, se pierden los cambios de <strong>Hero</strong>.</p>
      <div className="a-dialog-actions">{actions}</div>
    </div>
  )
}

export function PageConfirmacion() {
  return (
    <DocPage
      eyebrow="Componentes del admin"
      title="Confirmación"
      status="nuevo"
      summary={<p>Dos formas de confirmar, según el costo del error. <strong>En línea</strong> (ConfirmAction) para borrar un elemento de una lista; <strong>diálogo</strong> (ConfirmDialog) cuando la decisión tiene más de dos salidas, como salir con cambios sin guardar.</p>}
      tabs={[
        { id: "uso", label: "Uso", content: <>
          <Section title="Variantes" intro={<p>Pruébalos: en la documentación no borran nada.</p>}>
            <Variants items={[
              { name: "En línea", desc: "El botón se transforma en la pregunta. Foco en «Cancelar».", demo: <ConfirmAction onConfirm={noop} itemName="Amelia" question="¿Eliminar «Amelia»?" /> },
              { name: "Diálogo", desc: "Bloquea la pantalla; para decisiones con varias salidas.", demo: <DialogDemo /> },
            ]} />
          </Section>
          <Section title="Reglas">
            <Rules>
              <UsageRule
                title="Todo lo irreversible se confirma"
                doText="Eliminar pide confirmación nombrando lo que se borra."
                doDemo={<ul className="a-list doc-w-md"><ListItem title="Amelia" meta="Product design · 2025" actions={<ConfirmAction onConfirm={noop} itemName="Amelia" question="¿Eliminar «Amelia»?" />} /></ul>}
                dontText="Borrar al primer click (y publicar el borrado en el sitio) no deja vuelta atrás."
                dontDemo={<ul className="a-list doc-w-md"><ListItem title="Amelia" meta="Product design · 2025" actions={<button type="button" className="a-btn a-btn--danger a-btn--sm"><TrashIcon /> Eliminar</button>} /></ul>}
              />
              <UsageRule
                title="La opción segura primero y con foco"
                doText="«Seguir editando» a la izquierda y enfocada; la destructiva no es la acción por defecto."
                doDemo={<StaticDialog actions={<><button type="button" className="a-btn a-btn--ghost" data-pseudo="focus">Seguir editando</button><button type="button" className="a-btn a-btn--danger-ghost">Descartar</button><button type="button" className="a-btn a-btn--primary">Guardar y continuar</button></>} />}
                dontText="«Sí / No» no dice qué pasa, y el destructivo en primario invita a perder el trabajo."
                dontDemo={<StaticDialog actions={<><button type="button" className="a-btn a-btn--ghost">No</button><button type="button" className="a-btn a-btn--danger">Sí</button></>} />}
              />
            </Rules>
          </Section>
        </> },
        { id: "contenido", label: "Contenido", content: (
          <Section title="Escribir la confirmación">
            <Prose><ul>
              <li>La pregunta nombra el elemento: «¿Eliminar «Amelia»?».</li>
              <li>Los botones repiten el verbo: «Sí, eliminar», no «Aceptar».</li>
              <li>Si se pierde algo, dilo: «se pierden los cambios de Hero».</li>
            </ul></Prose>
          </Section>
        ) },
        { id: "a11y", label: "Accesibilidad", content: (
          <Section title="Lista de chequeo">
            <A11yChecklist
              built={["En línea: el foco pasa a «Cancelar»; Esc cancela; el foco vuelve al botón original.", "Diálogo: role=\"alertdialog\", foco atrapado, Esc = seguir editando.", "Mientras corre la acción, los botones quedan deshabilitados."]}
              designer={["No uses un diálogo para avisos que no requieren decisión: usa un toast."]}
            />
          </Section>
        ) },
        { id: "codigo", label: "Código", content: (
          <Section title="En línea">
            <Example code={`<ConfirmAction\n  itemName={post.title}\n  question={\`¿Eliminar «\${post.title}»?\`}\n  onConfirm={() => deletePost(post.slug)}\n/>`}><ConfirmAction onConfirm={noop} itemName="Amelia" question="¿Eliminar «Amelia»?" /></Example>
          </Section>
        ) },
      ]}
    />
  )
}

/* ═══════════════════════════════ Panel lateral ═══════════════════════════════ */

function SheetDemo() {
  const [open, setOpen] = useState(false)
  return <>
    <button type="button" className="a-btn a-btn--primary" onClick={() => setOpen(true)}><EditIcon /> Editar proyecto</button>
    <Sheet open={open} onOpenChange={setOpen} title="Editar proyecto" description={PROJECTS[1].title}
      footer={<><button type="button" className="a-btn a-btn--ghost" onClick={() => setOpen(false)}>Cancelar</button><button type="button" className="a-btn a-btn--primary" onClick={() => setOpen(false)}>Guardar</button></>}>
      <TitleField value={PROJECTS[1].title} />
    </Sheet>
  </>
}

export function PagePanelLateral() {
  return (
    <DocPage
      eyebrow="Componentes del admin"
      title="Panel lateral"
      status="nuevo"
      summary={<p>Edita un elemento sin perder la lista de vista. Entra desde la derecha, con el título del elemento arriba y las acciones fijas al pie.</p>}
      tabs={[
        { id: "uso", label: "Uso", content: <>
          <Section title="Ejemplo" intro={<p>Ábrelo: Esc o el fondo lo cierran.</p>}>
            <Example><SheetDemo /></Example>
          </Section>
          <Section title="En contexto">
            <Capture id="admin-sheet" alt="Panel lateral de edición de proyecto abierto sobre la lista de proyectos del admin" />
          </Section>
          <Section title="Cuándo usarlo">
            <WhenToUse
              use={["Para editar o crear un elemento de una lista (proyecto, post).", "Cuando conviene seguir viendo el contexto."]}
              avoid={[{ text: "Para una pregunta de sí o no", instead: <PageLink to="confirmacion">Confirmación</PageLink> }, { text: "Para ajustes de una sola pantalla (Hero, Perfil)", instead: "el formulario en la página" }]}
            />
          </Section>
        </> },
        { id: "a11y", label: "Accesibilidad", content: (
          <Section title="Lista de chequeo">
            <A11yChecklist
              built={["Radix Dialog: foco atrapado, Esc cierra, el foco vuelve al disparador.", "Título y descripción conectados (aria-labelledby/describedby).", "Botón cerrar con aria-label."]}
              designer={["Si hay cambios sin guardar, cerrar pregunta antes de descartar."]}
            />
          </Section>
        ) },
      ]}
    />
  )
}

/* ═══════════════════════════════ Lista ═══════════════════════════════ */

const Thumb = ({ src }: { src?: string }) => (src ? <img src={src} alt="" /> : <FolderIcon />)

export function PageLista() {
  return (
    <DocPage
      eyebrow="Componentes del admin"
      title="Lista e insignia de estado"
      status="nuevo"
      summary={<p>Las colecciones del admin (proyectos, posts, marcas) usan la misma fila: imagen, título, metadatos, estado y acciones. Con su esqueleto de carga y su estado vacío.</p>}
      tabs={[
        { id: "uso", label: "Uso", content: <>
          <Section title="Ejemplo">
            <Example align="stretch">
              <ul className="a-list">
                {PROJECTS.slice(0, 3).map((p, i) => (
                  <ListItem key={p.id} active={i === 1} media={<Thumb src={p.thumbnail} />} title={p.title} meta={`${p.category} · ${p.year}`}
                    badge={<StatusBadge tone={i === 2 ? "draft" : "live"}>{i === 2 ? "Borrador" : "Publicado"}</StatusBadge>}
                    actions={<><button type="button" className="a-btn a-btn--ghost a-btn--sm"><EditIcon /> Editar</button><ConfirmAction onConfirm={noop} itemName={p.title} /></>} />
                ))}
              </ul>
            </Example>
          </Section>
          <Section title="Insignias de estado">
            <Variants items={[
              { name: "Publicado", desc: "Visible en el sitio.", demo: <StatusBadge tone="live">Publicado</StatusBadge> },
              { name: "Borrador", desc: "Guardado, no visible.", demo: <StatusBadge tone="draft">Borrador</StatusBadge> },
              { name: "Atención", desc: "Le falta algo para publicarse.", demo: <StatusBadge tone="warning">Sin imagen</StatusBadge> },
              { name: "Neutra", desc: "Dato informativo.", demo: <StatusBadge tone="neutral">Destacado</StatusBadge> },
            ]} />
          </Section>
          <Section title="Carga y vacío">
            <Variants items={[
              { name: "Cargando", desc: "Misma forma que la fila.", demo: <div className="doc-w-full"><ListSkeleton rows={2} /></div> },
              { name: "Vacío", desc: "Explica y ofrece la acción.", demo: <EmptyState icon={<FolderIcon size={22} />} title="Aún no hay proyectos" description="Crea el primero para que aparezca en la galería." action={<button type="button" className="a-btn a-btn--primary a-btn--sm"><PlusIcon /> Nuevo proyecto</button>} /> },
            ]} />
          </Section>
          <Section title="Reglas">
            <Rules>
              <UsageRule
                title="El estado con texto, no solo con color"
                doText="La insignia dice «Borrador»: el color refuerza, no reemplaza."
                doDemo={<StatusBadge tone="draft">Borrador</StatusBadge>}
                dontText="Un punto de color sin texto: hay que memorizar qué significa."
                dontDemo={<span className="doc-x-dot" />}
              />
              <UsageRule
                title="El estado vacío propone el siguiente paso"
                doText="Qué falta y un botón para crearlo."
                doDemo={<EmptyState icon={<FolderIcon size={22} />} title="Aún no hay posts" description="Escribe la primera entrada del blog." action={<button type="button" className="a-btn a-btn--primary a-btn--sm"><PlusIcon /> Nuevo post</button>} />}
                dontText="Un mensaje sin acción deja a la persona buscando cómo seguir."
                dontDemo={<p className="doc-demo-text">No hay datos.</p>}
              />
            </Rules>
          </Section>
        </> },
        { id: "estilo", label: "Estilo", content: (
          <Section title="Anatomía">
            <Anatomy parts={[
              { n: 1, label: "Imagen", detail: "56×40, decorativa", x: 9, y: 50 },
              { n: 2, label: "Título e insignia", x: 36, y: 36 },
              { n: 3, label: "Metadatos", x: 30, y: 64 },
              { n: 4, label: "Acciones", detail: "siempre visibles", x: 84, y: 50 },
            ]}>
              <ul className="a-list doc-w-full"><ListItem media={<Thumb src={PROJECTS[0].thumbnail} />} title="Amelia" meta="Product design · 2025" badge={<StatusBadge tone="live">Publicado</StatusBadge>} actions={<button type="button" className="a-btn a-btn--ghost a-btn--sm"><EditIcon /> Editar</button>} /></ul>
            </Anatomy>
          </Section>
        ) },
        { id: "a11y", label: "Accesibilidad", content: (
          <Section title="Lista de chequeo">
            <A11yChecklist
              built={["<ul>/<li> reales; el elemento en edición lleva aria-current.", "Las acciones incluyen el nombre del elemento en su nombre accesible.", "El esqueleto anuncia aria-busy."]}
              designer={["Títulos únicos: «Editar» repetido sin contexto confunde."]}
            />
          </Section>
        ) },
      ]}
    />
  )
}

/* ═══════════════════════════════ Barra de cambios ═══════════════════════════════ */

export function PageBarraCambios() {
  return (
    <DocPage
      eyebrow="Componentes del admin"
      title="Barra de cambios sin guardar"
      status="nuevo"
      summary={<p>Aparece al pie en cuanto hay un cambio. El guardado deja de estar perdido al final de un formulario largo, y cambiar de sección con cambios pendientes pregunta antes de perderlos.</p>}
      tabs={[
        { id: "uso", label: "Uso", content: <>
          <Section title="Estados">
            <Variants items={[
              { name: "Con cambios", desc: "Descartar y guardar.", demo: <UnsavedBar dirty onSave={noop} onDiscard={noop} /> },
              { name: "Guardando", desc: "Acciones deshabilitadas.", demo: <UnsavedBar dirty saving onSave={noop} onDiscard={noop} /> },
            ]} />
          </Section>
          <Section title="Reglas">
            <Rules>
              <UsageRule
                title="Guardar es visible cuando importa"
                doText="La barra aparece con el primer cambio y no antes."
                doDemo={<UnsavedBar dirty onSave={noop} onDiscard={noop} />}
                dontText="Un botón «Guardar» siempre activo al final del formulario no avisa que hay algo pendiente."
                dontDemo={<div className="doc-demo-col"><p className="doc-demo-text">… 14 campos más …</p><div><button type="button" className="a-btn a-btn--primary">Guardar</button></div></div>}
              />
            </Rules>
          </Section>
        </> },
        { id: "a11y", label: "Accesibilidad", content: (
          <Section title="Lista de chequeo">
            <A11yChecklist
              built={["role=\"region\" «Cambios sin guardar».", "Al cambiar de sección con cambios, diálogo de confirmación.", "Si guardar falla, no cambia de sección."]}
              designer={["Valida al guardar y muestra los errores en los campos."]}
            />
          </Section>
        ) },
      ]}
    />
  )
}

/* ═══════════════════════════════ Toast ═══════════════════════════════ */

const TOASTS: { type: ToastType; title: string; msg?: string }[] = [
  { type: "success", title: "Proyecto actualizado", msg: "Los cambios ya están en el sitio." },
  { type: "error", title: "No se pudo guardar", msg: "Revisa tu conexión y vuelve a intentar." },
  { type: "warning", title: "Imagen muy pesada", msg: "Súbela en menos de 2 MB." },
  { type: "info", title: "Publicando…", msg: "Puede tardar hasta un minuto." },
]

function StaticToast({ type, title, msg }: { type: ToastType; title: string; msg?: string }) {
  const [k, setK] = useState(0)
  return <AdminToast key={k} type={type} title={title} message={msg} duration={60 * 60 * 1000} onClose={() => setK((x) => x + 1)} />
}

export function PageToast() {
  return (
    <DocPage
      eyebrow="Componentes del admin"
      title="Toast"
      status="estable"
      summary={<p>Confirma el resultado de una acción sin interrumpir: aparece abajo a la derecha y se va solo. Se pausa con el mouse encima o con el foco, para alcanzar a leerlo.</p>}
      tabs={[
        { id: "uso", label: "Uso", content: <>
          <Section title="Tipos">
            <Variants items={TOASTS.map((t) => ({ name: t.type === "success" ? "Éxito · 4s" : t.type === "error" ? "Error · 6s" : t.type === "warning" ? "Advertencia · 6s" : "Información · 4s", desc: t.title, demo: <StaticToast {...t} /> }))} />
          </Section>
          <Section title="Reglas">
            <Rules>
              <UsageRule
                title="Título con el resultado, mensaje con el siguiente paso"
                doText="«No se pudo guardar» + qué hacer."
                doDemo={<StaticToast type="error" title="No se pudo guardar" msg="Revisa tu conexión y vuelve a intentar." />}
                dontText="Un error técnico no le sirve a quien edita el sitio."
                dontDemo={<StaticToast type="error" title="Error 500" msg="TypeError: Failed to fetch" />}
              />
              <UsageRule
                title="Éxito solo si de verdad se guardó"
                doText="El toast de éxito se muestra después de comprobar la respuesta (res.ok)."
                doDemo={<StaticToast type="success" title="Proyecto actualizado" />}
                dontText="Mostrar «actualizado» ante un 401/500 hace creer que el cambio está publicado."
                dontDemo={<div className="doc-demo-col"><StaticToast type="success" title="Proyecto actualizado" /><code>POST /api/projects → 500</code></div>}
              />
            </Rules>
          </Section>
        </> },
        { id: "a11y", label: "Accesibilidad", content: (
          <Section title="Lista de chequeo">
            <A11yChecklist
              built={["role=\"status\" para éxito/info; role=\"alert\" para error/advertencia.", "La pausa detiene el temporizador real, no solo la barra.", "Botón cerrar con aria-label."]}
              designer={["No pongas acciones importantes solo dentro de un toast: desaparece."]}
            />
          </Section>
        ) },
      ]}
    />
  )
}

/* ═══════════════════════════════ Navegación del panel ═══════════════════════════════ */

export function PageNavPanel() {
  return (
    <DocPage
      eyebrow="Componentes del admin"
      title="Navegación del panel"
      status="nuevo"
      summary={<p>Las secciones del admin agrupadas por modelo mental: <strong>Contenido</strong> (qué publico), <strong>Perfil</strong> (quién soy), <strong>Marca</strong> (cómo se ve) y <strong>Sistema</strong>. Cada sección tiene URL propia (<code>?tab=blog</code>).</p>}
      tabs={[
        { id: "uso", label: "Uso", content: <>
          <Section title="Escritorio"><Capture id="admin-nav" alt="Panel admin con la navegación lateral agrupada en Contenido, Perfil, Marca y Sistema" /></Section>
          <Section title="Ítems">
            <StateMatrix
              states={[{ label: "Reposo" }, { label: "Hover", pseudo: "hover" }, { label: "Foco", pseudo: "focus" }, { label: "Activo", extra: { active: true } }, { label: "Activo con cambios", extra: { active: true, dirty: true } }]}
              render={({ pseudo, extra }) => <div className="doc-x-sidenav"><span className={`a-sidenav-item${extra?.active ? " is-active" : ""}`} data-pseudo={pseudo}>Proyectos{extra?.dirty ? <span className="a-dirty-dot" /> : null}</span></div>}
            />
          </Section>
          <Section title="Reglas">
            <Rules>
              <UsageRule
                title="Agrupar por lo que la persona quiere hacer"
                doText="Grupos cortos con nombre: se encuentra cada sección sin leerlas todas."
                doDemo={<div className="doc-x-sidenav"><div className="a-sidenav-label">Contenido</div><span className="a-sidenav-item is-active">Proyectos</span><span className="a-sidenav-item">Blog</span><div className="a-sidenav-label">Marca</div><span className="a-sidenav-item">Logo</span></div>}
                dontText="Una lista plana en orden arbitrario obliga a recorrerla entera."
                dontDemo={<div className="doc-x-sidenav">{["Proyectos", "CV", "Logo", "Hero", "Footer", "Blog", "Marcas"].map((l, i) => <span key={l} className={`a-sidenav-item${i === 0 ? " is-active" : ""}`}>{l}</span>)}</div>}
              />
            </Rules>
          </Section>
        </> },
        { id: "a11y", label: "Accesibilidad", content: (
          <Section title="Lista de chequeo">
            <A11yChecklist
              built={["role=\"tablist\" vertical: ↑ ↓ Inicio Fin con roving tabindex.", "En móvil, un <select> nativo con grupos.", "El punto de cambios sin guardar tiene aria-label."]}
              designer={["Nombres de sección iguales a los títulos de la página."]}
            />
          </Section>
        ) },
      ]}
    />
  )
}

