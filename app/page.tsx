import { ThemeProvider } from "@/lib/context/theme-context"
import { Portfolio } from "@/components/portfolio/portfolio"
import "@/assets/design-tokens.css"
import "@/styles/portfolio.css"

export default function Home() {
  return (
    <ThemeProvider>
      <Portfolio />
    </ThemeProvider>
  )
}
