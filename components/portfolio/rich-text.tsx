import DOMPurify from "isomorphic-dompurify"
import type { HTMLAttributes } from "react"

// Único punto de entrada para contenido editado en el admin (Tiptap) hacia
// el sitio público. Las listas de etiquetas espejan exactamente las
// extensiones activas en app/admin/_components/rich-text-area.tsx para cada
// variant — si se habilita una extensión nueva ahí, hay que agregarla acá
// también o el HTML que produzca se va a limpiar silenciosamente.
const SIMPLE_TAGS = ["p", "strong", "em", "ul", "ol", "li", "br"]
const FULL_TAGS = [...SIMPLE_TAGS, "h3", "h4", "u", "s", "blockquote", "hr", "a", "img"]
const FULL_ATTR = ["href", "target", "rel", "src", "alt"]

interface Props extends HTMLAttributes<HTMLDivElement> {
  text: string
  variant?: "simple" | "full"
}

export function RichText({ text, variant = "simple", ...rest }: Props) {
  const clean = variant === "full"
    ? DOMPurify.sanitize(text, { ALLOWED_TAGS: FULL_TAGS, ALLOWED_ATTR: FULL_ATTR })
    : DOMPurify.sanitize(text, { ALLOWED_TAGS: SIMPLE_TAGS, ALLOWED_ATTR: [] })
  return <div {...rest} dangerouslySetInnerHTML={{ __html: clean }} />
}
