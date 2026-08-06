import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { writeJsonAndCommit } from "@/lib/admin-json"

export const dynamic = "force-dynamic"

const FILE      = path.join(process.cwd(), "data", "projects.json")
const DATA_PATH = "data/projects.json"

function read() {
  return JSON.parse(fs.readFileSync(FILE, "utf-8"))
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const { id } = await params
    const body = await request.json()
    const projects = read()
    const updated = projects.map((p: { id: number | string }) =>
      String(p.id) === id ? { ...p, ...body } : p
    )
    const synced = await writeJsonAndCommit(FILE, DATA_PATH, updated, "chore(data): update projects via admin panel [skip ci]", "projects")
    return NextResponse.json({ ...body, _githubWarning: !synced })
  } catch {
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const { id } = await params
    const projects = read()
    const filtered = projects.filter(
      (p: { id: number | string }) => String(p.id) !== id
    )
    const synced = await writeJsonAndCommit(FILE, DATA_PATH, filtered, "chore(data): update projects via admin panel [skip ci]", "projects")
    return NextResponse.json({ ok: true, _githubWarning: !synced })
  } catch {
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 })
  }
}
