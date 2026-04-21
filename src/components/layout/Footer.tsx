'use client';

import { motion } from 'framer-motion';
import { Link, Code, Mail, AtSign, ExternalLink, Download } from 'lucide-react';
import type { AboutData } from '@/types';

interface FooterProps {
  about: AboutData;
}

const socialIcons: Record<string, React.ReactNode> = {
  linkedin: <Link size={16} />,
  github: <Code size={16} />,
  email: <Mail size={16} />,
  twitter: <AtSign size={16} />,
  behance: <ExternalLink size={16} />,
};

const socialLabels: Record<string, string> = {
  linkedin: 'LinkedIn',
  github: 'GitHub',
  email: 'Email',
  twitter: 'Twitter',
  behance: 'Behance',
};

export default function Footer({ about }: FooterProps) {
  return (
    <footer
      className="relative z-10 border-t px-6 py-12 md:py-16"
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-8">
        {/* Monogram */}
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full font-display text-sm font-bold"
          style={{
            border: '2px solid var(--accent)',
            color: 'var(--accent)',
            background: 'var(--bg-glass)',
          }}
        >
          MR
        </div>

        {/* Social Links */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {Object.entries(about.social_links).map(([key, url]) => {
            if (!url) return null;
            const href = key === 'email' ? `mailto:${url}` : url;
            return (
              <a
                key={key}
                href={href}
                target={key !== 'email' ? '_blank' : undefined}
                rel={key !== 'email' ? 'noopener noreferrer' : undefined}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200"
                style={{
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.color = 'var(--accent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                {socialIcons[key] || <ExternalLink size={16} />}
                {socialLabels[key] || key}
              </a>
            );
          })}
        </div>

        {/* CV Download */}
        {about.cv_url && (
          <a
            href={about.cv_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-medium transition-all duration-300"
            style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.color = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <Download size={14} />
            Descargar CV
          </a>
        )}

        {/* Separator */}
        <div
          className="h-px w-16"
          style={{ background: 'var(--border)' }}
        />

        {/* Copyright */}
        <p
          className="font-mono text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          © {new Date().getFullYear()} {about.full_name}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
