'use client';

import { motion } from 'framer-motion';
import { ReactNode, CSSProperties } from 'react';

interface AnimatedTextProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
  style?: CSSProperties;
}

export default function AnimatedText({
  children,
  className = '',
  delay = 0,
  as: Tag = 'div',
  style,
}: AnimatedTextProps) {
  const MotionTag = motion.create(Tag);

  return (
    <MotionTag
      className={className}
      style={{ color: 'var(--text-primary)', ...style }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </MotionTag>
  );
}

interface StaggerTextProps {
  text: string;
  className?: string;
  staggerDelay?: number;
  startDelay?: number;
  style?: CSSProperties;
}

export function StaggerText({
  text,
  className = '',
  staggerDelay = 0.08,
  startDelay = 0,
  style,
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
      style={style}
    >
      {lines.map((line, i) => (
        <motion.span
          key={i}
          className="block"
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
              },
            },
          }}
        >
          {line}
        </motion.span>
      ))}
    </motion.div>
  );
}
