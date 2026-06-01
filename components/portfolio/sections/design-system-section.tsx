"use client"

import { useState } from "react"
import { useTheme } from "@/lib/context/theme-context"
import { EmailIcon } from "../icons"

// ── Types ────────────────────────────────────────────────────────────────────
type DSPageId =
  | "overview" | "colors" | "typography"
  | "buttons" | "cards" | "forms" | "navigation" | "badges" | "toast" | "patterns" | "brands"

const DS_GROUPS: { label: string; items: { id: DSPageId; label: string }[] }[] = [
  {
    label: "Fundamentos",
    items: [
      { id: "overview", label: "Overview" },
      { id: "colors", label: "Colores" },
      { id: "typography", label: "Tipografía" },
    ],
  },
  {
    label: "Componentes",
    items: [
      { id: "buttons", label: "Botones" },
      { id: "cards", label: "Tarjetas" },
      { id: "forms", label: "Formularios" },
      { id: "navigation", label: "Navegación" },
      { id: "badges", label: "Badges & Tags" },
      { id: "toast", label: "Toast" },
    ],
  },
  {
    label: "Patrones",
    items: [
      { id: "patterns", label: "Layouts" },
      { id: "brands",   label: "Brands Section" },
    ],
  },
]

// ── Shared sub-components ─────────────────────────────────────────────────────

function SectionHeading({ title }: { title: string }) {
  return <h3 className="ds-section-heading">{title}</h3>
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <div className="ds-code-block">
      <button className="ds-copy-btn" onClick={copy} aria-label="Copiar código">
        {copied ? "✓ Copiado" : "Copiar"}
      </button>
      <pre><code>{code}</code></pre>
    </div>
  )
}

function PreviewBox({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="ds-preview-wrap">
      {label && <div className="ds-preview-label">{label}</div>}
      <div className="ds-preview">
        <div className="ds-preview-content">{children}</div>
      </div>
    </div>
  )
}

function RuleChip({ rule, variant = "default" }: { rule: string; variant?: "do" | "dont" | "default" }) {
  return (
    <div className={`ds-rule ds-rule--${variant}`}>
      {variant === "do" && <span className="ds-rule-icon ds-rule-icon--do">✓</span>}
      {variant === "dont" && <span className="ds-rule-icon ds-rule-icon--dont">✗</span>}
      <span>{rule}</span>
    </div>
  )
}

// ── Page: Overview ────────────────────────────────────────────────────────────
function PageOverview() {
  return (
    <div className="ds-page-body">
      <div className="ds-page-header">
        <div className="ds-page-badge">v1.3</div>
        <h2 className="ds-page-title">Project Zero Design System</h2>
        <p className="ds-page-desc">
          Sistema de diseño del portafolio de <strong>Carlos Felipe Rojas Hickmann</strong>. Arquitectura de tokens de 3 capas
          (Primitivos → Semánticos → Componentes), construido sobre Next.js 16 + React 19 + CSS Variables.
          Todos los componentes son dark-mode ready y accesibles WCAG AA.
        </p>
      </div>

      <div className="ds-overview-grid">
        {[
          { label: "Tokens", value: "70+", desc: "Variables CSS documentadas" },
          { label: "Componentes", value: "13", desc: "UI components en el sistema" },
          { label: "WCAG", value: "AA", desc: "Nivel de accesibilidad mínimo" },
          { label: "Modos", value: "2", desc: "Light & Dark mode" },
        ].map(({ label, value, desc }) => (
          <div className="ds-overview-card" key={label}>
            <div className="ds-overview-value">{value}</div>
            <div className="ds-overview-label">{label}</div>
            <div className="ds-overview-desc">{desc}</div>
          </div>
        ))}
      </div>

      <SectionHeading title="Principios" />
      <div className="ds-principles">
        {[
          { icon: "◎", title: "Token-first", desc: "Ningún valor hex hardcodeado en componentes. Todo referencia variables CSS semánticas." },
          { icon: "◐", title: "Dark-mode nativo", desc: "Los tokens semánticos cambian con la clase .dark en el root. No hay dos sistemas paralelos." },
          { icon: "✦", title: "Accesible por defecto", desc: "Contraste WCAG AA, focus-visible en todos los interactivos, aria-labels en iconos icon-only." },
          { icon: "▷", title: "Motion con intención", desc: "Cada animación comunica causa-efecto. prefers-reduced-motion siempre respetado sin excepción." },
        ].map(({ icon, title, desc }) => (
          <div className="ds-principle-card" key={title}>
            <div className="ds-principle-icon">{icon}</div>
            <div className="ds-principle-title">{title}</div>
            <div className="ds-principle-desc">{desc}</div>
          </div>
        ))}
      </div>

      <SectionHeading title="Arquitectura de tokens" />
      <div className="ds-arch-rows">
        {[
          { layer: "Primitivo", example: "--primitive-color-blue-400: #2997ff", desc: "Valores raw. No se usan directamente en componentes." },
          { layer: "Semántico", example: "--accent: #0062cc / dark: #2997ff", desc: "Aliases con propósito. Cambian entre temas." },
          { layer: "Componente", example: "--btn-primary-bg: var(--accent)", desc: "Tokens específicos de componente. Soportan override." },
        ].map(({ layer, example, desc }) => (
          <div className="ds-arch-row" key={layer}>
            <div className="ds-arch-layer">{layer}</div>
            <div className="ds-arch-example"><code>{example}</code></div>
            <div className="ds-arch-desc">{desc}</div>
          </div>
        ))}
      </div>

      <SectionHeading title="Stack técnico" />
      <div className="ds-stack-row">
        {["Next.js 16", "React 19", "TypeScript 5.7", "CSS Variables", "Tailwind v4", "DM Sans", "Plus Jakarta Sans", "WebGL / GLSL"].map(t => (
          <span className="ds-stack-tag" key={t}>{t}</span>
        ))}
      </div>
    </div>
  )
}

// ── Page: Colors ──────────────────────────────────────────────────────────────
function PageColors() {
  const { isDark } = useTheme()
  const COLOR_TOKENS = [
    {
      group: "Fondos", tokens: [
        { name: "--bg", light: "#f8f8f8", dark: "#000000", usage: "Fondo base de la app" },
        { name: "--bg2", light: "#ffffff", dark: "#0a0a0a", usage: "Fondo de tarjetas y superficies elevadas" },
        { name: "--bg3", light: "#f0f0f0", dark: "#141414", usage: "Fondo de tercer nivel, hover, inputs" },
      ],
    },
    {
      group: "Texto", tokens: [
        { name: "--txt", light: "#1d1d1f", dark: "#f5f5f7", usage: "Texto primario — headings y body" },
        { name: "--txt2", light: "#3a3a40", dark: "#b0b0b5", usage: "Texto secundario — subtítulos, labels" },
        { name: "--txt3", light: "#5e5e64", dark: "#8e8e93", usage: "Texto terciario — placeholders, captions" },
      ],
    },
    {
      group: "Acento", tokens: [
        { name: "--accent", light: "#0062cc", dark: "#2997ff", usage: "Color de marca — CTAs, links activos" },
        { name: "--accent-h", light: "#1a7fd4", dark: "#5ac8fa", usage: "Estado hover del acento" },
      ],
    },
    {
      group: "Feedback", tokens: [
        { name: "--success", light: "#30d158", dark: "#30d158", usage: "Éxito, disponibilidad, confirmación" },
        { name: "--warning", light: "#f59e0b", dark: "#f59e0b", usage: "Advertencia, acciones destructivas — toast warning" },
        { name: "--error", light: "#ef4444", dark: "#ef4444", usage: "Error, formularios inválidos — toast error" },
      ],
    },
    {
      group: "Bordes y superficies", tokens: [
        { name: "--border", light: "rgba(0,0,0,0.08)", dark: "rgba(255,255,255,0.11)", usage: "Borde de componentes en reposo" },
        { name: "--border-h", light: "rgba(0,0,0,0.18)", dark: "rgba(255,255,255,0.18)", usage: "Borde en hover" },
        { name: "--glass", light: "rgba(0,0,0,0.03)", dark: "rgba(255,255,255,0.04)", usage: "Superficie glass mínima" },
        { name: "--shadow", light: "rgba(0,0,0,0.12)", dark: "rgba(0,0,0,0.6)", usage: "Sombras de tarjetas y modales" },
      ],
    },
  ]

  return (
    <div className="ds-page-body">
      <div className="ds-page-header">
        <h2 className="ds-page-title">Colores</h2>
        <p className="ds-page-desc">
          14 tokens semánticos que adaptan sus valores al modo claro u oscuro. Nunca uses valores hex directamente en componentes — siempre referencia el token.
        </p>
      </div>

      {COLOR_TOKENS.map(({ group, tokens }) => (
        <div key={group}>
          <SectionHeading title={group} />
          <div className="ds-color-grid">
            {tokens.map(({ name, light, dark, usage }) => {
              const displayValue = isDark ? dark : light
              const swatchBg = displayValue.startsWith("rgba") || displayValue.startsWith("rgb")
                ? `linear-gradient(135deg, var(--bg3) 50%, ${displayValue} 50%)`
                : displayValue
              return (
                <div key={name} className="ds-color-card">
                  <div className="ds-color-swatch" style={{ background: swatchBg }} />
                  <div className="ds-color-info">
                    <div className="ds-color-name">{name}</div>
                    <div className="ds-color-value">{isDark ? dark : light}</div>
                    <div className="ds-color-usage">{usage}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      <SectionHeading title="Regla de uso" />
      <div className="ds-rules">
        <RuleChip rule="color: var(--txt)" variant="do" />
        <RuleChip rule="background: var(--bg2)" variant="do" />
        <RuleChip rule='color: #1d1d1f  ← hardcoded, no responde al tema' variant="dont" />
        <RuleChip rule='background: white  ← no existe como token' variant="dont" />
      </div>

      <CodeBlock code={`/* ✓ Correcto — semántico */
color: var(--txt);
background: var(--bg2);
border: 1px solid var(--border);

/* ✗ Incorrecto — hardcodeado */
color: #1d1d1f;
background: #ffffff;`} />
    </div>
  )
}

// ── Page: Typography ──────────────────────────────────────────────────────────
function PageTypography() {
  const TYPE_SCALE = [
    { tag: "Hero XL", size: "clamp(52px,7.5vw,100px)", weight: "800", tracking: "-0.045em", sample: "Diseño digital" },
    { tag: "Display M", size: "clamp(36px,5vw,64px)", weight: "700", tracking: "-0.03em", sample: "Proyectos que me definen" },
    { tag: "Heading", size: "clamp(28px,4vw,44px)", weight: "700", tracking: "-0.03em", sample: "Sobre mí" },
    { tag: "Tagline", size: "clamp(22px,3vw,30px)", weight: "700", tracking: "-0.03em", sample: "¿Tienes un proyecto en mente?" },
    { tag: "Title L", size: "22px", weight: "700", tracking: "-0.02em", sample: "Redesign E-commerce" },
    { tag: "Lead", size: "17px", weight: "400", tracking: "normal", sample: "Product Designer & Frontend Developer" },
    { tag: "Body M", size: "15px", weight: "400", tracking: "normal", sample: "Me especializo en interfaces digitales que funcionan." },
    { tag: "Body S", size: "13px", weight: "400", tracking: "normal", sample: "Rediseño completo de plataforma con foco en conversión." },
    { tag: "Label M", size: "14px", weight: "500", tracking: "normal", sample: "Trabajos · Sobre Mí · CV · Contacto" },
    { tag: "Label XS", size: "11px", weight: "600", tracking: "0.12em", sample: "PORTAFOLIO SELECCIONADO" },
    { tag: "Caption", size: "12px", weight: "500", tracking: "0.03em", sample: "Ver caso →" },
  ]

  return (
    <div className="ds-page-body">
      <div className="ds-page-header">
        <h2 className="ds-page-title">Tipografía</h2>
        <p className="ds-page-desc">
          Dos familias tipográficas. <strong>Plus Jakarta Sans</strong> para headings (700–800) y <strong>DM Sans</strong> para body (400–500). Escala de 11 tamaños con uso documentado.
        </p>
      </div>

      <SectionHeading title="Familias" />
      <div className="ds-font-families">
        <div className="ds-font-card">
          <div className="ds-font-sample ds-font-sample--heading">Aa Bb</div>
          <div className="ds-font-meta">
            <strong>Plus Jakarta Sans</strong>
            <span>Headings · 700–800 · Variable font</span>
            <span>Token: <code>--portfolio-heading-font</code></span>
          </div>
        </div>
        <div className="ds-font-card">
          <div className="ds-font-sample ds-font-sample--body">Aa Bb</div>
          <div className="ds-font-meta">
            <strong>DM Sans</strong>
            <span>Body · 400–500 · Variable font</span>
            <span>Token: <code>--portfolio-font</code></span>
          </div>
        </div>
      </div>

      <SectionHeading title="Escala tipográfica" />
      <div className="ds-type-scale">
        {TYPE_SCALE.map(({ tag, size, weight, tracking, sample }) => (
          <div key={tag} className="ds-type-row">
            <div className="ds-type-meta">
              <span className="ds-type-tag">{tag}</span>
              <span className="ds-type-size">{size} / w{weight} / {tracking}</span>
            </div>
            <div
              className="ds-type-sample"
              style={{
                fontSize: size,
                fontWeight: weight as React.CSSProperties["fontWeight"],
                letterSpacing: tracking,
                fontFamily: parseInt(weight) >= 700
                  ? "var(--portfolio-heading-font)"
                  : "var(--portfolio-font)",
              }}
            >
              {sample}
            </div>
          </div>
        ))}
      </div>

      <SectionHeading title="Reglas" />
      <div className="ds-rules">
        <RuleChip rule="Mínimo 16px para body text en mobile (evita auto-zoom de iOS)" variant="do" />
        <RuleChip rule="Line-height 1.65–1.8 para textos de lectura larga" variant="do" />
        <RuleChip rule="Letter-spacing negativo solo en headings grandes (≥22px)" variant="do" />
        <RuleChip rule="Texto body menor a 13px (ilegible en pantallas mediocres)" variant="dont" />
      </div>
    </div>
  )
}

// ── Page: Buttons ─────────────────────────────────────────────────────────────
function PageButtons() {
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "ok" | "err">("idle")

  const simulate = () => {
    setSubmitState("loading")
    setTimeout(() => {
      setSubmitState("ok")
      setTimeout(() => setSubmitState("idle"), 1800)
    }, 1400)
  }

  return (
    <div className="ds-page-body">
      <div className="ds-page-header">
        <h2 className="ds-page-title">Botones</h2>
        <p className="ds-page-desc">
          4 variantes. Solo una acción primaria visible por pantalla. Los estados de loading, éxito y error son partes integrales del componente.
        </p>
      </div>

      <SectionHeading title="Variantes" />
      <PreviewBox>
        <div className="ds-btn-showcase">
          <div className="ds-btn-row">
            <button className="btn-p">Acción primaria →</button>
            <button className="btn-g">Acción secundaria</button>
            <button className="btn-profile">Perfil</button>
          </div>
          <div className="ds-btn-row">
            <button className="btn-p" disabled style={{ opacity: 0.5, cursor: "not-allowed" }}>Deshabilitado</button>
            <button className="btn-g" disabled style={{ opacity: 0.5, cursor: "not-allowed" }}>Deshabilitado</button>
          </div>
          <div className="ds-btn-row">
            <button
              className={`fsub${submitState === "ok" ? " ok" : submitState === "err" ? " err" : ""}`}
              onClick={simulate}
              disabled={submitState === "loading"}
              style={{ maxWidth: 240 }}
              aria-busy={submitState === "loading"}
            >
              {submitState === "idle" && "Enviar formulario →"}
              {submitState === "loading" && "Enviando…"}
              {submitState === "ok" && "Enviado ✓"}
              {submitState === "err" && "Error al enviar"}
            </button>
          </div>
        </div>
      </PreviewBox>

      <SectionHeading title="Especificaciones" />
      <div className="ds-spec-table">
        {[
          { v: "btn-p", bg: "var(--accent)", fg: "#fff", r: "980px", p: "12px 26px", fs: "15px/500" },
          { v: "btn-g", bg: "transparent", fg: "var(--txt)", r: "980px", p: "10px 22px", fs: "15px/500" },
          { v: "btn-profile", bg: "transparent", fg: "var(--txt)", r: "980px", p: "7px 18px", fs: "13px/500" },
          { v: "fsub", bg: "var(--accent)", fg: "#fff", r: "980px", p: "15px full-width", fs: "15px/500" },
        ].map(row => (
          <div key={row.v} className="ds-spec-row">
            <span className="ds-spec-name">{row.v}</span>
            <span className="ds-spec-val">bg: {row.bg}</span>
            <span className="ds-spec-val">p: {row.p}</span>
            <span className="ds-spec-val">r: {row.r}</span>
            <span className="ds-spec-val">font: {row.fs}</span>
          </div>
        ))}
      </div>

      <SectionHeading title="Reglas de uso" />
      <div className="ds-rules">
        <RuleChip rule="Una sola acción primaria (btn-p) por pantalla" variant="do" />
        <RuleChip rule="Deshabilitar el botón durante operaciones async (aria-busy)" variant="do" />
        <RuleChip rule="Touch target mínimo 44×44px en todos los botones" variant="do" />
        <RuleChip rule="Dos botones primarios en la misma fila" variant="dont" />
        <RuleChip rule="Usar btn-p para acciones destructivas sin contexto visual extra" variant="dont" />
      </div>

      <SectionHeading title="Código" />
      <CodeBlock code={`{/* Primario */}
<button className="btn-p">Acción →</button>

{/* Secundario / Ghost */}
<button className="btn-g">Ver más</button>

{/* Submit con estados */}
<button
  type="submit"
  className={\`fsub\${status === "ok" ? " ok" : status === "err" ? " err" : ""}\`}
  disabled={status === "loading"}
  aria-busy={status === "loading"}
>
  {status === "idle" && "Enviar →"}
  {status === "loading" && "Enviando…"}
  {status === "ok" && "Enviado ✓"}
</button>`} />
    </div>
  )
}

// ── Page: Cards ───────────────────────────────────────────────────────────────
function PageCards() {
  return (
    <div className="ds-page-body">
      <div className="ds-page-header">
        <h2 className="ds-page-title">Tarjetas</h2>
        <p className="ds-page-desc">
          5 variantes de tarjeta. Todas usan glassmorphism con tokens semánticos. Las project cards tienen variantes featured (span 2) y compact (span 1).
        </p>
      </div>

      <SectionHeading title="Stat card" />
      <PreviewBox>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, maxWidth: 480 }}>
          {[{ n: "5+", l: "Años exp." }, { n: "32", l: "Proyectos" }, { n: "98%", l: "Satisfacción" }].map(({ n, l }) => (
            <div className="stat" key={l}>
              <div className="stat-n">{n}</div>
              <div className="stat-l">{l}</div>
            </div>
          ))}
        </div>
      </PreviewBox>
      <CodeBlock code={`<div className="stat">
  <div className="stat-n">5+</div>
  <div className="stat-l">Años de experiencia</div>
</div>`} />

      <SectionHeading title="Contact link item" />
      <PreviewBox>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 340, width: "100%" }}>
          {[{ label: "Email", value: "alejandro@astudio.cl" }, { label: "LinkedIn", value: "linkedin.com/in/alejandro" }].map(({ label, value }) => (
            <a
              key={label}
              href="#"
              onClick={e => e.preventDefault()}
              className="contact-link-item"
            >
              <div className="contact-link-icon"><EmailIcon /></div>
              <div className="contact-link-text">
                <div className="contact-link-label">{label}</div>
                <div className="contact-link-value">{value}</div>
              </div>
            </a>
          ))}
        </div>
      </PreviewBox>

      <SectionHeading title="Skill tags" />
      <PreviewBox>
        <div className="skills-wrap" style={{ maxWidth: 480 }}>
          {["Figma", "React", "Next.js", "TypeScript", "Tailwind", "Design Systems", "User Research"].map(s => (
            <span key={s} className="skill-tag">{s}</span>
          ))}
        </div>
      </PreviewBox>
      <CodeBlock code={`<div className="skills-wrap">
  <span className="skill-tag">Figma</span>
  <span className="skill-tag">React</span>
</div>`} />

      <SectionHeading title="KPI card (project panel)" />
      <PreviewBox>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, maxWidth: 420 }}>
          {[{ v: "+34%", l: "Conversión" }, { v: "−18%", l: "Abandono" }, { v: "4 meses", l: "Duración" }].map(({ v, l }) => (
            <div className="pv-kpi" key={l}>
              <div className="pv-kpi-val">{v}</div>
              <div className="pv-kpi-lbl">{l}</div>
            </div>
          ))}
        </div>
      </PreviewBox>
    </div>
  )
}

// ── Page: Forms ───────────────────────────────────────────────────────────────
function PageForms() {
  const [val, setVal] = useState({ name: "", email: "", msg: "" })

  return (
    <div className="ds-page-body">
      <div className="ds-page-header">
        <h2 className="ds-page-title">Formularios</h2>
        <p className="ds-page-desc">
          Sistema de floating labels. El label sube y cambia a uppercase cuando el campo tiene foco o contenido. Todos los inputs usan <code>id</code> + <code>htmlFor</code> para accesibilidad.
        </p>
      </div>

      <SectionHeading title="Demo interactivo" />
      <PreviewBox label="Escribe en los campos para ver el floating label">
        <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 380, width: "100%" }}>
          <div className="fld">
            <input id="ds-name" className="fi" type="text" placeholder=" "
              value={val.name} onChange={e => setVal(v => ({ ...v, name: e.target.value }))} />
            <label className="fl" htmlFor="ds-name">Nombre completo *</label>
          </div>
          <div className="fld">
            <input id="ds-email" className="fi" type="email" placeholder=" "
              value={val.email} onChange={e => setVal(v => ({ ...v, email: e.target.value }))} />
            <label className="fl" htmlFor="ds-email">Email *</label>
          </div>
          <div className="fld">
            <textarea id="ds-msg" className="ft" placeholder=" " rows={3}
              value={val.msg} onChange={e => setVal(v => ({ ...v, msg: e.target.value }))} />
            <label className="fl" htmlFor="ds-msg">Mensaje…</label>
          </div>
          <button className="fsub" style={{ width: "100%" }}>Enviar →</button>
        </div>
      </PreviewBox>

      <SectionHeading title="Estados del input" />
      <div className="ds-spec-table">
        {[
          { state: "Reposo", desc: "Border rgba(0,0,0,0.12), bg rgba(0,0,0,0.04)" },
          { state: "Hover", desc: "Border rgba(0,0,0,0.20), bg rgba(0,0,0,0.06)" },
          { state: "Focus", desc: "Border var(--accent), box-shadow 3px rgba(41,151,255,0.15)" },
          { state: "Filled", desc: "Label: 8px top, 10px font-size, uppercase, color var(--accent)" },
          { state: "Error", desc: "Border var(--error), mensaje bajo el campo con role=alert" },
        ].map(({ state, desc }) => (
          <div key={state} className="ds-spec-row">
            <span className="ds-spec-name">{state}</span>
            <span className="ds-spec-val" style={{ flex: 1 }}>{desc}</span>
          </div>
        ))}
      </div>

      <SectionHeading title="Reglas de accesibilidad" />
      <div className="ds-rules">
        <RuleChip rule="Cada input necesita id + label[htmlFor] — sin excepción" variant="do" />
        <RuleChip rule="Validar en blur (onBlur), no en cada keystroke (onChange)" variant="do" />
        <RuleChip rule="Errores en <p role='alert' aria-live='assertive'> bajo el campo" variant="do" />
        <RuleChip rule="placeholder como único label (el label desaparece al escribir)" variant="dont" />
      </div>

      <SectionHeading title="Código" />
      <CodeBlock code={`<div className="fld">
  <input
    id="contact-name"
    className="fi"
    type="text"
    placeholder=" "
    autoComplete="name"
    required
  />
  <label className="fl" htmlFor="contact-name">
    Nombre *
  </label>
</div>

{/* Error message */}
{hasError && (
  <p className="form-error-msg" role="alert" aria-live="assertive">
    Este campo es requerido.
  </p>
)}`} />
    </div>
  )
}

// ── Page: Navigation ──────────────────────────────────────────────────────────
function PageNavigation() {
  const [activeTab, setActiveTab] = useState<"trabajos" | "sobre" | "cv" | "contacto">("trabajos")

  return (
    <div className="ds-page-body">
      <div className="ds-page-header">
        <h2 className="ds-page-title">Navegación</h2>
        <p className="ds-page-desc">
          Navbar fija con sliding pill animado por spring. Bottom nav para mobile (≤768px) con iconos + labels. Máximo 5 ítems por nav.
        </p>
      </div>

      <SectionHeading title="Navbar — sliding pill" />
      <PreviewBox label="Click en los ítems para animar el pill">
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 16px", height: 56, background: "var(--navbar-bg, rgba(248,248,248,0.82))",
          borderRadius: 14, border: "1px solid var(--border)", width: "100%",
          boxSizing: "border-box", fontFamily: "var(--portfolio-font)"
        }}>
          <div style={{ fontFamily: "var(--portfolio-heading-font)", fontWeight: 700, fontSize: 14, letterSpacing: "-0.03em", color: "var(--txt)" }}>A·Studio</div>
          <div style={{ display: "flex", gap: 4, position: "relative" }}>
            {(["trabajos", "sobre", "cv", "contacto"] as const).map(key => (
              <button key={key} onClick={() => setActiveTab(key)} style={{
                padding: "6px 12px", borderRadius: 8, border: "none",
                background: activeTab === key ? "var(--glass-hover)" : "transparent",
                color: activeTab === key ? "var(--txt)" : "var(--txt2)",
                fontWeight: activeTab === key ? 600 : 500,
                fontSize: 13, cursor: "pointer", fontFamily: "inherit", transition: "all 180ms ease",
              }}>
                {key === "trabajos" ? "Trabajos" : key === "sobre" ? "Sobre Mí" : key.toUpperCase()}
              </button>
            ))}
          </div>
          <div style={{ padding: "5px 14px", borderRadius: 980, border: "1px solid var(--border)", fontSize: 12, color: "var(--txt2)", fontFamily: "inherit" }}>Perfil</div>
        </div>
      </PreviewBox>

      <SectionHeading title="Bottom Nav (mobile ≤768px)" />
      <PreviewBox>
        <div style={{ display: "flex", background: "var(--bg2)", borderTop: "1px solid var(--border)", borderRadius: "0 0 14px 14px", maxWidth: 360, width: "100%" }}>
          {[{ key: "trabajos", label: "Trabajos" }, { key: "sobre", label: "Sobre mí" }, { key: "cv", label: "CV" }, { key: "contacto", label: "Contacto" }].map(({ key, label }) => (
            <div key={key} style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              gap: 3, padding: "10px 4px 12px",
              color: activeTab === key ? "var(--accent)" : "var(--txt3)",
              cursor: "pointer", fontSize: 10, fontWeight: 500,
            }} onClick={() => setActiveTab(key as typeof activeTab)}>
              <div style={{ width: 20, height: 2, borderRadius: 2, background: "currentColor", marginBottom: 4 }} />
              <div style={{ width: 16, height: 2, borderRadius: 2, background: "currentColor", marginBottom: 6 }} />
              {label}
            </div>
          ))}
        </div>
      </PreviewBox>

      <SectionHeading title="Especificaciones" />
      <div className="ds-spec-table">
        {[
          { comp: "Navbar", height: "64px", z: "100", bg: "var(--navbar-bg) + blur(48px)" },
          { comp: "Nav pill", height: "32px", z: "0 (dentro del nav-center)", bg: "var(--glass-hover)" },
          { comp: "Bottom nav", height: "64px", z: "90", bg: "var(--bg2) + border-top" },
        ].map(row => (
          <div key={row.comp} className="ds-spec-row">
            <span className="ds-spec-name">{row.comp}</span>
            <span className="ds-spec-val">h: {row.height}</span>
            <span className="ds-spec-val">z: {row.z}</span>
            <span className="ds-spec-val">bg: {row.bg}</span>
          </div>
        ))}
      </div>

      <SectionHeading title="Reglas" />
      <div className="ds-rules">
        <RuleChip rule="Máximo 5 ítems en el bottom nav (Apple HIG)" variant="do" />
        <RuleChip rule="El ítem activo siempre visualmente resaltado — color + peso" variant="do" />
        <RuleChip rule="Pill animado con spring cubic-bezier(0.34,1.56,0.64,1)" variant="do" />
        <RuleChip rule="Nav con ítems sin label de texto (solo iconos)" variant="dont" />
      </div>
    </div>
  )
}

// ── Page: Badges ──────────────────────────────────────────────────────────────
function PageBadges() {
  return (
    <div className="ds-page-body">
      <div className="ds-page-header">
        <h2 className="ds-page-title">Badges & Tags</h2>
        <p className="ds-page-desc">
          6 variantes de badge y tag para estado, categorías, métricas y disponibilidad. Todos son pill-shaped (border-radius 980px).
        </p>
      </div>

      <SectionHeading title="Todas las variantes" />
      <PreviewBox>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center" }}>
          <span className="skill-tag">Figma</span>
          <span className="skill-tag">React</span>
          <span className="p-stat" style={{ position: "relative", top: "auto", right: "auto" }}>+34% conversión</span>
          <div className="contact-avail"><span className="avail-dot" />Disponible 2026</div>
          <div className="hero-tag" style={{ opacity: 1, animation: "none", position: "relative", marginBottom: 0 }}>
            <span className="hero-dot" />Product Designer
          </div>
          <div className="ds-page-badge">v1.0</div>
          <span className="pv-cat">UX/UI Design</span>
          <span className="pv-year">2024</span>
        </div>
      </PreviewBox>

      <SectionHeading title="Especificaciones" />
      <div className="ds-spec-table">
        {[
          { name: "skill-tag", size: "13px", p: "6px 14px", bg: "rgba(255,255,255,0.65)+blur" },
          { name: "p-stat", size: "11px", p: "4px 10px", bg: "rgba(0,0,0,0.55)+blur" },
          { name: "contact-avail", size: "13px", p: "8px 14px", bg: "rgba(success,0.07)" },
          { name: "hero-tag", size: "12px", p: "6px 14px", bg: "var(--glass)" },
          { name: "pv-cat", size: "11px/700", p: "—", bg: "transparent" },
        ].map(row => (
          <div key={row.name} className="ds-spec-row">
            <span className="ds-spec-name">{row.name}</span>
            <span className="ds-spec-val">size: {row.size}</span>
            <span className="ds-spec-val">padding: {row.p}</span>
            <span className="ds-spec-val">bg: {row.bg}</span>
          </div>
        ))}
      </div>

      <CodeBlock code={`{/* Skill tag */}
<span className="skill-tag">React</span>

{/* Stat badge (on project cards) */}
<span className="p-stat p-stat--animated">+34% conversión</span>

{/* Availability */}
<div className="contact-avail">
  <span className="avail-dot" />
  Disponible 2026
</div>

{/* Hero pill tag */}
<div className="hero-tag">
  <span className="hero-dot" />
  Product Designer
</div>`} />
    </div>
  )
}

// ── Page: Patterns ────────────────────────────────────────────────────────────
function PagePatterns() {
  return (
    <div className="ds-page-body">
      <div className="ds-page-header">
        <h2 className="ds-page-title">Patrones de Layout</h2>
        <p className="ds-page-desc">
          Sistemas de layout recurrentes que combinan múltiples componentes en estructuras predefinidas y responsivas.
        </p>
      </div>

      <SectionHeading title="Bento Grid — Z-pattern" />
      <p className="ds-pattern-desc">
        Grid de 3 columnas con variantes <code>featured</code> (span 2, 16:10) y <code>compact</code> (span 1, min 280px). El patrón Z alterna automáticamente por grupos de 4.
      </p>
      <PreviewBox label="Esquema del Z-pattern (4 proyectos)">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, maxWidth: 480, width: "100%" }}>
          {[
            { span: 2, label: "Featured 01", accent: true },
            { span: 1, label: "Compact 02", accent: false },
            { span: 1, label: "Compact 03", accent: false },
            { span: 2, label: "Featured 04", accent: true },
          ].map(({ span, label, accent }, i) => (
            <div key={i} style={{
              gridColumn: `span ${span}`, height: 100, borderRadius: 12,
              border: `1.5px solid ${accent ? "var(--accent)" : "var(--border)"}`,
              background: accent ? "rgba(0,98,204,0.08)" : "var(--bg3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 600,
              color: accent ? "var(--accent)" : "var(--txt3)",
            }}>
              {label}
            </div>
          ))}
        </div>
      </PreviewBox>
      <CodeBlock code={`/* CSS */
.projects-bento {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.p-card--featured { grid-column: span 2; aspect-ratio: 16/10; }
.p-card--compact  { grid-column: span 1; min-height: 280px; }

/* TSX — Z-pattern automático */
function getBentoVariant(i: number): "featured" | "compact" {
  const pos = i % 4
  return pos === 0 || pos === 3 ? "featured" : "compact"
}`} />

      <SectionHeading title="Hero — Sticky Parallax Stack" />
      <p className="ds-pattern-desc">
        El hero es <code>position: sticky; top: 0; z-index: 1</code>. El sheet de proyectos es <code>z-index: 2</code> y desliza encima. El contenido del hero recibe <code>filter: blur()</code> progresivo via scroll listener en JS (no backdrop-filter — incompatible con stacking contexts hermanos en Chrome).
      </p>
      <div className="ds-layer-diagram">
        {[
          { z: "z-index: 100  fixed", label: "Navbar", accent: true },
          { z: "z-index: 2  relative", label: "Projects sheet (desliza sobre hero)", accent: false },
          { z: "z-index: 1  sticky", label: "Hero section (queda fijo abajo)", accent: false },
          { z: "z-index: 0  fixed", label: "WebGL canvas (fondo permanente)", accent: false },
        ].map(({ z, label, accent }) => (
          <div key={label} className="ds-layer-row" style={{ borderLeftColor: accent ? "var(--accent)" : "var(--border-h)" }}>
            <span className="ds-layer-z">{z}</span>
            <span className="ds-layer-label">{label}</span>
          </div>
        ))}
      </div>

      <SectionHeading title="Contact Split" />
      <p className="ds-pattern-desc">
        Grid de 2 columnas (1fr 1.1fr), gap 64px. Izquierda: info + links. Derecha: form card glassmorphism. Colapsa a 1 columna en ≤820px.
      </p>
      <CodeBlock code={`.contact-split {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  gap: 64px;
  max-width: 1000px;
}
@media (max-width: 820px) {
  .contact-split { grid-template-columns: 1fr; gap: 48px; }
}

/* About grid */
.about-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 56px;
}
@media (max-width: 860px) {
  .about-grid { grid-template-columns: 1fr; gap: 40px; }
}`} />
    </div>
  )
}

// ── Page: Toast ───────────────────────────────────────────────────────────────
function PageToast() {
  const { isDark } = useTheme()
  const [activeType, setActiveType] = useState<"success" | "error" | "warning" | "info">("success")

  const STATES = [
    {
      type: "success" as const,
      label: "Éxito",
      hex: "#30d158",
      accent: "var(--admin-toast-accent-success, #30d158)",
      title: "Cambios guardados",
      msg: "El proyecto se actualizó correctamente.",
      tokenName: "--admin-toast-accent-success",
      semanticAlias: "--success",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="10" cy="10" r="8" /><path d="M6.5 10.5l2.5 2.5 4.5-5" />
        </svg>
      ),
    },
    {
      type: "error" as const,
      label: "Error",
      hex: "#ef4444",
      accent: "var(--admin-toast-accent-error, #ef4444)",
      title: "Error al guardar",
      msg: "No se pudo conectar con el servidor.",
      tokenName: "--admin-toast-accent-error",
      semanticAlias: "--error",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="10" cy="10" r="8" /><path d="M7.5 7.5l5 5M12.5 7.5l-5 5" />
        </svg>
      ),
    },
    {
      type: "warning" as const,
      label: "Advertencia",
      hex: "#f59e0b",
      accent: "var(--admin-toast-accent-warning, #f59e0b)",
      title: "Acción irreversible",
      msg: "Esta operación no se puede deshacer.",
      tokenName: "--admin-toast-accent-warning",
      semanticAlias: "--warning",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M10 3.5L17.5 16.5H2.5L10 3.5z" /><path d="M10 9v3M10 13.5v.5" />
        </svg>
      ),
    },
    {
      type: "info" as const,
      label: "Información",
      hex: isDark ? "#2997ff" : "#0062cc",
      accent: "var(--admin-toast-accent-info, #0062cc)",
      title: "Sin cambios",
      msg: "No hay cambios pendientes para guardar.",
      tokenName: "--admin-toast-accent-info",
      semanticAlias: "--accent",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="10" cy="10" r="8" /><path d="M10 9.5V14" /><circle cx="10" cy="6.5" r="0.5" fill="currentColor" />
        </svg>
      ),
    },
  ]

  const active = STATES.find(s => s.type === activeType)!

  const TOKEN_GROUPS = [
    {
      label: "Estructura",
      tokens: [
        { name: "--admin-toast-radius",    val: "16px",  desc: "border-radius del contenedor" },
        { name: "--admin-toast-min-width", val: "320px", desc: "Ancho mínimo" },
        { name: "--admin-toast-max-width", val: "420px", desc: "Ancho máximo" },
        { name: "--admin-toast-z-index",   val: "600",   desc: "Sobre modales (z 500) y navbar (z 100)" },
        { name: "--admin-toast-bottom",    val: "28px",  desc: "Posición desde borde inferior" },
        { name: "--admin-toast-right",     val: "28px",  desc: "Posición desde borde derecho" },
      ],
    },
    {
      label: "Espaciado interno",
      tokens: [
        { name: "--admin-toast-px", val: "20px", desc: "Padding horizontal" },
        { name: "--admin-toast-pt", val: "16px", desc: "Padding top" },
        { name: "--admin-toast-pb", val: "19px", desc: "16px + 3px para barra de progreso" },
        { name: "--admin-toast-gap", val: "12px", desc: "Gap entre icono, cuerpo y botón X" },
      ],
    },
    {
      label: "Glassmorphism",
      tokens: [
        { name: "--admin-toast-bg",     val: "rgba(255,255,255,0.88)", desc: "Light · dark: rgba(20,20,22,0.90)" },
        { name: "--admin-toast-border", val: "rgba(0,0,0,0.07)",       desc: "Light · dark: rgba(255,255,255,0.09)" },
        { name: "--admin-toast-blur",   val: "12px",                   desc: "backdrop-filter blur" },
        { name: "--admin-toast-shadow", val: "0 8px 32px …",           desc: "Sombra light · amplificada en dark" },
      ],
    },
    {
      label: "Barra de progreso",
      tokens: [
        { name: "--admin-toast-accent-bar-w", val: "3px", desc: "Ancho de la barra de acento lateral" },
        { name: "--admin-toast-bar-h",        val: "3px", desc: "Altura de la barra bottom" },
        { name: "--admin-toast-bar-opacity",  val: "0.4", desc: "Opacidad sobre el color de acento" },
        { name: "--admin-toast-bar-duration", val: "4s",  desc: "Duración hasta auto-dismiss" },
      ],
    },
    {
      label: "Tipografía e íconos",
      tokens: [
        { name: "--admin-toast-title-size",   val: "14px",  desc: "Plus Jakarta Sans — título" },
        { name: "--admin-toast-title-weight", val: "700",   desc: "Peso del título" },
        { name: "--admin-toast-msg-size",     val: "13px",  desc: "DM Sans — mensaje opcional" },
        { name: "--admin-toast-icon-size",    val: "20px",  desc: "SVG 20×20" },
        { name: "--admin-toast-icon-stroke",  val: "1.75",  desc: "strokeWidth del SVG" },
        { name: "--admin-toast-close-size",   val: "24px",  desc: "Hit area del botón X" },
        { name: "--admin-toast-close-radius", val: "6px",   desc: "Radio proporcional a 24×24" },
      ],
    },
    {
      label: "Animaciones",
      tokens: [
        { name: "--admin-toast-anim-enter", val: "toastSlideUp 300ms spring both", desc: "Animación de entrada (montado)" },
        { name: "--admin-toast-anim-exit",  val: "toastSlideDown 200ms ease-in",   desc: "Animación de salida (clase .leaving)" },
      ],
    },
  ]

  return (
    <div className="ds-page-body">
      <div className="ds-page-header">
        <h2 className="ds-page-title">Toast — Notificaciones</h2>
        <p className="ds-page-desc">
          Componente de feedback glassmorphism con <strong>4 estados semánticos</strong>, barra de progreso
          auto-dismiss a los 4s, pausa al hover y accesibilidad ARIA. Exclusivo del panel <code>/admin</code>.
          Todas las propiedades visuales están tokenizadas en <code>--admin-toast-*</code>.
        </p>
      </div>

      {/* ── Estado selector ── */}
      <SectionHeading title="Estados" />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {STATES.map(({ type, label, accent }) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            style={{
              padding: "6px 16px",
              borderRadius: 9999,
              border: `1.5px solid ${activeType === type ? accent : "var(--border)"}`,
              background: activeType === type ? "var(--glass-hover)" : "transparent",
              color: activeType === type ? accent : "var(--txt3)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 150ms ease",
              fontFamily: "var(--portfolio-font)",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Vista previa interactiva ── */}
      <PreviewBox label="Vista previa">
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "flex-start",
            gap: "var(--admin-toast-gap, 12px)",
            minWidth: "min(var(--admin-toast-min-width, 320px), 100%)",
            maxWidth: "var(--admin-toast-max-width, 420px)",
            padding: "var(--admin-toast-pt, 16px) var(--admin-toast-px, 20px) var(--admin-toast-pb, 19px)",
            borderRadius: "var(--admin-toast-radius, 16px)",
            background: "var(--admin-toast-bg, rgba(255,255,255,0.88))",
            backdropFilter: "blur(var(--admin-toast-blur, 12px))",
            WebkitBackdropFilter: "blur(var(--admin-toast-blur, 12px))",
            border: "1px solid var(--admin-toast-border, rgba(0,0,0,0.07))",
            boxShadow: "var(--admin-toast-shadow, 0 8px 32px rgba(0,0,0,0.13))",
            overflow: "hidden",
            fontFamily: "var(--portfolio-font)",
            width: "100%",
          }}
        >
          {/* Barra acento lateral */}
          <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0,
            width: "var(--admin-toast-accent-bar-w, 3px)",
            borderRadius: "var(--admin-toast-radius, 16px) 0 0 var(--admin-toast-radius, 16px)",
            background: active.accent,
          }} />
          {/* Ícono */}
          <div style={{ color: active.accent, flexShrink: 0, marginTop: 1 }}>
            {active.icon}
          </div>
          {/* Cuerpo */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
            <span style={{
              fontFamily: "var(--portfolio-heading-font)",
              fontSize: "var(--admin-toast-title-size, 14px)",
              fontWeight: 700,
              color: "var(--txt)",
              letterSpacing: "-0.01em",
              lineHeight: 1.3,
            }}>
              {active.title}
            </span>
            <span style={{
              fontSize: "var(--admin-toast-msg-size, 13px)",
              color: "var(--txt2)",
              lineHeight: 1.4,
            }}>
              {active.msg}
            </span>
          </div>
          {/* Botón cerrar */}
          <div style={{
            flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
            width: "var(--admin-toast-close-size, 24px)",
            height: "var(--admin-toast-close-size, 24px)",
            borderRadius: "var(--admin-toast-close-radius, 6px)",
            color: "var(--txt3)", marginTop: -2,
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M2 2l10 10M12 2L2 12" />
            </svg>
          </div>
          {/* Barra de progreso (estática en 60%) */}
          <div style={{
            position: "absolute", bottom: 0, left: 0,
            height: "var(--admin-toast-bar-h, 3px)",
            width: "60%",
            background: active.accent,
            opacity: 0.4,
          }} />
        </div>
      </PreviewBox>

      {/* ── Tokens de color de feedback ── */}
      <SectionHeading title="Tokens de feedback" />
      <div className="ds-color-grid">
        {STATES.map(({ tokenName, semanticAlias, label, hex }) => (
          <div key={tokenName} className="ds-color-card">
            <div className="ds-color-swatch" style={{ background: hex }} />
            <div className="ds-color-info">
              <div className="ds-color-name">{tokenName}</div>
              <div className="ds-color-value">{hex}</div>
              <div className="ds-color-usage">
                Alias: <code>{semanticAlias}</code> · {label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tokens del componente ── */}
      <SectionHeading title="Tokens del componente" />
      {TOKEN_GROUPS.map(({ label, tokens }) => (
        <div key={label} style={{ marginBottom: 20 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
            textTransform: "uppercase", color: "var(--txt3)", marginBottom: 8,
          }}>
            {label}
          </div>
          <div className="ds-spec-table">
            {tokens.map(({ name, val, desc }) => (
              <div key={name} className="ds-spec-row">
                <span className="ds-spec-name">{name}</span>
                <span className="ds-spec-val">{val}</span>
                <span className="ds-spec-val" style={{ color: "var(--txt3)" }}>{desc}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* ── Código de uso ── */}
      <SectionHeading title="Uso" />
      <CodeBlock code={`// app/admin/page.tsx — estado del toast
const [toast, setToast]       = useState<ToastState>(null)
const [toastLeaving, setToastLeaving] = useState(false)

function showToast(title: string, type: ToastType, msg?: string) {
  setToast({ title, type, msg })
  setToastLeaving(false)
  leavingTimer.current = setTimeout(() => setToastLeaving(true), 3800)
  dismissTimer.current = setTimeout(() => {
    setToast(null)
    setToastLeaving(false)
  }, 4000)
}

// Render en el layout del admin
{toast && (
  <AdminToast
    type={toast.type}       // "success" | "error" | "warning" | "info"
    title={toast.title}
    message={toast.msg}     // opcional
    onClose={closeToast}
    isLeaving={toastLeaving}
  />
)}

// Dispatch desde cualquier tab
onToast("Cambios guardados",   "success", "El hero se actualizó.")
onToast("Error al guardar",    "error",   error.message)
onToast("Acción irreversible", "warning")
onToast("Sin cambios",         "info")`} />

      {/* ── Reglas de uso ── */}
      <SectionHeading title="Reglas" />
      <div className="ds-rules">
        <RuleChip rule="success → operación completada: guardar, subir, crear" variant="do" />
        <RuleChip rule="error → el usuario debe actuar; no para advertencias menores" variant="do" />
        <RuleChip rule="warning → acción destructiva o con consecuencias irreversibles" variant="do" />
        <RuleChip rule="info → confirmación neutral o estado esperado" variant="do" />
        <RuleChip rule='Mostrar success cuando la operación realmente falló' variant="dont" />
        <RuleChip rule="Apilar varios toasts simultáneos (el sistema no tiene queue)" variant="dont" />
      </div>
    </div>
  )
}

// ── Page: Brands Section ─────────────────────────────────────────────────────
function PageBrands() {
  return (
    <div className="ds-page-body">
      <div className="ds-page-header">
        <h2 className="ds-page-title">Brands Section</h2>
        <p className="ds-page-desc">
          Inter-sección "Han confiado en mí" entre proyectos y blog. Grid auto-fill que escala de 6 a 12 logos sin tocar código. Entrada con IntersectionObserver + stagger. Admin: <code>/admin → Marcas</code>.
        </p>
      </div>

      <SectionHeading title="Eyebrow Label — Patrón editorial" />
      <p className="ds-pattern-desc">
        Label centrado con líneas decorativas a los lados. <strong>Label XS</strong> (11px / w600 / 0.12em tracking / uppercase). Color <code>txt2</code> al 55% de opacidad. Líneas al 22%. Usar solo en secciones de soporte (social proof, inter-secciones). Para secciones primarias usar heading jerárquico.
      </p>
      <PreviewBox label="Eyebrow label con líneas">
        <div style={{ display: "flex", alignItems: "center", gap: 16, width: "100%", maxWidth: 320 }}>
          <div style={{ flex: 1, maxWidth: 64, height: 1, background: "var(--txt2)", opacity: 0.22 }} />
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--txt2)", opacity: 0.55, whiteSpace: "nowrap" }}>
            Han confiado en mí
          </span>
          <div style={{ flex: 1, maxWidth: 64, height: 1, background: "var(--txt2)", opacity: 0.22 }} />
        </div>
      </PreviewBox>
      <CodeBlock code={`<div className="brands-label-wrap">
  <div className="brands-label-line" />
  <p className="brands-label">Han confiado en mí</p>
  <div className="brands-label-line" />
</div>

/* CSS */
.brands-label-wrap { display: flex; align-items: center; gap: 16px; }
.brands-label-line { flex: 1; max-width: 64px; height: 1px;
  background: var(--txt2); opacity: 0.22; }
.brands-label { font-size: 11px; font-weight: 600;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--txt2); opacity: 0.55; }`} />

      <SectionHeading title="Grid auto-fill — Layout de logos" />
      <p className="ds-pattern-desc">
        <code>repeat(auto-fill, minmax(130px, 1fr))</code> — 6 columnas en ≥780px, se adapta solo al añadir más marcas. Max-width 1000px. Gap 24px row / 16px column.
      </p>
      <PreviewBox label="Grid 6 items (esquema)">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "8px", width: "100%", maxWidth: 480 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{
              height: 36, borderRadius: 8, border: "1.5px dashed var(--border)",
              background: "var(--bg3)", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 10, color: "var(--txt3)", fontWeight: 600
            }}>
              {i + 1}
            </div>
          ))}
        </div>
      </PreviewBox>
      <CodeBlock code={`.brands-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 24px 16px;
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 48px;
}

/* Mobile */
@media (max-width: 640px) {
  .brands-gallery {
    grid-template-columns: repeat(3, 1fr);
  }
}`} />

      <SectionHeading title="Stagger Entrance — Animación de entrada" />
      <p className="ds-pattern-desc">
        IntersectionObserver (threshold 0.12) añade la clase <code>brands-section--visible</code> al <code>&lt;section&gt;</code> cuando entra en viewport. Cada ítem parte de <code>opacity: 0; transform: translateY(10px)</code> y recibe un <code>transition-delay</code> inline basado en su índice. Límite: ≤12 items (stagger total ≤660ms).
      </p>
      <div className="ds-layer-diagram">
        {[
          { z: "threshold: 0.12", label: "12% del section visible → dispara entrada" },
          { z: "delay: idx × 60ms", label: "6 logos → 300ms total stagger" },
          { z: "duration: 0.55s", label: "opacity 0→0.38 + translateY 10px→0" },
          { z: "hover: 0.22s", label: "opacity →0.86, scale →1.06, grayscale →0%" },
        ].map(({ z, label }) => (
          <div key={label} className="ds-layer-row">
            <span className="ds-layer-z">{z}</span>
            <span className="ds-layer-label">{label}</span>
          </div>
        ))}
      </div>
      <CodeBlock code={`// React — IntersectionObserver
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

// JSX — transition-delay por índice
{brands.map((brand, idx) => (
  <div
    key={brand.id}
    className="brand-item"
    style={{ transitionDelay: \`\${idx * 60}ms\` }}
  >
    <img src={logo} alt="" draggable={false} />
  </div>
))}

/* CSS */
.brand-item {
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.55s ease-out, transform 0.55s ease-out;
}
.brands-section--visible .brand-item {
  opacity: 0.38;
  transform: translateY(0);
}
.brands-section--visible .brand-item:hover {
  opacity: 0.86;
  transform: translateY(0) scale(1.06);
  transition-duration: 0.22s;
}
.brand-item img {
  filter: grayscale(20%);
  transition: filter 0.22s ease;
}
.brands-section--visible .brand-item:hover img {
  filter: grayscale(0%);
}
@media (prefers-reduced-motion: reduce) {
  .brand-item { opacity: 0.38; transform: none; }
}`} />

      <SectionHeading title="Gradientes de fondo" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)" }}>
          <div style={{ height: 64, background: "linear-gradient(#d8deec 0% 26%, #e6ebf3 100%)" }} />
          <div style={{ padding: "10px 14px", fontSize: 11, color: "var(--txt3)", fontFamily: "monospace" }}>
            light: #d8deec → #e6ebf3
          </div>
        </div>
        <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)" }}>
          <div style={{ height: 64, background: "linear-gradient(#03070e 0%, #060b16 100%)" }} />
          <div style={{ padding: "10px 14px", fontSize: 11, color: "var(--txt3)", fontFamily: "monospace" }}>
            dark: #03070e → #060b16
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Page map ──────────────────────────────────────────────────────────────────
const PAGE_MAP: Record<DSPageId, React.ComponentType> = {
  overview: PageOverview,
  colors: PageColors,
  typography: PageTypography,
  buttons: PageButtons,
  cards: PageCards,
  forms: PageForms,
  navigation: PageNavigation,
  badges: PageBadges,
  toast: PageToast,
  patterns: PagePatterns,
  brands: PageBrands,
}

// ── Main export ───────────────────────────────────────────────────────────────
export function DesignSystemSection({ adminMode }: { adminMode?: boolean }) {
  const [activePage, setActivePage] = useState<DSPageId>("overview")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const PageComponent = PAGE_MAP[activePage]

  const handleNav = (id: DSPageId) => {
    setActivePage(id)
    setSidebarOpen(false)
    window.scrollTo({ top: 0, behavior: "instant" })
  }

  return (
    <div className={`ds-layout${adminMode ? " ds-layout--admin" : ""}`}>
      {/* Sidebar */}
      <aside className={`ds-sidebar${sidebarOpen ? " ds-sidebar--open" : ""}`} aria-label="Navegación del sistema de diseño">
        <div className="ds-brand">
          <div className="ds-brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <div className="ds-brand-info">
            <div className="ds-brand-title">Project Zero DS</div>
            <div className="ds-brand-version">v1.3</div>
          </div>
        </div>
        <nav className="ds-nav">
          {DS_GROUPS.map(({ label, items }) => (
            <div key={label} className="ds-nav-group">
              <div className="ds-nav-group-label">{label}</div>
              {items.map(({ id, label: itemLabel }) => (
                <button
                  key={id}
                  className={`ds-nav-item${activePage === id ? " ds-nav-item--active" : ""}`}
                  onClick={() => handleNav(id)}
                  aria-current={activePage === id ? "page" : undefined}
                >
                  {itemLabel}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* Mobile toggle */}
      <button
        className="ds-mobile-toggle"
        onClick={() => setSidebarOpen(o => !o)}
        aria-label={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={sidebarOpen}
      >
        <span className="ds-mobile-toggle-label">
          {DS_GROUPS.flatMap(g => g.items).find(i => i.id === activePage)?.label ?? "Menú"}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {sidebarOpen
            ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
            : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
          }
        </svg>
      </button>

      {/* Main content — key forces remount → triggers ds-fade-in animation */}
      <main className="ds-main" id="ds-content" key={activePage}>
        <PageComponent />
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="ds-sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}
    </div>
  )
}
