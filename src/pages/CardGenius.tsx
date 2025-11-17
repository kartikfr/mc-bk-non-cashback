import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
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
  const [currentStep, setCurrentStep] = useState(0);
  const [spendingData, setSpendingData] = useState<SpendingData>({
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
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CardResult[] | null>(null);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [selectedCard, setSelectedCard] = useState<CardResult | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setCurrentFactIndex((prev) => (prev + 1) % funFacts.length);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      calculateResults();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    const field = currentQuestion.field;
    setSpendingData({ ...spendingData, [field]: 0 });
    handleNext();
  };

  const calculateResults = async () => {
    setLoading(true);
    try {
      const response = await cardService.calculateCardGenius(spendingData as SpendingData);
      if (response.status === "success" && response.data) {
        setResults(Object.values(response.data).slice(0, 3) as CardResult[]);
      } else {
        toast({
          title: "Error",
          description: "Unable to calculate card recommendations",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error calculating card genius:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
