"use client"

import { useState, useEffect } from "react"
import ProjectForm, { type ProjectData } from "./project-form"
import { ConfirmAction } from "./ui/confirm-action"
import { ListItem, EmptyState, ListSkeleton, SectionHeader } from "./ui/display"
import { PlusIcon, EditIcon, ImageIcon, FolderIcon, ExternalIcon } from "@/components/portfolio/icons"

import type { ToastType } from "./admin-toast"

interface Props {
  onToast: (title: string, type: ToastType, msg?: string) => void
}

export default function ProjectsTab({ onToast }: Props) {
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<ProjectData | null | undefined>(undefined)
  const [saving, setSaving] = useState(false)

  async function load() {
    try {
      const res = await fetch("/api/admin/projects", { cache: "no-store" })
      setProjects(await res.json())
    } catch {
      onToast("Error cargando proyectos", "error")
    } finally {
      setLoading(false)
    }
  }

  // load() sets state after an await (inside .finally/try-catch), not
  // synchronously — it's also reused after save/delete below, so it stays a
  // shared named function instead of being inlined into the effect.
  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  useEffect(() => { load() }, [])

  async function handleSave(data: ProjectData) {
    setSaving(true)
    try {
      if (editing?.id) {
        const res = await fetch(`/api/admin/projects/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        const saved = await res.json().catch(() => ({}))
        // Antes no se miraba res.ok: un 401 (sesión vencida) o un 500 mostraba
        // "Proyecto actualizado" y cerraba el panel sin haber guardado nada.
        if (!res.ok) throw new Error(saved.error || (res.status === 401 ? "Tu sesión expiró. Vuelve a entrar." : "No se pudo guardar"))
        saved._githubWarning
          ? onToast("Proyecto guardado localmente", "warning", "No se pudo sincronizar con GitHub. Los cambios se perderán en el próximo deploy.")
          : onToast("Proyecto actualizado", "success")
      } else {
        const res = await fetch("/api/admin/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        const saved = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(saved.error || (res.status === 401 ? "Tu sesión expiró. Vuelve a entrar." : "No se pudo guardar"))
        saved._githubWarning
          ? onToast("Proyecto guardado localmente", "warning", "No se pudo sincronizar con GitHub. Los cambios se perderán en el próximo deploy.")
          : onToast("Proyecto creado", "success")
      }
      setEditing(undefined)
      load()
    } catch (e) {
      // El panel queda abierto con los cambios: no se pierde lo editado.
      onToast("Error al guardar", "error", e instanceof Error ? e.message : undefined)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    try {
      const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error()
      data._githubWarning
        ? onToast("Proyecto eliminado localmente", "warning", "No se pudo sincronizar con GitHub. El proyecto podría reaparecer en el próximo deploy.")
        : onToast("Proyecto eliminado", "success")
      load()
    } catch {
      onToast("Error al eliminar", "error")
    }
  }

  // v2.1.0 — lista con los componentes del DS (ListItem + ConfirmAction):
  // misma confirmación destructiva que Blog y Marcas, thumbnail en vez de
  // emoji, acceso directo al proyecto publicado, skeleton y vacío con acción.
  return (
    <>
      <SectionHeader
        title="Proyectos"
        description={loading ? "Cargando proyectos…" : `${projects.length} proyecto${projects.length !== 1 ? "s" : ""} en el portafolio`}
        action={<button type="button" className="a-btn a-btn--primary" onClick={() => setEditing(null)}><PlusIcon /> Nuevo proyecto</button>}
      />

      {loading ? (
        <ListSkeleton rows={4} label="Cargando proyectos" />
      ) : projects.length === 0 ? (
        <EmptyState icon={<FolderIcon />} title="Aún no hay proyectos"
          description="Crea el primero: aparecerá en la grilla del portafolio."
          action={<button type="button" className="a-btn a-btn--primary" onClick={() => setEditing(null)}><PlusIcon /> Nuevo proyecto</button>} />
      ) : (
        <ul className="a-list">
          {projects.map(p => (
            <ListItem
              key={p.id}
              active={editing?.id === p.id}
              media={p.thumbnail ? <img src={p.thumbnail} alt="" loading="lazy" /> : <ImageIcon />}
              title={p.title}
              meta={<><span>{p.category}</span><span>{p.year}</span>{p.stat && <span>{p.stat}</span>}</>}
              actions={<>
                <a className="a-icon-btn" href={`/projects/${p.id}`} target="_blank" rel="noreferrer" aria-label={`Ver «${p.title}» en el sitio`}>
                  <ExternalIcon />
                </a>
                <button type="button" className="a-btn a-btn--ghost a-btn--sm" onClick={() => setEditing(p)} aria-label={`Editar «${p.title}»`}>
                  <EditIcon /> Editar
                </button>
                <ConfirmAction itemName={p.title} question="¿Eliminar el proyecto?" onConfirm={() => handleDelete(p.id!)} />
              </>}
            />
          ))}
        </ul>
      )}

      {editing !== undefined && (
        <ProjectForm
          initial={editing}
          onSave={handleSave}
          onClose={() => setEditing(undefined)}
          saving={saving}
        />
      )}
    </>
  )
}
