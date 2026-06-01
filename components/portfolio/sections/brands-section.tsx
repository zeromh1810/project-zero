"use client"

import { useState, useEffect } from "react"
import { useTheme } from "@/lib/context/theme-context"

interface Brand {
  id: string
  lightLogo: string
  darkLogo: string
}

export function BrandsSection() {
  const { isDark } = useTheme()
  const [brands, setBrands] = useState<Brand[]>([])

  useEffect(() => {
    fetch("/api/admin/brands", { cache: "no-store" })
      .then(r => r.json())
      .then(d => { if (Array.isArray(d.brands) && d.brands.length) setBrands(d.brands) })
      .catch(() => {})
  }, [])

  if (!brands.length) return null

  return (
    <section className="brands-section">
      <p className="brands-label">He trabajado con</p>
      <div className="brands-gallery">
        {brands.map(brand => {
          const logo = isDark
            ? (brand.darkLogo  || brand.lightLogo)
            : (brand.lightLogo || brand.darkLogo)
          return (
            <div key={brand.id} className="brand-item">
              <img src={logo} alt="" draggable={false} />
            </div>
          )
        })}
      </div>
    </section>
  )
}
