'use client';

import { motion } from 'framer-motion';
import { ArrowDown, ExternalLink } from 'lucide-react';
import type { AboutData } from '@/types';

interface HeroSectionProps {
  about: AboutData;
}

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.3,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const scaleFade = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function HeroSection({ about }: HeroSectionProps) {
  const handleScrollToWorks = () => {
    const el = document.getElementById('trabajos');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const topSkills = about.skills.slice(0, 6);

  return (
    <section
      id="hero"
      className="relative flex min-h-screen flex-col items-center justify-center px-6 py-20 text-center"
      aria-label="Inicio"
    >
      <motion.div
        className="mx-auto max-w-3xl"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {/* Role tag */}
        <motion.div variants={fadeUp} className="mb-6">
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-xs font-medium"
            style={{
              border: '1px solid var(--border)',
              color: 'var(--accent)',
              background: 'var(--bg-glass)',
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: 'var(--accent)' }}
            />
            {about.role_title}
          </span>
        </motion.div>

        {/* Name — big display type */}
        <motion.h1
          variants={fadeUp}
          className="mb-4 font-display text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
          style={{ color: 'var(--text-primary)' }}
        >
          {about.full_name.split(' ').map((word, i) => (
            <span key={i} className="block">
              {word}
            </span>
          ))}
        </motion.h1>

        {/* Accent line */}
        <motion.div
          variants={fadeUp}
          className="mx-auto mb-6 h-[3px] w-16 rounded-full"
          style={{ background: 'var(--accent)' }}
        />

        {/* Bio */}
        <motion.p
          variants={fadeUp}
          className="mx-auto mb-10 max-w-md text-sm leading-relaxed md:text-base"
          style={{ color: 'var(--text-secondary)' }}
        >
          {about.bio_short}
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fadeUp}
          className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          {/* Primary CTA */}
          <button
            onClick={handleScrollToWorks}
            className="group inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-medium transition-all duration-300"
            style={{
              background: 'var(--accent)',
              color: 'var(--bg-primary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent-hover)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 30px var(--glow)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--accent)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Ver trabajos
            <ArrowDown
              size={16}
              className="transition-transform duration-300 group-hover:translate-y-1"
            />
          </button>

          {/* Secondary CTA */}
          {about.cv_url && (
            <a
              href={about.cv_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-medium transition-all duration-300"
              style={{
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Descargar CV
              <ExternalLink size={14} />
            </a>
          )}
        </motion.div>

        {/* Skill pills */}
        <motion.div
          variants={fadeUp}
          className="flex flex-wrap items-center justify-center gap-2"
        >
          {topSkills.map((skill, i) => (
            <motion.span
              key={skill}
              className="tag-pill"
              variants={scaleFade}
            >
              {skill}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div
          className="flex flex-col items-center gap-2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span
            className="font-mono text-[10px] uppercase tracking-widest"
            style={{ color: 'var(--text-muted)' }}
          >
            Scroll
          </span>
          <div
            className="h-8 w-[1px]"
            style={{ background: 'var(--border-strong)' }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
