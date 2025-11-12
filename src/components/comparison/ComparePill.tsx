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
      <div 
        className={cn(
          "fixed bottom-6 right-6 z-40",
          "md:bottom-8 md:right-8",
          isVisible ? "animate-slide-in-right" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl shadow-2xl p-4 backdrop-blur-md border-2 border-primary/20">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-primary-foreground flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4" />
              Compare Cards
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={clearAll}
              className="w-6 h-6 p-0 hover:bg-white/20 text-primary-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Card Thumbnails */}
          <div className="flex gap-2 mb-3">
            {selectedCards.map((card, idx) => (
              <div 
                key={card.id || idx}
                className="relative w-16 h-16 rounded-lg bg-white border-2 border-white/50 overflow-hidden flex items-center justify-center shadow-md"
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
            size="default"
            onClick={() => setIsPanelOpen(true)}
            className="w-full bg-white hover:bg-white/90 text-primary font-semibold shadow-lg"
          >
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            Compare {selectedCards.length} Card{selectedCards.length > 1 ? 's' : ''}
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
