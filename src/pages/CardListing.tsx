import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, X, ArrowUpDown, CheckCircle2, Sparkles, ShoppingBag, Utensils, Fuel, Plane, Coffee, ShoppingCart, CreditCard } from "lucide-react";
import { cardService, SpendingData } from "@/services/cardService";
import { Badge } from "@/components/ui/badge";
import GeniusDialog from "@/components/GeniusDialog";
import { CompareToggleIcon } from "@/components/comparison/CompareToggleIcon";
import { ComparePill } from "@/components/comparison/ComparePill";
import { openRedirectInterstitial, extractBankName, extractBankLogo } from "@/utils/redirectHandler";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import confetti from 'canvas-confetti';
import { toast } from "sonner";
const CardListing = () => {
  const [searchParams] = useSearchParams();
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [displayCount, setDisplayCount] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [eligibilityOpen, setEligibilityOpen] = useState(false);
  const [eligibilitySubmitted, setEligibilitySubmitted] = useState(false);
  const [showGeniusDialog, setShowGeniusDialog] = useState(false);
  const [geniusSpendingData, setGeniusSpendingData] = useState<SpendingData | null>(null);
  const [cardSavings, setCardSavings] = useState<Record<string, Record<string, number>>>({});

  // Get category from URL params, default to "all"
  const initialCategory = searchParams.get('category') || 'all';

  // Filters - sort_by will be sent to API
  const [filters, setFilters] = useState({
    banks_ids: [] as number[],
    card_networks: [] as string[],
    annualFees: "",
    credit_score: "",
    sort_by: "",
    // Empty string by default, can be "recommended", "annual_savings", or "annual_fees"
    free_cards: false,
    category: initialCategory // all, fuel, shopping, online-food, dining, grocery, travel, utility
  });

  // Category to slug mapping
  const categoryToSlug: Record<string, string> = {
    'all': '',
    'fuel': 'best-fuel-credit-card',
    'shopping': 'best-shopping-credit-card',
    'online-food': 'online-food-ordering',
    'dining': 'best-dining-credit-card',
    'grocery': 'BestCardsforGroceryShopping',
    'travel': 'best-travel-credit-card',
    'utility': 'best-utility-credit-card'
  };

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
        slug: categoryToSlug[filters.category] || "",
        banks_ids: filters.banks_ids || [],
        card_networks: filters.card_networks || [],
        annualFees: filters.annualFees === "free" ? "" : filters.annualFees || "",
        credit_score: filters.credit_score || "",
        sort_by: filters.sort_by || "",
        free_cards: filters.annualFees === "free" ? "true" : "",
        cardGeniusPayload: []
      };

      // Handle eligiblityPayload based on user input
      if (eligibilitySubmitted && eligibility.pincode && eligibility.inhandIncome && eligibility.empStatus) {
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
        const wanted = filters.card_networks.map(n => n.replace(/\s+/g, '').toLowerCase());
        incomingCards = incomingCards.filter((card: any) => {
          const typeStr = (card.card_type || '').toString();
          const parts = typeStr.split(',').map((p: string) => p.replace(/\s+/g, '').toLowerCase());
          // Keep card if any selected network matches any part
          return wanted.some(w => parts.includes(w));
        });
      }

      // 2) Annual Fee range - Fix lifetime free filter
      if (Array.isArray(incomingCards) && filters.annualFees) {
        const val = filters.annualFees as string;

        // Special case for "free" - check both joining fee and annual fee
        if (val === 'free') {
          incomingCards = incomingCards.filter((card: any) => {
            const joiningFeeRaw = card.joining_fee_text ?? card.joining_fee ?? card.joiningFee ?? '0';
            const annualFeeRaw = card.annual_fee_text ?? card.annual_fee ?? card.annualFees ?? '0';
            const joiningFee = parseInt(joiningFeeRaw?.toString().replace(/[^0-9]/g, ''), 10);
            const annualFee = parseInt(annualFeeRaw?.toString().replace(/[^0-9]/g, ''), 10);
            const joiningFeeNum = Number.isFinite(joiningFee) ? joiningFee : 0;
            const annualFeeNum = Number.isFinite(annualFee) ? annualFee : 0;
            return joiningFeeNum === 0 && annualFeeNum === 0;
          });
        } else {
          // Handle range filters
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
      }

      // 3) Credit Score buckets (maximum score)
      if (Array.isArray(incomingCards) && filters.credit_score) {
        if (filters.credit_score.includes('-')) {
          // Handle range format like "0-600", "0-650", etc.
          const [minStr, maxStr] = filters.credit_score.split('-');
          const maxScore = parseInt(maxStr, 10) || Number.POSITIVE_INFINITY;
          incomingCards = incomingCards.filter((card: any) => {
            const scoreRaw = card.crif ?? card.credit_score ?? '';
            const score = parseInt(scoreRaw?.toString().replace(/[^0-9]/g, ''), 10);
            const scoreNum = Number.isFinite(score) ? score : 0;
            return scoreNum <= maxScore;
          });
        }
      }

      // 4) Sort by priority when a category is selected
      if (filters.category && filters.category !== 'all') {
        incomingCards.sort((a: any, b: any) => {
          const categorySlug = categoryToSlug[filters.category];
          const aPriority = a.category_priority?.[categorySlug] ?? a.priority ?? 999999;
          const bPriority = b.category_priority?.[categorySlug] ?? b.priority ?? 999999;
          return Number(aPriority) - Number(bPriority);
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
    // Search is handled on frontend only
    setDisplayCount(12);
  };

  // Frontend search filter
  const filteredCards = cards.filter(card => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const cardName = (card.name || '').toLowerCase();
    const bankName = (card.banks?.name || '').toLowerCase();
    const cardType = (card.card_type || '').toLowerCase();
    const benefits = (card.benefits || '').toLowerCase();
    return cardName.includes(query) || bankName.includes(query) || cardType.includes(query) || benefits.includes(query);
  });
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
      free_cards: false,
      category: "all"
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
      origin: {
        y: 0.6
      }
    });
  };
  const handleGeniusSubmit = async (spendingData: SpendingData) => {
    try {
      const currentCategory = filters.category;

      // Create fresh payload with ONLY the current category's spending data
      const freshPayload: SpendingData = {
        amazon_spends: 0,
        flipkart_spends: 0,
        other_online_spends: 0,
        other_offline_spends: 0,
        grocery_spends_online: 0,
        online_food_ordering: 0,
        fuel: 0,
        dining_or_going_out: 0,
        flights_annual: 0,
        hotels_annual: 0,
        domestic_lounge_usage_quarterly: 0,
        international_lounge_usage_quarterly: 0,
        mobile_phone_bills: 0,
        electricity_bills: 0,
        water_bills: 0,
        insurance_health_annual: 0,
        insurance_car_or_bike_annual: 0,
        rent: 0,
        school_fees: 0,
        ...spendingData // Only current category data will have non-zero values
      };
      setGeniusSpendingData(freshPayload);
      toast.success("Calculating savings...", {
        description: "Finding the best cards for your spending pattern"
      });
      const response = await cardService.calculateCardGenius(freshPayload);
      console.log('Genius API Response:', response);
      if (response.status === 'success' && response.data) {
        const savings: Record<string, number> = {};

        // Prefer explicit savings array
        let items: any[] = [];
        if (Array.isArray(response.data?.savings)) {
          items = response.data.savings;
        } else if (Array.isArray(response.data)) {
          items = response.data;
        } else if (Array.isArray(response.data?.cards)) {
          items = response.data.cards;
        } else if (typeof response.data === 'object') {
          // Some APIs return shape objects; flatten arrays only
          items = Object.values(response.data).flat().filter((v: any) => Array.isArray(v)).flat();
        }
        console.log('Cards array:', items);
        items.forEach((item: any) => {
          const valueRaw = item.total_savings_yearly ?? item.total_savings ?? item.net_savings ?? item.annual_savings ?? item.savings ?? 0;
          const value = Number(valueRaw);
          // Allow 0 savings - only skip if NaN or not a finite number
          if (Number.isNaN(value) || !Number.isFinite(value)) return;
          const id = item.card_id ?? item.cardId ?? item.id ?? item.card?.id;
          const aliasCandidates = [item.seo_card_alias, item.card_alias, item.alias, item.card?.seo_card_alias, item.card?.alias];
          const alias = aliasCandidates.find((a: any) => typeof a === 'string' && a.trim().length > 0);
          if (id != null) {
            const prev = savings[String(id)];
            savings[String(id)] = typeof prev === 'number' ? Math.max(prev, value) : value;
          }
          if (alias) {
            const key = String(alias);
            const prev = savings[key];
            savings[key] = typeof prev === 'number' ? Math.max(prev, value) : value;
          }
        });
        console.log('Calculated savings for category:', currentCategory, savings);

        // Store savings under current category, overwriting previous values
        setCardSavings(prev => ({
          ...prev,
          [currentCategory]: savings
        }));
        toast.success("Savings calculated!", {
          description: `Found savings for ${Object.keys(savings).length} cards`
        });
        confetti({
          particleCount: 100,
          spread: 70,
          origin: {
            y: 0.6
          }
        });
      }
    } catch (error) {
      console.error('Failed to calculate genius:', error);
      toast.error("Failed to calculate savings. Please try again.");
    }
  };

  // Filter sidebar component
  const FilterSidebar = () => <div className="space-y-4">
      {/* Category Filter - Open by default */}
      <Collapsible defaultOpen={true}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded-lg transition-colors">
          <h3 className="font-semibold">Category</h3>
          <ChevronDown className="w-4 h-4 transition-transform ui-expanded:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-2">
          {[{
          id: 'all',
          label: 'All Cards',
          icon: CreditCard
        }, {
          id: 'fuel',
          label: 'Fuel',
          icon: Fuel
        }, {
          id: 'shopping',
          label: 'Shopping',
          icon: ShoppingBag
        }, {
          id: 'online-food',
          label: 'Food Delivery',
          icon: ShoppingCart
        }, {
          id: 'dining',
          label: 'Dining',
          icon: Utensils
        }, {
          id: 'grocery',
          label: 'Grocery',
          icon: Coffee
        }, {
          id: 'travel',
          label: 'Travel',
          icon: Plane
        }].map(cat => <label key={cat.id} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-muted/30 rounded-lg transition-colors">
              <input type="radio" name="category" className="accent-primary w-4 h-4" checked={filters.category === cat.id} onChange={() => handleFilterChange('category', cat.id)} />
              <cat.icon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm flex-1">{cat.label}</span>
            </label>)}
        </CollapsibleContent>
      </Collapsible>

      {/* Annual Fee Range - Collapsed by default */}
      <Collapsible defaultOpen={false}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded-lg transition-colors">
          <h3 className="font-semibold">Annual Fee Range</h3>
          <ChevronDown className="w-4 h-4 transition-transform ui-expanded:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-2">
          {[{
          label: 'All Fees',
          value: ''
        }, {
          label: 'Lifetime Free (₹0)',
          value: 'free'
        }, {
          label: '₹0 - ₹1,000',
          value: '0-1000'
        }, {
          label: '₹1,000 - ₹2,000',
          value: '1000-2000'
        }, {
          label: '₹2,000 - ₹5,000',
          value: '2000-5000'
        }, {
          label: '₹5,000+',
          value: '5000+'
        }].map(fee => <label key={fee.value} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="annualFee" className="accent-primary" checked={filters.annualFees === fee.value} onChange={() => handleFilterChange('annualFees', fee.value)} />
              <span className="text-sm">{fee.label}</span>
            </label>)}
        </CollapsibleContent>
      </Collapsible>

      {/* Credit Score - Collapsed by default - COMMENTED OUT */}
      {/* <Collapsible defaultOpen={false}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded-lg transition-colors">
          <h3 className="font-semibold">Credit Score</h3>
          <ChevronDown className="w-4 h-4 transition-transform ui-expanded:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-2">
          {[
            { label: 'All Scores', value: '' },
            { label: 'Below 600', value: '0-600' },
            { label: 'Upto 650', value: '0-650' },
            { label: 'Upto 750', value: '0-750' },
            { label: 'Upto 800', value: '0-800' }
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
        </CollapsibleContent>
       </Collapsible> */}

      {/* Card Network - Collapsed by default */}
      <Collapsible defaultOpen={false}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded-lg transition-colors">
          <h3 className="font-semibold">Card Network</h3>
          <ChevronDown className="w-4 h-4 transition-transform ui-expanded:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-2">
          {['VISA', 'Mastercard', 'RuPay', 'AmericanExpress'].map(network => <label key={network} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-primary" checked={filters.card_networks.includes(network)} onChange={e => {
            setFilters((prev: any) => ({
              ...prev,
              card_networks: e.target.checked ? [...prev.card_networks, network] : prev.card_networks.filter((n: string) => n !== network)
            }));
          }} />
              <span className="text-sm">{network === 'AmericanExpress' ? 'American Express' : network}</span>
            </label>)}
        </CollapsibleContent>
      </Collapsible>

    </div>;
  return <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Search */}
      <section className="pt-28 pb-12 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight lg:text-[[2.75rem]] xl:text-4xl">
              Discover India's Best Credit&nbsp;Cards
            </h1>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input type="text" placeholder="Search by card name..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} className="pl-12 h-14 text-lg" />
                {searchQuery && <button onClick={() => {
                setSearchQuery("");
                handleSearch();
              }} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>}
              </div>
              <Button size="lg" onClick={handleSearch}>
                Search
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
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Filters</h2>
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                    Clear All
                  </Button>
                </div>
                <FilterSidebar />
              </div>
            </aside>

            {/* Card Grid */}
            <div className="flex-1">
              {/* Horizontal Eligibility Bar - Always Visible */}
              <div className="mb-6 bg-card rounded-2xl shadow-lg border border-border/50 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Pincode</label>
                    <Input type="text" placeholder="Enter 6-digit pincode" maxLength={6} value={eligibility.pincode} onChange={e => setEligibility(prev => ({
                    ...prev,
                    pincode: e.target.value
                  }))} className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Monthly Income (₹)</label>
                    <Input type="number" placeholder="e.g., 50000" value={eligibility.inhandIncome} onChange={e => setEligibility(prev => ({
                    ...prev,
                    inhandIncome: e.target.value
                  }))} className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Employment Status</label>
                    <Select value={eligibility.empStatus} onValueChange={value => setEligibility(prev => ({
                    ...prev,
                    empStatus: value
                  }))}>
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card z-50">
                        <SelectItem value="salaried">Salaried</SelectItem>
                        <SelectItem value="self-employed">Self-Employed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleEligibilitySubmit} size="lg" className="h-12 gap-2" variant={eligibilitySubmitted ? "default" : "default"}>
                    <CheckCircle2 className="w-5 h-5" />
                    {eligibilitySubmitted ? "Eligibility Applied" : "Check Eligibility"}
                  </Button>
                </div>
              </div>

              {/* AI Card Genius Promo - Show only when category is selected (not "All Cards") */}
              {filters.category !== 'all' && (() => {
              const categoryLabels: Record<string, string> = {
                'fuel': 'Fuel',
                'shopping': 'Shopping',
                'online-food': 'Food Delivery',
                'dining': 'Dining',
                'grocery': 'Grocery',
                'travel': 'Travel',
                'utility': 'Utility'
              };
              const categoryName = categoryLabels[filters.category] || 'Category';
              return <div className="mb-4 bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-200/60 dark:border-emerald-800/30 rounded-xl p-3">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 flex-1">
                        <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-500 flex-shrink-0" />
                        <div>
                          <h3 className="text-sm font-semibold text-foreground">
                            Pro Tip: Try our AI Card Genius
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Exploring {categoryName} cards? See your yearly savings instantly.
                          </p>
                        </div>
                      </div>
                      <Button onClick={() => setShowGeniusDialog(true)} size="sm" className="whitespace-nowrap bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-4">
                        Enter My Spends
                      </Button>
                    </div>
                  </div>;
            })()}

              {/* Mobile Filter Button */}
              <div className="lg:hidden mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {Math.min(displayCount, filteredCards.length)} of {filteredCards.length} cards
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
              {(filters.free_cards || filters.annualFees || filters.credit_score || searchQuery) && <div className="mb-4 flex flex-wrap gap-2">
                  {searchQuery && <Badge variant="secondary" className="gap-2">
                      Search: {searchQuery}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => {
                  setSearchQuery("");
                  handleSearch();
                }} />
                    </Badge>}
                  {filters.free_cards && <Badge variant="secondary" className="gap-2">
                      Lifetime Free
                      <X className="w-3 h-3 cursor-pointer" onClick={() => handleFilterChange('free_cards', false)} />
                    </Badge>}
                  {filters.annualFees && <Badge variant="secondary" className="gap-2">
                      Fee: ₹{filters.annualFees}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => handleFilterChange('annualFees', '')} />
                    </Badge>}
                  {filters.credit_score && <Badge variant="secondary" className="gap-2">
                      Credit Score: {filters.credit_score}+
                      <X className="w-3 h-3 cursor-pointer" onClick={() => handleFilterChange('credit_score', '')} />
                    </Badge>}
                </div>}

              {loading ? <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-4 text-muted-foreground">Loading cards...</p>
                </div> : filteredCards.length === 0 ? <div className="text-center py-12">
                  <p className="text-xl text-muted-foreground">No cards found matching your criteria</p>
                  <Button variant="outline" className="mt-4" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div> : <>
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredCards.slice(0, displayCount).map((card, index) => <div key={card.id || index} className="bg-card rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all hover:-translate-y-2 flex flex-col h-full">
                        <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-4 flex-shrink-0">
                          {/* Compare Toggle Icon - Top Right */}
                          <div className="absolute top-3 right-3 z-20">
                            <CompareToggleIcon card={card} />
                          </div>

                          {/* Savings Badge - Top Left */}
                          {filters.category !== 'all' && (() => {
                      const categorySavings = cardSavings[filters.category] || {};
                      const saving = categorySavings[String(card.id)] ?? categorySavings[String(card.seo_card_alias || card.card_alias || '')];
                      if (saving !== undefined && saving !== null) {
                        if (saving === 0) {
                          return <div className="absolute top-3 left-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 text-sm font-bold z-10">
                                    <Sparkles className="w-4 h-4" />
                                    ₹0 Savings/yr
                                  </div>;
                        }
                        return <div className="absolute top-3 left-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 text-sm font-bold z-10">
                                  <Sparkles className="w-4 h-4" />
                                  Save ₹{saving.toLocaleString()}/yr
                                </div>;
                      }
                      return null;
                    })()}

                          {/* Eligibility Badge - Only show if not showing LTF */}
                          {eligibilitySubmitted && !(() => {
                      const categorySavings = cardSavings[filters.category] || {};
                      const saving = categorySavings[String(card.id)] ?? categorySavings[String(card.seo_card_alias || card.card_alias || '')];
                      return !saving && (card.joining_fee_text === "0" || card.joining_fee_text?.toLowerCase?.() === "free");
                    })() && <Badge className="absolute bottom-3 right-3 bg-green-500 gap-1 z-10">
                              <CheckCircle2 className="w-3 h-3" />
                              Eligible
                            </Badge>}

                          {/* LTF Badge */}
                          {(() => {
                      const categorySavings = cardSavings[filters.category] || {};
                      const saving = categorySavings[String(card.id)] ?? categorySavings[String(card.seo_card_alias || card.card_alias || '')];
                      return !saving && (card.joining_fee_text === "0" || card.joining_fee_text?.toLowerCase?.() === "free") && <Badge className="absolute bottom-3 right-3 bg-primary z-10">LTF</Badge>;
                    })()}

                          <img src={card.card_bg_image || card.image} alt={card.name} className="max-h-full max-w-full object-contain" onError={e => {
                      e.currentTarget.src = '/placeholder.svg';
                    }} />
                        </div>

                        <div className="p-6 flex flex-col flex-grow">
                          <div className="mb-2 flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {card.card_type}
                            </Badge>
                            {card.banks?.name && <span className="text-xs text-muted-foreground">{card.banks.name}</span>}
                          </div>
          
                          <h3 className="text-xl font-bold mb-4 line-clamp-2 min-h-[3.5rem]">{card.name}</h3>
                          
                          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg mb-6 min-h-[88px] flex-grow-0">
                            <div className="flex flex-col">
                              <p className="text-xs text-muted-foreground mb-1.5">Joining Fee</p>
                              <p className="text-sm font-semibold mt-auto">
                                {card.joining_fee_text === "0" || card.joining_fee_text?.toLowerCase() === "free" ? "Free" : `₹${card.joining_fee_text}`}
                              </p>
                            </div>
                            <div className="flex flex-col">
                              <p className="text-xs text-muted-foreground mb-1.5">Annual Fee</p>
                              <p className="text-sm font-semibold mt-auto">
                                {card.annual_fee_text === "0" || card.annual_fee_text?.toLowerCase() === "free" ? "Free" : `₹${card.annual_fee_text}`}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2 mt-auto">
                            <Link to={`/cards/${card.seo_card_alias || card.card_alias}`} className="flex-1">
                              <Button variant="outline" className="w-full">Details</Button>
                            </Link>
                            <Button className="flex-1" onClick={() => {
                        if (card.network_url) {
                          openRedirectInterstitial({
                            networkUrl: card.network_url,
                            bankName: extractBankName(card),
                            bankLogo: extractBankLogo(card),
                            cardName: card.name,
                            cardId: card.id
                          });
                        }
                      }}>
                              Apply
                            </Button>
                          </div>
                        </div>
                      </div>)}
                  </div>
                  
                  {/* Load More Button */}
                  {displayCount < filteredCards.length && <div className="text-center mt-8">
                      <Button size="lg" variant="outline" onClick={loadMore} disabled={isLoadingMore}>
                        {isLoadingMore ? <>
                            <div className="inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                            Loading...
                          </> : `Load More Cards (${filteredCards.length - displayCount} remaining)`}
                      </Button>
                    </div>}
                </>}
            </div>
          </div>
        </div>
      </section>

      {/* Genius Dialog */}
      <GeniusDialog open={showGeniusDialog} onOpenChange={setShowGeniusDialog} category={filters.category} onSubmit={handleGeniusSubmit} />

      {/* Comparison Pill */}
      <ComparePill />
    </div>;
};
export default CardListing;