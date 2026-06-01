import type { Metadata } from "next"
import { ThemeProvider } from "@/lib/context/theme-context"
import "@/assets/design-tokens.css"
import "@/styles/portfolio.css"

export const metadata: Metadata = {
  title: "Blog — Project Zero",
  description: "Perspectivas sobre diseño de producto, UX y desarrollo frontend.",
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>
}
