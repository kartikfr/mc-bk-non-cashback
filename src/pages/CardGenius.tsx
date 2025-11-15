import React, { useState, useEffect } from "react";
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
  { field: 'domestic_lounge_usage_quarterly', question: 'How often do you visit domestic airport lounges in a year?', emoji: '🇮🇳', min: 0, max: 50, step: 1 },
  { field: 'international_lounge_usage_quarterly', question: 'Plus, what about international airport lounges?', emoji: '🌎', min: 0, max: 50, step: 1 },
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

  useEffect(() => {
    setShowWelcomeDialog(true);
  }, []);

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleValueChange = (value: number) => {
    setResponses(prev => ({ ...prev, [currentQuestion.field]: value }));
  };

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
        // Sort by total_savings_yearly
        const sortedSavings = response.data.savings
        // Fetch card details for ALL cards
        const cardsWithDetails = await Promise.all(
          response.data.savings.map(async (saving: any) => {
            try {
              let cardDetails: any = { data: {} };
              if (saving.card_alias) {
                cardDetails = await cardService.getCardDetails(saving.card_alias);
                console.log('Card details for', saving.card_alias, ':', cardDetails);
              } else {
                console.warn('Missing card_alias for saving item:', saving);
              }
              
              // Prefer image coming in savings payload
              const cardBgImage = saving.card_bg_image 
                || cardDetails.data?.card_bg_image 
                || cardDetails.data?.card_image
                || cardDetails.data?.image
                || '';
              
              // Map welcome benefits from either response shape
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

        // Sort by net savings in descending order
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

  const toggleCardExpansion = (index: number) => {
    setExpandedCards(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleApplyFromDetail = () => {
    if (!selectedCard) return;
    
    // Extract bank name from the card name (first word is usually the bank)
    const bankName = selectedCard.card_name?.split(' ')[0] || 'Bank';
    
    // Use hard-coded bank URLs - no need to fetch network_url
    openRedirectInterstitial({
      bankName: bankName,
      bankLogo: selectedCard.card_bg_image, // Use card image as fallback for bank logo
      cardName: selectedCard.card_name
    });
  };

  const handleCardSelect = (card: any) => {
    setSelectedCard(card);
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          'Content-Type': 'application/json',
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
            description: `${ineligibleCount} cards filtered out. Showing ${aliases.length} eligible cards.`,
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
    const totalMonthlySpend = Object.values(responses).reduce((acc, val) => acc + (val || 0), 0);
    const totalAnnualSpend = totalMonthlySpend * 12;

    if (selectedCard) {
      // Detailed card view
      return (
        <div className="min-h-screen bg-background">
          <header className="sticky top-0 bg-white border-b border-border z-50">
            <div className="container mx-auto px-4 py-4">
              <button
                onClick={() => setSelectedCard(null)}
                className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-semibold">Back to Results</span>
              </button>
            </div>
          </header>

          <main className="container mx-auto px-4 py-8 max-w-6xl">
            <h1 className="text-2xl font-bold text-foreground mb-6">{selectedCard.card_name}</h1>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Card Image */}
              <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl p-8 flex items-center justify-center">
                <img
                  src={selectedCard.card_bg_image}
                  alt={selectedCard.card_name}
                  className="w-full max-w-sm h-64 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
              </div>

              {/* Savings Summary */}
              <div className="bg-blue-50 rounded-2xl p-6">
                <p className="text-sm text-muted-foreground mb-4">On The Spends Of ₹{(totalAnnualSpend / 100000).toFixed(2)}L Annually</p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground">Total Savings</span>
                    <span className="text-lg font-semibold text-foreground">₹{selectedCard.total_savings_yearly.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground">Milestone Benefits</span>
                    <span className="text-lg font-semibold text-foreground">₹{selectedCard.total_extra_benefits.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground">Joining Fees</span>
                    <span className="text-lg font-semibold text-foreground">-₹{selectedCard.joining_fees.toLocaleString()}</span>
                  </div>
                  
                  <div className="h-px bg-border"></div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-foreground">Your Net Savings</span>
                    <span className="text-2xl font-bold text-green-600">₹{selectedCard.net_savings.toLocaleString()}</span>
                  </div>
                </div>

                <Button className="w-full" size="lg" onClick={handleApplyFromDetail}>Apply Now</Button>
              </div>
            </div>

            {/* Welcome Benefits Section */}
            {(() => {
              const list = Array.isArray(selectedCard.welcome_benefits) ? selectedCard.welcome_benefits : [];
              const fallbackItem = (selectedCard as any).voucher_of || (selectedCard as any).voucher_bonus
                ? [{
                    voucher_of: (selectedCard as any).voucher_of,
                    voucher_bonus: (selectedCard as any).voucher_bonus,
                    minimum_spend: (selectedCard as any).minimum_spend
                  }]
                : [];
              const display = list.length > 0 ? list : fallbackItem;
              if (!display || display.length === 0) return null;
              return (
                <div className="bg-white rounded-xl border border-border p-6 mb-8">
                  <h2 className="text-xl font-bold text-foreground mb-2">Extra Benefits</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Note: These extra benefits are not included in your annual savings. They are for your reference
                  </p>
                  
                  <h3 className="text-lg font-semibold text-primary mb-4">Welcome Benefit</h3>
                  
                  <div className="space-y-3">
                    {display.map((benefit: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-foreground">
                            On card activation you get a {benefit.voucher_of || 'benefit'}
                            {benefit.voucher_bonus && ` of ₹${parseInt(benefit.voucher_bonus).toLocaleString()}`}
                            {benefit.minimum_spend && benefit.minimum_spend !== "0" && (
                              <span className="text-muted-foreground">{' '} (Minimum spend: ₹{parseInt(benefit.minimum_spend).toLocaleString()})</span>
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}


            {/* Savings Breakdown */}
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-xl font-bold text-foreground mb-6">Your Total Savings Breakdown</h2>
              
              {/* Category Pills - Horizontal Scroll */}
              <div className="relative mb-6">
                <div className="overflow-x-auto pb-2 scrollbar-hide">
                  <div className="flex gap-3 min-w-max">
                    {Object.entries(selectedCard.spending_breakdown || {}).map(([category, details]) => {
                      if (!details || !details.spend || details.spend === 0) return null;
                      const isActive = selectedCategory === category || (!selectedCategory && Object.keys(selectedCard.spending_breakdown).findIndex(k => selectedCard.spending_breakdown[k]?.spend > 0) === Object.keys(selectedCard.spending_breakdown).indexOf(category));
                      return (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`px-6 py-3 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                            isActive 
                              ? 'bg-primary text-primary-foreground shadow-md' 
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          {category.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Savings
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Savings Breakdown Title and Toggle */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Savings Breakdown</h3>
                <div className="flex gap-2 bg-muted rounded-lg p-1">
                  <button
                    onClick={() => setBreakdownView('yearly')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      breakdownView === 'yearly' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Yearly
                  </button>
                  <button
                    onClick={() => setBreakdownView('monthly')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      breakdownView === 'monthly' 
                        ? 'bg-foreground text-background' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Monthly
                  </button>
                </div>
              </div>

              {/* Category Breakdown Details */}
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

                return (
                  <div className="border border-border rounded-xl p-6 bg-muted/30">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-4 border-b border-border">
                        <span className="text-muted-foreground">Total Spends</span>
                        <span className="text-lg font-semibold text-foreground">₹{spend.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex justify-between items-center pb-4 border-b border-border">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Points Earned</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>Reward points earned on your spending in this category</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <span className="text-lg font-semibold text-foreground">{pointsEarned.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex justify-between items-center pb-4 border-b border-border">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Value of 1 Point</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>The monetary value of each reward point</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <span className="text-lg font-semibold text-foreground">₹{convRate.toFixed(2)}</span>
                      </div>
                      
                      {pointsEarned > 0 && convRate > 0 && (
                        <div className="text-center py-2 text-sm text-muted-foreground">
                          ₹{pointsEarned.toLocaleString()} × {convRate.toFixed(2)}
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center pt-2 bg-green-50 dark:bg-green-950 -mx-6 px-6 py-4 rounded-b-xl">
                        <span className="font-semibold text-foreground">Total Savings</span>
                        <span className="text-2xl font-bold text-green-600">₹{savings.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Explanation */}
                    {details.explanation && details.explanation.length > 0 && (
                      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-xs font-semibold text-primary mb-2">How it&apos;s calculated:</p>
                        <div className="space-y-1">
                          {details.explanation.map((exp, idx) => (
                            <div 
                              key={idx} 
                              className="text-xs text-foreground"
                              dangerouslySetInnerHTML={{ __html: sanitizeHtml(exp) }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </main>
        </div>
      );
    }

    // Filter results based on lifetime free and eligibility filters
    let filteredResults = results;
    
    if (showLifetimeFreeOnly) {
      filteredResults = filteredResults.filter(card => card.joining_fees === 0);
    }
    
    if (eligibilityApplied && eligibleCardAliases.length > 0) {
      filteredResults = filteredResults.filter(card => 
        eligibleCardAliases.includes(card.seo_card_alias)
      );
    }

    // Get categories where user has spending (non-zero responses)
    const spendingCategories = Object.entries(responses)
      .filter(([_, value]) => value > 0)
      .map(([key]) => key);

    // Results list view
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 bg-white border-b border-border z-50">
          <div className="container mx-auto px-4 py-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Back to Home</span>
            </button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Title */}
          <h1 className="text-3xl font-bold text-center text-foreground mb-8">
            The Best Cards Sorted By Annual Savings!
          </h1>

          {/* Total Spends Summary */}
          <div className="bg-muted/50 rounded-xl p-6 mb-6 text-center">
            <p className="text-sm font-medium text-foreground mb-2">Your Total Spends:</p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="text-2xl font-bold text-foreground">
                ₹{(totalMonthlySpend / 100000).toFixed(2)}L Monthly
              </span>
              <span className="text-muted-foreground">|</span>
              <span className="text-2xl font-bold text-primary">
                ₹{(totalAnnualSpend / 100000).toFixed(2)}L Annually
              </span>
              <button
                onClick={() => {
                  setShowResults(false);
                  setCurrentStep(0);
                }}
                className="ml-2 text-primary hover:text-primary/80 font-medium text-sm flex items-center gap-1"
              >
                Edit Spends <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <Button 
              variant={showLifetimeFreeOnly ? "default" : "outline"} 
              size="sm"
              onClick={() => setShowLifetimeFreeOnly(!showLifetimeFreeOnly)}
            >
              Lifetime Free Cards
            </Button>
            
            <Popover open={eligibilityOpen} onOpenChange={setEligibilityOpen}>
              <PopoverTrigger asChild>
                <Button 
                  size="sm" 
                  variant={eligibilityApplied ? "default" : "outline"}
                  className="gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {eligibilityApplied ? "Eligibility Applied" : "Check Eligibility"}
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-80 p-6 bg-card rounded-xl shadow-2xl border-2 border-primary/20 z-50" 
                align="start"
                sideOffset={8}
              >
                <h3 className="font-semibold text-lg mb-4">Check Your Eligibility</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      type="text"
                      placeholder="Enter your pincode"
                      value={eligibilityData.pincode}
                      onChange={(e) => setEligibilityData({ ...eligibilityData, pincode: e.target.value })}
                      maxLength={6}
                    />
                  </div>
                  <div>
                    <Label htmlFor="income">In-hand Income (Monthly)</Label>
                    <Input
                      id="income"
                      type="text"
                      placeholder="e.g., 50000"
                      value={eligibilityData.inhandIncome}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setEligibilityData({ ...eligibilityData, inhandIncome: value });
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="empStatus">Employment Status</Label>
                    <Select
                      value={eligibilityData.empStatus}
                      onValueChange={(value) => setEligibilityData({ ...eligibilityData, empStatus: value })}
                    >
                      <SelectTrigger id="empStatus">
                        <SelectValue placeholder="Select employment status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="salaried">Salaried</SelectItem>
                        <SelectItem value="self_employed">Self Employed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={handleEligibilityCheck} 
                    className="w-full"
                  >
                    Apply Eligibility
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Tabs */}
          <div className="border-b border-border mb-6">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('quick')}
                className={`pb-3 px-1 font-semibold transition-colors relative ${
                  activeTab === 'quick' 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Quick Insights
                {activeTab === 'quick' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('detailed')}
                className={`pb-3 px-1 font-semibold transition-colors relative ${
                  activeTab === 'detailed' 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Detailed Breakdown
                {activeTab === 'detailed' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
                )}
              </button>
            </div>
          </div>

          {/* Results Table */}
          <TooltipProvider>
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-semibold text-sm text-foreground whitespace-nowrap">Credit Cards</th>
                      
                      {/* Quick Insights Tab - Show summary columns */}
                      {activeTab === 'quick' && (
                        <>
                          <th className="text-center p-4 font-semibold text-sm text-foreground whitespace-nowrap">
                            Total Savings
                          </th>
                          <th className="text-center p-4 font-semibold text-sm text-muted-foreground whitespace-nowrap w-12">
                            <span className="text-2xl">+</span>
                          </th>
                          <th className="text-center p-4 font-semibold text-sm text-foreground whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              Milestone Benefits
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
                          <th className="text-center p-4 font-semibold text-sm text-muted-foreground whitespace-nowrap w-12">
                            <span className="text-2xl">-</span>
                          </th>
                          <th className="text-center p-4 font-semibold text-sm text-foreground whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              Joining Fees
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
                          <th className="text-center p-4 font-semibold text-sm text-muted-foreground whitespace-nowrap w-12">
                            <span className="text-2xl">=</span>
                          </th>
                          <th className="text-center p-4 font-semibold text-sm text-foreground whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              Net Savings
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p>Your actual profit calculated as: Total Savings + Milestone Benefits - Joining Fees</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </th>
                        </>
                      )}
                      
                      {/* Detailed Breakdown Tab - Show category columns + summary */}
                      {activeTab === 'detailed' && (
                        <>
                          {spendingCategories.map((category, idx) => {
                            const displayName = questions.find(q => q.field === category)?.question
                              .replace('How much do you spend on ', '')
                              .replace('How much do you spend at ', '')
                              .replace('How much do you spend ', '')
                              .replace(' in a month?', '')
                              .replace(' in a year?', '')
                              .replace(' every month?', '')
                              .replace(' monthly?', '')
                              .replace(' annually?', '')
                              .replace("What's your average ", '')
                              .replace('And what about your ', '')
                              .replace('How much do you pay for ', '')
                              .replace('How much do you pay in ', '')
                              .replace('How often do you visit ', '')
                              .replace('Plus, what about ', '')
                              || category.replace(/_/g, ' ');
                            
                            return (
                              <React.Fragment key={category}>
                                <th className="text-center p-4 font-semibold text-sm text-foreground whitespace-nowrap">
                                  {displayName}
                                </th>
                                {idx < spendingCategories.length - 1 && (
                                  <th className="text-center p-4 font-semibold text-sm text-muted-foreground whitespace-nowrap w-12">
                                    <span className="text-2xl">+</span>
                                  </th>
                                )}
                              </React.Fragment>
                            );
                          })}
                          <th className="text-center p-4 font-semibold text-sm text-muted-foreground whitespace-nowrap w-12">
                            <span className="text-2xl">=</span>
                          </th>
                          <th className="text-center p-4 font-semibold text-sm text-foreground whitespace-nowrap">
                            Total Savings
                          </th>
                          <th className="text-center p-4 font-semibold text-sm text-muted-foreground whitespace-nowrap w-12">
                            <span className="text-2xl">+</span>
                          </th>
                          <th className="text-center p-4 font-semibold text-sm text-foreground whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              Milestone Benefits
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
                          <th className="text-center p-4 font-semibold text-sm text-muted-foreground whitespace-nowrap w-12">
                            <span className="text-2xl">-</span>
                          </th>
                          <th className="text-center p-4 font-semibold text-sm text-foreground whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              Joining Fees
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
                          <th className="text-center p-4 font-semibold text-sm text-muted-foreground whitespace-nowrap w-12">
                            <span className="text-2xl">=</span>
                          </th>
                          <th className="text-center p-4 font-semibold text-sm text-foreground whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              Net Savings
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p>Your actual profit calculated as: Total Savings + Milestone Benefits - Joining Fees</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.map((card, index) => {
                      return (
                        <tr 
                          key={index} 
                          className={`border-t border-border hover:bg-muted/30 transition-colors cursor-pointer ${
                            index === 0 ? 'bg-green-50/50' : ''
                          }`}
                          onClick={() => handleCardSelect(card)}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-4">
                              <img
                                src={card.card_bg_image}
                                alt={card.card_name}
                                className="w-20 h-12 object-contain"
                                onError={(e) => {
                                  e.currentTarget.src = "/placeholder.svg";
                                }}
                              />
                              <div>
                                <p className="font-semibold text-foreground whitespace-nowrap">{card.card_name}</p>
                              </div>
                            </div>
                          </td>
                          
                          {/* Quick Insights Tab - Show summary data */}
                          {activeTab === 'quick' && (
                            <>
                              <td className="p-4 text-center font-semibold text-green-600 whitespace-nowrap">
                                ₹{card.total_savings_yearly.toLocaleString()}
                              </td>
                              <td className="p-4"></td>
                              <td className="p-4 text-center font-semibold text-blue-600 whitespace-nowrap">
                                ₹{card.total_extra_benefits.toLocaleString()}
                              </td>
                              <td className="p-4"></td>
                              <td className="p-4 text-center font-semibold text-red-600 whitespace-nowrap">
                                ₹{card.joining_fees.toLocaleString()}
                              </td>
                              <td className="p-4"></td>
                              <td className="p-4 text-center whitespace-nowrap">
                                <span className="font-bold text-lg text-green-700">
                                  ₹{card.net_savings.toLocaleString()}
                                </span>
                              </td>
                            </>
                          )}
                          
                          {/* Detailed Breakdown Tab - Show category data + summary */}
                          {activeTab === 'detailed' && (
                            <>
                              {spendingCategories.map((category, idx) => {
                                const breakdown = card.spending_breakdown[category];
                                const yearlySavings = breakdown?.savings ? breakdown.savings * 12 : 0;
                                return (
                                  <React.Fragment key={category}>
                                    <td className="p-4 text-center font-semibold text-green-600 whitespace-nowrap">
                                      ₹{yearlySavings.toLocaleString()}
                                    </td>
                                    {idx < spendingCategories.length - 1 && (
                                      <td className="p-4"></td>
                                    )}
                                  </React.Fragment>
                                );
                              })}
                              <td className="p-4"></td>
                              <td className="p-4 text-center font-semibold text-green-600 whitespace-nowrap">
                                ₹{card.total_savings_yearly.toLocaleString()}
                              </td>
                              <td className="p-4"></td>
                              <td className="p-4 text-center font-semibold text-blue-600 whitespace-nowrap">
                                ₹{card.total_extra_benefits.toLocaleString()}
                              </td>
                              <td className="p-4"></td>
                              <td className="p-4 text-center font-semibold text-red-600 whitespace-nowrap">
                                ₹{card.joining_fees.toLocaleString()}
                              </td>
                              <td className="p-4"></td>
                              <td className="p-4 text-center whitespace-nowrap">
                                <span className="font-bold text-lg text-green-700">
                                  ₹{card.net_savings.toLocaleString()}
                                </span>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </TooltipProvider>

          {/* Start Over Button */}
          <div className="mt-8 text-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setShowResults(false);
                setCurrentStep(0);
                setResponses({});
                setResults([]);
              }}
            >
              Start Over
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      {/* Welcome Dialog */}
      <Dialog open={showWelcomeDialog} onOpenChange={setShowWelcomeDialog}>
        <DialogContent className="sm:max-w-lg">
          <button
            onClick={() => setShowWelcomeDialog(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          
          <div className="flex flex-col items-center text-center space-y-4 pt-6">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-2">
              <img src={logo} alt="Card Genius 360" className="w-24 h-24 object-contain" />
            </div>
            
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-3xl font-bold bg-gradient-accent bg-clip-text text-transparent">
                Welcome to Card Genius 360
              </DialogTitle>
              <DialogDescription className="text-base text-charcoal-700 leading-relaxed">
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

            <Button 
              size="lg" 
              onClick={() => setShowWelcomeDialog(false)}
              className="w-full shadow-lg"
            >
              Let's Get Started
              <ArrowRight className="ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Loading State */}
      {isCalculating && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
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
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-charcoal-100 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-charcoal-700 hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Back to Home</span>
            </button>
            
            <div className="flex items-center gap-2 text-charcoal-600">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-semibold">Card Genius</span>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="sticky top-[73px] bg-white border-b border-charcoal-100 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-charcoal-700">
              Question {currentStep + 1} of {questions.length}
            </span>
            <span className="text-sm font-medium text-primary">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="w-full h-2 bg-charcoal-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-accent transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Welcome Message */}
          {currentStep === 0 && (
            <div className="mb-8 text-center animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-bold text-charcoal-900 mb-4">
                Let's Find Your Perfect Card
              </h1>
              <p className="text-xl text-charcoal-700">
                Answer {questions.length} quick questions about your spending habits, and we'll recommend the best cards for you.
              </p>
            </div>
          )}

          {/* Question Card */}
          <div className="animate-fade-in">
            <SpendingInput
              question={currentQuestion.question}
              emoji={currentQuestion.emoji}
              value={responses[currentQuestion.field] || 0}
              onChange={handleValueChange}
              min={currentQuestion.min}
              max={currentQuestion.max}
              step={currentQuestion.step}
            />
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            <Button
              variant="outline"
              size="lg"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex-1"
            >
              <ArrowLeft className="mr-2" />
              Previous
            </Button>
            
            {currentStep !== questions.length - 1 && (
              <Button
                variant="ghost"
                size="lg"
                onClick={() => setCurrentStep(questions.length - 1)}
                className="flex-1"
              >
                Skip All
              </Button>
            )}
            
            <Button
              size="lg"
              onClick={handleNext}
              className="flex-1"
            >
              {currentStep === questions.length - 1 ? (
                <>
                  Show My Results
                  <Sparkles className="ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Skip Option */}
          <div className="text-center mt-6">
            <button
              onClick={handleNext}
              className="text-charcoal-500 hover:text-primary font-medium transition-colors"
            >
              Skip this question →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CardGenius;
