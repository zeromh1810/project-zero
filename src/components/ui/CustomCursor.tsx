'use client';

import { useEffect, useRef, useState } from 'react';
import { useMousePosition } from '@/hooks/useMousePosition';
import { useIsMobile } from '@/hooks/useMediaQuery';

export default function CustomCursor() {
  const { x, y } = useMousePosition();
  const isMobile = useIsMobile();
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [cursorText, setCursorText] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isMobile) return;

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    const interactiveElements = document.querySelectorAll(
      'a, button, [role="button"], [data-cursor="pointer"]'
    );
    const projectCards = document.querySelectorAll('[data-cursor="view"]');

    const onEnterInteractive = () => {
      setIsHovering(true);
      setCursorText('');
    };
    const onLeaveInteractive = () => {
      setIsHovering(false);
      setCursorText('');
    };
    const onEnterProject = () => {
      setIsHovering(true);
      setCursorText('VER');
    };

    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', onEnterInteractive);
      el.addEventListener('mouseleave', onLeaveInteractive);
    });

    projectCards.forEach((el) => {
      el.addEventListener('mouseenter', onEnterProject);
      el.addEventListener('mouseleave', onLeaveInteractive);
    });

    return () => {
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      interactiveElements.forEach((el) => {
        el.removeEventListener('mouseenter', onEnterInteractive);
        el.removeEventListener('mouseleave', onLeaveInteractive);
      });
      projectCards.forEach((el) => {
        el.removeEventListener('mouseenter', onEnterProject);
        el.removeEventListener('mouseleave', onLeaveInteractive);
      });
    };
  }, [isMobile]);

  if (isMobile) return null;

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed z-[9998] mix-blend-difference"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        opacity: isVisible ? 1 : 0,
        transition: 'width 0.3s ease, height 0.3s ease, opacity 0.3s ease',
        width: isHovering ? '48px' : '12px',
        height: isHovering ? '48px' : '12px',
      }}
    >
      <div
        className="flex h-full w-full items-center justify-center rounded-full"
        style={{
          background: 'var(--accent)',
          opacity: isHovering ? 0.9 : 0.7,
          transition: 'opacity 0.3s ease',
        }}
      >
        {cursorText && (
          <span
            className="font-mono text-[10px] font-bold"
            style={{ color: 'var(--bg-primary)' }}
          >
            {cursorText}
          </span>
        )}
      </div>
    </div>
  );
}
