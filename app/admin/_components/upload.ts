// Sube una imagen al endpoint del admin y devuelve la URL pública final
// (raw de GitHub si el commit funcionó, /uploads/... si no).
export async function uploadImage(file: File): Promise<string> {
  const fd = new FormData()
  fd.append("file", file)
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || "Error al subir")
  }
  const { url } = await res.json()
  return url
}
