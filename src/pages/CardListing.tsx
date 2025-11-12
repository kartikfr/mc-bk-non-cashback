import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, X, ArrowUpDown, CheckCircle2, Sparkles } from "lucide-react";
import { cardService } from "@/services/cardService";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import confetti from 'canvas-confetti';
import { toast } from "sonner";

const CardListing = () => {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [displayCount, setDisplayCount] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [eligibilityOpen, setEligibilityOpen] = useState(false);
  const [eligibilitySubmitted, setEligibilitySubmitted] = useState(false);
  
  // Filters - sort_by will be sent to API
  const [filters, setFilters] = useState({
    banks_ids: [] as number[],
    card_networks: [] as string[],
    annualFees: "",
    credit_score: "",
    sort_by: "",  // Empty string by default, can be "recommended", "annual_savings", or "annual_fees"
    free_cards: false
  });

  // Eligibility payload
  const [eligibility, setEligibility] = useState({
    pincode: "",
    inhandIncome: "",
    empStatus: "salaried"
  });

  useEffect(() => {
    fetchCards();
  }, [filters]);

  const fetchCards = async () => {
    try {
      setLoading(true);
      
      // Build base payload with active filters
      const baseParams: any = {
        slug: "",
        banks_ids: filters.banks_ids || [],
        card_networks: filters.card_networks || [],
        annualFees: filters.annualFees || "",
        credit_score: filters.credit_score || "",
        sort_by: filters.sort_by || "",
        free_cards: filters.free_cards ? "true" : "",
        cardGeniusPayload: []
      };

      // Handle eligiblityPayload based on user input
      if (
        eligibilitySubmitted &&
        eligibility.pincode &&
        eligibility.inhandIncome &&
        eligibility.empStatus
      ) {
        // User filled all fields - send actual values
        baseParams.eligiblityPayload = {
          pincode: eligibility.pincode,
          inhandIncome: eligibility.inhandIncome,
          empStatus: eligibility.empStatus
        };
      } else {
        // First load or no eligibility - send empty object
        baseParams.eligiblityPayload = {};
      }

      console.log('Fetching cards with params:', baseParams);
      const response = await cardService.getCardListing(baseParams);
      console.log('API Response:', response);

      let incomingCards: any[] = [];
      if (response.status === 'success' && response.data && Array.isArray(response.data.cards)) {
        incomingCards = response.data.cards;
      } else if (response.data && Array.isArray(response.data)) {
        incomingCards = response.data;
      } else {
        console.error('Unexpected response format:', response);
        toast.error("Failed to load cards");
      }

      // Client-side safety filters (in case backend doesn't filter)
      // 1) Card Network
      if (Array.isArray(incomingCards) && filters.card_networks?.length) {
        const wanted = filters.card_networks.map((n) => n.replace(/\s+/g, '').toLowerCase());
        incomingCards = incomingCards.filter((card: any) => {
          const typeStr = (card.card_type || '').toString();
          const parts = typeStr.split(',').map((p: string) => p.replace(/\s+/g, '').toLowerCase());
          // Keep card if any selected network matches any part
          return wanted.some((w) => parts.includes(w));
        });
      }

      // 2) Annual Fee range
      if (Array.isArray(incomingCards) && filters.annualFees) {
        const val = filters.annualFees as string;
        let min = 0;
        let max = Number.POSITIVE_INFINITY;
        if (val.includes('-')) {
          const [a, b] = val.split('-');
          min = parseInt(a, 10) || 0;
          const parsedMax = parseInt(b, 10);
          max = Number.isNaN(parsedMax) ? Number.POSITIVE_INFINITY : parsedMax;
        } else if (val.endsWith('+')) {
          min = parseInt(val, 10) || 0;
          max = Number.POSITIVE_INFINITY;
        }
        incomingCards = incomingCards.filter((card: any) => {
          const feeRaw = card.annual_fee_text ?? card.annual_fee ?? card.annualFees ?? '0';
          const fee = parseInt(feeRaw?.toString().replace(/[^0-9]/g, ''), 10);
          const feeNum = Number.isFinite(fee) ? fee : 0;
          return feeNum >= min && feeNum <= max;
        });
      }

      // 3) Credit Score buckets (minimum)
      if (Array.isArray(incomingCards) && filters.credit_score) {
        const minScore = parseInt(filters.credit_score as string, 10) || 0;
        incomingCards = incomingCards.filter((card: any) => {
          const scoreRaw = card.crif ?? card.credit_score ?? '';
          const score = parseInt(scoreRaw?.toString().replace(/[^0-9]/g, ''), 10);
          const scoreNum = Number.isFinite(score) ? score : 0;
          return scoreNum >= minScore;
        });
      }

      setCards(Array.isArray(incomingCards) ? incomingCards : []);
    } catch (error) {
      console.error('Failed to fetch cards:', error);
      toast.error("Failed to load cards. Please try again.");
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // Search will be handled on frontend only - filter the cards array
    setDisplayCount(12);
  };

  const loadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setDisplayCount(prev => prev + 12);
      setIsLoadingMore(false);
    }, 500);
  };

  const handleFilterChange = (filterType: string, value: string | boolean) => {
    setFilters((prev: any) => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      banks_ids: [],
      card_networks: [],
      annualFees: "",
      credit_score: "",
      sort_by: "recommended",
      free_cards: false
    });
    setSearchQuery("");
    setDisplayCount(12);
    
    // Reset eligibility data
    setEligibilitySubmitted(false);
    setEligibility({
      pincode: "",
      inhandIncome: "",
      empStatus: "salaried"
    });
    
    // Trigger API call without eligibility
    fetchCards();
  };

  const handleEligibilitySubmit = async () => {
    // Validate inputs
    if (!eligibility.pincode || eligibility.pincode.length !== 6) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }
    if (!eligibility.inhandIncome || parseInt(eligibility.inhandIncome) < 1000) {
      toast.error("Please enter a valid monthly income");
      return;
    }

    setEligibilitySubmitted(true);
    setEligibilityOpen(false);
    
    // Refetch cards with eligibility criteria
    await fetchCards();
    
    toast.success("Eligibility criteria applied!", {
      description: "Showing cards matching your profile"
    });
    
    confetti({
      particleCount: 60,
      spread: 50,
      origin: { y: 0.6 }
    });
  };

  // Filter sidebar component
  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Annual Fee Range */}
      <div>
        <h3 className="font-semibold mb-3">Annual Fee Range</h3>
        <div className="space-y-2">
          {[
            { label: 'All Fees', value: '' },
            { label: '₹0 - ₹1,000', value: '0-1000' },
            { label: '₹1,000 - ₹2,000', value: '1000-2000' },
            { label: '₹2,000 - ₹50,000', value: '2000-50000' },
            { label: '₹5,000+', value: '5000+' }
          ].map((fee) => (
            <label key={fee.value} className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="annualFee" 
                className="accent-primary"
                checked={filters.annualFees === fee.value}
                onChange={() => handleFilterChange('annualFees', fee.value)}
              />
              <span className="text-sm">{fee.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Credit Score */}
      <div>
        <h3 className="font-semibold mb-3">Minimum Credit Score</h3>
        <div className="space-y-2">
          {[
            { label: 'All Scores', value: '' },
            { label: '600+', value: '600' },
            { label: '650+', value: '650' },
            { label: '750+', value: '750' },
            { label: '800+', value: '800' }
          ].map((score) => (
            <label key={score.value} className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="creditScore" 
                className="accent-primary"
                checked={filters.credit_score === score.value}
                onChange={() => handleFilterChange('credit_score', score.value)}
              />
              <span className="text-sm">{score.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Card Network */}
      <div>
        <h3 className="font-semibold mb-3">Card Network</h3>
        <div className="space-y-2">
          {['VISA', 'Mastercard', 'RuPay', 'AmericanExpress'].map((network) => (
            <label key={network} className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                className="accent-primary"
                checked={filters.card_networks.includes(network)}
                onChange={(e) => {
                  setFilters((prev: any) => ({
                    ...prev,
                    card_networks: e.target.checked
                      ? [...prev.card_networks, network]
                      : prev.card_networks.filter((n: string) => n !== network)
                  }));
                }}
              />
              <span className="text-sm">{network === 'AmericanExpress' ? 'American Express' : network}</span>
            </label>
          ))}
        </div>
      </div>

      <Button variant="outline" className="w-full" onClick={clearFilters}>
        Clear All Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Search */}
      <section className="pt-28 pb-12 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl lg:text-5xl font-bold text-center mb-6">
            Explore 200+ Credit Cards
          </h1>
          
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search by card name, bank, or benefit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-12 h-14 text-lg"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      handleSearch();
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              <Button size="lg" onClick={handleSearch}>
                Search
              </Button>
            </div>
            
            {/* Top Filters */}
            <div className="flex flex-wrap items-center gap-3 justify-center">
              <div className="relative">
                <Collapsible open={eligibilityOpen} onOpenChange={setEligibilityOpen}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <Sparkles className="w-4 h-4" />
                      Eligibility Check
                      {eligibilitySubmitted && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                      <ChevronDown className={`w-4 h-4 transition-transform ${eligibilityOpen ? 'rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 bg-popover border border-border rounded-lg shadow-lg p-4 z-50">
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Pincode</label>
                      <Input
                        type="text"
                        placeholder="110001"
                        value={eligibility.pincode}
                        onChange={(e) => setEligibility(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                        maxLength={6}
                        className="h-9"
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Monthly Income (₹)</label>
                      <Input
                        type="text"
                        placeholder="50000"
                        value={eligibility.inhandIncome}
                        onChange={(e) => setEligibility(prev => ({ ...prev, inhandIncome: e.target.value.replace(/\D/g, '') }))}
                        className="h-9"
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Employment Status</label>
                      <Select
                        value={eligibility.empStatus}
                        onValueChange={(value) => setEligibility(prev => ({ ...prev, empStatus: value }))}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="salaried">Salaried</SelectItem>
                          <SelectItem value="self_employed">Self-Employed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button 
                      onClick={handleEligibilitySubmit}
                      className="w-full h-9"
                      size="sm"
                      disabled={!eligibility.pincode || !eligibility.inhandIncome}
                    >
                      Apply Eligibility
                    </Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
              </div>

              <Select
                value={filters.sort_by}
                onValueChange={(value) => handleFilterChange('sort_by', value)}
              >
                <SelectTrigger className="w-48 h-9 border-none bg-transparent text-muted-foreground hover:text-foreground">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">Recommended</SelectItem>
                  <SelectItem value="annual_savings">Annual Savings</SelectItem>
                  <SelectItem value="annual_fees">Annual Fees</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFilterChange('free_cards', !filters.free_cards)}
                className={`gap-2 ${filters.free_cards ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Free Cards Only
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex gap-8">
            {/* Desktop Filters Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-28 bg-card rounded-2xl shadow-lg p-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
                <h2 className="text-xl font-bold mb-6">Filters</h2>
                <FilterSidebar />
              </div>
            </aside>

            {/* Card Grid */}
            <div className="flex-1">
              {/* Mobile Filter Button */}
              <div className="lg:hidden mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {Math.min(displayCount, cards.length)} of {cards.length} cards
                </p>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterSidebar />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Active Filters */}
              {(filters.free_cards || filters.annualFees || filters.credit_score || searchQuery) && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {searchQuery && (
                    <Badge variant="secondary" className="gap-2">
                      Search: {searchQuery}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => {
                          setSearchQuery("");
                          handleSearch();
                        }}
                      />
                    </Badge>
                  )}
                  {filters.free_cards && (
                    <Badge variant="secondary" className="gap-2">
                      Lifetime Free
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => handleFilterChange('free_cards', false)}
                      />
                    </Badge>
                  )}
                  {filters.annualFees && (
                    <Badge variant="secondary" className="gap-2">
                      Fee: ₹{filters.annualFees}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => handleFilterChange('annualFees', '')}
                      />
                    </Badge>
                  )}
                  {filters.credit_score && (
                    <Badge variant="secondary" className="gap-2">
                      Credit Score: {filters.credit_score}+
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => handleFilterChange('credit_score', '')}
                      />
                    </Badge>
                  )}
                </div>
              )}

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-4 text-muted-foreground">Loading cards...</p>
                </div>
              ) : cards.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-xl text-muted-foreground">No cards found matching your criteria</p>
                  <Button variant="outline" className="mt-4" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {cards.slice(0, displayCount).map((card, index) => (
                      <div
                        key={card.id || index}
                        className="bg-card rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all hover:-translate-y-2"
                      >
                        <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-4">
                          {eligibilitySubmitted && (
                            <Badge className="absolute top-3 left-3 bg-green-500 gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Eligible
                            </Badge>
                          )}
                          {(card.joining_fee_text === "0" || card.joining_fee_text?.toLowerCase() === "free") && (
                            <Badge className="absolute top-3 right-3 bg-primary">LTF</Badge>
                          )}
                          <img
                            src={card.card_bg_image || card.image}
                            alt={card.name}
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                        </div>

                        <div className="p-6">
                          <div className="mb-2 flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {card.card_type}
                            </Badge>
                            {card.banks?.name && (
                              <span className="text-xs text-muted-foreground">{card.banks.name}</span>
                            )}
                          </div>
                          
                          <h3 className="text-xl font-bold mb-3 line-clamp-2">{card.name}</h3>
                          
                          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg mb-4">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Joining Fee</p>
                              <p className="text-sm font-semibold">
                                {card.joining_fee_text === "0" || card.joining_fee_text?.toLowerCase() === "free" 
                                  ? "Free" 
                                  : `₹${card.joining_fee_text}`}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Annual Fee</p>
                              <p className="text-sm font-semibold">
                                {card.annual_fee_text === "0" || card.annual_fee_text?.toLowerCase() === "free" 
                                  ? "Free" 
                                  : `₹${card.annual_fee_text}`}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Link to={`/cards/${card.seo_card_alias || card.card_alias}`} className="flex-1">
                              <Button variant="outline" className="w-full">Details</Button>
                            </Link>
                            <Button 
                              className="flex-1"
                              onClick={() => {
                                if (card.network_url) {
                                  window.open(card.network_url, '_blank', 'noopener,noreferrer');
                                }
                              }}
                            >
                              Apply
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Load More Button */}
                  {displayCount < cards.length && (
                    <div className="text-center mt-8">
                      <Button 
                        size="lg" 
                        variant="outline" 
                        onClick={loadMore}
                        disabled={isLoadingMore}
                      >
                        {isLoadingMore ? (
                          <>
                            <div className="inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                            Loading...
                          </>
                        ) : (
                          `Load More Cards (${cards.length - displayCount} remaining)`
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default CardListing;
