'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedTextProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
}

const lineVariants = {
  hidden: { y: '100%', opacity: 0 },
  visible: {
    y: '0%',
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function AnimatedText({
  children,
  className = '',
  delay = 0,
  as: Tag = 'div',
}: AnimatedTextProps) {
  const MotionTag = motion.create(Tag);

  return (
    <span className="text-reveal-line inline-block">
      <MotionTag
        className={className}
        variants={lineVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay }}
      >
        {children}
      </MotionTag>
    </span>
  );
}

interface StaggerTextProps {
  text: string;
  className?: string;
  staggerDelay?: number;
  startDelay?: number;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const wordVariants = {
  hidden: { y: '100%', opacity: 0 },
  visible: {
    y: '0%',
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export function StaggerText({
  text,
  className = '',
  staggerDelay = 0.08,
  startDelay = 0,
}: StaggerTextProps) {
  const lines = text.split('\n');

  return (
    <motion.div
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: startDelay,
          },
        },
      }}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {lines.map((line, i) => (
        <span key={i} className="text-reveal-line block">
          <motion.span className="inline-block" variants={wordVariants}>
            {line}
          </motion.span>
        </span>
      ))}
    </motion.div>
  );
}
