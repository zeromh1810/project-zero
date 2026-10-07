"use client"

import { useEffect, useState } from "react"
import { useTheme } from "@/lib/context/theme-context"
import { readVar } from "./tokens"

/**
 * Lee el valor computado de una lista de variables CSS y lo vuelve a leer
 * cuando cambia el tema — así las tablas del DS muestran siempre el valor
 * real del tema activo, no uno escrito a mano.
 */
export function useLiveTokens(names: string[]): Record<string, string> {
  const { isDark } = useTheme()
  const [values, setValues] = useState<Record<string, string>>({})
  const key = names.join("|")

  useEffect(() => {
    // Un frame después del cambio de tema: el ThemeProvider aplica la clase
    // .dark en su propio effect.
    const id = requestAnimationFrame(() => {
      setValues(Object.fromEntries(names.map((n) => [n, readVar(n)])))
    })
    return () => cancelAnimationFrame(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `key` resume `names`
  }, [key, isDark])

  return values
}
