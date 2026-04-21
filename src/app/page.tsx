'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { mockProjects, mockAbout } from '@/data/mock';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/sections/HeroSection';
import WorksSection from '@/components/sections/WorksSection';
import AboutSection from '@/components/sections/AboutSection';
import ContactSection from '@/components/sections/ContactSection';

// Dynamic imports for heavy components
const ParticleBackground = dynamic(
  () => import('@/components/ui/ParticleBackground'),
  { ssr: false }
);
const CustomCursor = dynamic(
  () => import('@/components/ui/CustomCursor'),
  { ssr: false }
);

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider>
      {/* Loader */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="loader-container"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="flex flex-col items-center gap-3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div
                className="font-display text-2xl font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                {mockAbout.full_name}
              </div>
              <div className="flex items-center gap-2">
                <motion.div
                  className="h-1 w-8 rounded-full"
                  style={{ background: 'var(--accent)' }}
                  animate={{ scaleX: [0, 1] }}
                  transition={{
                    duration: 0.8,
                    delay: 0.3,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />
                <span
                  className="font-mono text-xs"
                  style={{ color: 'var(--text-muted)' }}
                >
                  portfolio
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background */}
      <ParticleBackground />
      <div className="mesh-gradient" />

      {/* Custom Cursor */}
      <CustomCursor />

      {/* Navbar */}
      <Navbar />

      {/* Main Content — Landing Page Scroll */}
      <main>
        <HeroSection about={mockAbout} />

        {/* Section divider */}
        <div className="mx-auto max-w-5xl px-6">
          <div className="h-px" style={{ background: 'var(--border)' }} />
        </div>

        <WorksSection projects={mockProjects} />

        {/* Section divider */}
        <div className="mx-auto max-w-5xl px-6">
          <div className="h-px" style={{ background: 'var(--border)' }} />
        </div>

        <AboutSection about={mockAbout} />

        {/* Section divider */}
        <div className="mx-auto max-w-5xl px-6">
          <div className="h-px" style={{ background: 'var(--border)' }} />
        </div>

        <ContactSection about={mockAbout} />
      </main>

      {/* Footer */}
      <Footer about={mockAbout} />
    </ThemeProvider>
  );
}
