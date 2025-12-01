import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SpendingInput } from "@/components/ui/spending-input";
import { ArrowLeft, ArrowRight, Sparkles, ChevronDown, Info, Check, X, TrendingUp, CheckCircle2 } from "lucide-react";
import { cardService } from "@/services/cardService";
import type { SpendingData } from "@/services/cardService";
import { useToast } from "@/hooks/use-toast";
import { sanitizeHtml } from "@/lib/sanitize";
import { redirectToCardApplication } from "@/utils/redirectHandler";
import { enrichCardGeniusResults, CardGeniusResult } from "@/lib/cardGenius";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import logo from "@/assets/moneycontrol-logo.png";
interface SpendingQuestion {
  field: string;
  question: string;
  emoji: string;
  min: number;
  max: number;
  step: number;
  showCurrency?: boolean;
  suffix?: string;
}
const questions: SpendingQuestion[] = [{
  field: 'amazon_spends',
  question: 'How much do you spend on Amazon in a month?',
  emoji: '🛍️',
  min: 0,
  max: 100000,
  step: 500
}, {
  field: 'flipkart_spends',
  question: 'How much do you spend on Flipkart in a month?',
  emoji: '📦',
  min: 0,
  max: 100000,
  step: 500
}, {
  field: 'other_online_spends',
  question: 'How much do you spend on other online shopping?',
  emoji: '💸',
  min: 0,
  max: 50000,
  step: 500
}, {
  field: 'other_offline_spends',
  question: 'How much do you spend at local shops or offline stores monthly?',
  emoji: '🏪',
  min: 0,
  max: 100000,
  step: 1000
}, {
  field: 'grocery_spends_online',
  question: 'How much do you spend on groceries (Blinkit, Zepto etc.) every month?',
  emoji: '🥦',
  min: 0,
  max: 50000,
  step: 500
}, {
  field: 'online_food_ordering',
  question: 'How much do you spend on food delivery apps in a month?',
  emoji: '🛵🍜',
  min: 0,
  max: 30000,
  step: 500
}, {
  field: 'fuel',
  question: 'How much do you spend on fuel in a month?',
  emoji: '⛽',
  min: 0,
  max: 20000,
  step: 500
}, {
  field: 'dining_or_going_out',
  question: 'How much do you spend on dining out in a month?',
  emoji: '🥗',
  min: 0,
  max: 30000,
  step: 500
}, {
  field: 'flights_annual',
  question: 'How much do you spend on flights in a year?',
  emoji: '✈️',
  min: 0,
  max: 500000,
  step: 5000
}, {
  field: 'hotels_annual',
  question: 'How much do you spend on hotel stays in a year?',
  emoji: '🛌',
  min: 0,
  max: 300000,
  step: 5000
}, {
  field: 'domestic_lounge_usage_quarterly',
  question: 'How often do you visit domestic airport lounges in a year?',
  emoji: '🇮🇳',
  min: 0,
  max: 50,
  step: 1,
  showCurrency: false,
  suffix: ' visits'
}, {
  field: 'international_lounge_usage_quarterly',
  question: 'Plus, what about international airport lounges?',
  emoji: '🌎',
  min: 0,
  max: 50,
  step: 1,
  showCurrency: false,
  suffix: ' visits'
}, {
  field: 'mobile_phone_bills',
  question: 'How much do you spend on recharging your mobile or Wi-Fi monthly?',
  emoji: '📱',
  min: 0,
  max: 10000,
  step: 100
}, {
  field: 'electricity_bills',
  question: "What's your average monthly electricity bill?",
  emoji: '⚡️',
  min: 0,
  max: 20000,
  step: 500
}, {
  field: 'water_bills',
  question: 'And what about your monthly water bill?',
  emoji: '💧',
  min: 0,
  max: 5000,
  step: 100
}, {
  field: 'insurance_health_annual',
  question: 'How much do you pay for health or term insurance annually?',
  emoji: '🛡️',
  min: 0,
  max: 100000,
  step: 1000
}, {
  field: 'insurance_car_or_bike_annual',
  question: 'How much do you pay for car or bike insurance annually?',
  emoji: '🚗',
  min: 0,
  max: 50000,
  step: 1000
}, {
  field: 'rent',
  question: 'How much do you pay for house rent every month?',
  emoji: '🏠',
  min: 0,
  max: 100000,
  step: 1000
}, {
  field: 'school_fees',
  question: 'How much do you pay in school fees monthly?',
  emoji: '🎓',
  min: 0,
  max: 50000,
  step: 1000
}];
const funFacts = ["Credit cards were first introduced in India in 1980!", "Indians saved over ₹2,000 crores in credit card rewards last year!", "Premium cards often pay for themselves through lounge access alone.", "The average Indian has 2-3 cards but maximizes only one!", "Reward points can be worth 3x more than instant cashback!", "Your credit score improves by 50+ points in 6 months with smart usage.", "Travel cards can get you business class at economy prices!", "You can negotiate annual fees—most people don't know this!", "5% cashback vs 1%? That's ₹40,000 saved on ₹10L spending!", "Airport lounges aren't just for the rich—many cards offer them free."];
const CardGenius = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [results, setResults] = useState<CardGeniusResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [expandedCards, setExpandedCards] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'quick' | 'detailed'>('quick');
  const [selectedCard, setSelectedCard] = useState<CardGeniusResult | null>(null);
  const [showLifetimeFreeOnly, setShowLifetimeFreeOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [breakdownView, setBreakdownView] = useState<'yearly' | 'monthly'>('yearly');
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Eligibility states
  const [eligibilityOpen, setEligibilityOpen] = useState(false);
  const [eligibilityData, setEligibilityData] = useState({
    pincode: "",
    inhandIncome: "",
    empStatus: ""
  });
  const [eligibilityApplied, setEligibilityApplied] = useState(false);
  const [eligibleCardAliases, setEligibleCardAliases] = useState<string[]>([]);

  // Scroll states
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);

  // Question refs for IntersectionObserver
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    setShowWelcomeDialog(true);
  }, []);
  useEffect(() => {
    if (selectedCard?.spending_breakdown) {
      const firstActiveCategory = Object.entries(selectedCard.spending_breakdown)
        .find(([, details]) => details && (details as any).spend > 0);
      setSelectedCategory(firstActiveCategory ? firstActiveCategory[0] : null);
      setBreakdownView('yearly');
    } else if (!selectedCard) {
      setSelectedCategory(null);
    }
  }, [selectedCard]);
  useEffect(() => {
    const updateIsMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 768);
      }
    };
    updateIsMobile();
    window.addEventListener('resize', updateIsMobile);
    return () => window.removeEventListener('resize', updateIsMobile);
  }, []);
  const currentQuestion = questions[currentStep];
  const progress = (currentStep + 1) / questions.length * 100;
  
  // Calculate airport lounge values based on user input (will be adjusted per card later)
  const userDomesticLoungeVisits = responses['domestic_lounge_usage_quarterly'] || 0;
  const userInternationalLoungeVisits = responses['international_lounge_usage_quarterly'] || 0;
  
  // These are the maximum possible values based on user input
  const maxDomesticLoungeValue = userDomesticLoungeVisits * 750;
  const maxInternationalLoungeValue = userInternationalLoungeVisits * 1250;
  const domesticLoungeValue = maxDomesticLoungeValue;
  const internationalLoungeValue = maxInternationalLoungeValue;
  
  const handleValueChange = (value: number) => {
    setResponses(prev => ({
      ...prev,
      [currentQuestion.field]: value
    }));
  };
  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const newScrollLeft = direction === 'left' ? scrollContainerRef.current.scrollLeft - scrollAmount : scrollContainerRef.current.scrollLeft + scrollAmount;
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };
  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const {
        scrollLeft,
        scrollWidth,
        clientWidth
      } = scrollContainerRef.current;
      setShowLeftScroll(scrollLeft > 10);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      checkScrollButtons();
      container.addEventListener('scroll', checkScrollButtons);
      window.addEventListener('resize', checkScrollButtons);
      return () => {
        container.removeEventListener('scroll', checkScrollButtons);
        window.removeEventListener('resize', checkScrollButtons);
      };
    }
  }, [showResults, results]);

  // Keyboard navigation for table scrolling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showResults && scrollContainerRef.current && !selectedCard) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          handleScroll('left');
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          handleScroll('right');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showResults, selectedCard]);

  // Escape key to close card detail view
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedCard) {
        setSelectedCard(null);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedCard]);
  const handleNext = async () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Calculate and show results
      await calculateResults();
    }
  };
  const calculateResults = async () => {
    setIsCalculating(true);

    // Start rotating fun facts
    const factInterval = setInterval(() => {
      setCurrentFactIndex(prev => (prev + 1) % funFacts.length);
    }, 3000);
    try {
      // Prepare payload
      const payload: SpendingData = {};
      questions.forEach(q => {
        payload[q.field as keyof SpendingData] = responses[q.field] || 0;
      });
      const response = await cardService.calculateCardGenius(payload);
      const savingsArray = Array.isArray(response?.data?.savings)
        ? response.data.savings
        : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.cards)
            ? response.data.cards
            : [];

      if (!savingsArray.length) {
        toast({
          title: "No results found",
          description: "Please try adjusting your spending amounts.",
          variant: "destructive"
        });
        return;
      }

      const enrichedResults = await enrichCardGeniusResults({
        savings: savingsArray,
        responses,
      });

      if (!enrichedResults.length) {
        toast({
          title: "No results found",
          description: "Please try adjusting your spending amounts.",
          variant: "destructive"
        });
        return;
      }

      setResults(enrichedResults);
      setShowResults(true);
    } catch (error) {
      console.error('Error calculating results:', error);
      toast({
        title: "Calculation failed",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      clearInterval(factInterval);
      setIsCalculating(false);
    }
  };
  const toggleCardExpansion = (index: number) => {
    setExpandedCards(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  };
  const handleApplyFromDetail = () => {
    if (!selectedCard) return;

    const success = redirectToCardApplication(selectedCard, {
      bankName: selectedCard.card_name?.split(' ')[0] || 'Bank',
      bankLogo: selectedCard.card_bg_image,
      cardName: selectedCard.card_name
    });

    if (!success) {
      toast({
        title: "Unable to open bank site",
        description: "Please allow pop-ups or try again later.",
        variant: "destructive"
      });
    }
  };
  const handleCardSelect = (card: any) => {
    setSelectedCard(card);
    // Smooth scroll to top
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  const handleApplyFromList = (card: CardGeniusResult, event?: React.MouseEvent<HTMLElement>) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    const success = redirectToCardApplication(card, {
      bankName: card.card_name?.split(' ')[0] || 'Bank',
      bankLogo: card.card_bg_image,
      cardName: card.card_name
    });
    if (!success) {
      toast({
        title: "Unable to open bank site",
        description: "Please allow pop-ups or try again later.",
        variant: "destructive"
      });
    }
  };
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  const handleEligibilityCheck = async () => {
    if (!eligibilityData.pincode || !eligibilityData.inhandIncome || !eligibilityData.empStatus) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    try {
      const response = await fetch('https://bk-api.bankkaro.com/sp/api/cg-eligiblity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pincode: eligibilityData.pincode,
          inhandIncome: eligibilityData.inhandIncome,
          empStatus: eligibilityData.empStatus
        })
      });
      const data = await response.json();
      if (data.status && data.data) {
        // Filter only eligible cards (where eligible === true)
        const eligibleCards = data.data.filter((card: any) => card.eligible === true);
        const ineligibleCount = data.data.length - eligibleCards.length;

        // Extract seo_card_alias from eligible cards only
        const aliases = eligibleCards.map((card: any) => card.seo_card_alias);
        setEligibleCardAliases(aliases);
        setEligibilityApplied(true);
        setEligibilityOpen(false);
        if (aliases.length > 0) {
          toast({
            title: "Eligibility Applied",
            description: `${ineligibleCount} cards filtered out. Showing ${aliases.length} eligible cards.`
          });
        } else {
          toast({
            title: "No Eligible Cards",
            description: "No cards match your eligibility criteria",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "No Eligible Cards",
          description: "No cards match your eligibility criteria",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Eligibility check error:', error);
      toast({
        title: "Error",
        description: "Failed to check eligibility. Please try again.",
        variant: "destructive"
      });
    }
  };
  if (showResults) {
    // Fields that are already annual and should not be multiplied by 12
    const annualFields = ['flights_annual', 'hotels_annual', 'domestic_lounge_usage_quarterly', 'international_lounge_usage_quarterly', 'insurance_health_annual', 'insurance_car_or_bike_annual'];
    let totalMonthlySpend = 0;
    let totalAnnualFieldsSpend = 0;
    Object.entries(responses).forEach(([key, value]) => {
      if (annualFields.includes(key)) {
        // Lounge usage fields are counts, not money
        if (!key.includes('lounge_usage')) {
          totalAnnualFieldsSpend += value || 0;
        }
      } else {
        totalMonthlySpend += value || 0;
      }
    });

    // Add monthly equivalent of annual spending fields to display in monthly view
    const monthlyEquivalentOfAnnual = totalAnnualFieldsSpend / 12;
    const displayMonthlySpend = totalMonthlySpend + monthlyEquivalentOfAnnual;
    const totalAnnualSpend = totalMonthlySpend * 12 + totalAnnualFieldsSpend;
    if (selectedCard) {
      const bankLabel = selectedCard.bank_name || "";
      const totalLoungeValue = Number(selectedCard.airport_lounge_value || 0);
      const milestoneValue = Number(selectedCard.milestone_benefits_only || 0);
      const joiningFeeValue = Number(selectedCard.joining_fees || 0);
      return <div className="min-h-screen bg-slate-50">
          <Navigation />
          <main className="section-shell mx-auto pt-24 pb-16 max-w-4xl space-y-6">
            <button onClick={() => setSelectedCard(null)} className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary/80 transition-colors gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to all recommendations
                </button>
                
            <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#1B1C3F] via-[#2D3E94] to-[#4C7DFE] text-white p-6 sm:p-8 shadow-2xl flex flex-col gap-6 sm:flex-row sm:items-center">
              <button onClick={() => setSelectedCard(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                <X className="w-5 h-5" />
              </button>
              <div className="space-y-3 max-w-xl">
                {bankLabel && (
                  <p className="text-xs uppercase tracking-[0.4em] text-white/70">
                    {bankLabel}
                  </p>
                )}
                <h1 className="text-2xl sm:text-3xl font-bold leading-snug">
                  {selectedCard.card_name}
                </h1>
                <p className="text-sm text-white/80">Best card curated using your spends of ₹{(totalAnnualSpend / 100000).toFixed(2)}L annually.</p>
                </div>
              <div className="flex justify-center sm:justify-end w-full sm:w-auto">
                <img
                  src={selectedCard.card_bg_image}
                  alt={selectedCard.card_name}
                  className="w-40 sm:w-56 h-auto object-contain drop-shadow-2xl"
                  onError={e => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 space-y-5">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">On the spends of ₹{(totalAnnualSpend / 100000).toFixed(2)}L Annually</p>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Savings</p>
                  <p className="text-xl font-semibold text-foreground">₹{selectedCard.total_savings_yearly.toLocaleString()}</p>
              </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Milestone Benefits</p>
                  <p className="text-xl font-semibold text-foreground">{milestoneValue > 0 ? `₹${milestoneValue.toLocaleString()}` : '—'}</p>
                  </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Joining Fees</p>
                  <p className={`text-xl font-semibold ${joiningFeeValue > 0 ? 'text-red-500' : 'text-foreground'}`}>
                    {joiningFeeValue > 0 ? `-₹${joiningFeeValue.toLocaleString()}` : '₹0'}
                  </p>
                    </div>
                    </div>
              {totalLoungeValue > 0 && <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Airport Lounge Value</p>
                    <p className="text-xl font-semibold text-foreground">₹{totalLoungeValue.toLocaleString()}</p>
                    </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Estimated lounge visits</p>
                    <p className="text-xl font-semibold text-foreground">{userDomesticLoungeVisits + userInternationalLoungeVisits}</p>
                  </div>
                </div>}
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-emerald-700">Your Net Savings</p>
                  <p className="text-3xl font-bold text-emerald-700">₹{selectedCard.net_savings.toLocaleString()}</p>
                </div>
                <span className="text-xs text-emerald-700/70">per year</span>
              </div>
            </div>

            {(() => {
            const list = Array.isArray(selectedCard.welcome_benefits) ? selectedCard.welcome_benefits : [];
            const fallbackItem = (selectedCard as any).voucher_of || (selectedCard as any).voucher_bonus ? [{
              voucher_of: (selectedCard as any).voucher_of,
              voucher_bonus: (selectedCard as any).voucher_bonus,
              minimum_spend: (selectedCard as any).minimum_spend
            }] : [];
            const display = list.length > 0 ? list : fallbackItem;
            if (!display || display.length === 0) return null;
            return <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-primary">Extra benefits</p>
                    <h2 className="text-xl font-semibold text-foreground">Welcome bonuses curated for you</h2>
                  </div>
                  <div className="space-y-3">
                    {display.map((benefit: any, idx: number) => <div key={idx} className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-foreground">
                            On card activation you get a {benefit.voucher_of || 'benefit'}
                          {benefit.voucher_bonus && ` worth ₹${parseInt(benefit.voucher_bonus).toLocaleString()}`}
                          {benefit.minimum_spend && benefit.minimum_spend !== "0" && <span className="text-muted-foreground">{' '} (Min spend ₹{parseInt(benefit.minimum_spend).toLocaleString()})</span>}
                          </p>
                      </div>)}
                  </div>
                </div>;
          })()}

            <section className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 space-y-6">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Your Total Savings Breakdown</p>
                <h2 className="text-xl font-bold text-foreground">See how each category contributes</h2>
              </div>

              <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
                {Object.entries(selectedCard.spending_breakdown || {}).map(([category, details]) => {
                  if (!details || !details.spend || details.spend === 0) return null;
                  const isActive = selectedCategory === category || (!selectedCategory && details.spend > 0);
                  const label = category.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 sm:px-5 py-2.5 rounded-full text-sm font-semibold transition-colors border shadow-sm inline-flex items-center justify-center whitespace-nowrap ${isActive ? 'bg-primary text-primary-foreground border-primary shadow-md' : 'bg-white text-muted-foreground border-slate-200 hover:border-primary/40'}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-muted-foreground">Savings Breakdown</h3>
                <div className="flex gap-2 bg-slate-100 rounded-full p-1">
                  <button onClick={() => setBreakdownView('yearly')} className={`px-4 py-1.5 rounded-full text-sm font-semibold ${breakdownView === 'yearly' ? 'bg-white shadow text-foreground' : 'text-muted-foreground'}`}>
                    Yearly
                  </button>
                  <button onClick={() => setBreakdownView('monthly')} className={`px-4 py-1.5 rounded-full text-sm font-semibold ${breakdownView === 'monthly' ? 'bg-white shadow text-foreground' : 'text-muted-foreground'}`}>
                    Monthly
                  </button>
                </div>
              </div>

              {(() => {
              const activeCategory = selectedCategory || Object.keys(selectedCard.spending_breakdown).find(k => selectedCard.spending_breakdown[k]?.spend > 0);
              if (!activeCategory) return null;
              const details = selectedCard.spending_breakdown[activeCategory];
              if (!details || !details.spend) return null;
              const isYearly = breakdownView === 'yearly';
              const multiplier = isYearly ? 12 : 1;
              const spend = (details.spend || 0) * multiplier;
              const pointsEarned = (details.points_earned || 0) * multiplier;
              const convRate = details.conv_rate || 0;
              const savings = (details.savings || 0) * multiplier;
              return <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 space-y-4">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Total Spends</span>
                      <span className="font-semibold text-foreground">₹{spend.toLocaleString()}</span>
                      </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Points Earned</span>
                      <span className="font-semibold text-foreground">{pointsEarned.toLocaleString()}</span>
                        </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Value of 1 Point</span>
                      <span className="font-semibold text-foreground">₹{convRate.toFixed(2)}</span>
                      </div>
                    {pointsEarned > 0 && convRate > 0 && <div className="text-xs text-muted-foreground text-center">
                          ₹{pointsEarned.toLocaleString()} × {convRate.toFixed(2)}
                        </div>}
                    <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                        <span className="font-semibold text-foreground">Total Savings</span>
                        <span className="text-2xl font-bold text-green-600">₹{savings.toLocaleString()}</span>
                      </div>
                    {details.explanation && details.explanation.length > 0 && <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-2">
                        <p className="text-xs uppercase tracking-wide text-primary">How it's calculated</p>
                        {details.explanation.map((exp, idx) => <div key={idx} className="text-sm text-foreground" dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(exp)
                    }} />)}
                      </div>}
                  </div>;
            })()}
            </section>

            <Button className="w-full h-12 text-base font-semibold shadow-xl" size="lg" onClick={handleApplyFromDetail}>
              Apply Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </main>
          <Footer />
        </div>;
    }

    if (!results || results.length === 0) {
      return <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
          <Navigation />
          <div className="max-w-xl mt-16">
            <h1 className="text-3xl font-bold mb-4">We couldn't find matching cards</h1>
            <p className="text-muted-foreground mb-6">
              Try adjusting your spending amounts or running Card Genius again with different inputs to discover cards that maximize your rewards.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => {
            setShowResults(false);
            setCurrentStep(0);
            setResponses({});
          }} size="lg">
                Recalculate
              </Button>
              <Button variant="outline" size="lg" onClick={() => {
            setShowResults(false);
            setSelectedCard(null);
            setResponses({});
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}>
                Start Over
              </Button>
            </div>
          </div>
        </div>;
    }

    // Filter results based on lifetime free and eligibility filters
    let filteredResults = results;
    if (showLifetimeFreeOnly) {
      filteredResults = filteredResults.filter(card => card.joining_fees === 0);
    }
    if (eligibilityApplied && eligibleCardAliases.length > 0) {
      filteredResults = filteredResults.filter(card => eligibleCardAliases.includes(card.seo_card_alias));
    }

    // Get categories where user has spending (non-zero responses), excluding lounge usage
    const spendingCategories = Object.entries(responses)
      .filter(([key, value]) => value > 0 && !key.includes('lounge_usage'))
      .map(([key]) => key);

    // Results list view
    return <div className="min-h-screen bg-slate-50">
        <Navigation />
            
        <main className="section-shell max-w-6xl mx-auto pt-24 pb-16 space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">The Best Cards Sorted By Annual Savings!</h1>
            <p className="text-sm text-muted-foreground">Personalized to your spending profile</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Your Total Spends</p>
              <div className="font-bold text-foreground text-xl sm:text-2xl">
                <p className="flex items-center gap-2 whitespace-nowrap justify-center sm:justify-start text-base sm:text-[1.35rem]">
                  <span>₹{(displayMonthlySpend / 100000).toFixed(2)}L Monthly</span>
                  <span className="text-muted-foreground text-sm sm:text-base font-medium">|</span>
                  <span className="text-primary">₹{(totalAnnualSpend / 100000).toFixed(2)}L Annually</span>
                </p>
              </div>
            </div>
              <button onClick={() => {
              setShowResults(false);
              setCurrentStep(0);
          }} className="inline-flex items-center gap-2 rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors mx-auto sm:mx-0">
              Edit Spends
              <ArrowRight className="w-4 h-4" />
              </button>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <Button variant={showLifetimeFreeOnly ? "default" : "outline"} size="sm" className="rounded-full px-4 py-1 text-xs font-semibold" onClick={() => setShowLifetimeFreeOnly(!showLifetimeFreeOnly)}>
              Lifetime Free Cards
            </Button>
            
            <Popover open={eligibilityOpen} onOpenChange={setEligibilityOpen}>
              <PopoverTrigger asChild>
                <Button size="sm" variant={eligibilityApplied ? "default" : "outline"} className="rounded-full px-4 py-1 text-xs font-semibold gap-2" >
                  <CheckCircle2 className="w-4 h-4" />
                  {eligibilityApplied ? "Eligibility Applied" : "Check Eligibility"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-6 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50" align="start" sideOffset={8}>
                <h3 className="font-semibold text-lg mb-4">Check Your Eligibility</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input id="pincode" type="text" inputMode="numeric" placeholder="Enter your pincode" value={eligibilityData.pincode} onChange={e => setEligibilityData({
                    ...eligibilityData,
                    pincode: e.target.value.replace(/\D/g, '')
                  })} maxLength={6} />
                  </div>
                  <div>
                    <Label htmlFor="income">In-hand Income (Monthly)</Label>
                    <Input id="income" type="text" placeholder="e.g., 50000" value={eligibilityData.inhandIncome} onChange={e => {
                    const value = e.target.value.replace(/\D/g, '');
                    setEligibilityData({
                      ...eligibilityData,
                      inhandIncome: value
                    });
                  }} />
                  </div>
                  <div>
                    <Label htmlFor="empStatus">Employment Status</Label>
                    <Select value={eligibilityData.empStatus} onValueChange={value => setEligibilityData({
                    ...eligibilityData,
                    empStatus: value
                  })}>
                      <SelectTrigger id="empStatus" className="rounded-2xl">
                        <SelectValue placeholder="Select employment status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="salaried">Salaried</SelectItem>
                        <SelectItem value="self_employed">Self Employed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleEligibilityCheck} className="w-full">
                    Apply Eligibility
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            
            <div className="ml-auto text-xs text-muted-foreground hidden lg:flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
              <span>Scroll table:</span>
              <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded">←</kbd>
              <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded">→</kbd>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-slate-200">
            <div className="flex gap-6 overflow-x-auto pb-1 scrollbar-hide">
            <button onClick={() => setActiveTab('quick')} className={`pb-3 text-sm font-semibold relative transition-colors whitespace-nowrap ${activeTab === 'quick' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                Quick Insights
              {activeTab === 'quick' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></span>}
              </button>
            <button onClick={() => setActiveTab('detailed')} className={`pb-3 text-sm font-semibold relative transition-colors whitespace-nowrap ${activeTab === 'detailed' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                Detailed Breakdown
              {activeTab === 'detailed' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></span>}
              </button>
            </div>
          </div>

          {/* Mobile Results List */}
          <div className="hidden space-y-5">
            {filteredResults.map((card, index) => {
              const detailedItems = spendingCategories.map(category => {
                const breakdown = card.spending_breakdown?.[category];
                if (!breakdown || !breakdown.savings) return null;
                const yearlySavings = (breakdown.savings || 0) * 12;
                return (
                  <div key={`${card.seo_card_alias}-${category}`} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                    <span className="font-semibold text-foreground">₹{yearlySavings.toLocaleString()}</span>
                  </div>
                );
              });
              const hasDetailed = detailedItems.some(Boolean);
              return (
                <div
                  key={card.seo_card_alias || `${card.card_name}-${index}`}
                  className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_20px_45px_rgba(15,23,42,0.08)] space-y-4"
                  onClick={() => handleCardSelect(card)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCardSelect(card);
                    }
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-lg font-semibold text-foreground leading-tight">{card.card_name}</p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        Net Savings
                        <span className="font-semibold text-green-600 text-sm">
                          ₹{card.net_savings.toLocaleString()}
                        </span>
                      </p>
                    </div>
                    <img
                      src={card.card_bg_image}
                      alt={card.card_name}
                      className="w-20 h-14 object-contain flex-shrink-0"
                    />
                  </div>

                  {activeTab === 'quick' && (
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-muted/40 rounded-xl p-3">
                        <p className="text-xs text-muted-foreground">Total Savings</p>
                        <p className="text-base font-semibold text-green-600">
                          ₹{card.total_savings_yearly.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-muted/40 rounded-xl p-3">
                        <p className="text-xs text-muted-foreground">Milestones</p>
                        <p className="text-base font-semibold text-blue-600">
                          ₹{card.total_extra_benefits.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-muted/40 rounded-xl p-3">
                        <p className="text-xs text-muted-foreground">Lounge Value</p>
                        <p className="text-base font-semibold text-purple-600">
                          {card.airport_lounge_value && card.airport_lounge_value > 0
                            ? `₹${card.airport_lounge_value.toLocaleString()}`
                            : '—'}
                        </p>
                      </div>
                      <div className="bg-muted/40 rounded-xl p-3">
                        <p className="text-xs text-muted-foreground">Joining Fee</p>
                        <p className="text-base font-semibold text-red-600">
                          ₹{card.joining_fees.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'detailed' && (
                    <div className="rounded-xl border border-border/60 p-3 space-y-2 bg-muted/30">
                      {hasDetailed ? detailedItems : (
                        <p className="text-sm text-muted-foreground">No category savings captured for your inputs.</p>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {card.joining_fees === 0 && (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">
                        Lifetime Free
                      </span>
                    )}
                    {card.rating && (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-600">
                        ⭐ {card.rating}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col xs:flex-row gap-2">
                    <Button
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardSelect(card);
                      }}
                    >
                      View Insights
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={(e) => handleApplyFromList(card, e)}
                    >
                      Apply Now
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Unified Results Table */}
          <div className="block w-full overflow-x-auto">
          <div className="mx-auto w-full max-w-full">
          <TooltipProvider>
            <div className="relative bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
              {/* Scroll hint indicator */}
              <div className="bg-gradient-to-r from-transparent via-muted/20 to-transparent h-1"></div>
              
              {/* Left Scroll Button */}
              {showLeftScroll && <button onClick={() => handleScroll('left')} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white border border-border rounded-full p-2 shadow-lg transition-all hover:scale-110 animate-fade-in" aria-label="Scroll left">
                  <ArrowLeft className="w-5 h-5 text-foreground" />
                </button>}
              
              {/* Right Scroll Button */}
              {showRightScroll && <button onClick={() => handleScroll('right')} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white border border-border rounded-full p-2 shadow-lg transition-all hover:scale-110 animate-fade-in" aria-label="Scroll right">
                  <ArrowRight className="w-5 h-5 text-foreground" />
                </button>}
              
              <div ref={scrollContainerRef} className="overflow-x-auto pb-3 scroll-smooth" onScroll={checkScrollButtons}>
                <table className="w-full table-auto">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground sticky left-0 bg-white z-20 min-w-[260px]">Credit Cards</th>
                      
                      {/* Quick Insights Tab - Show summary columns */}
                      {activeTab === 'quick' && <>
                          <th className="text-center p-3 font-semibold text-xs sm:text-sm text-foreground min-w-[120px] sm:min-w-[140px]">
                            <div className="flex items-center justify-center gap-1">
                              Total Savings
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p>Total savings earned across all spending categories combined</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </th>
                          <th className="text-center p-2 font-semibold text-xs sm:text-sm text-muted-foreground w-6 sm:w-8">
                            <span className="text-2xl">+</span>
                          </th>
                          <th className="text-center p-3 font-semibold text-xs sm:text-sm text-foreground min-w-[120px] sm:min-w-[140px]">
                            <div className="flex items-center justify-center gap-1">
                              Milestones
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p>Additional benefits like vouchers, reward points, or perks earned by achieving spending milestones</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </th>
                          <th className="text-center p-2 font-semibold text-xs sm:text-sm text-muted-foreground w-6 sm:w-8">
                            <span className="text-2xl">+</span>
                          </th>
                          <th className="text-center p-3 font-semibold text-xs sm:text-sm text-foreground min-w-[120px] sm:min-w-[140px]">
                            <div className="flex items-center justify-center gap-1">
                              Airport Lounges
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p>Estimated value of domestic and international lounge access (₹750 per domestic, ₹1250 per international)</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </th>
                          <th className="text-center p-2 font-semibold text-xs sm:text-sm text-muted-foreground w-6 sm:w-8">
                            <span className="text-2xl">-</span>
                          </th>
                          <th className="text-center p-3 font-semibold text-xs sm:text-sm text-foreground min-w-[110px] sm:min-w-[120px]">
                            <div className="flex items-center justify-center gap-1">
                              Joining Fee
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p>Annual or one-time fees charged by the bank for this credit card</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </th>
                          <th className="text-center p-2 font-semibold text-xs sm:text-sm text-muted-foreground w-6 sm:w-8">
                            <span className="text-2xl">=</span>
                          </th>
                          <th className="text-center p-3 font-semibold text-xs sm:text-sm text-foreground min-w-[130px] sm:w-36">
                            <div className="flex items-center justify-center gap-1">
                              Net Savings
                              <Tooltip>
                                <TooltipTrigger asChild>
                              <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p>Your actual profit calculated as: Total Savings + Milestones + Airport Lounges - Joining Fees</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </th>
                        </>}
                      
                      {/* Detailed Breakdown Tab - Show category columns + summary */}
                      {activeTab === 'detailed' && <>
                          {spendingCategories.map((category, idx) => {
                        // Simplified category names with tooltips
                        const categoryInfo: Record<string, {
                          name: string;
                          tooltip: string;
                        }> = {
                          'flights_annual': {
                            name: 'Flights',
                            tooltip: 'Total yearly savings on flight bookings'
                          },
                          'hotels_annual': {
                            name: 'Hotels',
                            tooltip: 'Total yearly savings on hotel stays'
                          },
                          'fuel': {
                            name: 'Fuel',
                            tooltip: 'Total yearly savings on fuel purchases'
                          },
                          'dining_or_going_out': {
                            name: 'Dining',
                            tooltip: 'Total yearly savings on dining out'
                          },
                          'amazon_spends': {
                            name: 'Amazon',
                            tooltip: 'Total yearly savings on Amazon purchases'
                          },
                          'flipkart_spends': {
                            name: 'Flipkart',
                            tooltip: 'Total yearly savings on Flipkart purchases'
                          },
                          'other_online_spends': {
                            name: 'Online Shopping',
                            tooltip: 'Total yearly savings on other online shopping'
                          },
                          'other_offline_spends': {
                            name: 'Offline Shopping',
                            tooltip: 'Total yearly savings on offline store purchases'
                          },
                          'grocery_spends_online': {
                            name: 'Groceries',
                            tooltip: 'Total yearly savings on grocery shopping'
                          },
                          'online_food_ordering': {
                            name: 'Food Delivery',
                            tooltip: 'Total yearly savings on food delivery orders'
                          },
                          'mobile_phone_bills': {
                            name: 'Mobile Bills',
                            tooltip: 'Total yearly savings on mobile and WiFi bills'
                          },
                          'electricity_bills': {
                            name: 'Electricity',
                            tooltip: 'Total yearly savings on electricity bills'
                          },
                          'water_bills': {
                            name: 'Water',
                            tooltip: 'Total yearly savings on water bills'
                          },
                          'insurance_health_annual': {
                            name: 'Health Insurance',
                            tooltip: 'Total yearly savings on health insurance premiums'
                          },
                          'insurance_car_or_bike_annual': {
                            name: 'Vehicle Insurance',
                            tooltip: 'Total yearly savings on vehicle insurance'
                          },
                          'rent': {
                            name: 'Rent',
                            tooltip: 'Total yearly savings on rent payments'
                          },
                          'school_fees': {
                            name: 'School Fees',
                            tooltip: 'Total yearly savings on school fee payments'
                          }
                        };
                        const info = categoryInfo[category] || {
                          name: category.replace(/_/g, ' '),
                          tooltip: 'Total yearly savings in this category'
                        };
                        return <React.Fragment key={category}>
                                <th className="text-center p-4 font-semibold text-sm text-foreground w-32">
                                  <div className="flex items-center justify-center gap-1">
                                    {info.name}
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-xs">
                                        <p>{info.tooltip}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                </th>
                                {idx < spendingCategories.length - 1 && <th className="text-center p-4 font-semibold text-sm text-muted-foreground w-12">
                                    <span className="text-2xl">+</span>
                                  </th>}
                              </React.Fragment>;
                      })}
                          
                          {/* Add Domestic and Intl Lounge columns if user entered lounge usage */}
                          {(domesticLoungeValue > 0 || internationalLoungeValue > 0) && <>
                            {domesticLoungeValue > 0 && <>
                              <th className="text-center p-4 font-semibold text-sm text-muted-foreground w-12">
                                <span className="text-2xl">+</span>
                              </th>
                              <th className="text-center p-4 font-semibold text-sm text-foreground w-32">
                                <div className="flex items-center justify-center gap-1">
                                  Domestic Lounge
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                      <p>Value from domestic airport lounge access (₹750 per visit)</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              </th>
                            </>}
                            {internationalLoungeValue > 0 && <>
                              <th className="text-center p-4 font-semibold text-sm text-muted-foreground w-12">
                                <span className="text-2xl">+</span>
                              </th>
                              <th className="text-center p-4 font-semibold text-sm text-foreground w-32">
                                <div className="flex items-center justify-center gap-1">
                                  Intl Lounge
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                      <p>Value from international airport lounge access (₹1250 per visit)</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              </th>
                            </>}
                          </>}
                          
                          <th className="text-center p-4 font-semibold text-sm text-muted-foreground w-12">
                            <span className="text-2xl">=</span>
                          </th>
                          <th className="text-center p-4 font-semibold text-sm text-foreground w-36">
                            <div className="flex items-center justify-center gap-1">
                              Total Savings
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p>Total savings earned across all spending categories combined</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </th>
                          <th className="text-center p-4 font-semibold text-sm text-muted-foreground w-12">
                            <span className="text-2xl">+</span>
                          </th>
                          <th className="text-center p-4 font-semibold text-sm text-foreground w-40">
                            <div className="flex items-center justify-center gap-1">
                              Milestones
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p>Additional benefits like vouchers, reward points, or perks earned by achieving spending milestones</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </th>
                          <th className="text-center p-4 font-semibold text-sm text-muted-foreground w-12">
                            <span className="text-2xl">+</span>
                          </th>
                          <th className="text-center p-4 font-semibold text-sm text-foreground min-w-[140px]">
                            <div className="flex items-center justify-center gap-1">
                              Airport Lounges
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p>Estimated value of domestic and international lounge access (₹750 per domestic, ₹1250 per international)</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </th>
                          <th className="text-center p-4 font-semibold text-sm text-muted-foreground w-12">
                            <span className="text-2xl">-</span>
                          </th>
                          <th className="text-center p-4 font-semibold text-sm text-foreground w-36">
                            <div className="flex items-center justify-center gap-1">
                              Joining Fee
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p>Annual or one-time fees charged by the bank for this credit card</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </th>
                          <th className="text-center p-4 font-semibold text-sm text-muted-foreground w-12">
                            <span className="text-2xl">=</span>
                          </th>
                          <th className="text-center p-4 font-semibold text-sm text-foreground w-36">
                            <div className="flex items-center justify-center gap-1">
                              Net Savings
                              <Tooltip>
                                <TooltipTrigger asChild>
                              <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p>Your actual profit calculated as: Total Savings + Milestones + Airport Lounges - Joining Fees</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </th>
                        </>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.map((card, index) => {
                    return <tr key={index} className={`border-t border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer ${index === 0 ? 'bg-emerald-50/60' : 'bg-white'}`} onClick={() => handleCardSelect(card)}>
                          <td className="p-3 sticky left-0 bg-white z-20 min-w-[260px] shadow-[4px_0_6px_-4px_rgba(15,23,42,0.08)]">
                            <div className="flex items-center gap-4">
                              <img src={card.card_bg_image} alt={card.card_name} className="w-16 h-12 object-contain flex-shrink-0 rounded-md border border-slate-100" onError={e => {
                            e.currentTarget.src = "/placeholder.svg";
                          }} />
                              <div className="min-w-0">
                                <p className="font-semibold text-foreground text-sm leading-tight break-words">{card.card_name}</p>
                                <p className="text-[11px] text-muted-foreground">Net Savings ₹{card.net_savings.toLocaleString()}</p>
                              </div>
                            </div>
                          </td>
                          
                          {/* Quick Insights Tab - Show summary data */}
                          {activeTab === 'quick' && <>
                              <td className="p-4 text-center font-semibold text-green-600">
                                ₹{card.total_savings_yearly.toLocaleString()}
                              </td>
                              <td className="p-4"></td>
                              <td className="p-4 text-center font-semibold text-blue-600">
                                ₹{card.total_extra_benefits.toLocaleString()}
                              </td>
                              <td className="p-4"></td>
                              <td className="p-4 text-center font-semibold text-purple-600">
                                {card.airport_lounge_value && card.airport_lounge_value > 0 
                                  ? `₹${card.airport_lounge_value.toLocaleString()}`
                                  : '—'}
                              </td>
                              <td className="p-4"></td>
                              <td className="p-4 text-center font-semibold text-red-600">
                                ₹{card.joining_fees.toLocaleString()}
                              </td>
                              <td className="p-4"></td>
                              <td className="p-4 text-center">
                                <span className="font-bold text-lg text-green-600">
                                  ₹{card.net_savings.toLocaleString()}
                                </span>
                              </td>
                            </>}
                          
                          {/* Detailed Breakdown Tab - Show category data + summary */}
                          {activeTab === 'detailed' && <>
                              {spendingCategories.map((category, idx) => {
                          const breakdown = card.spending_breakdown[category];
                          const yearlySavings = breakdown?.savings ? breakdown.savings * 12 : 0;
                          return <React.Fragment key={category}>
                                    <td className="p-4 text-center font-semibold text-green-600">
                                      ₹{yearlySavings.toLocaleString()}
                                    </td>
                                    {idx < spendingCategories.length - 1 && <td className="p-4"></td>}
                                  </React.Fragment>;
                        })}
                              
                              {/* Add Domestic and Intl Lounge values - use pre-calculated card-specific values */}
                              {(domesticLoungeValue > 0 || internationalLoungeValue > 0) && <>
                                {domesticLoungeValue > 0 && <>
                                  <td className="p-4"></td>
                                  <td className="p-4 text-center font-semibold text-purple-600">
                                    ₹{(card.domestic_lounge_value || 0).toLocaleString()}
                                  </td>
                                </>}
                                {internationalLoungeValue > 0 && <>
                                  <td className="p-4"></td>
                                  <td className="p-4 text-center font-semibold text-purple-600">
                                    ₹{(card.international_lounge_value || 0).toLocaleString()}
                                  </td>
                                </>}
                              </>}
                              
                              <td className="p-4"></td>
                              <td className="p-4 text-center font-semibold text-green-600">
                                ₹{card.total_savings_yearly.toLocaleString()}
                              </td>
                              <td className="p-4"></td>
                              <td className="p-4 text-center font-semibold text-blue-600">
                                ₹{card.total_extra_benefits.toLocaleString()}
                              </td>
                              <td className="p-4"></td>
                              <td className="p-4 text-center font-semibold text-purple-600">
                                {card.airport_lounge_value && card.airport_lounge_value > 0 
                                  ? `₹${card.airport_lounge_value.toLocaleString()}`
                                  : '—'}
                              </td>
                              <td className="p-4"></td>
                              <td className="p-4 text-center font-semibold text-red-600">
                                ₹{card.joining_fees.toLocaleString()}
                              </td>
                              <td className="p-4"></td>
                              <td className="p-4 text-center">
                                <span className="font-bold text-lg text-green-700">
                                  ₹{card.net_savings.toLocaleString()}
                                </span>
                              </td>
                            </>}
                        </tr>;
                  })}
                  </tbody>
                </table>
              </div>
            </div>
          </TooltipProvider>
          <p className="text-xs text-muted-foreground text-center mt-2 lg:hidden">Swipe horizontally to view all columns</p>
          </div>
          </div>

          {/* Start Over Button */}
          <div className="mt-8 text-center">
            <Button variant="outline" size="lg" onClick={() => {
            setShowResults(false);
            setCurrentStep(0);
            setResponses({});
            setResults([]);
          }}>
              Start Over
            </Button>
          </div>
        </main>
        <Footer />
      </div>;
  }
  return <>
      <Navigation />
      <div className="min-h-screen bg-gradient-primary pt-32 md:pt-36">{/* Added padding for nav + progress bar */}
      {/* Welcome Dialog */}
      <Dialog open={showWelcomeDialog} onOpenChange={setShowWelcomeDialog}>
        <DialogContent className="sm:max-w-lg w-[92vw] sm:w-auto max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8">
          <button onClick={() => setShowWelcomeDialog(false)} className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          
          <div className="flex flex-col items-center text-center space-y-4 pt-4 sm:pt-6">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-2">
              <img src={logo} alt="Card Genius 360" className="w-16 h-16 sm:w-24 sm:h-24 object-contain" />
            </div>
            
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl sm:text-3xl font-bold bg-gradient-accent bg-clip-text text-transparent">
                Welcome to Super Card Genius
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base text-charcoal-700 leading-relaxed">
                We help you find the <span className="font-semibold text-primary">best credit card</span> tailored to your unique spending habits.
              </DialogDescription>
            </DialogHeader>

            <div className="w-full bg-primary/5 rounded-xl p-6 space-y-3 text-left">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-charcoal-900">Personalized Recommendations</h4>
                  <p className="text-sm text-charcoal-600">Answer a few quick questions about your spending</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-charcoal-900">Smart Analysis</h4>
                  <p className="text-sm text-charcoal-600">Get cards ranked by maximum savings and benefits</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-charcoal-900">Maximize Your Savings</h4>
                  <p className="text-sm text-charcoal-600">Discover how much you can save annually</p>
                </div>
              </div>
            </div>

            <Button size="lg" onClick={() => setShowWelcomeDialog(false)} className="w-full shadow-lg">
              Let's Get Started
              <ArrowRight className="ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Loading State */}
      {isCalculating && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-charcoal-900 mb-2">
              Finding Your Perfect Cards...
            </h3>
            <p className="text-charcoal-600 mb-4">
              This will just take a moment
            </p>
            <div className="bg-primary/10 p-4 rounded-lg">
              <p className="text-sm text-charcoal-700 italic">
                💡 {funFacts[currentFactIndex]}
              </p>
            </div>
          </div>
        </div>}

      {/* Main Content */}
      <main className="section-shell">
        <div className="max-w-2xl mx-auto">
          {/* Welcome Message */}
          {currentStep === 0 && <div className="mb-8 text-center animate-fade-in px-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal-900 mb-4">
                Let's Find Your Perfect Card
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-charcoal-700">
                Answer {questions.length} quick questions about your spending habits, and we'll recommend the best cards for you.
              </p>
            </div>}

          {/* Step Indicator */}
          <div className="mb-4 rounded-2xl border border-border bg-card/90 shadow-[0_8px_30px_rgb(0,0,0,0.05)] p-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary flex items-center gap-1">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                  {currentStep + 1}
                </span>
                of {questions.length}
              </p>
              <p className="text-sm text-muted-foreground">Swipe the slider or tap amount to answer</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Progress</p>
              <p className="text-lg font-semibold text-foreground">{Math.round(progress)}%</p>
            </div>
          </div>

          {/* Question Card */}
          <div ref={el => {
            if (questionRefs.current) {
              questionRefs.current[currentStep] = el;
            }
          }} className="animate-fade-in">
            <SpendingInput question={currentQuestion.question} emoji={currentQuestion.emoji} value={responses[currentQuestion.field] || 0} onChange={handleValueChange} min={currentQuestion.min} max={currentQuestion.max} step={currentQuestion.step} showCurrency={currentQuestion.showCurrency} suffix={currentQuestion.suffix} />
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8">
            <Button
              variant="outline"
              size="lg"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="w-full sm:flex-1 touch-target cg-nav-btn cg-prev-btn"
              aria-label="Go to previous question"
            >
              <ArrowLeft className="mr-2" />
              Previous
            </Button>
            
            {currentStep !== questions.length - 1 && (
              <Button
                variant="ghost"
                size="lg"
                onClick={() => setCurrentStep(questions.length - 1)}
                className="w-full sm:flex-1 touch-target cg-nav-btn cg-skip-all-btn"
                aria-label="Skip all remaining questions"
              >
                Skip All
              </Button>
            )}
            
            <Button
              size="lg"
              onClick={handleNext}
              className="w-full sm:flex-1 touch-target cg-nav-btn cg-next-btn"
              aria-label={currentStep === questions.length - 1 ? "Show card genius results" : "Go to next question"}
            >
              {currentStep === questions.length - 1 ? <>
                  Show My Results
                  <Sparkles className="ml-2" />
                </> : <>
                  Next
                  <ArrowRight className="ml-2" />
                </>}
            </Button>
          </div>

          {/* Skip Option */}
          <div className="text-center mt-6">
            <button
              onClick={handleNext}
              className="text-charcoal-500 hover:text-primary font-medium transition-colors cg-skip-question-link"
              aria-label="Skip this question"
            >
              Skip this question →
            </button>
          </div>
        </div>
      </main>
      </div>
      <Footer />
    </>;
};
export default CardGenius;