import fs from "fs"
import path from "path"
import { ThemeProvider } from "@/lib/context/theme-context"

export const dynamic = "force-dynamic"
import { Portfolio } from "@/components/portfolio/portfolio"
import type { SocialData } from "@/lib/hooks/use-social"
import type { FooterData } from "@/lib/hooks/use-footer"
import "@/assets/design-tokens.css"
import "@/styles/portfolio.css"

function readSocial(): SocialData {
  try {
    return JSON.parse(fs.readFileSync(
      path.join(process.cwd(), "data", "social.json"), "utf-8"
    ))
  } catch {
    return { linkedin: "", instagram: "", github: "", email: "" }
  }
}

function readFooter(): FooterData {
  try {
    return JSON.parse(fs.readFileSync(
      path.join(process.cwd(), "data", "footer.json"), "utf-8"
    ))
  } catch {
    return {
      brand:   "Project Zero",
      tagline: "Product Designer & Frontend Developer · Santiago",
      copy:    "© 2026 Carlos Felipe Rojas Hickmann",
    }
  }
}

export default function Home() {
  const initialSocial  = readSocial()
  const initialFooter  = readFooter()
  return (
    <ThemeProvider>
      <Portfolio initialSocial={initialSocial} initialFooter={initialFooter} />
    </ThemeProvider>
  )
}
