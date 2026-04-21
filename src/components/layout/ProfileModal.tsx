'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Link, Code, Mail, AtSign, ExternalLink } from 'lucide-react';
import type { AboutData, ActiveSection } from '@/types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  about: AboutData;
  onNavigate: (section: ActiveSection) => void;
}

export default function ProfileModal({
  isOpen,
  onClose,
  about,
  onNavigate,
}: ProfileModalProps) {
  const handleContact = () => {
    onNavigate('contact');
    onClose();
  };

  const socialIcons: Record<string, React.ReactNode> = {
    linkedin: <Link size={18} />,
    github: <Code size={18} />,
    email: <Mail size={18} />,
    twitter: <AtSign size={18} />,
    behance: <ExternalLink size={18} />,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-[100]"
            style={{
              background: 'var(--overlay)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed left-1/2 top-1/2 z-[101] w-[90vw] max-w-md rounded-2xl p-8"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-xl)',
              x: '-50%',
            }}
            initial={{ y: '40%', opacity: 0, scale: 0.95 }}
            animate={{ y: '-50%', opacity: 1, scale: 1 }}
            exit={{ y: '40%', opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-2 transition-colors duration-200"
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
              aria-label="Cerrar modal"
            >
              <X size={18} />
            </button>

            {/* Content */}
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <div
                className="mb-4 h-[120px] w-[120px] overflow-hidden rounded-full"
                style={{
                  border: '3px solid var(--accent)',
                  boxShadow: '0 0 20px var(--glow)',
                }}
              >
                <div
                  className="flex h-full w-full items-center justify-center text-3xl font-bold"
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
              </div>

              {/* Name & Role */}
              <h2
                className="mb-1 font-display text-xl font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                {about.full_name}
              </h2>
              <p
                className="mb-4 font-mono text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                {about.role_title}
              </p>

              {/* Bio */}
              <p
                className="mb-6 text-sm leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                {about.bio_short}
              </p>

              {/* Social Links */}
              <div className="mb-6 flex gap-3">
                {Object.entries(about.social_links).map(([key, url]) => {
                  if (!url) return null;
                  const href = key === 'email' ? `mailto:${url}` : url;
                  return (
                    <a
                      key={key}
                      href={href}
                      target={key !== 'email' ? '_blank' : undefined}
                      rel={key !== 'email' ? 'noopener noreferrer' : undefined}
                      className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200"
                      style={{
                        border: '1px solid var(--border)',
                        color: 'var(--text-muted)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent)';
                        e.currentTarget.style.color = 'var(--accent)';
                        e.currentTarget.style.boxShadow = '0 0 12px var(--glow)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.color = 'var(--text-muted)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      aria-label={key}
                    >
                      {socialIcons[key] || <ExternalLink size={18} />}
                    </a>
                  );
                })}
              </div>

              {/* Contact Button */}
              <button
                onClick={handleContact}
                className="w-full rounded-xl px-6 py-3 font-medium transition-all duration-200"
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
                Contactar
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
