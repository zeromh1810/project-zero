"use client"

import AdminDashboard, { type AdminTab } from "@/app/admin/_components/admin-dashboard"
import ComponentsGallery from "./components-gallery"
import FrameView from "./frame-view"

interface Props {
  view: string
  tab?: string
  page?: string
  specimen?: string
  src?: string
  w: number
  h: number
}

export default function DevUiClient({ view, tab, src, w, h }: Props) {
  if (view === "admin" || view === "ds") {
    return (
      <AdminDashboard
        preview
        initialTab={(view === "ds" ? "ds" : (tab as AdminTab)) || "proyectos"}
        onLogout={() => { window.location.href = "/admin" }}
      />
    )
  }
  if (view === "components") return <ComponentsGallery />
  if (view === "frame" && src?.startsWith("/")) return <FrameView src={src} width={w} height={h} />
  return <p style={{ padding: 40 }}>Vista desconocida: {view}</p>
}
