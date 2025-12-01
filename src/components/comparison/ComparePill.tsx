import { useState, useEffect } from 'react';
import { useComparison } from '@/contexts/ComparisonContext';
import { Button } from '@/components/ui/button';
import { X, ArrowRightLeft } from 'lucide-react';
import { ComparePanel } from './ComparePanel';
import { cn } from '@/lib/utils';

export function ComparePill() {
  const { selectedCards, clearAll } = useComparison();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (selectedCards.length > 0) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [selectedCards]);

  useEffect(() => {
    const handleOpen = () => setIsPanelOpen(true);
    window.addEventListener('openComparison', handleOpen);
    return () => window.removeEventListener('openComparison', handleOpen);
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Hide the visual pill on small screens; keep panel logic available for mobile triggers */}
      <div 
        className={cn(
          "hidden lg:block",
          // Desktop: dock to bottom-right
          "fixed right-8 bottom-8 z-[60] w-[340px]",
          isVisible ? "animate-slide-in-right" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl shadow-2xl px-4 py-3 backdrop-blur-md border border-primary/25">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs sm:text-sm font-semibold text-primary-foreground flex items-center gap-1.5 sm:gap-2">
              <ArrowRightLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Compare Cards</span>
              <span className="xs:hidden">Compare</span>
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={clearAll}
              className="h-6 w-6 sm:h-7 sm:w-7 p-0 hover:bg-white/20 text-primary-foreground touch-target"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
          </div>

          {/* Card Thumbnails */}
          <div className="flex gap-2 mb-3">
            {selectedCards.map((card, idx) => (
              <div 
                key={card.id || idx}
                className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-md sm:rounded-lg bg-white border-2 border-white/50 overflow-hidden flex items-center justify-center shadow-md"
              >
                <img 
                  src={card.card_bg_image || card.image || '/placeholder.svg'} 
                  alt={card.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              </div>
            ))}
          </div>

          {/* Compare Button */}
          <Button 
            size="sm"
            onClick={() => setIsPanelOpen(true)}
            className="mt-1 w-full bg-white hover:bg-white/90 text-primary font-semibold shadow-lg text-xs sm:text-sm h-9 rounded-xl"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            <span className="hidden xs:inline">Compare {selectedCards.length} Card{selectedCards.length > 1 ? 's' : ''}</span>
            <span className="xs:hidden">Compare ({selectedCards.length})</span>
          </Button>
        </div>
      </div>

      <ComparePanel 
        open={isPanelOpen}
        onOpenChange={setIsPanelOpen}
      />
    </>
  );
}
