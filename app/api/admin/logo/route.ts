import { NextResponse } from "next/server"
import path from "path"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { readJsonFile, writeJsonAndCommit } from "@/lib/admin-json"

export const dynamic = "force-dynamic"

const FILE      = path.join(process.cwd(), "data", "logo.json")
const DATA_PATH = "data/logo.json"
const EMPTY_LOGO = { lightUrl: "", darkUrl: "", fallbackText: "Project Zero" }

export async function GET() {
  return NextResponse.json(readJsonFile(FILE, { ...EMPTY_LOGO }))
}

export async function PUT(request: Request) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const body    = await request.json()
    const updated = { ...readJsonFile(FILE, { ...EMPTY_LOGO }), ...body }
    const ok = await writeJsonAndCommit(FILE, DATA_PATH, updated, "chore(data): update logo via admin panel [skip ci]", "logo")
    return NextResponse.json({ ...updated, _githubWarning: !ok })
  } catch {
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 })
  }
}
