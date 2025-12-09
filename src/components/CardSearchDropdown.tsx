import { useState, useEffect, useRef } from "react";
import { Search, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
interface Card {
  id: number;
  name: string;
  seo_card_alias: string;
  image: string;
  banks?: {
    name: string;
  };
}
interface CardSearchDropdownProps {
  cards: Card[];
  selectedCard: Card | null;
  onCardSelect: (card: Card) => void;
  onClearSelection: () => void;
  isLoading?: boolean;
  placeholder?: string;
}
export const CardSearchDropdown = ({
  cards,
  selectedCard,
  onCardSelect,
  onClearSelection,
  isLoading = false,
  placeholder = "Search for your card..."
}: CardSearchDropdownProps) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter cards based on debounced query
  const filteredCards = debouncedQuery.trim() ? cards.filter(card => card.name.toLowerCase().includes(debouncedQuery.toLowerCase()) || (card.banks?.name || '').toLowerCase().includes(debouncedQuery.toLowerCase())) : cards.slice(0, 10);

  // Reset highlighted index when filtered results change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredCards.length]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(prev => prev < filteredCards.length - 1 ? prev + 1 : prev);
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case "Enter":
        e.preventDefault();
        if (filteredCards[highlightedIndex]) {
          handleCardSelect(filteredCards[highlightedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };
  const handleCardSelect = (card: Card) => {
    onCardSelect(card);
    setIsOpen(false);
    setQuery("");
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return <div className="relative w-full" ref={dropdownRef}>
      {selectedCard ? <div className="flex items-center gap-3 p-4 sm:p-5 bg-card border-2 border-primary rounded-xl shadow-sm">
          <img src={selectedCard.image} alt={selectedCard.name} className="w-16 h-10 sm:w-20 sm:h-12 object-contain flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">{selectedCard.name}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{selectedCard.banks?.name || 'Credit Card'}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Check className="w-5 h-5 text-primary" />
            <Button variant="outline" size="sm" onClick={onClearSelection} className="text-xs sm:text-sm">
              <X className="w-4 h-4 mr-1" />
              Change
            </Button>
          </div>
        </div> : <>
          <div className="relative">
            <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground z-10" />
            <Input 
              ref={inputRef} 
              type="text" 
              placeholder={placeholder} 
              value={query} 
              onChange={e => setQuery(e.target.value)} 
              onFocus={() => setIsOpen(true)} 
              onKeyDown={handleKeyDown} 
              disabled={isLoading} 
              className="pl-11 sm:pl-14 pr-4 sm:pr-5 h-12 sm:h-14 text-sm sm:text-base border-2 border-border focus:border-primary rounded-xl shadow-sm hover:shadow-md transition-all duration-200 bg-background placeholder:text-muted-foreground/70" 
            />
          </div>

          {isOpen && <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-lg shadow-lg max-h-80 overflow-y-auto">
              {isLoading ? <div className="p-4 text-center text-muted-foreground">
                  Loading cards...
                </div> : filteredCards.length === 0 ? <div className="p-4 text-center text-muted-foreground">
                  No cards found matching "{debouncedQuery}"
                </div> : filteredCards.map((card, index) => <button key={card.id} onClick={() => handleCardSelect(card)} onMouseEnter={() => setHighlightedIndex(index)} className={`w-full flex items-center gap-4 p-4 text-left hover:bg-muted/50 transition-colors ${index === highlightedIndex ? "bg-muted/50" : ""} ${index === filteredCards.length - 1 ? "" : "border-b border-border"}`}>
                    <img src={card.image} alt={card.name} className="w-16 h-10 object-contain" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{card.name}</h3>
                      <p className="text-sm text-muted-foreground">{card.banks?.name || 'Credit Card'}</p>
                    </div>
                  </button>)}
            </div>}
        </>}
    </div>;
};