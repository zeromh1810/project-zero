'use client';

import { motion } from 'framer-motion';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  index: number;
  onClick: () => void;
}

const gradients: Record<string, string> = {
  Branding:
    'linear-gradient(135deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #e94560 100%)',
  'UI/UX':
    'linear-gradient(135deg, #0c0c1d 0%, #1b1b3a 30%, #3a0ca3 60%, #7209b7 100%)',
  'Web Design':
    'linear-gradient(135deg, #0d1b2a 0%, #1b263b 30%, #415a77 60%, #778da9 100%)',
};

export default function ProjectCard({ project, index, onClick }: ProjectCardProps) {
  const bg = gradients[project.category] || gradients['Branding'];
  const initials = project.title
    .split(' ')
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0])
    .join('');

  return (
    <motion.article
      className="group cursor-pointer overflow-hidden rounded-xl transition-shadow duration-300"
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
      initial={false}
      whileHover={{
        scale: 1.02,
        boxShadow: 'var(--shadow-lg)',
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      data-cursor="view"
    >
      {/* Image Area with gradient */}
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: '16/10' }}
      >
        <div
          className="flex h-full w-full items-center justify-center transition-transform duration-500 group-hover:scale-105"
          style={{ background: bg }}
        >
          {/* Decorative geometric shapes */}
          <div className="relative flex h-full w-full items-center justify-center">
            {/* Circle */}
            <div
              className="absolute rounded-full opacity-10"
              style={{
                width: '180px',
                height: '180px',
                border: '1px solid rgba(255,255,255,0.3)',
                top: '10%',
                right: '10%',
              }}
            />
            {/* Square */}
            <div
              className="absolute rotate-45 opacity-10"
              style={{
                width: '80px',
                height: '80px',
                border: '1px solid rgba(255,255,255,0.25)',
                bottom: '20%',
                left: '15%',
              }}
            />
            {/* Monogram */}
            <span
              className="font-display text-5xl font-bold tracking-wider"
              style={{
                color: 'rgba(255,255,255,0.12)',
                textShadow: '0 0 40px rgba(255,255,255,0.06)',
              }}
            >
              {initials}
            </span>
          </div>
        </div>

        {/* Bottom gradient overlay */}
        <div
          className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-0"
          style={{
            background:
              'linear-gradient(to top, var(--card-bg) 0%, transparent 50%)',
            opacity: 0.5,
          }}
        />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category pill */}
        <span
          className="mb-2 inline-block rounded-full px-2.5 py-0.5 font-mono text-[11px]"
          style={{
            background: 'var(--bg-glass-strong)',
            color: 'var(--accent)',
            border: '1px solid var(--border)',
          }}
        >
          {project.category}
        </span>

        {/* Title */}
        <h3
          className="mb-1 text-base font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          {project.title}
        </h3>

        {/* Year & Type */}
        <p
          className="font-mono text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          {project.year} · {project.type}
        </p>
      </div>
    </motion.article>
  );
}

