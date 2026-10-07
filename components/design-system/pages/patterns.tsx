"use client"

import { useState, type ReactNode } from "react"
import projectsJson from "@/data/projects.json"
import type { Project } from "@/lib/data/projects"
import { ProjectCard } from "@/components/portfolio/project-card"
import { ArrowRightIcon } from "@/components/portfolio/icons"
import { CountUp as CountUpLazy } from "@/components/portfolio/count-up"
import { Capture, DocPage, Prose, Rules, Section, UsageRule } from "../ui/doc"
import { Live } from "../ui/live"
import { PageLink } from "../ui/nav"
import { changelogEntries, DS_VERSION } from "../lib/tokens"

const PROJECTS = projectsJson as unknown as Project[]
const noop = () => {}

function Structure({ items }: { items: { name: string; desc: ReactNode }[] }) {
  return (
    <ol className="doc-legend doc-structure">
      {items.map((it, i) => <li key={it.name}><span className="doc-legend-n" aria-hidden="true">{i + 1}</span><span><strong>{it.name}</strong> — {it.desc}</span></li>)}
    </ol>
  )
}

/** Las capturas de un patrón en los anchos de diseño. */
function Breakpoints({ id, alt, mobile = true, tablet = false }: { id: string; alt: string; mobile?: boolean; tablet?: boolean }) {
  return (
    <div className="doc-captures">
      <Capture id={`${id}-desktop`} alt={`${alt} en escritorio (1440px)`} caption="Escritorio · 1440px" />
      <div className="doc-capture-col">
        {mobile && <Capture id={`${id}-mobile`} alt={`${alt} en móvil (390px)`} caption="Móvil · 390px" ratio="390 / 844" />}
        {tablet && <Capture id={`${id}-tablet`} alt={`${alt} en tablet (768px)`} caption="Tablet · 768px" ratio="768 / 1024" />}
      </div>
    </div>
  )
}

function MiniBento({ variants }: { variants: ("featured" | "compact")[] }) {
  return (
    <Live className="doc-w-full">
      <div className="projects-bento doc-x-bento">
        {variants.map((v, i) => <ProjectCard key={i} project={PROJECTS[i % PROJECTS.length]} variant={v} index={i} onClick={noop} />)}
      </div>
    </Live>
  )
}

/* ═══════════════════════════════ Hero ═══════════════════════════════ */

export function PageHero() {
  return (
    <DocPage
      eyebrow="Patrones"
      title="Hero"
      status="estable"
      summary={<p>La primera pantalla: quién es Carlos y qué hace, en tres líneas, sobre el terreno 3D. Una sola acción. El terreno es ambiente — no lleva información y se difumina al hacer scroll.</p>}
    >
      <Section title="Capturas"><Breakpoints id="hero" alt="Hero del portafolio con titular en tres líneas y terreno 3D de fondo" /></Section>
      <Section title="Estructura">
        <Structure items={[
          { name: "Etiqueta de disponibilidad", desc: "estado actual, con punto animado" },
          { name: "Titular en tres líneas", desc: "la segunda en el acento; entra palabra por palabra" },
          { name: "Bajada", desc: "una o dos frases con la especialidad" },
          { name: "Acciones", desc: <>una primaria; ver <PageLink to="boton">Botón</PageLink></> },
          { name: "Terreno 3D", desc: "WebGL, decorativo; se difumina y se desvanece con el scroll" },
        ]} />
      </Section>
      <Section title="Reglas">
        <Rules>
          <UsageRule
            title="El titular se lee en un vistazo"
            doText="Tres líneas cortas; el acento marca la idea central."
            doDemo={<p className="doc-type--display doc-x-display-sm">Diseño<br /><span className="doc-x-accent">productos</span><br />que se usan</p>}
            dontText="Un titular de dos frases empuja la acción fuera de la primera pantalla."
            dontDemo={<p className="doc-type--display doc-x-display-sm doc-x-display-long">Diseño productos digitales centrados en las personas, con foco en sistemas, IA y conversión</p>}
          />
        </Rules>
      </Section>
    </DocPage>
  )
}

/* ═══════════════════════════════ Galería ═══════════════════════════════ */

export function PageGaleria() {
  return (
    <DocPage
      eyebrow="Patrones"
      title="Galería de proyectos"
      status="estable"
      summary={<p>Grilla bento de tres columnas: las tarjetas destacadas ocupan dos y las compactas una, alternadas en Z. En tablet pasa a dos columnas y en móvil a una. Ancho: <code>min(990px, 90%)</code>.</p>}
    >
      <Section title="Capturas"><Breakpoints id="galeria" alt="Galería bento de proyectos" tablet /></Section>
      <Section title="Reglas">
        <Rules>
          <UsageRule
            title="Alterna destacada y compacta en Z"
            doText="Destacada–compacta, compacta–destacada: ritmo y jerarquía."
            doDemo={<MiniBento variants={["featured", "compact", "compact", "featured"]} />}
            dontText="Todas destacadas: sin ritmo, ningún proyecto se diferencia."
            dontDemo={<MiniBento variants={["featured", "featured"]} />}
          />
        </Rules>
      </Section>
      <Section title="Comportamiento">
        <Prose><ul>
          <li>Las tarjetas entran con una inclinación hacia adelante que se corrige al aparecer.</li>
          <li>Al abrir un proyecto, la imagen de la tarjeta crece hasta la del detalle (morph) — sin morph con movimiento reducido.</li>
          <li>La métrica de cada tarjeta cuenta al entrar (<PageLink to="contador">Contador</PageLink>).</li>
        </ul></Prose>
      </Section>
    </DocPage>
  )
}

/* ═══════════════════════════════ Detalle ═══════════════════════════════ */

export function PageDetalle() {
  return (
    <DocPage
      eyebrow="Patrones"
      title="Detalle de proyecto"
      status="estable"
      summary={<p>El caso de estudio: desafío, proceso y resultado, con una barra lateral de datos (rol, año, métricas, habilidades) que en móvil pasa debajo del contenido.</p>}
    >
      <Section title="Capturas"><Breakpoints id="detalle" alt="Página de detalle de un proyecto" /></Section>
      <Section title="Estructura">
        <Structure items={[
          { name: "Migas de pan", desc: "Inicio / Trabajos / proyecto" },
          { name: "Categoría, año y título", desc: "el título en H1" },
          { name: "Imagen principal", desc: "16:10, recibe el morph desde la tarjeta" },
          { name: "El desafío · El proceso · El resultado", desc: "texto enriquecido editable en el admin" },
          { name: "Barra lateral", desc: "rol, métricas de impacto, habilidades, «Ver proyecto live» si hay URL" },
          { name: "Galería", desc: "imágenes adicionales con visor" },
        ]} />
      </Section>
    </DocPage>
  )
}

/* ═══════════════════════════════ Blog ═══════════════════════════════ */

export function PageBlog() {
  return (
    <DocPage
      eyebrow="Patrones"
      title="Blog"
      status="estable"
      summary={<p>Listado con búsqueda, filtros por categoría y etiqueta, y paginación. La entrada usa un ancho de lectura de 62 caracteres y una barra lateral con etiquetas y relacionados.</p>}
    >
      <Section title="Listado"><Breakpoints id="blog" alt="Listado del blog con filtros" /></Section>
      <Section title="Entrada"><Capture id="blog-post-desktop" alt="Entrada del blog con barra lateral" caption="Escritorio · 1440px" /></Section>
    </DocPage>
  )
}

/* ═══════════════════════════════ Panel admin ═══════════════════════════════ */

export function PageAdminLayout() {
  return (
    <DocPage
      eyebrow="Patrones"
      title="Panel de administración"
      status="nuevo"
      summary={<p>Barra superior con tema y salida, navegación lateral agrupada y el contenido de la sección. Las listas editan en <PageLink to="panel-lateral">panel lateral</PageLink>; las secciones únicas, en la página con <PageLink to="barra-cambios">barra de cambios</PageLink>.</p>}
    >
      <Section title="Capturas"><Breakpoints id="admin" alt="Panel de administración" /></Section>
      <Section title="Flujo de edición">
        <Structure items={[
          { name: "Editar", desc: "la barra de cambios aparece con el primer cambio" },
          { name: "Validar al guardar", desc: "errores en cada campo, foco al primero" },
          { name: "Guardar", desc: "el toast de éxito solo con respuesta correcta" },
          { name: "Salir con cambios", desc: "diálogo: seguir editando, descartar o guardar y continuar" },
        ]} />
      </Section>
    </DocPage>
  )
}

/* ═══════════════════════════════ Micro-interacciones ═══════════════════════════════ */

function Replay({ children }: { children: (k: number) => ReactNode }) {
  const [k, setK] = useState(0)
  return <div className="doc-demo-col doc-x-center">{children(k)}<button type="button" className="doc-btn" onClick={() => setK((x) => x + 1)}>Repetir</button></div>
}

const MICRO: { name: string; where: string; what: string; demo: ReactNode }[] = [
  { name: "Press", where: "Botones, tarjetas", what: "Escala a 0.97 en 100ms: confirma el toque.", demo: <button type="button" className="btn-p" data-pseudo="active">Presionado</button> },
  { name: "Flecha que avanza", where: "Botones con flecha", what: "La flecha se desplaza 3px en hover: anticipa el avance.", demo: <button type="button" className="btn-g" data-pseudo="hover">Ver todas <ArrowRightIcon className="btn-arrow" /></button> },
  { name: "Brillo", where: "Botón primario del hero y del cierre", what: "Un reflejo cruza el botón en hover.", demo: <button type="button" className="btn-p btn-shine" data-pseudo="hover">Trabajemos juntos</button> },
  { name: "Contador", where: "Métricas", what: "El número cuenta una vez al aparecer.", demo: <Replay>{(k) => <span key={k} className="p-stat doc-x-stat"><CountUpLazy text="20 mil usuarios únicos" /></span>}</Replay> },
  { name: "Revelado circular", where: "Cambio de tema", what: "El nuevo tema se expande desde el botón presionado.", demo: <p className="doc-demo-text">Prueba el selector de tema de la barra superior.</p> },
  { name: "Píldora de navegación", where: "Barra superior", what: "El indicador se desliza a la sección activa.", demo: <div className="doc-demo-row"><button type="button" className="nav-item">Home</button><button type="button" className="nav-item active">Trabajos</button></div> },
]


export function PageMicro() {
  return (
    <DocPage
      eyebrow="Patrones"
      title="Micro-interacciones"
      status="nuevo"
      summary={<p>Catálogo de las respuestas pequeñas del sitio. Todas usan los tokens de <PageLink to="movimiento">movimiento</PageLink> y se apagan con movimiento reducido.</p>}
    >
      <Section title="Catálogo">
        <div className="doc-variants">
          {MICRO.map((m) => (
            <div key={m.name} className="doc-variant">
              <div className="doc-stage doc-stage--md doc-stage--center doc-stage--page">{m.demo}</div>
              <div className="doc-variant-body">
                <div className="doc-variant-name">{m.name}</div>
                <div className="doc-variant-desc">{m.what}</div>
                <div className="doc-variant-desc"><strong>Dónde:</strong> {m.where}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </DocPage>
  )
}

/* ═══════════════════════════════ Changelog ═══════════════════════════════ */

export function PageChangelog() {
  const entries = changelogEntries()
  return (
    <DocPage
      eyebrow="Recursos"
      title="Changelog"
      summary={<p>Historial de versiones de los tokens, leído de <code>assets/design-tokens.json</code>. Versión actual: <strong>v{DS_VERSION}</strong>.</p>}
    >
      <ol className="doc-changelog">
        {entries.map((e) => (
          <li key={e.version}><span className="doc-changelog-v">v{e.version}</span><p>{e.text}</p></li>
        ))}
      </ol>
    </DocPage>
  )
}
