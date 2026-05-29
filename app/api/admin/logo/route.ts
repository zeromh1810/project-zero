import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { isAdminAuthenticated } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

const FILE      = path.join(process.cwd(), "data", "logo.json")
const DATA_PATH = "data/logo.json"
const EMPTY_LOGO = { lightUrl: "", darkUrl: "", fallbackText: "Project Zero" }

function read() {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf-8"))
  } catch {
    return { ...EMPTY_LOGO }
  }
}

function write(data: unknown) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), "utf-8")
}

async function commitToGitHub(data: unknown): Promise<void> {
  const token  = process.env.GITHUB_TOKEN
  const repo   = process.env.GITHUB_REPO
  const branch = process.env.GITHUB_BRANCH ?? "main"

  if (!token || !repo) return

  const apiUrl = `https://api.github.com/repos/${repo}/contents/${DATA_PATH}`
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2022-11-28",
  }

  // Get current file SHA (required by GitHub API to update a file)
  const getRes = await fetch(`${apiUrl}?ref=${branch}`, { headers })
  const sha: string | undefined = getRes.ok
    ? (await getRes.json()).sha
    : undefined

  const content = Buffer.from(JSON.stringify(data, null, 2) + "\n").toString("base64")

  const putRes = await fetch(apiUrl, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      message: "chore(data): update logo via admin panel [skip ci]",
      content,
      branch,
      ...(sha ? { sha } : {}),
    }),
  })

  if (!putRes.ok) {
    const err = await putRes.json().catch(() => ({}))
    throw new Error(`GitHub API ${putRes.status}: ${JSON.stringify(err)}`)
  }
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
    const updated = { ...read(), ...body }
    write(updated)

    try {
      await commitToGitHub(updated)
    } catch (err) {
      console.warn("[logo] GitHub commit failed (datos guardados localmente):", err)
    }

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 })
  }
}
