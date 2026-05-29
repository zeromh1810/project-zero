import { cookies } from "next/headers"
import crypto from "crypto"

function getExpectedToken(): string {
  const secret = process.env.ADMIN_PASS ?? "dev-secret"
  return crypto.createHmac("sha256", secret).update("admin-access").digest("hex")
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies()
  return store.get("admin_token")?.value === getExpectedToken()
}

export function getAdminToken(): string {
  return getExpectedToken()
}
