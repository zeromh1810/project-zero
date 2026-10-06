export interface BlogPost {
  id: string
  slug: string
  title: string
  content: string
  image: string
  category: string
  tags: string[]
  publishedAt: string
  draft: boolean
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CL", {
    month: "short",
    year: "numeric",
  })
}

// El contenido viene como HTML del editor (Tiptap) — se reduce a texto plano
// antes de recortar, para que el resumen no muestre etiquetas ni URLs de imágenes.
export function plainText(content: string): string {
  return content
    .replace(/<(br|hr|img)[^>]*>|<\/(p|h[1-6]|li|blockquote)>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()
}

export function excerpt(content: string, n = 100): string {
  const clean = plainText(content)
  return clean.length <= n ? clean : clean.slice(0, n).trimEnd() + "…"
}
