"use client"

import { useRouter } from "next/navigation"
import { useTheme } from "@/lib/context/theme-context"
import { ProjectDetailView } from "@/components/portfolio/project-detail-view"
import { NAV_SESSION_KEY } from "@/components/portfolio/app-navbar"
import type { Project } from "@/lib/data/projects"

interface Props {
  project: Project | null
}

export function ProjectDetailClient({ project }: Props) {
  const router = useRouter()
  const { isDark, toggleTheme } = useTheme()

  if (!project) {
    return (
      <div className="project-not-found">
        <h1>Proyecto no encontrado</h1>
        <button onClick={() => router.push("/")}>Volver al inicio</button>
      </div>
    )
  }

  return (
    <ProjectDetailView
      project={project}
      isDark={isDark}
      onToggleTheme={toggleTheme}
      onBack={(scrollTarget) => {
        if (scrollTarget) {
          sessionStorage.setItem(NAV_SESSION_KEY, JSON.stringify({ section: "trabajos", scroll: scrollTarget }))
          // Next's own scroll-to-top-on-navigation would otherwise fight
          // the instant scrollIntoView done in portfolio.tsx's layout
          // effect — disable it so only our targeted scroll applies.
          router.push("/", { scroll: false })
        } else {
          router.push("/")
        }
      }}
    />
  )
}
