import type { Metadata } from "next"
import { ThemeProvider } from "@/lib/context/theme-context"
import "@/assets/design-tokens.css"
import "@/styles/portfolio.css"
// Las páginas de componentes del admin renderizan los componentes reales.
import "../admin/admin.css"
import "../admin/admin-ui.css"
import "@/styles/motion.css"

export const metadata: Metadata = {
  title: "Zero design system — Project Zero",
  description: "El sistema de diseño del portafolio de Carlos Felipe Rojas Hickmann: fundamentos, componentes y patrones, con reglas de uso y ejemplos en vivo.",
}

export default function DesignSystemLayout({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>
}
