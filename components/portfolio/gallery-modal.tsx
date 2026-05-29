"use client"

import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"

export interface GalleryItem {
  id: number
  src?: string
  label: string
  gradient: string
  accent: string
  placeholderType: "mobile" | "desktop" | "components" | "flow" | "research" | "final"
}

interface GalleryModalProps {
  items: GalleryItem[]
  currentIndex: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onNavigate: (index: number) => void
}

export function GalleryModal({
  items,
  currentIndex,
  open,
  onOpenChange,
  onNavigate,
}: GalleryModalProps) {
  const currentItem = items[currentIndex]

  const handlePrev = () =>
    onNavigate(currentIndex === 0 ? items.length - 1 : currentIndex - 1)
  const handleNext = () =>
    onNavigate(currentIndex === items.length - 1 ? 0 : currentIndex + 1)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); handlePrev() }
    if (e.key === "ArrowRight") { e.preventDefault(); handleNext() }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-300"
          )}
        />
        <DialogPrimitive.Content
          onKeyDown={handleKeyDown}
          aria-describedby={undefined}
          className={cn(
            "fixed inset-0 z-[10000] flex items-center justify-center",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:scale-95 data-[state=open]:scale-100",
            "duration-300 ease-out focus:outline-none"
          )}
        >
          <DialogPrimitive.Title className="sr-only">
            Galería — {currentItem?.label}
          </DialogPrimitive.Title>

          {/* Close */}
          <DialogPrimitive.Close className={cn(
            "absolute top-6 right-6 z-10 flex items-center justify-center w-12 h-12",
            "rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200",
            "hover:scale-110 focus:outline-none"
          )}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </DialogPrimitive.Close>

          {/* Prev */}
          <button onClick={handlePrev} aria-label="Anterior" className={cn(
            "absolute left-6 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-12 h-12",
            "rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:scale-110"
          )}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Next */}
          <button onClick={handleNext} aria-label="Siguiente" className={cn(
            "absolute right-6 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-12 h-12",
            "rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:scale-110"
          )}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Main image area */}
          <div className="w-full max-w-5xl mx-auto px-20">
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl" style={{ background: "var(--bg2)" }}>
              {currentItem?.src ? (
                <img
                  src={currentItem.src}
                  alt={currentItem.label}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              ) : (
                <PlaceholderFull item={currentItem} />
              )}
            </div>

            <div className="flex items-center justify-between mt-5 px-2">
              <span className="text-white/60 text-sm font-medium">{currentItem?.label}</span>
              <span className="text-white/40 text-sm">{currentIndex + 1} / {items.length}</span>
            </div>
          </div>

          {/* Dots */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
            {items.map((_, i) => (
              <button key={i} onClick={() => onNavigate(i)}
                className={cn("w-2 h-2 rounded-full transition-all duration-200",
                  i === currentIndex ? "bg-white scale-125" : "bg-white/30 hover:bg-white/50"
                )}
                aria-label={`Ir a imagen ${i + 1}`}
              />
            ))}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

/* ── Placeholder fullscreen ── */
function PlaceholderFull({ item }: { item: GalleryItem }) {
  if (!item) return null
  return (
    <div style={{ position: "absolute", inset: 0, background: item.gradient }}>
      <PlaceholderLayout type={item.placeholderType} accent={item.accent} large />
    </div>
  )
}

/* ── Placeholder thumbnail (used in gallery grid) ── */
export function PlaceholderThumb({ item }: { item: GalleryItem }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: item.gradient }}>
      <PlaceholderLayout type={item.placeholderType} accent={item.accent} large={false} />
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
      <div style={{ padding: `${20 * s}px`, height: "100%", display: "flex", flexDirection: "column", gap: `${8 * s}px` }}>
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
      <div style={{ padding: `${16 * s}px`, height: "100%", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gridTemplateRows: "1fr 1fr", gap: `${8 * s}px` }}>
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
      <div style={{ padding: `${16 * s}px`, height: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: `${10 * s}px` }}>
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
      <div style={{ padding: `${16 * s}px`, height: "100%", display: "flex", flexDirection: "column", gap: `${10 * s}px` }}>
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
