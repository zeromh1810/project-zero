const HEADERS = {
  Accept: "application/vnd.github+json",
  "Content-Type": "application/json",
  "X-GitHub-Api-Version": "2022-11-28",
}

export async function commitToGitHub(dataPath: string, data: unknown, message: string): Promise<void> {
  const token  = process.env.GITHUB_TOKEN
  const repo   = process.env.GITHUB_REPO
  const branch = process.env.GITHUB_BRANCH ?? "main"

  if (!token || !repo) return

  const apiUrl  = `https://api.github.com/repos/${repo}/contents/${dataPath}`
  const headers = { ...HEADERS, Authorization: `Bearer ${token}` }

  const getRes = await fetch(`${apiUrl}?ref=${branch}`, { headers })
  const sha: string | undefined = getRes.ok ? (await getRes.json()).sha : undefined

  const content = Buffer.from(JSON.stringify(data, null, 2) + "\n").toString("base64")

  const putRes = await fetch(apiUrl, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      message,
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
