'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Project } from '@/types';
import ProjectCard from '@/components/projects/ProjectCard';
import ProjectModal from '@/components/projects/ProjectModal';
import AnimatedText from '@/components/ui/AnimatedText';

interface WorksSectionProps {
  projects: Project[];
}

export default function WorksSection({ projects }: WorksSectionProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <section id="works-section" aria-label="Trabajos">
      {/* Header */}
      <div className="mb-8">
        <AnimatedText as="h2" className="font-display text-3xl font-bold md:text-4xl">
          Trabajos
        </AnimatedText>
        <motion.p
          className="mt-2 font-mono text-sm"
          style={{ color: 'var(--text-muted)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Proyectos seleccionados — {new Date().getFullYear()}
        </motion.p>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {projects
          .filter((p) => p.published)
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              onClick={() => setSelectedProject(project)}
            />
          ))}
      </div>

      {/* Project Modal */}
      <ProjectModal
        project={selectedProject}
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
}
