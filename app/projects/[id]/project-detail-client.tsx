"use client"

import { useRouter } from "next/navigation"
import { useTheme } from "@/lib/context/theme-context"
import { ProjectDetailView } from "@/components/portfolio/project-detail-view"
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
      onBack={() => router.push("/")}
    />
  )
}
