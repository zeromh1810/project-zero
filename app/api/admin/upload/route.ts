import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { commitBinaryToGitHub } from "@/lib/github-data"

export const dynamic = "force-dynamic"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "image/svg+xml"]
const MAX_SIZE = 8 * 1024 * 1024 // 8 MB

export async function POST(request: Request) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 })
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Tipo de archivo no permitido. Usa JPG, PNG o WebP." }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "El archivo supera el límite de 8 MB" }, { status: 400 })
    }

    // Ensure uploads directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads")
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // Generate unique filename
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase()
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const filePath = path.join(uploadDir, filename)

    // Write file
    const buffer = Buffer.from(await file.arrayBuffer())
    fs.writeFileSync(filePath, buffer)

    // Persist to GitHub so the file survives Railway deploys.
    // On success use the raw GitHub URL — it works regardless of server filesystem state.
    let url = `/uploads/${filename}`
    try {
      await commitBinaryToGitHub(
        `public/uploads/${filename}`,
        buffer,
        `chore(assets): upload ${filename} via admin [skip ci]`
      )
      const repo   = process.env.GITHUB_REPO
      const branch = process.env.GITHUB_BRANCH ?? "main"
      if (repo) {
        url = `https://raw.githubusercontent.com/${repo}/${branch}/public/uploads/${filename}`
      } else {
        console.warn("[upload] GITHUB_REPO env var not set — falling back to local URL (won't survive Railway restart)")
      }
    } catch (err) {
      console.warn("[upload] GitHub commit failed, using local URL:", err)
    }

    return NextResponse.json({ url })
  } catch (err) {
    console.error("Upload error:", err)
    return NextResponse.json({ error: "Error al subir el archivo" }, { status: 500 })
  }
}
