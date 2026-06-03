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

export function excerpt(content: string, n = 100): string {
  const clean = content.replace(/\n+/g, " ").trim()
  return clean.length <= n ? clean : clean.slice(0, n).trimEnd() + "…"
}
