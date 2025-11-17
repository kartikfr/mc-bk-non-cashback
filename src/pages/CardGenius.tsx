import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SpendingInput } from "@/components/ui/spending-input";
import { ArrowLeft, ArrowRight, Sparkles, ChevronDown, Info, Check, X, TrendingUp, CheckCircle2 } from "lucide-react";
import { cardService } from "@/services/cardService";
import type { SpendingData } from "@/services/cardService";
import { useToast } from "@/hooks/use-toast";
import { sanitizeHtml } from "@/lib/sanitize";
import { openRedirectInterstitial, extractBankName, extractBankLogo } from "@/utils/redirectHandler";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const questions: SpendingQuestion[] = [
  { field: 'amazon_spends', question: 'How much do you spend on Amazon in a month?', emoji: '🛍️', min: 0, max: 100000, step: 500 },
  { field: 'flipkart_spends', question: 'How much do you spend on Flipkart in a month?', emoji: '📦', min: 0, max: 100000, step: 500 },
  { field: 'other_online_spends', question: 'How much do you spend on other online shopping?', emoji: '💸', min: 0, max: 50000, step: 500 },
  { field: 'other_offline_spends', question: 'How much do you spend at local shops or offline stores monthly?', emoji: '🏪', min: 0, max: 100000, step: 1000 },
  { field: 'grocery_spends_online', question: 'How much do you spend on groceries (Blinkit, Zepto etc.) every month?', emoji: '🥦', min: 0, max: 50000, step: 500 },
  { field: 'online_food_ordering', question: 'How much do you spend on food delivery apps in a month?', emoji: '🛵🍜', min: 0, max: 30000, step: 500 },
  { field: 'fuel', question: 'How much do you spend on fuel in a month?', emoji: '⛽', min: 0, max: 20000, step: 500 },
  { field: 'dining_or_going_out', question: 'How much do you spend on dining out in a month?', emoji: '🥗', min: 0, max: 30000, step: 500 },
  { field: 'flights_annual', question: 'How much do you spend on flights in a year?', emoji: '✈️', min: 0, max: 500000, step: 5000 },
  { field: 'hotels_annual', question: 'How much do you spend on hotel stays in a year?', emoji: '🛌', min: 0, max: 300000, step: 5000 },
  { field: 'domestic_lounge_usage_quarterly', question: 'How often do you visit domestic airport lounges in a year?', emoji: '🇮🇳', min: 0, max: 50, step: 1, showCurrency: false, suffix: ' visits' },
  { field: 'international_lounge_usage_quarterly', question: 'Plus, what about international airport lounges?', emoji: '🌎', min: 0, max: 50, step: 1, showCurrency: false, suffix: ' visits' },
  { field: 'mobile_phone_bills', question: 'How much do you spend on recharging your mobile or Wi-Fi monthly?', emoji: '📱', min: 0, max: 10000, step: 100 },
  { field: 'electricity_bills', question: "What's your average monthly electricity bill?", emoji: '⚡️', min: 0, max: 20000, step: 500 },
  { field: 'water_bills', question: 'And what about your monthly water bill?', emoji: '💧', min: 0, max: 5000, step: 100 },
  { field: 'insurance_health_annual', question: 'How much do you pay for health or term insurance annually?', emoji: '🛡️', min: 0, max: 100000, step: 1000 },
  { field: 'insurance_car_or_bike_annual', question: 'How much do you pay for car or bike insurance annually?', emoji: '🚗', min: 0, max: 50000, step: 1000 },
  { field: 'rent', question: 'How much do you pay for house rent every month?', emoji: '🏠', min: 0, max: 100000, step: 1000 },
  { field: 'school_fees', question: 'How much do you pay in school fees monthly?', emoji: '🎓', min: 0, max: 50000, step: 1000 },
];

const funFacts = [
  "Did you know? The first credit card reward program started in 1981!",
  "Indians saved over ₹2,000 crores in credit card rewards last year!",
  "Premium cards often pay for themselves through lounge access alone.",
  "The average credit card user has 3.2 cards but only maximizes 1.",
  "Cashback is instant gratification, but reward points can be worth 3x more!",
  "Your credit score can improve by 50+ points in just 6 months with the right habits.",
  "Travel cards can get you business class flights at economy prices!",
  "Most people don't know: You can negotiate credit card annual fees.",
  "The difference between 1% and 5% cashback? ₹40,000 annually on ₹10L spending!",
  "Airport lounge access isn't just for the rich—many mid-tier cards offer it.",
  "Co-branded cards often give better value than generic reward cards.",
  "Banks make money when you carry a balance—always pay in full!",
  "Welcome bonuses are often worth more than a year's rewards combined.",
  "The best credit card isn't the fanciest—it's the one matching your spending.",
  "Fuel surcharge waivers can save you ₹5,000+ annually if you drive daily.",
  "Credit cards are tools, not free money. Use them wisely!",
  "The right card for dining out can give you 10x more value than a regular card.",
  "Your spending pattern changes every year—your cards should too!",
  "Most premium cards offer complimentary insurance worth lakhs.",
  "Smart card users earn while they spend. Average users just spend."
];

interface CardResult {
  card_name: string;
  card_bg_image?: string;
  seo_card_alias: string;
  joining_fees: number;
  total_savings: number;
  total_savings_yearly: number;
  total_extra_benefits: number;
  net_savings: number;
  voucher_of?: string | number;
  voucher_bonus?: string | number;
  welcome_benefits: any[];
  spending_breakdown: {
    [key: string]: {
      on: string;
      spend: number;
      points_earned: number;
      savings: number;
      explanation: string[];
      conv_rate: number;
      maxCap?: number;
    };
  };
}

const CardGenius = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [results, setResults] = useState<CardResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [expandedCards, setExpandedCards] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'quick' | 'detailed'>('quick');
  const [selectedCard, setSelectedCard] = useState<CardResult | null>(null);
  const [showLifetimeFreeOnly, setShowLifetimeFreeOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [breakdownView, setBreakdownView] = useState<'yearly' | 'monthly'>('yearly');
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  
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

  useEffect(() => {
    setShowWelcomeDialog(true);
  }, []);

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleValueChange = (value: number) => {
    setResponses(prev => ({ ...prev, [currentQuestion.field]: value }));
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const newScrollLeft = direction === 'left' 
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
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
      
      if (response.data && response.data.savings && Array.isArray(response.data.savings)) {
        // Fetch card details for ALL cards
        const cardsWithDetails = await Promise.all(
          response.data.savings.map(async (saving: any) => {
            try {
              let cardDetails: any = { data: {} };
              if (saving.card_alias) {
                cardDetails = await cardService.getCardDetails(saving.card_alias);
              }
              
              const cardBgImage = saving.card_bg_image 
                || cardDetails.data?.card_bg_image 
                || cardDetails.data?.card_image
                || cardDetails.data?.image
                || '';
              
              const welcomeBenefits = 
                saving.welcomeBenefits 
                || cardDetails.data?.welcomeBenefits 
                || saving.welcome_benefits 
                || cardDetails.data?.welcome_benefits 
                || [];
              
              const joiningFees = parseInt(saving.joining_fees) || 0;
              const totalSavingsYearly = saving.total_savings_yearly || 0;
              const totalExtraBenefits = saving.total_extra_benefits || 0;
              const netSavings = totalSavingsYearly + totalExtraBenefits - joiningFees;
              
              return {
                card_name: cardDetails.data?.card_name || saving.card_name || saving.card_alias,
                card_bg_image: cardBgImage,
                seo_card_alias: cardDetails.data?.seo_card_alias || saving.seo_card_alias || saving.card_alias,
                joining_fees: joiningFees,
                total_savings: saving.total_savings || 0,
                total_savings_yearly: totalSavingsYearly,
                total_extra_benefits: totalExtraBenefits,
                net_savings: netSavings,
                voucher_of: saving.voucher_of || 0,
                voucher_bonus: saving.voucher_bonus || 0,
                welcome_benefits: welcomeBenefits,
                spending_breakdown: saving.spending_breakdown || {}
              } as CardResult;
            } catch (error) {
              console.error(`Error processing card ${saving.card_alias || saving.card_name}:`, error);
              const joiningFees = parseInt(saving.joining_fees) || 0;
              const totalSavingsYearly = saving.total_savings_yearly || 0;
              const totalExtraBenefits = saving.total_extra_benefits || 0;
              const netSavings = totalSavingsYearly + totalExtraBenefits - joiningFees;
              
              return {
                card_name: saving.card_name || saving.card_alias,
                card_bg_image: saving.card_bg_image || '',
                seo_card_alias: saving.seo_card_alias || saving.card_alias,
                joining_fees: joiningFees,
                total_savings: saving.total_savings || 0,
                total_savings_yearly: totalSavingsYearly,
                total_extra_benefits: totalExtraBenefits,
                net_savings: netSavings,
                voucher_of: saving.voucher_of || 0,
                voucher_bonus: saving.voucher_bonus || 0,
                welcome_benefits: saving.welcomeBenefits || saving.welcome_benefits || [],
                spending_breakdown: saving.spending_breakdown || {}
              } as CardResult;
            }
          })
        );

        const sortedCards = cardsWithDetails.sort((a, b) => b.net_savings - a.net_savings);
        setResults(sortedCards);
        setShowResults(true);
      } else {
        toast({
          title: "No results found",
          description: "Please try adjusting your spending amounts.",
          variant: "destructive"
        });
      }
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

  const handleApplyNow = (card: CardResult) => {
    navigate(`/cards/${card.seo_card_alias}`);
  };

  const handleViewBreakdown = (card: CardResult) => {
    setSelectedCard(card);
    setShowBreakdown(true);
  };

  const renderResults = () => {
    if (!results || results.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No matching cards found. Try adjusting your spending patterns.</p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-foreground">Your Perfect Card Matches!</h2>
          <p className="text-muted-foreground">Based on your spending, here are the top 3 cards for you</p>
        </div>

        <div className="grid gap-6">
          {results.map((card, index) => (
            <div key={index} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5">
                {card.card_bg_image && (
                  <img 
                    src={card.card_bg_image} 
                    alt={card.card_name}
                    className="absolute inset-0 w-full h-full object-contain p-8"
                  />
                )}
                {index === 0 && (
                  <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    🏆 Best Match
                  </div>
                )}
              </div>

              <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold text-foreground">{card.card_name}</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Savings</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ₹{card.total_savings_yearly?.toLocaleString('en-IN') || '0'}
                    </p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Net Benefit</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      ₹{card.net_savings?.toLocaleString('en-IN') || '0'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={() => handleApplyNow(card)}
                    className="flex-1"
                  >
                    View Details
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleViewBreakdown(card)}
                  >
                    See Breakdown
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button 
            variant="outline"
            onClick={() => {
              setCurrentStep(0);
              setSpendingData({
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
              });
              setResults(null);
            }}
          >
            Start Over
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 container mx-auto px-4 max-w-2xl">
          <div className="min-h-[600px] flex flex-col items-center justify-center space-y-8">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              <Sparkles className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Finding Your Perfect Cards...</h2>
              <p className="text-lg text-primary font-medium animate-pulse">
                {funFacts[currentFactIndex]}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (results) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 container mx-auto px-4 max-w-4xl pb-12">
          {renderResults()}
        </div>

        <Dialog open={showBreakdown} onOpenChange={setShowBreakdown}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedCard?.card_name} - Savings Breakdown</DialogTitle>
              <DialogDescription>Detailed breakdown of your savings with this card</DialogDescription>
            </DialogHeader>
            
            {selectedCard && (
              <div className="space-y-4">
                {Object.entries(selectedCard.spending_breakdown).map(([key, breakdown]) => (
                  <div key={key} className="border border-border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-foreground">{breakdown.on}</h4>
                      <span className="text-green-600 dark:text-green-400 font-bold">
                        ₹{breakdown.savings?.toLocaleString('en-IN') || '0'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Spend: ₹{breakdown.spend?.toLocaleString('en-IN') || '0'}
                    </p>
                    {breakdown.explanation && breakdown.explanation.length > 0 && (
                      <ul className="space-y-1">
                        {breakdown.explanation.map((exp, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(exp) }} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20 container mx-auto px-4 max-w-2xl pb-12">
        <div className="mb-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">AI Card Genius</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground">Find Your Perfect Card</h1>
          <p className="text-muted-foreground">Answer a few questions about your spending to get personalized card recommendations</p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Question {currentStep + 1} of {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="text-5xl mb-4">{currentQuestion.emoji}</div>
              <h2 className="text-2xl font-semibold text-foreground">
                {currentQuestion.question}
              </h2>
            </div>

            <SpendingInput
              question={currentQuestion.question}
              emoji={currentQuestion.emoji}
              value={spendingData[currentQuestion.field as keyof SpendingData] as number}
              onChange={(value) => setSpendingData({ ...spendingData, [currentQuestion.field]: value })}
              min={currentQuestion.min}
              max={currentQuestion.max}
              step={currentQuestion.step}
              showCurrency={currentQuestion.showCurrency !== false}
              suffix={currentQuestion.suffix}
            />

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="flex-1"
              >
                Skip
              </Button>
              <Button
                onClick={handleNext}
                className="flex-1"
              >
                {currentStep === questions.length - 1 ? 'Calculate' : 'Next'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            All your data is processed securely and never stored
          </p>
        </div>
      </div>
    </div>
  );
};

export default CardGenius;
