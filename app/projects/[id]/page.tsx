import fs from "fs"
import path from "path"
import type { Project } from "@/lib/data/projects"
import { ProjectDetailClient } from "./project-detail-client"
import "@/styles/portfolio.css"

export const dynamic = "force-dynamic"

function readProjects(): Project[] {
  try {
    const file = path.join(process.cwd(), "data", "projects.json")
    return JSON.parse(fs.readFileSync(file, "utf-8"))
  } catch {
    return []
  }
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const projects = readProjects()
  const project =
    projects.find((p) => p.id.toString() === id || p.slug === id) ?? null

  return (
    <div className="project-page mounted">
      <ProjectDetailClient project={project} />
    </div>
  )
}
