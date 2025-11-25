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
        "group flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 text-xs font-medium shadow-md hover:shadow-lg",
        selected 
          ? "bg-primary text-primary-foreground" 
          : "bg-card text-foreground border border-border hover:border-primary hover:bg-primary/10",
        className
      )}
      aria-label={selected ? "Remove from comparison" : "Add to comparison"}
    >
      {selected ? (
        <>
          <Check className="w-3.5 h-3.5" />
          <span>Added</span>
        </>
      ) : (
        <>
          <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-200" />
          <span>Compare</span>
        </>
      )}
    </button>
  );
}
