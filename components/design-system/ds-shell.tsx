"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import "@/styles/ds-docs.css"
import { SearchIcon } from "@/components/portfolio/icons"
import { DS_VERSION } from "./lib/tokens"
import { installPseudoStates } from "./lib/pseudo-states"
import { GROUPS, PAGES, findPage, type PageId } from "./registry"
import { NavContext } from "./ui/nav"

// Viewer del Design System v2.1.0 (reemplaza a design-system-section.tsx,
// 4.4k líneas y 18 páginas con valores escritos a mano). Estructura de
// documentación para diseñadores (Material / Carbon): Fundamentos ·
// Componentes del sitio · Componentes del admin · Patrones, con búsqueda
// (Ctrl/⌘+K) y deep link ?page= para compartir una página concreta.

function initialPage(): PageId {
  if (typeof window !== "undefined") {
    const q = new URLSearchParams(window.location.search).get("page")
    const p = q ? findPage(q) : undefined
    if (p) return p.id
  }
  return "inicio"
}

export function DsShell({ adminMode = false }: { adminMode?: boolean }) {
  const [page, setPage] = useState<PageId>(initialPage)
  const [query, setQuery] = useState("")
  const searchRef = useRef<HTMLInputElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)
  const first = useRef(true)

  useEffect(() => { installPseudoStates() }, [])

  // Deep link + volver arriba al cambiar de página (no en la carga inicial).
  useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.set("page", page)
    window.history.replaceState(null, "", url)
    if (first.current) { first.current = false; return }
    const scroller = mainRef.current?.closest(".a-main") ?? document.scrollingElement
    scroller?.scrollTo({ top: 0 })
    mainRef.current?.querySelector<HTMLElement>(".doc-title")?.focus({ preventScroll: true })
  }, [page])

  // Ctrl/⌘ + K enfoca la búsqueda.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        searchRef.current?.focus()
        searchRef.current?.select()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")
    if (!q) return GROUPS
    return GROUPS
      .map((g) => ({ ...g, items: g.items.filter((p) => p.search.includes(q)) }))
      .filter((g) => g.items.length)
  }, [query])

  const current = findPage(page) ?? PAGES[0]
  const Page = current.Component
  const total = groups.reduce((n, g) => n + g.items.length, 0)

  const go = (id: PageId) => { setPage(id); setQuery("") }

  return (
    <NavContext.Provider value={go}>
      <div className={`doc-shell${adminMode ? " doc-shell--admin" : ""}`}>
        <aside className="doc-side" aria-label="Zero design system">
          <div className="doc-brand">
            <span className="doc-brand-name">Zero design system</span>
            <span className="doc-version">v{DS_VERSION}</span>
          </div>

          <div className="doc-search" role="search">
            <span className="doc-search-icon" aria-hidden="true"><SearchIcon size={16} /></span>
            <label htmlFor="doc-search" className="sr-only">Buscar en el Zero design system</label>
            <input
              ref={searchRef}
              id="doc-search"
              type="search"
              className="doc-search-input"
              placeholder="Buscar"
              autoComplete="off"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && groups[0]?.items[0]) go(groups[0].items[0].id)
                if (e.key === "Escape") setQuery("")
              }}
              aria-describedby="doc-search-count"
            />
            <kbd className="doc-kbd" aria-hidden="true">Ctrl K</kbd>
            <span id="doc-search-count" className="sr-only" aria-live="polite">
              {query ? `${total} resultado${total === 1 ? "" : "s"}` : ""}
            </span>
          </div>

          <nav aria-label="Páginas del Zero design system">
            {groups.map((g) => (
              <div key={g.label} className="doc-nav-group">
                <div className="doc-nav-label" id={`doc-g-${g.key}`}>{g.label}</div>
                <ul className="doc-nav-list" aria-labelledby={`doc-g-${g.key}`}>
                  {g.items.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        className="doc-nav-item"
                        aria-current={p.id === page ? "page" : undefined}
                        onClick={() => go(p.id)}
                      >
                        {p.label}
                        {p.status === "nuevo" && <span className="doc-nav-badge">Nuevo</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {!total && <p className="doc-nav-empty">Sin resultados para «{query}».</p>}
          </nav>
        </aside>

        <div className="doc-main" ref={mainRef}>
          <div className="doc-mobile-nav">
            <label>
              <span className="sr-only">Página del Zero design system</span>
              <select value={page} onChange={(e) => go(e.target.value as PageId)}>
                {GROUPS.map((g) => (
                  <optgroup key={g.label} label={g.label}>
                    {g.items.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </optgroup>
                ))}
              </select>
            </label>
          </div>
          <Page key={current.id} />
        </div>
      </div>
    </NavContext.Provider>
  )
}
