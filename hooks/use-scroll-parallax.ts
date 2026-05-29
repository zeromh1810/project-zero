"use client"

import { useEffect, type RefObject } from "react"

export function useScrollParallax(
  ref: RefObject<HTMLElement | null>,
  factor = 0.35
) {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onScroll = () => {
      el.style.transform = `translateY(${window.scrollY * factor}px)`
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [ref, factor])
}
