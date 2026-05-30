"use client"

import { useState, useEffect } from "react"

export interface FooterData {
  brand:   string
  tagline: string
  copy:    string
}

const DEFAULT: FooterData = {
  brand:   "Project Zero",
  tagline: "Product Designer & Frontend Developer · Santiago",
  copy:    "© 2026 Carlos Felipe Rojas Hickmann",
}

let cache:   FooterData | null = null
let pending: Promise<FooterData> | null = null

function fetchFooter(): Promise<FooterData> {
  if (!pending) {
    pending = fetch("/api/admin/footer", { cache: "no-store" })
      .then(r => r.json())
      .then((d): FooterData => {
        cache = { ...DEFAULT, ...d }
        return cache!
      })
      .catch((): FooterData => {
        pending = null
        return DEFAULT
      })
  }
  return pending!
}

export function invalidateFooter() {
  cache = null
  pending = null
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("footer-updated"))
  }
}

export function useFooter(initial?: FooterData): FooterData {
  if (initial && !cache) cache = { ...DEFAULT, ...initial }

  const [data, setData] = useState<FooterData>(cache ?? DEFAULT)

  useEffect(() => {
    if (!cache) fetchFooter().then(setData)

    function onUpdate() { fetchFooter().then(setData) }
    window.addEventListener("footer-updated", onUpdate)
    return () => window.removeEventListener("footer-updated", onUpdate)
  }, [])

  return data
}
