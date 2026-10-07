"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { ToastType } from "../admin-toast"
import { useDirty, isSameData } from "./dirty"

type Toast = (title: string, type: ToastType, msg?: string) => void

const GITHUB_WARN = "No se pudo sincronizar con GitHub. Los cambios se perderán en el próximo deploy."

/**
 * Recurso editable de página única (Hero, Perfil, Sobre mí, CV, Redes…).
 * Centraliza lo que cada tab repetía a mano y lo que ninguno hacía:
 * - carga (GET), guardado (PUT) con `res.ok` comprobado y aviso de GitHub;
 * - "cambios sin guardar" contra lo último guardado (useDirty) + descartar;
 * - validación opcional antes de guardar.
 */
export function useResource<T extends object>({
  key, url, defaults, onToast, label, validate, onSaved,
}: {
  /** Clave única para el registro de cambios sin guardar. */
  key: string
  url: string
  defaults: T
  onToast: Toast
  /** Nombre en los toasts: "Hero actualizado". */
  label: string
  /** Devuelve true si se puede guardar (marca sus propios errores). */
  validate?: (data: T) => boolean
  /** Tras guardar OK (ej. invalidar la caché del sitio). */
  onSaved?: () => void
}) {
  const [data, setData] = useState<T>(defaults)
  const [saved, setSaved] = useState<T>(defaults)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const dataRef = useRef(data)
  useEffect(() => { dataRef.current = data })

  useEffect(() => {
    let ignore = false
    fetch(url, { cache: "no-store" })
      .then(r => r.json())
      .then(d => { if (!ignore) { const merged = { ...defaults, ...d }; setData(merged); setSaved(merged) } })
      .catch(() => onToast(`No se pudo cargar ${label}`, "error"))
      .finally(() => { if (!ignore) setLoading(false) })
    return () => { ignore = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- carga única por url
  }, [url])

  const set = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setData(prev => ({ ...prev, [field]: value }))
  }, [])

  const save = useCallback(async () => {
    const current = dataRef.current
    if (validate && !validate(current)) {
      onToast("Revisa los campos marcados", "warning")
      return
    }
    setSaving(true)
    try {
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(current),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || (res.status === 401 ? "Tu sesión expiró. Vuelve a entrar." : "No se pudo guardar"))
      setSaved(current)
      onSaved?.()
      body._githubWarning
        ? onToast(`${label} guardado localmente`, "warning", GITHUB_WARN)
        : onToast(`${label} actualizado`, "success")
    } catch (e) {
      onToast("Error al guardar", "error", e instanceof Error ? e.message : undefined)
    } finally {
      setSaving(false)
    }
  }, [url, label, onToast, validate, onSaved])

  const dirty = !loading && !isSameData(data, saved)
  useDirty(key, dirty, save)

  const discard = useCallback(() => setData(saved), [saved])

  return { data, setData, set, loading, saving, dirty, save, discard }
}
