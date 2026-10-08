"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { usePresence } from "@/lib/motion"

// Cambios sin guardar (DS v2.1.0, AM-3). Antes ningún tab los detectaba:
// editar el Hero y pasar a otro tab descartaba todo en silencio.
// (Sin coincidencia en la base de ui-ux-pro-max: criterio propio.)
//
// - Cada tab registra si está "sucio" con useDirty(sucio, guardar).
// - El panel marca el tab con un punto y, al intentar salir, pregunta
//   (Guardar / Descartar / Seguir editando) en vez de perder los cambios.
// - beforeunload avisa al cerrar o recargar la pestaña del navegador.

type Registration = { dirty: boolean; save?: () => Promise<void> | void }

interface DirtyCtx {
  register: (key: string, reg: Registration) => void
  unregister: (key: string) => void
  isDirty: (key?: string) => boolean
  saveAll: () => Promise<void>
}

const Ctx = createContext<DirtyCtx | null>(null)
// Booleano aparte: el panel lo usa para el punto de "cambios sin guardar" en la
// navegación. Separado del registro para que este cambie de valor sin volver
// inestable el contexto de registro (eso re-dispararía los useDirty en ciclo).
const AnyDirtyCtx = createContext(false)

export function DirtyProvider({ children, onChange }: { children: ReactNode; onChange?: (anyDirty: boolean) => void }) {
  const regs = useRef(new Map<string, Registration>())
  const [any, setAny] = useState(false)

  const anyDirty = () => [...regs.current.values()].some((r) => r.dirty)

  const register = useCallback((key: string, reg: Registration) => {
    const prev = regs.current.get(key)
    regs.current.set(key, reg)
    if (prev?.dirty !== reg.dirty) { const a = anyDirty(); setAny(a); onChange?.(a) }
  }, [onChange])

  const unregister = useCallback((key: string) => {
    if (regs.current.delete(key)) { const a = anyDirty(); setAny(a); onChange?.(a) }
  }, [onChange])

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (anyDirty()) { e.preventDefault(); e.returnValue = "" }
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [])

  const value = useMemo<DirtyCtx>(() => ({
    register,
    unregister,
    isDirty: (key?: string) => key ? !!regs.current.get(key)?.dirty : anyDirty(),
    saveAll: async () => {
      for (const r of regs.current.values()) if (r.dirty && r.save) await r.save()
    },
  }), [register, unregister])

  return (
    <Ctx.Provider value={value}>
      <AnyDirtyCtx.Provider value={any}>{children}</AnyDirtyCtx.Provider>
    </Ctx.Provider>
  )
}

export function useDirtyContext() {
  return useContext(Ctx)
}

/** true si algún formulario registrado tiene cambios sin guardar (re-renderiza al cambiar). */
export function useAnyDirty() {
  return useContext(AnyDirtyCtx)
}

/**
 * Registra el estado "sucio" de un formulario. `dirty` = hay cambios sin guardar.
 * `save` permite que el aviso de salida ofrezca "Guardar" directamente.
 */
export function useDirty(key: string, dirty: boolean, save?: () => Promise<void> | void) {
  const ctx = useContext(Ctx)
  const saveRef = useRef(save)
  useEffect(() => { saveRef.current = save })
  useEffect(() => {
    ctx?.register(key, { dirty, save: () => saveRef.current?.() })
  }, [ctx, key, dirty])
  useEffect(() => () => ctx?.unregister(key), [ctx, key])
}

/** Compara el formulario con lo último guardado (JSON estable). */
export function isSameData(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b)
}

/** Barra fija al pie cuando hay cambios: el guardado deja de estar perdido al final del formulario. */
export function UnsavedBar({ dirty, saving, onSave, onDiscard, saveLabel = "Guardar cambios" }: {
  dirty: boolean
  saving?: boolean
  onSave: () => void
  onDiscard?: () => void
  saveLabel?: string
}) {
  // Entra con el primer cambio y baja al guardarse o descartarse (lib/motion).
  const p = usePresence(dirty || !!saving)
  if (!p.mounted) return null
  return (
    <div className={`a-unsaved${p.exiting ? " is-exiting" : ""}`} role="region" aria-label="Cambios sin guardar">
      <span className="a-unsaved-dot" aria-hidden="true" />
      <span className="a-unsaved-text">{saving ? "Guardando…" : "Tienes cambios sin guardar"}</span>
      {onDiscard && (
        <button type="button" className="a-btn a-btn--ghost a-btn--sm" onClick={onDiscard} disabled={saving}>
          Descartar
        </button>
      )}
      <button type="button" className="a-btn a-btn--primary a-btn--sm" onClick={onSave} disabled={saving} aria-busy={saving || undefined}>
        {saving ? "Guardando…" : saveLabel}
      </button>
    </div>
  )
}
