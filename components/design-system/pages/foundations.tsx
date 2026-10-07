"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import tokensJson from "@/assets/design-tokens.json"
import { useTheme } from "@/lib/context/theme-context"
import * as Icons from "@/components/portfolio/icons"
import { AlertIcon, ArrowRightIcon, TrashIcon } from "@/components/portfolio/icons"
import {
  A11yChecklist, ContrastTable, DocPage, Example, Prose, Rules, Section, TokenTable, UsageRule, WhenToUse,
} from "../ui/doc"
import { PageCard, PageLink } from "../ui/nav"
import { DS_VERSION } from "../lib/tokens"
import { useLiveTokens } from "../lib/use-live-tokens"

/* ═══════════════════════════════ Inicio ═══════════════════════════════ */

function countTokens(node: unknown): number {
  if (!node || typeof node !== "object") return 0
  const o = node as Record<string, unknown>
  if ("$value" in o || "value" in o) return 1
  return Object.entries(o).reduce((n, [k, v]) => (k.startsWith("$") ? n : n + countTokens(v)), 0)
}

export function PageInicio() {
  const tokens = countTokens(tokensJson)
  return (
    <DocPage
      eyebrow="Zero design system"
      title="El sistema detrás de este portafolio"
      summary={<p>Fundamentos, componentes y patrones con los que está construido el sitio de Carlos Felipe Rojas Hickmann y su panel de administración. Cada componente se documenta como en Material o Carbon: cuándo usarlo, cómo se ve, cómo se escribe, cómo se usa con teclado y lector de pantalla, y cómo se construye.</p>}
    >
      <Section title="Principios">
        <div className="doc-principles">
          <div className="doc-principle"><h3>El trabajo primero</h3><p>La interfaz enmarca los proyectos, no compite con ellos. Superficies neutras, un solo acento y tipografía con jerarquía clara.</p></div>
          <div className="doc-principle"><h3>Movimiento con intención</h3><p>Cada animación explica algo: de dónde viene un panel, qué cambió, qué se puede tocar. Si no explica nada, no se anima.</p></div>
          <div className="doc-principle"><h3>Accesible por defecto</h3><p>Contraste AA en ambos temas, foco visible, objetivos de 44px y texto de 12px como mínimo. No es una revisión al final: está en los tokens.</p></div>
          <div className="doc-principle"><h3>Un sistema, dos temas</h3><p>Claro y oscuro salen de los mismos tokens semánticos. Diseña con roles (<code>--color-txt2</code>), nunca con valores sueltos.</p></div>
        </div>
      </Section>

      <Section title="Cómo leer esta documentación" intro={<p>Las páginas de componentes tienen cinco pestañas. Si diseñas, empieza por <strong>Uso</strong> y <strong>Contenido</strong>; si construyes, por <strong>Código</strong>.</p>}>
        <div className="doc-table-wrap">
          <table className="doc-table">
            <thead><tr><th scope="col">Pestaña</th><th scope="col">Qué encuentras</th></tr></thead>
            <tbody>
              <tr><td>Uso</td><td>Cuándo usarlo y cuándo no, variantes y reglas con ejemplo correcto ✓ e incorrecto ✗.</td></tr>
              <tr><td>Estilo</td><td>Anatomía numerada, medidas leídas del componente real, matriz de estados y tokens con su valor en el tema activo.</td></tr>
              <tr><td>Contenido</td><td>Cómo escribir etiquetas, mensajes y titulares — con ejemplos.</td></tr>
              <tr><td>Accesibilidad</td><td>Qué resuelve el componente y qué te toca a ti en el diseño; teclado y lector de pantalla.</td></tr>
              <tr><td>Código</td><td>El marcado o el componente React, listo para copiar.</td></tr>
            </tbody>
          </table>
        </div>
        <Prose><p>Los ejemplos <strong>no son imágenes estáticas</strong>: son los componentes del sitio renderizados en vivo, con el CSS de producción. Si un estilo cambia, la documentación cambia sola. Cambia de tema con el selector de la barra superior para ver cada ejemplo en claro y oscuro.</p></Prose>
      </Section>

      <Section title="En números">
        <div className="doc-stats">
          <div className="doc-stat"><div className="doc-stat-v">v{DS_VERSION}</div><div className="doc-stat-l">Versión de los tokens</div></div>
          <div className="doc-stat"><div className="doc-stat-v">{tokens}</div><div className="doc-stat-l">Tokens en design-tokens.json</div></div>
          <div className="doc-stat"><div className="doc-stat-v">AA</div><div className="doc-stat-l">Contraste mínimo, ambos temas</div></div>
          <div className="doc-stat"><div className="doc-stat-v">2</div><div className="doc-stat-l">Temas desde los mismos roles</div></div>
        </div>
      </Section>

      <Section title="Explorar">
        <div className="doc-cards">
          <PageCard to="color" title="Color" desc="Roles semánticos, paleta base y contraste medido en vivo." />
          <PageCard to="tipografia" title="Tipografía" desc="Dos familias, escala fluida y reglas de jerarquía." />
          <PageCard to="boton" title="Botón" desc="La acción principal y la secundaria, con sus estados." />
          <PageCard to="tarjeta-proyecto" title="Tarjeta de proyecto" desc="La pieza central del portafolio." />
          <PageCard to="campo" title="Campo del admin" desc="Etiqueta, ayuda y error conectados." />
          <PageCard to="galeria" title="Galería de proyectos" desc="Patrón bento y su comportamiento por breakpoint." />
        </div>
      </Section>
    </DocPage>
  )
}

/* ═══════════════════════════════ Color ═══════════════════════════════ */

const ROLES: { token: string; name: string; role: string }[] = [
  { token: "--color-bg", name: "Fondo", role: "Fondo de página" },
  { token: "--color-bg2", name: "Superficie", role: "Tarjetas, paneles, barra lateral" },
  { token: "--color-bg3", name: "Superficie elevada", role: "Hojas de contenido, selección" },
  { token: "--color-txt", name: "Texto", role: "Titulares y texto principal" },
  { token: "--color-txt2", name: "Texto secundario", role: "Descripciones, metadatos" },
  { token: "--color-border", name: "Borde", role: "Divisores y contornos" },
  { token: "--color-accent", name: "Acento", role: "Enlaces, indicadores, foco" },
  { token: "--color-btn-primary-bg", name: "Acción primaria", role: "Fondo del botón principal" },
  { token: "--color-success-text", name: "Éxito", role: "Texto de confirmación" },
  { token: "--color-error-text", name: "Error", role: "Texto de error, acciones destructivas" },
]

function ColorCard({ token, name, role, value }: { token: string; name: string; role: string; value?: string }) {
  return (
    <div className="doc-color">
      <div className="doc-color-chip" style={{ background: `var(${token})` }} />
      <div className="doc-color-body">
        <span className="doc-color-name">{name}</span>
        <span className="doc-color-token">{token}</span>
        <span className="doc-color-val">{value || "…"}</span>
        <span className="doc-demo-text">{role}</span>
      </div>
    </div>
  )
}

const RAMPS: { name: string; steps: string[] }[] = [
  { name: "Azul", steps: ["100", "200", "300", "400", "500", "700"].map((s) => `--primitive-color-blue-${s}`) },
  { name: "Neutros", steps: ["0", "50", "100", "200", "700", "800", "900", "950"].map((s) => `--primitive-color-neutral-${s}`) },
  { name: "Texto", steps: ["text-dark-900", "text-dark-700", "text-dark-500", "text-light-500", "text-light-300", "text-light-50"].map((s) => `--primitive-color-${s}`) },
]

function Ramp({ steps }: { steps: string[] }) {
  const v = useLiveTokens(steps)
  return (
    <div className="doc-ramp">
      {steps.map((s) => (
        <div key={s} style={{ background: `var(${s})` }} className="doc-ramp-step">
          <span className="doc-ramp-label">{s.replace("--primitive-color-", "")}<br />{v[s]}</span>
        </div>
      ))}
    </div>
  )
}

export function PageColor() {
  const roles = useLiveTokens(ROLES.map((r) => r.token))
  return (
    <DocPage
      eyebrow="Fundamentos"
      title="Color"
      status="estable"
      summary={<p>El color del sitio es casi todo neutro: el trabajo de los proyectos pone el color. Un único azul marca lo interactivo. Todos los colores se usan por <strong>rol</strong>, y cada rol tiene un valor para el tema claro y otro para el oscuro.</p>}
      tabs={[
        { id: "uso", label: "Uso", content: <>
          <Section title="Roles" intro={<p>Diseña con estos roles, no con hexadecimales. El valor de la tarjeta es el del tema activo.</p>}>
            <div className="doc-color-grid">
              {ROLES.map((r) => <ColorCard key={r.token} {...r} value={roles[r.token]} />)}
            </div>
          </Section>
          <Section title="Reglas">
            <Rules>
              <UsageRule
                title="Un solo acento por vista"
                doText="Una acción primaria y las demás en secundario: la jerarquía dice qué hacer primero."
                doDemo={<div className="doc-demo-row"><button className="btn-p" type="button">Trabajemos juntos <ArrowRightIcon className="btn-arrow" /></button><button className="btn-g" type="button">Ver CV</button></div>}
                dontText="Tres botones primarios compiten entre sí y ninguno destaca."
                dontDemo={<div className="doc-demo-row"><button className="btn-p" type="button">Contactar</button><button className="btn-p" type="button">Ver CV</button><button className="btn-p" type="button">Proyectos</button></div>}
              />
              <UsageRule
                title="Texto sobre azul: usa el rol de acción primaria"
                doText="--color-btn-primary-bg está ajustado para que el texto blanco pase AA en ambos temas."
                doDemo={<button className="btn-p" type="button">Enviar mensaje</button>}
                dontText="El azul de marca (blue-400) con texto blanco queda en 3:1 — no pasa AA para texto normal."
                dontDemo={<span className="btn-p doc-x-brandblue">Enviar mensaje</span>}
              />
              <UsageRule
                title="No comuniques solo con color"
                doText="El error se marca con borde, ícono y un mensaje que dice qué corregir."
                doDemo={<div className="doc-demo-col"><div className="fld has-error"><input className="fi" placeholder=" " defaultValue="carlos@" aria-label="Email" aria-invalid="true" /><label className="fl">Email *</label></div><p className="fld-error"><AlertIcon size={14} /> Escribe un email válido, como nombre@dominio.com</p></div>}
                dontText="Solo un borde rojo: quien no distingue el rojo no sabe qué pasó ni cómo arreglarlo."
                dontDemo={<div className="doc-demo-col"><div className="fld has-error"><input className="fi" placeholder=" " defaultValue="carlos@" aria-label="Email" /><label className="fl">Email *</label></div></div>}
              />
              <UsageRule
                title="Jerarquía con roles de texto, no con opacidad"
                doText="Titular en --color-txt y descripción en --color-txt2: los dos pasan AA."
                doDemo={<div className="doc-demo-card"><h4>Amelia</h4><p>Asistente corporativo con IA para colaboradores de LATAM.</p></div>}
                dontText="Bajar la opacidad del texto lo deja por debajo de 4.5:1 y cambia según el fondo."
                dontDemo={<div className="doc-demo-card"><h4>Amelia</h4><p className="doc-x-faded">Asistente corporativo con IA para colaboradores de LATAM.</p></div>}
              />
            </Rules>
          </Section>
        </> },
        { id: "estilo", label: "Estilo", content: <>
          <Section title="Paleta base" intro={<p>Los primitivos son la materia prima. No se usan directo en componentes: los roles semánticos los referencian.</p>}>
            {RAMPS.map((r) => <div key={r.name}><h3 className="doc-h3">{r.name}</h3><Ramp steps={r.steps} /></div>)}
          </Section>
          <Section title="Arquitectura en tres capas" intro={<p>Primitivo → semántico → componente. Cambiar un color de marca es cambiar un primitivo; adaptar un tema es cambiar el semántico.</p>}>
            <TokenTable rows={[
              { token: "--primitive-color-blue-400", role: "Primitivo — azul de marca", swatch: true },
              { token: "--color-accent", role: "Semántico — interactivo (enlaces, foco)", swatch: true },
              { token: "--color-btn-primary-bg", role: "Componente — fondo del botón primario", swatch: true },
              { token: "--color-btn-primary-bg-h", role: "Componente — hover del botón primario", swatch: true },
              { token: "--color-on-accent", role: "Componente — texto sobre acción primaria", swatch: true },
              { token: "--color-error-bg", role: "Semántico — fondo de mensaje de error", swatch: true },
              { token: "--color-success-bg", role: "Semántico — fondo de confirmación", swatch: true },
            ]} />
          </Section>
        </> },
        { id: "a11y", label: "Accesibilidad", content: <>
          <Section title="Contraste medido" intro={<p>Calculado en vivo sobre el tema activo (cambia de tema para ver el otro). Texto normal necesita 4.5:1; texto grande (24px, o 19px en negrita) 3:1.</p>}>
            <ContrastTable pairs={[
              { label: "Texto sobre fondo", fg: "--color-txt", bg: "--color-bg" },
              { label: "Texto secundario sobre fondo", fg: "--color-txt2", bg: "--color-bg" },
              { label: "Texto secundario sobre superficie", fg: "--color-txt2", bg: "--color-bg2" },
              { label: "Acento sobre fondo (enlaces)", fg: "--color-accent", bg: "--color-bg" },
              { label: "Texto sobre acción primaria", fg: "--color-on-accent", bg: "--color-btn-primary-bg" },
              { label: "Error sobre fondo", fg: "--color-error-text", bg: "--color-bg" },
              { label: "Éxito sobre fondo", fg: "--color-success-text", bg: "--color-bg" },
            ]} />
          </Section>
          <Section title="Lista de chequeo">
            <A11yChecklist
              built={["Todos los pares texto/fondo de los roles pasan AA en claro y oscuro.", "El foco usa --color-accent, con 3:1 contra el fondo.", "El tema oscuro no es negro puro: navy de baja saturación para reducir halos."]}
              designer={["No inventes combinaciones: si necesitas una nueva, mide su contraste aquí.", "Acompaña el color con texto o ícono en estados (error, éxito, activo).", "Verifica imágenes con texto encima en ambos temas."]}
            />
          </Section>
        </> },
        { id: "codigo", label: "Código", content: <>
          <Section title="Uso en CSS">
            <Example code={`.mi-tarjeta {\n  background: var(--color-bg2);\n  color: var(--color-txt);\n  border: 1px solid var(--color-border);\n}\n.mi-tarjeta p { color: var(--color-txt2); }\n\n/* Nunca */\n.mi-tarjeta { background: #f8f8f8; color: rgba(0,0,0,.5); }`}>
              <div className="doc-demo-card"><h4>Superficie</h4><p>Fondo bg2, texto txt y txt2, borde border.</p></div>
            </Example>
          </Section>
        </> },
      ]}
    />
  )
}

/* ═══════════════════════════════ Tipografía ═══════════════════════════════ */

const SCALE: { token: string; name: string; use: string; family: "display" | "body"; weight: string; sample: string }[] = [
  { token: "--fs-display", name: "Display", use: "Titular del hero", family: "display", weight: "--fw-display", sample: "Diseño que se usa" },
  { token: "--fs-h1", name: "H1", use: "Título de página", family: "display", weight: "--fw-bold", sample: "Proyectos seleccionados" },
  { token: "--fs-h2", name: "H2", use: "Título de sección", family: "display", weight: "--fw-bold", sample: "Sobre mí" },
  { token: "--fs-h3", name: "H3", use: "Subsección, tarjetas grandes", family: "display", weight: "--fw-bold", sample: "Caso de estudio" },
  { token: "--fs-h4", name: "H4", use: "Título de tarjeta", family: "display", weight: "--fw-bold", sample: "Amelia, asistente corporativo" },
  { token: "--fs-lead", name: "Lead", use: "Bajada bajo un título", family: "body", weight: "--fw-regular", sample: "Diseñador de producto enfocado en sistemas y en IA aplicada." },
  { token: "--fs-body", name: "Body", use: "Texto corrido", family: "body", weight: "--fw-regular", sample: "Pasó de resolver dudas de RRHH a ser el espacio donde cada colaborador crea sus asistentes." },
  { token: "--fs-small", name: "Small", use: "Metadatos, ayudas", family: "body", weight: "--fw-regular", sample: "Product design · 2025" },
  { token: "--fs-micro", name: "Micro", use: "Etiquetas, insignias (mínimo absoluto)", family: "body", weight: "--fw-medium", sample: "NUEVO" },
]

function TypeRow({ s }: { s: (typeof SCALE)[number] }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const [px, setPx] = useState("")
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const read = () => {
      const cs = getComputedStyle(el)
      setPx(`${Math.round(parseFloat(cs.fontSize))}px / ${(parseFloat(cs.lineHeight) / parseFloat(cs.fontSize)).toFixed(2)}`)
    }
    read()
    const ro = new ResizeObserver(read)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    <div className="doc-type-row">
      <div className="doc-type-meta">
        <strong>{s.name}</strong>
        <code>{s.token}</code>
        <span>{px} en este ancho</span>
        <span>{s.use}</span>
      </div>
      <p ref={ref} className={`doc-type-sample doc-type--${s.family}`} style={{ fontSize: `var(${s.token})`, fontWeight: `var(${s.weight})` }}>{s.sample}</p>
    </div>
  )
}

export function PageTipografia() {
  return (
    <DocPage
      eyebrow="Fundamentos"
      title="Tipografía"
      status="estable"
      summary={<p>Dos familias: <strong>Plus Jakarta Sans</strong> para titulares, con carácter, y <strong>DM Sans</strong> para leer. La escala es fluida — crece con la pantalla entre un mínimo y un máximo — así que no hay saltos entre breakpoints.</p>}
      tabs={[
        { id: "uso", label: "Uso", content: <>
          <Section title="Escala" intro={<p>Tamaño y alto de línea medidos en vivo en este ancho de pantalla. Cambia el ancho de la ventana para ver la escala fluida.</p>}>
            {SCALE.map((s) => <TypeRow key={s.token} s={s} />)}
          </Section>
          <Section title="Reglas">
            <Rules>
              <UsageRule
                title="Display solo para titulares cortos"
                doText="Dos a cinco palabras. El tamaño display es para leerse de un vistazo."
                doDemo={<p className="doc-type--display doc-x-display-sm">Diseño que se usa</p>}
                dontText="Un párrafo en display se vuelve una pared de texto difícil de leer."
                dontDemo={<p className="doc-type--display doc-x-display-sm doc-x-display-long">Diseño productos digitales para empresas de toda Latinoamérica con foco en sistemas</p>}
              />
              <UsageRule
                title="12px es el mínimo"
                doText="Metadatos y etiquetas en --fs-small o --fs-micro (12px)."
                doDemo={<div className="doc-demo-card"><h4>Redesign E-commerce</h4><p>UX/UI Design · 2024</p></div>}
                dontText="Texto de 10px: ilegible en móvil y no escala con el zoom del navegador como se espera."
                dontDemo={<div className="doc-demo-card"><h4>Redesign E-commerce</h4><p className="doc-x-tiny">UX/UI Design · 2024</p></div>}
              />
              <UsageRule
                title="Solo las dos familias del sistema"
                doText="Plus Jakarta para el titular, DM Sans para el texto."
                doDemo={<div className="doc-demo-card"><h4>Sobre mí</h4><p>Diseñador de producto con 10 años de experiencia.</p></div>}
                dontText="Una tercera familia (aquí una serif) rompe la voz de la marca."
                dontDemo={<div className="doc-demo-card"><h4 className="doc-x-serif">Sobre mí</h4><p>Diseñador de producto con 10 años de experiencia.</p></div>}
              />
              <UsageRule
                title="La jerarquía va de mayor a menor"
                doText="El título es más grande que su contenido; el peso acompaña al tamaño."
                doDemo={<div className="doc-demo-card"><h4>Proceso</h4><p>Investigación con 40 colaboradores y 3 rondas de prototipos.</p></div>}
                dontText="Un título más chico que el texto no se reconoce como título."
                dontDemo={<div className="doc-demo-card"><h4 className="doc-x-small-title">Proceso</h4><p className="doc-x-big-body">Investigación con 40 colaboradores y 3 rondas de prototipos.</p></div>}
              />
            </Rules>
          </Section>
        </> },
        { id: "estilo", label: "Estilo", content: <>
          <Section title="Tokens">
            <TokenTable rows={[
              { token: "--ff-display", role: "Familia de titulares" },
              { token: "--ff-body", role: "Familia de texto" },
              { token: "--fw-display", role: "Peso del display" },
              { token: "--fw-bold", role: "Peso de títulos" },
              { token: "--fw-medium", role: "Énfasis, botones" },
              { token: "--fw-regular", role: "Texto" },
              { token: "--measure-prose", role: "Ancho máximo de párrafo" },
              { token: "--measure-lead", role: "Ancho máximo de bajada" },
            ]} />
          </Section>
          <Section title="Ancho de lectura" intro={<p>Los párrafos largos no pasan de <code>--measure-prose</code> (62 caracteres): más allá, el ojo pierde la línea siguiente.</p>}>
            <Example align="start"><p className="doc-x-measure">Amelia pasó de resolver dudas de RRHH a ser el espacio donde cada colaborador crea sus propios asistentes para automatizar tareas, y conversa, redacta y genera contenido multimedia como en un ChatGPT corporativo.</p></Example>
          </Section>
        </> },
        { id: "contenido", label: "Contenido", content: <>
          <Section title="Escribir titulares">
            <Prose>
              <ul>
                <li>Mayúscula solo al inicio y en nombres propios: «Proyectos seleccionados», no «Proyectos Seleccionados».</li>
                <li>Sin punto final en titulares, etiquetas ni botones.</li>
                <li>Las etiquetas en mayúsculas (<code>.s-label</code>) se escriben en minúscula y el CSS las transforma — los lectores de pantalla no las deletrean.</li>
              </ul>
            </Prose>
          </Section>
          <Section title="Reglas">
            <Rules>
              <UsageRule
                title="Mayúscula de oración"
                doText="Solo la primera palabra y los nombres propios."
                doDemo={<div className="doc-demo-card"><h4>Proyectos seleccionados</h4></div>}
                dontText="Mayúscula en cada palabra (estilo inglés) se lee como un anuncio."
                dontDemo={<div className="doc-demo-card"><h4>Proyectos Seleccionados</h4></div>}
              />
            </Rules>
          </Section>
        </> },
        { id: "codigo", label: "Código", content: (
          <Section title="Uso en CSS">
            <Example code={`h2 {\n  font-family: var(--ff-display);\n  font-size: var(--fs-h2);\n  font-weight: var(--fw-bold);\n  letter-spacing: -0.02em;\n  text-wrap: balance;\n}\np { font-size: var(--fs-body); max-width: var(--measure-prose); }`}>
              <div className="doc-demo-col"><h4 className="doc-type--display doc-x-h3">Caso de estudio</h4><p className="doc-demo-text">Escala fluida con clamp(): no necesita media queries.</p></div>
            </Example>
          </Section>
        ) },
      ]}
    />
  )
}

/* ═══════════════════════════════ Espaciado y layout ═══════════════════════════════ */

const SPACES = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24]
const BREAKPOINTS: { name: string; range: string; layout: string }[] = [
  { name: "Móvil", range: "≤ 640px", layout: "1 columna, navegación inferior, márgenes de 16px" },
  { name: "Tablet", range: "641 – 860px", layout: "2 columnas en la galería, navbar superior" },
  { name: "Laptop", range: "861 – 1024px", layout: "Galería bento, márgenes de 24px" },
  { name: "Escritorio", range: "1025 – 1920px", layout: "Contenedor de 1320px (--container)" },
  { name: "Ultra ancho", range: "≥ 1921px", layout: "Contenedor de 1600px (--container-wide), escala mayor" },
]

export function PageEspaciado() {
  const v = useLiveTokens(SPACES.map((s) => `--space-${s}`))
  return (
    <DocPage
      eyebrow="Fundamentos"
      title="Espaciado y layout"
      status="estable"
      summary={<p>Una escala de múltiplos de 4px para todo: padding, márgenes y gaps. El espacio agrupa lo relacionado y separa lo distinto — es la herramienta de jerarquía más barata.</p>}
      tabs={[
        { id: "uso", label: "Uso", content: <>
          <Section title="Escala">
            {SPACES.map((s) => (
              <div key={s} className="doc-space-row">
                <code>--space-{s}</code>
                <span className="doc-muted">{v[`--space-${s}`]}</span>
                <span className="doc-space-bar" style={{ width: `var(--space-${s})` }} />
              </div>
            ))}
          </Section>
          <Section title="Reglas">
            <Rules>
              <UsageRule
                title="Proximidad: lo relacionado va junto"
                doText="Título y meta pegados (4–8px); el bloque siguiente, más lejos (24px)."
                doDemo={<div className="doc-demo-card doc-x-prox-good"><div><h4>Redesign E-commerce</h4><p>UX/UI Design · 2024</p></div><p>Rediseño de la plataforma con foco en conversión.</p></div>}
                dontText="Todo a la misma distancia: no se distingue qué pertenece a qué."
                dontDemo={<div className="doc-demo-card doc-x-prox-bad"><h4>Redesign E-commerce</h4><p>UX/UI Design · 2024</p><p>Rediseño de la plataforma con foco en conversión.</p></div>}
              />
              <UsageRule
                title="Solo valores de la escala"
                doText="Padding de 24px (--space-6) en los cuatro lados."
                doDemo={<div className="doc-demo-card"><h4>Contacto</h4><p>Respondo en menos de 48 horas.</p></div>}
                dontText="Valores sueltos (13px, 27px, 9px) desalinean las tarjetas entre sí."
                dontDemo={<div className="doc-demo-card doc-x-odd-pad"><h4>Contacto</h4><p>Respondo en menos de 48 horas.</p></div>}
              />
            </Rules>
          </Section>
        </> },
        { id: "estilo", label: "Estilo", content: <>
          <Section title="Breakpoints" intro={<p>Diseña en estos cinco anchos. Los valores salen de las media queries reales de <code>portfolio.css</code>.</p>}>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead><tr><th scope="col">Nombre</th><th scope="col">Rango</th><th scope="col">Qué cambia</th></tr></thead>
                <tbody>{BREAKPOINTS.map((b) => <tr key={b.name}><td>{b.name}</td><td><code>{b.range}</code></td><td>{b.layout}</td></tr>)}</tbody>
              </table>
            </div>
          </Section>
          <Section title="Contenedores">
            <TokenTable rows={[
              { token: "--container", role: "Ancho máximo del contenido en escritorio" },
              { token: "--container-wide", role: "Ancho máximo en ultra ancho" },
              { token: "--measure-prose", role: "Ancho máximo de un párrafo" },
            ]} />
          </Section>
        </> },
        { id: "codigo", label: "Código", content: (
          <Section title="Uso en CSS">
            <Example code={`.tarjeta { padding: var(--space-6); display: grid; gap: var(--space-4); }\n.tarjeta-meta { margin-top: var(--space-1); }`}>
              <div className="doc-demo-card"><h4>Espaciado</h4><p>padding --space-6, gap --space-4.</p></div>
            </Example>
          </Section>
        ) },
      ]}
    />
  )
}

/* ═══════════════════════════════ Forma y elevación ═══════════════════════════════ */

const RADII = ["--r-sm", "--r-md", "--r-lg", "--r-xl", "--r-2xl", "--r-full"]
const SHADOWS = ["--shadow-xs", "--shadow-sm", "--shadow-md", "--shadow-xl", "--shadow-2xl"]

export function PageForma() {
  const r = useLiveTokens(RADII)
  return (
    <DocPage
      eyebrow="Fundamentos"
      title="Forma y elevación"
      status="estable"
      summary={<p>Esquinas redondeadas y suaves; botones en píldora. La elevación se expresa primero con la superficie (bg → bg2 → bg3) y solo después con sombra — en oscuro, las sombras casi no se ven.</p>}
      tabs={[
        { id: "uso", label: "Uso", content: <>
          <Section title="Radios">
            <div className="doc-radius-grid">
              {RADII.map((t) => (
                <div key={t} className="doc-radius-item">
                  <div className="doc-radius-box" style={{ borderRadius: `var(${t})` }} />
                  <code>{t}</code><span className="doc-muted">{r[t]}</span>
                </div>
              ))}
            </div>
          </Section>
          <Section title="Sombras">
            <div className="doc-elev-grid">
              {SHADOWS.map((t) => (
                <div key={t} className="doc-elev-item">
                  <div className="doc-elev-box" style={{ boxShadow: `var(${t})` }} />
                  <code>{t}</code>
                </div>
              ))}
            </div>
          </Section>
          <Section title="Reglas">
            <Rules>
              <UsageRule
                title="Los botones son píldoras"
                doText="Radio completo en botones de acción: es la firma de la marca."
                doDemo={<div className="doc-demo-row"><button className="btn-p" type="button">Contáctame</button><button className="btn-g" type="button">Ver CV</button></div>}
                dontText="Un botón con esquinas rectas parece de otro producto."
                dontDemo={<div className="doc-demo-row"><span className="btn-p doc-x-square">Contáctame</span><span className="btn-g doc-x-square">Ver CV</span></div>}
              />
              <UsageRule
                title="Eleva con superficie, no con sombra dura"
                doText="Una tarjeta en bg2 con borde se separa del fondo en ambos temas."
                doDemo={<div className="doc-demo-card"><h4>Perfil</h4><p>Diseñador de producto.</p></div>}
                dontText="Una sombra negra fuerte ensucia el tema claro y desaparece en el oscuro."
                dontDemo={<div className="doc-demo-card doc-x-hard-shadow"><h4>Perfil</h4><p>Diseñador de producto.</p></div>}
              />
            </Rules>
          </Section>
        </> },
        { id: "codigo", label: "Código", content: (
          <Section title="Uso en CSS">
            <Example code={`.panel { border-radius: var(--r-lg); background: var(--color-bg2); box-shadow: var(--shadow-sm); }`}>
              <div className="doc-demo-card"><h4>Panel</h4><p>r-lg, bg2, shadow-sm.</p></div>
            </Example>
          </Section>
        ) },
      ]}
    />
  )
}

/* ═══════════════════════════════ Movimiento ═══════════════════════════════ */

const DURATIONS: { token: string; name: string; use: string }[] = [
  { token: "--dur-press", name: "Press", use: "Respuesta al presionar" },
  { token: "--dur-hover", name: "Hover", use: "Cambios de color y borde" },
  { token: "--dur-exit", name: "Salida", use: "Cerrar, ocultar" },
  { token: "--dur-enter", name: "Entrada", use: "Abrir paneles, toasts" },
  { token: "--dur-reveal", name: "Revelado", use: "Aparición al hacer scroll" },
  { token: "--dur-hero", name: "Hero", use: "Entrada del titular" },
]
const EASES: { token: string; name: string; use: string }[] = [
  { token: "--ease-standard", name: "Estándar", use: "Color, opacidad" },
  { token: "--ease-out", name: "Desacelerar", use: "Entradas: llega rápido y se asienta" },
  { token: "--ease-in", name: "Acelerar", use: "Salidas" },
  { token: "--ease-spring", name: "Resorte", use: "Confirmaciones pequeñas (con moderación)" },
]

function MotionCard({ name, token, ease = "--ease-out", dur = "--dur-enter", use }: { name: string; token: string; ease?: string; dur?: string; use: string }) {
  const [on, setOn] = useState(false)
  const v = useLiveTokens([dur, ease])
  return (
    <div className={`doc-motion${on ? " is-playing" : ""}`}>
      <div className="doc-motion-track"><span className="doc-motion-dot" style={{ transitionDuration: `var(${dur})`, transitionTimingFunction: `var(${ease})` }} /></div>
      <div className="doc-motion-meta"><strong>{name}</strong><span>{token} · {token === dur ? v[dur] : v[ease]}</span><span>{use}</span></div>
      <button type="button" className="doc-btn" onClick={() => setOn((x) => !x)} aria-label={`Reproducir ${name}`}>Reproducir</button>
    </div>
  )
}

function Timeline({ rows }: { rows: { label: string; ms: number; bad?: boolean }[] }) {
  const max = 720
  return (
    <div className="doc-demo-col doc-x-timeline">
      {rows.map((r) => (
        <div key={r.label} className="doc-x-tl-row">
          <span>{r.label}</span>
          <span className={`doc-x-tl-bar${r.bad ? " is-bad" : ""}`} style={{ width: `${(r.ms / max) * 100}%` }} />
          <code>{r.ms}ms</code>
        </div>
      ))}
    </div>
  )
}

export function PageMovimiento() {
  return (
    <DocPage
      eyebrow="Fundamentos"
      title="Movimiento"
      status="estable"
      summary={<p>El movimiento explica relaciones: de dónde viene un panel, qué cambió, qué responde al tacto. Duraciones cortas, curvas que desaceleran al llegar, y todo se reduce si el sistema pide menos movimiento.</p>}
      tabs={[
        { id: "uso", label: "Uso", content: <>
          <Section title="Duraciones" intro={<p>Pulsa «Reproducir» para ver cada duración con la curva de entrada.</p>}>
            <div className="doc-motion-grid">{DURATIONS.map((d) => <MotionCard key={d.token} name={d.name} token={d.token} dur={d.token} use={d.use} />)}</div>
          </Section>
          <Section title="Curvas">
            <div className="doc-motion-grid">{EASES.map((e) => <MotionCard key={e.token} name={e.name} token={e.token} ease={e.token} dur="--dur-reveal" use={e.use} />)}</div>
          </Section>
          <Section title="Reglas">
            <Rules>
              <UsageRule
                title="Las salidas son más rápidas que las entradas"
                doText="Entrar en 240ms y salir en 160ms: lo que se va no hace esperar."
                doDemo={<Timeline rows={[{ label: "Entrada", ms: 240 }, { label: "Salida", ms: 160 }]} />}
                dontText="Una salida lenta bloquea la siguiente acción del usuario."
                dontDemo={<Timeline rows={[{ label: "Entrada", ms: 240 }, { label: "Salida", ms: 700, bad: true }]} />}
              />
              <UsageRule
                title="Interacciones en menos de 300ms"
                doText="Hover y press en 100–160ms se sienten inmediatos."
                doDemo={<Timeline rows={[{ label: "Press", ms: 100 }, { label: "Hover", ms: 160 }]} />}
                dontText="Un hover de 600ms se siente como un sitio lento."
                dontDemo={<Timeline rows={[{ label: "Press", ms: 400, bad: true }, { label: "Hover", ms: 600, bad: true }]} />}
              />
            </Rules>
          </Section>
        </> },
        { id: "a11y", label: "Accesibilidad", content: (
          <Section title="Movimiento reducido">
            <A11yChecklist
              built={["Con prefers-reduced-motion, las transiciones del sitio, del admin y de esta documentación bajan a ~0ms.", "El contador (CountUp) muestra el valor final sin animar.", "El cambio de tema con revelado circular se reemplaza por un cambio directo."]}
              designer={["Ningún contenido debe depender de una animación para entenderse.", "Evita parpadeos de más de 3 veces por segundo.", "El movimiento de fondo (terreno 3D) no lleva información."]}
            />
          </Section>
        ) },
        { id: "codigo", label: "Código", content: (
          <Section title="Uso en CSS">
            <Example code={`.panel {\n  transition: opacity var(--dur-enter) var(--ease-out),\n              translate var(--dur-enter) var(--ease-out);\n}\n.panel[data-state="closed"] { transition-duration: var(--dur-exit); }\n\n@media (prefers-reduced-motion: reduce) {\n  .panel { transition-duration: 0.01ms; }\n}`}>
              <MotionCard name="Entrada" token="--dur-enter" dur="--dur-enter" use="opacity + translate" />
            </Example>
          </Section>
        ) },
      ]}
    />
  )
}

/* ═══════════════════════════════ Iconografía ═══════════════════════════════ */

const ICON_NAMES = Object.keys(Icons).filter((k) => k.endsWith("Icon")) as (keyof typeof Icons)[]

export function PageIconografia() {
  return (
    <DocPage
      eyebrow="Fundamentos"
      title="Iconografía"
      status="estable"
      summary={<p>Un solo set de íconos lineales de 24×24, trazo de 1.8–2px y puntas redondeadas, en <code>components/portfolio/icons.tsx</code>. Heredan el color del texto (<code>currentColor</code>).</p>}
      tabs={[
        { id: "uso", label: "Uso", content: <>
          <Section title="Set">
            <div className="doc-icons">
              {ICON_NAMES.map((n) => {
                const I = Icons[n] as (p: { className?: string }) => ReactNode
                return <div key={n} className="doc-icon"><I />{n.replace("Icon", "")}</div>
              })}
            </div>
          </Section>
          <Section title="Reglas">
            <Rules>
              <UsageRule
                title="Íconos SVG del set, nunca emoji"
                doText="El ícono del set hereda color y tamaño y se ve igual en todos los sistemas."
                doDemo={<button type="button" className="a-btn a-btn--danger-ghost"><TrashIcon /> Eliminar</button>}
                dontText="Un emoji cambia de diseño según el sistema operativo y no toma el color del texto."
                dontDemo={<span className="a-btn a-btn--danger-ghost">🗑️ Eliminar</span>}
              />
              <UsageRule
                title="Ícono acompañado de texto"
                doText="Ícono y etiqueta juntos: se entiende sin adivinar."
                doDemo={<button type="button" className="btn-g">Ver portafolio <Icons.ExternalIcon /></button>}
                dontText="Solo el ícono, sin etiqueta visible ni nombre accesible: ¿qué hace?"
                dontDemo={<span className="btn-g doc-x-icon-only"><Icons.ExternalIcon /></span>}
              />
              <UsageRule
                title="Tamaño proporcional al texto"
                doText="16–20px junto a texto de 14–16px, alineados al centro."
                doDemo={<button type="button" className="btn-p">Siguiente <ArrowRightIcon className="btn-arrow" /></button>}
                dontText="Un ícono de 32px desbalancea el botón y lo deforma."
                dontDemo={<span className="btn-p">Siguiente <ArrowRightIcon className="doc-x-big-icon" /></span>}
              />
            </Rules>
          </Section>
        </> },
        { id: "a11y", label: "Accesibilidad", content: (
          <Section title="Lista de chequeo">
            <A11yChecklist
              built={["Los íconos decorativos llevan aria-hidden.", "Los botones de solo ícono del sitio (tema, cerrar) tienen aria-label."]}
              designer={["Si un ícono va solo, define su nombre accesible en el diseño.", "El área táctil es de 44px aunque el ícono mida 20px."]}
            />
          </Section>
        ) },
        { id: "codigo", label: "Código", content: (
          <Section title="Uso">
            <Example code={`import { TrashIcon } from "@/components/portfolio/icons"\n\n<button className="a-btn a-btn--danger-ghost">\n  <TrashIcon /> Eliminar\n</button>`}>
              <button type="button" className="a-btn a-btn--danger-ghost"><TrashIcon /> Eliminar</button>
            </Example>
          </Section>
        ) },
      ]}
    />
  )
}

/* ═══════════════════════════════ Accesibilidad ═══════════════════════════════ */

export function PageAccesibilidad() {
  return (
    <DocPage
      eyebrow="Fundamentos"
      title="Accesibilidad"
      status="estable"
      summary={<p>El objetivo es WCAG 2.2 AA en el sitio, el panel y esta documentación. La mayoría está resuelta en los tokens y componentes; esta página reúne lo que el diseño tiene que cuidar.</p>}
      tabs={[
        { id: "uso", label: "Uso", content: <>
          <Section title="Lo mínimo">
            <WhenToUse
              use={["Contraste 4.5:1 en texto, 3:1 en texto grande e íconos.", "Foco visible en todo lo interactivo.", "Objetivos táctiles de 44×44px.", "Texto de 12px como mínimo.", "Cada campo con su etiqueta visible."]}
              avoid={[{ text: "Placeholder como única etiqueta", instead: <PageLink to="campo">Campo</PageLink> }, { text: "Información solo con color" }, { text: "Hover como única forma de descubrir algo" }, { text: "Animaciones que no se pueden reducir" }]}
            />
          </Section>
          <Section title="Reglas">
            <Rules>
              <UsageRule
                title="El foco siempre se ve"
                doText="Anillo de 2px en el acento, separado del borde: se ve sobre cualquier fondo."
                doDemo={<button type="button" className="btn-g" data-pseudo="focus">Ver CV</button>}
                dontText="Quitar el outline deja a quien usa teclado sin saber dónde está."
                dontDemo={<span className="btn-g doc-x-nofocus">Ver CV</span>}
              />
              <UsageRule
                title="Objetivos de 44px"
                doText="El área táctil mide 44px aunque el ícono sea más chico."
                doDemo={<div className="doc-demo-row"><span className="doc-x-target is-ok"><Icons.LinkedInIcon /></span><span className="doc-x-target is-ok"><Icons.GitHubIcon /></span><span className="doc-x-target is-ok"><Icons.InstagramIcon /></span></div>}
                dontText="Íconos de 20px pegados entre sí: en móvil se toca el vecino."
                dontDemo={<div className="doc-demo-row doc-x-tight"><span className="doc-x-target"><Icons.LinkedInIcon /></span><span className="doc-x-target"><Icons.GitHubIcon /></span><span className="doc-x-target"><Icons.InstagramIcon /></span></div>}
              />
            </Rules>
          </Section>
        </> },
        { id: "teclado", label: "Teclado", content: (
          <Section title="Atajos y patrones">
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead><tr><th scope="col">Tecla</th><th scope="col">Dónde</th><th scope="col">Hace</th></tr></thead>
                <tbody>
                  <tr><td><code>Tab</code> / <code>Shift+Tab</code></td><td>Todo</td><td>Mueve el foco en orden de lectura</td></tr>
                  <tr><td><code>Enter</code> / <code>Espacio</code></td><td>Botones, tarjetas</td><td>Activa</td></tr>
                  <tr><td><code>Esc</code></td><td>Modal, panel lateral, confirmación</td><td>Cierra y devuelve el foco al disparador</td></tr>
                  <tr><td><code>↑</code> <code>↓</code> <code>Inicio</code> <code>Fin</code></td><td>Navegación del admin</td><td>Cambia de sección (tablist vertical)</td></tr>
                  <tr><td><code>←</code> <code>→</code></td><td>Pestañas de esta documentación</td><td>Cambia de pestaña</td></tr>
                  <tr><td><code>Ctrl/⌘ + K</code></td><td>Esta documentación</td><td>Busca una página</td></tr>
                  <tr><td><code>Enter</code> / <code>,</code></td><td>Etiquetas del admin</td><td>Agrega una etiqueta</td></tr>
                </tbody>
              </table>
            </div>
          </Section>
        ) },
      ]}
    />
  )
}
