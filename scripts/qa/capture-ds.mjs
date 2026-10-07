// Capturas PNG del sitio real para la documentación del Design System
// (public/ds/captures/<id>-{light,dark}.png). Las usa <Capture id="…"> en
// las páginas de patrones y navegación.
//
//   node scripts/qa/capture-ds.mjs            (todas)
//   node scripts/qa/capture-ds.mjs hero blog   (solo esos ids)
//
// Requiere el dev server en http://localhost:3000. Usa Chrome por CDP (sin
// dependencias): así el viewport puede medir 390px reales (la ventana de
// Chrome headless no baja de 500px) y se puede hacer scroll antes de capturar.
// No escribe nada en la app: solo navega (y abre un panel en el admin de
// /dev/ui, que no tiene sesión — las escrituras responderían 401).

import { spawn } from "node:child_process"
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import blog from "../../data/blog.json" with { type: "json" }

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..")
const OUT = join(ROOT, "public", "ds", "captures")
const BASE = process.env.BASE_URL ?? "http://localhost:3000"
const CHROME = process.env.CHROME ?? "C:/Program Files/Google/Chrome/Application/chrome.exe"
const PORT = 9333
const posts = Array.isArray(blog) ? blog : blog.posts ?? []

const scrollTo = (sel, offset = 72) => `(() => { const el = document.querySelector(${JSON.stringify(sel)}); if (el) window.scrollTo(0, el.getBoundingClientRect().top + scrollY - ${offset}); })()`
const DESK = { w: 1440, h: 900 }
const MOB = { w: 390, h: 844, mobile: true }

/** id → qué capturar. `clip` recorta [y, alto] del viewport. */
const SHOTS = [
  { id: "hero-desktop", path: "/", ...DESK, wait: 3500 },
  { id: "hero-mobile", path: "/", ...MOB, wait: 3500 },
  { id: "nav-desktop", path: "/", ...DESK, wait: 2500, clip: [0, 120] },
  { id: "nav-mobile", path: "/", ...MOB, wait: 2500, clip: [MOB.h - 200, 200] },
  { id: "galeria-desktop", path: "/", ...DESK, wait: 2500, script: scrollTo(".projects-bento", 96) },
  { id: "galeria-tablet", path: "/", w: 768, h: 1024, mobile: true, wait: 2500, script: scrollTo(".projects-bento", 96) },
  { id: "galeria-mobile", path: "/", ...MOB, wait: 2500, script: scrollTo(".projects-bento", 132) },
  { id: "detalle-desktop", path: "/projects/1", ...DESK, wait: 3000 },
  { id: "detalle-mobile", path: "/projects/1", ...MOB, wait: 3000 },
  { id: "blog-desktop", path: "/blog", ...DESK, wait: 3000 },
  { id: "blog-mobile", path: "/blog", ...MOB, wait: 3000 },
  ...(posts[0] ? [{ id: "blog-post-desktop", path: `/blog/${posts[0].slug}`, ...DESK, wait: 3000 }] : []),
  { id: "admin-desktop", path: "/dev/ui?view=admin&tab=proyectos", ...DESK, wait: 3000 },
  { id: "admin-mobile", path: "/dev/ui?view=admin&tab=proyectos", ...MOB, wait: 3000 },
  { id: "admin-nav", path: "/dev/ui?view=admin&tab=proyectos", ...DESK, wait: 3000 },
  ...[1440, 1280, 1181, 1180, 1024, 900, 760, 641].map((w) => ({ id: `qa-nav-${w}`, path: "/", w, h: 120, wait: 2500, qa: true })),
  { id: "qa-ds-public", path: "/design-system?page=boton", ...DESK, wait: 3500, qa: true },
  { id: "qa-ds-public-mobile", path: "/design-system?page=inicio", ...MOB, wait: 3500, qa: true },
  { id: "qa-logo-tab", path: "/dev/ui?view=admin&tab=logo", w: 1440, h: 1700, wait: 3500, qa: true,
    script: `document.querySelector(".a-tab-previews")?.scrollIntoView({ block: "center" })`, after: 800 },
  { id: "qa-ds-mobile", path: "/dev/ui?view=ds&page=boton", ...MOB, wait: 3000, qa: true },
  { id: "admin-sheet", path: "/dev/ui?view=admin&tab=proyectos", ...DESK, wait: 3000,
    script: `document.querySelector('button[aria-label^="Editar"]')?.click()`, after: 1500 },
]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

class Cdp {
  constructor(ws) { this.ws = ws; this.id = 0; this.pending = new Map()
    ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && this.pending.has(d.id)) { const { res, rej } = this.pending.get(d.id); this.pending.delete(d.id); d.error ? rej(new Error(d.error.message)) : res(d.result) } } }
  send(method, params = {}) { const id = ++this.id; this.ws.send(JSON.stringify({ id, method, params })); return new Promise((res, rej) => this.pending.set(id, { res, rej })) }
}

async function main() {
  const only = process.argv.slice(2)
  // Las tomas "qa" (revisión de la propia documentación) solo corren si se piden.
  const shots = only.length ? SHOTS.filter((s) => only.some((o) => s.id.startsWith(o))) : SHOTS.filter((s) => !s.qa)
  mkdirSync(OUT, { recursive: true })
  const profile = mkdtempSync(join(tmpdir(), "ds-capture-"))
  const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
    "--hide-scrollbars", "--enable-unsafe-swiftshader", "--use-angle=swiftshader", "about:blank"], { stdio: "ignore" })
  try {
    let target
    for (let i = 0; i < 50 && !target; i++) {
      try { target = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === "page") } catch { await sleep(200) }
    }
    if (!target) throw new Error("Chrome no respondió por CDP")
    const ws = new WebSocket(target.webSocketDebuggerUrl)
    await new Promise((r, j) => { ws.onopen = r; ws.onerror = j })
    const cdp = new Cdp(ws)
    await cdp.send("Page.enable"); await cdp.send("Runtime.enable")

    for (const theme of ["light", "dark"]) {
      // Tema antes de que cargue cualquier script del sitio; sin el indicador de dev de Next.
      const { identifier } = await cdp.send("Page.addScriptToEvaluateOnNewDocument", { source:
        `try{localStorage.setItem("portfolio-theme","${theme}")}catch(e){}
         document.addEventListener("DOMContentLoaded",()=>{const s=document.createElement("style");s.textContent="nextjs-portal{display:none!important}";document.head.appendChild(s)})` })
      await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: theme }] })
      for (const s of shots) {
        await cdp.send("Emulation.setDeviceMetricsOverride", { width: s.w, height: s.h, deviceScaleFactor: 1, mobile: !!s.mobile })
        await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: !!s.mobile })
        await cdp.send("Page.navigate", { url: BASE + s.path })
        await sleep(s.wait ?? 2500)
        if (s.script) { await cdp.send("Runtime.evaluate", { expression: s.script }); await sleep(s.after ?? 1200) }
        const clip = s.clip ? { x: 0, y: s.clip[0], width: s.w, height: s.clip[1], scale: 1 } : undefined
        const { data } = await cdp.send("Page.captureScreenshot", { format: "png", ...(clip ? { clip } : {}) })
        const file = join(s.qa ? tmpdir() : OUT, `${s.id}-${theme}.png`)
        writeFileSync(file, Buffer.from(data, "base64"))
        console.log(`✓ ${s.id}-${theme}.png`)
      }
      await cdp.send("Page.removeScriptToEvaluateOnNewDocument", { identifier })
    }
    ws.close()
  } finally {
    chrome.kill()
    await sleep(500)
    try { rmSync(profile, { recursive: true, force: true }) } catch { /* Chrome puede tardar en soltar el perfil */ }
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
