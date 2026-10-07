/* QA de UI para el sitio público — pegar en la consola o inyectar vía Chrome MCP.
   Define:
   - window.__uiAudit(): audita lo visible en el viewport actual.
       contrast → textos bajo 4.5:1 (3:1 si son grandes). Considera color con
                  alpha + opacidad acumulada de ancestros. Omite: texto sobre
                  imagen (.p-card), elementos aún sin revelar (.anim-up sin .in
                  u opacidad < 0.3) y el hero mientras el scroll lo desvanece.
       tiny     → textos por debajo de 12px ("clase:px").
   - window.__tour(step): recorre la página entera haciendo scroll y junta los
     resultados de cada parada (el hero se desvanece al bajar, así que auditar
     una sola vez al final se salta el CTA).
   - window.__focusMissing(): controles interactivos visibles sin regla
     :focus-visible propia (caen al outline heredado de Tailwind). */
(() => {
  // Con la ventana de Chrome oculta, el navegador no dispara requestAnimationFrame
  // y todo lo que el sitio actualiza con rAF (scroll del hero, píldora del nav)
  // queda congelado — el QA mediría estados viejos. Solo para pruebas.
  if (document.visibilityState === "hidden" && !window.__rafShim) {
    window.__rafShim = true
    window.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 16)
    window.cancelAnimationFrame = (id) => clearTimeout(id)
  }

  // Espera que no sufre el throttling intensivo de pestañas ocultas (con la
  // pestaña oculta varios minutos, Chrome dispara los setTimeout encadenados
  // ~1 vez por minuto; MessageChannel no está sujeto a eso).
  window.__sleep = (ms) => new Promise((res) => {
    const end = performance.now() + ms
    const ch = new MessageChannel()
    ch.port1.onmessage = () => (performance.now() >= end ? res() : ch.port2.postMessage(0))
    ch.port2.postMessage(0)
  })

  window.__setTheme = async (mode) => {
    const btn = document.querySelector(`.theme-toggle-btn[aria-label="${mode === "dark" ? "Modo oscuro" : "Modo claro"}"]`)
    if (btn && !btn.classList.contains("active")) btn.click()
    await window.__sleep(700)
    return document.documentElement.classList.contains("dark") ? "dark" : "light"
  }

  const parse =(c) => (c.match(/[\d.]+/g) || [0, 0, 0, 0]).map(Number)
  const lum = ([r, g, b]) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
  }
  const bgOf = (el) => {
    for (let e = el; e; e = e.parentElement) {
      const s = getComputedStyle(e)
      // Fondos con gradiente (brands, blog-preview): se usa su primer color.
      // Se ignoran gradientes de línea fina (subrayados animados: background-size ≤ 2px de alto).
      const thinLine = /(^|\s)(0|1|2)px(\s|,|$)/.test(s.backgroundSize.split(",")[0].trim().split(" ")[1] || "")
      const g = !thinLine && s.backgroundImage.match(/gradient\([^)]*?(rgba?\([^)]+\))/)
      if (g) { const p = parse(g[1]); if (p.length < 4 || p[3] > 0.5) return p.slice(0, 3) }
      const p = parse(s.backgroundColor)
      if (p.length < 4 || p[3] > 0.5) return p.slice(0, 3)
    }
    return document.documentElement.classList.contains("dark") ? [10, 11, 18] : [248, 248, 248]
  }
  const ratioOf = (fg, bg) => {
    const L1 = lum(fg), L2 = lum(bg)
    return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)
  }
  const blend = (fg, bg, a) => fg.slice(0, 3).map((v, i) => v * a + bg[i] * (1 - a))

  // Con la ventana oculta Chrome tampoco avanza animaciones ni transiciones
  // CSS (quedan congeladas en su primer frame: .page--enter en opacity 0, un
  // color de botón a medio camino). Se adelantan al estado final todas las
  // finitas antes de medir — es lo que vería un usuario real. Las infinitas
  // (loops decorativos) no se tocan.
  const settle = () => {
    // Tampoco corre IntersectionObserver con la ventana oculta: se simula el
    // reveal final (.in/.visible) que el sitio aplica al entrar al viewport.
    if (document.visibilityState === "hidden")
      document.querySelectorAll(".anim-up, .p-card, .p-stat--animated, .brands-section")
        .forEach((e) => e.classList.add(...(e.classList.contains("brands-section") ? ["brands-section--visible"] : ["in", "visible"])))
    for (const a of document.getAnimations()) {
      try { if (a.effect?.getComputedTiming().iterations !== Infinity) a.finish() } catch {}
    }
  }
  window.__settle = settle

  // IntersectionObserver simulado (la ventana oculta no dispara el real).
  // Tras instalarlo, los observers que el sitio cree desde ese momento se
  // registran acá; __ioTick() les entrega, en un solo lote como haría el
  // navegador, los targets que están dentro del viewport.
  window.__installFakeIO = () => {
    const observers = (window.__fakeObservers = [])
    window.IntersectionObserver = class {
      constructor(cb) { this.cb = cb; this.targets = new Set(); observers.push(this) }
      observe(t) { this.targets.add(t) }
      unobserve(t) { this.targets.delete(t) }
      disconnect() { this.targets.clear() }
      takeRecords() { return [] }
    }
    return "fake IO instalado"
  }
  window.__ioTick = () => {
    let n = 0
    for (const o of window.__fakeObservers || []) {
      const entries = [...o.targets].map((t) => {
        const r = t.getBoundingClientRect()
        return { target: t, isIntersecting: r.bottom > -50 && r.top < innerHeight + 50 && r.width > 0, boundingClientRect: r }
      })
      const hits = entries.filter((e) => e.isIntersecting)
      if (hits.length) { n += hits.length; o.cb(entries, o) }
    }
    return n
  }

  // Reglas :hover del sitio público que NO quedaron dentro de @media (hover: hover).
  window.__hoverUnguarded = () => {
    const out = []
    for (const ss of document.styleSheets) {
      let rules
      try { rules = ss.cssRules } catch { continue }
      const walk = (list, media) => {
        for (const r of list) {
          if (r.cssRules) walk(r.cssRules, r.media ? [...media, r.media.mediaText] : media)
          const sel = r.selectorText
          if (!sel || !sel.includes(":hover") || sel.includes("ds-") || sel.includes("excalidraw") || sel.includes("sc-")) continue
          if (!sel.split(",").every((p) => p.includes(":hover"))) continue
          if (!media.some((m) => m.includes("hover: hover"))) out.push(sel)
        }
      }
      walk(rules, [])
    }
    return out
  }

  window.__uiAudit = () => {
    settle()
    const contrast = [], tiny = [], seen = new Set()
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    const els = new Set()
    let n
    while ((n = walker.nextNode())) if (n.textContent.trim() && n.parentElement) els.add(n.parentElement)
    for (const el of els) {
      const r = el.getBoundingClientRect()
      if (!r.width || r.bottom < 0 || r.top > innerHeight) continue
      if (el.closest("nextjs-portal, script, style, noscript")) continue
      const c = getComputedStyle(el)
      const fs = parseFloat(c.fontSize)
      const key = `${el.className}|${fs}|${c.color}`
      if (seen.has(key)) continue
      seen.add(key)
      if (fs < 12) tiny.push(`${String(el.className).split(" ")[0] || el.tagName.toLowerCase()}:${fs}`)
      // Texto sobre imagen (.p-card) o decorativo/oculto para lectores de pantalla.
      if (el.closest(".p-card, [aria-hidden=\"true\"]")) continue
      // Texto con gradiente (background-clip:text): su color real es la imagen, no c.color.
      if (c.webkitTextFillColor === "rgba(0, 0, 0, 0)" || c.webkitTextFillColor === "transparent") continue
      const fg = parse(c.color), bg = bgOf(el), a0 = fg[3] ?? 1
      const large = fs >= 24 || (fs >= 18.66 && +c.fontWeight >= 700)
      const need = large ? 3 : 4.5
      // Solo los candidatos pagan el recorrido de ancestros (getComputedStyle es caro).
      let op = 1, pending = false
      for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
        op *= +getComputedStyle(e).opacity
        if (e.classList.contains("anim-up") && !e.classList.contains("in")) pending = true
      }
      if (pending || op < 0.3) continue
      if (op < 0.98 && el.closest(".hero-wrap")) continue
      const ratio = ratioOf(blend(fg, bg, a0 * op), bg)
      if (ratio < need)
        contrast.push({ cls: String(el.className).slice(0, 40), txt: el.textContent.trim().slice(0, 24), fs, ratio: +ratio.toFixed(2), need })
    }
    return { contrast, tiny }
  }

  window.__tour = async (step = 0.8) => {
    const cm = new Map(), tm = new Set()
    const H = document.body.scrollHeight
    for (let y = 0; y < H; y += Math.round(innerHeight * step)) {
      scrollTo(0, y)
      // Con la ventana oculta el navegador no despacha "scroll": se fuerza para
      // que los handlers del sitio (hero, projects-sheet) actualicen su estado.
      window.dispatchEvent(new Event("scroll"))
      await window.__sleep(700)
      const a = __uiAudit()
      a.contrast.forEach((c) => cm.set(c.cls + c.fs, c))
      a.tiny.forEach((t) => tm.add(t))
    }
    scrollTo(0, 0)
    return {
      contrast: [...cm.values()].map((c) => `${c.cls.split(" ")[0] || "(sin clase)"} "${c.txt}" ${c.ratio}/${c.need}`),
      tiny: [...tm],
    }
  }

  window.__focusMissing = () => {
    const sels = [], inputSels = [], withinSels = []
    for (const ss of document.styleSheets) {
      let rules
      try { rules = ss.cssRules } catch { continue }
      const walk = (list) => {
        for (const r of list) {
          if (r.cssRules) walk(r.cssRules)
          if (r.selectorText?.includes(":focus-visible"))
            sels.push(...r.selectorText.split(",").map((s) => s.replace(/:focus-visible.*/, "").trim()).filter(Boolean))
          // Anillo en el contenedor (.admin-chips-wrap:focus-within, editor rico).
          if (r.selectorText?.includes(":focus-within"))
            withinSels.push(...r.selectorText.split(",").map((s) => s.replace(/:focus-within.*/, "").trim()).filter(Boolean))
          // Inputs/textarea usan su propio anillo por box-shadow en :focus.
          else if (r.selectorText?.includes(":focus"))
            inputSels.push(...r.selectorText.split(",").map((s) => s.replace(/:focus.*/, "").trim()).filter(Boolean))
        }
      }
      walk(rules)
    }
    const global = sels.some((s) => s === "" || s === "*" || s === ":where(a, button, input, textarea, select, summary, [tabindex])")
    return [...document.querySelectorAll("a[href],button,[tabindex]:not([tabindex='-1']),input,textarea,select")]
      .filter((e) => e.getClientRects().length && !e.closest("nextjs-portal") && !String(e.className).startsWith("sc-"))
      // focus guards de Radix: spans invisibles que atrapan el foco del modal
      .filter((e) => !e.hasAttribute("data-radix-focus-guard"))
      .filter((e) => !global && !sels.some((s) => { try { return e.matches(s) } catch { return false } }))
      .filter((e) => !(/^(INPUT|TEXTAREA|SELECT)$/.test(e.tagName) && inputSels.some((s) => { try { return e.matches(s) } catch { return false } })))
      .filter((e) => !withinSels.some((s) => { try { return !!e.parentElement?.closest(s) } catch { return false } }))
      .map((e) => `${e.tagName.toLowerCase()}.${String(e.className).split(" ")[0]}`)
      .filter((v, i, a) => a.indexOf(v) === i)
  }
  return "ui-audit listo"
})()
