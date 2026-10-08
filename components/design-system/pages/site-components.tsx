"use client"

import { useCallback, useRef, useState } from "react"
import projectsJson from "@/data/projects.json"
import socialJson from "@/data/social.json"
import type { Project } from "@/lib/data/projects"
import { ProjectCard } from "@/components/portfolio/project-card"
import { CountUp } from "@/components/portfolio/count-up"
import { ThemeToggle } from "@/components/portfolio/app-navbar"
import { ClosingCta } from "@/components/portfolio/sections/closing-cta"
import { AlertIcon, ArrowRightIcon } from "@/components/portfolio/icons"
import { Lightbox } from "@/components/portfolio/lightbox"
import { GalleryPlaceholder, type GalleryItem } from "@/components/portfolio/gallery-placeholder"
import {
  A11yChecklist, Anatomy, Capture, ContrastTable, DocPage, Example, Prose, Redline, Rules, Section, StateMatrix, TokenTable,
  UsageRule, Variants, WhenToUse,
} from "../ui/doc"
import { Live } from "../ui/live"
import { PageLink } from "../ui/nav"

const PROJECTS = projectsJson as unknown as Project[]
const P = (id: number) => PROJECTS.find((p) => p.id === id) ?? PROJECTS[0]
const EMAIL = (socialJson as { email: string }).email
const noop = () => {}

/* ═══════════════════════════════ Botón ═══════════════════════════════ */

export function PageBoton() {
  return (
    <DocPage
      eyebrow="Componentes del sitio"
      title="Botón"
      status="estable"
      summary={<p>Los botones inician acciones: contactar, enviar, ver el CV. El sitio tiene tres: <strong>primario</strong> para la acción más importante de la vista, <strong>secundario</strong> para las alternativas y <strong>perfil</strong> en la barra de navegación.</p>}
      tabs={[
        { id: "uso", label: "Uso", content: <>
          <Section title="Cuándo usarlo">
            <WhenToUse
              use={["Para una acción: enviar, contactar, abrir, copiar.", "Para el siguiente paso más importante de una sección (primario).", "Para alternativas al lado del primario (secundario)."]}
              avoid={[{ text: "Para navegar a otra página dentro de un texto", instead: "un enlace subrayado" }, { text: "Para abrir un proyecto", instead: <PageLink to="tarjeta-proyecto">la tarjeta de proyecto</PageLink> }, { text: "Para filtrar contenido", instead: <PageLink to="etiquetas">las píldoras de filtro</PageLink> }]}
            />
          </Section>
          <Section title="Variantes">
            <Variants items={[
              { name: "Primario", desc: "Una sola vez por vista. Fondo --color-btn-primary-bg.", demo: <button type="button" className="btn-p">Trabajemos juntos <ArrowRightIcon className="btn-arrow" /></button> },
              { name: "Secundario", desc: "Alternativas y acciones de menor peso. Contorno.", demo: <button type="button" className="btn-g">Ver CV</button> },
              { name: "Perfil", desc: "Solo en la barra de navegación.", demo: <button type="button" className="btn-profile">Perfil</button> },
            ]} />
          </Section>
          <Section title="Reglas">
            <Rules>
              <UsageRule
                title="Un primario por vista"
                doText="La acción principal destaca; las demás acompañan en secundario."
                doDemo={<div className="doc-demo-row"><button type="button" className="btn-p">Contáctame <ArrowRightIcon className="btn-arrow" /></button><button type="button" className="btn-g">Ver CV</button></div>}
                dontText="Dos primarios: el usuario no sabe cuál es el paso esperado."
                dontDemo={<div className="doc-demo-row"><button type="button" className="btn-p">Contáctame</button><button type="button" className="btn-p">Ver CV</button></div>}
              />
              <UsageRule
                title="El primario va primero"
                doText="Primario a la izquierda (orden de lectura y de tabulación)."
                doDemo={<div className="doc-demo-row"><button type="button" className="btn-p">Enviar mensaje</button><button type="button" className="btn-g">Cancelar</button></div>}
                dontText="Invertir el orden cambia de lugar la acción entre pantallas."
                dontDemo={<div className="doc-demo-row"><button type="button" className="btn-g">Cancelar</button><button type="button" className="btn-p">Enviar mensaje</button></div>}
              />
              <UsageRule
                title="La flecha indica avance"
                doText="ArrowRight solo cuando la acción lleva a otro lugar o al paso siguiente."
                doDemo={<button type="button" className="btn-p">Ver todas <ArrowRightIcon className="btn-arrow" /></button>}
                dontText="Una flecha en «Copiar email» promete una navegación que no ocurre."
                dontDemo={<button type="button" className="btn-g">Copiar email <ArrowRightIcon className="btn-arrow" /></button>}
              />
              <UsageRule
                title="Una línea, sin cortes"
                doText="Etiquetas de 1 a 3 palabras que caben en una línea."
                doDemo={<button type="button" className="btn-p">Enviar mensaje</button>}
                dontText="Una etiqueta larga se parte en dos líneas y deja de leerse como botón."
                dontDemo={<div className="doc-w-card"><button type="button" className="btn-p doc-x-wrap">Haz click aquí para enviarme tu mensaje ahora</button></div>}
              />
            </Rules>
          </Section>
        </> },
        { id: "estilo", label: "Estilo", content: <>
          <Section title="Anatomía">
            <Anatomy parts={[
              { n: 1, label: "Contenedor", detail: "píldora, fondo de acción primaria", x: 28, y: 50 },
              { n: 2, label: "Etiqueta", detail: "DM Sans 15px, peso 500", x: 46, y: 22 },
              { n: 3, label: "Ícono final (opcional)", detail: "16px, se desplaza 3px en hover", x: 66, y: 22 },
            ]}>
              <button type="button" className="btn-p">Trabajemos juntos <ArrowRightIcon className="btn-arrow" /></button>
            </Anatomy>
          </Section>
          <Section title="Medidas" intro={<p>Leídas del botón real en este momento.</p>}>
            <Redline label="Primario"><button type="button" className="btn-p">Trabajemos juntos <ArrowRightIcon className="btn-arrow" /></button></Redline>
          </Section>
          <Section title="Estados">
            <StateMatrix
              states={[
                { label: "Reposo" },
                { label: "Hover", pseudo: "hover", note: "Solo con puntero" },
                { label: "Foco", pseudo: "focus", note: "Teclado" },
                { label: "Presionado", pseudo: "active" },
                { label: "Deshabilitado", extra: { disabled: true }, note: "Neutro, no transparente" },
              ]}
              render={({ pseudo, extra }) => <button type="button" className="btn-p" data-pseudo={pseudo} disabled={!!extra?.disabled}>Enviar</button>}
            />
            <div className="doc-gap" />
            <StateMatrix
              states={[{ label: "Reposo" }, { label: "Hover", pseudo: "hover" }, { label: "Foco", pseudo: "focus" }, { label: "Presionado", pseudo: "active" }, { label: "Deshabilitado", extra: { disabled: true } }]}
              render={({ pseudo, extra }) => <button type="button" className="btn-g" data-pseudo={pseudo} disabled={!!extra?.disabled}>Ver CV</button>}
            />
          </Section>
          <Section title="Tokens">
            <TokenTable rows={[
              { token: "--color-btn-primary-bg", role: "Fondo primario", swatch: true },
              { token: "--color-btn-primary-bg-h", role: "Fondo primario en hover", swatch: true },
              { token: "--color-on-accent", role: "Texto del primario", swatch: true },
              { token: "--color-border", role: "Contorno del secundario", swatch: true },
              { token: "--dur-press", role: "Duración del press" },
            ]} />
          </Section>
        </> },
        { id: "contenido", label: "Contenido", content: (
          <Section title="Escribir etiquetas">
            <Prose><ul>
              <li>Verbo en infinitivo o imperativo que diga qué pasa: «Enviar mensaje», «Ver CV», «Trabajemos juntos».</li>
              <li>Mayúscula solo al inicio, sin punto final.</li>
              <li>Evita «Click aquí», «OK», «Submit».</li>
            </ul></Prose>
            <Rules>
              <UsageRule
                title="Di qué hace"
                doText="«Enviar mensaje» describe el resultado."
                doDemo={<button type="button" className="btn-p">Enviar mensaje</button>}
                dontText="«OK» o «Click aquí» no dicen qué va a pasar."
                dontDemo={<button type="button" className="btn-p">Click aquí</button>}
              />
            </Rules>
          </Section>
        ) },
        { id: "a11y", label: "Accesibilidad", content: (
          <Section title="Lista de chequeo">
            <A11yChecklist
              built={["Elemento <button> nativo (o <a> si navega): Enter y Espacio funcionan.", "Anillo de foco de 2px en el acento.", "Alto ≥ 44px.", "Deshabilitado con contraste 4.5:1 (no por opacidad).", "Hover solo con puntero: en táctil no queda pegado."]}
              designer={["No uses un botón deshabilitado para explicar algo: di por qué en el texto.", "Si va solo un ícono, define su aria-label.", "Mientras envía, cambia la etiqueta («Enviando…»)."]}
            />
          </Section>
        ) },
        { id: "codigo", label: "Código", content: <>
          <Section title="Primario con ícono">
            <Example code={`import { ArrowRightIcon } from "@/components/portfolio/icons"\n\n<button className="btn-p btn-shine">\n  Trabajemos juntos <ArrowRightIcon className="btn-arrow" />\n</button>`}>
              <button type="button" className="btn-p btn-shine">Trabajemos juntos <ArrowRightIcon className="btn-arrow" /></button>
            </Example>
          </Section>
          <Section title="Secundario como enlace">
            <Example code={`<a href="/cv.pdf" className="btn-g" target="_blank" rel="noopener noreferrer">Ver CV</a>`}>
              <Live><a href="#" className="btn-g">Ver CV</a></Live>
            </Example>
          </Section>
        </> },
      ]}
    />
  )
}

/* ═══════════════════════════════ Tarjeta de proyecto ═══════════════════════════════ */

export function PageTarjeta() {
  return (
    <DocPage
      eyebrow="Componentes del sitio"
      title="Tarjeta de proyecto"
      status="estable"
      summary={<p>La pieza central del portafolio. Muestra un proyecto con su imagen, categoría, título y una métrica de impacto, y lleva al caso de estudio. Tiene dos tamaños que se alternan en la <PageLink to="galeria">galería bento</PageLink>.</p>}
      tabs={[
        { id: "uso", label: "Uso", content: <>
          <Section title="Variantes">
            <Variants items={[
              { name: "Destacada", desc: "Ocupa 2 columnas. Muestra descripción, año y «Ver caso».", demo: <Live className="doc-w-full"><div className="doc-card-host doc-card-host--featured"><ProjectCard project={P(2)} variant="featured" index={0} onClick={noop} /></div></Live> },
              { name: "Compacta", desc: "1 columna. Solo categoría, título y métrica.", demo: <Live className="doc-w-full"><div className="doc-card-host"><ProjectCard project={P(2)} variant="compact" index={1} onClick={noop} /></div></Live> },
              { name: "Sin imagen", desc: "Estado vacío diseñado: número del proyecto sobre su gradiente.", demo: <Live className="doc-w-full"><div className="doc-card-host"><ProjectCard project={P(4)} variant="compact" index={3} onClick={noop} /></div></Live> },
            ]} />
          </Section>
          <Section title="Reglas">
            <Rules>
              <UsageRule
                title="La métrica es un resultado"
                doText="«12k usuarios / mes 1»: un número que muestra impacto."
                doDemo={<Live className="doc-w-full"><div className="doc-card-host"><ProjectCard project={P(2)} variant="compact" index={0} onClick={noop} /></div></Live>}
                dontText="Una métrica que describe el trabajo («3 pantallas») no dice nada del impacto."
                dontDemo={<Live className="doc-w-full"><div className="doc-card-host"><ProjectCard project={{ ...P(2), stat: "3 pantallas" }} variant="compact" index={0} onClick={noop} /></div></Live>}
              />
              <UsageRule
                title="Títulos cortos"
                doText="Nombre del producto en 2–4 palabras: la imagen sigue a la vista."
                doDemo={<Live className="doc-w-full"><div className="doc-card-host"><ProjectCard project={P(3)} variant="compact" index={2} onClick={noop} /></div></Live>}
                dontText="Un título largo de varias líneas tapa la imagen y se corta en compacta."
                dontDemo={<Live className="doc-w-full"><div className="doc-card-host"><ProjectCard project={{ ...P(3), title: "Branding completo para una startup de biotecnología chilena en etapa semilla con presencia regional" }} variant="compact" index={2} onClick={noop} /></div></Live>}
              />
            </Rules>
          </Section>
        </> },
        { id: "estilo", label: "Estilo", content: <>
          <Section title="Anatomía">
            <Anatomy parts={[
              { n: 1, label: "Imagen", detail: "thumbnail del proyecto, object-fit cover", x: 50, y: 30 },
              { n: 2, label: "Número", detail: "índice en la galería", x: 16, y: 18 },
              { n: 3, label: "Métrica", detail: "CountUp al entrar en pantalla", x: 80, y: 18 },
              { n: 4, label: "Categoría", x: 20, y: 66 },
              { n: 5, label: "Título", x: 30, y: 76 },
              { n: 6, label: "Descripción, año y «Ver caso»", detail: "solo en destacada", x: 50, y: 88 },
            ]}>
              <Live className="doc-w-full"><div className="doc-card-host doc-card-host--featured"><ProjectCard project={P(2)} variant="featured" index={0} onClick={noop} /></div></Live>
            </Anatomy>
          </Section>
          <Section title="Estados">
            <StateMatrix
              states={[{ label: "Reposo" }, { label: "Hover", pseudo: "hover", note: "Inclinación 3D sigue al puntero" }, { label: "Foco", pseudo: "focus", note: "Anillo interior" }]}
              render={({ pseudo }) => <Live className="doc-w-full"><div className="doc-card-host"><ProjectCard project={P(2)} variant="compact" index={1} onClick={noop} /></div><PseudoOn sel=".p-card" pseudo={pseudo} /></Live>}
            />
          </Section>
        </> },
        { id: "contenido", label: "Contenido", content: (
          <Section title="Escribir la tarjeta">
            <div className="doc-table-wrap"><table className="doc-table">
              <thead><tr><th scope="col">Campo</th><th scope="col">Guía</th><th scope="col">Ejemplo</th></tr></thead>
              <tbody>
                <tr><td>Categoría</td><td>Disciplina, 1–2 palabras</td><td>Product design</td></tr>
                <tr><td>Título</td><td>Nombre del producto o resultado; ≤ 40 caracteres en compacta</td><td>App Finanzas Personales</td></tr>
                <tr><td>Métrica</td><td>Número + qué mide; el primer número se anima</td><td>12k usuarios / mes 1</td></tr>
                <tr><td>Descripción</td><td>1–2 frases, el problema y el cambio</td><td>{P(1).desc.slice(0, 80)}…</td></tr>
              </tbody>
            </table></div>
          </Section>
        ) },
        { id: "a11y", label: "Accesibilidad", content: (
          <Section title="Lista de chequeo">
            <A11yChecklist
              built={["Es un <a href> real: abrir en pestaña nueva y Ctrl+click funcionan.", "Nombre accesible «Ver proyecto: {título}».", "La métrica se anuncia con su valor final, nunca la cuenta intermedia.", "Foco visible pese al clip-path (anillo en ::after).", "Con movimiento reducido no hay inclinación ni morph."]}
              designer={["La imagen es decorativa (alt vacío): no pongas información solo en ella.", "Revisa que el texto blanco se lea sobre la parte baja de la imagen (hay un degradado, pero no hace milagros)."]}
            />
          </Section>
        ) },
        { id: "codigo", label: "Código", content: (
          <Section title="Uso">
            <Example code={`import { ProjectCard } from "@/components/portfolio/project-card"\n\n<div className="projects-bento">\n  {projects.map((p, i) => (\n    <ProjectCard key={p.id} project={p} index={i}\n      variant={i % 4 === 0 || i % 4 === 3 ? "featured" : "compact"}\n      onClick={() => router.push(\`/projects/\${p.id}\`)} />\n  ))}\n</div>`}>
              <Live className="doc-w-full"><div className="doc-card-host"><ProjectCard project={P(2)} variant="compact" index={1} onClick={noop} /></div></Live>
            </Example>
          </Section>
        ) },
      ]}
    />
  )
}

/** Aplica data-pseudo a un descendiente (para componentes que no reciben props de estado). */
function PseudoOn({ sel, pseudo }: { sel: string; pseudo?: string }) {
  return <span hidden ref={(el) => {
    const t = el?.parentElement?.querySelector(sel)
    if (!t) return
    if (pseudo) t.setAttribute("data-pseudo", pseudo)
    else t.removeAttribute("data-pseudo")
  }} />
}

/* ═══════════════════════════════ Formulario ═══════════════════════════════ */

function FloatField({ id, label, value, error, textarea, pseudo }: { id: string; label: string; value?: string; error?: string; textarea?: boolean; pseudo?: string }) {
  return (
    <div className="doc-demo-col">
      <div className={`fld${error ? " has-error" : ""}`} data-pseudo={pseudo}>
        {textarea
          ? <textarea id={id} className="ft" placeholder=" " rows={3} defaultValue={value} aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-e` : undefined} />
          : <input id={id} className="fi" placeholder=" " defaultValue={value} aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-e` : undefined} />}
        <label className="fl" htmlFor={id}>{label}</label>
      </div>
      {error && <p id={`${id}-e`} className="fld-error"><AlertIcon size={14} /> {error}</p>}
    </div>
  )
}

export function PageFormulario() {
  return (
    <DocPage
      eyebrow="Componentes del sitio"
      title="Formulario de contacto"
      status="estable"
      summary={<p>Campos con etiqueta flotante: la etiqueta vive dentro del campo y sube al escribir, sin desaparecer nunca. Validación al enviar, con el mensaje debajo de cada campo.</p>}
      tabs={[
        { id: "uso", label: "Uso", content: <>
          <Section title="Ejemplo">
            <Example>
              <form className="doc-demo-col doc-w-sm" onSubmit={(e) => e.preventDefault()}>
                <FloatField id="ds-f-name" label="Nombre completo *" />
                <FloatField id="ds-f-email" label="Email *" value={EMAIL} />
                <FloatField id="ds-f-msg" label="Cuéntame sobre tu proyecto… *" textarea />
                <button type="submit" className="fsub">Enviar mensaje <ArrowRightIcon className="btn-arrow" /></button>
              </form>
            </Example>
          </Section>
          <Section title="Reglas">
            <Rules>
              <UsageRule
                title="La etiqueta nunca desaparece"
                doText="Etiqueta flotante: al escribir sube y sigue visible."
                doDemo={<FloatField id="ds-r1" label="Email *" value={EMAIL} />}
                dontText="Placeholder como etiqueta: al escribir, ya no sabes qué campo era."
                dontDemo={<div className="doc-demo-col"><input className="fi doc-x-plain-input" placeholder="Email" defaultValue={EMAIL} aria-label="Email" /></div>}
              />
              <UsageRule
                title="El error va debajo del campo y dice cómo corregir"
                doText="Mensaje junto al campo, con ícono y una instrucción concreta."
                doDemo={<FloatField id="ds-r2" label="Email *" value="carlos@" error="Escribe un email válido, como nombre@dominio.com" />}
                dontText="«Campo inválido» arriba del formulario: no dice cuál ni qué hacer."
                dontDemo={<div className="doc-demo-col"><p className="fld-error">Campo inválido</p><FloatField id="ds-r2b" label="Nombre completo *" value="Carlos" /><FloatField id="ds-r2c" label="Email *" value="carlos@" /></div>}
              />
            </Rules>
          </Section>
        </> },
        { id: "estilo", label: "Estilo", content: <>
          <Section title="Estados del campo">
            <StateMatrix
              states={[{ label: "Vacío" }, { label: "Foco", pseudo: "focus" }, { label: "Con valor", extra: { value: "Carlos" } }, { label: "Error", extra: { value: "carlos@", error: "Email inválido" } }]}
              render={({ pseudo, extra }) => <FloatField id={`ds-s-${pseudo ?? ""}${String(extra?.value ?? "")}${extra?.error ? "e" : ""}`} label="Nombre" pseudo={pseudo} value={extra?.value as string} error={extra?.error as string} />}
            />
          </Section>
          <Section title="Estados del envío">
            <Variants items={[
              { name: "Reposo", desc: "Lista para enviar.", demo: <button type="button" className="fsub">Enviar mensaje <ArrowRightIcon className="btn-arrow" /></button> },
              { name: "Enviando", desc: "Etiqueta y spinner; deshabilitado.", demo: <button type="button" className="fsub" disabled aria-busy="true"><span className="fsub-spinner" aria-hidden="true" />Enviando…</button> },
              { name: "Enviado", desc: "Confirmación en el mismo botón.", demo: <button type="button" className="fsub ok">Mensaje enviado</button> },
              { name: "Error", desc: "Permite reintentar.", demo: <button type="button" className="fsub err">Reintentar envío</button> },
            ]} />
          </Section>
        </> },
        { id: "contenido", label: "Contenido", content: (
          <Section title="Mensajes de error">
            <div className="doc-table-wrap"><table className="doc-table">
              <thead><tr><th scope="col">Caso</th><th scope="col">Mensaje</th></tr></thead>
              <tbody>
                <tr><td>Nombre vacío</td><td>Escribe tu nombre</td></tr>
                <tr><td>Email inválido</td><td>Escribe un email válido, como nombre@dominio.com</td></tr>
                <tr><td>Mensaje vacío</td><td>Cuéntame en qué te puedo ayudar</td></tr>
                <tr><td>Falla el envío</td><td>No se pudo enviar. Reintenta o escríbeme a {EMAIL}</td></tr>
              </tbody>
            </table></div>
          </Section>
        ) },
        { id: "a11y", label: "Accesibilidad", content: (
          <Section title="Lista de chequeo">
            <A11yChecklist
              built={["<label for> en cada campo; autocomplete name/email.", "aria-invalid y aria-describedby apuntan al error.", "Al enviar con errores, el foco va al primer campo inválido.", "Éxito y error se anuncian (role status / alert)."]}
              designer={["Marca los obligatorios con * y explícalo una vez.", "No valides mientras la persona escribe el primer intento."]}
            />
          </Section>
        ) },
        { id: "codigo", label: "Código", content: (
          <Section title="Campo">
            <Example code={`<div className={\`fld\${error ? " has-error" : ""}\`}>\n  <input id="contact-email" className="fi" type="email" placeholder=" "\n    autoComplete="email" aria-invalid={!!error || undefined}\n    aria-describedby={error ? "contact-email-error" : undefined} />\n  <label className="fl" htmlFor="contact-email">Email *</label>\n</div>\n{error && <p id="contact-email-error" className="fld-error">{error}</p>}`}>
              <FloatField id="ds-code" label="Email *" />
            </Example>
          </Section>
        ) },
      ]}
    />
  )
}

/* ═══════════════════════════════ Navegación ═══════════════════════════════ */

export function PageNavegacion() {
  return (
    <DocPage
      eyebrow="Componentes del sitio"
      title="Navegación"
      status="estable"
      summary={<p>Barra superior en escritorio y tablet; barra inferior en móvil (≤ 640px), al alcance del pulgar. Un indicador en píldora se desliza hasta la sección activa.</p>}
      tabs={[
        { id: "uso", label: "Uso", content: <>
          <Section title="Escritorio">
            <Capture id="nav-desktop" alt="Barra de navegación superior del portafolio con logo, secciones, selector de tema y botón Perfil" ratio="1440 / 120" />
          </Section>
          <Section title="Móvil">
            <div className="doc-captures">
              <Capture id="nav-mobile" alt="Barra de navegación inferior en móvil con íconos y etiquetas" ratio="390 / 200" />
              <Prose><p>Cinco destinos como máximo, siempre con ícono <strong>y</strong> etiqueta. El activo se marca con color y con aria-current, no solo con color.</p></Prose>
            </div>
          </Section>
          <Section title="Reglas">
            <Rules>
              <UsageRule
                title="Ícono y etiqueta en la barra inferior"
                doText="Ícono + palabra: se entiende al primer vistazo."
                doDemo={<div className="doc-x-tabbar"><span className="doc-x-tab is-active"><ArrowRightIcon />Inicio</span><span className="doc-x-tab"><ArrowRightIcon />Trabajos</span><span className="doc-x-tab"><ArrowRightIcon />Contacto</span></div>}
                dontText="Solo íconos: obliga a adivinar qué es cada uno."
                dontDemo={<div className="doc-x-tabbar"><span className="doc-x-tab is-active"><ArrowRightIcon /></span><span className="doc-x-tab"><ArrowRightIcon /></span><span className="doc-x-tab"><ArrowRightIcon /></span></div>}
              />
              <UsageRule
                title="Máximo cinco destinos"
                doText="Cinco o menos: cada destino mide al menos 64px de ancho."
                doDemo={<div className="doc-x-tabbar">{["Trabajos", "Sobre mí", "Contacto", "Blog", "Zero DS"].map((l, i) => <span key={l} className={`doc-x-tab${i === 0 ? " is-active" : ""}`}><ArrowRightIcon />{l}</span>)}</div>}
                dontText="Siete destinos se aprietan y los objetivos táctiles quedan chicos."
                dontDemo={<div className="doc-x-tabbar">{["Trabajos", "Sobre mí", "Contacto", "Blog", "Zero DS", "CV", "Perfil"].map((l, i) => <span key={l} className={`doc-x-tab doc-x-tab--tight${i === 0 ? " is-active" : ""}`}><ArrowRightIcon />{l}</span>)}</div>}
              />
            </Rules>
          </Section>
        </> },
        { id: "estilo", label: "Estilo", content: <>
          <Section title="Ítems">
            <StateMatrix
              states={[{ label: "Reposo" }, { label: "Hover", pseudo: "hover" }, { label: "Foco", pseudo: "focus" }, { label: "Activo", extra: { active: true } }]}
              render={({ pseudo, extra }) => <button type="button" className={`nav-item${extra?.active ? " active" : ""}`} data-pseudo={pseudo}>Trabajos</button>}
            />
          </Section>
          <Section title="Por breakpoint" intro={<p>Seis destinos, el logo, el tema y una acción tienen que caber sin cortarse. La barra se compacta en este orden antes de pasar a la barra inferior.</p>}>
            <div className="doc-table-wrap"><table className="doc-table">
              <thead><tr><th scope="col">Ancho</th><th scope="col">Cambio</th></tr></thead>
              <tbody>
                <tr><td><code>&gt; 1180px</code></td><td>Todo visible: «Zero design system» con su nombre completo.</td></tr>
                <tr><td><code>≤ 1180px</code></td><td>«Zero design system» se abrevia a «Zero DS».</td></tr>
                <tr><td><code>641 – 960px</code></td><td>Padding horizontal de los ítems a 8px.</td></tr>
                <tr><td><code>641 – 820px</code></td><td>Se oculta «Home»: el logo lleva al inicio.</td></tr>
                <tr><td><code>641 – 760px</code></td><td>Márgenes de la barra a 16px, ítems a 6px.</td></tr>
                <tr><td><code>641 – 700px</code></td><td>«← Portafolio» queda solo como flecha (con aria-label).</td></tr>
                <tr><td><code>≤ 640px</code></td><td>Barra inferior con 5 destinos: Trabajos, Sobre mí, Contacto, Blog y Zero DS.</td></tr>
              </tbody>
            </table></div>
          </Section>
        </> },
        { id: "a11y", label: "Accesibilidad", content: (
          <Section title="Lista de chequeo">
            <A11yChecklist
              built={["<nav> con aria-label; aria-current=\"page\" en el activo.", "El logo es un botón «Project Zero — Inicio».", "La barra inferior respeta el área segura del iPhone."]}
              designer={["Mantén el mismo orden de destinos en móvil y escritorio.", "No escondas destinos detrás de un menú si caben cinco."]}
            />
          </Section>
        ) },
      ]}
    />
  )
}

/* ═══════════════════════════════ Selector de tema ═══════════════════════════════ */

export function PageToggleTema() {
  return (
    <DocPage
      eyebrow="Componentes del sitio"
      title="Selector de tema"
      status="estable"
      summary={<p>Dos botones, claro y oscuro, en un grupo. El cambio se revela en círculo desde el botón presionado. Respeta la preferencia del sistema hasta que la persona elige.</p>}
      tabs={[
        { id: "uso", label: "Uso", content: <>
          <Section title="Ejemplo" intro={<p>Es el componente real: cambia el tema de toda la página.</p>}>
            <Example><ThemeToggle /></Example>
          </Section>
          <Section title="Reglas">
            <Rules>
              <UsageRule
                title="Dos opciones visibles"
                doText="Sol y luna a la vista: se ve el estado actual y la alternativa."
                doDemo={<ThemeToggle />}
                dontText="Un solo ícono que alterna no deja claro si muestra el estado o la acción."
                dontDemo={<span className="theme-toggle"><span className="theme-toggle-btn active"><MoonGlyph /></span></span>}
              />
            </Rules>
          </Section>
        </> },
        { id: "a11y", label: "Accesibilidad", content: (
          <Section title="Lista de chequeo">
            <A11yChecklist
              built={["role=\"group\" «Modo de color»; cada botón con aria-label y aria-pressed.", "Con movimiento reducido, el cambio es instantáneo."]}
              designer={["Ubícalo siempre en el mismo lugar (barra superior)."]}
            />
          </Section>
        ) },
        { id: "codigo", label: "Código", content: (
          <Section title="Uso">
            <Example code={`import { ThemeToggle } from "@/components/portfolio/app-navbar"\n\n<ThemeToggle />`}><ThemeToggle /></Example>
          </Section>
        ) },
      ]}
    />
  )
}

function MoonGlyph() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
}

/* ═══════════════════════════════ Etiquetas ═══════════════════════════════ */

export function PageEtiquetas() {
  return (
    <DocPage
      eyebrow="Componentes del sitio"
      title="Etiquetas e insignias"
      status="estable"
      summary={<p>Piezas cortas que clasifican o señalan estado: habilidades de un proyecto, filtros del blog y la insignia de disponibilidad.</p>}
      tabs={[
        { id: "uso", label: "Uso", content: <>
          <Section title="Variantes">
            <Variants items={[
              { name: "Habilidad", desc: "Herramientas y disciplinas. Solo lectura.", demo: <div className="skills-wrap">{P(1).tags.slice(0, 3).map((t) => <span key={t} className="skill-tag">{t}</span>)}</div> },
              { name: "Filtro", desc: "Píldoras del blog: una activa a la vez.", demo: <div className="blog-pills"><button type="button" className="blog-pill active">Todos</button><button type="button" className="blog-pill">Diseño</button><button type="button" className="blog-pill">IA</button></div> },
              { name: "Disponibilidad", desc: "Estado con punto que late.", demo: <div className="contact-avail"><span className="avail-dot" />Disponible 2026</div> },
              { name: "Categoría del detalle", desc: "Disciplina y año del proyecto.", demo: <div className="detail-tags"><span className="detail-tag-primary">{P(1).category}</span><span className="detail-tag-year">{P(1).year}</span></div> },
            ]} />
          </Section>
          <Section title="Reglas">
            <Rules>
              <UsageRule
                title="Pocas y cortas"
                doText="3 a 5 etiquetas de una o dos palabras."
                doDemo={<div className="skills-wrap">{["Figma", "User Research", "Design System"].map((t) => <span key={t} className="skill-tag">{t}</span>)}</div>}
                dontText="Diez etiquetas se leen como ruido y ninguna destaca."
                dontDemo={<div className="skills-wrap">{["Figma", "User Research", "Prototyping", "Design System", "A/B Testing", "Miro", "Notion", "Jira", "Workshops", "Copywriting"].map((t) => <span key={t} className="skill-tag">{t}</span>)}</div>}
              />
              <UsageRule
                title="Si filtra, es un botón"
                doText="Las píldoras de filtro son botones con estado presionado."
                doDemo={<div className="blog-pills"><button type="button" className="blog-pill active" aria-pressed="true">Todos</button><button type="button" className="blog-pill" aria-pressed="false">Diseño</button></div>}
                dontText="Usar la etiqueta de habilidad como filtro: no parece tocable ni muestra cuál está activa."
                dontDemo={<div className="skills-wrap"><span className="skill-tag">Todos</span><span className="skill-tag">Diseño</span></div>}
              />
            </Rules>
          </Section>
        </> },
        { id: "estilo", label: "Estilo", content: (
          <Section title="Estados del filtro">
            <StateMatrix
              states={[{ label: "Reposo" }, { label: "Hover", pseudo: "hover" }, { label: "Foco", pseudo: "focus" }, { label: "Activo", extra: { active: true } }]}
              render={({ pseudo, extra }) => <button type="button" className={`blog-pill${extra?.active ? " active" : ""}`} data-pseudo={pseudo}>Diseño</button>}
            />
          </Section>
        ) },
        { id: "a11y", label: "Accesibilidad", content: (
          <Section title="Lista de chequeo">
            <A11yChecklist
              built={["El punto de disponibilidad es decorativo; el texto dice el estado.", "Las píldoras de filtro son <button>."]}
              designer={["No uses color como única diferencia entre etiquetas."]}
            />
          </Section>
        ) },
      ]}
    />
  )
}

/* ═══════════════════════════════ CTA de cierre ═══════════════════════════════ */

export function PageCtaCierre() {
  return (
    <DocPage
      eyebrow="Componentes del sitio"
      title="Llamado a la acción de cierre"
      status="nuevo"
      summary={<p>La banda final de la página de inicio: una pregunta, una promesa de respuesta y dos caminos — escribir o copiar el email. El brillo sigue al puntero y el botón es magnético.</p>}
      tabs={[
        { id: "uso", label: "Uso", content: <>
          <Section title="Ejemplo" intro={<p>Componente real. «Copiar email» copia de verdad.</p>}>
            <Example pad="sm" align="stretch"><ClosingCta email={EMAIL} onNavigateContact={noop} /></Example>
          </Section>
          <Section title="Reglas">
            <Rules>
              <UsageRule
                title="Una pregunta, una acción"
                doText="Titular en pregunta, una línea de respuesta, un primario."
                doDemo={<div className="doc-demo-col doc-x-center"><h4 className="doc-type--display doc-x-h3">¿Tienes un proyecto en mente?</h4><p className="doc-demo-text">Te respondo en menos de 24 horas.</p><div className="doc-demo-row"><button type="button" className="btn-p">Trabajemos juntos <ArrowRightIcon className="btn-arrow" /></button></div></div>}
                dontText="Varias acciones del mismo peso diluyen el cierre."
                dontDemo={<div className="doc-demo-col doc-x-center"><h4 className="doc-type--display doc-x-h3">Contacto</h4><div className="doc-demo-row"><button type="button" className="btn-p">Escríbeme</button><button type="button" className="btn-p">LinkedIn</button><button type="button" className="btn-p">CV</button></div></div>}
              />
            </Rules>
          </Section>
        </> },
        { id: "contenido", label: "Contenido", content: (
          <Section title="Escribir el cierre">
            <Prose><ul><li>Titular en pregunta, en segunda persona.</li><li>Bajada con una promesa concreta y cumplible (el tiempo de respuesta).</li><li>El email se muestra completo: es contenido, no solo una acción.</li></ul></Prose>
          </Section>
        ) },
        { id: "a11y", label: "Accesibilidad", content: (
          <Section title="Lista de chequeo">
            <A11yChecklist
              built={["section con aria-labelledby al titular.", "«Copiar email» anuncia «Email copiado» (aria-live).", "Sin permiso de portapapeles, abre el cliente de correo.", "El efecto magnético y el brillo solo con mouse."]}
              designer={["El fondo con brillo debe mantener el contraste del titular en ambos temas."]}
            />
          </Section>
        ) },
      ]}
    />
  )
}

/* ═══════════════════════════════ Contador ═══════════════════════════════ */

export function PageContador() {
  return (
    <DocPage
      eyebrow="Componentes del sitio"
      title="Contador animado"
      status="nuevo"
      summary={<p>Cuenta desde cero el primer número de un texto la primera vez que entra en pantalla. Conserva prefijos, sufijos y decimales: «Funding $2.4M seed» cuenta de 0.0 a 2.4.</p>}
      tabs={[
        { id: "uso", label: "Uso", content: <>
          <Section title="Ejemplos" intro={<p>Métricas reales de los proyectos.</p>}>
            <Example><div className="doc-demo-row">{PROJECTS.map((p) => <span key={p.id} className="p-stat doc-x-stat"><CountUp text={p.stat} /></span>)}</div></Example>
          </Section>
          <Section title="Reglas">
            <Rules>
              <UsageRule
                title="Para métricas de impacto"
                doText="Un número que importa, una vez, al aparecer."
                doDemo={<span className="p-stat doc-x-stat"><CountUp text="+34% conversión" /></span>}
                dontText="Animar números que no son logros (año, teléfono) distrae."
                dontDemo={<span className="p-stat doc-x-stat">© 2026</span>}
              />
            </Rules>
          </Section>
        </> },
        { id: "a11y", label: "Accesibilidad", content: (
          <Section title="Lista de chequeo">
            <A11yChecklist
              built={["Lectores de pantalla leen el valor final (aria-label).", "El ancho no salta: una copia invisible fija la caja.", "Con movimiento reducido o sin JS, muestra el texto final."]}
              designer={["El texto debe tener sentido sin la animación."]}
            />
          </Section>
        ) },
        { id: "codigo", label: "Código", content: (
          <Section title="Uso">
            <Example code={`import { CountUp } from "@/components/portfolio/count-up"\n\n<CountUp text="Funding $2.4M seed" duration={700} />`}><span className="p-stat doc-x-stat"><CountUp text="Funding $2.4M seed" /></span></Example>
          </Section>
        ) },
      ]}
    />
  )
}

/* ═══════════════════════════════ Skeleton ═══════════════════════════════ */

export function PageSkeleton() {
  return (
    <DocPage
      eyebrow="Componentes del sitio"
      title="Esqueleto de carga"
      status="estable"
      summary={<p>Muestra la forma del contenido mientras carga. Tiene las mismas medidas que lo que reemplaza, así nada salta cuando llega.</p>}
      tabs={[
        { id: "uso", label: "Uso", content: <>
          <Section title="Reglas">
            <Rules>
              <UsageRule
                title="Misma forma que el contenido"
                doText="Imagen, categoría, título y extracto en su lugar y tamaño."
                doDemo={<div className="blog-preview-card skeleton-card doc-w-card" aria-hidden="true"><div className="blog-preview-img skeleton" /><div className="blog-preview-body"><div className="skeleton skeleton-line doc-x-w30" /><div className="skeleton skeleton-line skeleton-line--lg doc-x-w85" /><div className="skeleton skeleton-line doc-x-w95" /></div></div>}
                dontText="Un spinner en el centro: al cargar, todo el layout se mueve."
                dontDemo={<div className="doc-x-spinbox"><span className="blog-spinner" /></div>}
              />
            </Rules>
          </Section>
        </> },
        { id: "a11y", label: "Accesibilidad", content: (
          <Section title="Lista de chequeo">
            <A11yChecklist
              built={["Los bloques son aria-hidden; el contenedor anuncia aria-busy.", "El brillo se detiene con movimiento reducido."]}
              designer={["Si la carga tarda más de 10 segundos, explica qué pasa."]}
            />
          </Section>
        ) },
      ]}
    />
  )
}

/* ═══════════════════════════════ Lightbox ═══════════════════════════════ */

const LB_ITEMS: GalleryItem[] = (() => {
  const p = PROJECTS.find((x) => (x.gallery ?? []).some(Boolean)) ?? PROJECTS[0]
  const labels = ["Vista general", "Vista móvil", "Sistema de componentes"]
  const types: GalleryItem["placeholderType"][] = ["desktop", "mobile", "components"]
  return labels.map((label, i) => ({
    id: i + 1,
    src: p.gallery?.[i] || undefined,
    label: p.gallery?.[i] ? `Imagen ${i + 1}` : label,
    gradient: p.gradient,
    accent: p.accentColor,
    placeholderType: types[i],
  }))
})()

/** El componente real, con tres miniaturas como origen del morph. */
function LightboxDemo() {
  const [open, setOpen] = useState<number | null>(null)
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const getOrigin = useCallback((i: number) => refs.current[i] ?? null, [])
  const onClose = useCallback(() => setOpen(null), [])
  return (
    <>
      <div className="detail-gallery-grid doc-x-lb-grid">
        {LB_ITEMS.map((item, i) => (
          <button
            key={item.id}
            ref={(n) => { refs.current[i] = n }}
            type="button"
            className="detail-gallery-item"
            style={{ position: "relative", overflow: "hidden" }}
            aria-haspopup="dialog"
            aria-label={`Ver ${item.label}`}
            onClick={() => setOpen(i)}
          >
            {item.src
              ? <img src={item.src} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              : <GalleryPlaceholder item={item} />}
          </button>
        ))}
      </div>
      {open !== null && (
        <Lightbox items={LB_ITEMS} startIndex={open} title="Proyecto de ejemplo" getOrigin={getOrigin} onClose={onClose} />
      )}
    </>
  )
}

export function PageLightbox() {
  return (
    <DocPage
      eyebrow="Componentes del sitio"
      title="Lightbox"
      status="nuevo"
      summary={<p>Muestra las imágenes de la galería de un proyecto a pantalla completa. La imagen crece desde su miniatura y, al cerrar, vuelve a la miniatura de la imagen que estabas viendo. Siempre es oscuro, en los dos temas: la imagen manda.</p>}
      tabs={[
        { id: "uso", label: "Uso", content: <>
          <Section title="Pruébalo" intro={<p>Toca una miniatura. Usa las flechas, la tira, el teclado (← → Inicio Fin Esc) o arrastra: de lado para cambiar, hacia abajo para cerrar.</p>}>
            <Example align="stretch"><LightboxDemo /></Example>
          </Section>
          <Section title="Cuándo usarlo">
            <WhenToUse
              use={["Para ver en grande las imágenes de una galería sin salir de la página.", "Cuando hay varias imágenes que recorrer en orden o comparar."]}
              avoid={[
                { text: "Para mostrar texto, formularios o confirmaciones", instead: <PageLink to="confirmacion">un diálogo de confirmación</PageLink> },
                { text: "Para la imagen principal de un caso", instead: "la imagen 16:10 del detalle, que ya se ve grande" },
              ]}
            />
          </Section>
          <Section title="Reglas">
            <Rules>
              <UsageRule
                title="Las flechas, donde se buscan"
                doText="Con mouse: a los costados de la imagen, a media altura, siempre visibles y con un canal entero clickeable."
                doDemo={<div className="doc-x-lb-chrome doc-x-lb-chrome--sides"><span className="doc-x-lb-side" aria-hidden="true">‹</span><span className="doc-x-lb-frame" /><span className="doc-x-lb-side" aria-hidden="true">›</span></div>}
                dontText="Juntarlas abajo con la tira: quedan lejos de la imagen y el ojo no las encuentra (así fue la primera versión)."
                dontDemo={<div className="doc-x-lb-chrome doc-x-lb-chrome--col"><span className="doc-x-lb-frame" /><span className="doc-x-lb-row"><span className="doc-x-lb-mini" aria-hidden="true">‹</span><span className="doc-x-lb-strip"><i /><i data-on="" /><i /></span><span className="doc-x-lb-mini" aria-hidden="true">›</span></span></div>}
              />
              <UsageRule
                title="El gesto se insinúa, no se esconde"
                doText="En táctil: flechas abajo, al alcance del pulgar, y la primera vez la imagen se asoma hacia la siguiente."
                doDemo={<div className="doc-x-lb-chrome"><span className="doc-x-lb-frame doc-x-lb-frame--peek" /><span className="doc-x-lb-frame doc-x-lb-frame--next" /></div>}
                dontText="Solo deslizar, sin flechas ni pista: nadie sabe que existe, y los puntos de 8 px no se pueden tocar."
                dontDemo={<div className="doc-x-lb-chrome"><span className="doc-x-lb-dots"><i /><i data-on="" /><i /></span></div>}
              />
              <UsageRule
                title="Lado a lado, nunca encima"
                doText="Al cambiar, las dos imágenes viajan juntas en una pista, con un hueco entre ellas: se entiende de dónde viene la siguiente."
                doDemo={<div className="doc-x-lb-chrome"><span className="doc-x-lb-frame doc-x-lb-frame--out" /><span className="doc-x-lb-frame doc-x-lb-frame--next doc-x-lb-frame--in" /></div>}
                dontText="Fundir las dos encima: por un instante se ven dos imágenes mezcladas."
                dontDemo={<div className="doc-x-lb-chrome"><span className="doc-x-lb-frame" /><span className="doc-x-lb-frame doc-x-lb-frame--ghost" /></div>}
              />
            </Rules>
          </Section>
        </> },
        { id: "estilo", label: "Estilo", content: <>
          <Section title="Estructura">
            <Prose>
              <ul>
                <li><strong>Barra superior:</strong> contador «02 / 06» con números tabulares, proyecto · nombre de la imagen y el botón cerrar.</li>
                <li><strong>Escenario:</strong> la imagen a su proporción real, del mayor tamaño que entre. Tocar arriba o abajo de ella cierra.</li>
                <li><strong>Flechas laterales (mouse):</strong> círculos de 56 px a media altura, cada uno en un canal de 96 px que es entero clickeable. La imagen nunca queda debajo.</li>
                <li><strong>Barra inferior:</strong> tira de miniaturas (la actual con anillo blanco). En táctil, además, las flechas de anterior y siguiente a los lados de la tira, al alcance del pulgar.</li>
              </ul>
            </Prose>
          </Section>
          <Section title="Tokens">
            <TokenTable rows={[
              { token: "--lightbox-scrim", role: "Fondo: casi negro, con el matiz navy del modo oscuro", swatch: true },
              { token: "--lightbox-scrim-blur", role: "Desenfoque del fondo: el texto de la página no se lee a través" },
              { token: "--lightbox-fg", role: "Texto e íconos", swatch: true },
              { token: "--lightbox-fg-2", role: "Texto secundario (total del contador, proyecto)", swatch: true },
              { token: "--lightbox-control-bg", role: "Fondo de los botones", swatch: true },
              { token: "--lightbox-control-bg-h", role: "Fondo de los botones con el cursor encima", swatch: true },
              { token: "--lightbox-control-size", role: "Botones y alto del área táctil de las miniaturas" },
              { token: "--lightbox-focus", role: "Anillo de foco", swatch: true },
              { token: "--lightbox-frame-radius", role: "Radio de la imagen (igual al de la miniatura)" },
              { token: "--lightbox-frame-shadow", role: "Sombra de la imagen" },
              { token: "--lightbox-thumb-w", role: "Ancho de la miniatura en la tira (tope en móvil)" },
              { token: "--lightbox-thumb-radius", role: "Radio de la miniatura en la tira" },
              { token: "--lightbox-nav-size", role: "Flechas laterales (mouse)" },
              { token: "--lightbox-nav-gutter", role: "Canal clickeable a cada lado de la imagen" },
              { token: "--lightbox-nav-bg", role: "Fondo de las flechas laterales: más presente que los demás controles", swatch: true },
              { token: "--lightbox-nav-border", role: "Borde de las flechas laterales", swatch: true },
            ]} />
          </Section>
          <Section title="Contraste" intro={<p>Medido sobre el fondo ya compuesto (#06070c).</p>}>
            <ContrastTable pairs={[
              { label: "Texto", fg: "#ebebec", bg: "#06070c" },
              { label: "Texto secundario", fg: "#a5a6a7", bg: "#06070c" },
              { label: "Anillo de foco", fg: "--lightbox-focus", bg: "#06070c", large: true },
            ]} />
          </Section>
        </> },
        { id: "movimiento", label: "Movimiento", content: <>
          <Section title="Coreografía" intro={<p>Todo sale de los tokens de movimiento. El frame lo anima JS (Web Animations) y el estado nunca depende de que una animación termine.</p>}>
            <TokenTable rows={[
              { token: "--dur-reveal", role: "Abrir: la imagen crece desde la miniatura (ease-out)" },
              { token: "--dur-exit-lg", role: "Cerrar: vuelve a la miniatura actual, ~65% de abrir (ease-out: llega a un lugar)" },
              { token: "--lightbox-slide-duration", role: "Cambiar: la pista recorre una pantalla (ease-out, arranca al instante del clic)" },
              { token: "--lightbox-slide-gap", role: "Cambiar: hueco entre la imagen que sale y la que entra" },
              { token: "--dur-exit", role: "Cambiar con movimiento reducido: se apaga la actual (ease-in)" },
              { token: "--dur-enter", role: "Cambiar con movimiento reducido: aparece la siguiente, después (ease-out)" },
              { token: "--lightbox-chrome-delay", role: "Las barras entran cuando la imagen ya va en camino" },
              { token: "--lightbox-swipe-distance", role: "Arrastre horizontal que cambia de imagen" },
              { token: "--lightbox-dismiss-distance", role: "Arrastre hacia abajo que cierra" },
              { token: "--lightbox-flick-velocity", role: "Velocidad (px/ms) que cuenta como gesto aunque sea corto" },
              { token: "--lightbox-peek-distance", role: "Pista de deslizar: cuánto se asoma la imagen (táctil, 1.ª vez por sesión)" },
              { token: "--lightbox-peek-duration", role: "Pista de deslizar: ida y vuelta" },
              { token: "--lightbox-peek-delay", role: "Pista de deslizar: espera después de abrir" },
            ]} />
          </Section>
          <Section title="Reglas">
            <Prose>
              <ul>
                <li><strong>Desde el origen:</strong> el morph usa transform + clip-path, así el recorte de la miniatura se abre hasta la imagen completa sin deformarla.</li>
                <li><strong>Una pista para todo:</strong> flechas, teclado, tira y arrastre mueven la misma pista. Al arrastrar, la vecina asoma desde el borde y sigue al dedo; al soltar, la pista termina el recorrido desde ahí.</li>
                <li><strong>Interrumpible:</strong> un clic o tecla durante un cambio lo lleva al final al instante y sigue con el nuevo.</li>
                <li><strong>El gesto sigue al dedo</strong> en tiempo real; si no pasa el umbral, todo vuelve a su lugar.</li>
                <li><strong>Pista de deslizar:</strong> en táctil, la primera vez por sesión, la imagen se asoma hacia la siguiente y vuelve. Cualquier toque la corta.</li>
                <li><strong>Movimiento reducido:</strong> sin morph, pista ni pista de deslizar; solo fundidos, uno después del otro.</li>
              </ul>
            </Prose>
          </Section>
        </> },
        { id: "a11y", label: "Accesibilidad", content: (
          <Section title="Lista de chequeo">
            <A11yChecklist
              built={[
                "Diálogo modal (Radix): foco atrapado, scroll bloqueado, Esc cierra.",
                "Al cerrar, el foco vuelve a la miniatura de la imagen que estabas viendo.",
                "← → cambian de imagen; Inicio y Fin van a la primera y a la última.",
                "Cada cambio se anuncia: «Imagen 3 de 6: Vista móvil» (role=status).",
                "Todo gesto tiene alternativa visible: flechas, tira y cerrar.",
                "Controles de 44 px de alto con anillo de foco de ~6.7:1.",
                "El zoom con dos dedos del navegador no se bloquea.",
              ]}
              designer={["Las imágenes se ven a su proporción real y sin agrandarse: súbelas con al menos 1600 px de ancho."]}
            />
          </Section>
        ) },
        { id: "codigo", label: "Código", content: (
          <Section title="Uso">
            <Example code={`import { Lightbox } from "@/components/portfolio/lightbox"

// Las miniaturas son el origen y el destino del morph.
const thumbs = useRef<(HTMLButtonElement | null)[]>([])
const [open, setOpen] = useState<number | null>(null)

{open !== null && (
  <Lightbox
    items={galleryItems}
    startIndex={open}
    title={project.title}
    getOrigin={(i) => thumbs.current[i] ?? null}
    onClose={() => setOpen(null)}
  />
)}`}><LightboxDemo /></Example>
          </Section>
        ) },
      ]}
    />
  )
}

