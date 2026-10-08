"use client"

// Arte de relleno para los espacios de la galería sin imagen subida: un
// esquema del tipo de pantalla (móvil, escritorio, flujo…) en el color del
// proyecto. Lo usan la grilla del detalle y el lightbox.

export interface GalleryItem {
  id: number
  src?: string
  label: string
  gradient: string
  accent: string
  placeholderType: "mobile" | "desktop" | "components" | "flow" | "research" | "final"
}

export function GalleryPlaceholder({ item, large = false }: { item: GalleryItem; large?: boolean }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: item.gradient }}>
      <PlaceholderLayout type={item.placeholderType} accent={item.accent} large={large} />
    </div>
  )
}

function PlaceholderLayout({
  type, accent, large,
}: { type: GalleryItem["placeholderType"]; accent: string; large: boolean }) {
  const a = accent
  const op = (o: number) => `${a}${Math.round(o * 255).toString(16).padStart(2, "0")}`
  const s = large ? 1 : 0.5

  const layouts: Record<string, React.ReactNode> = {
    mobile: (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", padding: `${16 * s}px` }}>
        <div style={{ width: `${72 * s}px`, height: `${124 * s}px`, borderRadius: `${12 * s}px`, border: `${2 * s}px solid ${op(0.4)}`, background: "rgba(0,0,0,0.3)", padding: `${8 * s}px`, display: "flex", flexDirection: "column", gap: `${5 * s}px` }}>
          <div style={{ height: `${8 * s}px`, borderRadius: 4, background: op(0.6) }} />
          <div style={{ height: `${6 * s}px`, borderRadius: 4, background: op(0.3) }} />
          <div style={{ flex: 1, borderRadius: `${6 * s}px`, background: op(0.15) }} />
          <div style={{ height: `${10 * s}px`, borderRadius: 4, background: op(0.5) }} />
        </div>
      </div>
    ),
    desktop: (
      <div style={{ padding: `${20 * s}px`, width: "100%", height: "100%", display: "flex", flexDirection: "column", gap: `${8 * s}px` }}>
        <div style={{ height: `${10 * s}px`, borderRadius: 4, background: op(0.5), width: "40%" }} />
        <div style={{ flex: 1, borderRadius: `${8 * s}px`, border: `${1.5 * s}px solid ${op(0.2)}`, background: op(0.08), padding: `${12 * s}px`, display: "grid", gridTemplateColumns: "1fr 2fr", gap: `${8 * s}px` }}>
          <div style={{ background: op(0.12), borderRadius: `${6 * s}px` }} />
          <div style={{ display: "flex", flexDirection: "column", gap: `${6 * s}px` }}>
            <div style={{ height: `${10 * s}px`, borderRadius: 4, background: op(0.35), width: "60%" }} />
            <div style={{ height: `${7 * s}px`, borderRadius: 4, background: op(0.2) }} />
            <div style={{ height: `${7 * s}px`, borderRadius: 4, background: op(0.2), width: "80%" }} />
            <div style={{ flex: 1, borderRadius: `${6 * s}px`, background: op(0.1) }} />
          </div>
        </div>
      </div>
    ),
    components: (
      <div style={{ padding: `${16 * s}px`, width: "100%", height: "100%", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gridTemplateRows: "1fr 1fr", gap: `${8 * s}px` }}>
        {[0.6, 0.4, 0.5, 0.3, 0.45, 0.55].map((op2, i) => (
          <div key={i} style={{ borderRadius: `${8 * s}px`, background: op(op2), border: `1px solid ${op(op2 + 0.1)}` }} />
        ))}
      </div>
    ),
    flow: (
      <div style={{ padding: `${16 * s}px`, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: `${12 * s}px` }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: `${12 * s}px` }}>
            <div style={{ width: `${52 * s}px`, height: `${36 * s}px`, borderRadius: `${8 * s}px`, background: op(0.25), border: `${1.5 * s}px solid ${op(0.45)}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: `${24 * s}px`, height: `${5 * s}px`, borderRadius: 2, background: op(0.7) }} />
            </div>
            {i < 3 && <div style={{ width: `${16 * s}px`, height: `${1.5 * s}px`, background: op(0.4) }} />}
          </div>
        ))}
      </div>
    ),
    research: (
      <div style={{ padding: `${16 * s}px`, width: "100%", height: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: `${10 * s}px` }}>
        {[0.3, 0.2, 0.25, 0.35].map((op2, i) => (
          <div key={i} style={{ borderRadius: `${8 * s}px`, background: op(op2), padding: `${10 * s}px`, display: "flex", flexDirection: "column", gap: `${5 * s}px` }}>
            <div style={{ height: `${6 * s}px`, borderRadius: 3, background: op(0.6), width: "70%" }} />
            <div style={{ height: `${5 * s}px`, borderRadius: 3, background: op(0.35) }} />
            <div style={{ height: `${5 * s}px`, borderRadius: 3, background: op(0.35), width: "80%" }} />
          </div>
        ))}
      </div>
    ),
    final: (
      <div style={{ padding: `${16 * s}px`, width: "100%", height: "100%", display: "flex", flexDirection: "column", gap: `${10 * s}px` }}>
        <div style={{ height: `${28 * s}px`, borderRadius: `${6 * s}px`, background: op(0.5), width: "55%" }} />
        <div style={{ height: `${8 * s}px`, borderRadius: 4, background: op(0.2), width: "80%" }} />
        <div style={{ height: `${8 * s}px`, borderRadius: 4, background: op(0.2), width: "65%" }} />
        <div style={{ marginTop: `${4 * s}px`, display: "flex", gap: `${8 * s}px` }}>
          <div style={{ width: `${64 * s}px`, height: `${22 * s}px`, borderRadius: `${980 * s}px`, background: a }} />
          <div style={{ width: `${64 * s}px`, height: `${22 * s}px`, borderRadius: `${980 * s}px`, border: `1px solid ${op(0.35)}` }} />
        </div>
        <div style={{ flex: 1, borderRadius: `${8 * s}px`, background: op(0.12) }} />
      </div>
    ),
  }

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {layouts[type] ?? layouts.desktop}
    </div>
  )
}
