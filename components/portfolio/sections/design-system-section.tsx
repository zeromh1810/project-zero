"use client"

import { useState } from "react"
import { useTheme } from "@/lib/context/theme-context"
import { EmailIcon } from "../icons"

// ── Types ────────────────────────────────────────────────────────────────────
type DSPageId =
  | "overview" | "colors" | "typography" | "darkmode" | "primitivos" | "animaciones" | "breakpoints"
  | "buttons" | "cards" | "forms" | "navigation" | "badges" | "toast" | "modals"
  | "patterns" | "project-detail" | "brands" | "blog"

const DS_GROUPS: { label: string; items: { id: DSPageId; label: string }[] }[] = [
  {
    label: "Fundamentos",
    items: [
      { id: "overview",    label: "Overview" },
      { id: "colors",      label: "Colores" },
      { id: "typography",  label: "Tipografía" },
      { id: "darkmode",    label: "Modo Oscuro" },
      { id: "primitivos",  label: "Tokens Primitivos" },
      { id: "animaciones",  label: "Animaciones" },
      { id: "breakpoints",  label: "Breakpoints" },
    ],
  },
  {
    label: "Componentes",
    items: [
      { id: "buttons",    label: "Botones" },
      { id: "cards",      label: "Tarjetas" },
      { id: "forms",      label: "Formularios" },
      { id: "navigation", label: "Navegación" },
      { id: "badges",     label: "Badges & Tags" },
      { id: "toast",      label: "Toast" },
      { id: "modals",     label: "Modales" },
    ],
  },
  {
    label: "Patrones",
    items: [
      { id: "patterns",       label: "Layouts" },
      { id: "project-detail", label: "Detalle de Proyecto" },
      { id: "brands",         label: "Brands Section" },
      { id: "blog",           label: "Blog" },
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
        <div className="ds-page-badge">v1.10.0</div>
        <h2 className="ds-page-title">Project Zero Design System</h2>
        <p className="ds-page-desc">
          Sistema de diseño del portafolio de <strong>Carlos Felipe Rojas Hickmann</strong>. Arquitectura de tokens de 3 capas
          (Primitivos → Semánticos → Componentes), construido sobre Next.js 16 + React 19 + CSS Variables.
          Todos los componentes son dark-mode ready, accesibles WCAG AA y diseñados para escalar.
        </p>
      </div>

      <div className="ds-overview-grid">
        {[
          { label: "Tokens CSS", value: "120+", desc: "CSS custom properties reales en :root/.dark" },
          { label: "Páginas DS", value: "18",   desc: "Secciones documentadas en el viewer" },
          { label: "WCAG",       value: "AA",   desc: "Nivel de accesibilidad mínimo" },
          { label: "Modos",      value: "2",    desc: "Light & Dark mode con OS preference" },
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

      <SectionHeading title="Flujo de tokens — referencia visual" />
      <p className="ds-pattern-desc">
        Cómo un valor crudo se convierte en un componente. Este flujo garantiza que cambiar un primitivo actualiza todo el sistema automáticamente — dark mode, componentes y variantes incluidos.
      </p>
      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Token flow diagram */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 32px 1fr 32px 1fr", gap: 0, alignItems: "stretch" }}>
          {/* Primitivo */}
          <div style={{ borderRadius: "var(--r-lg) 0 0 var(--r-lg)", background: "var(--bg3)", border: "1px solid var(--border)", borderRight: "none", padding: "20px 20px" }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--txt3)", marginBottom: 12 }}>1 · Primitivo</div>
            <div style={{ fontSize: 11, fontFamily: "monospace", color: "var(--accent)", marginBottom: 8, fontWeight: 600 }}>--color-blue-700</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: "#0062cc", flexShrink: 0, boxShadow: "0 2px 8px rgba(0,98,204,0.4)" }} />
              <div style={{ fontSize: 12, fontFamily: "monospace", color: "var(--txt2)" }}>#0062cc</div>
            </div>
            <div style={{ fontSize: 10, color: "var(--txt3)", lineHeight: 1.5 }}>Valor raw. No se usa en componentes directamente.</div>
          </div>
          {/* Arrow 1 */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg3)", border: "1px solid var(--border)", borderLeft: "none", borderRight: "none" }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10h12M12 6l4 4-4 4" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          {/* Semántico */}
          <div style={{ background: "rgba(0,98,204,0.05)", border: "1px solid rgba(0,98,204,0.2)", borderLeft: "none", borderRight: "none", padding: "20px 20px" }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 12 }}>2 · Semántico</div>
            <div style={{ fontSize: 11, fontFamily: "monospace", color: "var(--accent)", marginBottom: 8, fontWeight: 600 }}>--accent</div>
            <div style={{ fontSize: 11, color: "var(--txt3)", fontFamily: "monospace", marginBottom: 3 }}>☀️ light: #0062cc</div>
            <div style={{ fontSize: 11, color: "rgba(41,151,255,0.8)", fontFamily: "monospace", marginBottom: 6 }}>🌙 dark: #2997ff</div>
            <div style={{ fontSize: 10, color: "var(--txt3)", lineHeight: 1.5 }}>Alias con propósito. Cambia entre temas automáticamente.</div>
          </div>
          {/* Arrow 2 */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,98,204,0.05)", border: "1px solid rgba(0,98,204,0.2)", borderLeft: "none", borderRight: "none" }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10h12M12 6l4 4-4 4" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          {/* Componente */}
          <div style={{ borderRadius: "0 var(--r-lg) var(--r-lg) 0", background: "rgba(0,98,204,0.09)", border: "1px solid rgba(0,98,204,0.28)", borderLeft: "none", padding: "20px 20px" }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 12 }}>3 · Componente</div>
            <div style={{ fontSize: 11, fontFamily: "monospace", color: "var(--accent)", marginBottom: 10, fontWeight: 600 }}>--btn-primary-bg</div>
            <button className="btn-p" style={{ cursor: "default", fontSize: 13, padding: "8px 18px", transform: "none" }}>Acción →</button>
            <div style={{ fontSize: 10, color: "var(--txt3)", lineHeight: 1.5, marginTop: 8 }}>Token de componente. Permite override sin romper el sistema.</div>
          </div>
        </div>
        {/* Multi-token example */}
        <div style={{ padding: "16px 20px", background: "var(--bg2)", borderRadius: "var(--r-lg)", border: "1px solid var(--border)", display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--txt3)", alignSelf: "center", flexShrink: 0 }}>Un botón usa:</div>
          {[
            { token: "--accent", desc: "bg" },
            { token: "--accent-h", desc: "bg hover" },
            { token: "--r-full", desc: "border-radius" },
            { token: "--shadow-accent", desc: "box-shadow hover" },
            { token: "--portfolio-font", desc: "font-family" },
          ].map(({ token, desc }) => (
            <div key={token} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <code style={{ fontSize: 10, color: "var(--accent)", fontWeight: 700 }}>{token}</code>
              <div style={{ fontSize: 10, color: "var(--txt3)" }}>{desc}</div>
            </div>
          ))}
        </div>
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
        { name: "--bg", light: "#f8f8f8", dark: "#0a0b12", usage: "Fondo base de la app" },
        { name: "--bg2", light: "#ffffff", dark: "#0f1018", usage: "Fondo de tarjetas y superficies elevadas" },
        { name: "--bg3", light: "#f0f0f0", dark: "#171926", usage: "Fondo de tercer nivel, hover, inputs" },
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

      <SectionHeading title="Tokens en contexto — referencia visual" />
      <p className="ds-pattern-desc">
        Cómo los tokens semánticos trabajan juntos en una tarjeta típica. Este patrón es el mismo en light y dark: los colores cambian automáticamente.
      </p>
      <PreviewBox label="Tarjeta de sección con todos los tokens aplicados">
        <div style={{ background: "var(--bg)", padding: 20, borderRadius: 16, width: "100%", maxWidth: 380 }}>
          {/* Page bg */}
          <div style={{ fontSize: 9, color: "var(--txt3)", fontFamily: "monospace", marginBottom: 8, letterSpacing: "0.05em" }}>--bg (page background)</div>
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 9, color: "var(--txt3)", fontFamily: "monospace", marginBottom: 6, letterSpacing: "0.05em" }}>--bg2 · --border</div>
            {/* Label */}
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 4 }}>--accent · label</div>
            {/* Title */}
            <div style={{ fontFamily: "var(--portfolio-heading-font)", fontSize: 18, fontWeight: 700, color: "var(--txt)", letterSpacing: "-0.02em", marginBottom: 4 }}>--txt · Título principal</div>
            {/* Secondary */}
            <div style={{ fontSize: 13, color: "var(--txt2)", lineHeight: 1.6, marginBottom: 10 }}>--txt2 · Descripción secundaria con detalle adicional para dar contexto al usuario.</div>
            {/* Muted */}
            <div style={{ fontSize: 11, color: "var(--txt3)", marginBottom: 12 }}>--txt3 · caption · metadata · 12px</div>
            {/* Divider */}
            <div style={{ height: 1, background: "var(--border)", marginBottom: 12 }} />
            <div style={{ fontSize: 9, color: "var(--txt3)", fontFamily: "monospace", marginBottom: 6 }}>--border divider</div>
            {/* Glass chip */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              <div style={{ padding: "4px 10px", borderRadius: 980, border: "1px solid var(--border)", background: "var(--glass)", fontSize: 11, color: "var(--txt2)" }}>--glass · --border</div>
              <div style={{ padding: "4px 10px", borderRadius: 980, background: "rgba(48,209,88,0.07)", border: "1px solid rgba(48,209,88,0.25)", fontSize: 11, color: "var(--success)" }}>--success</div>
              <div style={{ padding: "4px 10px", borderRadius: 980, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.25)", fontSize: 11, color: "var(--error)" }}>--error</div>
            </div>
            {/* Buttons */}
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1, height: 36, borderRadius: 980, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff", fontWeight: 600 }}>--accent → btn-p</div>
              <div style={{ flex: 1, height: 36, borderRadius: 980, border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "var(--txt2)" }}>ghost → btn-g</div>
            </div>
          </div>
          {/* Shadow demo */}
          <div style={{ marginTop: 12, fontSize: 9, color: "var(--txt3)", fontFamily: "monospace" }}>--shadow · --shadow-xl (hover)</div>
        </div>
      </PreviewBox>
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

      <SectionHeading title="Jerarquía tipográfica — referencia visual" />
      <p className="ds-pattern-desc">
        Cómo se ven los niveles juntos en una sección real. La jerarquía se lee instantáneamente: tamaño + peso + color crean orden sin necesidad de separadores.
      </p>
      <div className="ds-anatomy-wrap" style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Label */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)" }}>Label XS · 11px · 0.12em · uppercase</div>
          <div style={{ padding: "2px 8px", borderRadius: 4, background: "rgba(0,98,204,0.08)", fontSize: 10, fontFamily: "monospace", color: "var(--accent)" }}>.s-label</div>
        </div>
        {/* H1 */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <div style={{ fontFamily: "var(--portfolio-heading-font)", fontSize: 44, fontWeight: 800, letterSpacing: "-0.045em", lineHeight: 1.05, color: "var(--txt)" }}>Hero XL</div>
          <div style={{ padding: "2px 8px", borderRadius: 4, background: "var(--bg3)", fontSize: 10, fontFamily: "monospace", color: "var(--txt3)" }}>800 / -0.045em / 1.05lh</div>
        </div>
        {/* H2 */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <div style={{ fontFamily: "var(--portfolio-heading-font)", fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, color: "var(--txt)" }}>Heading de sección</div>
          <div style={{ padding: "2px 8px", borderRadius: 4, background: "var(--bg3)", fontSize: 10, fontFamily: "monospace", color: "var(--txt3)" }}>700 / -0.03em / 1.1lh</div>
        </div>
        {/* Lead */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <div style={{ fontSize: 17, fontWeight: 400, lineHeight: 1.65, color: "var(--txt2)" }}>Texto lead · subtítulos de sección</div>
          <div style={{ padding: "2px 8px", borderRadius: 4, background: "var(--bg3)", fontSize: 10, fontFamily: "monospace", color: "var(--txt3)" }}>400 / normal / 1.65lh</div>
        </div>
        {/* Body */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 400, lineHeight: 1.65, color: "var(--txt2)", maxWidth: 340 }}>Body text. Me especializo en interfaces digitales que equilibran estética refinada con funcionalidad real.</div>
          <div style={{ padding: "2px 8px", borderRadius: 4, background: "var(--bg3)", fontSize: 10, fontFamily: "monospace", color: "var(--txt3)", flexShrink: 0 }}>15px / DM Sans</div>
        </div>
        {/* Caption */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 4, borderTop: "1px solid var(--border)" }}>
          <div style={{ fontSize: 12, color: "var(--txt3)" }}>Caption · metadata · fechas · labels de campo</div>
          <div style={{ padding: "2px 8px", borderRadius: 4, background: "var(--bg3)", fontSize: 10, fontFamily: "monospace", color: "var(--txt3)" }}>12px / txt3</div>
        </div>
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

      <SectionHeading title="Project Card Featured — anatomía completa" />
      <p className="ds-pattern-desc">
        La card más compleja del sistema — featured card (span 2, 16:10). Todos los elementos son posicionados absolutos sobre el thumbnail. La capa de información usa un gradiente ascendente para garantizar legibilidad sobre cualquier imagen.
      </p>
      <div className="ds-anatomy-wrap">
        {/* Realistic card mockup */}
        <div style={{ position: "relative", width: "100%", aspectRatio: "16/8", background: "linear-gradient(135deg, #060d1e 0%, #0a1830 35%, #0c2040 60%, #07111e 100%)", overflow: "hidden", borderRadius: "var(--r-xl) var(--r-xl) 0 0" }}>
          {/* Simulated image depth */}
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 25% 35%, rgba(41,151,255,0.18) 0%, transparent 55%), radial-gradient(ellipse at 75% 20%, rgba(0,62,128,0.12) 0%, transparent 50%), radial-gradient(ellipse at 60% 70%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 100%)" }} />
          {/* Grid lines (subtle) */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.04 }} viewBox="0 0 400 200" preserveAspectRatio="none">
            {[50,100,150,200,250,300,350].map(x => <line key={x} x1={x} y1="0" x2={x} y2="200" stroke="white" strokeWidth="0.5"/>)}
            {[40,80,120,160].map(y => <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="white" strokeWidth="0.5"/>)}
          </svg>
          {/* Overlay gradient */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.10) 40%, rgba(0,0,0,0.80) 100%)" }} />
          {/* .p-card-num */}
          <div style={{ position: "absolute", top: 18, left: 22, fontFamily: "var(--portfolio-heading-font)", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.35)" }}>01</div>
          {/* .p-stat */}
          <div style={{ position: "absolute", top: 14, right: 16, padding: "4px 10px", borderRadius: 980, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.12)", fontSize: 11, color: "rgba(255,255,255,0.7)", whiteSpace: "nowrap" }}>+34% conversión</div>
          {/* .p-card-info */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "28px 26px 26px", background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.60) 55%, transparent 100%)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "rgba(255,255,255,0.60)", marginBottom: 5 }}>UX/UI Design</div>
            <div style={{ fontFamily: "var(--portfolio-heading-font)", fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", color: "rgba(245,245,247,0.95)", marginBottom: 7, lineHeight: 1.2 }}>E-commerce Redesign Platform</div>
            <div style={{ fontSize: 13, lineHeight: 1.55, color: "rgba(255,255,255,0.60)", marginBottom: 14, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as React.CSSProperties["WebkitBoxOrient"] }}>Rediseño completo de plataforma con foco en conversión y experiencia de usuario móvil.</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.10)" }}>
              <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.06em", color: "rgba(255,255,255,0.38)" }}>2024</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.65)", display: "flex", alignItems: "center", gap: 5 }}>Ver caso →</div>
            </div>
          </div>
        </div>
        {/* Annotation grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: "var(--border)", gap: "1px" }}>
          {[
            { cls: ".p-card-num", val: "absolute top:18 left:22 · 11px/700 · 0.14em · rgba(255,255,255,0.35)" },
            { cls: ".p-stat (badge)", val: "absolute top:14 right:16 · blur(8px) · rgba(0,0,0,0.55) · 11px/rgba(255,255,255,0.7)" },
            { cls: ".p-card-thumb-overlay", val: "gradient to bottom · rgba(0,0,0,0.04)→0.80 · z-index: 2" },
            { cls: ".p-cat", val: "11px/700 · 0.10em uppercase · rgba(255,255,255,0.60) · mb:5" },
            { cls: ".p-name (featured)", val: "Plus Jakarta 20px/700 · -0.02em · rgba(245,245,247,0.95)" },
            { cls: ".p-desc", val: "13px · 1.55lh · rgba(255,255,255,0.60) · -webkit-line-clamp: 2" },
            { cls: ".p-year", val: "11px/500 · 0.06em · rgba(255,255,255,0.38)" },
            { cls: ".p-cta-hint", val: "12px/600 · rgba(255,255,255,0.65) · hover: color:#fff + translateX(4px)" },
            { cls: ".p-card-info (featured)", val: "padding: 28px 26px 26px · gradient to top rgba(0,0,0,0.95)→0" },
          ].map(({ cls, val }) => (
            <div key={cls} style={{ padding: "10px 14px", background: "var(--bg2)" }}>
              <code style={{ display: "block", fontSize: 10, color: "var(--accent)", fontWeight: 700, marginBottom: 3 }}>{cls}</code>
              <div style={{ fontSize: 10, color: "var(--txt3)", lineHeight: 1.4 }}>{val}</div>
            </div>
          ))}
        </div>
        {/* Bento grid indicator */}
        <div style={{ padding: "12px 16px", background: "var(--bg3)", borderTop: "1px solid var(--border)", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--txt3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Grid position</div>
          {[
            { cls: ".p-card--featured", val: "grid-column: span 2 · aspect-ratio: 16/10" },
            { cls: ".p-card--compact", val: "grid-column: span 1 · min-height: 280px" },
            { cls: ".projects-bento", val: "grid-template-columns: repeat(3, 1fr) · gap: 16px" },
          ].map(({ cls, val }) => (
            <div key={cls} style={{ display: "flex", gap: 6, alignItems: "baseline" }}>
              <code style={{ fontSize: 10, color: "var(--accent)", fontWeight: 700, flexShrink: 0 }}>{cls}</code>
              <div style={{ fontSize: 10, color: "var(--txt3)" }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

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

      <SectionHeading title="Floating label — 4 estados en secuencia" />
      <p className="ds-pattern-desc">
        El label transiciona entre 4 estados. El CSS detecta <code>:focus</code> y <code>:not(:placeholder-shown)</code> para subir automáticamente. No se necesita JavaScript para el estado Filled.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 16 }}>
        {/* State 1: Idle */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ position: "relative", height: 56, borderRadius: 12, border: "1.5px solid rgba(0,0,0,0.12)", background: "rgba(0,0,0,0.04)", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 17, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: "rgba(0,0,0,0.38)", pointerEvents: "none", fontFamily: "var(--portfolio-font)" }}>Nombre *</div>
          </div>
          <div style={{ padding: "8px 10px", background: "var(--bg3)", borderRadius: 8, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--txt3)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>1. Idle</div>
            <div style={{ fontSize: 9, color: "var(--txt3)", lineHeight: 1.5, fontFamily: "monospace" }}>top: 50% translateY(-50%)<br/>font-size: 15px<br/>color: rgba(0,0,0,0.38)</div>
          </div>
        </div>
        {/* State 2: Focus */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ position: "relative", height: 56, borderRadius: 12, border: "1.5px solid var(--accent)", background: "rgba(41,151,255,0.04)", overflow: "hidden", boxShadow: "0 0 0 3px rgba(41,151,255,0.15)" }}>
            <div style={{ position: "absolute", left: 17, top: 8, fontSize: 10, color: "var(--accent)", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", fontFamily: "var(--portfolio-font)" }}>NOMBRE *</div>
            <div style={{ position: "absolute", left: 17, bottom: 10, width: 40, height: 2, borderRadius: 1, background: "var(--accent)", animation: "blink 1s step-end infinite" }} />
          </div>
          <div style={{ padding: "8px 10px", background: "rgba(0,98,204,0.05)", borderRadius: 8, border: "1px solid rgba(0,98,204,0.2)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--accent)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>2. Focus</div>
            <div style={{ fontSize: 9, color: "var(--txt3)", lineHeight: 1.5, fontFamily: "monospace" }}>top: 8px · transform: none<br/>font-size: 10px · uppercase<br/>color: var(--accent)<br/>border: var(--accent)</div>
          </div>
        </div>
        {/* State 3: Filled */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ position: "relative", height: 56, borderRadius: 12, border: "1.5px solid rgba(0,0,0,0.12)", background: "rgba(0,0,0,0.04)", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 17, top: 8, fontSize: 10, color: "var(--accent)", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", fontFamily: "var(--portfolio-font)" }}>NOMBRE *</div>
            <div style={{ position: "absolute", left: 17, bottom: 10, fontSize: 15, color: "var(--txt)", fontFamily: "var(--portfolio-font)" }}>Carlos Rojas</div>
          </div>
          <div style={{ padding: "8px 10px", background: "var(--bg3)", borderRadius: 8, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--txt3)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>3. Filled</div>
            <div style={{ fontSize: 9, color: "var(--txt3)", lineHeight: 1.5, fontFamily: "monospace" }}>:not(:placeholder-shown)<br/>label permanece arriba<br/>sin focus ring<br/>border: normal</div>
          </div>
        </div>
        {/* State 4: Error */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ position: "relative", height: 56, borderRadius: 12, border: "1.5px solid var(--error)", background: "rgba(239,68,68,0.04)", overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 17, top: 8, fontSize: 10, color: "var(--error)", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", fontFamily: "var(--portfolio-font)" }}>NOMBRE *</div>
              <div style={{ position: "absolute", left: 17, bottom: 10, fontSize: 15, color: "var(--txt)", fontFamily: "var(--portfolio-font)" }}>123</div>
            </div>
            <div style={{ fontSize: 10, color: "var(--error)", paddingLeft: 4, lineHeight: 1.3 }}>El nombre no puede contener números.</div>
          </div>
          <div style={{ padding: "8px 10px", background: "rgba(239,68,68,0.05)", borderRadius: 8, border: "1px solid rgba(239,68,68,0.25)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--error)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>4. Error</div>
            <div style={{ fontSize: 9, color: "var(--txt3)", lineHeight: 1.5, fontFamily: "monospace" }}>border: var(--error)<br/>label: color: var(--error)<br/>mensaje: role=&quot;alert&quot;<br/>aria-live=&quot;assertive&quot;</div>
          </div>
        </div>
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

      <SectionHeading title="Anatomía del navbar — referencia visual" />
      <p className="ds-pattern-desc">Las 3 zonas del navbar con sus componentes internos. El pill activo es un elemento absolutamente posicionado detrás de los nav-items — se mueve con JS spring animation.</p>
      <div className="ds-anatomy-wrap">
        {/* Full navbar mockup */}
        <div style={{
          height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 24px", background: "var(--navbar-bg)", backdropFilter: "blur(48px)",
          borderBottom: "1px solid var(--border)",
        }}>
          {/* Logo zone */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)" }} />
            <div style={{ fontFamily: "var(--portfolio-heading-font)", fontWeight: 700, fontSize: 14, letterSpacing: "-0.03em", color: "var(--txt)" }}>Project Zero</div>
          </div>
          {/* Nav center with pill */}
          <div style={{ display: "flex", gap: 2, position: "relative", alignItems: "center" }}>
            {/* Pill */}
            <div style={{
              position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
              height: 32, width: 56, borderRadius: 8, background: "var(--glass-hover)", pointerEvents: "none",
              transition: "left 350ms cubic-bezier(0.34,1.56,0.64,1), width 350ms cubic-bezier(0.34,1.56,0.64,1)",
            }} />
            {["Home","Trabajos","Sobre Mí","CV","Contacto"].map((label, i) => (
              <div key={label} style={{
                padding: "7px 14px", borderRadius: 8, fontSize: 13, fontWeight: i === 0 ? 600 : 500,
                color: i === 0 ? "var(--txt)" : "var(--txt2)", cursor: "pointer",
                position: "relative", zIndex: 1, whiteSpace: "nowrap",
              }}>
                {label}
              </div>
            ))}
          </div>
          {/* Right zone */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Theme toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: 2, padding: 4, border: "1px solid var(--border)", borderRadius: 980, background: "var(--glass)" }}>
              <div style={{ width: 32, height: 32, borderRadius: 980, background: "var(--bg2)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.14)" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--txt)" }}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>
              </div>
              <div style={{ width: 32, height: 32, borderRadius: 980, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--txt3)" }}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              </div>
            </div>
            <div style={{ padding: "7px 14px", borderRadius: 980, border: "1px solid var(--border)", fontSize: 12, color: "var(--txt)", fontWeight: 500, cursor: "pointer" }}>Perfil</div>
          </div>
        </div>
        {/* Annotation row */}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 24px", background: "var(--bg3)", borderTop: "1px solid var(--border)" }}>
          {[
            { zone: ".nav-logo", desc: "Logo · dot + text · cursor pointer → goHome()" },
            { zone: ".nav-center + .nav-pill", desc: "Items + pill absoluto · spring animation 350ms · z-index 0/1" },
            { zone: ".nav-right", desc: "ThemeToggle · btn-profile · gap 8px" },
          ].map(({ zone, desc }) => (
            <div key={zone} style={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: "32%" }}>
              <code style={{ fontSize: 10, color: "var(--accent)", fontWeight: 700 }}>{zone}</code>
              <div style={{ fontSize: 10, color: "var(--txt3)", lineHeight: 1.4 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      <SectionHeading title="Navbar — sliding pill" />
      <PreviewBox label="Click en los ítems para animar el pill">
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 16px", height: 56, background: "var(--navbar-bg, rgba(248,248,248,0.82))",
          borderRadius: 14, border: "1px solid var(--border)", width: "100%",
          boxSizing: "border-box", fontFamily: "var(--portfolio-font)"
        }}>
          <div style={{ fontFamily: "var(--portfolio-heading-font)", fontWeight: 700, fontSize: 14, letterSpacing: "-0.03em", color: "var(--txt)" }}>Project Zero</div>
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

      <SectionHeading title="Badges en su contexto natural — referencia visual" />
      <p className="ds-pattern-desc">
        Cada badge/tag tiene un lugar específico en la UI. Este diagrama muestra dónde vive cada uno y con qué otros elementos coexiste.
      </p>
      <div className="ds-anatomy-wrap" style={{ padding: 0 }}>
        {/* Hero section fragment */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, background: "linear-gradient(135deg, rgba(0,98,204,0.04) 0%, transparent 100%)" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 980, border: "1px solid var(--border)", background: "var(--glass)", fontSize: 12, color: "var(--txt2)" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)", animation: "badgePulse 2s ease infinite" }} />
            Product Designer
          </div>
          <code style={{ fontSize: 10, color: "var(--txt3)", fontFamily: "monospace" }}>hero-tag · hero-dot</code>
          <div style={{ marginLeft: "auto", fontSize: 10, color: "var(--txt3)" }}>hero section</div>
        </div>
        {/* Navbar fragment */}
        <div style={{ padding: "14px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, background: "rgba(248,248,248,0.7)" }}>
          <div style={{ padding: "4px 10px", borderRadius: 980, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.12)", fontSize: 11, color: "rgba(255,255,255,0.7)", display: "inline-block" }}>+34% conversión</div>
          <code style={{ fontSize: 10, color: "var(--txt3)", fontFamily: "monospace" }}>p-stat · p-stat--animated</code>
          <div style={{ marginLeft: "auto", fontSize: 10, color: "var(--txt3)" }}>sobre project-card thumb</div>
        </div>
        {/* Contact section */}
        <div style={{ padding: "14px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 980, border: "1px solid rgba(48,209,88,0.3)", background: "rgba(48,209,88,0.07)", fontSize: 13, color: "var(--success)" }}>
            <div className="avail-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)", flexShrink: 0 }} />
            Disponible 2026
          </div>
          <code style={{ fontSize: 10, color: "var(--txt3)", fontFamily: "monospace" }}>contact-avail · avail-dot</code>
          <div style={{ marginLeft: "auto", fontSize: 10, color: "var(--txt3)" }}>about y contact</div>
        </div>
        {/* Skills section */}
        <div style={{ padding: "14px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["Figma", "React", "TypeScript", "Design Systems"].map(s => (
              <div key={s} style={{ padding: "6px 14px", borderRadius: 980, border: "1px solid var(--border)", background: "rgba(255,255,255,0.65)", backdropFilter: "blur(8px)", fontSize: 13, color: "var(--txt2)" }}>{s}</div>
            ))}
          </div>
          <code style={{ fontSize: 10, color: "var(--txt3)", fontFamily: "monospace" }}>skill-tag</code>
          <div style={{ marginLeft: "auto", fontSize: 10, color: "var(--txt3)" }}>about section</div>
        </div>
        {/* Blog tags */}
        <div style={{ padding: "14px 24px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 6 }}>
            {["#design", "#frontend", "#ux"].map((t, i) => (
              <div key={t} style={{ padding: "3px 9px", borderRadius: 980, border: `1px solid ${i === 0 ? "var(--accent)" : "var(--border)"}`, fontSize: 11, fontWeight: 500, color: i === 0 ? "var(--accent)" : "var(--txt3)", background: i === 0 ? "rgba(0,98,204,0.06)" : "var(--glass)" }}>{t}</div>
            ))}
          </div>
          <code style={{ fontSize: 10, color: "var(--txt3)", fontFamily: "monospace" }}>blog-tag · blog-tag.active</code>
          <div style={{ marginLeft: "auto", fontSize: 10, color: "var(--txt3)" }}>blog cards y posts</div>
        </div>
      </div>

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

      <SectionHeading title="Referencia visual — todos los patrones de layout" />
      <p className="ds-pattern-desc">
        Vista de pájaro de los 4 patrones de layout. Los diagramas muestran la estructura de columnas y la jerarquía visual de cada sección.
      </p>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginTop: 12, alignItems: "flex-start" }}>
        {/* Hero stack */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--txt3)" }}>1. Hero Sticky Stack</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, width: 120 }}>
            <WF label="NAVBAR z:100 fixed" style={{ height: 10 }} />
            <WF label="HERO z:1 sticky top:0" style={{ height: 44, fontSize: 6 }} />
            <WF label="PROJECTS SHEET z:2 (desliza encima)" style={{ height: 36, fontSize: 6 }} accent />
            <WF label="WebGL canvas z:0 fixed" style={{ height: 10, opacity: 0.5 }} />
          </div>
          <div style={{ fontSize: 9, color: "var(--txt3)", maxWidth: 120 }}>El sheet tiene z:2 y sube cubriendo al hero sticky</div>
        </div>
        {/* Bento Z */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--txt3)" }}>2. Bento Grid Z-pattern</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, width: 140 }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 2 }}>
              <WF label="FEATURED 01 · 16:10" style={{ height: 30 }} accent />
              <WF label="COMPACT 02" style={{ height: 30 }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 2 }}>
              <WF label="COMPACT 03" style={{ height: 30 }} />
              <WF label="FEATURED 04 · 16:10" style={{ height: 30 }} accent />
            </div>
          </div>
          <div style={{ fontSize: 9, color: "var(--txt3)", maxWidth: 140 }}>pos % 4 === 0,3 → featured · pos % 4 === 1,2 → compact</div>
        </div>
        {/* About grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--txt3)" }}>3. About Grid (300px + 1fr)</div>
          <div style={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: 3, width: 160 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <WF label="FOTO 3:4" style={{ height: 56 }} accent />
              <WF label="BADGE" style={{ height: 10, fontSize: 6 }} accent />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <WF label="STATS 3 cols" style={{ height: 18 }} />
              <WF label="BIO 16px/1.8" style={{ height: 22 }} />
              <WF label="SKILLS wrap" style={{ height: 14 }} />
              <WF label="CTA" style={{ height: 12 }} />
            </div>
          </div>
          <div style={{ fontSize: 9, color: "var(--txt3)", maxWidth: 160 }}>Foto sticky · colapsa a 1col a ≤860px</div>
        </div>
        {/* Contact split */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--txt3)" }}>4. Contact Split (1fr + 1.1fr)</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 3, width: 160 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <WF label="TAGLINE" style={{ height: 16 }} />
              <WF label="SUB 15px" style={{ height: 14 }} />
              <WF label="LINKS" style={{ height: 24 }} />
              <WF label="AVAILABLE" style={{ height: 10, fontSize: 6 }} />
            </div>
            <WF label="FORM CARD glassmorphism" style={{ height: 68, fontSize: 7 }} accent />
          </div>
          <div style={{ fontSize: 9, color: "var(--txt3)", maxWidth: 160 }}>Colapsa a 1col a ≤820px · gap 48px</div>
        </div>
      </div>
    </div>
  )
}

// ── Page: Detalle de Proyecto ─────────────────────────────────────────────────
function PageProjectDetail() {
  return (
    <div className="ds-page-body">
      <div className="ds-page-header">
        <div className="ds-page-badge">Patrones</div>
        <h2 className="ds-page-title">Detalle de Proyecto — Vista completa</h2>
        <p className="ds-page-desc">
          La vista que reemplaza la card del bento grid cuando se hace click en un proyecto. Es la interacción más elaborada
          del sitio: no es una navegación normal, es una <strong>transición morph</strong> — la card crece visualmente hasta
          convertirse en la página de detalle, en vez de cortar a una pantalla nueva.
        </p>
      </div>

      <SectionHeading title="Morph Transition — de card a detalle" />
      <p className="ds-pattern-desc">
        Al hacer click en una <code>p-card</code>, esta se clona (<code>#project-morph-clone</code>) y se agranda sobre un
        backdrop (<code>#project-morph-backdrop</code>) que vive directo en <code>&lt;body&gt;</code> — fuera del árbol de
        React — porque tiene que sobrevivir al cambio de ruta que desmonta el bento grid. La vista de detalle real se monta
        debajo, invisible, y cuando está lista ambas capas (<code>clone</code> + <code>backdrop</code>) se desvanecen juntas
        con un <code>fade 400ms</code> para revelarla. Fundirlas juntas (no solo remover el clone) es lo que hace que se vea
        como una transición y no como un &quot;pop&quot; instantáneo.
      </p>
      <div className="ds-layer-diagram">
        {[
          { z: "1 · click en p-card", label: "Se clona el nodo real sobre <body>, con su rect ya medido (getBoundingClientRect)" },
          { z: "2 · navegación",      label: "El bento grid se desmonta, la vista de detalle se monta con mounted=false" },
          { z: "3 · +50ms",           label: "mounted → true — el contenido real empieza su entrada (stagger propio)" },
          { z: "4 · fade 400ms",      label: "clone + backdrop fundidos a opacity:0 en paralelo, luego remove() del DOM" },
        ].map(({ z, label }) => (
          <div key={z} className="ds-layer-row">
            <span className="ds-layer-z">{z}</span>
            <span className="ds-layer-label">{label}</span>
          </div>
        ))}
      </div>
      <CodeBlock code={`// project-detail-view.tsx — hand-off del clone al contenido real
useEffect(() => {
  const clone    = document.getElementById("project-morph-clone")
  const backdrop = document.getElementById("project-morph-backdrop")
  if (!clone && !backdrop) return

  // Fade — no remove() directo: si el backdrop desaparece de golpe,
  // el contenido real (que ya terminó su propia entrada por debajo,
  // invisible) simplemente "aparece", no hay cross-fade percibido.
  ;[clone, backdrop].forEach(el => {
    if (!el) return
    el.style.transition = "opacity 400ms cubic-bezier(0.16, 1, 0.3, 1)"
    el.style.opacity = "0"
  })
  const t = setTimeout(() => { clone?.remove(); backdrop?.remove() }, 400)
  return () => clearTimeout(t)
}, [])

// Salida — misma lógica de guard que Profile Modal, EXIT_DURATION más
// corto que la entrada (las salidas se sienten mejor rápidas)
const EXIT_DURATION = 300
function handleBack(scrollTarget?: "projects") {
  if (exiting) return
  setExiting(true)
  setTimeout(() => onBack(scrollTarget), EXIT_DURATION)
}`} />

      <SectionHeading title="Breadcrumb Navbar" />
      <p className="ds-pattern-desc">
        Navbar propio de la vista de detalle (no reutiliza <code>AppNavbar</code> — el contexto es distinto: no hay secciones
        que navegar, solo un camino de vuelta).
      </p>
      <PreviewBox label="Anatomía">
        <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderRadius: 10, background: "var(--bg2)", border: "1px solid var(--border)", fontSize: 13 }}>
          <span style={{ fontWeight: 700, color: "var(--txt)" }}>Project Zero</span>
          <span style={{ color: "var(--txt3)" }}>/</span>
          <span style={{ color: "var(--txt2)" }}>Trabajos</span>
          <span style={{ color: "var(--txt3)" }}>/</span>
          <span style={{ color: "var(--accent)", fontWeight: 600 }}>Redesign E-commerce</span>
        </div>
      </PreviewBox>
      <div className="ds-spec-table" style={{ marginTop: 12 }}>
        {[
          { prop: "logo → click",     val: "handleBack() — sin scrollTarget, vuelve al home tal cual estaba" },
          { prop: '"Trabajos" → click', val: 'handleBack("projects") — vuelve directo a la grilla, sin pasar por el hero' },
          { prop: "current",          val: "no clickeable — var(--txt), sin color de acento" },
          { prop: "theme toggle",     val: "mismo .toggle-track/.toggle-thumb que el resto del sitio" },
        ].map(({ prop, val }) => (
          <div key={prop} className="ds-spec-row">
            <span className="ds-spec-name">{prop}</span>
            <span className="ds-spec-val">{val}</span>
          </div>
        ))}
      </div>

      <SectionHeading title="Layout — Contenido + Sidebar sticky" />
      <p className="ds-pattern-desc">
        Dos columnas: contenido editorial (desafío / proceso / resultado / galería) a la izquierda, sidebar sticky de datos
        rápidos + CTAs a la derecha. El texto en negrita dentro de cada sección se inyecta con regex sobre el copy plano
        (porcentajes, montos, palabras clave) — no es contenido rico editado a mano.
      </p>
      <CodeBlock code={`// Negrita automática vía regex — el copy en projects.json es texto plano
<p dangerouslySetInnerHTML={{
  __html: project.result.replace(/(\\+?\\d+%|\\$[\\d.]+[MK]?)/g, "<strong>$1</strong>"),
}} />

// Galería — grid de 6 slots, cada click abre GalleryModal en ese índice
{galleryItems.map((item, index) => (
  <button onClick={() => { setModalIndex(index); setModalOpen(true) }}>
    {item.src ? <img src={item.src} /> : <PlaceholderThumb item={item} />}
  </button>
))}`} />
      <div className="ds-spec-table" style={{ marginTop: 12 }}>
        {[
          { prop: "detail-impact-box", val: "KPIs inline separados por · — ver página Tarjetas para el KPI card standalone" },
          { prop: "detail-gallery-grid", val: "6 slots fijos — imágenes subidas o placeholder, nunca vacío" },
          { prop: "detail-sidebar",    val: "sticky, se abre GalleryModal (ver página Modales) al click en cualquier slot" },
        ].map(({ prop, val }) => (
          <div key={prop} className="ds-spec-row">
            <span className="ds-spec-name">{prop}</span>
            <span className="ds-spec-val">{val}</span>
          </div>
        ))}
      </div>

      {/* ── Casos de uso — journey completo ── */}
      <SectionHeading title="Caso de uso — el recorrido completo" />
      <p className="ds-pattern-desc">
        No es una página aislada — es un ciclo cerrado. Cada paso de ida tiene su equivalente de vuelta, y ambos
        direcciones respetan las mismas duraciones (más rápida al volver, ver &quot;Reglas&quot; abajo).
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 4, marginTop: 12 }}>
        {[
          { label: "Bento Grid", desc: "/trabajos" },
          { label: "Click en p-card", desc: "clone + backdrop" },
          { label: "Morph 400ms", desc: "fade cruzado" },
          { label: "Detail View", desc: "mounted=true" },
          { label: '"Volver"', desc: "handleBack()" },
          { label: "Exit 300ms", desc: "de vuelta al grid" },
        ].map((step, i, arr) => (
          <div key={step.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{
              minWidth: 108, padding: "10px 12px", borderRadius: 10, textAlign: "center",
              background: i === 3 ? "rgba(0,98,204,0.09)" : "var(--bg2)",
              border: `1px solid ${i === 3 ? "rgba(0,98,204,0.28)" : "var(--border)"}`,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: i === 3 ? "var(--accent)" : "var(--txt)" }}>{step.label}</div>
              <div style={{ fontSize: 10, color: "var(--txt3)", marginTop: 2 }}>{step.desc}</div>
            </div>
            {i < arr.length - 1 && (
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
                <path d="M4 10h12M12 6l4 4-4 4" stroke="var(--txt3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        ))}
      </div>
      <p className="ds-pattern-desc" style={{ marginTop: 12 }}>
        Los dos puntos de entrada al ciclo son el mismo componente pero con distinto <code>scrollTarget</code>: el logo
        (<code>handleBack()</code>, vuelve donde estaba) y &quot;Trabajos&quot; en el breadcrumb (<code>handleBack(&quot;projects&quot;)</code>,
        salta directo a la grilla).
      </p>

      <SectionHeading title="Reglas de uso" />
      <div className="ds-rules">
        <RuleChip rule="Mantener EXIT_DURATION de salida más corto que la entrada — las salidas se sienten mejor rápidas" variant="do" />
        <RuleChip rule="Fundir clone + backdrop juntos, nunca solo remover uno de los dos de golpe" variant="do" />
        <RuleChip rule="Rellenar siempre los 6 slots de galería, con placeholder si falta imagen real" variant="do" />
        <RuleChip rule='Medir el rect del clone después de que Next ya haya podido re-scrollear la página — es una carrera que se pierde siempre' variant="dont" />
        <RuleChip rule="Reutilizar AppNavbar acá — el breadcrumb es un contexto de navegación distinto, no una sección más" variant="dont" />
      </div>
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

// ── Page: Modales ─────────────────────────────────────────────────────────────
function PageModals() {
  return (
    <div className="ds-page-body">
      <div className="ds-page-header">
        <div className="ds-page-badge">Componentes</div>
        <h2 className="ds-page-title">Modales y Overlays</h2>
        <p className="ds-page-desc">
          Dos sistemas de modal conviven en el sitio, cada uno resuelve un problema distinto: <strong>.overlay/.modal</strong> es
          la primitiva liviana en CSS puro para diálogos de contenido (perfil, confirmaciones futuras), y <strong>GalleryModal</strong> es
          un lightbox de media a pantalla completa construido sobre Radix Dialog. No son intercambiables — ver &quot;Reglas&quot; abajo
          para decidir cuál usar.
        </p>
      </div>

      {/* ── Overlay base ── */}
      <SectionHeading title="Overlay base — .overlay / .modal" />
      <p className="ds-pattern-desc">
        La primitiva de diálogo del sitio (fuera del panel admin). <code>position: fixed; inset: 0</code>, backdrop oscuro con blur,
        tarjeta centrada con <code>popIn</code> spring. El cierre usa una clase de salida (<code>.overlay--exiting</code>) en vez de
        desmontar directo — así la animación de salida (<code>popOut</code>/<code>fadeOut</code>, 180–200ms) llega a terminar antes
        de que React quite el nodo del DOM.
      </p>
      <PreviewBox label="Backdrop + tarjeta — fondo simulado dentro de la vista previa">
        <div style={{ position: "relative", width: "100%", height: 220, borderRadius: 12, overflow: "hidden", background: "var(--bg2)" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(10px)" }} />
          <div style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            width: 180, padding: 20, borderRadius: 16, textAlign: "center",
            background: "var(--card)", border: "1px solid var(--border)",
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--txt)", marginBottom: 4 }}>.modal</div>
            <div style={{ fontSize: 10, color: "var(--txt3)" }}>max-width: 340px · radius: 24px</div>
          </div>
        </div>
      </PreviewBox>
      <div className="ds-spec-table" style={{ marginTop: 12 }}>
        {[
          { prop: ".overlay",           val: "position: fixed; inset: 0; z-index: var(--z-modal) + 10" },
          { prop: "backdrop",           val: "rgba(0,0,0,0.55) + backdrop-filter: blur(10px)" },
          { prop: "entrada .overlay",   val: "fadeIn 0.2s ease" },
          { prop: "entrada .modal",     val: "popIn 0.3s cubic-bezier(0.34,1.56,0.64,1) — spring, overshoot 12%" },
          { prop: "salida .overlay--exiting", val: "fadeOut 0.2s ease forwards" },
          { prop: "salida .modal (en exiting)", val: "popOut 0.18s ease-in forwards — más rápida que la entrada" },
          { prop: ".modal",             val: "max-width: 340px · radius: 24px · padding: 32px" },
        ].map(({ prop, val }) => (
          <div key={prop} className="ds-spec-row">
            <span className="ds-spec-name">{prop}</span>
            <span className="ds-spec-val">{val}</span>
          </div>
        ))}
      </div>

      {/* ── Profile Modal ── */}
      <SectionHeading title="Profile Modal — anatomía completa" />
      <p className="ds-pattern-desc">
        Instancia concreta de <code>.overlay/.modal</code>. Carga el perfil vía <code>fetch(&quot;/api/admin/profile&quot;)</code> con
        fallback a datos por defecto si la API falla — nunca muestra un modal vacío. El avatar cae a iniciales si no hay foto o si la
        imagen falla en cargar (<code>onError</code>).
      </p>
      <PreviewBox label="Interactivo — contenido real del componente">
        <div style={{ position: "relative", width: "100%", height: 340, borderRadius: 12, overflow: "hidden", background: "var(--bg2)" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(10px)" }} />
          <div className="modal" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", margin: 0 }}>
            <button className="modal-x" aria-label="Cerrar">✕</button>
            <div className="m-av">C</div>
            <div className="m-name">Carlos Felipe Rojas Hickmann</div>
            <div className="m-role">Product Designer & Frontend Developer · Santiago</div>
            <div className="m-links">
              <span className="m-link">LinkedIn</span>
              <span className="m-link">GitHub</span>
            </div>
            <button className="btn-p" style={{ width: "100%", justifyContent: "center" }}>Contactar</button>
          </div>
        </div>
      </PreviewBox>
      <div className="ds-spec-table" style={{ marginTop: 12 }}>
        {[
          { prop: ".m-av",    val: "88px · circle · gradient accent→#5ac8fa · fallback: primera letra del nombre" },
          { prop: ".m-name",  val: "20px / w700 / -0.02em · heading font" },
          { prop: ".m-role",  val: "14px / var(--txt2)" },
          { prop: ".m-link",  val: "pill 12px · glass bg · solo se renderiza si el link existe (filter Boolean)" },
          { prop: "cierre",   val: "click en backdrop, ESC, o botón X — guardados detrás de un closingRef para evitar doble-cierre" },
          { prop: "CTA secundario", val: '"Acceso a administrador" → /admin, siempre visible al final' },
        ].map(({ prop, val }) => (
          <div key={prop} className="ds-spec-row">
            <span className="ds-spec-name">{prop}</span>
            <span className="ds-spec-val">{val}</span>
          </div>
        ))}
      </div>
      <CodeBlock code={`// Guard con ref — evita cerrar dos veces si el usuario
// presiona ESC justo cuando ya empezó la animación de salida
const closingRef = useRef(false)

function handleClose() {
  if (closingRef.current) return
  closingRef.current = true
  setExiting(true)
  setTimeout(onClose, EXIT_DURATION) // 200ms — debe calzar con popOut/fadeOut en CSS
}

useEffect(() => {
  const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose() }
  window.addEventListener("keydown", onKey)
  return () => window.removeEventListener("keydown", onKey)
}, [])

<div
  className={\`overlay\${exiting ? " overlay--exiting" : ""}\`}
  role="dialog" aria-modal="true"
  onClick={(e) => e.target === e.currentTarget && handleClose()}
>
  <div className="modal">…</div>
</div>`} />

      {/* ── Gallery Modal ── */}
      <SectionHeading title="Gallery Modal — Lightbox de galería" />
      <p className="ds-pattern-desc">
        Único componente del sitio construido sobre <strong>Radix Dialog + Tailwind</strong> en vez de CSS a mano — se eligió Radix
        aquí porque el foco trap, el manejo de scroll del body y el <code>aria-describedby</code> de un lightbox real son
        complejos de reimplementar bien, y no hay otro lightbox en el sitio que justifique escribirlo desde cero.
        Navegación por teclado (← →), swipe táctil (umbral 50px) y dots de posición. Cuando el proyecto no tiene imágenes
        subidas, cada slot cae a un <code>PlaceholderLayout</code> distinto (mobile/desktop/components/flow/research/final)
        en vez de dejar el slot vacío.
      </p>
      <div className="ds-spec-table">
        {[
          { prop: "overlay",      val: "bg-black/95 + backdrop-blur-xl · fade 300ms (Radix data-state)" },
          { prop: "swipe threshold", val: "50px — por debajo se interpreta como tap/scroll, no navegación" },
          { prop: "teclado",      val: "ArrowLeft / ArrowRight — wrap-around (último → primero)" },
          { prop: "controles prev/next", val: "hidden en mobile (sm:flex) — el swipe cubre la navegación ahí" },
          { prop: "dots",         val: "8px circle · activo: scale(1.25) + bg blanco sólido" },
          { prop: "placeholder",  val: "6 tipos de layout SVG-like generados con divs — nunca un slot vacío" },
        ].map(({ prop, val }) => (
          <div key={prop} className="ds-spec-row">
            <span className="ds-spec-name">{prop}</span>
            <span className="ds-spec-val">{val}</span>
          </div>
        ))}
      </div>
      <CodeBlock code={`<GalleryModal
  items={galleryItems}       // GalleryItem[] — src opcional, cae a placeholder si falta
  currentIndex={modalIndex}
  open={modalOpen}
  onOpenChange={setModalOpen}
  onNavigate={setModalIndex}
/>

// Cada item, si no tiene foto subida:
{ id: 2, label: "Vista móvil", gradient: project.gradient,
  accent: project.accentColor, placeholderType: "mobile" }`} />

      {/* ── Casos de uso — comparación visual ── */}
      <SectionHeading title="Cuándo usar cada uno — casos de uso" />
      <p className="ds-pattern-desc">
        La pregunta que decide cuál usar no es &quot;qué tan grande es el contenido&quot;, es <strong>qué tipo de contenido es</strong>.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12 }}>
        <div style={{ border: "1px solid var(--border)", borderRadius: 14, padding: 20, background: "var(--bg2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--card)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>💬</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--txt)" }}>.overlay / .modal</div>
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--txt3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Usar cuando el contenido es…</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "var(--txt2)", lineHeight: 1.7 }}>
            <li>Texto, datos o un formulario corto</li>
            <li>Info de una entidad (perfil, tarjeta de detalle)</li>
            <li>Una confirmación o una acción puntual</li>
          </ul>
          <div style={{ fontSize: 11, color: "var(--txt3)", marginTop: 10 }}>Ejemplo real: Profile Modal</div>
        </div>
        <div style={{ border: "1px solid var(--border)", borderRadius: 14, padding: 20, background: "var(--bg2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--card)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🖼️</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--txt)" }}>GalleryModal (Radix)</div>
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--txt3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Usar cuando el contenido es…</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "var(--txt2)", lineHeight: 1.7 }}>
            <li>Media a pantalla completa — fotos, capturas</li>
            <li>Una colección navegable (necesita prev/next)</li>
            <li>Algo que el usuario quiere explorar, no solo leer</li>
          </ul>
          <div style={{ fontSize: 11, color: "var(--txt3)", marginTop: 10 }}>Ejemplo real: galería de resultados en Detalle de Proyecto</div>
        </div>
      </div>
      <p className="ds-pattern-desc" style={{ marginTop: 12 }}>
        Señal rápida: si el usuario va a querer <em>navegar</em> entre varias piezas de contenido (siguiente/anterior), es
        GalleryModal. Si va a <em>leer o actuar</em> sobre una sola pieza, es .overlay/.modal.
      </p>

      {/* ── Reglas ── */}
      <SectionHeading title="Reglas de uso" />
      <div className="ds-rules">
        <RuleChip rule="Usar .overlay/.modal para cualquier diálogo de contenido nuevo — confirmaciones, formularios cortos, info" variant="do" />
        <RuleChip rule="Reservar GalleryModal (Radix) solo para visores de media a pantalla completa" variant="do" />
        <RuleChip rule="Guardar el cierre detrás de un ref (closingRef) si hay animación de salida con timeout" variant="do" />
        <RuleChip rule="Siempre cargar datos con fallback — un modal de perfil vacío se ve roto, no vacío-intencional" variant="do" />
        <RuleChip rule="Construir un nuevo modal a mano con Radix — usar Radix solo para media, para lo demás .overlay/.modal ya está resuelto" variant="dont" />
        <RuleChip rule="Desmontar el modal sin esperar la animación de salida — corta popOut/fadeOut a mitad" variant="dont" />
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
          Inter-sección &quot;Han confiado en mí&quot; entre proyectos y blog. Grid auto-fill que escala de 6 a 12 logos sin tocar código. Entrada con IntersectionObserver + stagger. Admin: <code>/admin → Marcas</code>.
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
  /* auto-fill (NO auto-fit) — preserva tracks vacíos para que los logos
     mantengan su tamaño mínimo de 130px aunque haya pocos items */
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
          <div style={{ height: 64, background: "linear-gradient(180deg, #f8f8f8 0%, #e4e4e4 100%)" }} />
          <div style={{ padding: "10px 14px", fontSize: 11, color: "var(--txt3)", fontFamily: "monospace" }}>
            light: var(--bg) → var(--bg4)
          </div>
        </div>
        <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)" }}>
          <div style={{ height: 64, background: "linear-gradient(180deg, #0a0b12 0%, #171926 100%)" }} />
          <div style={{ padding: "10px 14px", fontSize: 11, color: "var(--txt3)", fontFamily: "monospace" }}>
            dark: var(--bg) → var(--bg3)
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Page: Dark Mode ───────────────────────────────────────────────────────────
function PageDarkMode() {
  const { isDark } = useTheme()

  const TOKEN_PAIRS: { token: string; light: string; dark: string; usage: string }[] = [
    { token: "--bg",        light: "#f8f8f8",              dark: "#0a0b12",              usage: "Fondo principal de página" },
    { token: "--bg2",       light: "#ffffff",              dark: "#0f1018",              usage: "Superficie elevada (cards, modales)" },
    { token: "--bg3",       light: "#f0f0f0",              dark: "#171926",              usage: "Superficie deprimida (inputs, chips)" },
    { token: "--bg4",       light: "#e4e4e4",              dark: "#212430",              usage: "Profundidad máxima" },
    { token: "--txt",       light: "#1d1d1f",              dark: "#f5f5f7",              usage: "Texto primario" },
    { token: "--txt2",      light: "#3a3a40",              dark: "#b0b0b5",              usage: "Texto secundario" },
    { token: "--txt3",      light: "#5e5e64",              dark: "#8e8e93",              usage: "Labels, placeholders, muted" },
    { token: "--accent",    light: "#0062cc",              dark: "#2997ff",              usage: "Interactivo primario, links, CTAs" },
    { token: "--accent-h",  light: "#1a7fd4",              dark: "#5ac8fa",              usage: "Hover de accent" },
    { token: "--border",    light: "rgba(0,0,0,0.08)",     dark: "rgba(255,255,255,0.11)", usage: "Bordes de componentes" },
    { token: "--border-h",  light: "rgba(0,0,0,0.18)",     dark: "rgba(255,255,255,0.18)", usage: "Borde en hover" },
    { token: "--glass",     light: "rgba(0,0,0,0.03)",     dark: "rgba(255,255,255,0.04)", usage: "Superficie glass mínima" },
    { token: "--glass-hover",light:"rgba(0,0,0,0.06)",     dark: "rgba(255,255,255,0.07)", usage: "Glass hover feedback" },
    { token: "--shadow",    light: "rgba(0,0,0,0.12)",     dark: "rgba(0,0,0,0.60)",     usage: "Sombras generales" },
  ]

  const SHADOW_PAIRS: { token: string; light: string; dark: string }[] = [
    { token: "--shadow-xs",  light: "0 1px 3px rgba(0,0,0,0.06)",  dark: "0 1px 3px rgba(0,0,0,0.20)" },
    { token: "--shadow-sm",  light: "0 4px 12px rgba(0,0,0,0.08)", dark: "0 4px 12px rgba(0,0,0,0.30)" },
    { token: "--shadow-xl",  light: "0 16px 40px rgba(0,0,0,0.14)",dark: "0 16px 40px rgba(0,0,0,0.50)" },
    { token: "--shadow-2xl", light: "0 24px 64px rgba(0,0,0,0.28)",dark: "0 24px 64px rgba(0,0,0,0.70)" },
  ]

  return (
    <div className="ds-page-body">
      <div className="ds-page-header">
        <h2 className="ds-page-title">Modo Oscuro</h2>
        <p className="ds-page-desc">
          Sistema de dark mode basado en <strong>CSS variables + clase <code>.dark</code> en el elemento html</strong>.
          Los tokens semánticos sobrescriben sus valores sin JS en el render path.
          El tema persiste en <code>localStorage</code>. Si no hay preferencia guardada, respeta <code>prefers-color-scheme</code> del SO.
        </p>
      </div>

      {/* ── Mecanismo ── */}
      <SectionHeading title="Mecanismo de activación" />
      <p className="ds-pattern-desc">
        La clase <code>.dark</code> se aplica a <code>&lt;html&gt;</code> por <code>ThemeContext</code>.
        Al estar presente, todos los tokens semánticos sobrescriben sus valores vía el bloque <code>.dark &#123;&#125;</code>
        en <code>design-tokens.css</code>. Sin re-renders, sin flashes, sin JS en el crítico render path.
      </p>
      <CodeBlock code={`/* design-tokens.css */
:root {
  --txt: #1d1d1f;   /* light */
  --accent: #0062cc;
}

.dark {
  --txt: #f5f5f7;   /* override dark */
  --accent: #2997ff;
}

/* En cualquier componente — funciona en ambos modos */
.my-component {
  color: var(--txt);         /* ✓ responde al tema */
  background: var(--bg2);    /* ✓ responde al tema */
}

/* ✗ Jamás hardcodear */
.my-component {
  color: #1d1d1f;            /* roto en dark mode */
  background: white;         /* roto en dark mode */
}`} />

      {/* ── Token pairs ── */}
      <SectionHeading title="Pares de tokens — claro / oscuro" />
      <p className="ds-pattern-desc" style={{ marginBottom: 16 }}>
        Modo activo: <strong>{isDark ? "🌙 Oscuro" : "☀️ Claro"}</strong> — los valores resaltados son los vigentes.
      </p>
      <div className="ds-dm-table">
        <div className="ds-dm-header">
          <span>Token</span>
          <span style={{ textAlign: "center" }}>Claro</span>
          <span style={{ textAlign: "center" }}>Oscuro</span>
          <span>Uso</span>
        </div>
        {TOKEN_PAIRS.map(({ token, light, dark, usage }) => {
          const isColor = light.startsWith("#")
          return (
            <div key={token} className="ds-dm-row">
              <code className="ds-dm-token">{token}</code>
              <div className={`ds-dm-val${!isDark ? " ds-dm-val--active" : ""}`}>
                {isColor && (
                  <span className="ds-dm-swatch" style={{ background: light }} />
                )}
                <span className="ds-dm-hex">{light}</span>
              </div>
              <div className={`ds-dm-val${isDark ? " ds-dm-val--active" : ""}`}>
                {isColor && (
                  <span className="ds-dm-swatch ds-dm-swatch--dark" style={{ background: dark }} />
                )}
                <span className="ds-dm-hex">{dark}</span>
              </div>
              <span className="ds-dm-usage">{usage}</span>
            </div>
          )
        })}
      </div>

      {/* ── Shadow pairs ── */}
      <SectionHeading title="Sombras — escalado de opacidad" />
      <p className="ds-pattern-desc">
        Las sombras en dark mode multiplican la opacidad ×3–4 para ser visibles sobre fondos oscuros.
        En claro, sombras sutiles; en oscuro, sombras densas.
      </p>
      <div className="ds-dm-table ds-dm-table--3col">
        <div className="ds-dm-header">
          <span>Token</span>
          <span>Claro (opacidad baja)</span>
          <span>Oscuro (opacidad alta)</span>
        </div>
        {SHADOW_PAIRS.map(({ token, light, dark }) => (
          <div key={token} className="ds-dm-row">
            <code className="ds-dm-token">{token}</code>
            <span className="ds-dm-hex" style={{ fontSize: 11 }}>{light}</span>
            <span className="ds-dm-hex" style={{ fontSize: 11 }}>{dark}</span>
          </div>
        ))}
      </div>

      {/* ── Split visual comparison ── */}
      <SectionHeading title="Comparativa visual — mismo componente en ambos modos" />
      <p className="ds-pattern-desc">
        El mismo contact-form-card renderizado en modo claro y oscuro. Los tokens cambian; el componente TSX es idéntico. Esta es la garantía del sistema de tokens.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, borderRadius: "var(--r-xl)", overflow: "hidden", border: "1px solid var(--border)", marginTop: 16 }}>
        {/* Light mode */}
        <div style={{ background: "#f0f0f0", padding: "24px 20px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5e5e64", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#5e5e64" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>
            Modo Claro
          </div>
          <div style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 16, padding: 16, boxShadow: "0 12px 40px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.9)" }}>
            <div style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(0,0,0,0.35)", marginBottom: 12, lineHeight: 1.6 }}>bg: rgba(255,255,255,0.85)<br/>border: rgba(0,0,0,0.08)<br/>shadow: --shadow-lg</div>
            {[{ ph: "Nombre completo", type: "text" }, { ph: "Email", type: "email" }].map((f, i) => (
              <div key={i} style={{ position: "relative", height: 44, borderRadius: 10, border: "1.5px solid rgba(0,0,0,0.12)", background: "rgba(0,0,0,0.04)", marginBottom: 8, overflow: "hidden" }}>
                <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "rgba(0,0,0,0.38)" }}>{f.ph}</div>
                <div style={{ position: "absolute", top: 1, left: 6, fontSize: 7, fontFamily: "monospace", color: "rgba(0,0,0,0.25)" }}>rgba(0,0,0,0.04) · rgba(0,0,0,0.12)</div>
              </div>
            ))}
            <div style={{ height: 36, borderRadius: 980, background: "#0062cc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "white", fontWeight: 600, marginTop: 4 }}>Enviar →</div>
            <div style={{ fontSize: 8, fontFamily: "monospace", color: "rgba(0,0,0,0.35)", marginTop: 8, textAlign: "center" }}>--accent: #0062cc</div>
          </div>
        </div>
        {/* Dark mode */}
        <div style={{ background: "#171926", padding: "24px 20px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#8e8e93", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            Modo Oscuro
          </div>
          <div style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 16, padding: 16, boxShadow: "0 24px 48px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(255,255,255,0.3)", marginBottom: 12, lineHeight: 1.6 }}>bg: rgba(255,255,255,0.035)<br/>border: rgba(255,255,255,0.09)<br/>shadow: --shadow-2xl dark</div>
            {[{ ph: "Nombre completo" }, { ph: "Email" }].map((f, i) => (
              <div key={i} style={{ position: "relative", height: 44, borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.11)", background: "rgba(255,255,255,0.06)", marginBottom: 8, overflow: "hidden" }}>
                <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "rgba(255,255,255,0.38)" }}>{f.ph}</div>
                <div style={{ position: "absolute", top: 1, left: 6, fontSize: 7, fontFamily: "monospace", color: "rgba(255,255,255,0.2)" }}>rgba(255,255,255,0.06) · rgba(255,255,255,0.11)</div>
              </div>
            ))}
            <div style={{ height: 36, borderRadius: 980, background: "#2997ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "white", fontWeight: 600, marginTop: 4 }}>Enviar →</div>
            <div style={{ fontSize: 8, fontFamily: "monospace", color: "rgba(255,255,255,0.3)", marginTop: 8, textAlign: "center" }}>--accent dark: #2997ff</div>
          </div>
        </div>
      </div>

      {/* ── Theme toggle ── */}
      <SectionHeading title="Theme Toggle — componente" />
      <p className="ds-pattern-desc">
        Pill dual con dos botones (sol / luna). El botón activo recibe fondo <code>--bg2</code> + sombra sutil.
        El botón inactivo desaparece visualmente pero es clicable. Usado en <code>AppNavbar</code>.
      </p>
      <PreviewBox label="Vista actual">
        <div className="theme-toggle" role="group" aria-label="Modo de color (preview)">
          <button className={`theme-toggle-btn${!isDark ? " active" : ""}`} aria-label="Modo claro" style={{ cursor: "default" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          </button>
          <button className={`theme-toggle-btn${isDark ? " active" : ""}`} aria-label="Modo oscuro" style={{ cursor: "default" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </button>
        </div>
      </PreviewBox>
      <div className="ds-spec-table" style={{ marginTop: 16 }}>
        {[
          { prop: "btn-size",       val: "32px",        desc: "Tamaño visual del botón (hit area real: 44px vía ::before)" },
          { prop: "icon-size",      val: "15px",        desc: "SVG sol / luna" },
          { prop: "pill-padding",   val: "4px",         desc: "Padding del contenedor pill" },
          { prop: "gap",            val: "2px",         desc: "Espacio entre botones" },
          { prop: "active-bg",      val: "var(--bg2)",  desc: "Fondo botón activo" },
          { prop: "active-shadow",  val: "0 1px 4px rgba(0,0,0,0.14)", desc: "Sombra botón activo" },
          { prop: "hit-area",       val: "44×44px",     desc: "::before extiende el tap area WCAG 2.5.5 sin modificar el visual" },
        ].map(({ prop, val, desc }) => (
          <div key={prop} className="ds-spec-row">
            <span className="ds-spec-name">{prop}</span>
            <span className="ds-spec-val">{val}</span>
            <span className="ds-spec-val" style={{ color: "var(--txt3)" }}>{desc}</span>
          </div>
        ))}
      </div>

      {/* ── Reglas ── */}
      <SectionHeading title="Reglas de implementación" />
      <div className="ds-rules">
        <RuleChip rule="Siempre usa tokens semánticos — nunca hex directo en componentes" variant="do" />
        <RuleChip rule="Testea contraste en AMBOS modos (4.5:1 AA para texto)" variant="do" />
        <RuleChip rule="Usa var(--shadow-xl) dark mode sobrescribe automáticamente la opacidad" variant="do" />
        <RuleChip rule="Para glassmorphism oscuro: rgba(255,255,255,0.04) en vez de rgba(0,0,0,0.03)" variant="do" />
        <RuleChip rule='color: #1d1d1f — roto en dark mode, usa var(--txt)' variant="dont" />
        <RuleChip rule='background: white — usa var(--bg2)' variant="dont" />
        <RuleChip rule='border: 1px solid #e0e0e0 — usa var(--border)' variant="dont" />
        <RuleChip rule='Invertir colores con filter:invert() — distorsiona imágenes y videos' variant="dont" />
      </div>

      {/* ── Dark mode específico por componente ── */}
      <SectionHeading title="Overrides por componente" />
      <p className="ds-pattern-desc">
        Algunos componentes necesitan overrides adicionales más allá de los tokens base.
        El patrón es <code>.dark .component &#123;&#125;</code> directamente en el CSS del componente.
      </p>
      <CodeBlock code={`/* Glassmorphism — distinto en cada modo */
.navbar {
  background: var(--navbar-bg);   /* rgba(248,248,248,0.82) / rgba(0,0,0,0.75) */
  backdrop-filter: blur(48px);
}

/* Formulario de contacto — más opaco en dark */
.contact-form-card {
  background: rgba(255, 255, 255, 0.85);
}
.dark .contact-form-card {
  background: rgba(255, 255, 255, 0.035);   /* muy translúcido en dark */
  border: 1px solid rgba(255, 255, 255, 0.09);
}

/* Badge de disponibilidad — tinte oscuro */
.about-badge {
  background: rgba(255, 255, 255, 0.88);
}
.dark .about-badge {
  background: rgba(8, 12, 20, 0.82);
}`} />

      {/* ── ThemeContext API ── */}
      <SectionHeading title="ThemeContext API" />
      <CodeBlock code={`// lib/context/theme-context.tsx

// Prioridad de resolución del tema inicial:
// 1. localStorage["portfolio-theme"] si existe → "dark" o "light"
// 2. window.matchMedia("(prefers-color-scheme: dark)").matches → OS preference
// 3. false (light) → SSR default

function getInitialTheme(): boolean {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("portfolio-theme")
    if (stored !== null) return stored === "dark"
    return window.matchMedia("(prefers-color-scheme: dark)").matches
  }
  return false // SSR default: light
}

// Hook de uso en componentes
import { useTheme } from "@/lib/context/theme-context"

function MyComponent() {
  const { isDark, toggleTheme } = useTheme()
  // Mejor: usar var(--txt) directamente en CSS — no necesita isDark
  return <div style={{ color: "var(--txt)" }}>...</div>
}

// El ThemeProvider wrappea la app en app/layout.tsx.
// toggleTheme() persiste en localStorage y actualiza document.documentElement.classList.`} />
    </div>
  )
}

// ── Page: Primitivos ─────────────────────────────────────────────────────────
function PagePrimitivos() {
  const SPACING_TOKENS = [
    { name: "--space-1",  val: "4px",  usage: "Micro — gap entre iconos, badge padding interno" },
    { name: "--space-2",  val: "8px",  usage: "Base unit — gap entre elementos hermanos" },
    { name: "--space-3",  val: "12px", usage: "Gap en grids compactos, badge padding" },
    { name: "--space-4",  val: "16px", usage: "Padding estándar de componente" },
    { name: "--space-5",  val: "20px", usage: "Padding toast, admin-toast" },
    { name: "--space-6",  val: "24px", usage: "Gap entre tarjetas, padding de secciones mobile" },
    { name: "--space-7",  val: "28px", usage: "Toast position, gap secciones" },
    { name: "--space-8",  val: "32px", usage: "Padding de card, modal, form-card" },
    { name: "--space-10", val: "40px", usage: "Separación de bloques de contenido" },
    { name: "--space-12", val: "48px", usage: "Padding horizontal de sección (section-x)" },
    { name: "--space-14", val: "56px", usage: "Padding vertical inter-sección" },
    { name: "--space-16", val: "64px", usage: "Altura navbar y bottom-nav" },
    { name: "--space-20", val: "80px", usage: "Padding vertical de sección (section-y)" },
    { name: "--space-24", val: "96px", usage: "Navbar offset para contenido under-sticky" },
  ]

  const RADIUS_TOKENS = [
    { name: "--r-sm",   val: "8px",    usage: "Nav items, tags, botones pequeños" },
    { name: "--r-md",   val: "12px",   usage: "Form inputs, chips, detail-btn" },
    { name: "--r-lg",   val: "16px",   usage: "Stat cards, toast, KPI cards" },
    { name: "--r-xl",   val: "20px",   usage: "Project cards bento" },
    { name: "--r-2xl",  val: "24px",   usage: "Form card, about-photo-wrap, modal" },
    { name: "--r-full", val: "9999px", usage: "Pills, badges, botones primarios y secundarios" },
  ]

  const SHADOW_TOKENS = [
    { name: "--shadow-xs",     val: "0 1px 3px rgba(0,0,0,0.06)",  usage: "Inputs, chips — elevación mínima" },
    { name: "--shadow-sm",     val: "0 4px 12px rgba(0,0,0,0.08)", usage: "Cards en reposo, badges" },
    { name: "--shadow-md",     val: "0 8px 24px rgba(0,0,0,0.10)", usage: "Dropdowns, panels flotantes" },
    { name: "--shadow-lg",     val: "0 12px 40px … + inset",       usage: "Form card, about-photo — glass con highlight" },
    { name: "--shadow-xl",     val: "0 16px 40px rgba(0,0,0,0.14)",usage: "Card hover estándar — blog, preview, related" },
    { name: "--shadow-2xl",    val: "0 24px 64px rgba(0,0,0,0.28)",usage: "Project card hover — máxima elevación" },
    { name: "--shadow-up",     val: "0 -6px 24px rgba(0,0,0,0.07)",usage: "Bottom nav, sticky footer (sombra hacia arriba)" },
    { name: "--shadow-accent", val: "0 8px 24px rgba(41,151,255,0.35)", usage: "Botón primario hover — glow accent azul" },
    { name: "--shadow-focus",  val: "0 0 0 3px rgba(41,151,255,0.15)", usage: "Focus ring inputs (no desplaza layout)" },
  ]

  const Z_TOKENS = [
    { name: "--z-base",         val: "0",    usage: "Canvas WebGL, fondos sin stacking context propio" },
    { name: "--z-content",      val: "10",   usage: "Hero, cards, secciones en flujo normal" },
    { name: "--z-raised",       val: "20",   usage: "Projects sheet, panels sobre contenido" },
    { name: "--z-sticky",       val: "100",  usage: "Navbar, detail-navbar — persisten en scroll" },
    { name: "--z-navigation",   val: "150",  usage: "Bottom nav mobile" },
    { name: "--z-dropdown",     val: "200",  usage: "Sidebars, popovers, DS sidebar drawer" },
    { name: "--z-notification", val: "400",  usage: "Toasts, snackbars, admin-toast" },
    { name: "--z-modal",        val: "500",  usage: "Overlays: profile modal, project-view panel" },
    { name: "--z-emergency",    val: "9999", usage: "Tooltips forzados — solo en emergencias reales" },
  ]

  const GLASS_BLUR_TOKENS = [
    { name: "--glass-blur-xs", val: "6px",  usage: "Project-view backdrop — scrim sutil" },
    { name: "--glass-blur-sm", val: "12px", usage: "Toast, about-badge, chips glass" },
    { name: "--glass-blur-md", val: "20px", usage: "Contact form card, modal" },
    { name: "--glass-blur-lg", val: "28px", usage: "Bottom nav — blur más denso en mobile" },
    { name: "--glass-blur-xl", val: "48px", usage: "Navbar — blur máximo + saturate(180%)" },
  ]

  const DURATION_TOKENS = [
    { name: "instant (80ms)",    val: "80ms",   usage: "Card tilt activo, press feedback" },
    { name: "fast (160ms)",      val: "160ms",  usage: "Section crossfade entrada/salida" },
    { name: "normal (200ms)",    val: "200ms",  usage: "Hover states — borde, color, fondo" },
    { name: "slow (300ms)",      val: "300ms",  usage: "Overlays fadeIn/fadeOut, modales" },
    { name: "slower (400ms)",    val: "400ms",  usage: "Retorno magnético del btn-magnetic" },
    { name: "entrance (650ms)",  val: "650ms",  usage: "anim-up scroll entrance (opacity + translateY)" },
    { name: "ripple-idle (2s)",  val: "2000ms", usage: "Auto-ripple WebGL en estado idle" },
  ]

  const EASING_TOKENS = [
    { name: "spring",  val: "cubic-bezier(0.16, 1, 0.3, 1)",       usage: "Entradas principales — el easing default del DS" },
    { name: "out",     val: "cubic-bezier(0.25, 0.46, 0.45, 0.94)", usage: "Botones hover, transiciones suaves de salida" },
    { name: "snap",    val: "cubic-bezier(0.34, 1.56, 0.64, 1)",    usage: "Pop-in animations, sliding pill, modal enter" },
    { name: "linear",  val: "linear",                                usage: "Progreso de barra, valores sin aceleración" },
  ]

  return (
    <div className="ds-page-body">
      <div className="ds-page-header">
        <div className="ds-page-badge">Primitivos</div>
        <h2 className="ds-page-title">Tokens Primitivos</h2>
        <p className="ds-page-desc">
          Capa base del sistema. Todos los tokens de esta página <strong>son CSS custom properties reales</strong> — úsalos con <code>var(--nombre)</code> en cualquier componente. Nunca escribas valores raw; referencia el token para que dark mode, refactors y escala futura funcionen automáticamente.
        </p>
      </div>

      {/* ── Spacing ── */}
      <SectionHeading title="Escala de espaciado — var(--space-*)" />
      <p className="ds-pattern-desc">
        14 pasos basados en la unidad de 4px. El espaciado consistente es lo que hace que el ojo perciba orden. Cada gap, padding y margin debe venir de esta escala.
      </p>
      <div className="ds-spec-table">
        <div className="ds-spec-row">
          <span className="ds-spec-name">Token</span>
          <span className="ds-spec-val">Valor</span>
          <span className="ds-spec-val">Uso principal</span>
        </div>
        {SPACING_TOKENS.map(({ name, val, usage }) => (
          <div key={name} className="ds-spec-row">
            <span className="ds-spec-name">{name}</span>
            <span className="ds-spec-val">{val}</span>
            <span className="ds-spec-val" style={{ color: "var(--txt3)" }}>{usage}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "flex-end", marginTop: 16 }}>
        {[1,2,3,4,6,8,10,12].map((step) => {
          const px = [4,8,12,16,24,32,40,48][step > 8 ? 7 : step - 1]
          return (
            <div key={step} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: px, height: 24, background: "rgba(0,98,204,0.35)", borderRadius: 3 }} />
              <span style={{ fontSize: 9, color: "var(--txt3)", fontFamily: "monospace" }}>{px}px</span>
            </div>
          )
        })}
      </div>
      <div className="ds-rules" style={{ marginTop: 16 }}>
        <RuleChip rule="padding: var(--space-8)  ← 32px semántico" variant="do" />
        <RuleChip rule="gap: var(--space-3)  ← 12px semántico" variant="do" />
        <RuleChip rule="padding: 32px  ← hardcodeado, no responde a futuros cambios de escala" variant="dont" />
      </div>

      {/* ── Border radius ── */}
      <SectionHeading title="Escala border-radius — var(--r-*)" />
      <p className="ds-pattern-desc">
        6 pasos de radio. El uso consistente es clave — mezclar radios arbitrarios rompe la coherencia visual. Regla: los elementos de menor tamaño usan menor radio.
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
        {RADIUS_TOKENS.map(({ name, val }) => (
          <div key={name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 56, height: 56,
              background: "rgba(0,98,204,0.09)",
              border: "1.5px solid rgba(0,98,204,0.30)",
              borderRadius: val,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, color: "var(--accent)", fontWeight: 700, textAlign: "center",
            }}>
              {val}
            </div>
            <span style={{ fontSize: 10, color: "var(--txt3)", fontFamily: "monospace" }}>{name}</span>
          </div>
        ))}
      </div>
      <div className="ds-spec-table" style={{ marginTop: 16 }}>
        {RADIUS_TOKENS.map(({ name, val, usage }) => (
          <div key={name} className="ds-spec-row">
            <span className="ds-spec-name">{name}</span>
            <span className="ds-spec-val">{val}</span>
            <span className="ds-spec-val" style={{ color: "var(--txt3)" }}>{usage}</span>
          </div>
        ))}
      </div>
      <div className="ds-rules" style={{ marginTop: 16 }}>
        <RuleChip rule="border-radius: var(--r-xl)  ← project cards" variant="do" />
        <RuleChip rule="border-radius: var(--r-full)  ← pills y badges" variant="do" />
        <RuleChip rule="border-radius: 18px  ← valor arbitrario no en la escala" variant="dont" />
        <RuleChip rule="Mezclar --r-xl y --r-2xl en el mismo componente sin razón semántica" variant="dont" />
      </div>

      {/* ── Shadow scale ── */}
      <SectionHeading title="Escala de sombras — var(--shadow-*)" />
      <p className="ds-pattern-desc">
        Las sombras en dark mode sobrescriben automáticamente con opacidad ×3–4 en <code>.dark</code>. Usa siempre el token — el cambio de tema es gratuito.
      </p>
      <div className="ds-spec-table">
        <div className="ds-spec-row">
          <span className="ds-spec-name">Token</span>
          <span className="ds-spec-val">Valor light</span>
          <span className="ds-spec-val">Uso</span>
        </div>
        {SHADOW_TOKENS.map(({ name, val, usage }) => (
          <div key={name} className="ds-spec-row">
            <span className="ds-spec-name">{name}</span>
            <span className="ds-spec-val" style={{ fontSize: 10 }}>{val}</span>
            <span className="ds-spec-val" style={{ color: "var(--txt3)" }}>{usage}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
        {["xs","sm","md","xl","2xl"].map((s) => (
          <div key={s} style={{
            width: 72, height: 72, borderRadius: 12, background: "var(--bg2)",
            boxShadow: `var(--shadow-${s})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, color: "var(--txt3)", fontWeight: 600,
          }}>
            {s}
          </div>
        ))}
      </div>

      {/* ── Glassmorphism blur ── */}
      <SectionHeading title="Escala blur glassmorphism — var(--glass-blur-*)" />
      <p className="ds-pattern-desc">
        5 niveles de <code>backdrop-filter: blur()</code>. Elegir el nivel correcto según el contexto visual: mayor blur = mayor énfasis en el panel sobre el fondo. No ir más allá de <code>--glass-blur-xl</code> (navbar) — en hardware limitado el blur es costoso.
      </p>
      <div className="ds-spec-table">
        {GLASS_BLUR_TOKENS.map(({ name, val, usage }) => (
          <div key={name} className="ds-spec-row">
            <span className="ds-spec-name">{name}</span>
            <span className="ds-spec-val">{val}</span>
            <span className="ds-spec-val" style={{ color: "var(--txt3)" }}>{usage}</span>
          </div>
        ))}
      </div>
      <div className="ds-rules" style={{ marginTop: 16 }}>
        <RuleChip rule="backdrop-filter: blur(var(--glass-blur-sm))  ← toast, badges" variant="do" />
        <RuleChip rule="backdrop-filter: blur(var(--glass-blur-xl)) saturate(180%)  ← navbar" variant="do" />
        <RuleChip rule="backdrop-filter: blur(16px)  ← valor fuera de la escala, inconsistente" variant="dont" />
        <RuleChip rule="blur > 48px — supera el navbar, no hay contexto que lo justifique" variant="dont" />
      </div>

      {/* ── Z-index ── */}
      <SectionHeading title="Escala Z-index — var(--z-*)" />
      <p className="ds-pattern-desc">
        9 capas semánticas. Nunca uses un número hardcodeado — cuando dos componentes compiten en z-index, el sistema de tokens es la única fuente de verdad que evita conflictos.
      </p>
      <div className="ds-layer-diagram">
        {Z_TOKENS.map(({ name, val, usage }) => (
          <div key={name} className="ds-layer-row">
            <span className="ds-layer-z"><code>{name}: {val}</code></span>
            <span className="ds-layer-label">{usage}</span>
          </div>
        ))}
      </div>
      <div className="ds-rules" style={{ marginTop: 16 }}>
        <RuleChip rule="z-index: var(--z-sticky)  ← navbar y detail-navbar" variant="do" />
        <RuleChip rule="z-index: var(--z-modal)  ← profile modal, project-view panel" variant="do" />
        <RuleChip rule="z-index: 100  ← número mágico que choca con --z-sticky sin saberlo" variant="dont" />
        <RuleChip rule="z-index: 9999 en componentes de UI — reservado solo para emergencias reales" variant="dont" />
      </div>

      {/* ── Duration ── */}
      <SectionHeading title="Duraciones de animación" />
      <div className="ds-spec-table">
        {DURATION_TOKENS.map(({ name, val, usage }) => (
          <div key={name} className="ds-spec-row">
            <span className="ds-spec-name">{name}</span>
            <span className="ds-spec-val">{val}</span>
            <span className="ds-spec-val" style={{ color: "var(--txt3)" }}>{usage}</span>
          </div>
        ))}
      </div>

      {/* ── Easing ── */}
      <SectionHeading title="Curvas de easing" />
      <p className="ds-pattern-desc">
        Regla: <strong>spring</strong> para entradas, <strong>out</strong> para hover/salidas, <strong>snap</strong> para pop-ins. <strong>linear</strong> solo para barras de progreso.
      </p>
      <div className="ds-spec-table">
        {EASING_TOKENS.map(({ name, val, usage }) => (
          <div key={name} className="ds-spec-row">
            <span className="ds-spec-name">{name}</span>
            <span className="ds-spec-val" style={{ fontSize: 10, fontFamily: "monospace" }}>{val}</span>
            <span className="ds-spec-val" style={{ color: "var(--txt3)" }}>{usage}</span>
          </div>
        ))}
      </div>
      <div className="ds-rules" style={{ marginTop: 16 }}>
        <RuleChip rule="Entradas de elementos: cubic-bezier(0.16, 1, 0.3, 1) — spring" variant="do" />
        <RuleChip rule="Hover de botón: cubic-bezier(0.25, 0.46, 0.45, 0.94) — out" variant="do" />
        <RuleChip rule="transition: all 0.3s ease  ← 'all' anima props innecesarias, usa propiedades específicas" variant="dont" />
        <RuleChip rule="ease-in para entradas — se siente lento al inicio, poco natural" variant="dont" />
      </div>
    </div>
  )
}

// ── Shared visual helpers ─────────────────────────────────────────────────────

/** Mini block still useful in small diagrams */
function WF({ label, style, accent }: { label: string; style?: React.CSSProperties; accent?: boolean }) {
  return (
    <div style={{
      border: `1px dashed ${accent ? "rgba(41,151,255,0.55)" : "rgba(0,98,204,0.30)"}`,
      borderRadius: 3,
      background: accent ? "rgba(41,151,255,0.10)" : "rgba(0,98,204,0.05)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 7, color: accent ? "rgba(41,151,255,0.9)" : "rgba(0,98,204,0.75)",
      fontWeight: 700, textAlign: "center" as const, padding: "2px 3px",
      letterSpacing: "0.03em", lineHeight: 1.2, userSelect: "none" as const,
      ...style,
    }}>
      {label}
    </div>
  )
}

// ── Device screen content components ────────────────────────────────────────

function NavDots({ count = 4 }: { count?: number }) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div key={i} style={{ width: i === 0 ? 20 : 10, height: 3, borderRadius: 2, background: i === 0 ? "rgba(0,98,204,0.6)" : "rgba(0,0,0,0.12)" }} />
      ))}
    </>
  )
}

function HeroBlocks({ lines = 3, accent = false }: { lines?: number; accent?: boolean }) {
  const widths = ["68%","82%","52%"]
  return (
    <>
      {[...Array(lines)].map((_, i) => (
        <div key={i} style={{
          height: i === 1 ? 7 : 5,
          width: widths[i] || "60%",
          borderRadius: 3,
          background: (i === 1 && accent) ? "rgba(0,98,204,0.55)" : "rgba(29,29,31,0.65)",
          marginBottom: i === 1 ? 4 : 2,
        }} />
      ))}
      <div style={{ height: 6 }} />
      <div style={{ display: "flex", gap: 4 }}>
        <div style={{ width: 36, height: 9, borderRadius: 5, background: "#0062cc" }} />
        <div style={{ width: 24, height: 9, borderRadius: 5, border: "0.5px solid rgba(0,0,0,0.18)" }} />
      </div>
    </>
  )
}

function CardGrid({ cols = 1, rows = 2, bento = false }: { cols?: number; rows?: number; bento?: boolean }) {
  if (bento) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 3, padding: "6px 8px" }}>
        <div style={{ flex: "0 0 55%", display: "grid", gridTemplateColumns: "2fr 1fr", gap: 3 }}>
          <div style={{ borderRadius: 5, background: "rgba(0,98,204,0.07)", border: "0.5px solid rgba(0,98,204,0.18)", display: "flex", alignItems: "flex-end", padding: 4 }}>
            <div style={{ width: "70%", height: 3, borderRadius: 1.5, background: "rgba(255,255,255,0.8)" }} />
          </div>
          <div style={{ borderRadius: 5, background: "rgba(0,98,204,0.04)", border: "0.5px solid rgba(0,98,204,0.10)" }} />
        </div>
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 2fr", gap: 3 }}>
          <div style={{ borderRadius: 5, background: "rgba(0,98,204,0.04)", border: "0.5px solid rgba(0,98,204,0.10)" }} />
          <div style={{ borderRadius: 5, background: "rgba(0,98,204,0.07)", border: "0.5px solid rgba(0,98,204,0.18)", display: "flex", alignItems: "flex-end", padding: 4 }}>
            <div style={{ width: "65%", height: 3, borderRadius: 1.5, background: "rgba(255,255,255,0.8)" }} />
          </div>
        </div>
      </div>
    )
  }
  return (
    <div style={{
      height: "100%", padding: "5px 6px",
      display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gridTemplateRows: `repeat(${rows}, 1fr)`, gap: 3,
    }}>
      {[...Array(cols * rows)].map((_, i) => (
        <div key={i} style={{
          borderRadius: 4,
          background: "rgba(0,98,204,0.05)",
          border: "0.5px solid rgba(0,98,204,0.12)",
          overflow: "hidden",
          display: "flex", flexDirection: "column",
        }}>
          <div style={{ flex: "0 0 42%", background: "rgba(0,98,204,0.08)" }} />
          <div style={{ flex: 1, padding: "3px 4px", display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ height: 2.5, width: "85%", borderRadius: 1.5, background: "rgba(0,0,0,0.25)" }} />
            <div style={{ height: 2, width: "60%", borderRadius: 1, background: "rgba(0,0,0,0.12)" }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function BrandDots({ count = 5 }: { count?: number }) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div key={i} style={{ width: "12%", height: "45%", borderRadius: 2, background: "rgba(0,0,0,0.14)" }} />
      ))}
    </>
  )
}

function BlogMiniCards({ cols = 2 }: { cols?: number }) {
  return (
    <div style={{ height: "100%", padding: "4px 6px", display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 3 }}>
      {[...Array(cols)].map((_, i) => (
        <div key={i} style={{ borderRadius: 4, border: "0.5px solid rgba(0,0,0,0.08)", background: "white", overflow: "hidden" }}>
          <div style={{ height: "44%", background: "rgba(0,98,204,0.06)" }} />
          <div style={{ padding: "3px 4px", display: "flex", flexDirection: "column", gap: 1.5 }}>
            <div style={{ height: 2.5, width: "90%", borderRadius: 1.5, background: "rgba(0,0,0,0.22)" }} />
            <div style={{ height: 2, width: "70%", borderRadius: 1, background: "rgba(0,0,0,0.12)" }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function BottomNavTabs({ count = 5 }: { count?: number }) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          <div style={{ width: 14, height: 10, borderRadius: 2, background: i === 0 ? "rgba(0,98,204,0.14)" : "transparent", border: i === 0 ? "0.5px solid rgba(0,98,204,0.3)" : "none" }}>
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 6, height: 5, borderRadius: 1, background: i === 0 ? "rgba(0,98,204,0.7)" : "rgba(0,0,0,0.2)" }} />
            </div>
          </div>
          <div style={{ width: 10, height: 1.5, borderRadius: 1, background: i === 0 ? "rgba(0,98,204,0.8)" : "rgba(0,0,0,0.15)" }} />
        </div>
      ))}
    </>
  )
}

// ── Device frame + screen content ───────────────────────────────────────────

function MobileDevice() {
  return (
    <div className="ds-frame-phone">
      <div className="ds-screen-phone">
        <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <div className="ds-screen-bar-nav" style={{ height: "7%" }}>
            <div style={{ width: 22, height: 4, borderRadius: 2, background: "#0062cc", opacity: 0.7 }} />
            <div style={{ flex: 1 }} />
            <div style={{ width: 14, height: 14, borderRadius: 7, background: "rgba(0,98,204,0.12)", border: "0.5px solid rgba(0,98,204,0.28)" }} />
          </div>
          <div className="ds-screen-bar-hero" style={{ height: "29%" }}>
            <HeroBlocks lines={3} accent />
          </div>
          <div className="ds-screen-bar-content" style={{ flex: 1, padding: "5px 5px" }}>
            <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 3 }}>
              {[1,0.65,0.65].map((o,i) => (
                <div key={i} style={{ flex: 1, borderRadius: 5, background: `rgba(0,98,204,${o * 0.06})`, border: `0.5px solid rgba(0,98,204,${o * 0.16})`, display: "flex", alignItems: "flex-end", padding: "0 4px 3px" }}>
                  <div style={{ width: "55%", height: 3, borderRadius: 1.5, background: "rgba(255,255,255,0.75)" }} />
                </div>
              ))}
            </div>
          </div>
          <div className="ds-screen-bar-brands" style={{ height: "6%" }}>
            <BrandDots count={4} />
          </div>
          <div className="ds-screen-bar-blog" style={{ height: "13%" }}>
            <BlogMiniCards cols={2} />
          </div>
          <div className="ds-screen-bar-footer" style={{ height: "5%" }} />
          <div className="ds-screen-bar-bottomnav" style={{ height: "8%" }}>
            <BottomNavTabs count={5} />
          </div>
        </div>
      </div>
    </div>
  )
}

function TabletDevice() {
  return (
    <div className="ds-frame-tablet">
      <div className="ds-screen-tablet">
        <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <div className="ds-screen-bar-nav" style={{ height: "8%" }}>
            <div style={{ width: 24, height: 4, borderRadius: 2, background: "#0062cc", opacity: 0.7 }} />
            <div style={{ flex: 1 }} />
            <NavDots count={4} />
            <div style={{ width: 14, height: 14, borderRadius: 7, background: "rgba(0,98,204,0.12)", border: "0.5px solid rgba(0,98,204,0.28)", flexShrink: 0 }} />
          </div>
          <div className="ds-screen-bar-hero" style={{ height: "28%" }}>
            <HeroBlocks lines={3} accent />
          </div>
          <div className="ds-screen-bar-content" style={{ flex: 1 }}>
            <div style={{ height: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, padding: "6px 6px" }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ borderRadius: 5, background: "rgba(0,98,204,0.05)", border: "0.5px solid rgba(0,98,204,0.13)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  <div style={{ flex: "0 0 45%", background: "rgba(0,98,204,0.08)" }} />
                  <div style={{ flex: 1, padding: "3px 4px", display: "flex", flexDirection: "column", gap: 2 }}>
                    <div style={{ height: 2.5, width: "80%", borderRadius: 1.5, background: "rgba(0,0,0,0.22)" }} />
                    <div style={{ height: 2, width: "55%", borderRadius: 1, background: "rgba(0,0,0,0.12)" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="ds-screen-bar-brands" style={{ height: "7%" }}>
            <BrandDots count={5} />
          </div>
          <div className="ds-screen-bar-blog" style={{ height: "15%" }}>
            <BlogMiniCards cols={2} />
          </div>
          <div className="ds-screen-bar-footer" style={{ height: "5%" }} />
        </div>
      </div>
    </div>
  )
}

function LaptopDevice({ blogCols = 3, showQHDBadge = false }: { blogCols?: number; showQHDBadge?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {showQHDBadge && (
        <div style={{ marginBottom: 8, padding: "3px 12px", borderRadius: 980, background: "rgba(41,151,255,0.12)", border: "1px solid rgba(41,151,255,0.3)", fontSize: 9, fontWeight: 700, color: "rgba(41,151,255,0.9)", letterSpacing: "0.06em" }}>
          HERO TITLE: 85px — resto igual a desktop
        </div>
      )}
      <div className="ds-frame-laptop-lid">
        <div className="ds-screen-laptop">
          <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <div className="ds-screen-bar-nav" style={{ height: "8%" }}>
              <div style={{ width: 28, height: 4, borderRadius: 2, background: "#0062cc", opacity: 0.7 }} />
              <div style={{ flex: 1 }} />
              <NavDots count={5} />
              <div style={{ display: "flex", gap: 4, marginLeft: 4 }}>
                <div style={{ width: 22, height: 10, borderRadius: 5, border: "0.5px solid rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
                  <div style={{ width: 5, height: 5, borderRadius: 3, background: "rgba(0,0,0,0.25)" }} />
                  <div style={{ width: 5, height: 5, borderRadius: 3, background: "rgba(0,0,0,0.1)" }} />
                </div>
                <div style={{ width: 28, height: 10, borderRadius: 5, border: "0.5px solid rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontSize: 6, color: "rgba(0,0,0,0.4)", fontWeight: 600 }}>Perfil</div>
                </div>
              </div>
            </div>
            <div className="ds-screen-bar-hero" style={{ height: "26%" }}>
              <HeroBlocks lines={3} accent />
            </div>
            <div className="ds-screen-bar-content" style={{ flex: 1 }}>
              <CardGrid bento />
            </div>
            <div className="ds-screen-bar-brands" style={{ height: "7%" }}>
              <BrandDots count={6} />
            </div>
            <div className="ds-screen-bar-blog" style={{ height: "15%" }}>
              <BlogMiniCards cols={blogCols} />
            </div>
            <div className="ds-screen-bar-footer" style={{ height: "6%" }} />
          </div>
        </div>
      </div>
      <div className="ds-frame-laptop-base" />
    </div>
  )
}

function MonitorDevice() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div className="ds-frame-monitor">
        <div className="ds-screen-monitor">
          <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <div className="ds-screen-bar-nav" style={{ height: "7%" }}>
              <div style={{ width: 28, height: 4, borderRadius: 2, background: "#0062cc", opacity: 0.7 }} />
              <div style={{ flex: 1 }} />
              <NavDots count={6} />
              <div style={{ display: "flex", gap: 3, marginLeft: 4 }}>
                <div style={{ width: 24, height: 10, borderRadius: 5, border: "0.5px solid rgba(0,0,0,0.15)" }} />
                <div style={{ width: 30, height: 10, borderRadius: 5, border: "0.5px solid rgba(0,0,0,0.15)" }} />
              </div>
            </div>
            {/* Hero — annotated: stays 1160px max-w */}
            <div className="ds-screen-bar-hero" style={{ height: "24%", position: "relative" }}>
              <div style={{ maxWidth: "73%", margin: "0 auto", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <HeroBlocks lines={3} accent />
              </div>
              <div style={{ position: "absolute", top: 3, right: 4, fontSize: 7, fontWeight: 700, color: "rgba(41,151,255,0.7)", fontFamily: "monospace", background: "rgba(41,151,255,0.08)", padding: "1px 4px", borderRadius: 2 }}>max-w 1160px</div>
            </div>
            <div className="ds-screen-bar-content" style={{ flex: 1, position: "relative" }}>
              <CardGrid bento />
              <div style={{ position: "absolute", top: 3, right: 4, fontSize: 7, fontWeight: 700, color: "rgba(41,151,255,0.7)", fontFamily: "monospace", background: "rgba(41,151,255,0.08)", padding: "1px 4px", borderRadius: 2 }}>max-w 1380px</div>
            </div>
            <div className="ds-screen-bar-brands" style={{ height: "6%" }}>
              <BrandDots count={7} />
            </div>
            {/* Blog — 4 columns at ultra-wide */}
            <div className="ds-screen-bar-blog" style={{ height: "15%", position: "relative" }}>
              <BlogMiniCards cols={4} />
              <div style={{ position: "absolute", top: 3, right: 4, fontSize: 7, fontWeight: 700, color: "rgba(168,85,247,0.9)", fontFamily: "monospace", background: "rgba(168,85,247,0.08)", padding: "1px 4px", borderRadius: 2 }}>4 cols</div>
            </div>
            <div className="ds-screen-bar-footer" style={{ height: "5%" }} />
          </div>
        </div>
      </div>
      <div className="ds-frame-monitor-stand" />
      <div className="ds-frame-monitor-base" />
    </div>
  )
}

/** Blog post layout diagram */
function BlogPostDiagram({ variant }: { variant: "default" | "ultrawide" }) {
  const col = { display: "flex", flexDirection: "column" as const, gap: 3 }
  return (
    <div style={{ background: "var(--bg3)", borderRadius: 12, padding: 16, border: "1px solid var(--border)" }}>
      {variant === "default" ? (
        <div style={{ ...col, width: 200 }}>
          <div style={{ height: 10, borderRadius: 4, background: "rgba(0,0,0,0.12)" }} />
          <div style={{ height: 6, width: "50%", borderRadius: 3, background: "rgba(0,0,0,0.08)" }} />
          <div style={{ height: 16, borderRadius: 4, background: "rgba(29,29,31,0.55)" }} />
          <div style={{ height: 60, borderRadius: 6, background: "rgba(0,98,204,0.07)", border: "1px solid rgba(0,98,204,0.15)" }} />
          <div style={{ ...col, gap: 2 }}>
            {[1,.8,.8,.6,.4].map((o,i) => (
              <div key={i} style={{ height: 4, width: `${(0.9 - i * 0.08) * 100}%`, borderRadius: 2, background: `rgba(0,0,0,${o * 0.15})` }} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {["#design","#frontend","#ux"].map(t => (
              <div key={t} style={{ padding: "2px 6px", borderRadius: 980, border: "0.5px solid rgba(0,98,204,0.35)", fontSize: 8, color: "rgba(0,98,204,0.8)", fontFamily: "monospace" }}>{t}</div>
            ))}
          </div>
          <div style={{ height: 8, borderRadius: 4, background: "rgba(0,0,0,0.06)", border: "0.5px solid rgba(0,0,0,0.08)" }} />
        </div>
      ) : (
        <div style={{ ...col, width: 380 }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
            <div style={{ ...col }}>
              <div style={{ height: 16, borderRadius: 4, background: "rgba(29,29,31,0.55)" }} />
              <div style={{ height: 60, borderRadius: 6, background: "rgba(0,98,204,0.07)", border: "1px solid rgba(0,98,204,0.15)" }} />
              <div style={{ ...col, gap: 2 }}>
                {[1,.8,.8,.6].map((o,i) => (
                  <div key={i} style={{ height: 4, width: `${(0.9 - i * 0.1) * 100}%`, borderRadius: 2, background: `rgba(0,0,0,${o * 0.15})` }} />
                ))}
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {["#design","#frontend"].map(t => (
                  <div key={t} style={{ padding: "2px 6px", borderRadius: 980, border: "0.5px solid rgba(0,98,204,0.35)", fontSize: 8, color: "rgba(0,98,204,0.8)", fontFamily: "monospace" }}>{t}</div>
                ))}
              </div>
            </div>
            <div style={{ background: "rgba(41,151,255,0.06)", borderRadius: 8, border: "1px solid rgba(41,151,255,0.18)", padding: 8, ...col, gap: 6 }}>
              <div style={{ height: 4, borderRadius: 2, background: "rgba(41,151,255,0.4)", width: "60%" }} />
              {["Categoría","Publicado","Etiquetas"].map(l => (
                <div key={l} style={{ ...col, gap: 1.5 }}>
                  <div style={{ fontSize: 7, color: "rgba(41,151,255,0.7)", fontWeight: 700, fontFamily: "monospace", letterSpacing: "0.06em", textTransform: "uppercase" }}>{l}</div>
                  <div style={{ height: 6, borderRadius: 2, background: "rgba(0,0,0,0.1)", width: "80%" }} />
                </div>
              ))}
            </div>
          </div>
          <div style={{ height: 20, borderRadius: 6, background: "rgba(0,0,0,0.06)", display: "flex", alignItems: "center", padding: "0 8px" }}>
            <div style={{ fontSize: 8, color: "rgba(0,0,0,0.4)", fontFamily: "monospace" }}>RELATED POSTS · 3 cols · ancho completo blog-post-main</div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Page: Animaciones ─────────────────────────────────────────────────────────
function PageAnimaciones() {
  return (
    <div className="ds-page-body">
      <div className="ds-page-header">
        <div className="ds-page-badge">Animaciones</div>
        <h2 className="ds-page-title">Sistema de Animaciones</h2>
        <p className="ds-page-desc">
          Dos sistemas complementarios: <strong>anim-up</strong> (scroll entrance vía IntersectionObserver + clase <code>.in</code>) y <strong>CSS keyframes</strong> (hero, indicadores, pulsos). Todos respetan <code>prefers-reduced-motion</code> sin excepción.
        </p>
      </div>

      {/* ── anim-up pattern ── */}
      <SectionHeading title="Patrón anim-up — referencia visual" />
      <p className="ds-pattern-desc">
        Estado <strong>antes</strong> del trigger (opacity: 0, translateY: 16px) vs <strong>después</strong> de que el observer añade <code>.in</code> (opacity: 1, translateY: 0). La transición dura 650ms con spring easing. El elemento es el mismo — solo cambian las propiedades CSS.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "center", marginTop: 16 }}>
        {/* Before */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ padding: "4px 12px", background: "var(--bg3)", borderRadius: 980, border: "1px solid var(--border)", fontSize: 10, fontWeight: 700, color: "var(--txt3)", letterSpacing: "0.08em", textAlign: "center", textTransform: "uppercase" }}>Antes · sin .in</div>
          <div style={{ padding: 20, borderRadius: 16, border: "2px dashed rgba(0,0,0,0.12)", background: "var(--bg3)", display: "flex", flexDirection: "column", gap: 8 }}>
            {/* Label mockup */}
            <div style={{ opacity: 0.08, transform: "translateY(16px)" }}>
              <div style={{ height: 10, width: "40%", borderRadius: 4, background: "var(--accent)", marginBottom: 8 }} />
              <div style={{ height: 24, width: "80%", borderRadius: 6, background: "var(--txt)" }} />
            </div>
            <div style={{ fontSize: 10, fontFamily: "monospace", color: "var(--txt3)", textAlign: "center", lineHeight: 1.5 }}>opacity: 0<br/>transform: translateY(16px)</div>
          </div>
          <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(0,0,0,0.04)", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 10, color: "var(--txt3)", lineHeight: 1.5, fontFamily: "monospace" }}>
              .anim-up &#123;<br/>
              &nbsp;&nbsp;opacity: 0;<br/>
              &nbsp;&nbsp;transform: translateY(16px);<br/>
              &nbsp;&nbsp;transition: opacity 0.65s spring,<br/>
              &nbsp;&nbsp;transform 0.65s spring;<br/>
              &#125;
            </div>
          </div>
        </div>
        {/* Arrow */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M4 16h24M20 8l8 8-8 8" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <div style={{ fontSize: 9, color: "var(--txt3)", textAlign: "center", lineHeight: 1.4 }}>Observer detecta<br/>viewport entry<br/>→ añade .in</div>
        </div>
        {/* After */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ padding: "4px 12px", background: "rgba(0,98,204,0.08)", borderRadius: 980, border: "1px solid rgba(0,98,204,0.25)", fontSize: 10, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.08em", textAlign: "center", textTransform: "uppercase" }}>Después · con .in</div>
          <div style={{ padding: 20, borderRadius: 16, border: "2px solid rgba(0,98,204,0.25)", background: "rgba(0,98,204,0.04)", display: "flex", flexDirection: "column", gap: 8 }}>
            {/* Label + title mockup visible */}
            <div style={{ opacity: 1, transform: "translateY(0)" }}>
              <div style={{ height: 10, width: "40%", borderRadius: 4, background: "var(--accent)", marginBottom: 8 }} />
              <div style={{ height: 24, width: "80%", borderRadius: 6, background: "var(--txt)" }} />
            </div>
            <div style={{ fontSize: 10, fontFamily: "monospace", color: "var(--accent)", textAlign: "center", lineHeight: 1.5 }}>opacity: 1<br/>transform: translateY(0)</div>
          </div>
          <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(0,98,204,0.05)", border: "1px solid rgba(0,98,204,0.2)" }}>
            <div style={{ fontSize: 10, color: "var(--txt3)", lineHeight: 1.5, fontFamily: "monospace" }}>
              .anim-up.in &#123;<br/>
              &nbsp;&nbsp;opacity: 1;<br/>
              &nbsp;&nbsp;transform: translateY(0);<br/>
              &#125;<br/>
              {"/* 650ms cubic-bezier(0.16,1,0.3,1) */"}
            </div>
          </div>
        </div>
      </div>

      <SectionHeading title="Patrón anim-up — Scroll Entrance" />
      <p className="ds-pattern-desc">
        El patrón de entrada por scroll más usado en el sitio. El elemento parte invisible y desplazado 16px hacia abajo. Cuando entra en el viewport, el observer global en <code>portfolio.tsx</code> añade la clase <code>.in</code> y el CSS anima a visible+posición natural.
      </p>
      <PreviewBox label="Estado reposo → entrada (simula el trigger)">
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{
            padding: "12px 20px", borderRadius: "var(--r-md)",
            border: "1px solid var(--border)", background: "var(--bg3)",
            fontSize: 13, color: "var(--txt3)", opacity: 0.4,
          }}>
            opacity: 0 · translateY(16px) — antes del .in
          </div>
          <span style={{ color: "var(--txt3)", fontSize: 18 }}>→</span>
          <div style={{
            padding: "12px 20px", borderRadius: "var(--r-md)",
            border: "1px solid var(--accent)", background: "rgba(0,98,204,0.06)",
            fontSize: 13, color: "var(--accent)", fontWeight: 600,
          }}>
            opacity: 1 · translateY(0) — con .in
          </div>
        </div>
      </PreviewBox>
      <CodeBlock code={`/* CSS — portfolio.css */
.anim-up {
  opacity: 0;
  transform: translateY(16px);
  transition:
    opacity  0.65s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
}
.anim-up.in {
  opacity: 1;
  transform: translateY(0);
}

/* Stagger: el 2º hijo de .s-head entra 60ms después */
.s-head .anim-up.in:last-child {
  transition-delay: 60ms;
}`} />

      {/* ── Observer registration ── */}
      <SectionHeading title="Registro en el Observer global" />
      <p className="ds-pattern-desc">
        El observer está en <code>portfolio.tsx</code> y observa automáticamente <strong>todos los elementos con la clase <code>.anim-up</code></strong> que existan en el DOM al montar. Para una nueva sección, solo agrega la clase — el resto es automático.
      </p>
      <CodeBlock code={`// portfolio.tsx — observer global (NO modificar)
useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("in")
          observer.unobserve(e.target) // se dispara solo una vez
        }
      })
    },
    { threshold: 0.15 }
  )
  document.querySelectorAll(".anim-up").forEach(el => observer.observe(el))
  return () => observer.disconnect()
}, [])

// TSX — nueva sección (solo agregar la clase)
<div className="s-head">
  <div className="s-label anim-up">Etiqueta</div>
  <h2 className="s-title anim-up">Título de la sección</h2>
</div>
<div className="anim-up">Contenido del bloque</div>`} />

      {/* ── Stagger ── */}
      <SectionHeading title="Stagger — entrada escalonada" />
      <p className="ds-pattern-desc">
        Dos formas de hacer stagger. La primera es automática vía CSS (<code>.s-head</code>). La segunda es manual vía <code>transition-delay</code> inline para colecciones de N items.
      </p>
      <CodeBlock code={`/* Forma 1 — CSS automático: label + título con 60ms de diferencia */
.s-head .anim-up.in:last-child {
  transition-delay: 60ms;
}

/* Forma 2 — Stagger manual para colecciones (máx 12 items) */
{items.map((item, idx) => (
  <div
    key={item.id}
    className="anim-up"
    style={{ transitionDelay: \`\${idx * 60}ms\` }}
  >
    {item.content}
  </div>
))}
/* Límite: 12 items × 60ms = 720ms total — arriba de eso se siente lento */`} />

      {/* ── Hero animations ── */}
      <SectionHeading title="Hero — SplitText (text reveal, CSS puro)" />
      <p className="ds-pattern-desc">
        Entrada del título del hero, carácter por carácter. Componente propio (<code>components/portfolio/split-text.tsx</code>), sin dependencias — divide el texto en spans por carácter vía JS y anima cada uno con un <code>@keyframes</code> CSS (<code>animation-delay</code> escalonado, 50ms por letra). Cada línea del título es su propia instancia. Reemplazó dos técnicas anteriores: primero line-rise por clip (<code>.hero-line-wrap</code>/<code>.hero-line-inner</code>), después una versión basada en <code>gsap/SplitText</code> + <code>ScrollTrigger</code> — ninguna de las dos existe ya.
      </p>
      <p className="ds-pattern-desc" style={{ marginTop: 12 }}>
        <strong>Por qué ya no usa una librería:</strong> gsap + el plugin SplitText + ScrollTrigger agregaban ~130KB comprimidos de JS al bundle — y en todo el proyecto, esa librería solo animaba estas 3 líneas. Además causó un bug real en producción: <code>ScrollTrigger</code> decide cuándo animar según la posición de scroll, pero la restauración de scroll propia del sitio remonta el hero con la página YA scrolleada al volver del detalle de un proyecto (salta directo a la grilla de Trabajos) — cada línea calculaba su punto de disparo de forma async e independiente, y según el instante exacto en que cada una lo hacía, alguna terminaba con un umbral ya no alcanzable con el scroll restante; como era <code>once: true</code>, si nunca se disparaba el texto quedaba en <code>opacity: 0</code> para siempre. El título siempre está visible al cargar (above the fold) — nunca debería depender del scroll para decidir si animar. Esta versión anima apenas se monta, sin ScrollTrigger ni ninguna otra dependencia de scroll, así que esa clase de bug ya no puede pasar.
      </p>
      <CodeBlock code={`// hero-section.tsx
<SplitText tag="span" text={hero.titleLine1} className="hero-title-line" />
<br />
<SplitText tag="span" text={hero.titleLine2} className="hero-title-line hero-title-line--accent" />

/* CSS — animación por carácter */
.split-char {
  display: inline-block;
  white-space: pre;
  opacity: 0;
  transform: translateY(40px);
  animation-name: split-char-in;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  animation-fill-mode: forwards;
  /* animation-delay / animation-duration van inline, por carácter (ver split-text.tsx) */
}
@keyframes split-char-in {
  to { opacity: 1; transform: translateY(0); }
}

/* CSS — shimmer de gradiente en la línea del medio (recuperado del <em> original) */
.hero-title-line--accent {
  color: var(--accent); /* fallback + color de los .split-char mientras animan */
  background: linear-gradient(110deg, #0062cc 0%, #2997ff 40%, #3aabff 55%, #2997ff 70%, #0062cc 100%);
  background-size: 300% 100%;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: hero-gradient-shift 12s ease-in-out 0.8s infinite;
}
.hero-title-line--accent .split-char {
  background: none;
  -webkit-text-fill-color: var(--accent); /* sólido mientras existen los spans por carácter */
}`} />
      <p className="ds-pattern-desc" style={{ marginTop: 12 }}>
        <strong>Texto dinámico:</strong> a diferencia de la versión anterior (gsap/SplitText tenía un guard que impedía re-animar si el texto cambiaba después de completar), esta versión SÍ vuelve a animar cuando cambia <code>text</code> — más simple y sin ese riesgo. Aun así, <code>hero-section.tsx</code> sigue esperando a que <code>/api/admin/hero</code> resuelva (<code>heroLoaded</code>) antes de montar el <code>SplitText</code>, para evitar el &quot;flash&quot; de animar primero el texto DEFAULT de placeholder y después el real.
      </p>
      <p className="ds-pattern-desc" style={{ marginTop: 12 }}>
        <strong>Gradiente + SplitText — por qué no es directo:</strong> <code>background-clip: text</code> necesita texto propio en el elemento al que se aplica. Mientras la línea está partida en <code>.split-char</code> por letra, el <code>&lt;span&gt;</code> padre no tiene texto directo — el gradiente no tendría nada que recortar. <code>split-text.tsx</code> vuelve a texto plano (<code>setTimeout</code> con la duración total calculada) apenas termina de animar esa línea — recién ahí el gradiente se ve. Mientras tanto, <code>.split-char</code> fuerza color sólido para que las letras no queden transparentes/invisibles heredando el <code>text-fill-color</code> del gradiente sin tener background detrás.
      </p>

      {/* ── Keyframes disponibles ── */}
      <SectionHeading title="Keyframes disponibles en portfolio.css" />
      <div className="ds-spec-table">
        {[
          { name: "fadeUp",             desc: "opacity 0→1 + translateY(16px)→0. Usado en hero-tag, hero-sub, hero-cta (CSS animation fill: both)." },
          { name: "split-char-in",      desc: "opacity 0→1 + translateY(40px)→0. Entrada por carácter del hero-title (.split-char), 50ms de stagger vía animation-delay inline." },
          { name: "hero-gradient-shift",desc: "background-position 0%→100%→0%. Shimmer de la línea acento del hero-title (.hero-title-line--accent). Ciclo de 12s." },
          { name: "fadeIn",             desc: "opacity 0→1. Overlays, project-view backdrop." },
          { name: "popIn",              desc: "scale(0.88)+opacity 0 → scale(1)+opacity 1. Modal profile, snap easing." },
          { name: "popOut",             desc: "Reverso de popIn. Salida del modal." },
          { name: "slideInRight",       desc: "translateX(100%)→0. Project-view panel slide-in (0.45s spring)." },
          { name: "slideOutRight",      desc: "Reverso de slideInRight. Salida del panel." },
          { name: "sectionEnter",       desc: "translateY(10px)+opacity 0 → normal. Entrada de secciones (página nav)." },
          { name: "scrollBounce",       desc: "Animación del dot en el scroll-indicator. Loop 1.6s." },
          { name: "blink",              desc: "Pulso del hero-dot (available indicator). Loop 2s." },
          { name: "badgePulse",         desc: "box-shadow expanding pulse. about-badge, avail-dot. Loop 2s." },
          { name: "titleWordRise",      desc: "translateY(105%)→0. Projects title scroll-driven (Chrome 115+, Safari 18+)." },
          { name: "ds-fade-in",         desc: "Fade-in del DS viewer al cambiar de página (150ms)." },
          { name: "toastSlideUp",       desc: "Entrada del AdminToast. 300ms spring." },
          { name: "toastSlideDown",     desc: "Salida del AdminToast (clase .leaving). 200ms ease-in." },
        ].map(({ name, desc }) => (
          <div key={name} className="ds-spec-row">
            <span className="ds-spec-name">{name}</span>
            <span className="ds-spec-val" style={{ flex: 1, color: "var(--txt3)", fontSize: 12 }}>{desc}</span>
          </div>
        ))}
      </div>

      {/* ── Scroll-driven ── */}
      <SectionHeading title="Scroll-Driven Animations (CSS nativo)" />
      <p className="ds-pattern-desc">
        El título de la sección Proyectos usa <code>animation-timeline: view()</code> — la animación avanza en función del scroll en lugar del tiempo. Solo Chrome 115+ y Safari 18+. El fallback activa via IntersectionObserver + clase <code>.in</code>.
      </p>
      <CodeBlock code={`/* Chrome 115+ / Safari 18+ — sin JS */
@supports (animation-timeline: view()) {
  .p-title-word-inner {
    animation: titleWordRise 0.9s cubic-bezier(0.16, 1, 0.3, 1) both;
    animation-timeline: view(block);
  }
  /* Stagger por palabra vía animation-range */
  .p-title-word:nth-child(1) .p-title-word-inner { animation-range: entry 0%  entry 60%; }
  .p-title-word:nth-child(2) .p-title-word-inner { animation-range: entry 8%  entry 65%; }
}

/* Fallback — IntersectionObserver trigger */
@supports not (animation-timeline: view()) {
  .p-title-word-inner {
    transition: transform 0.85s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .s-label.in ~ .projects-title .p-title-word-inner {
    transform: translateY(0);
  }
}`} />

      {/* ── prefers-reduced-motion ── */}
      <SectionHeading title="prefers-reduced-motion — obligatorio" />
      <p className="ds-pattern-desc">
        Toda animación en el DS tiene su override. El bloque en <code>portfolio.css</code> cubre: anim-up, hero elements, cards, modal, toast, pulsos decorativos. Al agregar una nueva animación <strong>siempre agregar su override</strong> en el bloque <code>@media (prefers-reduced-motion: reduce)</code>.
      </p>
      <CodeBlock code={`/* portfolio.css — bloque obligatorio para cada nueva animación */
@media (prefers-reduced-motion: reduce) {
  /* Patrón general — anim-up */
  .anim-up {
    opacity: 1 !important;
    transform: none !important;
    animation: none !important;
    transition: none !important;
  }

  /* Pulsos decorativos — off */
  .badge-pulse,
  .avail-dot,
  .hero-dot,
  .scroll-dot {
    animation: none !important;
  }

  /* Hero title (SplitText) NO se cubre acá — el guard vive dentro del
     componente (components/portfolio/split-text.tsx): detecta la media
     query él mismo y renderiza el texto plano directo, sin pasar por los
     spans por-carácter en absoluto. .split-char sí tiene su propio
     override en portfolio.css (por si el componente llega a renderizarlos
     antes de que el efecto de matchMedia corra, ej. durante hidratación). */

  /* Tu nueva animación — patrón a seguir */
  .mi-nuevo-elemento {
    animation: none !important;
    transition: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}`} />

      {/* ── Reglas ── */}
      <SectionHeading title="Reglas de uso" />
      <div className="ds-rules">
        <RuleChip rule="Agregar .anim-up a elementos que necesiten entrada — el observer global lo detecta automáticamente" variant="do" />
        <RuleChip rule="Usar animationDelay escalonado en colecciones de items (idx × 60ms, máx 12)" variant="do" />
        <RuleChip rule="Siempre agregar override en @media (prefers-reduced-motion: reduce)" variant="do" />
        <RuleChip rule="Usar transform + opacity únicamente — nunca animar width, height, top, left (layout thrashing)" variant="do" />
        <RuleChip rule="Crear un segundo IntersectionObserver — el global en portfolio.tsx ya cubre todo" variant="dont" />
        <RuleChip rule="Animar más de 2 propiedades simultáneamente en un mismo elemento" variant="dont" />
        <RuleChip rule="Animaciones decorativas sin causa-efecto — cada motion debe comunicar algo" variant="dont" />
        <RuleChip rule="duration > 500ms para micro-interacciones (hover, press, toggle)" variant="dont" />
      </div>
    </div>
  )
}

// ── Page: Blog ────────────────────────────────────────────────────────────────
function PageBlog() {
  const [activePill, setActivePill] = useState<string>("Todos")
  const PILLS = ["Todos", "UX/UI", "Frontend", "Proceso"]

  return (
    <div className="ds-page-body">
      <div className="ds-page-header">
        <div className="ds-page-badge">Patrones</div>
        <h2 className="ds-page-title">Blog — Sistema de componentes</h2>
        <p className="ds-page-desc">
          Todos los componentes del sistema de blog tokenizados y documentados. Usarlos como referencia canónica al agregar features al blog — categorías, series, newsletter, author cards, featured posts.
        </p>
      </div>

      {/* ── Blog Filter Pills ── */}
      <SectionHeading title="BlogFilterPill — Filtros de categoría" />
      <p className="ds-pattern-desc">
        Pills de filtro en la parte superior de <code>/blog</code>. El estado <code>active</code> invierte: fondo accent, texto blanco. El estado idle es ghost (sin fondo).
      </p>
      <PreviewBox label="Interactivo — click para cambiar estado">
        <div className="blog-pills">
          {PILLS.map(p => (
            <button
              key={p}
              className={`blog-pill${activePill === p ? " active" : ""}`}
              onClick={() => setActivePill(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </PreviewBox>
      <div className="ds-spec-table" style={{ marginTop: 12 }}>
        {[
          { state: "idle",   bg: "transparent", border: "var(--border)", fg: "var(--txt2)" },
          { state: "hover",  bg: "transparent", border: "var(--border-h)", fg: "var(--txt)" },
          { state: "active", bg: "var(--accent)", border: "var(--accent)", fg: "white" },
        ].map(({ state, bg, border, fg }) => (
          <div key={state} className="ds-spec-row">
            <span className="ds-spec-name">.blog-pill{state !== "idle" ? `.${state}` : ""}</span>
            <span className="ds-spec-val">bg: {bg}</span>
            <span className="ds-spec-val">border: {border}</span>
            <span className="ds-spec-val">color: {fg}</span>
          </div>
        ))}
      </div>
      <CodeBlock code={`<div className="blog-pills">
  <button className="blog-pill active">Todos</button>
  <button className="blog-pill">UX/UI</button>
  <button className="blog-pill">Frontend</button>
</div>`} />

      {/* ── Blog Tag ── */}
      <SectionHeading title="BlogTag — Etiquetas inline" />
      <p className="ds-pattern-desc">
        Tag clickeable que filtra el blog por esa categoría. Máximo 3 tags por card (<code>tags.slice(0,3)</code>). Estado active = border+color accent. Funciona como <code>&lt;Link href=&quot;/blog?tag=X&quot;&gt;</code>.
      </p>
      <PreviewBox>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <a href="#" onClick={e => e.preventDefault()} className="blog-tag">#design-system</a>
          <a href="#" onClick={e => e.preventDefault()} className="blog-tag active">#frontend</a>
          <a href="#" onClick={e => e.preventDefault()} className="blog-tag">#ux</a>
        </div>
      </PreviewBox>
      <div className="ds-spec-table" style={{ marginTop: 12 }}>
        {[
          { prop: "padding",     val: "3px 9px" },
          { prop: "font-size",   val: "11px / w500" },
          { prop: "radius",      val: "var(--r-full)" },
          { prop: "color idle",  val: "var(--txt3)" },
          { prop: "color active",val: "var(--accent)" },
          { prop: "border",      val: "var(--border) → var(--accent) active" },
        ].map(({ prop, val }) => (
          <div key={prop} className="ds-spec-row">
            <span className="ds-spec-name">{prop}</span>
            <span className="ds-spec-val">{val}</span>
          </div>
        ))}
      </div>
      <CodeBlock code={`{/* Uso en BlogCard — máx 3 tags */}
{post.tags.slice(0, 3).map(tag => (
  <Link
    key={tag}
    href={\`/blog?tag=\${encodeURIComponent(tag)}\`}
    className="blog-tag"
  >
    #{tag}
  </Link>
))}

{/* Tag activo (cuando coincide con el filtro actual) */}
<Link href="/blog?tag=frontend" className="blog-tag active">
  #frontend
</Link>`} />

      {/* ── BlogCard ── */}
      <SectionHeading title="BlogCard — Listado /blog" />
      <p className="ds-pattern-desc">
        Card completa del listado de posts. Grid de 3 columnas desktop (4 a ≥1921px), 2 columnas tablet, 1 columna mobile. Hover: <code>translateY(-4px)</code> + <code>var(--shadow-xl)</code> + zoom imagen 1.04.
      </p>
      <div className="ds-spec-table">
        {[
          { prop: "radius",        val: "18px",                    desc: "Entre --r-xl y --r-2xl" },
          { prop: "img ratio",     val: "16 / 9",                  desc: "aspect-ratio de .blog-card-img" },
          { prop: "img zoom hover",val: "scale(1.04)",              desc: "Más sutil que project cards (1.05)" },
          { prop: "cat font",      val: "10px / w700 / 0.1em",     desc: "Uppercase, accent color" },
          { prop: "title font",    val: "17px / w700 / -0.025em",  desc: "Plus Jakarta Sans" },
          { prop: "excerpt",       val: "14px / DM Sans",          desc: "Máx 100 chars (slice en data layer)" },
          { prop: "hover lift",    val: "translateY(-4px)",         desc: "Coherente con blog-preview-card" },
          { prop: "hover shadow",  val: "var(--shadow-xl)",         desc: "Token shadow — automático en dark" },
        ].map(({ prop, val, desc }) => (
          <div key={prop} className="ds-spec-row">
            <span className="ds-spec-name">{prop}</span>
            <span className="ds-spec-val">{val}</span>
            <span className="ds-spec-val" style={{ color: "var(--txt3)" }}>{desc}</span>
          </div>
        ))}
      </div>
      <CodeBlock code={`{/* Anatomía de BlogCard */}
<article className="blog-card" onClick={() => router.push(\`/blog/\${post.slug}\`)}>
  <div className="blog-card-img">
    {post.image
      ? <img src={post.image} alt={post.title} />
      : <div className="blog-card-img-placeholder" />
    }
  </div>
  <div className="blog-card-body">
    <span className="blog-card-cat">{post.category}</span>
    <h2 className="blog-card-title">{post.title}</h2>
    <p className="blog-card-excerpt">{post.excerpt?.slice(0,100)}</p>
    <div className="blog-tags">
      {post.tags.slice(0, 3).map(tag => <Link href={\`/blog?tag=\${tag}\`} className="blog-tag">#{tag}</Link>)}
    </div>
    <div className="blog-card-meta">
      <span className="blog-card-date">{formatDate(post.publishedAt)}</span>
      <span className="blog-card-read">Leer →</span>
    </div>
  </div>
</article>`} />

      {/* ── BlogPreviewCard ── */}
      <SectionHeading title="BlogPreviewCard — Sección home" />
      <p className="ds-pattern-desc">
        Versión compacta de BlogCard para la sección &quot;Últimas entradas&quot; del home. Sin categoría pill, sin tags, sin meta row. Grid de 3 columnas siempre (no cambia a 4 en ultra-wide — intencional para dar espacio a la sección sin saturarla).
      </p>
      <div className="ds-spec-table">
        {[
          { prop: "radius",         val: "16px (--r-lg)",  desc: "Más compacto que BlogCard (18px)" },
          { prop: "title font",     val: "16px / w700",    desc: "Un paso menor que BlogCard (17px)" },
          { prop: "excerpt font",   val: "13px / w400",    desc: "Un paso menor que BlogCard (14px)" },
          { prop: "CTA",            val: ".blog-preview-cta", desc: "13px accent — 'Leer →' al final del body" },
          { prop: "grid ultra-wide","val": "3 cols (fijo)", desc: "Mantiene 3 cols incluso a ≥1921px (intencional)" },
        ].map(({ prop, val, desc }) => (
          <div key={prop} className="ds-spec-row">
            <span className="ds-spec-name">{prop}</span>
            <span className="ds-spec-val">{val}</span>
            <span className="ds-spec-val" style={{ color: "var(--txt3)" }}>{desc}</span>
          </div>
        ))}
      </div>

      {/* ── BlogPostLayout ── */}
      <SectionHeading title="BlogPostLayout — Artículo individual" />
      <p className="ds-pattern-desc">
        Contenedor outer de <code>/blog/[slug]</code>. Por defecto es <code>display: block</code> con el artículo centrado en <code>max-width: 720px</code>. A ≥1921px se convierte en grid editorial 2 columnas (<code>720px + 260px sidebar</code>).
      </p>
      <div className="ds-layer-diagram">
        {[
          { z: "blog-post-main (1160px)", label: "Contenedor outer — permite que related-posts tenga ancho completo" },
          { z: "blog-post-layout", label: "Display block en <1921px / grid 2-col a ≥1921px" },
          { z: "article.blog-post", label: "Artículo — max-width: 720px, ~65 chars/línea a 17px" },
          { z: "aside.blog-post-sidebar", label: "Sidebar 260px — solo visible a ≥1921px (display:none abajo)" },
          { z: "div.related-posts (full width)", label: "Related posts fuera del layout — ancho completo del blog-post-main" },
        ].map(({ z, label }) => (
          <div key={z} className="ds-layer-row">
            <span className="ds-layer-z">{z}</span>
            <span className="ds-layer-label">{label}</span>
          </div>
        ))}
      </div>
      <div className="ds-spec-table" style={{ marginTop: 12 }}>
        {[
          { prop: "content font",    val: "17px / lh 1.85",  desc: "Mayor que body (15px) — comodidad de lectura larga" },
          { prop: "title font",      val: "clamp(28px,4vw,44px)", desc: "-0.04em tracking, lh 1.15" },
          { prop: "img ratio",       val: "16 / 8",          desc: "Más panorámico que 16/9 — no es excesivamente alto" },
          { prop: "img radius",      val: "18px",            desc: "Fuera de la escala estándar — intencional para el artículo" },
          { prop: "sidebar top",     val: "96px sticky",     desc: "Alineado con el título del artículo" },
          { prop: "sidebar width",   val: "260px",           desc: "Fijo — no crece con el viewport" },
        ].map(({ prop, val, desc }) => (
          <div key={prop} className="ds-spec-row">
            <span className="ds-spec-name">{prop}</span>
            <span className="ds-spec-val">{val}</span>
            <span className="ds-spec-val" style={{ color: "var(--txt3)" }}>{desc}</span>
          </div>
        ))}
      </div>

      {/* ── Related Posts ── */}
      <SectionHeading title="Related Posts — Grid estático" />
      <p className="ds-pattern-desc">
        Grid de 3 columnas al final del artículo. Prioriza posts de la misma categoría, rellena con otros. Excluye el slug actual. Desktop 3-col → tablet 2-col → mobile 1-col.
      </p>
      <CodeBlock code={`/* CSS */
.related-posts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
@media (max-width: 860px) {
  .related-posts-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .related-posts-grid { grid-template-columns: 1fr; gap: 14px; }
}

/* Cada tarjeta reutiliza .blog-preview-img y .blog-preview-body */
.related-grid-card {
  border-radius: 16px;  /* --r-lg */
  border: 1px solid var(--border);
  background: var(--card);
}
.related-grid-card:hover {
  border-color: var(--border-h);
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);  /* token — auto dark mode */
}`} />

      {/* ── Casos de uso — tres cards, tres contextos ── */}
      <SectionHeading title="Caso de uso — tres cards, tres contextos" />
      <p className="ds-pattern-desc">
        Las tres comparten la misma idea (imagen + categoría + título) pero ninguna es intercambiable con otra — cada una
        está calibrada para la densidad de información de su contexto.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 12 }}>
        {[
          { name: "BlogCard", where: "/blog — listado completo", density: "Máxima", has: "categoría · título · excerpt · 3 tags · meta row", radius: "18px" },
          { name: "BlogPreviewCard", where: "Home — “Últimas entradas”", density: "Media", has: "categoría · título · excerpt — sin tags, sin meta", radius: "16px" },
          { name: "RelatedGridCard", where: "Final del artículo", density: "Mínima", has: "categoría · fecha · título · excerpt — sin tags", radius: "16px" },
        ].map(({ name, where, density, has, radius }) => (
          <div key={name} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 16, background: "var(--bg2)" }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "var(--accent)", marginBottom: 8 }}>{name}</div>
            <div style={{ fontSize: 12, color: "var(--txt)", marginBottom: 10, fontWeight: 600 }}>{where}</div>
            <div style={{ fontSize: 11, color: "var(--txt3)", lineHeight: 1.6, marginBottom: 10 }}>{has}</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--txt3)", paddingTop: 8, borderTop: "1px solid var(--border)" }}>
              <span>Densidad: <strong style={{ color: "var(--txt2)" }}>{density}</strong></span>
              <span>radius {radius}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="ds-pattern-desc" style={{ marginTop: 12 }}>
        La regla para elegir: a más cerca del contenido principal que el usuario ya está leyendo, menos información
        compite por su atención. Related (dentro del artículo) &lt; Preview (home, contexto de descubrimiento) &lt; Card
        (listado, el usuario está ahí específicamente a explorar).
      </p>

      {/* ── Search Input ── */}
      <SectionHeading title="Search Input — Buscador de entradas" />
      <p className="ds-pattern-desc">
        Filtra por título y contenido en tiempo real (sin debounce — el dataset es lo bastante chico como para no
        necesitarlo). El ícono cambia a <code>var(--accent)</code> con <code>:focus-within</code> en el wrapper, no con
        <code>:focus</code> en el input — así reacciona aunque el foco esté en el ícono o en cualquier hijo.
      </p>
      <PreviewBox>
        <div className="blog-search-wrap" style={{ maxWidth: 320 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="blog-search-icon">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input className="blog-search" placeholder="Buscar entradas…" />
        </div>
      </PreviewBox>
      <div className="ds-spec-table" style={{ marginTop: 12 }}>
        {[
          { prop: "focus",       val: "border-color: var(--accent) + box-shadow: 0 0 0 3px rgba(41,151,255,0.1)" },
          { prop: "focus-within", val: "el ícono (.blog-search-icon) pasa a var(--accent) — 200ms" },
          { prop: "click en tag mientras hay texto", val: "limpia search y selectedTag entre sí — son filtros mutuamente excluyentes" },
        ].map(({ prop, val }) => (
          <div key={prop} className="ds-spec-row">
            <span className="ds-spec-name">{prop}</span>
            <span className="ds-spec-val">{val}</span>
          </div>
        ))}
      </div>

      {/* ── Pagination ── */}
      <SectionHeading title="Paginador — Blog Pagination" />
      <p className="ds-pattern-desc">
        9 posts por página. La ventana de páginas visibles siempre incluye primera, última, y las 3 alrededor de la
        actual — el resto se colapsa en <code>…</code>. Se recalcula la ventana en cada cambio de página, no una vez al montar.
      </p>
      <PreviewBox>
        <nav className="blog-pagination" aria-label="Paginación demo">
          <button className="blog-page-btn">←</button>
          <button className="blog-page-btn">1</button>
          <span className="blog-page-ellipsis">…</span>
          <button className="blog-page-btn active">4</button>
          <button className="blog-page-btn">5</button>
          <span className="blog-page-ellipsis">…</span>
          <button className="blog-page-btn">9</button>
          <button className="blog-page-btn">→</button>
        </nav>
      </PreviewBox>
      <div className="ds-spec-table" style={{ marginTop: 12 }}>
        {[
          { prop: "active",   val: "bg var(--accent) · texto blanco · font-weight 600" },
          { prop: "disabled", val: "opacity 0.32 — primera/última página en los extremos ← →" },
          { prop: "hover",    val: "border + color + bg accent al 5% — no aplica sobre disabled" },
          { prop: "active (press)", val: "scale(0.9), 80ms — feedback táctil en el click, no confundir con .active de página" },
          { prop: "focus-visible",  val: "outline 2px accent, offset 2px — igual que pills y tags" },
        ].map(({ prop, val }) => (
          <div key={prop} className="ds-spec-row">
            <span className="ds-spec-name">{prop}</span>
            <span className="ds-spec-val">{val}</span>
          </div>
        ))}
      </div>
      <CodeBlock code={`// Ventana de páginas visibles — recalculada en cada render, no memoizada
// porque el dataset es chico y no vale la pena la complejidad extra
const near = new Set([1, total, page - 1, page, page + 1]
  .filter(p => p >= 1 && p <= total))
const visible = all.filter(p => near.has(p))
// Un salto > 1 entre páginas consecutivas visibles = renderizar "…"`} />

      {/* ── Empty & Loading states ── */}
      <SectionHeading title="Empty & Loading States" />
      <p className="ds-pattern-desc">
        Tres estados comparten el mismo contenedor <code>.blog-empty</code> (flex column, centrado): cargando (spinner),
        sin resultados por filtro activo, y sin posts publicados. El mensaje cambia según si hay un filtro activo —
        &quot;no hay resultados&quot; y &quot;todavía no hay contenido&quot; son problemas distintos y no deberían leerse igual.
      </p>
      <PreviewBox label="Estado: cargando">
        <div className="blog-empty">
          <span className="blog-spinner" aria-hidden="true" />
          Cargando…
        </div>
      </PreviewBox>
      <PreviewBox label="Estado: sin resultados (filtro activo)">
        <div className="blog-empty">No hay entradas que coincidan con tu búsqueda.</div>
      </PreviewBox>
      <CodeBlock code={`{loading ? (
  <div className="blog-empty">
    <span className="blog-spinner" aria-hidden="true" />
    Cargando…
  </div>
) : filtered.length === 0 ? (
  <div className="blog-empty anim-up">
    {search || category !== "Todos" || selectedTag
      ? "No hay entradas que coincidan con tu búsqueda."
      : "Aún no hay entradas publicadas. ¡Pronto!"}
  </div>
) : ( /* grid */ )}`} />

      {/* ── Scroll reveal — gotcha específico del blog ── */}
      <SectionHeading title="Scroll Reveal — la trampa del contenido async" />
      <p className="ds-pattern-desc">
        El patrón general <code>anim-up + useIntersection</code> está documentado en la página Animaciones — esta es la
        particularidad del blog que vale la pena señalar porque ya causó un bug real: el listado tiene <strong>tres</strong>{" "}
        observers separados, no uno solo, porque partes del contenido no existen todavía en el primer render.
      </p>
      <div className="ds-spec-table">
        {[
          { prop: "heroRef",  val: "hero + filtros — reveal único al montar (deps: [])" },
          { prop: "tagsRef",  val: "tags rápidos — su propio observer, deps: [allTags.length]" },
          { prop: "gridRef",  val: "grid de posts — re-stagger en cada cambio de filtro/página (deps: [ids, loading])" },
        ].map(({ prop, val }) => (
          <div key={prop} className="ds-spec-row">
            <span className="ds-spec-name">{prop}</span>
            <span className="ds-spec-val">{val}</span>
          </div>
        ))}
      </div>
      <p className="ds-pattern-desc" style={{ marginTop: 12 }}>
        La fila de tags rápidos solo existe en el DOM <em>después</em> de que resuelve el fetch de posts (es
        <code>{"{allTags.length > 0 && (…)}"}</code>). <code>heroRef</code> monta su observer 50ms después del mount inicial
        — en ese momento los posts casi nunca llegaron todavía, así que un observer que solo corre una vez
        <strong> nunca ve </strong> esa fila. Se queda en <code>opacity: 0</code> para siempre, sin error en consola,
        sin nada que lo delate salvo que el usuario note que falta algo. Cualquier bloque cuyo montaje dependa de un
        fetch async necesita su propio <code>useIntersection</code> con esa condición en las <code>deps</code> — nunca
        asumir que va a quedar atrapado por el observer de un contenedor que ya montó antes que él.
      </p>

      {/* ── Responsive ── */}
      <SectionHeading title="Breakpoints del sistema blog" />
      <div className="ds-spec-table">
        {[
          { bp: "≥1921px",  blog_grid: "4 cols",       preview_grid: "3 cols (fijo)", post_layout: "editorial 2-col" },
          { bp: "≥1440px",  blog_grid: "3 cols",        preview_grid: "3 cols",        post_layout: "single col" },
          { bp: "≥900px",   blog_grid: "3 cols",        preview_grid: "3 cols",        post_layout: "single col" },
          { bp: "641–900px",blog_grid: "2 cols",        preview_grid: "2 cols",        post_layout: "single col" },
          { bp: "≤640px",   blog_grid: "1 col (gap 14px)", preview_grid: "1 col",     post_layout: "single col" },
        ].map(({ bp, blog_grid, preview_grid, post_layout }) => (
          <div key={bp} className="ds-spec-row">
            <span className="ds-spec-name">{bp}</span>
            <span className="ds-spec-val">/blog: {blog_grid}</span>
            <span className="ds-spec-val">home: {preview_grid}</span>
            <span className="ds-spec-val">artículo: {post_layout}</span>
          </div>
        ))}
      </div>

      {/* ── Reglas ── */}
      <SectionHeading title="Reglas de uso y escala" />
      <div className="ds-rules">
        <RuleChip rule="Reutilizar .blog-preview-card para cualquier card compacta de blog fuera de /blog" variant="do" />
        <RuleChip rule="Máximo 3 tags por card (slice 0,3) — más de 3 satura visualmente" variant="do" />
        <RuleChip rule="box-shadow en hover usando var(--shadow-xl) — el token ajusta automático dark mode" variant="do" />
        <RuleChip rule="blog-post-sidebar solo se activa a ≥1921px — no añadir media queries intermedios" variant="do" />
        <RuleChip rule="Dar su propio useIntersection a cualquier bloque que dependa de datos async — nunca asumir que un observer que ya montó lo va a atrapar" variant="do" />
        <RuleChip rule="Distinguir el copy de 'sin resultados por filtro' de 'sin contenido publicado' — son problemas distintos para quien lee" variant="do" />
        <RuleChip rule="Mostrar 4+ tags por card — solo mostrar los 3 más relevantes (slice)" variant="dont" />
        <RuleChip rule="Usar blog-grid para la sección home — usar blog-preview-grid allí" variant="dont" />
        <RuleChip rule="hardcodear box-shadow en hover de cards — usar var(--shadow-xl)" variant="dont" />
        <RuleChip rule="Cambiar blog-preview-grid a 4 cols en ultra-wide — ya es intencional que quede en 3" variant="dont" />
      </div>
    </div>
  )
}

// ── Page: Breakpoints ─────────────────────────────────────────────────────────
function PageBreakpoints() {
  type Tier = { key: "mobile"|"tablet"|"desktop"|"qhd"|"ultrawide"; label: string; range: string; mq: string; color: string }
  const TIERS: Tier[] = [
    { key: "mobile",     label: "Mobile",      range: "≤ 640px",       mq: "@media (max-width: 640px)",                              color: "#ef4444" },
    { key: "tablet",     label: "Tablet",      range: "641–860px",     mq: "@media (min-width: 641px) and (max-width: 860px)",        color: "#f59e0b" },
    { key: "desktop",    label: "Desktop",     range: "861–1439px",    mq: "base (sin media query)",                                  color: "#30d158" },
    { key: "qhd",        label: "QHD / 1440p", range: "1440–1920px",   mq: "@media (min-width: 1440px) and (max-width: 1920px)",      color: "#2997ff" },
    { key: "ultrawide",  label: "Ultra-wide",  range: "≥ 1921px",      mq: "@media (min-width: 1921px)",                             color: "#a855f7" },
  ]

  const SECONDARY = [
    { bp: "≤ 820px",  affects: ".contact-split",           change: "stack vertical (1 col)" },
    { bp: "≤ 860px",  affects: ".about-grid",              change: "stack vertical (1 col)" },
    { bp: "≤ 860px",  affects: ".related-posts-grid",      change: "2 columnas → 1 columna" },
    { bp: "≤ 900px",  affects: ".blog-grid, .blog-preview-grid", change: "2 columnas" },
    { bp: "≤ 960px",  affects: "DS sidebar (.ds-sidebar)", change: "drawer móvil con overlay" },
    { bp: "≤ 1024px", affects: ".detail-main (project detail)", change: "1 col, sidebar inline" },
  ]

  const CONTAINERS = [
    { tier: "Mobile ≤640px",      section: "80px 20px",  hero: "20px",  blog: "88px 20px", detail: "24px 16px" },
    { tier: "Tablet 641–860px",   section: "72px 32px",  hero: "32px",  blog: "—",         detail: "32px 24px" },
    { tier: "Desktop 861–1439px", section: "80px 48px",  hero: "48px",  blog: "100px 48px",detail: "48px 32px" },
    { tier: "QHD 1440–1920px",    section: "80px 48px",  hero: "48px",  blog: "100px 48px",detail: "48px 32px" },
    { tier: "Ultra-wide ≥1921px", section: "96px 80px",  hero: "80px",  blog: "112px 80px",detail: "56px 64px" },
  ]

  return (
    <div className="ds-page-body">
      <div className="ds-page-header">
        <div className="ds-page-badge">Fundamentos</div>
        <h2 className="ds-page-title">Breakpoints — Sistema Responsivo</h2>
        <p className="ds-page-desc">
          5 tiers principales + 7 breakpoints secundarios de componente. Los tiers definen la estrategia de layout global; los secundarios ajustan componentes específicos dentro de cada tier. <strong>Mobile-first</strong>: los estilos base son para mobile y los media queries agregan complejidad hacia arriba.
        </p>
      </div>

      {/* ── Breakpoint scale ── */}
      <SectionHeading title="Escala visual de breakpoints" />
      <div style={{ position: "relative", marginTop: 16, marginBottom: 8 }}>
        {/* Ruler bar */}
        <div style={{ height: 8, borderRadius: 4, background: "linear-gradient(90deg, #ef4444 0%, #f59e0b 15%, #30d158 30%, #2997ff 75%, #a855f7 100%)", marginBottom: 12 }} />
        {/* Labels */}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--txt3)", fontFamily: "monospace" }}>
          <span>0</span>
          <span style={{ color: "#f59e0b" }}>641</span>
          <span style={{ color: "#30d158" }}>861</span>
          <span style={{ marginLeft: "auto", paddingRight: "22%" }}>—</span>
          <span style={{ color: "#2997ff" }}>1440</span>
          <span style={{ color: "#a855f7" }}>1921px</span>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
          {TIERS.map(t => (
            <div key={t.key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: t.color, flexShrink: 0 }} />
              <strong style={{ color: "var(--txt)" }}>{t.label}</strong>
              <span style={{ color: "var(--txt3)" }}>{t.range}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Per-tier device mockups ── */}
      <SectionHeading title="Diagramas de dispositivo — layout por tier" />
      <p className="ds-pattern-desc">
        Cada mockup muestra la estructura real de la página renderizada en el dispositivo típico de ese tier. Las anotaciones resaltan los cambios clave respecto al tier anterior. Scroll horizontal para ver todos los tiers.
      </p>

      {/* Mobile */}
      <div style={{ marginTop: 24, padding: "24px 0" }}>
        <div style={{ display: "flex", gap: 40, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div className="ds-device-unit">
            <div className="ds-device-badge" style={{ background: "#ef444422", border: "1.5px solid #ef444455", color: "#ef4444" }}>📱 Mobile</div>
            <div className="ds-device-range">≤ 640px · @media (max-width: 640px)</div>
            <MobileDevice />
            <div className="ds-device-changes">
              {["Nav oculto","Bottom nav 5 tabs","Hero 70svh top","title clamp(40–52px)","1 col projects","1–3 col blog","padding 20px"].map(c => (
                <span key={c} className="ds-device-change-chip" style={{ borderColor: "#ef444433", color: "#ef4444" }}>{c}</span>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 12, paddingTop: 40 }}>
            <div style={{ padding: 16, borderRadius: 12, background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.15)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", marginBottom: 8, letterSpacing: "0.06em", textTransform: "uppercase" }}>Cambios principales</div>
              <ul style={{ fontSize: 13, color: "var(--txt2)", lineHeight: 1.7, paddingLeft: 16 }}>
                <li><strong>.nav-center</strong> → <code>display: none</code></li>
                <li><strong>.bottom-nav</strong> → <code>display: flex</code> (z:150)</li>
                <li><strong>.hero-title</strong> → <code>clamp(40px, 11vw, 52px)</code></li>
                <li><strong>.section-full</strong> → <code>min-height: 70svh</code></li>
                <li><strong>.footer</strong> → <code>padding-bottom: 80px</code> (espacio bottom-nav)</li>
                <li><strong>.projects-bento</strong> → <code>1 columna</code></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Tablet */}
      <div style={{ marginTop: 8, padding: "24px 0", borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", gap: 40, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div className="ds-device-unit">
            <div className="ds-device-badge" style={{ background: "#f59e0b22", border: "1.5px solid #f59e0b55", color: "#f59e0b" }}>📱 Tablet</div>
            <div className="ds-device-range">641–860px · @media (min-width: 641px) and (max-width: 860px)</div>
            <TabletDevice />
            <div className="ds-device-changes">
              {["Navbar visible","No bottom nav","2 cols projects","2 cols blog","About horizontal","padding 32px"].map(c => (
                <span key={c} className="ds-device-change-chip" style={{ borderColor: "#f59e0b33", color: "#b45309" }}>{c}</span>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 12, paddingTop: 40 }}>
            <div style={{ padding: 16, borderRadius: 12, background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.18)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#b45309", marginBottom: 8, letterSpacing: "0.06em", textTransform: "uppercase" }}>Cambios principales</div>
              <ul style={{ fontSize: 13, color: "var(--txt2)", lineHeight: 1.7, paddingLeft: 16 }}>
                <li><strong>.nav-center</strong> → visible nuevamente</li>
                <li><strong>.bottom-nav</strong> → <code>display: none</code></li>
                <li><strong>.projects-bento</strong> → <code>2 cols, todas span 1</code></li>
                <li><strong>.about-grid</strong> → horizontal: foto 160px + columna stats</li>
                <li><strong>.section</strong> → <code>padding: 72px 32px 56px</code></li>
                <li><strong>.blog-grid</strong> → 2 columnas</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop */}
      <div style={{ marginTop: 8, padding: "24px 0", borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="ds-device-unit" style={{ alignItems: "flex-start" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div className="ds-device-badge" style={{ background: "#30d15822", border: "1.5px solid #30d15855", color: "#1a8f3c" }}>💻 Desktop</div>
              <div className="ds-device-range">861–1439px · estilos base (sin @media)</div>
            </div>
          </div>
          <LaptopDevice blogCols={3} />
          <div style={{ padding: 16, borderRadius: 12, background: "rgba(48,209,88,0.04)", border: "1px solid rgba(48,209,88,0.18)", maxWidth: 560 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#1a8f3c", marginBottom: 8, letterSpacing: "0.06em", textTransform: "uppercase" }}>El tier base — los estilos sin @media query</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px", fontSize: 13, color: "var(--txt2)", lineHeight: 1.7 }}>
              <div><strong>max-width</strong>: 1160px</div>
              <div><strong>hero title</strong>: clamp(52px,7.5vw,100px)</div>
              <div><strong>section padding</strong>: 80px 48px</div>
              <div><strong>projects</strong>: bento 3 cols Z-pattern</div>
              <div><strong>about</strong>: 300px + 1fr</div>
              <div><strong>blog grid</strong>: 3 columnas</div>
              <div><strong>contact</strong>: 1fr + 1.1fr</div>
              <div><strong>hero-wrap</strong>: 120px 48px 80px</div>
            </div>
          </div>
        </div>
      </div>

      {/* QHD */}
      <div style={{ marginTop: 8, padding: "24px 0", borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="ds-device-unit" style={{ alignItems: "flex-start" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div className="ds-device-badge" style={{ background: "rgba(41,151,255,0.12)", border: "1.5px solid rgba(41,151,255,0.4)", color: "#2997ff" }}>🖥 QHD / 1440p</div>
              <div className="ds-device-range">1440–1920px · @media (min-width: 1440px) and (max-width: 1920px)</div>
            </div>
          </div>
          <LaptopDevice blogCols={3} showQHDBadge />
          <div style={{ padding: 16, borderRadius: 12, background: "rgba(41,151,255,0.05)", border: "1px solid rgba(41,151,255,0.2)", maxWidth: 560 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#2997ff", marginBottom: 8, letterSpacing: "0.06em", textTransform: "uppercase" }}>Un solo cambio respecto a desktop</div>
            <div style={{ fontSize: 13, color: "var(--txt2)", lineHeight: 1.7 }}>
              <code style={{ fontSize: 12, background: "rgba(41,151,255,0.1)", padding: "1px 6px", borderRadius: 4, color: "#2997ff" }}>.hero-title {"{"} font-size: 85px; {"}"}</code>
              <p style={{ marginTop: 8 }}>El <code>clamp(52px, 7.5vw, 100px)</code> en este rango llega a 100px — demasiado grande. El override lo fija en 85px. Todo lo demás (containers, grid, tipografía) es idéntico al tier desktop.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ultra-wide */}
      <div style={{ marginTop: 8, padding: "24px 0", borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="ds-device-unit" style={{ alignItems: "flex-start" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div className="ds-device-badge" style={{ background: "rgba(168,85,247,0.12)", border: "1.5px solid rgba(168,85,247,0.4)", color: "#a855f7" }}>🖥 Ultra-wide</div>
              <div className="ds-device-range">≥ 1921px · @media (min-width: 1921px)</div>
            </div>
          </div>
          <MonitorDevice />
          <div style={{ padding: 16, borderRadius: 12, background: "rgba(168,85,247,0.04)", border: "1px solid rgba(168,85,247,0.18)", maxWidth: 580 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#a855f7", marginBottom: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>Decisiones de diseño para ultra-wide</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 20px", fontSize: 12, color: "var(--txt2)", lineHeight: 1.6 }}>
              <div>✓ <strong>.section</strong>: max-w 1400px, pad 96px 80px</div>
              <div>✗ <strong>.hero-wrap</strong>: QUEDA en 1160px (intencional)</div>
              <div>✓ <strong>.blog-grid</strong>: 4 columnas</div>
              <div>✗ <strong>.blog-preview-grid</strong>: QUEDA 3 cols (intencional)</div>
              <div>✓ <strong>.blog-post-layout</strong>: editorial 2-col</div>
              <div>✓ <strong>.about-grid</strong>: 380px + 1fr, gap 72px</div>
              <div>✓ <strong>.brands-gallery</strong>: max-w 1380px</div>
              <div>✓ <strong>.hero-title</strong>: 85px (mismo que QHD)</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Blog post layout ── */}
      <SectionHeading title="Blog post — layout editorial a ≥1921px" />
      <p className="ds-pattern-desc">
        El artículo de blog es la única vista que cambia a un layout 2 columnas editorial. El <code>blog-post-layout</code> pasa de <code>display:block</code> a <code>display:grid (720px + 260px)</code> solo en ultra-wide. La sidebar se vuelve sticky y muestra meta del artículo.
      </p>
      <div style={{ display: "flex", gap: 32, flexWrap: "wrap", alignItems: "flex-start", marginTop: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--txt3)" }}>Default (≤1920px)</div>
          <BlogPostDiagram variant="default" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(41,151,255,0.9)" }}>Ultra-wide (≥1921px) — editorial</div>
          <BlogPostDiagram variant="ultrawide" />
        </div>
      </div>

      {/* ── Container widths ── */}
      <SectionHeading title="Padding y max-width por tier" />
      <div className="ds-spec-table">
        <div className="ds-spec-row">
          <span className="ds-spec-name">Tier</span>
          <span className="ds-spec-val">.section (py px)</span>
          <span className="ds-spec-val">hero-wrap px</span>
          <span className="ds-spec-val">blog px</span>
          <span className="ds-spec-val">detail px</span>
        </div>
        {CONTAINERS.map(({ tier, section, hero, blog, detail }) => (
          <div key={tier} className="ds-spec-row">
            <span className="ds-spec-name" style={{ fontSize: 11 }}>{tier}</span>
            <span className="ds-spec-val">{section}</span>
            <span className="ds-spec-val">{hero}</span>
            <span className="ds-spec-val">{blog}</span>
            <span className="ds-spec-val">{detail}</span>
          </div>
        ))}
      </div>
      <p className="ds-pattern-desc" style={{ marginTop: 8 }}>
        <strong>max-width:</strong> Desktop/QHD → <code>1160px</code> · Ultra-wide → <code>1400px</code> (excepto hero-wrap que se queda en 1160px)
      </p>

      {/* ── Typography changes ── */}
      <SectionHeading title="Tipografía por breakpoint" />
      <div className="ds-spec-table">
        <div className="ds-spec-row">
          <span className="ds-spec-name">Elemento</span>
          <span className="ds-spec-val">Mobile ≤640px</span>
          <span className="ds-spec-val">Desktop 861–1439px</span>
          <span className="ds-spec-val">QHD 1440–1920px</span>
          <span className="ds-spec-val">Ultra-wide ≥1921px</span>
        </div>
        {[
          { el: ".hero-title",   mobile: "clamp(40px, 11vw, 52px)", desktop: "clamp(52px, 7.5vw, 100px)", qhd: "85px (fijo)", uw: "85px (fijo)" },
          { el: ".s-title",      mobile: "clamp(28px,4vw,44px)",    desktop: "clamp(28px, 4vw, 44px)",    qhd: "—",           uw: "clamp(28px,3vw,56px)" },
          { el: ".hero-sub",     mobile: "15px",                    desktop: "clamp(16px,1.8vw,20px)",    qhd: "—",           uw: "—" },
          { el: ".blog-post-title", mobile: "clamp(28px,4vw,44px)", desktop: "clamp(28px,4vw,44px)",      qhd: "—",           uw: "—" },
          { el: ".s-title projects", mobile: "clamp(36px,5vw,64px)", desktop: "clamp(36px,5vw,64px)",    qhd: "—",           uw: "—" },
        ].map(({ el, mobile, desktop, qhd, uw }) => (
          <div key={el} className="ds-spec-row">
            <span className="ds-spec-name">{el}</span>
            <span className="ds-spec-val" style={{ fontSize: 10 }}>{mobile}</span>
            <span className="ds-spec-val" style={{ fontSize: 10 }}>{desktop}</span>
            <span className="ds-spec-val" style={{ fontSize: 10, color: "var(--accent)" }}>{qhd}</span>
            <span className="ds-spec-val" style={{ fontSize: 10, color: "rgba(168,85,247,0.9)" }}>{uw}</span>
          </div>
        ))}
      </div>

      {/* ── Navigation behavior ── */}
      <SectionHeading title="Navegación por breakpoint" />
      <div className="ds-spec-table">
        {[
          { bp: "≤ 640px",   nav: "navbar: .nav-center hidden + .nav-right visible", bottom: "Bottom nav: VISIBLE (5 tabs)", ds: "DS sidebar: drawer" },
          { bp: "641–860px", nav: "navbar: completo visible",                         bottom: "Bottom nav: OCULTO",           ds: "DS sidebar: drawer" },
          { bp: "≥ 861px",   nav: "navbar: completo visible",                         bottom: "Bottom nav: OCULTO",           ds: "DS sidebar: fijo 260px" },
        ].map(({ bp, nav, bottom, ds }) => (
          <div key={bp} className="ds-spec-row">
            <span className="ds-spec-name">{bp}</span>
            <span className="ds-spec-val" style={{ flex: 1, fontSize: 11 }}>{nav}</span>
            <span className="ds-spec-val" style={{ fontSize: 11 }}>{bottom}</span>
            <span className="ds-spec-val" style={{ fontSize: 11 }}>{ds}</span>
          </div>
        ))}
      </div>

      {/* ── Secondary breakpoints ── */}
      <SectionHeading title="Breakpoints secundarios — componentes específicos" />
      <p className="ds-pattern-desc">
        Breakpoints de ajuste fino para componentes que necesitan colapsar antes o después del tier general. No definen un &quot;tier&quot; de diseño — solo ajustan el comportamiento de un componente concreto.
      </p>
      <div className="ds-spec-table">
        <div className="ds-spec-row">
          <span className="ds-spec-name">Breakpoint</span>
          <span className="ds-spec-val">Componente afectado</span>
          <span className="ds-spec-val">Cambio</span>
        </div>
        {SECONDARY.map(({ bp, affects, change }) => (
          <div key={bp + affects} className="ds-spec-row">
            <span className="ds-spec-name">{bp}</span>
            <span className="ds-spec-val">{affects}</span>
            <span className="ds-spec-val" style={{ color: "var(--txt3)" }}>{change}</span>
          </div>
        ))}
      </div>

      {/* ── Code reference ── */}
      <SectionHeading title="Referencia de código — todos los media queries en orden" />
      <CodeBlock code={`/* ═══════════════════════════════════════════════════════
   MOBILE — ≤640px (max-width)
   - Bottom nav visible, nav-center hidden
   - Hero: 70svh top-aligned, title clamp(40,11vw,52px)
   - Proyectos, Blog: 1 columna
   - Sections: padding 72px 20px 24px
   ═══════════════════════════════════════════════════════ */
@media (max-width: 640px) { ... }

/* ═══════════════════════════════════════════════════════
   TABLET — 641px–860px (min + max)
   - Proyectos: 2 columnas, all cards 16:10
   - About: horizontal (160px foto + stats column)
   - Sections: padding 72px 32px 56px
   ═══════════════════════════════════════════════════════ */
@media (min-width: 641px) and (max-width: 860px) { ... }

/* SECONDARY — componente-específicos */
@media (max-width: 820px) { /* contact-split 1col */ }
@media (max-width: 860px) { /* about-grid + related-posts */ }
@media (max-width: 900px) { /* blog-grid + blog-preview-grid 2col */ }
@media (max-width: 960px) { /* DS sidebar drawer */ }
@media (max-width: 1024px) { /* detail-main 1col */ }

/* ═══════════════════════════════════════════════════════
   DESKTOP — 861–1439px
   BASE (sin media query) — diseño base del sitio
   - Proyectos: bento 3 cols (featured 2fr + compact 1fr)
   - max-width: 1160px, padding 80px 48px
   ═══════════════════════════════════════════════════════ */
/* Estilos por defecto sin @media */

/* ═══════════════════════════════════════════════════════
   QHD / 1440p — 1440px–1920px (min + max)
   - hero-title: 85px FIJO (overrides el clamp)
   - Todo lo demás: igual a desktop
   ═══════════════════════════════════════════════════════ */
@media (min-width: 1440px) and (max-width: 1920px) {
  .hero-title { font-size: 85px; }
}

/* ═══════════════════════════════════════════════════════
   ULTRA-WIDE — ≥1921px (min-width)
   - .section: max-width 1400px, padding 96px 80px
   - hero-wrap: MANTIENE max-width 1160px (intencional)
   - .hero-title: 85px (mismo que QHD)
   - .blog-grid: 4 columnas
   - .blog-post-layout: editorial 2-col (720px + 260px sidebar)
   - .about-grid: 380px + 1fr, gap 72px
   - .contact-split: max-width 1200px
   ═══════════════════════════════════════════════════════ */
@media (min-width: 1921px) { ... }`} />

      {/* ── About/Contact wireframes ── */}
      <SectionHeading title="About Grid y Contact Split — layout desktop" />
      <p className="ds-pattern-desc">
        Los dos layouts más complejos en desktop. About usa una columna sticky para la foto. Contact usa 1fr + 1.1fr para dar más peso visual al formulario.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>

        {/* ── About Grid ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--txt2)" }}>About Grid · desktop (300px + 1fr)</div>
          <div className="ds-anatomy-wrap">
            <div style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: 16, padding: "20px 18px", alignItems: "start" }}>
              {/* Left col — photo */}
              <div style={{ display: "flex", flexDirection: "column", gap: 0, borderRadius: 18, overflow: "hidden", border: "1px solid rgba(41,151,255,0.18)", boxShadow: "0 0 0 1px rgba(41,151,255,0.08), 0 12px 32px rgba(0,0,0,0.07)" }}>
                <div style={{ aspectRatio: "3/4", background: "radial-gradient(ellipse at 30% 25%, rgba(41,151,255,0.22) 0%, transparent 55%), radial-gradient(ellipse at 80% 75%, rgba(167,139,250,0.18) 0%, transparent 50%), #eef4ff", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(41,151,255,0.15)", border: "1px solid rgba(41,151,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(41,151,255,0.6)" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                  </div>
                  <div style={{ position: "absolute", top: 6, left: 6, fontSize: 8, fontFamily: "monospace", color: "rgba(41,151,255,0.6)", background: "rgba(255,255,255,0.85)", padding: "1px 5px", borderRadius: 3 }}>3:4 sticky</div>
                </div>
                <div style={{ padding: "10px 12px", background: "rgba(255,255,255,0.88)", backdropFilter: "blur(16px)", borderTop: "1px solid rgba(41,151,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontSize: 11, color: "var(--txt2)" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)", flexShrink: 0 }} />
                  <span>Disponible <strong style={{ color: "var(--success)" }}>2026</strong></span>
                </div>
              </div>
              {/* Right col — content */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
                  {[{ n: "5+", l: "Años" }, { n: "40+", l: "Proyectos" }, { n: "98%", l: "Satisf." }].map(({ n, l }) => (
                    <div key={l} style={{ padding: "10px 8px", textAlign: "center", background: "rgba(255,255,255,0.72)", backdropFilter: "blur(12px)", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 12 }}>
                      <div style={{ fontFamily: "var(--portfolio-heading-font)", fontSize: 18, fontWeight: 700, letterSpacing: "-0.04em", color: "var(--txt)", marginBottom: 1 }}>{n}</div>
                      <div style={{ fontSize: 9, color: "var(--txt3)" }}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {[0.9, 1, 0.8, 0.7].map((w, i) => (
                    <div key={i} style={{ height: 8, width: `${w * 100}%`, borderRadius: 4, background: i % 2 === 0 ? "rgba(0,0,0,0.14)" : "rgba(0,0,0,0.09)" }} />
                  ))}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {["Figma", "React", "Next.js", "TypeScript", "Design Systems"].map(s => (
                    <div key={s} style={{ padding: "4px 10px", borderRadius: 980, border: "1px solid var(--border)", background: "rgba(255,255,255,0.65)", fontSize: 10, color: "var(--txt2)" }}>{s}</div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ padding: "8px 16px", borderRadius: 980, background: "var(--accent)", color: "white", fontSize: 12, fontWeight: 500 }}>Ver CV →</div>
                  <div style={{ padding: "8px 16px", borderRadius: 980, border: "1px solid var(--border)", color: "var(--txt)", fontSize: 12, fontWeight: 500 }}>LinkedIn</div>
                </div>
              </div>
            </div>
            {/* Annotation row */}
            <div style={{ display: "grid", gridTemplateColumns: "130px 1fr", background: "var(--border)", gap: "1px", borderTop: "1px solid var(--border)" }}>
              <div style={{ padding: "8px 12px", background: "var(--bg2)" }}>
                <code style={{ display: "block", fontSize: 9, color: "var(--accent)", fontWeight: 700, marginBottom: 2 }}>.about-photo-wrap</code>
                <div style={{ fontSize: 9, color: "var(--txt3)", lineHeight: 1.5 }}>sticky · top:88px<br/>border: accent 0.18<br/>r-2xl</div>
              </div>
              <div style={{ padding: "8px 12px", background: "var(--bg2)" }}>
                <code style={{ display: "block", fontSize: 9, color: "var(--accent)", fontWeight: 700, marginBottom: 2 }}>.about-content</code>
                <div style={{ fontSize: 9, color: "var(--txt3)", lineHeight: 1.5 }}>stats 3-col · bio 16px/1.8 · skills flex-wrap · btn-p + btn-g</div>
              </div>
            </div>
            {/* Breakpoint row */}
            <div style={{ padding: "8px 14px", background: "var(--bg3)", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 4 }}>
              {[
                { bp: "Desktop", col: "300px + 1fr · gap 56px" },
                { bp: "Tablet",  col: "foto 160px + stats col" },
                { bp: "Mobile",  col: "stack vertical · foto 2:1" },
              ].map(({ bp, col }) => (
                <div key={bp} style={{ display: "flex", gap: 8 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "var(--accent)", fontFamily: "monospace", flexShrink: 0, width: 52 }}>{bp}</div>
                  <div style={{ fontSize: 9, color: "var(--txt3)" }}>{col}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Contact Split ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--txt2)" }}>Contact Split · desktop (1fr + 1.1fr)</div>
          <div className="ds-anatomy-wrap">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 20, padding: "20px 18px", alignItems: "start" }}>
              {/* Left — info column */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <div style={{ fontFamily: "var(--portfolio-heading-font)", fontSize: 18, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.25, color: "var(--txt)", marginBottom: 8 }}>
                    ¿Tienes un proyecto en <em style={{ fontStyle: "normal", color: "var(--accent)" }}>mente</em>?
                  </div>
                  <div style={{ fontSize: 12, lineHeight: 1.7, color: "var(--txt2)" }}>Trabajo con equipos para transformar ideas en productos digitales.</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {[{ label: "Email", value: "c.hickmann86@gmail.com" }, { label: "LinkedIn", value: "linkedin.com/in/carlos-rojas" }].map(({ label, value }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)" }}>
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(41,151,255,0.10)", border: "1px solid rgba(41,151,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.75"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                      </div>
                      <div>
                        <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--txt3)" }}>{label}</div>
                        <div style={{ fontSize: 11, fontWeight: 500, color: "var(--txt)" }}>{value}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 980, border: "1px solid rgba(48,209,88,0.3)", background: "rgba(48,209,88,0.07)", fontSize: 11, color: "var(--success)", width: "fit-content" }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--success)" }} />
                  Disponible · 2026
                </div>
              </div>
              {/* Right — form card */}
              <div style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 20, padding: 18, boxShadow: "0 12px 40px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.9)" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[{ ph: "Nombre completo *" }, { ph: "Email *" }].map((f, i) => (
                    <div key={i} style={{ position: "relative", height: 46, borderRadius: 9, border: "1.5px solid rgba(0,0,0,0.12)", background: "rgba(0,0,0,0.04)" }}>
                      <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "rgba(0,0,0,0.38)" }}>{f.ph}</div>
                    </div>
                  ))}
                  <div style={{ position: "relative", height: 80, borderRadius: 9, border: "1.5px solid rgba(0,0,0,0.12)", background: "rgba(0,0,0,0.04)" }}>
                    <div style={{ position: "absolute", left: 12, top: 12, fontSize: 12, color: "rgba(0,0,0,0.38)" }}>Mensaje…</div>
                  </div>
                  <div style={{ height: 40, borderRadius: 980, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "white", fontWeight: 500 }}>Enviar mensaje →</div>
                </div>
              </div>
            </div>
            {/* Annotation row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", background: "var(--border)", gap: "1px", borderTop: "1px solid var(--border)" }}>
              <div style={{ padding: "8px 12px", background: "var(--bg2)" }}>
                <code style={{ display: "block", fontSize: 9, color: "var(--accent)", fontWeight: 700, marginBottom: 2 }}>.contact-info</code>
                <div style={{ fontSize: 9, color: "var(--txt3)", lineHeight: 1.5 }}>tagline 22–30px · sub 15px · links flex-col · avail inline-flex</div>
              </div>
              <div style={{ padding: "8px 12px", background: "var(--bg2)" }}>
                <code style={{ display: "block", fontSize: 9, color: "var(--accent)", fontWeight: 700, marginBottom: 2 }}>.contact-form-card</code>
                <div style={{ fontSize: 9, color: "var(--txt3)", lineHeight: 1.5 }}>rgba(255,255,255,0.85) · blur(20px) · r-2xl · shadow-lg</div>
              </div>
            </div>
            {/* Breakpoint row */}
            <div style={{ padding: "8px 14px", background: "var(--bg3)", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 4 }}>
              {[
                { bp: "Desktop", col: "1fr 1.1fr · gap 64px · max-w 1000px" },
                { bp: "≤820px",  col: "1 col · gap 48px" },
                { bp: "≥1921px", col: "max-w 1200px · gap 80px" },
              ].map(({ bp, col }) => (
                <div key={bp} style={{ display: "flex", gap: 8 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "var(--accent)", fontFamily: "monospace", flexShrink: 0, width: 52 }}>{bp}</div>
                  <div style={{ fontSize: 9, color: "var(--txt3)" }}>{col}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ── Reglas ── */}
      <SectionHeading title="Reglas de implementación responsiva" />
      <div className="ds-rules">
        <RuleChip rule="Mobile-first: escribir estilos base para mobile, agregar complejidad hacia arriba con min-width" variant="do" />
        <RuleChip rule="Usar los tiers principales (640, 860, 1440, 1921) como referencia — los secundarios solo para ajustes de componente" variant="do" />
        <RuleChip rule="hero-wrap SIEMPRE max-width 1160px — no expandir a 1400px aunque el tier ultra-wide lo permita" variant="do" />
        <RuleChip rule="Respetar que .blog-preview-grid siempre queda en 3 cols (incluso ultra-wide) — es decisión de diseño intencional" variant="do" />
        <RuleChip rule="Definir un nuevo breakpoint ad-hoc en vez de usar los tiers existentes — añadir fragmentación innecesaria" variant="dont" />
        <RuleChip rule="Escribir estilos desktop-first y sobrescribir con max-width — va contra la arquitectura del DS" variant="dont" />
        <RuleChip rule="Expandir hero-wrap a 1400px en ultra-wide — la decisión es mantenerlo centrado en 1160px" variant="dont" />
        <RuleChip rule="Añadir bottom-nav en tablet o desktop — es exclusivo de mobile (≤640px)" variant="dont" />
      </div>
    </div>
  )
}

// ── Page map ──────────────────────────────────────────────────────────────────
const PAGE_MAP: Record<DSPageId, React.ComponentType> = {
  overview:    PageOverview,
  colors:      PageColors,
  typography:  PageTypography,
  darkmode:    PageDarkMode,
  primitivos:  PagePrimitivos,
  animaciones: PageAnimaciones,
  breakpoints: PageBreakpoints,
  buttons:     PageButtons,
  cards:       PageCards,
  forms:       PageForms,
  navigation:  PageNavigation,
  badges:      PageBadges,
  toast:       PageToast,
  modals:      PageModals,
  patterns:    PagePatterns,
  "project-detail": PageProjectDetail,
  brands:      PageBrands,
  blog:        PageBlog,
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
            <div className="ds-brand-version">v1.10.0</div>
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
