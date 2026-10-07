"use client"

import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from "react"
import dynamic from "next/dynamic"
import { useTheme } from "@/lib/context/theme-context"
import { useLogo } from "@/lib/hooks/use-logo"
import { ThemeToggle } from "@/components/portfolio/app-navbar"
import { ExternalIcon } from "@/components/portfolio/icons"
import AdminToast, { type ToastType } from "./admin-toast"
import { DirtyProvider, useDirtyContext, useAnyDirty } from "./ui/dirty"
import { ConfirmDialog } from "./ui/confirm-dialog"

const ProjectsTab       = dynamic(() => import("./projects-tab"),  { ssr: false })
const HeroTab           = dynamic(() => import("./hero-tab"),      { ssr: false })
const AboutTab          = dynamic(() => import("./about-tab"),     { ssr: false })
const LogoTab           = dynamic(() => import("./logo-tab"),      { ssr: false })
const SocialTab         = dynamic(() => import("./social-tab"),    { ssr: false })
const BrandsTab         = dynamic(() => import("./brands-tab"),    { ssr: false })
const BlogTab           = dynamic(() => import("./blog-tab"),      { ssr: false })
const ProfileTab        = dynamic(() => import("./profile-tab"),   { ssr: false })
const DesignSystemSection = dynamic(
  () => import("@/components/portfolio/sections/design-system-section").then(m => ({ default: m.DesignSystemSection })),
  { ssr: false }
)

export type AdminTab = "hero" | "proyectos" | "blog" | "perfil" | "sobre" | "logo" | "marcas" | "footer" | "ds"
type ToastState = { id: number; title: string; msg?: string; type: ToastType } | null

// Navegación agrupada (DS v2.1.0, MA-7). Antes: 10 tabs planos en un orden
// que no seguía el sitio, "Footer" editaba también las redes y "CV" editaba
// datos que el sitio ya no usa (data/cv.json no se lee en ningún lado; el
// link al CV vive en Sobre mí). Los grupos siguen el modelo mental: qué
// contenido publico, quién soy, cómo se ve la marca.
const GROUPS: { label: string; items: { id: AdminTab; label: string }[] }[] = [
  { label: "Contenido", items: [
    { id: "hero", label: "Hero" },
    { id: "proyectos", label: "Proyectos" },
    { id: "blog", label: "Blog" },
  ] },
  { label: "Perfil", items: [
    { id: "perfil", label: "Perfil" },
    { id: "sobre", label: "Sobre mí" },
  ] },
  { label: "Marca", items: [
    { id: "logo", label: "Logo" },
    { id: "marcas", label: "Marcas" },
    { id: "footer", label: "Redes y footer" },
  ] },
  { label: "Sistema", items: [
    { id: "ds", label: "Zero design system" },
  ] },
]
const ALL = GROUPS.flatMap(g => g.items)
const LABEL = Object.fromEntries(ALL.map(i => [i.id, i.label])) as Record<AdminTab, string>
const isTab = (v: string | null): v is AdminTab => !!v && ALL.some(i => i.id === v)

interface Props {
  onLogout: () => void
  initialTab?: AdminTab
  /** Vista previa de desarrollo (/dev/ui): sin sesión, las escrituras responden 401. */
  preview?: boolean
}

export default function AdminDashboard(props: Props) {
  return (
    <DirtyProvider>
      <Dashboard {...props} />
    </DirtyProvider>
  )
}

function Dashboard({ onLogout, initialTab = "proyectos", preview = false }: Props) {
  const { isDark } = useTheme()
  const logo = useLogo()
  const dirtyCtx = useDirtyContext()
  const adminLogoUrl = isDark ? (logo.darkUrl || logo.lightUrl) : (logo.lightUrl || logo.darkUrl)

  // Deep link: /admin?tab=blog (antes recargar siempre volvía a Proyectos).
  // Se lee en el estado inicial, no en un effect: en StrictMode el effect que
  // escribe la URL corría antes de releerla y la pisaba con el tab por defecto.
  const [tab, setTab] = useState<AdminTab>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("tab")
      if (isTab(q)) return q
    }
    return initialTab
  })
  const [pending, setPending] = useState<AdminTab | null>(null)
  const [savingPending, setSavingPending] = useState(false)
  const [toast, setToast] = useState<ToastState>(null)
  const toastSeq = useRef(0)
  const tabRefs = useRef<Partial<Record<AdminTab, HTMLButtonElement | null>>>({})

  useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.set("tab", tab)
    window.history.replaceState(null, "", url)
  }, [tab])

  const showToast = useCallback((title: string, type: ToastType, msg?: string) => {
    toastSeq.current += 1
    setToast({ id: toastSeq.current, title, type, msg })
  }, [])

  // Cambiar de tab: si hay cambios sin guardar, preguntar (MA-2 / AM-3).
  function requestTab(next: AdminTab) {
    if (next === tab) return
    if (dirtyCtx?.isDirty()) { setPending(next); return }
    setTab(next)
  }

  async function saveAndGo() {
    if (!pending || !dirtyCtx) return
    setSavingPending(true)
    await dirtyCtx.saveAll()
    setSavingPending(false)
    // Solo se cambia si quedó guardado (falló la validación o la red → se queda).
    if (!dirtyCtx.isDirty()) { setTab(pending); setPending(null) }
    else setPending(null)
  }

  // Flechas ↑/↓ (y Inicio/Fin) entre tabs — patrón WAI-ARIA tablist vertical.
  function onTabKey(e: KeyboardEvent<HTMLButtonElement>, id: AdminTab) {
    const i = ALL.findIndex(x => x.id === id)
    let next: number | null = null
    if (e.key === "ArrowDown") next = (i + 1) % ALL.length
    if (e.key === "ArrowUp") next = (i - 1 + ALL.length) % ALL.length
    if (e.key === "Home") next = 0
    if (e.key === "End") next = ALL.length - 1
    if (next === null) return
    e.preventDefault()
    tabRefs.current[ALL[next].id]?.focus()
  }

  const dirtyNow = useAnyDirty()

  return (
    <div className={`admin-wrapper a-shell${tab === "ds" ? " a-shell--ds" : ""}`}>
      <header className="navbar a-topbar">
        <div className="nav-logo a-topbar-brand">
          {adminLogoUrl
            ? <img src={adminLogoUrl} alt={logo.fallbackText || "Project Zero"} className="nav-logo-img" />
            : <><span className="nav-logo-dot" aria-hidden="true" />{logo.fallbackText || "Project Zero"}</>}
          <span className="admin-nav-badge">{preview ? "Preview" : "Admin"}</span>
        </div>
        <div className="nav-right">
          <ThemeToggle />
          <a href="/" target="_blank" rel="noreferrer" className="a-btn a-btn--ghost a-btn--sm" aria-label="Ver portafolio (abre en otra pestaña)">
            <span className="admin-nav-portfolio-label">Ver portafolio</span>
            <ExternalIcon />
          </a>
          <button type="button" className="a-btn a-btn--ghost a-btn--sm" onClick={onLogout}>Salir</button>
        </div>
      </header>

      <nav className="a-sidenav" aria-label="Secciones del panel">
        {/* Mobile: selector nativo */}
        <label className="a-sidenav-select">
          <span className="sr-only">Sección</span>
          <select className="admin-input" value={tab} onChange={e => requestTab(e.target.value as AdminTab)}>
            {GROUPS.map(g => (
              <optgroup key={g.label} label={g.label}>
                {g.items.map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
              </optgroup>
            ))}
          </select>
        </label>

        {/* Desktop: lista agrupada con semántica de tabs */}
        <div role="tablist" aria-orientation="vertical" aria-label="Secciones del panel" className="a-sidenav-list">
          {GROUPS.map(g => (
            <div key={g.label} className="a-sidenav-group" role="presentation">
              <div className="a-sidenav-label" role="presentation">{g.label}</div>
              {g.items.map(i => {
                const active = tab === i.id
                return (
                  <button
                    key={i.id}
                    ref={el => { tabRefs.current[i.id] = el }}
                    type="button"
                    role="tab"
                    id={`tab-${i.id}`}
                    aria-selected={active}
                    aria-controls="admin-panel"
                    tabIndex={active ? 0 : -1}
                    className={`a-sidenav-item${active ? " is-active" : ""}`}
                    onClick={() => requestTab(i.id)}
                    onKeyDown={e => onTabKey(e, i.id)}
                  >
                    {i.label}
                    {active && dirtyNow && <span className="a-dirty-dot" aria-label="Cambios sin guardar" />}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </nav>

      {/* role="tabpanel" no está permitido en <main>: va en un div interno. */}
      <main className={tab === "ds" ? "a-main a-main--ds" : "a-main"}>
        <div id="admin-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {tab === "ds" ? <DesignSystemSection adminMode /> : (
          <div className="admin-container">
            {tab === "proyectos" && <ProjectsTab onToast={showToast} />}
            {tab === "hero"      && <HeroTab     onToast={showToast} />}
            {tab === "perfil"    && <ProfileTab  onToast={showToast} />}
            {tab === "sobre"     && <AboutTab    onToast={showToast} />}
            {tab === "logo"      && <LogoTab     onToast={showToast} />}
            {tab === "footer"    && <SocialTab   onToast={showToast} />}
            {tab === "marcas"    && <BrandsTab   onToast={showToast} />}
            {tab === "blog"      && <BlogTab     onToast={showToast} />}
          </div>
        )}
        </div>
      </main>

      <ConfirmDialog
        open={pending !== null}
        onCancel={() => setPending(null)}
        title="Tienes cambios sin guardar"
        description={<>Si vas a <strong>{pending ? LABEL[pending] : ""}</strong> sin guardar, se pierden los cambios de <strong>{LABEL[tab]}</strong>.</>}
        actions={<>
          <button type="button" className="a-btn a-btn--ghost" autoFocus onClick={() => setPending(null)}>Seguir editando</button>
          <button type="button" className="a-btn a-btn--danger-ghost" onClick={() => { if (pending) setTab(pending); setPending(null) }}>Descartar</button>
          <button type="button" className="a-btn a-btn--primary" onClick={saveAndGo} disabled={savingPending} aria-busy={savingPending || undefined}>
            {savingPending ? "Guardando…" : "Guardar y continuar"}
          </button>
        </>}
      />

      {toast && (
        <AdminToast
          key={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.msg}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
