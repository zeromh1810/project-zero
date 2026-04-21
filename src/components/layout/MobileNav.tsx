'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, User, FileText, Mail, UserCircle, Sun, Moon } from 'lucide-react';
import type { ActiveSection, AboutData } from '@/types';
import { useTheme } from '@/components/providers/ThemeProvider';
import ProfileModal from './ProfileModal';

interface MobileNavProps {
  activeSection: ActiveSection;
  onNavigate: (section: ActiveSection) => void;
  about: AboutData;
}

const navItems: { id: ActiveSection; icon: typeof Briefcase; label: string }[] = [
  { id: 'works', icon: Briefcase, label: 'Trabajos' },
  { id: 'about', icon: User, label: 'Sobre mí' },
  { id: 'cv', icon: FileText, label: 'CV' },
  { id: 'contact', icon: Mail, label: 'Contacto' },
];

export default function MobileNav({
  activeSection,
  onNavigate,
  about,
}: MobileNavProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {/* Mobile Header Bar */}
      <header
        className="mobile-only fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-4 py-3"
        style={{
          background: 'var(--sidebar-bg)',
          borderBottom: '1px solid var(--border)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
            style={{
              border: '2px solid var(--accent)',
              color: 'var(--accent)',
              background: 'var(--bg-glass-strong)',
            }}
          >
            {about.full_name.split(' ').map((n) => n[0]).join('')}
          </div>
          <span className="font-display text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            {about.full_name.split(' ')[0]}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="rounded-full p-2 transition-colors"
            style={{ color: 'var(--text-muted)' }}
            aria-label={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button
            onClick={() => setIsProfileOpen(true)}
            className="rounded-full p-2 transition-colors"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Ver perfil"
          >
            <UserCircle size={20} />
          </button>
        </div>
      </header>

      {/* Bottom Navigation */}
      <nav
        className="mobile-only fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2"
        style={{
          background: 'var(--sidebar-bg)',
          borderTop: '1px solid var(--border)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
        role="navigation"
        aria-label="Navegación móvil"
      >
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="relative flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 transition-all duration-200"
              style={{
                color: isActive ? 'var(--accent)' : 'var(--text-muted)',
              }}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <motion.div
                  className="absolute -top-1 h-0.5 w-4 rounded-full"
                  style={{ background: 'var(--accent)' }}
                  layoutId="mobile-indicator"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <Icon size={20} />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        about={about}
        onNavigate={onNavigate}
      />
    </>
  );
}
