'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';

const navLinks = [
  { href: '#trabajos', label: 'Trabajos' },
  { href: '#sobre-mi', label: 'Sobre mí' },
  { href: '#contacto', label: 'Contacto' },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const lastScrollY = typeof window !== 'undefined' ? { current: 0 } : { current: 0 };

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;

    // Show/hide navbar based on scroll direction
    if (currentScrollY > 80) {
      setIsVisible(currentScrollY < lastScrollY.current);
      setIsScrolled(true);
    } else {
      setIsVisible(true);
      setIsScrolled(false);
    }

    lastScrollY.current = currentScrollY;

    // Determine active section based on scroll position
    const sections = ['contacto', 'sobre-mi', 'trabajos'];
    for (const sectionId of sections) {
      const el = document.getElementById(sectionId);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 200) {
          setActiveSection(`#${sectionId}`);
          break;
        }
      }
    }

    if (currentScrollY < 300) {
      setActiveSection('');
    }
  }, [lastScrollY]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <motion.header
        className="fixed left-0 right-0 top-0 z-50 px-4 pt-4 md:px-6 md:pt-5"
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <nav
          className="navbar-glass mx-auto flex max-w-5xl items-center justify-between rounded-2xl px-5 py-3 md:px-8 md:py-4"
          style={{
            background: isScrolled
              ? 'var(--bg-glass-strong)'
              : 'transparent',
            backdropFilter: isScrolled ? 'blur(20px)' : 'none',
            WebkitBackdropFilter: isScrolled ? 'blur(20px)' : 'none',
            border: isScrolled
              ? '1px solid var(--border)'
              : '1px solid transparent',
            transition: 'all 0.4s var(--transition-smooth)',
          }}
          role="navigation"
          aria-label="Navegación principal"
        >
          {/* Logo / Monogram */}
          <a
            href="#"
            onClick={scrollToTop}
            className="group flex items-center gap-3"
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 group-hover:scale-110"
              style={{
                border: '2px solid var(--accent)',
                color: 'var(--accent)',
                background: 'var(--bg-glass)',
                boxShadow: '0 0 16px var(--glow)',
              }}
            >
              MR
            </div>
            <span
              className="hidden font-display text-sm font-bold md:block"
              style={{ color: 'var(--text-primary)' }}
            >
              Mateo Ríos
            </span>
          </a>

          {/* Desktop Nav Links */}
          <ul className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href;
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="relative rounded-lg px-4 py-2 font-mono text-xs font-medium transition-all duration-200"
                    style={{
                      color: isActive
                        ? 'var(--text-primary)'
                        : 'var(--text-muted)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive)
                        e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive)
                        e.currentTarget.style.color = 'var(--text-muted)';
                    }}
                  >
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-lg"
                        style={{ background: 'var(--bg-glass)' }}
                        layoutId="navbar-indicator"
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                    <span className="relative z-10">{link.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>

          {/* Right side: Theme toggle + Mobile menu */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200"
              style={{
                color: 'var(--text-muted)',
                border: '1px solid var(--border)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.color = 'var(--accent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
              aria-label={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
            >
              {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
            </button>

            {/* Hamburger button (mobile) */}
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full md:hidden"
              style={{
                color: 'var(--text-muted)',
                border: '1px solid var(--border)',
              }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Fullscreen Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 md:hidden"
            style={{
              background: 'var(--bg-primary)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {navLinks.map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="font-display text-3xl font-bold transition-colors duration-200"
                style={{ color: 'var(--text-primary)' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.1 }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--accent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
              >
                {link.label}
              </motion.a>
            ))}

            <motion.div
              className="mt-4 font-mono text-xs"
              style={{ color: 'var(--text-muted)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              © {new Date().getFullYear()} Mateo Ríos
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
