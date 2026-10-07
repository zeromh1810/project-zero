"use client"

/* eslint-disable @next/next/no-img-element -- documentación: capturas PNG y
   miniaturas que el admin ya muestra con <img>; next/image no aporta aquí. */

import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { useTheme } from "@/lib/context/theme-context"
import { CheckIcon, CloseIcon } from "@/components/portfolio/icons"
import { contrastRatio, readVar, wcagLevel } from "../lib/tokens"
import { useLiveTokens } from "../lib/use-live-tokens"

/* ═══════════════════════════════════════════════════════════════════════════
   Primitivas de documentación del DS (v2.1.0) — enfoque para diseñadores,
   al estilo de Material Design / Carbon: cada componente se documenta en
   pestañas Uso · Estilo · Contenido · Accesibilidad · Código, y TODA regla de
   uso trae su imagen de referencia ✓/✗ (componente real renderizado).
   ═══════════════════════════════════════════════════════════════════════════ */

export type DocStatus = "estable" | "nuevo" | "en revisión"

export interface DocTab { id: string; label: string; content: ReactNode }

/** Página de documentación con encabezado y pestañas. */
export function DocPage({ eyebrow, title, summary, status, tabs, children }: {
  eyebrow: string
  title: string
  summary: ReactNode
  status?: DocStatus
  tabs?: DocTab[]
  children?: ReactNode
}) {
  const [active, setActive] = useState(tabs?.[0]?.id ?? "")
  const id = useId()
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (!tabs) return
    let n: number | null = null
    if (e.key === "ArrowRight") n = (i + 1) % tabs.length
    if (e.key === "ArrowLeft") n = (i - 1 + tabs.length) % tabs.length
    if (n === null) return
    e.preventDefault()
    setActive(tabs[n].id)
    refs.current[n]?.focus()
  }

  return (
    <article className="doc-page">
      <header className="doc-head">
        <div className="doc-eyebrow">
          <span>{eyebrow}</span>
          {status && <span className={`doc-status doc-status--${status.replace(" ", "-")}`}>{status}</span>}
        </div>
        <h1 className="doc-title" tabIndex={-1}>{title}</h1>
        <div className="doc-summary">{summary}</div>
      </header>

      {tabs && (
        <>
          <div role="tablist" aria-label={`Secciones de ${title}`} className="doc-tabs">
            {tabs.map((t, i) => (
              <button
                key={t.id}
                ref={(el) => { refs.current[i] = el }}
                role="tab"
                type="button"
                id={`${id}-${t.id}-tab`}
                aria-selected={active === t.id}
                aria-controls={`${id}-${t.id}-panel`}
                tabIndex={active === t.id ? 0 : -1}
                className={`doc-tab${active === t.id ? " is-active" : ""}`}
                onClick={() => setActive(t.id)}
                onKeyDown={(e) => onKey(e, i)}
              >
                {t.label}
              </button>
            ))}
          </div>
          {tabs.map((t) => (
            <div key={t.id} role="tabpanel" id={`${id}-${t.id}-panel`} aria-labelledby={`${id}-${t.id}-tab`} hidden={active !== t.id} className="doc-panel">
              {active === t.id && t.content}
            </div>
          ))}
        </>
      )}
      {children}
    </article>
  )
}

/** Sección dentro de una pestaña. */
export function Section({ title, intro, children }: { title: string; intro?: ReactNode; children?: ReactNode }) {
  return (
    <section className="doc-section">
      <h2 className="doc-h2">{title}</h2>
      {intro && <div className="doc-intro">{intro}</div>}
      {children}
    </section>
  )
}

/** Escenario neutro donde se renderiza un ejemplo. */
export function Stage({ children, label, pad = "md", align = "center", surface = "page" }: {
  children: ReactNode
  label?: string
  pad?: "sm" | "md" | "lg"
  align?: "center" | "start" | "stretch"
  /** Fondo del escenario: el de la página o el de una superficie elevada. */
  surface?: "page" | "raised" | "sheet"
}) {
  return (
    <div className={`doc-stage doc-stage--${pad} doc-stage--${align} doc-stage--${surface}`} aria-label={label} role={label ? "img" : undefined}>
      {children}
    </div>
  )
}

/**
 * Regla de uso con imagen de referencia ✓ / ✗ — requisito del DS: una regla
 * sin `doDemo` y `dontDemo` se marca en rojo para que no pase desapercibida.
 */
export function UsageRule({ title, doText, doDemo, dontText, dontDemo, surface }: {
  title: string
  doText: string
  doDemo: ReactNode
  dontText: string
  dontDemo: ReactNode
  surface?: "page" | "raised" | "sheet"
}) {
  const missing = !doDemo || !dontDemo
  return (
    <div className={`doc-rule${missing ? " doc-rule--missing" : ""}`}>
      <h3 className="doc-rule-title">{title}</h3>
      <div className="doc-rule-pair">
        <figure className="doc-rule-case doc-rule-case--do">
          <div className="doc-rule-demo"><Stage pad="md" surface={surface}>{doDemo}</Stage></div>
          <figcaption>
            <span className="doc-rule-verdict"><CheckIcon /> Correcto</span>
            <span className="doc-rule-text">{doText}</span>
          </figcaption>
        </figure>
        <figure className="doc-rule-case doc-rule-case--dont">
          <div className="doc-rule-demo" aria-hidden="true" inert><Stage pad="md" surface={surface}>{dontDemo}</Stage></div>
          <figcaption>
            <span className="doc-rule-verdict"><CloseIcon /> Incorrecto</span>
            <span className="doc-rule-text">{dontText}</span>
          </figcaption>
        </figure>
      </div>
      {missing && <p className="doc-rule-warning">Esta regla no tiene imagen de referencia ✓/✗.</p>}
    </div>
  )
}

/** Cuadrícula de reglas. */
export function Rules({ children }: { children: ReactNode }) {
  return <div className="doc-rules">{children}</div>
}

/**
 * Anatomía: el componente real con marcadores numerados + leyenda.
 * `parts` usa posiciones en % sobre el escenario (diseño editorial, ajustado a mano).
 */
export function Anatomy({ children, parts }: {
  children: ReactNode
  parts: { n: number; label: string; detail?: string; x: number; y: number }[]
}) {
  return (
    <div className="doc-anatomy">
      <div className="doc-anatomy-stage">
        <Stage pad="lg">{children}</Stage>
        {parts.map((p) => (
          <span key={p.n} className="doc-marker" style={{ left: `${p.x}%`, top: `${p.y}%` }} aria-hidden="true">{p.n}</span>
        ))}
      </div>
      <ol className="doc-legend">
        {parts.map((p) => (
          <li key={p.n}><span className="doc-legend-n" aria-hidden="true">{p.n}</span><span><strong>{p.label}</strong>{p.detail && <> — {p.detail}</>}</span></li>
        ))}
      </ol>
    </div>
  )
}

/**
 * Especificación con medidas leídas del componente REAL (no escritas a mano):
 * alto, ancho, padding, radio, tipografía y gap del primer hijo del escenario,
 * con las cotas dibujadas encima (redlines).
 */
export function Redline({ children, label }: { children: ReactNode; label?: string }) {
  const wrap = useRef<HTMLDivElement>(null)
  const { isDark } = useTheme()
  const [m, setM] = useState<null | {
    w: number; h: number; pt: number; pr: number; pb: number; pl: number; radius: string; font: string; gap: string
  }>(null)

  useLayoutEffect(() => {
    const el = wrap.current?.firstElementChild as HTMLElement | null
    if (!el) return
    const measure = () => {
      const cs = getComputedStyle(el)
      const r = el.getBoundingClientRect()
      setM({
        w: Math.round(r.width), h: Math.round(r.height),
        pt: parseFloat(cs.paddingTop), pr: parseFloat(cs.paddingRight), pb: parseFloat(cs.paddingBottom), pl: parseFloat(cs.paddingLeft),
        radius: cs.borderRadius, font: `${cs.fontSize} / ${cs.fontWeight}`, gap: cs.columnGap === "normal" ? "—" : cs.columnGap,
      })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [isDark])

  return (
    <figure className="doc-redline">
      <div className="doc-redline-stage">
        <div className="doc-redline-box" ref={wrap}>
          {children}
          {m && <>
            <span className="doc-dim doc-dim--w" aria-hidden="true"><i>{m.w}</i></span>
            <span className="doc-dim doc-dim--h" aria-hidden="true"><i>{m.h}</i></span>
            {m.pl > 0 && <span className="doc-pad doc-pad--l" style={{ width: m.pl }} aria-hidden="true" />}
            {m.pr > 0 && <span className="doc-pad doc-pad--r" style={{ width: m.pr }} aria-hidden="true" />}
          </>}
        </div>
      </div>
      {m && (
        <figcaption>
          <dl className="doc-specs">
            <div><dt>Alto</dt><dd>{m.h}px</dd></div>
            <div><dt>Ancho</dt><dd>{m.w}px</dd></div>
            <div><dt>Padding</dt><dd>{m.pt} · {m.pr} · {m.pb} · {m.pl}</dd></div>
            <div><dt>Radio</dt><dd>{m.radius}</dd></div>
            <div><dt>Texto</dt><dd>{m.font}</dd></div>
            <div><dt>Gap</dt><dd>{m.gap}</dd></div>
          </dl>
          {label && <p className="doc-caption">{label} · medido en vivo del componente real.</p>}
        </figcaption>
      )}
    </figure>
  )
}

/** Matriz de estados lado a lado (estados forzados vía data-pseudo, ver pseudo-states.ts). */
export function StateMatrix({ states, render }: {
  states: { label: string; pseudo?: "hover" | "focus" | "active"; extra?: Record<string, unknown>; note?: string }[]
  render: (s: { pseudo?: string; extra?: Record<string, unknown> }) => ReactNode
}) {
  return (
    <div className="doc-states">
      {states.map((s) => (
        <figure key={s.label} className="doc-state">
          <Stage pad="md">{render({ pseudo: s.pseudo, extra: s.extra })}</Stage>
          <figcaption><strong>{s.label}</strong>{s.note && <span>{s.note}</span>}</figcaption>
        </figure>
      ))}
    </div>
  )
}

/** Tabla de tokens con su valor computado en el tema activo. */
export function TokenTable({ rows }: { rows: { token: string; role: string; swatch?: boolean }[] }) {
  const values = useLiveTokens(rows.map((r) => r.token))
  return (
    <div className="doc-table-wrap">
      <table className="doc-table">
        <thead><tr><th scope="col">Token</th><th scope="col">Uso</th><th scope="col">Valor (tema activo)</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.token}>
              <td><code>{r.token}</code></td>
              <td>{r.role}</td>
              <td>
                <span className="doc-token-val">
                  {r.swatch && <span className="doc-swatch" style={{ background: `var(${r.token})` }} aria-hidden="true" />}
                  <code>{values[r.token] || "…"}</code>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Pares de contraste medidos en vivo con su nivel WCAG. */
export function ContrastTable({ pairs }: { pairs: { label: string; fg: string; bg: string; large?: boolean }[] }) {
  const { isDark } = useTheme()
  const [rows, setRows] = useState<{ label: string; ratio: number | null; large?: boolean; fg: string; bg: string }[]>([])
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setRows(pairs.map((p) => ({ ...p, ratio: contrastRatio(p.fg.startsWith("--") ? readVar(p.fg) : p.fg, p.bg.startsWith("--") ? readVar(p.bg) : p.bg) })))
    })
    return () => cancelAnimationFrame(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- se recalcula al cambiar de tema
  }, [isDark])
  const v = (t: string) => (t.startsWith("--") ? `var(${t})` : t)
  return (
    <div className="doc-table-wrap">
      <table className="doc-table">
        <thead><tr><th scope="col">Combinación</th><th scope="col">Muestra</th><th scope="col">Contraste</th><th scope="col">WCAG</th></tr></thead>
        <tbody>
          {rows.map((r) => {
            const level = r.ratio ? wcagLevel(r.ratio, r.large) : "Falla"
            return (
              <tr key={r.label}>
                <td>{r.label}{r.large && <span className="doc-muted"> · texto grande</span>}</td>
                <td><span className="doc-contrast-sample" style={{ color: v(r.fg), background: v(r.bg) }}>Aa</span></td>
                <td><code>{r.ratio ? `${r.ratio.toFixed(2)}:1` : "…"}</code></td>
                <td><span className={`doc-level doc-level--${level === "Falla" ? "fail" : "pass"}`}>{level}</span></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/** Bloque de código con copiar. */
export function CodeBlock({ code, lang = "tsx" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="doc-code">
      <div className="doc-code-bar">
        <span>{lang}</span>
        <button type="button" className="doc-code-copy" onClick={() => navigator.clipboard?.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) })}
          aria-label={copied ? "Código copiado" : "Copiar código"}>
          {copied ? <><CheckIcon /> Copiado</> : "Copiar"}
        </button>
      </div>
      <pre><code>{code}</code></pre>
    </div>
  )
}

/** Captura PNG del sitio real (generada por scripts/qa/capture-ds.mjs), según el tema activo. */
export function Capture({ id, alt, caption, ratio = "16 / 10" }: { id: string; alt: string; caption?: string; ratio?: string }) {
  const { isDark } = useTheme()
  const [failed, setFailed] = useState(false)
  const src = `/ds/captures/${id}-${isDark ? "dark" : "light"}.png`
  return (
    <figure className="doc-capture">
      <div className="doc-capture-frame" style={{ aspectRatio: ratio }}>
        {failed
          ? <p className="doc-capture-missing">Captura pendiente: <code>node scripts/qa/capture-ds.mjs</code></p>
          : <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} key={src} />}
      </div>
      {caption && <figcaption className="doc-caption">{caption}</figcaption>}
    </figure>
  )
}

/** Lista de puntos clave (Uso: cuándo usar / cuándo no). */
export function WhenToUse({ use, avoid }: { use: ReactNode[]; avoid: { text: ReactNode; instead?: ReactNode }[] }) {
  return (
    <div className="doc-when">
      <div className="doc-when-col">
        <h3 className="doc-h3"><CheckIcon /> Úsalo cuando</h3>
        <ul>{use.map((u, i) => <li key={i}>{u}</li>)}</ul>
      </div>
      <div className="doc-when-col doc-when-col--avoid">
        <h3 className="doc-h3"><CloseIcon /> No lo uses cuando</h3>
        <ul>{avoid.map((a, i) => <li key={i}>{a.text}{a.instead && <span className="doc-instead"> → usa {a.instead}</span>}</li>)}</ul>
      </div>
    </div>
  )
}

/** Lista de chequeo de accesibilidad: qué cubre el componente y qué hace el diseñador. */
export function A11yChecklist({ built, designer }: { built: ReactNode[]; designer: ReactNode[] }) {
  return (
    <div className="doc-when">
      <div className="doc-when-col">
        <h3 className="doc-h3">Ya resuelto en el componente</h3>
        <ul>{built.map((u, i) => <li key={i}>{u}</li>)}</ul>
      </div>
      <div className="doc-when-col">
        <h3 className="doc-h3">Responsabilidad del diseño</h3>
        <ul>{designer.map((u, i) => <li key={i}>{u}</li>)}</ul>
      </div>
    </div>
  )
}

/** Ejemplo en vivo con su código opcional debajo. */
export function Example({ children, code, pad, align, surface, caption }: {
  children: ReactNode
  code?: string
  pad?: "sm" | "md" | "lg"
  align?: "center" | "start" | "stretch"
  surface?: "page" | "raised" | "sheet"
  caption?: ReactNode
}) {
  return (
    <div className="doc-example-wrap">
      <div className="doc-example"><Stage pad={pad} align={align} surface={surface}>{children}</Stage></div>
      {caption && <p className="doc-caption">{caption}</p>}
      {code && <CodeBlock code={code} />}
    </div>
  )
}

/** Catálogo de variantes: cada una con su escenario, nombre y cuándo usarla. */
export function Variants({ items }: { items: { name: string; desc: ReactNode; demo: ReactNode; surface?: "page" | "raised" | "sheet" }[] }) {
  return (
    <div className="doc-variants">
      {items.map((v) => (
        <div key={v.name} className="doc-variant">
          <Stage pad="md" surface={v.surface}>{v.demo}</Stage>
          <div className="doc-variant-body">
            <div className="doc-variant-name">{v.name}</div>
            <div className="doc-variant-desc">{v.desc}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

/** Párrafos de texto corrido con ancho de lectura. */
export function Prose({ children }: { children: ReactNode }) {
  return <div className="doc-text">{children}</div>
}
