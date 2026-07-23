import { NextResponse } from "next/server"
import path from "path"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { readJsonFile, writeJsonAndCommit } from "@/lib/admin-json"

export const dynamic = "force-dynamic"

const FILE      = path.join(process.cwd(), "data", "social.json")
const DATA_PATH = "data/social.json"
const EMPTY     = { linkedin: "", instagram: "", github: "", email: "" }

export async function GET() {
  return NextResponse.json(readJsonFile(FILE, { ...EMPTY }))
}

export async function PUT(request: Request) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const body    = await request.json()
    const updated = { ...EMPTY, ...readJsonFile(FILE, { ...EMPTY }), ...body }
    const ok = await writeJsonAndCommit(FILE, DATA_PATH, updated, "chore(data): update social via admin panel [skip ci]", "social")
    return NextResponse.json({ ...updated, _githubWarning: !ok })
  } catch {
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 })
  }
}
