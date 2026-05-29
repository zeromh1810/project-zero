"use client"

import { useEffect, useRef, type RefObject } from "react"

export function useIntersection(
  containerRef: RefObject<HTMLElement | null>,
  callback: (el: Element) => void,
  deps: unknown[] = [],
  threshold: number = 0.15
) {
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Cleanup previous observer if exists
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }

    // Small delay to ensure DOM is fully updated after section change
    const timeoutId = setTimeout(() => {
      if (!containerRef.current) return

      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              callback(entry.target)
              // Unobserve after animation triggers to avoid re-triggering
              observerRef.current?.unobserve(entry.target)
            }
          })
        },
        { threshold, rootMargin: "50px" }
      )

      const nodes = containerRef.current.querySelectorAll(".anim-up, .p-card, .p-stat--animated")
      nodes.forEach((node, index) => {
        node.classList.remove("visible", "in")
        // Non-linear stagger: early items group tighter, later items spread more
        const delay = index * 0.075 + index * index * 0.012
        ;(node as HTMLElement).style.transitionDelay = `${delay}s`
        observerRef.current?.observe(node)
      })
    }, 50)

    return () => {
      clearTimeout(timeoutId)
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, callback, threshold, ...deps])
}
