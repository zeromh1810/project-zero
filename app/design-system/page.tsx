"use client"

import dynamic from "next/dynamic"
import { AppNavbar } from "@/components/portfolio/app-navbar"

// Solo en el cliente (igual que en el admin): la página abierta sale de
// ?page= y el tema de localStorage — renderizarla en el servidor producía
// un error de hidratación.
const DsShell = dynamic(() => import("@/components/design-system/ds-shell").then((m) => ({ default: m.DsShell })), { ssr: false })

// Zero design system, público (v2.1.0): el mismo viewer que usa el admin, con
// la barra de navegación del sitio. Mostrar cómo está construido el sitio es
// parte del portafolio.
export default function DesignSystemPage() {
  return (
    <>
      <AppNavbar mode="blog" />
      <main className="ds-public">
        <DsShell />
      </main>
    </>
  )
}
