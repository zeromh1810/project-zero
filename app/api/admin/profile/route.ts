import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { commitToGitHub } from "@/lib/github-data"

export const dynamic = "force-dynamic"

const FILE      = path.join(process.cwd(), "data", "profile.json")
const DATA_PATH = "data/profile.json"
const EMPTY     = { name: "", role: "", photoUrl: "", github: "", linkedin: "", instagram: "" }

function read() {
  try { return JSON.parse(fs.readFileSync(FILE, "utf-8")) }
  catch { return { ...EMPTY } }
}

export async function GET() {
  return NextResponse.json({ ...EMPTY, ...read() })
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
    fs.writeFileSync(FILE, JSON.stringify(updated, null, 2), "utf-8")

    try {
      await commitToGitHub(DATA_PATH, updated, "chore(data): update profile via admin panel [skip ci]")
    } catch (err) {
      console.warn("[profile] GitHub commit failed:", err)
    }

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 })
  }
}
