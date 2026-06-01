"use client"

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useIntersection } from "@/hooks/use-intersection"
import { WebGLCanvas } from "./webgl-canvas"
import { AppNavbar, NAV_SESSION_KEY } from "./app-navbar"
import { BottomNav } from "./bottom-nav"
import { ProfileModal } from "./profile-modal"
import { ProjectsSection } from "./sections/projects-section"
import { AboutSection } from "./sections/about-section"
import { ContactSection } from "./sections/contact-section"
import type { Project } from "@/lib/data/projects"
import { useSocial, type SocialData } from "@/lib/hooks/use-social"

type Section = "trabajos" | "sobre" | "contacto"

export function Portfolio({ initialSocial }: { initialSocial?: SocialData }) {
  const router  = useRouter()
  const social  = useSocial(initialSocial)
  const [section, setSection] = useState<Section>("trabajos")
  const [displaySection, setDisplaySection] = useState<Section>("trabajos")
  const [transitioning, setTransitioning] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const pageRef   = useRef<HTMLDivElement>(null)

  // Scroll animations
  useIntersection(
    pageRef,
    useCallback((el: Element) => {
      el.classList.add("visible", "in")
    }, []),
    [displaySection]
  )

  // Lee sessionStorage antes del primer paint — sin flash, sin hash en URL
  useLayoutEffect(() => {
    const raw = sessionStorage.getItem(NAV_SESSION_KEY)
    if (!raw) return
    sessionStorage.removeItem(NAV_SESSION_KEY)
    try {
      const { section: target, scroll } = JSON.parse(raw) as { section: Section; scroll?: string }
      const valid: Section[] = ["trabajos", "sobre", "contacto"]
      if (!valid.includes(target)) return
      setSection(target)
      setDisplaySection(target)
      if (scroll === "projects") {
        setTimeout(() => {
          const sheet = document.querySelector(".projects-sheet") as HTMLElement
          if (sheet) sheet.scrollIntoView({ behavior: "smooth", block: "start" })
        }, 200)
      }
    } catch {}
  }, [])

  // Crossfade transition between sections
  useEffect(() => {
    if (section === displaySection) return

    setTransitioning(true)
    const exitTimer = setTimeout(() => {
      setDisplaySection(section)
      setTransitioning(false)
      // Scroll to top smoothly when switching sections
      window.scrollTo({ top: 0, behavior: "instant" })
    }, 160)

    return () => clearTimeout(exitTimer)
  }, [section, displaySection])

  // ESC to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowProfile(false)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const navigateTo = (s: Section) => {
    if (s === section) return
    setSection(s)
  }

  return (
    <>
      <WebGLCanvas />

      <AppNavbar
        mode="portfolio"
        currentSection={section}
        onNavigate={navigateTo}
        onProfileClick={() => setShowProfile(true)}
      />

      <div
        className={`page${transitioning ? " page--exit" : " page--enter"}${
          displaySection === "sobre" || displaySection === "contacto" ? " page--solid-bg" : ""
        }`}
        ref={pageRef}
      >
        {displaySection === "trabajos" && (
          <ProjectsSection
            onNavigateContact={() => navigateTo("contacto")}
            onNavigateAbout={() => navigateTo("sobre")}
            onSelectProject={(project: Project) => router.push(`/projects/${project.id}`)}
          />
        )}

        {displaySection === "sobre" && (
          <AboutSection
            onNavigateContact={() => navigateTo("contacto")}
          />
        )}

        {displaySection === "contacto" && <ContactSection />}
      </div>

      {showProfile && (
        <ProfileModal
          onClose={() => setShowProfile(false)}
          onNavigateContact={() => navigateTo("contacto")}
        />
      )}

      <BottomNav currentSection={section} onNavigate={navigateTo} />
    </>
  )
}
