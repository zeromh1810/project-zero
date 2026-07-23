"use client"

import { useState, useEffect, useRef } from "react"
import { useTheme } from "@/lib/context/theme-context"

interface Brand {
  id: string
  lightLogo: string
  darkLogo: string
}

export function BrandsSection() {
  const { isDark } = useTheme()
  const [brands, setBrands] = useState<Brand[]>([])
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    let ignore = false
    fetch("/api/admin/brands", { cache: "no-store" })
      .then(r => r.json())
      .then(d => { if (!ignore && Array.isArray(d.brands) && d.brands.length) setBrands(d.brands) })
      .catch(() => {})
    return () => { ignore = true }
  }, [])

  useEffect(() => {
    const el = sectionRef.current
    if (!el || !brands.length) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("brands-section--visible")
          observer.disconnect()
        }
      },
      { threshold: 0.12 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [brands])

  if (!brands.length) return null

  return (
    <section ref={sectionRef} className="brands-section">
      <div className="brands-label-wrap">
        <div className="brands-label-line" />
        <p className="brands-label">Han confiado en mí</p>
        <div className="brands-label-line" />
      </div>
      <div className="brands-gallery">
        {brands.map((brand, idx) => {
          const logo = isDark
            ? (brand.darkLogo  || brand.lightLogo)
            : (brand.lightLogo || brand.darkLogo)
          return (
            <div
              key={brand.id}
              className="brand-item"
              style={{ transitionDelay: `${idx * 60}ms` }}
            >
              <img src={logo} alt="" draggable={false} loading="lazy" />
            </div>
          )
        })}
      </div>
    </section>
  )
}
