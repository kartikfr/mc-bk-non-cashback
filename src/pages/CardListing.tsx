import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, X, ArrowUpDown, CheckCircle2, Sparkles, ShoppingBag, Utensils, Fuel, Plane, Coffee, ShoppingCart, CreditCard } from "lucide-react";
import { cardService, SpendingData } from "@/services/cardService";
import { Badge } from "@/components/ui/badge";
import GeniusDialog from "@/components/GeniusDialog";
import { CompareToggleIcon } from "@/components/comparison/CompareToggleIcon";
import { ComparePill } from "@/components/comparison/ComparePill";
import { useComparison } from "@/contexts/ComparisonContext";
import { redirectToCardApplication } from "@/utils/redirectHandler";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import confetti from 'canvas-confetti';
import { toast } from "sonner";
import { getCardAlias, getCardKey } from "@/utils/cardAlias";

const VALID_CATEGORIES = ['all', 'fuel', 'shopping', 'online-food', 'dining', 'grocery', 'travel', 'utility'];
const normalizeCategory = (value: string | null) => {
  if (!value) return 'all';
  return VALID_CATEGORIES.includes(value) ? value : 'all';
};

const CardListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [displayCount, setDisplayCount] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [eligibilityOpen, setEligibilityOpen] = useState(false);
  const [eligibilitySubmitted, setEligibilitySubmitted] = useState(false);
  const [eligibleCardAliases, setEligibleCardAliases] = useState<string[]>([]);
  const [showGeniusDialog, setShowGeniusDialog] = useState(false);
  const [geniusSpendingData, setGeniusSpendingData] = useState<SpendingData | null>(null);
  const [cardSavings, setCardSavings] = useState<Record<string, Record<string, number>>>({});
  const [showStickyEligibility, setShowStickyEligibility] = useState(false);
  const [showStickyFilter, setShowStickyFilter] = useState(false);
  const lastScrollY = useRef(0);
  const heroRef = useRef<HTMLElement | null>(null);
  const eligibilityRef = useRef<HTMLDivElement | null>(null);
  const filtersRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);

  // Comparison context (for mobile "View Compare" action)
  const { selectedCards } = useComparison();

  // Get category from URL params, default to "all"
  const initialCategory = normalizeCategory(searchParams.get('category'));

  // Filters - sort_by will be sent to API
  const [filters, setFilters] = useState({
    banks_ids: [] as number[],
    card_networks: [] as string[],
    annualFees: "",
    credit_score: "",
    sort_by: "priority",
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
  const abortControllerRef = useRef<AbortController | null>(null);
  useEffect(() => {
    fetchCards();
  }, [filters]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // Scroll listener for sticky elements
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const isScrollingUp = currentY < lastScrollY.current;
      lastScrollY.current = currentY;

      setShowStickyEligibility(isScrollingUp && currentY > 300 && !eligibilitySubmitted);
      setShowStickyFilter(currentY > 60);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [eligibilitySubmitted]);

  const scrollToSection = (ref: React.RefObject<HTMLElement | HTMLDivElement>) => {
    if (!ref.current) return;
    const offset = window.innerWidth < 1024 ? 70 : 0;
    const top = ref.current.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const fetchCards = async () => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setLoading(true);

      // Build base payload with active filters
      const baseParams: any = {
        slug: categoryToSlug[filters.category] || "",
        banks_ids: filters.banks_ids || [],
        card_networks: filters.card_networks || [],
        annualFees: filters.annualFees === "free" ? "" : filters.annualFees || "",
        credit_score: filters.credit_score || "",
        sort_by: filters.sort_by || "priority",
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
      const response = await cardService.getCardListing(baseParams, controller.signal);
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

      // 4) Sort by priority (always, regardless of category)
      // Lower priority number = higher priority (priority 1 comes before priority 66)
      if (Array.isArray(incomingCards)) {
        incomingCards.sort(compareCardsByPriority);
      }
      setCards(Array.isArray(incomingCards) ? [...incomingCards] : []);
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        return;
      }
      console.error('Failed to fetch cards:', error);
      toast.error("Failed to load cards. Please try again.");
      setCards([]);
    } finally {
      if (!controller.signal.aborted) {
      setLoading(false);
      }
    }
  };
  const handleSearch = () => {
    // Search is handled on frontend only
    setDisplayCount(12);
  };

  const parsePriorityValue = (value: any): number => {
    if (value === null || value === undefined) return Number.POSITIVE_INFINITY;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    const parsed = parseInt(String(value).replace(/[^0-9-]/g, ''), 10);
    return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY;
  };

  const getPriorityValue = (card: any, category: string): number => {
    if (category && category !== 'all') {
      const categorySlug = categoryToSlug[category];
      const categoryPriority = card?.category_priority?.[categorySlug];
      if (categoryPriority !== undefined && categoryPriority !== null) {
        return parsePriorityValue(categoryPriority);
      }
    }
    return parsePriorityValue(card?.priority);
  };

  // Frontend search filter
  const compareCardsByPriority = (a: any, b: any) => {
    const aPriorityValue = getPriorityValue(a, filters.category);
    const bPriorityValue = getPriorityValue(b, filters.category);
    if (aPriorityValue !== bPriorityValue) {
      return aPriorityValue - bPriorityValue;
    }

    // Tie-breaker 1: Higher ratings first
    const aRating = parseFloat(a.rating) || 0;
    const bRating = parseFloat(b.rating) || 0;
    if (aRating !== bRating) {
      return bRating - aRating;
    }

    // Tie-breaker 2: alphabetical order
    return (a.name || '').localeCompare(b.name || '');
  };

  const sortedCards = useMemo(() => {
    if (!Array.isArray(cards)) return [];
    return [...cards].sort(compareCardsByPriority);
  }, [cards, filters.category]);

  const filteredCards = useMemo(() => {
    // 1) Apply search filter
    let base = sortedCards.filter(card => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      const cardName = (card.name || '').toLowerCase();
      const bankName = (card.banks?.name || '').toLowerCase();
      const cardType = (card.card_type || '').toLowerCase();
      const benefits = (card.benefits || '').toLowerCase();
      return cardName.includes(query) || bankName.includes(query) || cardType.includes(query) || benefits.includes(query);
    });

    // 2) Apply eligibility filter purely on frontend (seo_card_alias mapping)
    if (eligibilitySubmitted && eligibleCardAliases.length > 0) {
      const eligibleSet = new Set(eligibleCardAliases.map(String));
      base = base.filter(card => {
        const alias = getCardAlias(card) || card.seo_card_alias || card.card_alias;
        return alias && eligibleSet.has(String(alias));
      });
    }

    return base;
  }, [sortedCards, searchQuery, eligibilitySubmitted, eligibleCardAliases]);
  const loadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setDisplayCount(prev => prev + 12);
      setIsLoadingMore(false);
    }, 500);
  };
  const syncCategoryParam = (categoryValue: string) => {
    const params = new URLSearchParams(searchParams);
    if (categoryValue === 'all') {
      params.delete('category');
    } else {
      params.set('category', categoryValue);
    }
    setSearchParams(params, { replace: true });
  };

  const handleFilterChange = (filterType: string, value: string | boolean) => {
    if (filterType === 'category' && typeof value === 'string') {
      const normalized = normalizeCategory(value);
      setFilters((prev: any) => ({
        ...prev,
        category: normalized
      }));
      syncCategoryParam(normalized);
      setDisplayCount(12);
      return;
    }

    setFilters((prev: any) => ({
      ...prev,
      [filterType]: value
    }));
  };

  useEffect(() => {
    const categoryParam = normalizeCategory(searchParams.get('category'));
    if (categoryParam !== filters.category) {
      setFilters((prev: any) => ({
        ...prev,
        category: categoryParam
      }));
      setDisplayCount(12);
    }
  }, [searchParams, filters.category]);
  const clearFilters = () => {
    syncCategoryParam('all');
    setFilters({
      banks_ids: [],
      card_networks: [],
      annualFees: "",
      credit_score: "",
      sort_by: "priority",
      free_cards: false,
      category: "all"
    });
    setSearchQuery("");
    setDisplayCount(12);

    // Reset eligibility data
    setEligibilitySubmitted(false);
    setEligibleCardAliases([]);
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
    try {
      // Call dedicated eligibility API to determine which cards are eligible
      const response = await fetch('https://bk-api.bankkaro.com/sp/api/cg-eligiblity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pincode: eligibility.pincode,
          inhandIncome: eligibility.inhandIncome,
          empStatus: eligibility.empStatus
        })
      });

      const data = await response.json();

      if (data?.status && Array.isArray(data.data)) {
        const eligibleCards = data.data.filter((card: any) => card.eligible === true);
        const ineligibleCount = data.data.length - eligibleCards.length;
        const aliases = eligibleCards
          .map((card: any) => card.seo_card_alias || card.card_alias)
          .filter(Boolean);

        setEligibleCardAliases(aliases);
        setEligibilitySubmitted(true);
        setEligibilityOpen(false);

        // Refetch cards with eligibility criteria and other filters
        await fetchCards();

        if (aliases.length > 0) {
          toast.success("Eligibility criteria applied!", {
            description: `${ineligibleCount} cards filtered out. Showing ${aliases.length} eligible cards.`
          });
          confetti({
            particleCount: 60,
            spread: 50,
            origin: {
              y: 0.6
            }
          });
        } else {
          toast.error("No Eligible Cards", {
            description: "No cards match your eligibility criteria"
          });
        }
      } else {
        toast.error("No Eligible Cards", {
          description: "No cards match your eligibility criteria"
        });
      }
    } catch (error) {
      console.error('Eligibility check error:', error);
      toast.error("We couldn't check eligibility right now. Please try again.");
    }
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
        items.forEach((item: any) => {
          const valueRaw = item.total_savings_yearly ?? item.total_savings ?? item.net_savings ?? item.annual_savings ?? item.savings ?? 0;
          const value = Number(valueRaw);
          // Allow 0 savings - only skip if NaN or not a finite number
          if (Number.isNaN(value) || !Number.isFinite(value)) return;
          const id = item.card_id ?? item.cardId ?? item.id ?? item.card?.id;
          const alias = getCardAlias(item);
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
  const handleApplyClick = (card: any) => {
    const success = redirectToCardApplication(card);
    if (!success) {
      toast.error("Unable to open the bank site. Please allow pop-ups or try again later.");
    }
  };

  // Filter sidebar component
  const FilterSidebar = () => <div className="space-y-3">
      {/* Category Filter - Open by default */}
      <Collapsible defaultOpen={true}>
        <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 hover:bg-muted/30 rounded-lg transition-colors text-left font-semibold touch-target">
          <h3 className="font-semibold">Category</h3>
          <ChevronDown className="w-4 h-4 transition-transform ui-expanded:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-2 pl-1">
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
        }].map(cat => <label key={cat.id} className="filter-option flex items-center gap-3 cursor-pointer px-3 py-3 transition-all touch-target">
              <input type="radio" name="category" className="accent-primary w-5 h-5" checked={filters.category === cat.id} onChange={() => handleFilterChange('category', cat.id)} />
              <cat.icon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm flex-1">{cat.label}</span>
            </label>)}
        </CollapsibleContent>
      </Collapsible>

      {/* Annual Fee Range - Collapsed by default */}
      <Collapsible defaultOpen={false}>
        <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 hover:bg-muted/30 rounded-lg transition-colors touch-target">
          <h3 className="font-semibold">Annual Fee Range</h3>
          <ChevronDown className="w-4 h-4 transition-transform ui-expanded:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-2 pl-1">
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
        }].map(fee => <label key={fee.value} className="filter-option flex items-center gap-3 cursor-pointer px-3 py-3 transition-all touch-target">
              <input type="radio" name="annualFee" className="accent-primary w-5 h-5" checked={filters.annualFees === fee.value} onChange={() => handleFilterChange('annualFees', fee.value)} />
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
        <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 hover:bg-muted/30 rounded-lg transition-colors text-left font-semibold touch-target">
          <h3 className="font-semibold">Card Network</h3>
          <ChevronDown className="w-4 h-4 transition-transform ui-expanded:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-2 pl-1">
          {['VISA', 'Mastercard', 'RuPay', 'AmericanExpress'].map(network => <label key={network} className="filter-option flex items-center gap-3 cursor-pointer px-3 py-3 transition-all touch-target">
              <input type="checkbox" className="accent-primary w-5 h-5" checked={filters.card_networks.includes(network)} onChange={e => {
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
      <section ref={heroRef} className="hero-card-listing pt-24 sm:pt-28 pb-8 sm:pb-12 bg-gradient-hero">
        <div className="section-shell">
          {/* Mobile & Desktop unified layout */}
          <div className="max-w-3xl mx-auto text-center mb-6 sm:mb-8 space-y-2 sm:space-y-3 px-4 hero-card-listing-header">
            <h1 className="hero-card-listing-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              Discover India's Best Credit&nbsp;Cards
            </h1>
          </div>
          
          <div className="max-w-2xl mx-auto px-4 sm:px-0 hero-card-listing-body">
            <div className="hero-card-listing-actions flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                  <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 sm:w-5 sm:h-5" />
                  <Input 
                    type="text" 
                    placeholder="Search by card name..." 
                    value={searchQuery} 
                    onChange={e => setSearchQuery(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleSearch()} 
                    className="hero-card-listing-input pl-10 sm:pl-12 pr-10 sm:pr-12 h-12 sm:h-14 text-sm sm:text-base md:text-lg rounded-xl touch-target" 
                  />
                  {searchQuery && (
                    <button onClick={() => {
                setSearchQuery("");
                handleSearch();
                    }} className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground touch-target p-1">
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  )}
            </div>
                <Button
                  size="lg"
                  className="hero-card-listing-search-btn h-12 sm:h-14 w-full sm:w-auto px-6 sm:px-8 touch-target"
                  onClick={handleSearch}
                >
                  <span className="hidden xs:inline">Search</span>
                  <Search className="w-4 h-4 xs:hidden" />
                </Button>
              </div>
            </div>
        </div>
      </section>


      {/* Main Content */}
      <section className="flex-1 overflow-hidden">
        <div className="section-shell h-full flex flex-col">
          <div className="flex flex-col lg:flex-row gap-8 h-full overflow-visible py-6">
            {/* Desktop Filters Sidebar */}
            <aside className="hidden lg:block w-72 flex-shrink-0 overflow-y-auto">
              <div className="bg-card rounded-2xl shadow-lg p-6 sticky top-28">
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
            <div className="flex-1 flex flex-col overflow-visible">
              {/* Eligibility Section - Collapsible on Mobile, Always Visible on Desktop */}
              <div ref={eligibilityRef} className="mb-4 sm:mb-6">
                {/* Mobile: Collapsible */}
                <div className="lg:hidden">
                  <Collapsible open={eligibilityOpen} onOpenChange={setEligibilityOpen}>
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/60 dark:border-emerald-800/30 overflow-hidden">
                      <CollapsibleTrigger className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 transition-colors touch-target">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-500 flex-shrink-0" />
                          <div className="text-left">
                            <h3 className="font-semibold text-xs sm:text-sm text-foreground">Check Eligibility</h3>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">Quick 3-field check</p>
                          </div>
                        </div>
                        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground transition-transform ui-state-open:rotate-180" />
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <div className="p-3 sm:p-4 pt-0">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 items-end">
                            <div>
                              <Input 
                                type="text" 
                                inputMode="numeric" 
                                placeholder="Pincode" 
                                maxLength={6} 
                                value={eligibility.pincode} 
                                onChange={e => setEligibility(prev => ({
                                  ...prev,
                                  pincode: e.target.value.replace(/\D/g, '')
                                }))} 
                                className="h-11 text-sm rounded-lg bg-white dark:bg-background" 
                              />
                            </div>
                            <div>
                              <Input 
                                type="number" 
                                placeholder="Monthly Income" 
                                value={eligibility.inhandIncome} 
                                onChange={e => setEligibility(prev => ({
                                  ...prev,
                                  inhandIncome: e.target.value
                                }))} 
                                className="h-11 text-sm rounded-lg bg-white dark:bg-background" 
                              />
                            </div>
                            <div>
                              <Select value={eligibility.empStatus} onValueChange={value => setEligibility(prev => ({
                                ...prev,
                                empStatus: value
                              }))}>
                                <SelectTrigger className="h-11 text-sm rounded-lg bg-white dark:bg-background">
                                  <SelectValue placeholder="Employment" />
                                </SelectTrigger>
                                <SelectContent className="bg-card z-50">
                                  <SelectItem value="salaried">Salaried</SelectItem>
                                  <SelectItem value="self-employed">Self-Employed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Button 
                              onClick={handleEligibilitySubmit} 
                              size="lg" 
                              className="h-11 gap-2 w-full bg-emerald-600 hover:bg-emerald-700" 
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span className="text-sm font-semibold">{eligibilitySubmitted ? "Applied" : "Check"}</span>
                            </Button>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                </div>

                {/* Desktop: Always Visible */}
                <div className="hidden lg:block bg-card rounded-2xl shadow-lg border border-border/50 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Pincode</label>
                      <Input 
                        type="text" 
                        inputMode="numeric" 
                        placeholder="Enter 6-digit pincode" 
                        maxLength={6} 
                        value={eligibility.pincode} 
                        onChange={e => setEligibility(prev => ({
                    ...prev,
                    pincode: e.target.value.replace(/\D/g, '')
                        }))} 
                        className="h-12" 
                      />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Monthly Income (₹)</label>
                      <Input 
                        type="number" 
                        placeholder="e.g., 50000" 
                        value={eligibility.inhandIncome} 
                        onChange={e => setEligibility(prev => ({
                    ...prev,
                    inhandIncome: e.target.value
                        }))} 
                        className="h-12" 
                      />
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
                    <Button 
                      onClick={handleEligibilitySubmit} 
                      size="lg" 
                      className="h-12 gap-2" 
                      variant={eligibilitySubmitted ? "default" : "default"}
                    >
                    <CheckCircle2 className="w-5 h-5" />
                    {eligibilitySubmitted ? "Eligibility Applied" : "Check Eligibility"}
                  </Button>
                  </div>
                </div>
              </div>


              {/* AI Card Genius Promo - Desktop Only */}
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
              return <div className="hidden lg:block mb-4 bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-200/60 dark:border-emerald-800/30 rounded-xl p-3">
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

              {/* Desktop Filter Info */}
              <div className="hidden lg:flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  Showing {Math.min(displayCount, filteredCards.length)} of {filteredCards.length} cards
                </p>
              </div>

              {/* Mobile Filter Info Bar - Just show count */}
              <div ref={filtersRef} className="lg:hidden mb-3">
                <div className="flex items-center justify-between px-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{filteredCards.length}</span> cards found
                  </p>
                  {(filters.category !== 'all' || filters.card_networks.length > 0 || filters.annualFees || eligibilitySubmitted) && (
                    <button 
                      onClick={clearFilters}
                      className="text-xs text-primary hover:text-primary/80 font-semibold"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                
                {/* Hidden sheet trigger for programmatic open */}
                <Sheet>
                  <SheetTrigger asChild>
                    <button id="mobile-filter-trigger" className="hidden"></button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl px-0">
                      <div className="drag-handle" />
                      <SheetHeader className="text-left mb-4 px-4">
                        <div className="flex items-center justify-between">
                          <SheetTitle className="text-lg font-bold">Filters</SheetTitle>
                          <span className="text-xs text-muted-foreground">{filteredCards.length} cards</span>
                        </div>
                    </SheetHeader>
                      <div className="overflow-y-auto h-[calc(70vh-140px)] px-4 space-y-5 pb-24">
                      <FilterSidebar />
                    </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-background border-t border-border p-4 shadow-lg">
                        <div className="flex gap-3">
                          <SheetClose asChild>
                            <Button variant="outline" className="flex-1 h-11 text-sm font-semibold" onClick={clearFilters}>
                              Clear
                            </Button>
                          </SheetClose>
                          <SheetClose asChild>
                            <Button className="flex-1 h-11 text-sm font-bold">
                              Show {filteredCards.length} Cards
                            </Button>
                          </SheetClose>
                        </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Active Filters */}
              {(filters.category !== 'all' || filters.card_networks.length > 0 || filters.free_cards || filters.annualFees || filters.credit_score || eligibilitySubmitted || geniusSpendingData || searchQuery) && <div className="mb-4 flex flex-wrap gap-2">
                  {searchQuery && <Badge variant="secondary" className="gap-2">
                      Search: {searchQuery}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => {
                  setSearchQuery("");
                  handleSearch();
                }} />
                    </Badge>}
                  {filters.category !== 'all' && <Badge variant="secondary" className="gap-2">
                      Category: {(() => {
                        const categoryLabels: Record<string, string> = {
                          'fuel': 'Fuel',
                          'shopping': 'Shopping',
                          'online-food': 'Food Delivery',
                          'dining': 'Dining',
                          'grocery': 'Grocery',
                          'travel': 'Travel',
                          'utility': 'Utility'
                        };
                        return categoryLabels[filters.category] || filters.category;
                      })()}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => handleFilterChange('category', 'all')} />
                    </Badge>}
                  {filters.card_networks.map(network => (
                    <Badge key={network} variant="secondary" className="gap-2">
                      {network === 'AmericanExpress' ? 'American Express' : network}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => {
                        setFilters(prev => ({
                          ...prev,
                          card_networks: prev.card_networks.filter(n => n !== network)
                        }));
                      }} />
                    </Badge>
                  ))}
                  {filters.free_cards && <Badge variant="secondary" className="gap-2">
                      Lifetime Free
                      <X className="w-3 h-3 cursor-pointer" onClick={() => handleFilterChange('free_cards', false)} />
                    </Badge>}
                  {filters.annualFees && !filters.free_cards && <Badge variant="secondary" className="gap-2">
                      Fee: ₹{filters.annualFees}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => handleFilterChange('annualFees', '')} />
                    </Badge>}
                  {filters.credit_score && <Badge variant="secondary" className="gap-2">
                      Credit Score: {filters.credit_score}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => handleFilterChange('credit_score', '')} />
                    </Badge>}
                  {eligibilitySubmitted && <Badge variant="secondary" className="gap-2 bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700">
                      <CheckCircle2 className="w-3 h-3" />
                      Eligibility Applied
                      <X className="w-3 h-3 cursor-pointer" onClick={async () => {
                        setEligibilitySubmitted(false);
                        setEligibility({
                          pincode: "",
                          inhandIncome: "",
                          empStatus: "salaried"
                        });
                        await fetchCards();
                        toast.success("Eligibility filter removed");
                      }} />
                    </Badge>}
                  {geniusSpendingData && <Badge variant="secondary" className="gap-2 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700">
                      <Sparkles className="w-3 h-3" />
                      Category Genius Applied
                      <X className="w-3 h-3 cursor-pointer" onClick={() => {
                        setGeniusSpendingData(null);
                        setCardSavings({});
                        toast.success("Category genius filter removed");
                      }} />
                    </Badge>}
                </div>}

              {/* Cards Grid - Scrollable */}
              <div ref={cardsRef} className="flex-1 overflow-y-auto px-1">
              {loading ? <div className="text-center py-16">
                  <div className="inline-block w-10 h-10 sm:w-12 sm:h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-4 sm:mt-6 text-sm sm:text-base text-muted-foreground">Loading your perfect cards...</p>
                </div> : filteredCards.length === 0 ? <div className="text-center py-16 px-4">
                  <p className="text-lg sm:text-xl text-muted-foreground mb-4">No cards found matching your criteria</p>
                  <Button variant="outline" className="mt-4 touch-target" onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                </div> : <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 pb-6">
                    {filteredCards.slice(0, displayCount).map((card, index) => <div key={card.id || index} className="card-item bg-card rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all hover:scale-[1.02] lg:hover:-translate-y-2 flex flex-col h-full active:scale-[0.98]">
                        <div className="card-image-container relative h-40 sm:h-44 md:h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-3 sm:p-4 flex-shrink-0">
                          {/* Compare Toggle Icon - Top Right */}
                          <div className="absolute top-3 right-3 z-20">
                            <CompareToggleIcon card={card} />
                          </div>

                          {/* Savings Badge */}
                          {filters.category !== 'all' && (() => {
                      const categorySavings = cardSavings[filters.category] || {};
                      const cardKey = getCardKey(card);
                      const saving = categorySavings[String(card.id)] ?? categorySavings[cardKey];
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

                          {/* Eligibility Badge - Only show for cards that are actually eligible (and not already showing savings or LTF) */}
                          {eligibilitySubmitted && eligibleCardAliases.length > 0 && !(() => {
                      const categorySavings = cardSavings[filters.category] || {};
                      const cardKey = getCardKey(card);
                      const saving = categorySavings[String(card.id)] ?? categorySavings[cardKey];
                      return saving !== undefined && saving !== null;
                    })() && !((card.joining_fee_text === "0" || card.joining_fee_text?.toLowerCase?.() === "free")) && (() => {
                      const alias = getCardAlias(card) || card.seo_card_alias || card.card_alias;
                      return alias && eligibleCardAliases.includes(String(alias));
                    })() && (
                            <Badge className="absolute bottom-3 right-3 bg-green-500 gap-1 z-10">
                              <CheckCircle2 className="w-3 h-3" />
                              Eligible
                            </Badge>
                          )}

                          {/* LTF Badge */}
                          {(() => {
                      const categorySavings = cardSavings[filters.category] || {};
                      const cardKey = getCardKey(card);
                      const saving = categorySavings[String(card.id)] ?? categorySavings[cardKey];
                      return !saving && (card.joining_fee_text === "0" || card.joining_fee_text?.toLowerCase?.() === "free") && <Badge className="absolute bottom-3 right-3 bg-primary z-10">LTF</Badge>;
                    })()}

                          <img src={card.card_bg_image || card.image} alt={card.name} className="max-h-full max-w-full object-contain" onError={e => {
                      e.currentTarget.src = '/placeholder.svg';
                    }} />
                        </div>

                        <div className="p-5 sm:p-6 flex flex-col flex-grow gap-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {card.card_type || 'Credit Card'}
                            </Badge>
                            {card.banks?.name && (
                              <span className="text-xs text-muted-foreground">
                                {card.banks.name}
                              </span>
                            )}
                          </div>
          
                          <div className="space-y-1.5">
                            <h3 className="text-lg sm:text-xl font-bold leading-snug line-clamp-2">{card.name}</h3>
                            {(card.reward_rate || card.welcome_bonus) && <p className="text-xs text-muted-foreground line-clamp-2 md:hidden">
                                {card.reward_rate || card.welcome_bonus}
                              </p>}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 md:gap-4 p-3 md:p-4 bg-muted/30 rounded-lg">
                            <div className="flex flex-col">
                              <p className="text-[11px] text-muted-foreground mb-1">Joining</p>
                              <p className="text-sm font-semibold">
                                {card.joining_fee_text === "0" || card.joining_fee_text?.toLowerCase() === "free" ? "Free" : `₹${card.joining_fee_text}`}
                              </p>
                            </div>
                            <div className="flex flex-col">
                              <p className="text-[11px] text-muted-foreground mb-1">Annual</p>
                              <p className="text-sm font-semibold">
                                {card.annual_fee_text === "0" || card.annual_fee_text?.toLowerCase() === "free" ? "Free" : `₹${card.annual_fee_text}`}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col md:flex-row gap-2 mt-auto">
                            <Link to={`/cards/${getCardAlias(card) || card.id}`} className="flex-1">
                              <Button variant="outline" className="w-full h-11 md:h-10 text-sm font-semibold">
                                Details
                              </Button>
                            </Link>
                            <Button className="flex-1 h-11 md:h-10 text-sm font-semibold" onClick={() => handleApplyClick(card)}>
                              Apply&nbsp;Now
                            </Button>
                          </div>
                        </div>
                      </div>)}
                  </div>
                  
                  {/* Load More Button */}
                  {displayCount < filteredCards.length && <div className="text-center mt-6 sm:mt-8 px-4 sm:px-0">
                      <Button 
                        size="lg" 
                        className="w-full sm:w-auto sm:min-w-[280px] touch-target h-12 sm:h-14 font-semibold" 
                        variant="outline" 
                        onClick={loadMore} 
                        disabled={isLoadingMore}
                      >
                        {isLoadingMore ? <>
                            <div className="inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                            <span className="text-sm sm:text-base">Loading...</span>
                          </> : <>
                            <span className="text-sm sm:text-base">Load More Cards</span>
                            <span className="ml-2 text-xs sm:text-sm opacity-70">({filteredCards.length - displayCount} remaining)</span>
                          </>}
                      </Button>
                    </div>}
                </>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Eligibility Bar (Top) - Shows on scroll */}
      {showStickyEligibility && !eligibilitySubmitted && (
        <div className="lg:hidden fixed top-14 left-0 right-0 z-40 bg-white dark:bg-background border-b border-border shadow-md animate-in slide-in-from-top duration-300">
          <div className="px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold">Check Eligibility</span>
            </div>
            <Button 
              size="sm" 
              onClick={() => {
                setEligibilityOpen(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700"
            >
              Quick Check
            </Button>
          </div>
        </div>
      )}

      {/* Floating Try Genius Widget (Bottom-Right) - Shows when category selected */}
      {filters.category !== 'all' && !showGeniusDialog && (
        <button
          onClick={() => setShowGeniusDialog(true)}
          className="lg:hidden fixed bottom-20 right-4 z-50 bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-700 hover:to-emerald-700 text-white rounded-full shadow-2xl hover:shadow-purple-500/50 p-3 sm:p-4 flex items-center gap-2 animate-in zoom-in duration-300 touch-target group active:scale-95 transition-all"
          style={{ bottom: showStickyFilter ? '80px' : '20px' }}
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
          </div>
          <span className="font-bold text-sm whitespace-nowrap">Try Genius</span>
        </button>
      )}

      {/* Sticky Filter Button (Bottom) - Shows on scroll */}
      {showStickyFilter && (
        <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom duration-300 px-4 w-full">
          <div className="bg-card/95 backdrop-blur-md border border-primary/40 rounded-full shadow-2xl px-4 py-2 flex items-center justify-center gap-3">
            {/* Filters trigger */}
            <button
              onClick={() => document.getElementById('mobile-filter-trigger')?.click()}
              className="flex items-center gap-2 text-foreground text-xs font-semibold"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {(filters.category !== 'all' || filters.card_networks.length > 0 || filters.annualFees || eligibilitySubmitted) && (
                <span className="ml-1 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] rounded-full font-bold">
                  {[filters.category !== 'all', filters.card_networks.length > 0, filters.annualFees, eligibilitySubmitted].filter(Boolean).length}
                </span>
              )}
            </button>

            {/* Divider */}
            {selectedCards.length > 0 && (
              <>
                <span className="h-5 w-px bg-border" />
                <button
                  onClick={() => window.dispatchEvent(new Event('openComparison'))}
                  className="text-primary font-semibold text-xs"
                >
                  View Compare
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Genius Dialog */}
      <GeniusDialog open={showGeniusDialog} onOpenChange={setShowGeniusDialog} category={filters.category} onSubmit={handleGeniusSubmit} />

      {/* Comparison Pill - visible on mobile & desktop */}
      <ComparePill />
      
      <Footer />
    </div>;
};
export default CardListing;