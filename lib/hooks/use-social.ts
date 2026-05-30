"use client"

import { useState, useEffect } from "react"

export interface SocialData {
  linkedin:  string
  instagram: string
  github:    string
  email:     string
}

const DEFAULT: SocialData = { linkedin: "", instagram: "", github: "", email: "" }

let cache:   SocialData | null = null
let pending: Promise<SocialData> | null = null

function fetchSocial(): Promise<SocialData> {
  if (!pending) {
    pending = fetch("/api/admin/social", { cache: "no-store" })
      .then(r => r.json())
      .then((d): SocialData => {
        cache = { ...DEFAULT, ...d }
        return cache!
      })
      .catch((): SocialData => {
        pending = null
        return DEFAULT
      })
  }
  return pending!
}

export function invalidateSocial() {
  cache = null
  pending = null
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("social-updated"))
  }
}

export function useSocial(initial?: SocialData): SocialData {
  // Seed module cache from server-provided initial data (only once, before any fetch)
  if (initial && !cache) cache = { ...DEFAULT, ...initial }

  const [data, setData] = useState<SocialData>(cache ?? DEFAULT)

  useEffect(() => {
    if (!cache) fetchSocial().then(setData)

    function onUpdate() { fetchSocial().then(setData) }
    window.addEventListener("social-updated", onUpdate)
    return () => window.removeEventListener("social-updated", onUpdate)
  }, [])

  return data
}
