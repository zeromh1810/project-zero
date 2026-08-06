import { Fragment } from "react"

// Allowlist parser — reconoce solo <strong> y <em> y trata todo lo demás como
// texto literal (React escapa los Fragments automáticamente). Nunca usa
// dangerouslySetInnerHTML: el contenido admin-editado no puede inyectar
// markup arbitrario, solo estas dos etiquetas conocidas.
const SPLIT_PATTERN = /(<strong>.*?<\/strong>|<em>.*?<\/em>)/g
const STRONG_MATCH  = /^<strong>(.*?)<\/strong>$/
const EM_MATCH      = /^<em>(.*?)<\/em>$/

export function RichText({ text }: { text: string }) {
  const parts = text.split(SPLIT_PATTERN)
  return (
    <>
      {parts.map((part, i) => {
        const strong = part.match(STRONG_MATCH)
        if (strong) return <strong key={i}>{strong[1]}</strong>
        const em = part.match(EM_MATCH)
        if (em) return <em key={i}>{em[1]}</em>
        return <Fragment key={i}>{part}</Fragment>
      })}
    </>
  )
}
