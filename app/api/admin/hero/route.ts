import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { isAdminAuthenticated } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

const FILE = path.join(process.cwd(), "data", "hero.json")

export async function GET() {
  try {
    return NextResponse.json(JSON.parse(fs.readFileSync(FILE, "utf-8")))
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
}

export async function PUT(request: Request) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const body = await request.json()
    fs.writeFileSync(FILE, JSON.stringify(body, null, 2), "utf-8")
    return NextResponse.json(body)
  } catch {
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 })
  }
}
