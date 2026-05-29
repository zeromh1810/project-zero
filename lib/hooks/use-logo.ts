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

// Call this after saving logos in admin so all useLogo() instances re-fetch
export function invalidateLogo() {
  cache = null
  pending = null
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("logo-updated"))
  }
}

export function useLogo(): LogoData {
  const [data, setData] = useState<LogoData>(cache ?? DEFAULT)

  useEffect(() => {
    if (!cache) fetchLogo().then(setData)

    function onUpdate() {
      fetchLogo().then(setData)
    }
    window.addEventListener("logo-updated", onUpdate)
    return () => window.removeEventListener("logo-updated", onUpdate)
  }, [])

  return data
}
