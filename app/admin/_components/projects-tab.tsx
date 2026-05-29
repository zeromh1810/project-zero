"use client"

import { useState, useEffect } from "react"
import ProjectForm, { type ProjectData } from "./project-form"

import type { ToastType } from "./admin-toast"

interface Props {
  onToast: (title: string, type: ToastType, msg?: string) => void
}

export default function ProjectsTab({ onToast }: Props) {
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<ProjectData | null | undefined>(undefined)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)

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

  useEffect(() => { load() }, [])

  async function handleSave(data: ProjectData) {
    setSaving(true)
    try {
      if (editing?.id) {
        await fetch(`/api/admin/projects/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        onToast("Proyecto actualizado", "success")
      } else {
        await fetch("/api/admin/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        onToast("Proyecto creado", "success")
      }
      setEditing(undefined)
      load()
    } catch {
      onToast("Error al guardar", "error")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    try {
      await fetch(`/api/admin/projects/${id}`, { method: "DELETE" })
      onToast("Proyecto eliminado", "success")
      setConfirmDelete(null)
      load()
    } catch {
      onToast("Error al eliminar", "error")
    }
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" />
        Cargando proyectos…
      </div>
    )
  }

  return (
    <>
      <div className="admin-section-header">
        <div>
          <div className="admin-section-title">Proyectos</div>
          <div className="admin-section-sub">{projects.length} proyecto{projects.length !== 1 ? "s" : ""} en el portafolio</div>
        </div>
        <button className="btn-p" onClick={() => setEditing(null)}>
          + Nuevo proyecto
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="admin-empty">
          <div className="admin-empty-icon">📂</div>
          <div className="admin-empty-text">No hay proyectos aún. Crea el primero.</div>
        </div>
      ) : (
        <div className="admin-project-list">
          {projects.map(p => (
            <div key={p.id} className="admin-project-item">
              <div className="admin-project-emoji">{p.emoji}</div>
              <div className="admin-project-info">
                <div className="admin-project-title">{p.title}</div>
                <div className="admin-project-meta">{p.category} · {p.year}</div>
              </div>
              <div className="admin-project-actions">
                {confirmDelete === p.id ? (
                  <>
                    <button className="admin-btn-sm admin-btn-danger"
                      onClick={() => handleDelete(p.id!)}>
                      Confirmar
                    </button>
                    <button className="admin-btn-sm"
                      onClick={() => setConfirmDelete(null)}>
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button className="admin-btn-sm"
                      onClick={() => setEditing(p)}>
                      Editar
                    </button>
                    <button className="admin-btn-sm admin-btn-danger"
                      onClick={() => setConfirmDelete(p.id!)}>
                      Eliminar
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
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
