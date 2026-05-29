import { ThemeProvider } from "@/lib/context/theme-context"
import { Portfolio } from "@/components/portfolio/portfolio"
import "@/styles/portfolio.css"
import "@/assets/design-tokens.css"

export default function Home() {
  return (
    <ThemeProvider>
      <Portfolio />
    </ThemeProvider>
  )
}
