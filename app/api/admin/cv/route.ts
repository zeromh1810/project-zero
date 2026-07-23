import { NextResponse } from "next/server"
import path from "path"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { readJsonFile, writeJsonAndCommit } from "@/lib/admin-json"

export const dynamic = "force-dynamic"

const FILE      = path.join(process.cwd(), "data", "cv.json")
const DATA_PATH = "data/cv.json"

export async function GET() {
  const data = readJsonFile(FILE, null)
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(request: Request) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const body = await request.json()
    await writeJsonAndCommit(FILE, DATA_PATH, body, "chore(data): update cv via admin panel [skip ci]", "cv")
    return NextResponse.json(body)
  } catch {
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 })
  }
}
