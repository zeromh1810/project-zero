import fs from "fs"
import { commitToGitHub } from "@/lib/github-data"

// Shared by the admin API routes that persist a single JSON object to disk
// (about, cv, hero, footer, social, logo, profile) — each still owns its own
// defaults/merge/response shape, only the read-file and write+commit
// boilerplate (identical across all of them) lives here.

export function readJsonFile<T>(file: string, fallback: T): T {
  try { return JSON.parse(fs.readFileSync(file, "utf-8")) }
  catch { return fallback }
}

export async function writeJsonAndCommit(
  file: string,
  dataPath: string,
  data: unknown,
  message: string,
  label: string,
): Promise<boolean> {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8")
  try {
    await commitToGitHub(dataPath, data, message)
    return true
  } catch (err) {
    console.warn(`[${label}] GitHub commit failed:`, err)
    return false
  }
}
