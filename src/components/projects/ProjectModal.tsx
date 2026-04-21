'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, X, ArrowLeft, ChevronRight } from 'lucide-react';
import type { Project } from '@/types';

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectModal({
  project,
  isOpen,
  onClose,
}: ProjectModalProps) {
  const [activeImage, setActiveImage] = useState(0);

  if (!project) return null;

  const allImages = [project.cover_url, ...project.image_urls];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-[100]"
            style={{
              background: 'var(--overlay)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed right-0 top-0 z-[101] h-full w-full max-w-2xl overflow-y-auto"
            style={{
              background: 'var(--bg-secondary)',
              borderLeft: '1px solid var(--border)',
              boxShadow: 'var(--shadow-xl)',
            }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
            }}
            tabIndex={-1}
            role="dialog"
            aria-label={`Proyecto: ${project.title}`}
          >
            {/* Header */}
            <div
              className="sticky top-0 z-10 flex items-center justify-between p-6"
              style={{
                background: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <button
                onClick={onClose}
                className="flex items-center gap-2 text-sm transition-colors duration-200"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = 'var(--text-primary)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = 'var(--text-muted)')
                }
              >
                <ArrowLeft size={16} />
                Volver
              </button>

              <button
                onClick={onClose}
                className="rounded-full p-2 transition-colors duration-200"
                style={{
                  color: 'var(--text-muted)',
                  background: 'var(--bg-glass)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.background = 'var(--bg-glass-strong)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.background = 'var(--bg-glass)';
                }}
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Category & Year */}
              <div className="mb-3 flex items-center gap-3">
                <span className="tag-pill" style={{ background: 'var(--bg-glass-strong)' }}>
                  {project.category}
                </span>
                <span
                  className="font-mono text-xs"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {project.year} · {project.type}
                </span>
              </div>

              {/* Title */}
              <h2
                className="mb-6 font-display text-2xl font-bold md:text-3xl"
                style={{ color: 'var(--text-primary)' }}
              >
                {project.title}
              </h2>

              {/* Hero Image */}
              <motion.div
                className="mb-6 overflow-hidden rounded-xl"
                style={{
                  aspectRatio: '16/10',
                  background: 'var(--bg-glass)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div
                  className="flex h-full w-full items-center justify-center font-mono text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {allImages[activeImage]?.split('/').pop() || 'Image'}
                </div>
              </motion.div>

              {/* Image thumbnails */}
              {allImages.length > 1 && (
                <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className="h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg transition-all duration-200"
                      style={{
                        border:
                          i === activeImage
                            ? '2px solid var(--accent)'
                            : '1px solid var(--border)',
                        background: 'var(--bg-glass)',
                        opacity: i === activeImage ? 1 : 0.6,
                      }}
                    >
                      <div
                        className="flex h-full w-full items-center justify-center font-mono text-[10px]"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {i + 1}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Description */}
              <div className="mb-8">
                <h3
                  className="mb-3 text-sm font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Descripción
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {project.description}
                </p>
              </div>

              {/* Tags */}
              <div className="mb-8">
                <h3
                  className="mb-3 text-sm font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Tecnologías
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span key={tag} className="tag-pill">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Link */}
              {project.project_url && (
                <a
                  href={project.project_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition-all duration-200"
                  style={{
                    background: 'var(--accent)',
                    color: 'var(--bg-primary)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--accent-hover)';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--accent)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Ver sitio
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
