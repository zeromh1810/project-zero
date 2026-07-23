"use client"

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useIntersection } from "@/hooks/use-intersection"
import { AppNavbar, NAV_SESSION_KEY } from "./app-navbar"
import { BottomNav } from "./bottom-nav"
import { ProfileModal } from "./profile-modal"
import { ProjectsSection } from "./sections/projects-section"
import { AboutSection } from "./sections/about-section"
import { ContactSection } from "./sections/contact-section"
import type { Project } from "@/lib/data/projects"
import { useSocial, type SocialData } from "@/lib/hooks/use-social"
import { useFooter, type FooterData } from "@/lib/hooks/use-footer"
import { LinkedInIcon, InstagramIcon, GitHubIcon } from "./icons"

type Section = "trabajos" | "sobre" | "contacto"

export function Portfolio({ initialSocial, initialFooter }: { initialSocial?: SocialData; initialFooter?: FooterData }) {
  const router     = useRouter()
  const social     = useSocial(initialSocial)
  const footerData = useFooter(initialFooter)
  const [section, setSection] = useState<Section>("trabajos")
  const [displaySection, setDisplaySection] = useState<Section>("trabajos")
  const [transitioning, setTransitioning] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const pageRef   = useRef<HTMLDivElement>(null)
  const pendingScrollRef = useRef<string | null>(null)

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
      pendingScrollRef.current = scroll ?? null
      setSection(target)
      setDisplaySection(target)
    } catch {}
  }, [])

  // Aplica el scroll pendiente (si lo hay) en la MISMA pasada de layout effects
  // que monta displaySection="trabajos" — antes del primer paint, así al volver
  // desde el detalle de un proyecto no se ve el hero ni un scroll animado,
  // se llega directo a la grilla.
  useLayoutEffect(() => {
    const target = pendingScrollRef.current
    if (!target) return
    pendingScrollRef.current = null
    if (target === "projects") {
      const sheet = document.querySelector(".projects-sheet") as HTMLElement | null
      sheet?.scrollIntoView({ behavior: "instant" as ScrollBehavior, block: "start" })
    }
  }, [displaySection])

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

  // scrollTarget reuses the same pendingScrollRef the sessionStorage flow
  // uses (see the two effects above) — set before setSection so the
  // layout effect keyed on displaySection applies it instantly, before
  // paint, instead of a delayed/animated scroll after the crossfade.
  const navigateTo = (s: Section, scrollTarget?: string) => {
    if (s === section) {
      // Already on this section — this is an in-page anchor jump (hero →
      // grid), not a cross-section switch, so a smooth scroll reads fine
      // here (nothing to hide, unlike the crossfade case below).
      if (scrollTarget === "projects") {
        const sheet = document.querySelector(".projects-sheet") as HTMLElement | null
        sheet?.scrollIntoView({ behavior: "smooth", block: "start" })
      }
      return
    }
    pendingScrollRef.current = scrollTarget ?? null
    setSection(s)
  }

  // Overlay sólido que bloquea el WebGL durante transiciones entre secciones.
  // Se activa basado en `section` (el target) no en `displaySection` (el actual),
  // así aparece ANTES de que empiece el exit animation del page div.
  const needsSolidOverlay = section === "sobre" || section === "contacto"

  return (
    <>
      {/* Overlay entre WebGL y page — inmune al opacity del page div */}
      <div
        className={`section-bg-overlay${needsSolidOverlay ? " section-bg-overlay--on" : ""}`}
        aria-hidden="true"
      />

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

      <footer className="footer">
        <div className="footer-mark">✦</div>
        <div className="footer-brand">{footerData.brand}</div>
        <div className="footer-tagline">{footerData.tagline}</div>
        <div className="footer-social">
          {social.linkedin && (
            <a href={social.linkedin} target="_blank" rel="noopener noreferrer"
               aria-label="LinkedIn" className="footer-social-link">
              <LinkedInIcon />
            </a>
          )}
          {social.instagram && (
            <a href={social.instagram} target="_blank" rel="noopener noreferrer"
               aria-label="Instagram" className="footer-social-link">
              <InstagramIcon />
            </a>
          )}
          {social.github && (
            <a href={social.github} target="_blank" rel="noopener noreferrer"
               aria-label="GitHub" className="footer-social-link">
              <GitHubIcon />
            </a>
          )}
        </div>
        <div className="footer-copy">{footerData.copy}</div>
      </footer>

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
