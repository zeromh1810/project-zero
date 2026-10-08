"use client"

import { useLayoutEffect, useRef } from "react"

/**
 * Devolver el foco al cerrar un Radix Dialog controlado (Sheet, ConfirmDialog).
 * Radix lo devuelve a su <Dialog.Trigger>; estos componentes se abren por
 * estado (sin Trigger), así que el foco terminaba en <body> al cerrar.
 * useLayoutEffect corre antes de que el FocusScope de Radix (un effect del
 * hijo) mueva el foco adentro: captura el elemento que abrió el diálogo.
 */
export function useReturnFocus(open: boolean) {
  const returnTo = useRef<HTMLElement | null>(null)
  useLayoutEffect(() => {
    if (open) returnTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
  }, [open])
  return (e: Event) => {
    e.preventDefault()
    const el = returnTo.current
    if (el?.isConnected) el.focus()
  }
}
