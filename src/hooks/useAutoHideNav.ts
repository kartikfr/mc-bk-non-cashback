import { useState, useEffect, useRef } from 'react';

interface UseAutoHideNavOptions {
  /**
   * Minimum scroll distance (in pixels) to trigger hide/show
   * @default 10
   */
  threshold?: number;
  
  /**
   * Animation duration in milliseconds
   * @default 300
   */
  duration?: number;
  
  /**
   * Enable compact mode (smaller padding when scrolling)
   * @default false
   */
  compactMode?: boolean;
}

export const useAutoHideNav = (options: UseAutoHideNavOptions = {}) => {
  const {
    threshold = 10,
    duration = 300,
    compactMode = false
  } = options;

  const [isVisible, setIsVisible] = useState(true);
  const [isCompact, setIsCompact] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // Keep nav always visible if user prefers reduced motion
      setIsVisible(true);
      return;
    }

    const updateNavVisibility = () => {
      const currentScrollY = window.scrollY;
      
      // At top of page, always show nav
      if (currentScrollY < 10) {
        setIsVisible(true);
        setIsCompact(false);
        lastScrollY.current = currentScrollY;
        ticking.current = false;
        return;
      }

      // Check if scroll difference exceeds threshold
      const scrollDifference = currentScrollY - lastScrollY.current;
      
      if (Math.abs(scrollDifference) < threshold) {
        ticking.current = false;
        return;
      }

      // Scrolling down - hide nav
      if (scrollDifference > 0) {
        setIsVisible(false);
        if (compactMode) setIsCompact(true);
      } 
      // Scrolling up - show nav
      else {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
      ticking.current = false;
    };

    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateNavVisibility);
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold, compactMode]);

  return {
    isVisible,
    isCompact,
    style: {
      transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
      transition: `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    }
  };
};
