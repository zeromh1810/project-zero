"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useIntersection } from "@/hooks/use-intersection"
import { WebGLCanvas } from "./webgl-canvas"
import { Navbar } from "./navbar"
import { BottomNav } from "./bottom-nav"
import { ProfileModal } from "./profile-modal"
import { ProjectsSection } from "./sections/projects-section"
import { AboutSection } from "./sections/about-section"
import { CVSection } from "./sections/cv-section"
import { ContactSection } from "./sections/contact-section"
import { DesignSystemSection } from "./sections/design-system-section"
import type { Project } from "@/lib/data/projects"

type Section = "trabajos" | "sobre" | "cv" | "contacto" | "design-system"

export function Portfolio() {
  const router = useRouter()
  const [section, setSection] = useState<Section>("trabajos")
  const [displaySection, setDisplaySection] = useState<Section>("trabajos")
  const [transitioning, setTransitioning] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const pageRef = useRef<HTMLDivElement>(null)

  // Scroll animations
  useIntersection(
    pageRef,
    useCallback((el: Element) => {
      el.classList.add("visible", "in")
    }, []),
    [displaySection]
  )

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

      <Navbar
        currentSection={section}
        onNavigate={navigateTo}
        onProfileClick={() => setShowProfile(true)}
      />

      <div
        className={`page${transitioning ? " page--exit" : " page--enter"}`}
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
            onNavigateCV={() => navigateTo("cv")}
          />
        )}

        {displaySection === "cv" && <CVSection />}

        {displaySection === "contacto" && <ContactSection />}

        {displaySection === "design-system" && <DesignSystemSection />}
      </div>

      <footer className="footer">© 2026 A·Studio — Diseñado con obsesión por los detalles</footer>

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
