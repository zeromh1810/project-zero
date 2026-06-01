import fs from "fs"
import path from "path"
import { ThemeProvider } from "@/lib/context/theme-context"

export const dynamic = "force-dynamic"
import { Portfolio } from "@/components/portfolio/portfolio"
import type { SocialData } from "@/lib/hooks/use-social"
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

export default function Home() {
  const initialSocial = readSocial()
  return (
    <ThemeProvider>
      <Portfolio initialSocial={initialSocial} />
    </ThemeProvider>
  )
}
