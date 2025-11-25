import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { getCardKey } from '@/utils/cardAlias';

interface ComparisonContextType {
  selectedCards: any[];
  maxCompare: number;
  toggleCard: (card: any) => void;
  removeCard: (cardId: string) => void;
  clearAll: () => void;
  isSelected: (cardId: string) => boolean;
  canAddMore: boolean;
  startComparisonWith: (card: any) => void;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export function ComparisonProvider({ children, maxCompare = 2 }: { children: ReactNode; maxCompare?: number }) {
  const [selectedCards, setSelectedCards] = useState<any[]>(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('selectedCards');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist to localStorage whenever selection changes
  useEffect(() => {
    localStorage.setItem('selectedCards', JSON.stringify(selectedCards));
  }, [selectedCards]);

  const toggleCard = (card: any) => {
    const cardId = getCardKey(card);
    
    if (isSelected(cardId)) {
      // Remove card
      setSelectedCards(prev => prev.filter(c => {
        const cId = getCardKey(c);
        return cId !== cardId;
      }));
      toast.success('Removed from comparison', {
        description: card.name,
        position: 'top-right'
      });
    } else {
      // Add card
      if (selectedCards.length >= maxCompare) {
        toast.error(`Maximum ${maxCompare} cards allowed`, {
          description: 'Remove one to add another',
          position: 'top-right',
          action: selectedCards.length === 2 ? {
            label: 'Compare Now',
            onClick: () => {
              const event = new CustomEvent('openComparison');
              window.dispatchEvent(event);
            }
          } : undefined
        });
        return;
      }
      
      setSelectedCards(prev => [...prev, card]);
      toast.success('Added to comparison', {
        description: `${selectedCards.length + 1} of ${maxCompare} cards selected`,
        position: 'top-right'
      });
    }
  };

  const removeCard = (cardId: string) => {
    setSelectedCards(prev => prev.filter(c => {
      const cId = getCardKey(c);
      return cId !== cardId;
    }));
  };

  const clearAll = () => {
    setSelectedCards([]);
    toast.info('Comparison cleared', {
      position: 'top-right'
    });
  };

  const isSelected = (cardId: string) => {
    return selectedCards.some(c => {
      const cId = getCardKey(c);
      return cId === cardId;
    });
  };

  const canAddMore = selectedCards.length < maxCompare;

  const startComparisonWith = (card: any) => {
    // Clear all existing selections and add this card as the first selection
    setSelectedCards([card]);
    toast.success('Comparison started', {
      description: `${card.name} selected. Add ${maxCompare - 1} more card${maxCompare > 2 ? 's' : ''} to compare.`,
      position: 'top-right'
    });
  };

  return (
    <ComparisonContext.Provider value={{
      selectedCards,
      maxCompare,
      toggleCard,
      removeCard,
      clearAll,
      isSelected,
      canAddMore,
      startComparisonWith
    }}>
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (context === undefined) {
    throw new Error('useComparison must be used within ComparisonProvider');
  }
  return context;
}

// Also export the context itself for debugging
export { ComparisonContext };
