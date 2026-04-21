'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, ExternalLink, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import type { AboutData } from '@/types';

interface CVSectionProps {
  about: AboutData;
}

export default function CVSection({ about }: CVSectionProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleOpenCV = () => {
    setIsDownloading(true);
    if (about.cv_url) {
      window.open(about.cv_url, '_blank');
      toast.success('Abriendo CV en nueva pestaña ↗', {
        style: {
          background: 'var(--toast-bg)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)',
        },
      });
    } else {
      toast.error('CV no disponible aún', {
        style: {
          background: 'var(--toast-bg)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)',
        },
      });
    }
    setTimeout(() => setIsDownloading(false), 1000);
  };

  return (
    <section id="cv-section" aria-label="Curriculum Vitae">
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        {/* Icon */}
        <motion.div
          className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl"
          style={{
            background: 'var(--bg-glass-strong)',
            border: '1px solid var(--border)',
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            animate={
              isDownloading
                ? { y: [0, 5, -2, 3, 0] }
                : {}
            }
            transition={{ duration: 0.5 }}
          >
            <FileText size={40} style={{ color: 'var(--accent)' }} />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h2
          className="mb-2 font-display text-2xl font-bold md:text-3xl"
          style={{ color: 'var(--text-primary)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Curriculum Vitae
        </motion.h2>

        <motion.p
          className="mb-8 max-w-md text-sm"
          style={{ color: 'var(--text-muted)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Descarga o visualiza mi CV completo con mi experiencia profesional,
          educación y proyectos destacados.
        </motion.p>

        {/* Action buttons */}
        <motion.div
          className="flex flex-col gap-3 sm:flex-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <button
            onClick={handleOpenCV}
            className="group inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-medium transition-all duration-200"
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
            <ExternalLink size={16} />
            Abrir CV
          </button>

          <a
            href={about.cv_url || '#'}
            download
            className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-medium transition-all duration-200"
            style={{
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <Download size={16} />
            Descargar PDF
          </a>
        </motion.div>
      </div>
    </section>
  );
}
