import { NextResponse } from "next/server"
import path from "path"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { readJsonFile, writeJsonAndCommit } from "@/lib/admin-json"

export const dynamic = "force-dynamic"

const FILE      = path.join(process.cwd(), "data", "profile.json")
const DATA_PATH = "data/profile.json"
const EMPTY     = { name: "", role: "", photoUrl: "", github: "", linkedin: "", instagram: "" }

export async function GET() {
  return NextResponse.json({ ...EMPTY, ...readJsonFile(FILE, { ...EMPTY }) })
}

export async function PUT(request: Request) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const body = await request.json()
    // Only write the known schema keys — never spread arbitrary body keys to disk
    const updated = {
      name:      String(body.name      ?? ""),
      role:      String(body.role      ?? ""),
      photoUrl:  String(body.photoUrl  ?? ""),
      github:    String(body.github    ?? ""),
      linkedin:  String(body.linkedin  ?? ""),
      instagram: String(body.instagram ?? ""),
    }
    const synced = await writeJsonAndCommit(FILE, DATA_PATH, updated, "chore(data): update profile via admin panel [skip ci]", "profile")
    return NextResponse.json({ ...updated, _githubWarning: !synced })
  } catch {
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 })
  }
}
