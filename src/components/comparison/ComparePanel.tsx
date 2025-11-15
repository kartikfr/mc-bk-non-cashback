import { useState, useEffect } from 'react';
import { useComparison } from '@/contexts/ComparisonContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  X, 
  Star, 
  ExternalLink, 
  Trophy,
  ChevronDown,
  ChevronUp,
  Search,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { sanitizeHtml } from '@/lib/sanitize';
import { openRedirectInterstitial, extractBankName, extractBankLogo } from '@/utils/redirectHandler';
import { cardService } from '@/services/cardService';
import { useDebounce } from '@/hooks/useDebounce';

interface ComparePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preSelectedCard?: any;
}

export function ComparePanel({ open, onOpenChange, preSelectedCard }: ComparePanelProps) {
  const { selectedCards, removeCard, toggleCard, maxCompare, isSelected } = useComparison();
  const [showDifferencesOnly, setShowDifferencesOnly] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['summary']));
  const [searchQueries, setSearchQueries] = useState<string[]>(['', '', '']);
  const [searchResults, setSearchResults] = useState<any[][]>([[], [], []]);
  const [isSearching, setIsSearching] = useState<boolean[]>([false, false, false]);
  
  // Debounce each search query
  const debouncedQuery0 = useDebounce(searchQueries[0], 300);
  const debouncedQuery1 = useDebounce(searchQueries[1], 300);
  const debouncedQuery2 = useDebounce(searchQueries[2], 300);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  // Fetch all cards once when dialog opens
  const [allCards, setAllCards] = useState<any[]>([]);
  const [isLoadingCards, setIsLoadingCards] = useState(false);

  useEffect(() => {
    if (!open || allCards.length > 0) return;
    
    console.log('Fetching cards for comparison...');
    setIsLoadingCards(true);
    
    cardService.getCardListing({
      slug: '',
      banks_ids: [],
      card_networks: [],
      annualFees: '',
      credit_score: '',
      sort_by: '',
      free_cards: '',
      eligiblityPayload: {},
      cardGeniusPayload: []
    })
    .then(response => {
      console.log('API Response:', response);
      // API returns response.data.cards based on network logs
      if (response.data?.cards) {
        console.log('Cards loaded:', response.data.cards.length);
        setAllCards(response.data.cards);
      } else if (response.data?.data) {
        // Fallback in case structure differs
        console.log('Cards loaded (fallback):', response.data.data.length);
        setAllCards(response.data.data);
      } else {
        console.error('Unexpected API response structure:', response);
      }
    })
    .catch(error => {
      console.error('Error fetching cards:', error);
    })
    .finally(() => {
      setIsLoadingCards(false);
    });
  }, [open, allCards.length]);

  // Auto-select the pre-selected card when panel opens
  useEffect(() => {
    if (open && preSelectedCard && !isSelected(preSelectedCard.seo_card_alias || preSelectedCard.id?.toString())) {
      toggleCard(preSelectedCard);
    }
  }, [open, preSelectedCard]);

  // Search for cards - slot 0
  useEffect(() => {
    const query = debouncedQuery0;
    const slotIndex = 0;
    
    if (query && query.length >= 2) {
      const filtered = allCards.filter((card: any) =>
        card.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
      
      setSearchResults(prev => {
        const newResults = [...prev];
        newResults[slotIndex] = filtered;
        return newResults;
      });
    } else {
      setSearchResults(prev => {
        const newResults = [...prev];
        newResults[slotIndex] = [];
        return newResults;
      });
    }
  }, [debouncedQuery0, allCards]);

  // Search for cards - slot 1
  useEffect(() => {
    const query = debouncedQuery1;
    const slotIndex = 1;
    
    if (query && query.length >= 2) {
      const filtered = allCards.filter((card: any) =>
        card.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
      
      setSearchResults(prev => {
        const newResults = [...prev];
        newResults[slotIndex] = filtered;
        return newResults;
      });
    } else {
      setSearchResults(prev => {
        const newResults = [...prev];
        newResults[slotIndex] = [];
        return newResults;
      });
    }
  }, [debouncedQuery1, allCards]);

  // Search for cards - slot 2
  useEffect(() => {
    const query = debouncedQuery2;
    const slotIndex = 2;
    
    if (query && query.length >= 2) {
      const filtered = allCards.filter((card: any) =>
        card.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
      
      setSearchResults(prev => {
        const newResults = [...prev];
        newResults[slotIndex] = filtered;
        return newResults;
      });
    } else {
      setSearchResults(prev => {
        const newResults = [...prev];
        newResults[slotIndex] = [];
        return newResults;
      });
    }
  }, [debouncedQuery2, allCards]);

  const handleSearchChange = (slotIndex: number, value: string) => {
    setSearchQueries(prev => {
      const newQueries = [...prev];
      newQueries[slotIndex] = value;
      return newQueries;
    });
  };

  const handleSelectCard = (card: any, slotIndex: number) => {
    toggleCard(card);
    setSearchQueries(prev => {
      const newQueries = [...prev];
      newQueries[slotIndex] = '';
      return newQueries;
    });
    setSearchResults(prev => {
      const newResults = [...prev];
      newResults[slotIndex] = [];
      return newResults;
    });
  };

  const getBestValue = (field: string, isLower: boolean = false) => {
    const values = selectedCards.map(card => {
      const val = card[field];
      if (typeof val === 'string') {
        return parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
      }
      return parseFloat(val) || 0;
    });

    const bestValue = isLower ? Math.min(...values) : Math.max(...values);
    return values.map(v => v === bestValue && bestValue !== 0);
  };

  const allSame = (field: string) => {
    if (selectedCards.length < 2) return false;
    const firstValue = selectedCards[0][field];
    return selectedCards.every(card => card[field] === firstValue);
  };

  const sections = [
    {
      id: 'summary',
      title: 'Summary',
      alwaysExpanded: true
    },
    {
      id: 'key-benefits',
      title: 'Key Benefits',
      fields: [
        { key: 'product_usps', label: 'Top Features', isArray: true }
      ]
    },
    {
      id: 'costs',
      title: 'Costs & Fees',
      fields: [
        { key: 'joining_fee_text', label: 'Joining Fee', highlight: 'lower' },
        { key: 'joining_fee_offset', label: 'Joining Fee Waiver' },
        { key: 'annual_fee_text', label: 'Annual Fee', highlight: 'lower' },
        { key: 'annual_fee_waiver', label: 'Annual Fee Waiver' }
      ]
    },
    {
      id: 'rewards',
      title: 'Rewards & Redemption',
      fields: [
        { key: 'reward_conversion_rate', label: 'Reward Conversion Rate' },
        { key: 'redemption_options', label: 'Redemption Options', html: true },
        { key: 'redemption_catalogue', label: 'Redemption Catalogue', isLink: true }
      ]
    },
    {
      id: 'eligibility',
      title: 'Eligibility Requirements',
      fields: [
        { key: 'min_age', label: 'Minimum Age' },
        { key: 'max_age', label: 'Maximum Age' },
        { key: 'income_salaried', label: 'Income Required (Salaried)' },
        { key: 'income_self_emp', label: 'Income Required (Self-Employed)' },
        { key: 'crif', label: 'Credit Score Required' },
        { key: 'employment_type', label: 'Employment Type' }
      ]
    },
    {
      id: 'exclusions',
      title: 'Exclusions',
      fields: [
        { key: 'exclusion_earnings', label: 'Earning Exclusions', isList: true },
        { key: 'exclusion_spends', label: 'Spending Exclusions', isList: true }
      ]
    },
    {
      id: 'benefits',
      title: 'All Card Benefits',
      fields: [
        { key: 'product_benefits', label: 'Benefits', isDetailedArray: true }
      ]
    },
    {
      id: 'best-for',
      title: 'Best For',
      fields: [
        { key: 'tags', label: 'Categories', isTags: true }
      ]
    }
  ];

  // Fill slots array - up to maxCompare (3) slots
  const slots = Array.from({ length: maxCompare }, (_, i) => selectedCards[i] || null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-7xl max-h-[90vh] p-0"
        aria-labelledby="compare-dialog-title"
        aria-modal="true"
      >
        <DialogHeader className="p-6 pb-4 border-b sticky top-0 bg-background z-10">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle id="compare-dialog-title" className="text-2xl font-bold">
                Compare Cards ({selectedCards.length}/{maxCompare})
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                Search and select up to {maxCompare} cards to compare their features side by side
              </DialogDescription>
            </div>
            {selectedCards.length >= 2 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDifferencesOnly(!showDifferencesOnly)}
                className="gap-2"
              >
                {showDifferencesOnly ? 'Show All' : 'Show Differences Only'}
              </Button>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-100px)]">
          <div className="p-6">
            {/* Card Slots with Search */}
            <div className="grid gap-6 mb-8" style={{ gridTemplateColumns: `repeat(${maxCompare}, 1fr)` }}>
              {slots.map((card, slotIndex) => (
                <div 
                  key={slotIndex}
                  className="bg-card border-2 border-border rounded-xl p-4 relative min-h-[300px]"
                >
                  {card ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCard(card.id?.toString() || card.seo_card_alias)}
                        className="absolute top-2 right-2 w-6 h-6 p-0 hover:bg-destructive/10 hover:text-destructive z-10"
                      >
                        <X className="w-4 h-4" />
                      </Button>

                      <div className="mb-3 h-32 flex items-center justify-center bg-muted/30 rounded-lg">
                        <img 
                          src={card.card_bg_image || card.image || '/placeholder.svg'}
                          alt={card.name}
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                      </div>

                      <h3 className="font-bold text-lg mb-2 line-clamp-2">{card.name}</h3>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        <Badge variant="outline" className="text-xs">
                          {card.card_type}
                        </Badge>
                      </div>

                      {card.rating && (
                        <div className="flex items-center gap-1 mb-3 text-sm">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{card.rating}</span>
                        </div>
                      )}

                      <Button
                        className="w-full mt-2"
                        size="sm"
                        onClick={() => openRedirectInterstitial({
                          networkUrl: card.card_apply_link,
                          cardId: card.id || card.seo_card_alias,
                          cardName: card.name,
                          bankName: extractBankName(card.card_apply_link),
                          bankLogo: extractBankLogo(card.card_apply_link)
                        })}
                      >
                        Apply Now
                        <ExternalLink className="ml-2 w-3 h-3" />
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="w-full mb-4 space-y-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary" />
                          <Input
                            placeholder={isLoadingCards ? "Loading cards..." : `Search ${allCards.length} cards...`}
                            value={searchQueries[slotIndex]}
                            onChange={(e) => handleSearchChange(slotIndex, e.target.value)}
                            className="pl-11 border-2 border-primary/20 focus:border-primary h-12 text-base"
                            disabled={isLoadingCards}
                          />
                        </div>
                        
                        {/* Search Results Dropdown */}
                        {searchQueries[slotIndex].length >= 2 && searchResults[slotIndex].length > 0 && (
                          <div className="absolute z-20 w-full mt-1 bg-card border-2 border-primary rounded-lg shadow-xl max-h-60 overflow-auto">
                            <div className="sticky top-0 bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground border-b">
                              {searchResults[slotIndex].length} card{searchResults[slotIndex].length !== 1 ? 's' : ''} found
                            </div>
                            {searchResults[slotIndex].map((result: any) => (
                              <button
                                key={result.id || result.seo_card_alias}
                                onClick={() => handleSelectCard(result, slotIndex)}
                                className="w-full p-3 text-left hover:bg-primary/10 transition-colors flex items-center gap-3 border-b border-border last:border-0"
                              >
                                <img 
                                  src={result.card_bg_image || result.image || '/placeholder.svg'}
                                  alt={result.name}
                                  className="w-16 h-10 object-contain rounded border border-border"
                                  onError={(e) => {
                                    e.currentTarget.src = '/placeholder.svg';
                                  }}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm line-clamp-1">{result.name}</div>
                                  <div className="text-xs text-muted-foreground">{result.card_type}</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {/* No Results Message */}
                        {searchQueries[slotIndex].length >= 2 && searchResults[slotIndex].length === 0 && !isLoadingCards && (
                          <div className="text-center text-sm text-muted-foreground mt-2 p-3 border border-dashed border-border rounded-lg">
                            No cards found. Try a different search term.
                          </div>
                        )}
                        
                        {isLoadingCards && (
                          <div className="text-center text-sm text-muted-foreground mt-2 flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            Loading cards...
                          </div>
                        )}
                      </div>
                      
                      <div className="text-center text-muted-foreground">
                        <Plus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-medium">
                          {isLoadingCards ? 'Please wait...' : 'Search and select a card to compare'}
                        </p>
                        {!isLoadingCards && allCards.length > 0 && (
                          <p className="text-xs mt-1">{allCards.length} cards available</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Comparison Details - Only show if we have at least 2 cards */}
            {selectedCards.length >= 2 && (
              <>
                {sections.map(section => {
                  const isExpanded = section.alwaysExpanded || expandedSections.has(section.id);
                  
                  if (section.alwaysExpanded) return null; // Summary is shown above
                  
                  return (
                    <div key={section.id} className="mb-6">
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                      >
                        <h3 className="text-lg font-bold">{section.title}</h3>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                      
                      {isExpanded && section.fields && (
                        <div className="mt-4 space-y-4">
                          {section.fields.map((field: any) => {
                            const isSame = allSame(field.key);
                            if (showDifferencesOnly && isSame) return null;
                            
                            const bestValues = field.highlight ? 
                              getBestValue(field.key, field.highlight === 'lower') : 
                              [];
                            
                            return (
                              <div 
                                key={field.key}
                                className="grid gap-4"
                                style={{ gridTemplateColumns: `200px repeat(${selectedCards.length}, 1fr)` }}
                              >
                                <div className="font-semibold text-sm flex items-center">
                                  {field.label}
                                </div>
                                {selectedCards.map((card, idx) => {
                                  const value = card[field.key];
                                  const isBest = bestValues[idx];
                                  
                                  return (
                                    <div 
                                      key={idx}
                                      className={cn(
                                        "p-3 rounded-lg border text-sm",
                                        isBest ? "border-primary bg-primary/5" : "border-border"
                                      )}
                                    >
                                      {isBest && (
                                        <Trophy className="w-4 h-4 text-primary inline mr-1" />
                                      )}
                                      
                                      {/* Handle different field types */}
                                      {field.isArray && Array.isArray(value) ? (
                                        <div className="space-y-2">
                                          {value.slice(0, 3).map((item: any, i: number) => (
                                            <div key={i} className="text-xs">
                                              <div className="font-semibold">{item.header}</div>
                                              <div className="text-muted-foreground">{item.description}</div>
                                            </div>
                                          ))}
                                          {value.length > 3 && (
                                            <p className="text-xs text-muted-foreground">+{value.length - 3} more</p>
                                          )}
                                        </div>
                                      ) : field.isDetailedArray && Array.isArray(value) ? (
                                        <div className="space-y-1">
                                          <p className="font-medium">{value.length} benefits</p>
                                          <div className="text-xs text-muted-foreground space-y-1">
                                            {value.slice(0, 2).map((item: any, i: number) => (
                                              <div key={i}>• {item.benefit_name}</div>
                                            ))}
                                            {value.length > 2 && (
                                              <div>+{value.length - 2} more</div>
                                            )}
                                          </div>
                                        </div>
                                      ) : field.isList && typeof value === 'string' ? (
                                        <ul className="list-disc list-inside space-y-1 text-xs">
                                          {value.split(',').slice(0, 3).map((item: string, i: number) => (
                                            <li key={i} className="text-muted-foreground">{item.trim()}</li>
                                          ))}
                                          {value.split(',').length > 3 && (
                                            <li className="text-muted-foreground">+{value.split(',').length - 3} more</li>
                                          )}
                                        </ul>
                                      ) : field.isTags && Array.isArray(value) ? (
                                        <div className="flex flex-wrap gap-1">
                                          {value.map((tag: any) => (
                                            <Badge key={tag.id} variant="secondary" className="text-xs">
                                              {tag.name}
                                            </Badge>
                                          ))}
                                        </div>
                                      ) : field.isLink && value ? (
                                        <a 
                                          href={value} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-primary hover:underline text-xs flex items-center gap-1"
                                        >
                                          View Catalogue
                                          <ExternalLink className="w-3 h-3" />
                                        </a>
                                      ) : field.html ? (
                                        <div 
                                          className="prose prose-sm max-w-none"
                                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(value || 'N/A') }}
                                        />
                                      ) : (
                                        <span>{value || 'N/A'}</span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
