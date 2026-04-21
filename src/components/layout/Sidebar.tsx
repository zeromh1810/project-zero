'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  User,
  FileText,
  Mail,
  UserCircle,
  Sun,
  Moon,
} from 'lucide-react';
import type { ActiveSection, AboutData } from '@/types';
import { useTheme } from '@/components/providers/ThemeProvider';
import ProfileModal from './ProfileModal';

interface SidebarProps {
  activeSection: ActiveSection;
  onNavigate: (section: ActiveSection) => void;
  about: AboutData;
}

const navItems: { id: ActiveSection; label: string; icon: typeof Briefcase }[] = [
  { id: 'works', label: 'Trabajos', icon: Briefcase },
  { id: 'about', label: 'Sobre mí', icon: User },
  { id: 'cv', label: 'CV', icon: FileText },
  { id: 'contact', label: 'Contacto', icon: Mail },
];

export default function Sidebar({ activeSection, onNavigate, about }: SidebarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <aside
        className="desktop-only fixed left-0 top-0 z-50 flex h-screen w-[280px] flex-col"
        style={{
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--border)',
        }}
      >
        {/* Identity Section */}
        <div className="p-6 pb-4">
          {/* Avatar */}
          <div
            className="mb-3 h-16 w-16 overflow-hidden rounded-full"
            style={{
              border: '2px solid var(--accent)',
              boxShadow: '0 0 16px var(--glow)',
            }}
          >
            <div
              className="flex h-full w-full items-center justify-center text-lg font-bold"
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

          {/* Name */}
          <h1
            className="font-display text-lg font-bold leading-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            {about.full_name}
          </h1>

          {/* Role */}
          <p
            className="mt-0.5 font-mono text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            {about.role_title}
          </p>
        </div>

        {/* Separator */}
        <div className="mx-6 h-px" style={{ background: 'var(--border)' }} />

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4" role="navigation" aria-label="Navegación principal">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              const Icon = item.icon;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className="group relative flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200"
                    style={{
                      color: isActive
                        ? 'var(--text-primary)'
                        : 'var(--text-muted)',
                      background: isActive
                        ? 'var(--bg-glass)'
                        : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'var(--bg-glass)';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-muted)';
                      }
                    }}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        className="absolute left-0 top-1/2 h-5 w-[3px] rounded-r-full"
                        layoutId="sidebar-indicator"
                        initial={false}
                        transition={{
                          type: 'spring',
                          stiffness: 500,
                          damping: 30,
                        }}
                        style={{
                          background: 'var(--accent)',
                          y: '-50%',
                        }}
                      />
                    )}

                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom section */}
        <div className="p-4">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-all duration-200"
            style={{
              color: 'var(--text-muted)',
              border: '1px solid var(--border)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
            aria-label={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
          >
            {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            <span>{theme === 'light' ? 'Modo oscuro' : 'Modo claro'}</span>
          </button>

          {/* Profile button */}
          <button
            onClick={() => setIsProfileOpen(true)}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-200"
            style={{
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 0 12px var(--glow)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <UserCircle size={20} />
            <span className="font-medium">Profile</span>
          </button>
        </div>
      </aside>

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        about={about}
        onNavigate={onNavigate}
      />
    </>
  );
}
