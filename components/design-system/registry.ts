import type { ComponentType } from "react"
import * as F from "./pages/foundations"
import * as S from "./pages/site-components"
import * as A from "./pages/admin-components"
import * as P from "./pages/patterns"

export interface DsPage {
  id: string
  label: string
  status?: "nuevo"
  /** Palabras extra para la búsqueda (sin acentos, en minúscula). */
  keywords?: string
  Component: ComponentType
}
interface Group { key: string; label: string; items: (DsPage & { search: string })[] }

const RAW: { key: string; label: string; items: DsPage[] }[] = [
  { key: "fund", label: "Fundamentos", items: [
    { id: "inicio", label: "Inicio", keywords: "overview principios introduccion", Component: F.PageInicio },
    { id: "color", label: "Color", keywords: "paleta contraste tokens dark modo oscuro", Component: F.PageColor },
    { id: "tipografia", label: "Tipografía", keywords: "fuente escala texto font", Component: F.PageTipografia },
    { id: "espaciado", label: "Espaciado y layout", keywords: "spacing grilla breakpoints responsive contenedor", Component: F.PageEspaciado },
    { id: "forma", label: "Forma y elevación", keywords: "radio sombra shadow radius", Component: F.PageForma },
    { id: "movimiento", label: "Movimiento", keywords: "animacion duracion easing motion", Component: F.PageMovimiento },
    { id: "iconografia", label: "Iconografía", keywords: "iconos svg", Component: F.PageIconografia },
    { id: "accesibilidad", label: "Accesibilidad", keywords: "a11y wcag teclado foco", Component: F.PageAccesibilidad },
  ] },
  { key: "site", label: "Componentes del sitio", items: [
    { id: "boton", label: "Botón", keywords: "button cta primario secundario", Component: S.PageBoton },
    { id: "tarjeta-proyecto", label: "Tarjeta de proyecto", keywords: "card proyecto bento", Component: S.PageTarjeta },
    { id: "formulario", label: "Formulario de contacto", keywords: "input campo form contacto", Component: S.PageFormulario },
    { id: "navegacion", label: "Navegación", keywords: "navbar menu bottom nav", Component: S.PageNavegacion },
    { id: "toggle-tema", label: "Selector de tema", keywords: "dark light modo oscuro toggle", Component: S.PageToggleTema },
    { id: "etiquetas", label: "Etiquetas e insignias", keywords: "tags badges chips pills filtros", Component: S.PageEtiquetas },
    { id: "cta-cierre", label: "CTA de cierre", status: "nuevo", keywords: "closing contacto email", Component: S.PageCtaCierre },
    { id: "contador", label: "Contador animado", status: "nuevo", keywords: "countup metrica numero", Component: S.PageContador },
    { id: "skeleton", label: "Esqueleto de carga", keywords: "loading skeleton carga", Component: S.PageSkeleton },
  ] },
  { key: "admin", label: "Componentes del admin", items: [
    { id: "campo", label: "Campo", status: "nuevo", keywords: "field input label error tag", Component: A.PageCampo },
    { id: "dropzone", label: "Dropzone", status: "nuevo", keywords: "upload imagen subir archivo", Component: A.PageDropzone },
    { id: "confirmacion", label: "Confirmación", status: "nuevo", keywords: "dialog eliminar borrar modal", Component: A.PageConfirmacion },
    { id: "panel-lateral", label: "Panel lateral", status: "nuevo", keywords: "sheet drawer editar", Component: A.PagePanelLateral },
    { id: "lista", label: "Lista y estado", status: "nuevo", keywords: "list item badge vacio empty", Component: A.PageLista },
    { id: "barra-cambios", label: "Cambios sin guardar", status: "nuevo", keywords: "unsaved dirty guardar", Component: A.PageBarraCambios },
    { id: "toast", label: "Toast", keywords: "notificacion mensaje alerta", Component: A.PageToast },
    { id: "nav-panel", label: "Navegación del panel", status: "nuevo", keywords: "sidebar tabs admin", Component: A.PageNavPanel },
  ] },
  { key: "pat", label: "Patrones", items: [
    { id: "hero", label: "Hero", keywords: "portada inicio terreno 3d", Component: P.PageHero },
    { id: "galeria", label: "Galería de proyectos", keywords: "bento grid proyectos", Component: P.PageGaleria },
    { id: "detalle", label: "Detalle de proyecto", keywords: "caso de estudio", Component: P.PageDetalle },
    { id: "blog", label: "Blog", keywords: "posts entradas", Component: P.PageBlog },
    { id: "panel-admin", label: "Panel de administración", keywords: "admin layout", Component: P.PageAdminLayout },
    { id: "micro", label: "Micro-interacciones", status: "nuevo", keywords: "hover press animacion", Component: P.PageMicro },
  ] },
  { key: "res", label: "Recursos", items: [
    { id: "changelog", label: "Changelog", keywords: "versiones historial", Component: P.PageChangelog },
  ] },
]

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")

export const GROUPS: Group[] = RAW.map((g) => ({
  ...g,
  items: g.items.map((p) => ({ ...p, search: norm(`${p.label} ${p.id} ${p.keywords ?? ""} ${g.label}`) })),
}))
export const PAGES = GROUPS.flatMap((g) => g.items)
export type PageId = string
export const findPage = (id: string) => PAGES.find((p) => p.id === id)
