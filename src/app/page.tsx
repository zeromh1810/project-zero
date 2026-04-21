'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import type { ActiveSection } from '@/types';
import { mockProjects, mockAbout } from '@/data/mock';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import WorksSection from '@/components/sections/WorksSection';
import AboutSection from '@/components/sections/AboutSection';
import CVSection from '@/components/sections/CVSection';
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

const sectionVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.3 },
  },
};

export default function Home() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('works');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleNavigate = (section: ActiveSection) => {
    if (section === 'cv') {
      // CV tab just opens/downloads the PDF
      if (mockAbout.cv_url) {
        window.open(mockAbout.cv_url, '_blank');
      }
      return;
    }
    setActiveSection(section);
  };

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

      {/* Desktop Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        about={mockAbout}
      />

      {/* Mobile Navigation */}
      <MobileNav
        activeSection={activeSection}
        onNavigate={handleNavigate}
        about={mockAbout}
      />

      {/* Main Content */}
      <main
        className="relative z-10 min-h-screen transition-all duration-300"
        style={{
          marginLeft: '0',
          paddingTop: '60px',
          paddingBottom: '80px',
        }}
      >
        {/* Desktop: offset by sidebar width */}
        <div className="mx-auto max-w-5xl px-6 py-8 md:ml-[280px] md:px-10 md:py-12 md:pt-8">
          <AnimatePresence mode="wait">
            {activeSection === 'works' && (
              <motion.div
                key="works"
                variants={sectionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <WorksSection projects={mockProjects} />
              </motion.div>
            )}

            {activeSection === 'about' && (
              <motion.div
                key="about"
                variants={sectionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <AboutSection about={mockAbout} />
              </motion.div>
            )}

            {activeSection === 'cv' && (
              <motion.div
                key="cv"
                variants={sectionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <CVSection about={mockAbout} />
              </motion.div>
            )}

            {activeSection === 'contact' && (
              <motion.div
                key="contact"
                variants={sectionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <ContactSection about={mockAbout} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </ThemeProvider>
  );
}
