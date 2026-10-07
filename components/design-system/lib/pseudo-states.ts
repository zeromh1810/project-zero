"use client"

// Estados forzados para las imágenes de referencia del DS (matriz de estados,
// ejemplos ✓/✗ de hover o foco). Los pseudo-estados (:hover, :focus-visible,
// :active) no se pueden activar desde código, así que — igual que el addon
// "pseudo-states" de Storybook — se clonan las reglas reales que los usan,
// reemplazando el pseudo por un atributo:
//
//   .btn-p:hover            →  .btn-p[data-pseudo~="hover"]
//   .p-card:hover .arrow    →  .p-card[data-pseudo~="hover"] .arrow
//
// Resultado: <button className="btn-p" data-pseudo="hover"> se ve EXACTAMENTE
// como el botón real con el mouse encima, sin duplicar CSS a mano (si cambia
// el estilo del componente, la imagen del DS cambia sola).

const MAP: [RegExp, string][] = [
  [/:hover/g, '[data-pseudo~="hover"]'],
  [/:focus-visible/g, '[data-pseudo~="focus"]'],
  [/:focus-within/g, '[data-pseudo~="focus"]'],
  [/:focus(?![-\w])/g, '[data-pseudo~="focus"]'],
  [/:active/g, '[data-pseudo~="active"]'],
]
const HAS = /:hover|:focus|:active/

let installed = false

function rewrite(selector: string) {
  return MAP.reduce((sel, [re, rep]) => sel.replace(re, rep), selector)
}

export function installPseudoStates() {
  if (installed || typeof document === "undefined") return
  installed = true
  const out: string[] = []

  const walk = (rules: CSSRuleList, wrap: (css: string) => string) => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSStyleRule) {
        if (!HAS.test(rule.selectorText)) continue
        // Solo los selectores de la lista que usan pseudo-estados
        const parts = rule.selectorText.split(",").map((s) => s.trim()).filter((s) => HAS.test(s))
        if (!parts.length) continue
        out.push(wrap(`${parts.map(rewrite).join(", ")} { ${rule.style.cssText} }`))
      } else if (rule instanceof CSSMediaRule) {
        const cond = rule.conditionText || rule.media.mediaText
        // (hover: hover) es la guardia de puntero: en el DS los estados forzados
        // deben verse siempre, también en touch.
        if (/hover:\s*hover|pointer:\s*fine/.test(cond)) walk(rule.cssRules, wrap)
        else walk(rule.cssRules, (css) => wrap(`@media ${cond} { ${css} }`))
      } else if (rule instanceof CSSSupportsRule) {
        walk(rule.cssRules, (css) => wrap(`@supports ${rule.conditionText} { ${css} }`))
      } else if (typeof CSSLayerBlockRule !== "undefined" && rule instanceof CSSLayerBlockRule) {
        // Tailwind v4 y parte del CSS viven en @layer: sin esto sus estados no se clonan.
        walk(rule.cssRules, (css) => wrap(`@layer ${rule.name} { ${css} }`))
      } else if (typeof CSSContainerRule !== "undefined" && rule instanceof CSSContainerRule) {
        walk(rule.cssRules, (css) => wrap(`@container ${rule.conditionText} { ${css} }`))
      }
    }
  }

  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList
    try { rules = sheet.cssRules } catch { continue }
    walk(rules, (css) => css)
  }

  const style = document.createElement("style")
  style.dataset.dsPseudoStates = ""
  style.textContent = out.join("\n")
  document.head.appendChild(style)
}
