"use client"

import tokensJson from "@/assets/design-tokens.json"

// Fuente de verdad del viewer: el DS ya no escribe valores a mano (antes la
// tabla de Botones decía `--accent` y 15px cuando el sitio usaba otra cosa).
// - Versión y changelog: desde design-tokens.json ($meta).
// - Valores: el valor COMPUTADO de la variable CSS en el documento, en el tema
//   activo — lo que el usuario realmente ve.

type Meta = { version: string; changelog: string }
const meta = (tokensJson as unknown as { $meta: Meta }).$meta

export const DS_VERSION = meta.version

/** Entradas del changelog del JSON ("v2.0.0: …. v1.9.0: …") separadas por versión. */
export function changelogEntries(): { version: string; text: string }[] {
  return meta.changelog
    // Solo corta donde una versión EMPIEZA una oración ("…texto. v1.8.0: …"):
    // dentro del texto hay menciones como "DS viewer v1.8.0:" que no son entradas.
    .split(/(?:^|\.\s+)(?=v\d+\.\d+\.\d+:)/)
    .map((chunk) => {
      const m = chunk.match(/^v(\d+\.\d+\.\d+):\s*([\s\S]*)$/)
      return m ? { version: m[1], text: m[2].trim() } : null
    })
    .filter((e): e is { version: string; text: string } => !!e)
}

/** Valor computado de una variable CSS en :root (tema activo). */
export function readVar(name: string, el: Element = document.documentElement): string {
  return getComputedStyle(el).getPropertyValue(name).trim()
}

/** Resuelve cualquier color CSS (var(), color-mix, hex, nombre) a rgb(a) usando el motor del navegador. */
export function resolveColor(value: string): [number, number, number, number] | null {
  const probe = document.createElement("span")
  probe.style.color = value
  probe.style.display = "none"
  document.body.appendChild(probe)
  const rgb = getComputedStyle(probe).color
  probe.remove()
  const n = rgb.match(/[\d.]+/g)?.map(Number)
  if (!n || n.length < 3) return null
  return [n[0], n[1], n[2], n[3] ?? 1]
}

function luminance([r, g, b]: number[]) {
  const f = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

/** Contraste WCAG entre dos colores CSS (componiendo el alpha del texto sobre el fondo). */
export function contrastRatio(fg: string, bg: string): number | null {
  const f = resolveColor(fg), b = resolveColor(bg)
  if (!f || !b) return null
  const a = f[3]
  const mixed = [0, 1, 2].map((i) => f[i] * a + b[i] * (1 - a))
  const L1 = luminance(mixed), L2 = luminance(b)
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)
}

/** Nivel WCAG para texto normal / grande. */
export function wcagLevel(ratio: number, large = false): "AAA" | "AA" | "Falla" {
  if (ratio >= (large ? 4.5 : 7)) return "AAA"
  if (ratio >= (large ? 3 : 4.5)) return "AA"
  return "Falla"
}
