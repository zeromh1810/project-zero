import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { commitToGitHub } from "@/lib/github-data"

export const dynamic = "force-dynamic"

const FILE      = path.join(process.cwd(), "data", "about.json")
const DATA_PATH = "data/about.json"

function read() {
  try { return JSON.parse(fs.readFileSync(FILE, "utf-8")) }
  catch { return null }
}

export async function GET() {
  const data = read()
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(request: Request) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const body = await request.json()
    fs.writeFileSync(FILE, JSON.stringify(body, null, 2), "utf-8")

    try {
      await commitToGitHub(DATA_PATH, body, "chore(data): update about via admin panel [skip ci]")
    } catch (err) {
      console.warn("[about] GitHub commit failed:", err)
    }

    return NextResponse.json(body)
  } catch {
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 })
  }
}
