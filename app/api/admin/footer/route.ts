import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { commitToGitHub } from "@/lib/github-data"

export const dynamic = "force-dynamic"

const FILE      = path.join(process.cwd(), "data", "footer.json")
const DATA_PATH = "data/footer.json"
const EMPTY = {
  brand:   "Project Zero",
  tagline: "Product Designer & Frontend Developer · Santiago",
  copy:    "© 2026 Carlos Felipe Rojas Hickmann",
}

function read() {
  try { return JSON.parse(fs.readFileSync(FILE, "utf-8")) }
  catch { return { ...EMPTY } }
}

export async function GET() {
  return NextResponse.json(read())
}

export async function PUT(request: Request) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const body    = await request.json()
    const updated = { ...EMPTY, ...read(), ...body }
    fs.writeFileSync(FILE, JSON.stringify(updated, null, 2), "utf-8")

    let githubWarning = false
    try {
      await commitToGitHub(DATA_PATH, updated, "chore(data): update footer via admin panel [skip ci]")
    } catch (err) {
      console.warn("[footer] GitHub commit failed:", err)
      githubWarning = true
    }

    return NextResponse.json({ ...updated, _githubWarning: githubWarning })
  } catch {
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 })
  }
}
