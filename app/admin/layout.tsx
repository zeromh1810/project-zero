import type { Metadata } from "next"
import { ThemeProvider } from "@/lib/context/theme-context"
import "@/styles/portfolio.css"
import "@/assets/design-tokens.css"
import "./admin.css"

export const metadata: Metadata = {
  title: "Admin — A·Studio",
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>
}
