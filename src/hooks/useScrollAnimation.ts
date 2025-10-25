'use client';

import { useEffect, useRef, useState } from 'react';

export const useScrollAnimation = (threshold = 0.1) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Safety check for SSR
    if (typeof window === 'undefined') {
      setIsVisible(true);
      return;
    }

    // Fallback: set visible after short delay if IntersectionObserver fails
    const fallbackTimer = setTimeout(() => {
      if (!isVisible) {
        console.log('[ScrollAnimation] Fallback: Setting visible after timeout');
        setIsVisible(true);
      }
    }, 500);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Optionally unobserve after first intersection
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      {
        threshold,
        rootMargin: '50px',
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    } else {
      // If no ref, just show it
      setIsVisible(true);
    }

    return () => {
      clearTimeout(fallbackTimer);
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, isVisible]);

  return { ref, isVisible };
};