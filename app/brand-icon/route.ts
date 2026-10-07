import { createHash } from "crypto"
import path from "path"
import { readJsonFile } from "@/lib/admin-json"

export const dynamic = "force-dynamic"

const FILE = path.join(process.cwd(), "data", "logo.json")

interface LogoData { lightUrl?: string; darkUrl?: string; faviconUrl?: string }

function decodeDataUrl(url: string): { type: string; body: Buffer } | null {
  const m = url.match(/^data:([^;,]+)(;base64)?,([\s\S]*)$/)
  if (!m) return null
  return { type: m[1], body: m[2] ? Buffer.from(m[3], "base64") : Buffer.from(decodeURIComponent(m[3])) }
}

// Sin favicon subido: el isotipo (hexágono) recortado del logo SVG. El logo
// mide 252×52 con el isotipo en x 0–44.6; un viewBox cuadrado centrado en él
// deja fuera el texto. Nunca los íconos genéricos de public/ (vienen de v0).
function isotypeFromLogo(svg: string): string | null {
  if (!/<svg[\s>]/.test(svg)) return null
  return svg.replace(/<svg([^>]*)>/, (_, attrs: string) => {
    const clean = attrs.replace(/\s(width|height|viewBox)="[^"]*"/g, "")
    return `<svg${clean} width="64" height="64" viewBox="-3.4 0 51.4 51.4">`
  })
}

// Favicon del sitio (Admin → Logo → Favicon). Se lee en cada request para que
// un cambio desde el admin se vea sin redeploy; el ETag evita re-descargas.
export async function GET(request: Request) {
  const logo = readJsonFile<LogoData>(FILE, {})
  let icon = logo.faviconUrl ? decodeDataUrl(logo.faviconUrl) : null

  if (!icon && logo.lightUrl) {
    const src = decodeDataUrl(logo.lightUrl)
    const svg = src?.type === "image/svg+xml" ? isotypeFromLogo(src.body.toString("utf8")) : null
    if (svg) icon = { type: "image/svg+xml", body: Buffer.from(svg) }
  }
  if (!icon) return new Response(null, { status: 404 })

  const etag = `"${createHash("sha1").update(icon.body).digest("base64url")}"`
  const headers = { "Content-Type": icon.type, ETag: etag, "Cache-Control": "public, max-age=0, must-revalidate" }
  if (request.headers.get("if-none-match") === etag) return new Response(null, { status: 304, headers })
  return new Response(new Uint8Array(icon.body), { headers })
}
