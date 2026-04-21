'use client';

import { motion } from 'framer-motion';
import type { AboutData } from '@/types';

interface AboutSectionProps {
  about: AboutData;
}

export default function AboutSection({ about }: AboutSectionProps) {
  return (
    <section
      id="sobre-mi"
      className="relative z-10 px-6 py-24 md:py-32"
      aria-label="Sobre mí"
    >
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 gap-12 md:gap-16 lg:grid-cols-5">
          {/* Photo Column */}
          <div className="lg:col-span-2">
            <motion.div
              className="overflow-hidden rounded-2xl"
              style={{
                border: '1px solid var(--border)',
                aspectRatio: '4/5',
                maxWidth: '380px',
              }}
              initial={{ opacity: 0, clipPath: 'inset(100% 0 0 0)' }}
              whileInView={{ opacity: 1, clipPath: 'inset(0% 0 0 0)' }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <div
                className="flex h-full w-full items-center justify-center text-7xl font-bold"
                style={{
                  background: 'var(--bg-glass-strong)',
                  color: 'var(--accent)',
                }}
              >
                {about.full_name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
            </motion.div>
          </div>

          {/* Text Column */}
          <div className="lg:col-span-3">
            {/* Greeting */}
            <motion.h2
              className="mb-4 font-display text-3xl font-bold md:text-5xl"
              style={{ color: 'var(--text-primary)' }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              Hola, soy {about.full_name.split(' ')[0]}
            </motion.h2>

            {/* Role */}
            <motion.p
              className="mb-8 font-mono text-sm"
              style={{ color: 'var(--accent)' }}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {about.role_title}
            </motion.p>

            {/* Bio */}
            <motion.div
              className="mb-10 space-y-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {about.bio_long.split('\n\n').map((paragraph, i) => (
                <motion.p
                  key={i}
                  className="text-sm leading-relaxed md:text-base"
                  style={{ color: 'var(--text-secondary)' }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                >
                  {paragraph}
                </motion.p>
              ))}
            </motion.div>

            {/* Skills */}
            <motion.div
              className="mb-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <h3
                className="mb-4 text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                Herramientas &amp; Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {about.skills.map((skill, i) => (
                  <motion.span
                    key={skill}
                    className="tag-pill"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + i * 0.04, duration: 0.3 }}
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="flex gap-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <div>
                <div
                  className="font-display text-4xl font-bold"
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
                  className="font-display text-4xl font-bold"
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
      </div>
    </section>
  );
}
