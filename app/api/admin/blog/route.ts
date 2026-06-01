import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { isAdminAuthenticated } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

const FILE = path.join(process.cwd(), "data", "blog.json")

export interface BlogPost {
  id: string
  slug: string
  title: string
  content: string
  image: string
  category: string
  publishedAt: string
  draft: boolean
}

function read(): { posts: BlogPost[] } {
  try { return JSON.parse(fs.readFileSync(FILE, "utf-8")) }
  catch { return { posts: [] } }
}

function write(data: unknown) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), "utf-8")
}

function toSlug(title: string) {
  return title.toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get("slug")
  const data = read()
  if (slug) {
    const post = data.posts.find(p => p.slug === slug)
    return post
      ? NextResponse.json(post)
      : NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  if (!await isAdminAuthenticated())
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const body = await request.json()
    if (!body.title?.trim())
      return NextResponse.json({ error: "El título es obligatorio" }, { status: 400 })

    const data = read()
    const baseSlug = toSlug(body.title)
    const existing = data.posts.filter(p => p.slug.startsWith(baseSlug))
    const slug = existing.length === 0 ? baseSlug : `${baseSlug}-${existing.length}`

    const post: BlogPost = {
      id: String(Date.now()),
      slug,
      title: body.title.trim(),
      content: body.content || "",
      image: body.image || "",
      category: body.category || "Diseño",
      publishedAt: new Date().toISOString(),
      draft: body.draft === true,
    }
    data.posts.unshift(post)
    write(data)
    return NextResponse.json(post, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error al crear" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  if (!await isAdminAuthenticated())
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const body = await request.json()
    if (!body.id) return NextResponse.json({ error: "ID requerido" }, { status: 400 })

    const data = read()
    const idx = data.posts.findIndex(p => p.id === body.id)
    if (idx === -1) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

    data.posts[idx] = {
      ...data.posts[idx],
      title:    body.title    ?? data.posts[idx].title,
      content:  body.content  ?? data.posts[idx].content,
      image:    body.image    ?? data.posts[idx].image,
      category: body.category ?? data.posts[idx].category,
      draft:    body.draft    ?? data.posts[idx].draft,
    }
    write(data)
    return NextResponse.json(data.posts[idx])
  } catch {
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 })
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
    const prev = data.posts.length
    data.posts = data.posts.filter(p => p.id !== id)
    if (data.posts.length === prev)
      return NextResponse.json({ error: "No encontrado" }, { status: 404 })
    write(data)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 })
  }
}
