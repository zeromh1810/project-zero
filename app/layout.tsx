import type { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans, DM_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Project Zero | Portafolio de trabajos",
  description:
    "Portfolio de diseño de producto y desarrollo frontend. Cinco años creando experiencias digitales que equilibran estética refinada con funcionalidad real.",
  keywords: [
    "Product Design", "Product Designer", "Diseño de Producto", "Diseñador de Producto",
    "UX Design", "UI Design", "UX/UI", "User Experience", "User Interface",
    "Diseño UX", "Diseño UI", "Experiencia de Usuario", "Interfaz de Usuario",
    "Design Systems", "Sistema de Diseño", "Design Tokens", "Component Library",
    "Interaction Design", "Diseño de Interacción", "Visual Design", "Diseño Visual",
    "Information Architecture", "Arquitectura de Información",
    "Usability", "Accesibilidad", "Accessibility", "Human-Centered Design",
    "Figma", "Prototyping", "Wireframing", "User Research", "Investigación de Usuarios",
    "Design Thinking", "Atomic Design", "Mobile Design", "Responsive Design",
    "SaaS Design", "App Design", "Web Design", "Dashboard Design",
    "Portfolio", "Portafolio", "Santiago", "Chile",
  ],
  authors: [{ name: "Carlos Felipe Rojas Hickmann" }],
  openGraph: {
    title: "Project Zero | Portafolio de trabajos",
    description:
      "Portfolio de diseño de producto y desarrollo frontend. Cinco años creando experiencias digitales.",
    type: "website",
    locale: "es_CL",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f8f8" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${plusJakartaSans.variable} ${dmSans.variable}`}>
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
