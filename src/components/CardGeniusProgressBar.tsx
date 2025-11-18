import { useEffect, useState, useRef } from "react";
import { Progress } from "@/components/ui/progress";
import { ChevronDown } from "lucide-react";

interface CardGeniusProgressBarProps {
  currentStep: number;
  totalSteps: number;
  questionRefs: React.RefObject<(HTMLDivElement | null)[]>;
  isScrolling?: boolean;
}

export const CardGeniusProgressBar = ({
  currentStep,
  totalSteps,
  questionRefs,
  isScrolling = false
}: CardGeniusProgressBarProps) => {
  const [activeQuestion, setActiveQuestion] = useState(currentStep);
  const [isCompact, setIsCompact] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Compact mode when scrolling down past 100px
      if (currentScrollY > 100) {
        setIsCompact(true);
      } else {
        setIsCompact(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    // Keep progress in sync with controlled step changes
    setActiveQuestion(currentStep);

    const observers: IntersectionObserver[] = [];
    
    if (questionRefs.current && questionRefs.current.length > 0) {
      questionRefs.current.forEach((ref, index) => {
        if (!ref) return;
        
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                setActiveQuestion(index);
              }
            });
          },
          {
            threshold: [0, 0.5, 1],
            rootMargin: "-20% 0px -50% 0px"
          }
        );
        
        observer.observe(ref);
        observers.push(observer);
      });
    }

    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, [questionRefs, currentStep]);

  const progress = ((activeQuestion + 1) / totalSteps) * 100;

  return (
    <div 
      className={`sticky top-0 z-50 bg-background/98 backdrop-blur-md border-b border-border transition-all duration-300 ${
        isCompact ? 'py-2' : 'py-4'
      }`}
      style={{ 
        boxShadow: isCompact ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4">
          {/* Question counter */}
          <div className={`transition-all duration-300 ${
            isCompact 
              ? 'text-xs md:text-sm font-medium' 
              : 'text-sm md:text-base font-semibold'
          }`}>
            <span className="hidden sm:inline text-muted-foreground">Question </span>
            <span className="text-primary">{activeQuestion + 1}</span>
            <span className="text-muted-foreground"> of {totalSteps}</span>
          </div>

          {/* Progress bar */}
          <div className="flex-1">
            <Progress value={progress} className="h-2" />
          </div>

          {/* Percentage */}
          <div className={`transition-all duration-300 ${
            isCompact 
              ? 'text-xs md:text-sm font-medium' 
              : 'text-sm md:text-base font-semibold'
          } text-muted-foreground min-w-[3rem] text-right`}>
            {Math.round(progress)}%
          </div>

          {/* Scroll indicator - only show when not compact */}
          {!isCompact && (
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground animate-fade-in">
              <span>Scroll</span>
              <ChevronDown className="w-4 h-4 animate-bounce" />
            </div>
          )}
        </div>

        {/* Mobile compact pill */}
        {isCompact && (
          <div className="md:hidden mt-1 text-[10px] text-muted-foreground text-center animate-fade-in">
            Scroll to navigate questions
          </div>
        )}
      </div>
    </div>
  );
};
