"use client"

import { useRef, useEffect } from "react"
import { useTheme } from "@/lib/context/theme-context"
import { buildGradientGL } from "@/lib/webgl/gradient-shader"

export function WebGLCanvas() {
  const { darkRef } = useTheme()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    if (cleanupRef.current) cleanupRef.current()
    cleanupRef.current = buildGradientGL(canvasRef.current, () => darkRef.current)
    return () => {
      if (cleanupRef.current) cleanupRef.current()
    }
  }, [darkRef])

  return <canvas ref={canvasRef} id="gl-canvas" aria-hidden="true" />
}
