'use client';

import { motion } from 'framer-motion';
import type { AboutData } from '@/types';
import AnimatedText, { StaggerText } from '@/components/ui/AnimatedText';

interface AboutSectionProps {
  about: AboutData;
}

export default function AboutSection({ about }: AboutSectionProps) {
  return (
    <section id="about-section" aria-label="Sobre mí">
      <div className="grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-5">
        {/* Photo Column */}
        <div className="lg:col-span-2">
          <motion.div
            className="overflow-hidden rounded-xl"
            style={{
              border: '1px solid var(--border)',
              aspectRatio: '4/5',
              maxWidth: '320px',
            }}
            initial={{ clipPath: 'inset(100% 0 0 0)' }}
            animate={{ clipPath: 'inset(0% 0 0 0)' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            <div
              className="flex h-full w-full items-center justify-center text-6xl font-bold"
              style={{
                background: 'var(--bg-glass-strong)',
                color: 'var(--accent)',
              }}
            >
              {about.full_name.split(' ').map((n) => n[0]).join('')}
            </div>
          </motion.div>
        </div>

        {/* Text Column */}
        <div className="lg:col-span-3">
          {/* Greeting */}
          <AnimatedText
            as="h2"
            className="mb-4 font-display text-3xl font-bold md:text-4xl"
            delay={0.1}
          >
            Hola, soy {about.full_name.split(' ')[0]}
          </AnimatedText>

          {/* Role */}
          <motion.p
            className="mb-6 font-mono text-sm"
            style={{ color: 'var(--accent)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {about.role_title}
          </motion.p>

          {/* Bio */}
          <motion.div
            className="mb-8 space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {about.bio_long.split('\n\n').map((paragraph, i) => (
              <motion.p
                key={i}
                className="text-sm leading-relaxed md:text-base"
                style={{ color: 'var(--text-secondary)' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                {paragraph}
              </motion.p>
            ))}
          </motion.div>

          {/* Skills */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h3
              className="mb-3 text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              Herramientas & Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {about.skills.map((skill, i) => (
                <motion.span
                  key={skill}
                  className="tag-pill"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.05 }}
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="flex gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <div>
              <div
                className="font-display text-3xl font-bold"
                style={{ color: 'var(--accent)' }}
              >
                {about.years_exp}+
              </div>
              <div
                className="mt-1 font-mono text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                Años de experiencia
              </div>
            </div>
            <div>
              <div
                className="font-display text-3xl font-bold"
                style={{ color: 'var(--accent)' }}
              >
                {about.projects_count}+
              </div>
              <div
                className="mt-1 font-mono text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                Proyectos completados
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
