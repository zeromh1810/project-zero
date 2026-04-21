'use client';

import { motion } from 'framer-motion';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  index: number;
  onClick: () => void;
}

export default function ProjectCard({ project, index, onClick }: ProjectCardProps) {
  return (
    <motion.article
      className="group cursor-pointer overflow-hidden rounded-xl transition-shadow duration-300"
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{
        scale: 1.02,
        boxShadow: 'var(--shadow-lg)',
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      data-cursor="view"
    >
      {/* Image */}
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: '16/10' }}
      >
        <div
          className="flex h-full w-full items-center justify-center font-mono text-sm transition-transform duration-500 group-hover:scale-105"
          style={{
            background: 'var(--bg-glass-strong)',
            color: 'var(--text-muted)',
          }}
        >
          <div className="flex flex-col items-center gap-2">
            <div
              className="h-12 w-12 rounded-lg"
              style={{
                background: `linear-gradient(135deg, var(--accent), var(--accent-warm))`,
                opacity: 0.3,
              }}
            />
            <span className="text-xs">{project.cover_url.split('/').pop()}</span>
          </div>
        </div>

        {/* Dark overlay that fades on hover */}
        <div
          className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-0"
          style={{
            background: 'linear-gradient(to top, var(--bg-primary) 0%, transparent 60%)',
            opacity: 0.3,
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
