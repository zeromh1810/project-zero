import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ThemeProvider } from "@/lib/context/theme-context"
import DevUiClient from "./dev-ui-client"
import "@/styles/portfolio.css"
import "@/assets/design-tokens.css"
import "../../admin/admin.css"
import "../../admin/admin-ui.css"

export const metadata: Metadata = {
  title: "Dev UI — Project Zero",
  robots: { index: false, follow: false },
}

// Vista previa SOLO de desarrollo: renderiza el panel del admin y el viewer
// del Design System sin login, para el QA (scripts/qa/) y las capturas del
// DS (Chrome headless no tiene la cookie de sesión). En producción no existe.
// Las escrituras siguen protegidas por la API (exigen la cookie de sesión),
// así que desde acá no se puede guardar nada.
const THEME_FROM_QUERY = `try{var t=new URLSearchParams(location.search).get("theme");if(t==="light"||t==="dark")localStorage.setItem("portfolio-theme",t)}catch(e){}`

export default async function DevUiPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; tab?: string; page?: string; specimen?: string; src?: string; w?: string; h?: string }>
}) {
  if (process.env.NODE_ENV === "production") notFound()
  const params = await searchParams
  return (
    <ThemeProvider>
      {/* ?theme=light|dark fija el tema antes de hidratar (capturas del DS:
          Chrome headless conserva el último tema guardado en su perfil). */}
      <script dangerouslySetInnerHTML={{ __html: THEME_FROM_QUERY }} />
      <DevUiClient view={params.view ?? "admin"} tab={params.tab} page={params.page} specimen={params.specimen}
        src={params.src} w={Number(params.w) || 390} h={Number(params.h) || 844} />
    </ThemeProvider>
  )
}
