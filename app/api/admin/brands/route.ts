import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { commitToGitHub } from "@/lib/github-data"

export const dynamic = "force-dynamic"

const FILE      = path.join(process.cwd(), "data", "brands.json")
const DATA_PATH = "data/brands.json"

interface Brand {
  id: string
  lightLogo: string
  darkLogo: string
}

function read(): { brands: Brand[] } {
  try { return JSON.parse(fs.readFileSync(FILE, "utf-8")) }
  catch { return { brands: [] } }
}

function write(data: unknown) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), "utf-8")
}

export async function GET() {
  return NextResponse.json(read())
}

export async function POST(request: Request) {
  if (!await isAdminAuthenticated())
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const body = await request.json()
    if (!body.lightLogo && !body.darkLogo)
      return NextResponse.json({ error: "Sube al menos un logo" }, { status: 400 })

    const data = read()
    const brand: Brand = {
      id: String(Date.now()),
      lightLogo: body.lightLogo || "",
      darkLogo: body.darkLogo || "",
    }
    data.brands.push(brand)
    write(data)

    try {
      await commitToGitHub(DATA_PATH, data, "chore(data): update brands via admin [skip ci]")
    } catch (err) {
      console.warn("[brands] GitHub commit failed:", err)
    }

    return NextResponse.json(brand, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  if (!await isAdminAuthenticated())
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 })

    const data = read()
    const prev = data.brands.length
    data.brands = data.brands.filter((b: Brand) => b.id !== id)
    if (data.brands.length === prev)
      return NextResponse.json({ error: "Marca no encontrada" }, { status: 404 })

    write(data)

    try {
      await commitToGitHub(DATA_PATH, data, "chore(data): update brands via admin [skip ci]")
    } catch (err) {
      console.warn("[brands] GitHub commit failed:", err)
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 })
  }
}
