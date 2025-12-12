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

  // Always show 3 slots for comparison (or maxCompare if less than 3)
  const totalSlots = Math.max(maxCompare, 3);
  const slots = Array.from({ length: totalSlots }, (_, i) =>
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
        <div className="space-y-1.5 sm:space-y-1">
          {usps.map((usp: any, idx: number) => {
            const uspKey = `${cardKey}-${row.key}-${idx}`;
            const isExpanded = expandedUsps.has(uspKey);
            const cleanDescription = usp.description ? usp.description.replace(/<[^>]*>/g, '').trim() : '';
            const hasDescription = cleanDescription.length > 0;
            
            return (
              <div key={idx}>
                {/* Mobile: Enhanced compact design with better spacing and visual hierarchy */}
                <div className="sm:hidden">
                  {hasDescription ? (
                    <Collapsible open={isExpanded} onOpenChange={() => toggleUspExpansion(uspKey)}>
                      <CollapsibleTrigger className="w-full text-left touch-target">
                        <div className="px-2.5 py-1.5 bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 rounded-lg border border-primary/30 shadow-sm flex items-start justify-between group active:scale-[0.97] transition-all duration-200 hover:from-primary/20 hover:via-primary/15 hover:to-primary/10">
                          <div className="flex-1 pr-2 min-w-0">
                            <div className="font-bold text-[10px] text-foreground leading-tight mb-0.5 line-clamp-2">{usp.header}</div>
                            {!isExpanded && cleanDescription && (
                              <div className="text-[8px] text-muted-foreground/80 leading-tight line-clamp-1 mt-0.5">
                                {cleanDescription.substring(0, 40)}...
                              </div>
                            )}
                          </div>
                          <ChevronDown className={cn(
                            "w-3 h-3 text-primary/80 flex-shrink-0 mt-0.5 transition-transform duration-200",
                            isExpanded && "rotate-180"
                          )} />
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="animate-accordion-down">
                        <div className="px-2.5 pt-1.5 pb-2 mt-1 ml-1 border-l-2 border-primary/40 bg-gradient-to-br from-muted/40 to-muted/20 rounded-r-lg">
                          <div className="text-[9px] text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {cleanDescription}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <div className="px-2.5 py-1.5 bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 rounded-lg border border-primary/30 shadow-sm">
                      <div className="font-bold text-[10px] text-foreground leading-tight">{usp.header}</div>
                    </div>
                  )}
                </div>
                
                {/* Desktop: Full content with heading and description */}
                <div className="hidden sm:block">
                  <div className="pl-3 pr-2.5 py-1.5 bg-gradient-to-r from-muted/50 to-muted/40 rounded-md border-l-3 border-primary/30 hover:from-muted/60 hover:to-muted/50 transition-colors shadow-sm break-words overflow-wrap-anywhere">
                    <div className="font-semibold text-[11px] mb-1 text-foreground leading-tight break-words">{usp.header}</div>
                    {hasDescription && (
                      <div className="text-[10px] text-muted-foreground leading-relaxed pl-0.5 line-clamp-2 break-words overflow-wrap-anywhere">{cleanDescription}</div>
                    )}
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
        <ul className="list-disc list-inside space-y-0.5 text-[10px] text-foreground leading-tight pl-2.5 break-words overflow-wrap-anywhere">
          {items.map((item: string, idx: number) => (
            <li key={idx} className="break-words overflow-wrap-anywhere word-break-break-word pl-0.5">{shortenText(item, 35)}</li>
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
            {/* Cards Selection - Single horizontal line for all screens with even spacing */}
            <div className="mb-4 sm:mb-6">
              <div className={cn(
                "flex gap-2 sm:gap-3 overflow-x-auto pb-2 -mx-3 px-3 scrollbar-hide snap-x snap-mandatory",
                // Desktop: Use grid layout to show all cards evenly - always 3 columns
                "sm:grid sm:overflow-x-visible sm:grid-cols-3"
              )}>
                {resolvedSlots.map((card, index) => (
                  <div 
                    key={`card-${index}`} 
                    className={cn(
                      "flex-shrink-0 snap-center border rounded-lg bg-card",
                      // Mobile: Equal width for all cards to align with columns
                      "w-[calc((100vw-1.5rem)/3)] min-w-[105px] max-w-[120px]",
                      // Desktop: Full width in grid
                      "sm:w-full sm:min-w-0 sm:max-w-none",
                      // Padding
                      "p-1.5 sm:p-3"
                    )}
                  >
                    {card ? (
                      <div className="space-y-1.5 sm:space-y-2 flex flex-col h-full">
                        <div className="relative flex-shrink-0 w-full">
                          <img
                            src={card.image || card.card_bg_image || '/placeholder.svg'}
                            alt={card.name}
                            className="w-full h-10 sm:h-20 object-contain rounded-md bg-gradient-to-br from-muted to-muted/50"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-0 right-0 bg-background/95 hover:bg-background touch-target h-4 w-4 sm:h-6 sm:w-6 p-0 rounded-full"
                            onClick={() => removeCard(getCardKey(card))}
                          >
                            <X className="w-2 h-2 sm:w-3 sm:h-3" />
                          </Button>
                        </div>
                        <div className="flex-1 flex flex-col justify-between min-h-0">
                          <div className="space-y-0.5">
                            <h3 className="font-semibold text-[9px] sm:text-xs leading-tight line-clamp-2 text-foreground">{card.name}</h3>
                            <p className="text-[8px] sm:text-[10px] text-muted-foreground line-clamp-1">{card.banks?.name}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-[8px] sm:text-[10px] h-5 sm:h-7 mt-1.5 px-1 sm:px-2"
                            onClick={() => {
                              setDetailViewCard(card);
                              setDetailViewOpen(true);
                            }}
                          >
                            <Info className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5" />
                            <span className="hidden xs:inline">Details</span>
                            <span className="xs:hidden">Info</span>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5 sm:space-y-2 flex flex-col h-full">
                        <div className="relative w-full h-10 sm:h-20 flex items-center justify-center bg-muted/50 rounded-md border-2 border-dashed flex-shrink-0">
                          <Plus className="w-3 h-3 sm:w-5 sm:h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 space-y-1 relative min-h-0">
                          <Input
                            placeholder="Search..."
                            value={searchQueries[index]}
                            onChange={(e) => handleSearchChange(index, e.target.value)}
                            className="w-full text-[9px] sm:text-xs h-5 sm:h-7 touch-target"
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
                                    className="w-8 h-5 sm:w-10 sm:h-6 object-contain"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-[9px] sm:text-[10px] line-clamp-1">{searchCard.name}</div>
                                    <div className="text-[8px] sm:text-[9px] text-muted-foreground line-clamp-1">{searchCard.banks?.name}</div>
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
                {/* Fixed Header with Card Names Only - Aligned with card images above */}
                <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b-2 border-border shadow-sm pb-2.5 mb-4 -mx-3 px-3 sm:-mx-6 sm:px-6">
                  <div className={cn(
                    "flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory",
                    "sm:grid sm:grid-cols-3 sm:overflow-x-visible"
                  )}>
                    {resolvedSlots.map((card, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "flex-shrink-0 snap-start",
                          // Mobile: Match card image width exactly
                          "w-[calc((100vw-1.5rem)/3)] min-w-[105px] max-w-[120px]",
                          // Desktop: Full width to match grid columns
                          "sm:w-full sm:min-w-0 sm:max-w-none"
                        )}
                      >
                        <div className="text-[9px] sm:text-xs font-bold text-foreground line-clamp-2 mb-0.5 leading-tight">
                          {card?.name || 'Card'}
                        </div>
                        <div className="text-[8px] sm:text-[10px] text-muted-foreground line-clamp-1">
                          {card?.banks?.name || ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mobile-friendly stacked comparison - Cards side by side */}
                <div className="space-y-4 sm:hidden">
                  {comparisonSections.map((section) => {
                    const isExpanded = expandedSections.has(section.id);
                    const isKeyBenefits = section.id === 'key-benefits';
                    return (
                    <div key={section.id} className="border rounded-lg overflow-hidden">
                      {/* Section Heading */}
                      <Collapsible 
                        open={isExpanded}
                        onOpenChange={() => toggleSectionExpansion(section.id)}
                      >
                        <CollapsibleTrigger className="w-full bg-muted/80 hover:bg-muted px-3 py-2.5 flex items-center justify-between transition-colors">
                          <h3 className="font-bold text-sm text-left leading-tight">{section.title}</h3>
                          <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-200 flex-shrink-0", isExpanded && "rotate-180")} />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                        <div className={cn("divide-y", isKeyBenefits && "divide-y-0 space-y-2 px-3 py-2")}>
                          {section.rows.map((row) => (
                            <div key={row.key} className={cn("px-3", isKeyBenefits ? "py-2" : "py-2")}>
                              {!isKeyBenefits && (
                                <div className="text-[10px] font-semibold text-muted-foreground mb-2">
                                  {row.label}
                                </div>
                              )}
                              <div className={cn(
                                "flex gap-1.5 overflow-x-auto scrollbar-hide pb-1 -mx-3 px-3 snap-x snap-mandatory",
                                isKeyBenefits && "gap-1"
                              )}>
                                {resolvedSlots.map((card, idx) => (
                                  <div
                                    key={idx}
                                    className={cn(
                                      "flex-shrink-0 snap-center",
                                      isKeyBenefits 
                                        ? "w-[calc((100vw-1.5rem)/3)] min-w-[105px] max-w-[120px] border-0 bg-transparent px-0" 
                                        : "w-[calc((100vw-1.5rem)/3)] min-w-[105px] max-w-[120px] border rounded-md bg-background/70 px-1.5 py-1"
                                    )}
                                  >
                                    <div className={cn(
                                      "leading-tight break-words overflow-wrap-anywhere word-break-break-word",
                                      isKeyBenefits ? "text-[9px]" : "text-[10px]"
                                    )}>
                                      {card ? renderCellValue(card, row) : <span className="text-muted-foreground italic text-[9px]">Not Available</span>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                      </Collapsible>
                    </div>
                  );
                  })}
                    </div>

                {/* Desktop design - Matching mobile pattern with grid layout */}
                <div className="hidden sm:block space-y-4">
                {comparisonSections.map((section) => {
                  const isExpanded = expandedSections.has(section.id);
                  const isKeyBenefits = section.id === 'key-benefits';
                  return (
                  <div key={section.id} className="border rounded-lg overflow-hidden">
                    <Collapsible 
                      open={isExpanded}
                      onOpenChange={() => toggleSectionExpansion(section.id)}
                    >
                      <CollapsibleTrigger className="w-full bg-muted/80 hover:bg-muted px-4 py-3 flex items-center justify-between transition-colors">
                        <h3 className="font-bold text-base text-left">{section.title}</h3>
                        <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-200", isExpanded && "rotate-180")} />
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className={cn("divide-y", isKeyBenefits && "divide-y-0 space-y-3 px-4 py-3")}>
                          {section.rows.map((row) => (
                            <div key={row.key} className={cn("px-4", isKeyBenefits ? "py-3" : "py-3")}>
                              {!isKeyBenefits && (
                                <div className="text-xs font-semibold text-muted-foreground mb-2">
                                  {row.label}
                                </div>
                              )}
                              <div className={cn(
                                "grid gap-3 grid-cols-3",
                                isKeyBenefits && "gap-2"
                              )}>
                                {resolvedSlots.map((card, idx) => (
                                  <div
                                    key={idx}
                                    className={cn(
                                      "w-full",
                                      isKeyBenefits 
                                        ? "border-0 bg-transparent px-0" 
                                        : "border rounded-md bg-background/70 px-3 py-2"
                                    )}
                                  >
                                    <div className={cn(
                                      "leading-relaxed break-words overflow-wrap-anywhere word-break-break-word w-full",
                                      isKeyBenefits ? "text-xs" : "text-xs"
                                    )}>
                                      {card ? renderCellValue(card, row) : <span className="text-muted-foreground italic text-xs">Not Available</span>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                  );
                })}
                </div>

                {/* Apply Now Buttons - Under each card column */}
                <div className="mt-6 sm:mt-8 border-t pt-4 sm:pt-6">
                  <div className={cn(
                    "flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory",
                    "sm:grid sm:grid-cols-3 sm:overflow-x-visible"
                  )}>
                    {resolvedSlots.map((card, idx) => (
                      <Button 
                        key={idx} 
                        className={cn(
                          "flex-shrink-0 snap-center sm:snap-none",
                          "w-[calc((100vw-1.5rem)/3)] min-w-[110px] max-w-[130px]",
                          "sm:w-full sm:min-w-0 sm:max-w-none"
                        )}
                        onClick={() => card && handleApply(card)}
                        disabled={!card}
                      >
                        Apply Now
                      </Button>
                    ))}
                  </div>
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
