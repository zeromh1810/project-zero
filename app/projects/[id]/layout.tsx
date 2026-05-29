import { ThemeProvider } from "@/lib/context/theme-context"

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ThemeProvider>{children}</ThemeProvider>
}
