import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { isAdminAuthenticated, getAdminToken } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

export async function GET() {
  const ok = await isAdminAuthenticated()
  return NextResponse.json({ authenticated: ok })
}

export async function POST(request: Request) {
  try {
    const { pass } = await request.json()
    const expected = process.env.ADMIN_PASS ?? ""

    if (!expected || pass !== expected) {
      return NextResponse.json({ ok: false }, { status: 401 })
    }

    const store = await cookies()
    store.set("admin_token", getAdminToken(), {
      httpOnly: true,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 hours
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

export async function DELETE() {
  const store = await cookies()
  store.delete("admin_token")
  return NextResponse.json({ ok: true })
}
