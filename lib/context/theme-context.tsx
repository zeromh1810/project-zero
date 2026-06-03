"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"

interface ThemeContextType {
  isDark: boolean
  toggleTheme: () => void
  darkRef: React.MutableRefObject<boolean>
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = "portfolio-theme"

function getInitialTheme(): boolean {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored !== null) return stored === "dark"
    // No stored preference — respect OS preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches
  }
  return false // SSR default: light
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false) // SSR default: light
  const [mounted, setMounted] = useState(false)
  const darkRef = useRef(isDark)

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const initialTheme = getInitialTheme()
    setIsDark(initialTheme)
    setMounted(true)
  }, [])

  // Keep darkRef in sync (shader reads it without re-init)
  useEffect(() => {
    darkRef.current = isDark
  }, [isDark])

  // Update document class and localStorage
  useEffect(() => {
    if (!mounted) return
    document.documentElement.classList.toggle("dark", isDark)
    document.documentElement.classList.toggle("light", !isDark)
    localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light")
  }, [isDark, mounted])

  const toggleTheme = () => setIsDark((d) => !d)

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, darkRef }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
