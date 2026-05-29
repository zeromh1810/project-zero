import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { isAdminAuthenticated } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

const FILE = path.join(process.cwd(), "data", "logo.json")

function read() {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf-8"))
  } catch {
    return { svgUrl: "" }
  }
}

function write(data: unknown) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), "utf-8")
}

export async function GET() {
  return NextResponse.json(read())
}

export async function PUT(request: Request) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const body = await request.json()
    const current = read()
    const updated = { ...current, ...body }
    write(updated)
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 })
  }
}
