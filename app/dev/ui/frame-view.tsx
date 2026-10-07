"use client"

import { useEffect, useRef } from "react"

// Vista "frame" del QA: muestra cualquier ruta del sitio dentro de un iframe
// del ancho EXACTO pedido. Chrome headless de escritorio tiene un ancho mínimo
// de ventana de 500px — una captura "de 390px" era un layout de 500 recortado.
// Además oculta el indicador de desarrollo de Next dentro del iframe, para que
// no aparezca en las imágenes del Design System.
export default function FrameView({ src, width, height }: { src: string; width: number; height: number }) {
  const ref = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const frame = ref.current
    if (!frame) return
    const clean = () => {
      // el del iframe y el de esta misma página
      for (const doc of [frame.contentDocument, document]) {
        doc?.querySelectorAll("nextjs-portal").forEach((n) => n.remove())
      }
    }
    const id = window.setInterval(clean, 300)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="dev-frame-wrap">
      <iframe ref={ref} src={src} title="Vista" width={width} height={height} className="dev-frame" />
    </div>
  )
}
