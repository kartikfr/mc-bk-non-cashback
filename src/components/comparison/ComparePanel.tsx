import { useState, useEffect, useRef } from 'react';
import { useComparison } from '@/contexts/ComparisonContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { X, Star, ExternalLink, ChevronDown, ChevronUp, Search, Plus, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sanitizeHtml } from '@/lib/sanitize';
import { redirectToCardApplication } from '@/utils/redirectHandler';
import { cardService } from '@/services/cardService';
import { getCardAlias, getCardKey } from '@/utils/cardAlias';
import { useDebounce } from '@/hooks/useDebounce';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';

interface ComparePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preSelectedCard?: any;
}

export function ComparePanel({ open, onOpenChange, preSelectedCard }: ComparePanelProps) {
  const { selectedCards, removeCard, toggleCard, maxCompare } = useComparison();
  const [searchQueries, setSearchQueries] = useState<string[]>(['', '', '']);
  const [searchResults, setSearchResults] = useState<any[][]>([[], [], []]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['fee-eligibility'])); // Fee & Eligibility expanded by default
  const [expandedUsps, setExpandedUsps] = useState<Set<string>>(new Set()); // Track expanded USPs for mobile
  const [detailViewCard, setDetailViewCard] = useState<any>(null);
  const [detailViewOpen, setDetailViewOpen] = useState(false);
  const [allCards, setAllCards] = useState<any[]>([]);
  const [hydratedCards, setHydratedCards] = useState<Record<string, any>>({});
  const hydrationQueueRef = useRef<Record<string, boolean>>({});

  const debouncedQuery0 = useDebounce(searchQueries[0], 300);
  const debouncedQuery1 = useDebounce(searchQueries[1], 300);
  const debouncedQuery2 = useDebounce(searchQueries[2], 300);

  useEffect(() => {
    if (!open || allCards.length > 0) return;
    cardService.getCardListing({ slug: '', banks_ids: [], card_networks: [], annualFees: '', credit_score: '', sort_by: '', free_cards: '', eligiblityPayload: {}, cardGeniusPayload: [] })
      .then(response => setAllCards(response.data?.cards || response.data?.data || []))
      .catch(console.error);
  }, [open, allCards.length]);

  useEffect(() => {
    [debouncedQuery0, debouncedQuery1, debouncedQuery2].forEach((query, idx) => {
      if (query?.length >= 2) {
        setSearchResults(prev => { const newResults = [...prev]; newResults[idx] = allCards.filter((card: any) => card.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5); return newResults; });
      } else {
        setSearchResults(prev => { const newResults = [...prev]; newResults[idx] = []; return newResults; });
      }
    });
  }, [debouncedQuery0, debouncedQuery1, debouncedQuery2, allCards]);

  const handleSearchChange = (slotIndex: number, value: string) => setSearchQueries(prev => { const newQueries = [...prev]; newQueries[slotIndex] = value; return newQueries; });
  const handleSelectCard = (slotIndex: number, card: any) => { toggleCard(card); handleSearchChange(slotIndex, ''); };
  const toggleRowExpansion = (rowKey: string) => setExpandedRows(prev => { const newSet = new Set(prev); if (newSet.has(rowKey)) newSet.delete(rowKey); else newSet.add(rowKey); return newSet; });
  const toggleSectionExpansion = (sectionId: string) => setExpandedSections(prev => { const newSet = new Set(prev); if (newSet.has(sectionId)) newSet.delete(sectionId); else newSet.add(sectionId); return newSet; });
  const toggleUspExpansion = (uspKey: string) => setExpandedUsps(prev => { const newSet = new Set(prev); if (newSet.has(uspKey)) newSet.delete(uspKey); else newSet.add(uspKey); return newSet; });
  const getNestedValue = (obj: any, path: string) => path.split('.').reduce((acc, part) => acc?.[part], obj);
  const isLongText = (text: string) => text ? text.replace(/<[^>]*>/g, '').length > 70 : false;
  
  // Helper function to truncate and shorten text for mobile display
  const shortenText = (text: string, maxLength: number = 50): string => {
    if (!text) return '';
    const cleanText = text.replace(/<[^>]*>/g, '').trim();
    if (cleanText.length <= maxLength) return cleanText;
    return cleanText.substring(0, maxLength).trim() + '...';
  };
  
  // Helper to format long descriptions into shorter text
  const formatLongText = (text: string): string => {
    if (!text) return '';
    const cleanText = text.replace(/<[^>]*>/g, '').trim();
    // Remove common verbose phrases
    return cleanText
      .replace(/\b(annually|per year|yearly)\b/gi, '/yr')
      .replace(/\b(greater than|more than|above)\b/gi, '>')
      .replace(/\b(spends of|spend of|spending)\b/gi, 'spend')
      .replace(/\b(can be|will be|is)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const comparisonSections = [
    {
      id: 'fee-eligibility',
      title: 'Fee & Eligibility',
      rows: [
        { key: 'joining_fee_text', label: 'Joining Fee' },
        { key: 'joining_fee_offset', label: 'Joining Fee Waiver', type: 'html' },
        { key: 'annual_fee_text', label: 'Annual Fee' },
        { key: 'annual_fee_waiver', label: 'Annual Fee Waiver', type: 'html' },
        { key: 'min_age', label: 'Minimum Age' },
        { key: 'max_age', label: 'Maximum Age' },
        { key: 'income_salaried', label: 'Income (Salaried) (LPA)' },
        { key: 'income_self_emp', label: 'Income (Self-Employed) (LPA)' },
        { key: 'crif', label: 'Credit Score Required' },
        { key: 'employment_type', label: 'Employment Type' },
      ],
    },
    {
      id: 'key-benefits',
      title: 'Key Benefits',
      rows: [
        { key: 'product_usps', label: 'All Key Benefits', type: 'usps' },
      ],
    },
    {
      id: 'best-for',
      title: 'Best For',
      rows: [
        { key: 'tags', label: 'Best For', type: 'tags' },
      ],
    },
    {
      id: 'rewards',
      title: 'Rewards & Redemption',
      rows: [
        { key: 'reward_conversion_rate', label: 'Reward Conversion Rate', type: 'html' },
        { key: 'redemption_options', label: 'Redemption Options', type: 'html' },
        { key: 'redemption_catalogue', label: 'Redemption Catalogue', type: 'link' },
      ],
    },
    {
      id: 'fee-structure',
      title: 'Fee Structure',
      rows: [
        { key: 'bank_fee_structure.forex_markup', label: 'Foreign Currency Markup' },
        { key: 'bank_fee_structure.forex_markup_comment', label: 'Forex Markup Details', type: 'html' },
        { key: 'bank_fee_structure.apr_fees', label: 'APR Fees' },
        { key: 'bank_fee_structure.apr_fees_comment', label: 'APR Details', type: 'html' },
        { key: 'bank_fee_structure.atm_withdrawal', label: 'ATM Withdrawal Charges' },
        { key: 'bank_fee_structure.atm_withdrawal_comment', label: 'ATM Withdrawal Details', type: 'html' },
        { key: 'bank_fee_structure.reward_redemption_fees', label: 'Reward Redemption Fees' },
        { key: 'bank_fee_structure.reward_redemption_fees_comment', label: 'Reward Redemption Details', type: 'html' },
        { key: 'bank_fee_structure.railway_surcharge', label: 'Railway Surcharge' },
        { key: 'bank_fee_structure.railway_surcharge_comment', label: 'Railway Surcharge Details', type: 'html' },
        { key: 'bank_fee_structure.rent_payment_fees', label: 'Rent Payment Fees' },
        { key: 'bank_fee_structure.rent_payment_fees_comment', label: 'Rent Payment Details', type: 'html' },
        { key: 'bank_fee_structure.check_payment_fees', label: 'Cheque Payment Fees' },
        { key: 'bank_fee_structure.check_payment_fees_comment', label: 'Cheque Payment Details', type: 'html' },
        { key: 'bank_fee_structure.cash_payment_fees', label: 'Cash Payment Fees' },
        { key: 'bank_fee_structure.cash_payment_fees_comment', label: 'Cash Payment Details', type: 'html' },
        { key: 'bank_fee_structure.late_payment_fine', label: 'Late Payment Charges' },
        { key: 'bank_fee_structure.late_payment_annual', label: 'Late Payment (Annual Slabs)' },
        { key: 'bank_fee_structure.late_payment_comment', label: 'Late Payment Details', type: 'html' },
      ],
    },
    {
      id: 'exclusions',
      title: 'Exclusions',
      rows: [
        { key: 'exclusion_earnings', label: 'Earning Exclusions', type: 'list' },
        { key: 'exclusion_spends', label: 'Spending Exclusions', type: 'list' },
      ],
    },
    {
      id: 'terms',
      title: 'Terms & Conditions',
      rows: [
        { key: 'tnc', label: 'Terms & Conditions', type: 'html' },
      ],
    },
  ];

  // Use the utility function from cardAlias.ts

  const slots = Array.from({ length: maxCompare }, (_, i) =>
    i === 0 &&
    preSelectedCard &&
    !selectedCards.find(
      (c) => getCardKey(c) === getCardKey(preSelectedCard)
    )
      ? preSelectedCard
      : selectedCards[i] || null
  );

  const resolvedSlots = slots.map((card) => {
    if (!card) return null;
    const key = getCardKey(card);
    const hydrated = key && hydratedCards[key];
    if (!hydrated) return card;
    return {
      ...card,
      ...hydrated,
      banks: hydrated.banks || card.banks,
      image: hydrated.image || card.image,
      network_url: hydrated.network_url || card.network_url,
    };
  });

  // Active cards used in UI (no empty slots)
  const activeCards = resolvedSlots.filter(Boolean);

  const handleApply = (card: any) => {
    const success = redirectToCardApplication(card);
    if (!success) {
      toast.error('Unable to open the bank site. Please allow pop-ups or try again later.');
    }
  };

  useEffect(() => {
    if (!open) return;
    
    selectedCards.forEach(card => {
      const key = getCardKey(card);
      if (!key || hydratedCards[key] || hydrationQueueRef.current[key]) return;

      hydrationQueueRef.current[key] = true;
      
      // Use getCardAlias to ensure we use the correct alias for API call
      const alias = getCardAlias(card);
      if (!alias) {
        console.warn('No alias found for card:', card);
        delete hydrationQueueRef.current[key];
        return;
      }
      
      cardService.getCardDetailsByAlias(alias)
        .then(response => {
          const detail =
            Array.isArray(response?.data) ? response.data[0] :
            response?.data?.data ? response.data.data :
            response?.data;

          if (detail) {
            setHydratedCards(prev => ({
              ...prev,
              [key]: {
                ...card,
                ...detail,
                // Preserve important fields from original card
                banks: detail.banks || card.banks,
                image: detail.image || card.image || card.card_bg_image,
                card_type: detail.card_type || card.card_type,
                network_url: detail.network_url || card.network_url,
                seo_card_alias: detail.seo_card_alias || card.seo_card_alias || alias,
                card_alias: detail.card_alias || card.card_alias || alias,
              }
            }));
          } else {
            console.warn('No detail data found for card:', alias);
          }
        })
        .catch(err => {
          console.error('Failed to hydrate card for comparison:', alias, err);
          toast.error(`Failed to load details for ${card.name || 'card'}`);
        })
        .finally(() => {
          delete hydrationQueueRef.current[key];
        });
    });
  }, [open, selectedCards]);

  const renderCellValue = (card: any, row: any, cardIndex?: number) => {
    const value = getNestedValue(card, row.key);
    
    // For Fee Structure rows with comments, check both value and comment
    if (row.key.startsWith('bank_fee_structure.')) {
      const isCommentRow = row.key.endsWith('_comment');
      if (!isCommentRow) {
        // For value rows, check if there's a corresponding comment
        const commentKey = `${row.key}_comment`;
        const commentValue = getNestedValue(card, commentKey);
        // Only show "Not Available" if both value and comment are empty
        if ((!value || value === 'N/A' || value === '') && (!commentValue || commentValue === 'N/A' || commentValue === '')) {
          return <span className="text-muted-foreground italic">Not Available</span>;
        }
      }
    } else {
      // For non-fee-structure fields, use original logic
      if (!value || value === 'N/A' || value === '') return <span className="text-muted-foreground italic">Not Available</span>;
    }
    
    if (row.type === 'rating') return <div className="flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /><span className="font-semibold text-xs">{value}</span></div>;
    if (row.type === 'usps') {
      const usps = (Array.isArray(value) ? value : []).sort((a: any, b: any) => a.priority - b.priority);
      const cardKey = card ? getCardKey(card) : '';
      
      return (
        <div className="space-y-1">
          {usps.map((usp: any, idx: number) => {
            const uspKey = `${cardKey}-${row.key}-${idx}`;
            const isExpanded = expandedUsps.has(uspKey);
            
            return (
              <div key={idx}>
                {/* Mobile: Only heading, collapsible description */}
                <div className="sm:hidden">
                  <Collapsible open={isExpanded} onOpenChange={() => toggleUspExpansion(uspKey)}>
                    <CollapsibleTrigger className="w-full text-left">
                      <div className="pl-3 pr-2 py-1.5 bg-gradient-to-r from-muted/40 to-muted/30 rounded-md border-l-4 border-primary/40 flex items-center justify-between group hover:from-muted/60 hover:to-muted/50 active:scale-[0.98] transition-all duration-150 shadow-sm">
                        <div className="font-semibold text-[11px] text-foreground line-clamp-1 flex-1 pr-1">{usp.header}</div>
                        <ChevronDown className={cn("w-3 h-3 text-primary/60 ml-1 flex-shrink-0 transition-transform duration-200", isExpanded && "rotate-180")} />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="pl-3 pr-2 pt-1.5 pb-1.5 ml-1 border-l-2 border-primary/20 bg-muted/20 rounded-b-md">
                        <div className="text-[10px] text-muted-foreground leading-relaxed">{usp.description || ''}</div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
                
                {/* Desktop: Full content with heading and description */}
                <div className="hidden sm:block">
                  <div className="pl-3 pr-2 py-1.5 bg-gradient-to-r from-muted/50 to-muted/40 rounded-md border-l-4 border-primary/30 hover:from-muted/60 hover:to-muted/50 transition-colors shadow-sm">
                    <div className="font-semibold text-[11px] mb-1 text-foreground">{usp.header}</div>
                    <div className="text-[10px] text-muted-foreground leading-relaxed pl-0.5">{usp.description || ''}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    if (row.type === 'tags') return <div className="flex flex-wrap gap-1.5">{(Array.isArray(value) ? value : []).map((t: any) => <span key={t.id || t.name} className="px-1.5 py-0.5 rounded-full bg-muted text-foreground text-[10px] font-medium">{shortenText(t.name, 20)}</span>)}</div>;
    if (row.type === 'list') {
      const items = value.split(',').map((item: string) => item.trim()).filter(Boolean);
      return (
        <ul className="list-disc list-inside space-y-0.5 text-[10px] text-foreground leading-tight pl-2.5">
          {items.map((item: string, idx: number) => (
            <li key={idx} className="line-clamp-1 pl-0.5">{shortenText(item, 35)}</li>
          ))}
        </ul>
      );
    }
    if (row.type === 'link') return <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 text-xs font-medium">View Catalogue <ExternalLink className="w-3 h-3" /></a>;
    if (row.type === 'html') {
      const rowKey = `${row.key}`; const isExpanded = expandedRows.has(rowKey);
      const cleanHtml = value ? value.replace(/<[^>]*>/g, '').trim() : '';
      const needsExpansion = isLongText(cleanHtml);
      const displayText = !isExpanded && needsExpansion ? shortenText(cleanHtml, 50) : cleanHtml;
      return (
        <div className="text-[10px] sm:text-xs">
          <div className={cn("break-words leading-tight pl-0.5", !isExpanded && needsExpansion && "line-clamp-2")}>
            {isExpanded ? <div className="prose prose-sm max-w-none text-[10px] sm:text-xs leading-tight pl-0.5" dangerouslySetInnerHTML={{ __html: sanitizeHtml(value) }} /> : displayText}
          </div>
          {needsExpansion && <Button variant="link" size="sm" onClick={() => toggleRowExpansion(rowKey)} className="mt-0.5 p-0 h-auto text-[9px] sm:text-[10px]">{isExpanded ? <>Less <ChevronUp className="w-2 h-2 ml-0.5" /></> : <>More <ChevronDown className="w-2 h-2 ml-0.5" /></>}</Button>}
        </div>
      );
    }
    const rowKey = `${row.key}`; const isExpanded = expandedRows.has(rowKey); const strValue = String(value);
    const cleanText = strValue.replace(/<[^>]*>/g, '').trim();
    const formattedText = formatLongText(cleanText);
    const needsExpansion = formattedText.length > 50;
    const displayText = !isExpanded && needsExpansion ? shortenText(formattedText, 45) : formattedText;
    
    return (
      <div className="text-[10px] sm:text-xs">
        <div className={cn("break-words leading-tight pl-0.5", !isExpanded && needsExpansion && "line-clamp-2")}>
          {displayText}
        </div>
        {needsExpansion && (
          <Button 
            variant="link" 
            size="sm" 
            onClick={() => toggleRowExpansion(rowKey)} 
            className="mt-0.5 p-0 h-auto text-[9px] sm:text-[10px]"
          >
            {isExpanded ? <>Less <ChevronUp className="w-2 h-2 ml-0.5" /></> : <>More <ChevronDown className="w-2 h-2 ml-0.5" /></>}
          </Button>
        )}
      </div>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[100vw] sm:max-w-[95vw] h-[100vh] sm:h-[90vh] p-0 rounded-none sm:rounded-lg">
          <DialogHeader className="px-3 sm:px-6 pt-3 sm:pt-4 pb-2 sm:pb-3 border-b">
            <DialogTitle className="text-base sm:text-lg font-bold">Compare Credit Cards</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-full px-3 sm:px-6 pb-3 sm:pb-6">
            {/* Mobile: Horizontal scrollable cards, Desktop: Grid */}
            <div className="sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4 mb-6 sm:mb-8">
              {/* Mobile: Horizontal scroll - Compact cards side by side */}
              <div className="flex sm:hidden gap-2 overflow-x-auto pb-2 mb-3 -mx-3 px-3 scrollbar-hide snap-x snap-mandatory">
                {resolvedSlots.map((card, index) => (
                  <div key={`mobile-${index}`} className="flex-shrink-0 w-[calc((100vw-1rem)/3)] min-w-[130px] max-w-[145px] snap-center border rounded-lg p-2 bg-card">
                  {card ? (
                    <div className="space-y-2 flex flex-col h-full">
                      <div className="relative flex-shrink-0">
                        <img
                          src={card.image || '/placeholder.svg'}
                          alt={card.name}
                          className="w-full h-14 object-contain rounded-md bg-gradient-to-br from-muted to-muted/50"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-0 right-0 bg-background/95 hover:bg-background touch-target h-5 w-5 p-0 rounded-full"
                          onClick={() => removeCard(getCardKey(card))}
                        >
                          <X className="w-2.5 h-2.5" />
                        </Button>
                      </div>
                      <div className="flex-1 flex flex-col justify-between min-h-0">
                        <div className="space-y-0.5">
                          <h3 className="font-semibold text-xs leading-tight line-clamp-2 text-foreground">{card.name}</h3>
                          <p className="text-[10px] text-muted-foreground line-clamp-1">{card.banks?.name}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-[10px] h-7 mt-1.5 px-1.5"
                          onClick={() => {
                            setDetailViewCard(card);
                            setDetailViewOpen(true);
                          }}
                        >
                          <Info className="w-3 h-3 mr-1" />
                          Details
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 flex flex-col h-full">
                      <div className="relative w-full h-14 flex items-center justify-center bg-muted/50 rounded-md border-2 border-dashed flex-shrink-0">
                        <Plus className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 space-y-1.5 relative min-h-0">
                        <Input
                          placeholder="Search card..."
                          value={searchQueries[index]}
                          onChange={(e) => handleSearchChange(index, e.target.value)}
                          className="w-full text-xs h-7 touch-target"
                        />
                        {searchResults[index].length > 0 && (
                          <div className="absolute z-10 w-full bg-background border rounded-lg shadow-lg mt-1 max-h-48 overflow-auto">
                            {searchResults[index].map((searchCard: any) => (
                              <button
                                key={searchCard.id}
                                className="w-full text-left px-2 py-1.5 hover:bg-muted flex items-center gap-1.5"
                                onClick={() => handleSelectCard(index, searchCard)}
                              >
                                <img
                                  src={searchCard.image}
                                  alt={searchCard.name}
                                  className="w-10 h-6 object-contain"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-xs line-clamp-1">{searchCard.name}</div>
                                  <div className="text-[10px] text-muted-foreground line-clamp-1">{searchCard.banks?.name}</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  </div>
                ))}
              </div>
              
              {/* Desktop: Grid layout */}
              {resolvedSlots.map((card, index) => (
                <div key={`desktop-${index}`} className="hidden sm:block border rounded-lg p-4 bg-card">
                  {card ? (
                    <div className="space-y-3">
                      <div className="relative">
                        <img
                          src={card.image || '/placeholder.svg'}
                          alt={card.name}
                          className="w-full h-40 object-contain rounded-lg bg-gradient-to-br from-muted to-muted/50"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-background/80 hover:bg-background touch-target h-8 w-8 sm:h-9 sm:w-9"
                          onClick={() => removeCard(getCardKey(card))}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div>
                        <h3 className="font-semibold line-clamp-2">{card.name}</h3>
                        <p className="text-sm text-muted-foreground">{card.banks?.name}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setDetailViewCard(card);
                          setDetailViewOpen(true);
                        }}
                      >
                        <Info className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative w-full h-32 sm:h-40 flex items-center justify-center bg-muted/50 rounded-lg border-2 border-dashed">
                        <Plus className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground" />
                      </div>
                      <div className="space-y-2 relative">
                        <Input
                          placeholder="Search for a card..."
                          value={searchQueries[index]}
                          onChange={(e) => handleSearchChange(index, e.target.value)}
                          className="w-full text-sm sm:text-base touch-target"
                        />
                        {searchResults[index].length > 0 && (
                          <div className="absolute z-10 w-full bg-background border rounded-lg shadow-lg mt-1 max-h-60 overflow-auto">
                            {searchResults[index].map((searchCard: any) => (
                              <button
                                key={searchCard.id}
                                className="w-full text-left px-3 py-2 hover:bg-muted flex items-center gap-2"
                                onClick={() => handleSelectCard(index, searchCard)}
                              >
                                <img
                                  src={searchCard.image}
                                  alt={searchCard.name}
                                  className="w-12 h-8 object-contain"
                                />
                                <div className="flex-1">
                                  <div className="font-medium text-sm line-clamp-1">{searchCard.name}</div>
                                  <div className="text-xs text-muted-foreground">{searchCard.banks?.name}</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {selectedCards.length === 0 && (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
                  <Search className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Cards Selected</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Search and select at least 2 cards above to start comparing their features, fees, and benefits
                  side-by-side.
                </p>
              </div>
            )}

            {selectedCards.length >= 2 && (
              <div className="space-y-6">
                {/* Mobile-friendly stacked comparison - Cards side by side */}
                <div className="space-y-3 sm:hidden">
                  {comparisonSections.map((section) => {
                    const isExpanded = expandedSections.has(section.id);
                    return (
                    <Collapsible 
                      key={section.id} 
                      open={isExpanded}
                      onOpenChange={() => toggleSectionExpansion(section.id)}
                      className="border rounded-lg overflow-hidden"
                    >
                      <CollapsibleTrigger className="w-full bg-muted/80 hover:bg-muted px-3 py-1.5 flex items-center justify-between transition-colors">
                        <h3 className="font-semibold text-xs text-left leading-tight">{section.title}</h3>
                        <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 flex-shrink-0", isExpanded && "rotate-180")} />
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                      <div className="divide-y">
                        {section.rows.map((row) => (
                          <div key={row.key} className="px-3 py-1">
                            <div className="text-[10px] font-semibold text-muted-foreground mb-1">
                              {row.label}
                            </div>
                            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-3 px-3">
                              {activeCards.map((card, idx) => (
                                <div
                                  key={idx}
                                  className="flex-shrink-0 w-[calc((100vw-4rem)/3)] min-w-[125px] max-w-[135px] border rounded-md bg-background/70 px-1.5 py-1"
                                >
                                  <div className="text-[9px] font-semibold line-clamp-1 text-foreground mb-0.5">
                                    {card?.name || 'Card'}
                                  </div>
                                  <div className="text-[10px] leading-tight break-words">
                                    {renderCellValue(card, row)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                    </Collapsible>
                  );
                  })}
                    </div>

                {/* Tablet / Desktop table view */}
                <div className="hidden sm:block space-y-6">
                {comparisonSections.map((section) => {
                  const isExpanded = expandedSections.has(section.id);
                  return (
                  <Collapsible 
                    key={section.id}
                    open={isExpanded}
                    onOpenChange={() => toggleSectionExpansion(section.id)}
                    className="border rounded-lg overflow-hidden"
                  >
                    <CollapsibleTrigger className="w-full bg-muted/80 hover:bg-muted px-4 py-2.5 flex items-center justify-between transition-colors">
                      <h3 className="font-semibold text-sm text-left">{section.title}</h3>
                      <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-200", isExpanded && "rotate-180")} />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      {/* Make the comparison table horizontally scrollable on small tablet widths */}
                      <div className="w-full overflow-x-auto">
                        <Table className="min-w-[680px] sm:min-w-full">
                      <TableHeader>
                        <TableRow>
                              <TableHead className="w-[160px] min-w-[160px] sm:w-[200px] sm:min-w-[200px] font-semibold sticky left-0 bg-background z-10 text-xs">
                            Attribute
                          </TableHead>
                              {activeCards.map((card, idx) => (
                                <TableHead
                                  key={idx}
                                  className="font-semibold text-center min-w-[220px] w-[220px] sm:min-w-[260px] sm:w-[260px] text-xs"
                                >
                              {card?.name || 'Card'}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {section.rows.map((row) => (
                          <TableRow key={row.key} className="hover:bg-muted/50">
                                <TableCell className="font-medium align-top w-[160px] min-w-[160px] sm:w-[200px] sm:min-w-[200px] sticky left-0 bg-background z-10 text-[11px] py-2">
                              {row.label}
                            </TableCell>
                                {activeCards.map((card, idx) => (
                                  <TableCell
                                    key={idx}
                                    className="align-top min-w-[220px] w-[220px] sm:min-w-[260px] sm:w-[260px] text-[10px] py-2"
                                  >
                                {renderCellValue(card, row)}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                    </CollapsibleContent>
                  </Collapsible>
                  );
                })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                  {resolvedSlots.filter(Boolean).map((card, idx) => (
                    <Button key={idx} className="w-full" onClick={() => handleApply(card)}>
                      Apply for {card?.name || 'this card'}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Sheet open={detailViewOpen} onOpenChange={setDetailViewOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          {detailViewCard && (
            <>
              <SheetHeader>
                <SheetTitle>{detailViewCard.name}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="relative w-full">
                  <img
                    src={detailViewCard.image || '/placeholder.svg'}
                    alt={detailViewCard.name}
                    className="w-full h-56 object-contain rounded-lg bg-gradient-to-br from-muted to-muted/50"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3">Overview</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bank:</span>
                      <span className="font-medium">{detailViewCard.banks?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Card Type:</span>
                      <span className="font-medium">{detailViewCard.card_type}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Rating:</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{detailViewCard.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {comparisonSections.map((section) => {
                  const hasData = section.rows.some((row) => {
                    const value = getNestedValue(detailViewCard, row.key);
                    return value && value !== 'N/A' && value !== '';
                  });
                  if (!hasData) return null;
                  return (
                    <div key={section.id}>
                      <h3 className="font-semibold text-lg mb-3">{section.title}</h3>
                      <div className="space-y-4">
                        {section.rows.map((row) => {
                          const value = getNestedValue(detailViewCard, row.key);
                          if (!value || value === 'N/A' || value === '') return null;
                          return (
                            <div key={row.key} className="border-b pb-3 last:border-0">
                              <div className="text-sm font-medium text-muted-foreground mb-1">{row.label}</div>
                              <div className="text-sm">{renderCellValue(detailViewCard, row)}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                <Button className="w-full" size="lg" onClick={() => handleApply(detailViewCard)}>
                  Apply Now
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
