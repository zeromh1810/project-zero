"use client"

import { useState, useEffect } from "react"

export interface LogoData {
  lightUrl: string
  darkUrl: string
  fallbackText: string
}

const DEFAULT: LogoData = {
  lightUrl: "",
  darkUrl: "",
  fallbackText: "Project Zero",
}

// Module-level cache: shared across all hook instances, single fetch per session
let cache: LogoData | null = null
let pending: Promise<LogoData> | null = null

function fetchLogo(): Promise<LogoData> {
  if (!pending) {
    pending = fetch("/api/admin/logo", { cache: "no-store" })
      .then(r => r.json())
      .then((d): LogoData => {
        cache = { ...DEFAULT, ...d }
        return cache!
      })
      .catch((): LogoData => {
        pending = null
        return DEFAULT
      })
  }
  return pending!
}

export function useLogo(): LogoData {
  const [data, setData] = useState<LogoData>(cache ?? DEFAULT)

  useEffect(() => {
    if (cache) return
    fetchLogo().then(setData)
  }, [])

  return data
}
