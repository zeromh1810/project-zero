'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Project } from '@/types';
import ProjectCard from '@/components/projects/ProjectCard';
import ProjectModal from '@/components/projects/ProjectModal';

interface WorksSectionProps {
  projects: Project[];
}

export default function WorksSection({ projects }: WorksSectionProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <section
      id="trabajos"
      className="relative z-10 px-6 py-24 md:py-32"
      aria-label="Trabajos"
    >
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-12 md:mb-16">
          <motion.h2
            className="font-display text-3xl font-bold md:text-5xl"
            style={{ color: 'var(--text-primary)' }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            Trabajos
          </motion.h2>
          <motion.p
            className="mt-3 font-mono text-sm"
            style={{ color: 'var(--text-muted)' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Proyectos seleccionados — {new Date().getFullYear()}
          </motion.p>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          {projects
            .filter((p) => p.published)
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.15,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <ProjectCard
                  project={project}
                  index={index}
                  onClick={() => setSelectedProject(project)}
                />
              </motion.div>
            ))}
        </div>

        {/* Project Modal */}
        <ProjectModal
          project={selectedProject}
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      </div>
    </section>
  );
}
