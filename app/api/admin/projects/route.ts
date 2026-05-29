import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { isAdminAuthenticated } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

const FILE = path.join(process.cwd(), "data", "projects.json")

function read() {
  return JSON.parse(fs.readFileSync(FILE, "utf-8"))
}

function write(data: unknown) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), "utf-8")
}

export async function GET() {
  try {
    return NextResponse.json(read())
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const body = await request.json()
    const projects = read()
    const newProject = {
      ...body,
      id: Date.now(),
      slug: String(body.title)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    }
    projects.push(newProject)
    write(projects)
    return NextResponse.json(newProject, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error al crear proyecto" }, { status: 500 })
  }
}
