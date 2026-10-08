"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import "@/styles/ds-docs.css"
import { SearchIcon } from "@/components/portfolio/icons"
import { DS_VERSION } from "./lib/tokens"
import { installPseudoStates } from "./lib/pseudo-states"
import { GROUPS, PAGES, findPage, type PageId } from "./registry"
import { NavContext } from "./ui/nav"
import { Crossfade, useReveal, type MotionDir } from "@/lib/motion"

// Viewer del Zero design system v2.1.0. Documentación para diseñadores
// (Material / Carbon): Fundamentos · Componentes del sitio · Componentes del
// admin · Patrones, con búsqueda (Ctrl/⌘+K) y deep link ?page=.
//
// Motion y navegación — cada decisión sale de ui-ux-pro-max (trazabilidad en
// docs/motion-ds-ui-ux-pro-max.md):
// - Cambio de página: crossfade direccional que no bloquea (fade-crossfade,
//   no-blocking-animation, navigation-direction: adelante entra desde abajo,
//   atrás desde arriba), 480ms de entrada / 320ms de salida (preset Page
//   Transition 400–600ms + exit-faster-than-enter).
// - Historial real: cada página es una entrada; Atrás vuelve a la anterior y
//   restaura su scroll (back-behavior, state-preservation).
// - Indicador de la página activa que se desliza (continuity, nav-state-active).
// - Foco al título de la página nueva (focus-on-route-change).
// - Secciones que se revelan al entrar en pantalla (preset Scroll Reveal).

const ORDER = PAGES.map((p) => p.id)
const REVEAL = [
  ".doc-section > :not(.doc-rules)",
  ".doc-rules > .doc-rule",
  ".doc-changelog > li",
].join(", ")

function pageFromUrl(): PageId {
  if (typeof window !== "undefined") {
    const q = new URLSearchParams(window.location.search).get("page")
    const p = q ? findPage(q) : undefined
    if (p) return p.id
  }
  return "inicio"
}

const SUGGESTIONS: { id: PageId; label: string }[] = [
  { id: "boton", label: "Botón" },
  { id: "color", label: "Color" },
  { id: "campo", label: "Campo" },
  { id: "movimiento", label: "Movimiento" },
]

export function DsShell({ adminMode = false }: { adminMode?: boolean }) {
  const [nav, setNav] = useState<{ page: PageId; dir: MotionDir; scroll: number | null }>(() => ({ page: pageFromUrl(), dir: "up", scroll: null }))
  const page = nav.page
  const [query, setQuery] = useState("")
  const searchRef = useRef<HTMLInputElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const inkRef = useRef<HTMLSpanElement>(null)
  const firstRef = useRef(true)

  useEffect(() => { installPseudoStates() }, [])
  useReveal(mainRef, REVEAL)

  const scroller = () => (mainRef.current?.closest(".a-main") as HTMLElement | null) ?? document.scrollingElement

  // URL inicial y Atrás/Adelante del navegador.
  useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.set("page", page)
    window.history.replaceState({ ...(window.history.state ?? {}), dsPage: page }, "", url)
    const onPop = (e: PopStateEvent) => {
      const p = pageFromUrl()
      setNav({ page: p, dir: "down", scroll: typeof e.state?.dsScroll === "number" ? e.state.dsScroll : 0 })
    }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al montar
  }, [])

  // Navegación interna: guarda el scroll de la página actual en su entrada
  // del historial y crea una nueva para la siguiente.
  const go = (id: PageId) => {
    setQuery("")
    if (id === page) return
    const y = scroller()?.scrollTop ?? 0
    window.history.replaceState({ ...(window.history.state ?? {}), dsScroll: y }, "")
    const url = new URL(window.location.href)
    url.searchParams.set("page", id)
    window.history.pushState({ dsPage: id }, "", url)
    setNav({ page: id, dir: ORDER.indexOf(id) >= ORDER.indexOf(page) ? "up" : "down", scroll: 0 })
  }

  // Después del commit de la página nueva: scroll (arriba o el restaurado) y
  // foco a su título. La nueva ya está montada: el crossfade no la retrasa.
  useEffect(() => {
    if (firstRef.current) { firstRef.current = false; return }
    scroller()?.scrollTo({ top: nav.scroll ?? 0, behavior: "instant" as ScrollBehavior })
    mainRef.current?.querySelector<HTMLElement>(".m-xfade-in .doc-title")?.focus({ preventScroll: true })
  }, [nav])

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
  const resultKey = query ? groups.flatMap((g) => g.items.map((p) => p.id)).join() : "all"
  const total = groups.reduce((n, g) => n + g.items.length, 0)

  // Indicador de la página activa: un solo elemento que se desliza entre
  // ítems (solo transform: translateY + scaleY, transform-performance).
  useLayoutEffect(() => {
    const ink = inkRef.current, navEl = navRef.current
    if (!ink || !navEl) return
    const btn = navEl.querySelector<HTMLElement>('.doc-nav-item[aria-current="page"]')
    if (!btn) { ink.style.opacity = "0"; return }
    const top = btn.getBoundingClientRect().top - navEl.getBoundingClientRect().top + 8
    ink.style.setProperty("--ink-y", `${top}px`)
    ink.style.setProperty("--ink-h", `${btn.offsetHeight - 16}`)
    ink.style.opacity = "1"
  }, [page, resultKey])

  const renderPage = (id: string) => {
    const P = (findPage(id) ?? PAGES[0]).Component
    return <P />
  }

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

          {/* La clave cambia con el conjunto de resultados: al filtrar, los
              resultados entran en cascada (stagger-sequence), no en cada tecla. */}
          <nav ref={navRef} aria-label="Páginas del Zero design system" key={resultKey} className={`doc-nav${query ? " is-filtered" : ""}`}>
            <span ref={inkRef} className="doc-nav-ink" aria-hidden="true" />
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
            {/* Sin resultados: decirlo y sugerir (ui-ux-pro-max: No Results). */}
            {!total && (
              <div className="doc-nav-empty">
                <p>Sin resultados para «{query}».</p>
                <p className="doc-nav-empty-hint">Prueba con:</p>
                <ul className="doc-nav-suggest">
                  {SUGGESTIONS.map((s) => <li key={s.id}><button type="button" className="doc-link" onClick={() => go(s.id)}>{s.label}</button></li>)}
                </ul>
              </div>
            )}
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
          <Crossfade k={page} dir={nav.dir} size="lg" render={renderPage} />
        </div>
      </div>
    </NavContext.Provider>
  )
}
