"use client"

import { useState, useEffect, Fragment } from "react"
import { useTheme } from "@/lib/context/theme-context"
import { SKILLS, STATS } from "@/lib/data/projects"
import { useSocial } from "@/lib/hooks/use-social"
import { LinkedInIcon, InstagramIcon } from "@/components/portfolio/icons"

// Safe renderer: only allows <strong> tags, strips everything else
function SafeBio({ html }: { html: string }) {
  const parts = html.split(/(<strong>.*?<\/strong>)/g)
  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^<strong>(.*?)<\/strong>$/)
        return match ? <strong key={i}>{match[1]}</strong> : <Fragment key={i}>{part}</Fragment>
      })}
    </>
  )
}

interface Stat { value: string; label: string }
interface AboutData {
  bio1: string
  bio2: string
  skills: string[]
  stats: Stat[]
  badge: string
  available: boolean
}

const DEFAULT: AboutData = {
  bio1: "Soy <strong>diseñador de producto y desarrollador frontend</strong> con base en Santiago, Chile. Me especializo en interfaces digitales que no solo se ven bien, sino que <strong>funcionan de manera intuitiva y elegante</strong>.",
  bio2: "Mi proceso combina investigación profunda con ejecución meticulosa. Creo que los mejores productos nacen de la <strong>tensión entre simplicidad y profundidad</strong> — fáciles de usar a primera vista, ricos en detalle cuando los exploras.",
  skills: SKILLS,
  stats: STATS.map(s => ({ value: s.value, label: s.label })),
  badge: "Disponible para freelance",
  available: true,
}

interface AboutSectionProps {
  onNavigateContact: () => void
  onNavigateCV: () => void
}

export function AboutSection({ onNavigateContact, onNavigateCV }: AboutSectionProps) {
  const { isDark } = useTheme()
  const social = useSocial()
  const [data, setData] = useState<AboutData>(DEFAULT)

  useEffect(() => {
    fetch("/api/admin/about", { cache: "no-store" })
      .then(r => r.json())
      .then(d => setData({ ...DEFAULT, ...d }))
      .catch(() => {})
  }, [])

  return (
    <div className="section section--contact">
      <div className="s-head anim-up">
        <div className="s-label">Biografía</div>
        <h2 className="s-title">Sobre mí</h2>
      </div>

      <div className="about-grid">
        <div className="about-top-row">
          {/* Photo */}
          <div className="about-photo-wrap">
            <div className="about-photo-fallback">
              <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
                <circle cx="70" cy="54" r="32"
                  fill={isDark ? "rgba(41,151,255,0.3)" : "rgba(41,151,255,0.2)"} />
                <ellipse cx="70" cy="120" rx="52" ry="32"
                  fill={isDark ? "rgba(41,151,255,0.2)" : "rgba(41,151,255,0.15)"} />
                <circle cx="70" cy="52" r="22"
                  fill={isDark ? "rgba(41,151,255,0.55)" : "rgba(41,151,255,0.45)"} />
                <text x="70" y="60" textAnchor="middle" fontSize="28"
                  fontFamily="Plus Jakarta Sans" fontWeight="700" fill="white" opacity="0.9">
                  A
                </text>
              </svg>
            </div>
            <div className="about-badge">
              {data.available && <span className="badge-pulse" />}
              {data.badge}
            </div>
            {(social.linkedin || social.instagram) && (
              <div className="about-social">
                {social.linkedin && (
                  <a href={social.linkedin} target="_blank" rel="noopener noreferrer"
                     aria-label="LinkedIn" className="about-social-link">
                    <LinkedInIcon />
                  </a>
                )}
                {social.instagram && (
                  <a href={social.instagram} target="_blank" rel="noopener noreferrer"
                     aria-label="Instagram" className="about-social-link">
                    <InstagramIcon />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Stats col — tablet/mobile */}
          <div className="about-stats-col">
            <div className="stats-row anim-up">
              {data.stats.map(({ value, label }) => (
                <div className="stat" key={label}>
                  <div className="stat-n">{value}</div>
                  <div className="stat-l">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="about-content">
          <div className="stats-row stats-desktop-only anim-up">
            {data.stats.map(({ value, label }) => (
              <div className="stat" key={label}>
                <div className="stat-n">{value}</div>
                <div className="stat-l">{label}</div>
              </div>
            ))}
          </div>

          <p className="about-bio anim-up"><SafeBio html={data.bio1} /></p>
          <p className="about-bio anim-up"><SafeBio html={data.bio2} /></p>

          <div className="skills-label anim-up">Stack & Herramientas</div>
          <div className="skills-wrap anim-up">
            {data.skills.map(s => (
              <span key={s} className="skill-tag">{s}</span>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12 }} className="anim-up">
            <button className="btn-p" onClick={onNavigateContact}>Contáctame</button>
            <button className="btn-g" onClick={onNavigateCV}>Ver CV</button>
          </div>
        </div>
      </div>
    </div>
  )
}
