import DOMPurify from "isomorphic-dompurify"
import type { HTMLAttributes } from "react"

// Único punto de entrada para contenido editado en el admin (Tiptap) hacia
// el sitio público. La lista de etiquetas permitidas espeja exactamente las
// extensiones activas en app/admin/_components/rich-text-area.tsx — si se
// habilita una extensión nueva ahí (heading, link...), hay que agregarla acá
// también o el HTML que produzca se va a limpiar silenciosamente.
const ALLOWED_TAGS = ["p", "strong", "em", "ul", "ol", "li", "br"]

interface Props extends HTMLAttributes<HTMLDivElement> {
  text: string
}

export function RichText({ text, ...rest }: Props) {
  const clean = DOMPurify.sanitize(text, { ALLOWED_TAGS, ALLOWED_ATTR: [] })
  return <div {...rest} dangerouslySetInnerHTML={{ __html: clean }} />
}
