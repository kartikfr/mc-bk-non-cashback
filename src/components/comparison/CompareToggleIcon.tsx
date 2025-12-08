import { Plus, Check } from 'lucide-react';
import { useComparison } from '@/contexts/ComparisonContext';
import { cn } from '@/lib/utils';
import { getCardKey } from '@/utils/cardAlias';

interface CompareToggleIconProps {
  card: any;
  className?: string;
}

export function CompareToggleIcon({ card, className }: CompareToggleIconProps) {
  const { toggleCard, isSelected } = useComparison();
  const cardId = getCardKey(card);
  const selected = isSelected(cardId);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleCard(card);
      }}
      className={cn(
        "group flex items-center gap-0.5 sm:gap-1 md:gap-1.5 px-1 py-0.5 sm:px-1.5 sm:py-0.5 md:px-2.5 md:py-1 rounded-md md:rounded-lg transition-all duration-200 text-[8px] sm:text-[9px] md:text-xs font-medium shadow-sm md:shadow-md hover:shadow-md md:hover:shadow-lg",
        selected 
          ? "bg-primary text-primary-foreground" 
          : "bg-card text-foreground border border-border hover:border-primary hover:bg-primary/10",
        className
      )}
      aria-label={selected ? "Remove from comparison" : "Add to comparison"}
    >
      {selected ? (
        <>
          <Check className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3" />
          <span>Added</span>
        </>
      ) : (
        <>
          <Plus className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 group-hover:rotate-90 transition-transform duration-200" />
          <span>Compare</span>
        </>
      )}
    </button>
  );
}
