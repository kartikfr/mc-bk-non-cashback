import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SpendingInput } from "@/components/ui/spending-input";
import { ArrowLeft, ArrowRight, Loader2, Trophy, TrendingUp, Award, Sparkles, ChevronDown, Shield, CheckCircle2, Zap, Home } from "lucide-react";
import { cardService, SpendingData } from "@/services/cardService";
import { toast } from "sonner";
import { CardSearchDropdown } from "@/components/CardSearchDropdown";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { redirectToCardApplication } from "@/utils/redirectHandler";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
interface CategorySavings {
  category: string;
  emoji: string;
  userSaving: number;
  geniusSaving: number;
}
interface Card {
  id: number;
  name: string;
  seo_card_alias: string;
  image: string;
  banks?: {
    name: string;
  };
  annual_saving?: number;
  total_savings_yearly?: number;
  joining_fees?: string;
  joining_fee_text?: string;
  joining_fee_offset?: string;
  card_type?: string;
  annual_fee?: string;
  annual_fee_text?: string;
  annual_fee_waiver?: string;
  reward_rate?: string;
  welcome_bonus?: string;
  milestone_benefits_only?: number;
  total_extra_benefits?: number;
  key_benefits?: string[];
  spending_breakdown_array?: SpendingBreakdownItem[];
}
interface SpendingBreakdownItem {
  on: string;
  spend: number;
  points_earned: number;
  savings: number;
  explanation?: string;
  conv_rate?: number;
  maxCap?: number;
}
interface SpendingQuestion {
  field: keyof SpendingData;
  question: string;
  emoji: string;
  min: number;
  max: number;
  step: number;
  isCount?: boolean;
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
  isCount: true
}, {
  field: 'international_lounge_usage_quarterly',
  question: 'Plus, what about international airport lounges?',
  emoji: '🌎',
  min: 0,
  max: 50,
  step: 1,
  isCount: true
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
const BeatMyCard = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'select' | 'questions' | 'results'>('select');
  const [cards, setCards] = useState<Card[]>([]);
  const [filteredCards, setFilteredCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<SpendingData>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [userCardData, setUserCardData] = useState<Card | null>(null);
  const [geniusCardData, setGeniusCardData] = useState<Card | null>(null);
  const [categorySavings, setCategorySavings] = useState<CategorySavings[]>([]);
  useEffect(() => {
    fetchCards();
  }, []);
  const fetchCards = async () => {
    setIsLoading(true);
    try {
      const response = await cardService.getPartnerCards();
      if (response.status === "success" && response.data && Array.isArray(response.data)) {
        setCards(response.data);
        setFilteredCards(response.data);
      } else {
        setCards([]);
        setFilteredCards([]);
      }
    } catch (error) {
      toast.error("Failed to fetch cards");
      console.error(error);
      setCards([]);
      setFilteredCards([]);
    } finally {
      setIsLoading(false);
    }
  };
  const handleCardSelect = (card: Card) => {
    setSelectedCard(card);
    setStep('questions');
  };
  const handleNext = async () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await calculateResults();
      // Scroll to top smoothly after results are shown
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }, 100);
    }
  };
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  const handleSkip = () => {
    // Skip current question (leave value as 0 or undefined)
    handleNext();
  };
  const handleSkipAll = () => {
    // Skip all remaining questions and calculate
    calculateResults();
  };
  const handleApplyNow = (card: Card | null) => {
    if (!card) return;
    const success = redirectToCardApplication(card, {
      cardName: card.name,
      bankName: card.banks?.name || card.name.split(' ')[0],
      bankLogo: card.image
    });
    if (!success) {
      toast.error('Unable to open the bank site. Please allow pop-ups or try again later.');
    }
  };
  const calculateResults = async () => {
    if (!selectedCard) {
      toast.error("No card selected");
      return;
    }
    setIsCalculating(true);
    try {
      // Ensure all required fields are present with default value of 0
      const completePayload: SpendingData = {
        amazon_spends: responses.amazon_spends || 0,
        flipkart_spends: responses.flipkart_spends || 0,
        other_online_spends: responses.other_online_spends || 0,
        other_offline_spends: responses.other_offline_spends || 0,
        grocery_spends_online: responses.grocery_spends_online || 0,
        online_food_ordering: responses.online_food_ordering || 0,
        fuel: responses.fuel || 0,
        dining_or_going_out: responses.dining_or_going_out || 0,
        flights_annual: responses.flights_annual || 0,
        hotels_annual: responses.hotels_annual || 0,
        domestic_lounge_usage_quarterly: responses.domestic_lounge_usage_quarterly || 0,
        international_lounge_usage_quarterly: responses.international_lounge_usage_quarterly || 0,
        mobile_phone_bills: responses.mobile_phone_bills || 0,
        electricity_bills: responses.electricity_bills || 0,
        water_bills: responses.water_bills || 0,
        insurance_health_annual: responses.insurance_health_annual || 0,
        insurance_car_or_bike_annual: responses.insurance_car_or_bike_annual || 0,
        rent: responses.rent || 0,
        school_fees: responses.school_fees || 0
      };
      const calculateResponse = await cardService.calculateCardGenius(completePayload);

      // API returns: { status: "success", data: { success: true, savings: [...] } }
      if (calculateResponse.status === "success" && calculateResponse.data?.success && calculateResponse.data?.savings && calculateResponse.data.savings.length > 0) {
        const savingsArray = calculateResponse.data.savings;

        // Sort by total_savings to get the top card
        const sortedCards = [...savingsArray].sort((a: any, b: any) => {
          const aSaving = a.total_savings || 0;
          const bSaving = b.total_savings || 0;
          return bSaving - aSaving;
        });
        if (sortedCards.length === 0) {
          toast.error("No savings data returned. Please adjust your spending inputs and try again.");
          return;
        }
        const topCard = sortedCards[0];
        if (!topCard) {
          toast.error("We couldn't find a better card match. Please try again.");
          return;
        }

        // Find the user's selected card in the results by matching seo_card_alias
        const userCardInResults = savingsArray.find((card: any) => card.seo_card_alias === selectedCard.seo_card_alias);
        if (!userCardInResults) {
          console.error("User's card not found in results. Selected:", selectedCard.seo_card_alias);
          toast.error("Your selected card was not found in the results");
          setStep('select');
          setCurrentStep(0);
          setResponses({});
          return;
        }
        // Try to fetch detailed data for both cards, but use API data as fallback
        let userCardData = null;
        let geniusCardData = null;
        try {
          const [userCard, geniusCard] = await Promise.all([cardService.getCardDetailsByAlias(selectedCard.seo_card_alias).catch(err => {
            console.error("User card fetch failed:", err);
            return null;
          }), cardService.getCardDetailsByAlias(topCard.seo_card_alias).catch(err => {
            console.error("Genius card fetch failed:", err);
            return null;
          })]);

          // User's card data - prioritize image from API response
          if (userCard?.status === "success" && userCard.data?.[0]) {
            userCardData = {
              ...userCard.data[0],
              image: userCardInResults.image || userCard.data[0].image,
              // Use API image first
              annual_saving: userCardInResults.total_savings || 0,
              total_savings_yearly: userCardInResults.total_savings_yearly || 0,
              spending_breakdown_array: userCardInResults.spending_breakdown_array || []
            };
          } else {
            // Fallback to selected card data with API savings and image
            userCardData = {
              ...selectedCard,
              image: userCardInResults.image || selectedCard.image,
              // Use API image first
              name: userCardInResults.card_name || selectedCard.name,
              annual_saving: userCardInResults.total_savings || 0,
              total_savings_yearly: userCardInResults.total_savings_yearly || 0,
              spending_breakdown_array: userCardInResults.spending_breakdown_array || []
            };
          }

          // Genius card data - prioritize image from API response
          if (geniusCard?.status === "success" && geniusCard.data?.[0]) {
            geniusCardData = {
              ...geniusCard.data[0],
              image: topCard.image || geniusCard.data[0].image,
              // Use API image first
              annual_saving: topCard.total_savings || 0,
              total_savings_yearly: topCard.total_savings_yearly || 0,
              spending_breakdown_array: topCard.spending_breakdown_array || []
            };
          } else {
            // Fallback: Create card data from API response with API image
            geniusCardData = {
              id: topCard.id,
              name: topCard.card_name,
              seo_card_alias: topCard.seo_card_alias,
              image: topCard.image || '',
              // Use API image directly
              annual_saving: topCard.total_savings || 0,
              total_savings_yearly: topCard.total_savings_yearly || 0,
              spending_breakdown_array: topCard.spending_breakdown_array || [],
              banks: {
                name: topCard.card_name.split(' ')[0]
              } // Extract bank name from card name
            };
          }

          // Calculate category-wise savings
          const categoryBreakdown = calculateCategorySavings(responses, userCardData, geniusCardData);
          setCategorySavings(categoryBreakdown);
          setUserCardData(userCardData);
          setGeniusCardData(geniusCardData);
          setStep('results');
        } catch (error) {
          console.error("Error processing card data:", error);
          toast.error("Failed to process card comparison");
        }
      } else {
        console.error("Invalid API response structure:", calculateResponse);
        toast.error("No results found. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to calculate results");
      console.error("Calculate Results Error:", error);
    } finally {
      setIsCalculating(false);
    }
  };
  const calculateCategorySavings = (spending: SpendingData, userCard: Card, geniusCard: Card): CategorySavings[] => {
    const categories: CategorySavings[] = [];

    // Map of spending categories to display names and emojis
    const categoryMap: {
      [key: string]: {
        name: string;
        emoji: string;
      };
    } = {
      amazon_spends: {
        name: 'Amazon Shopping',
        emoji: '🛍️'
      },
      flipkart_spends: {
        name: 'Flipkart Shopping',
        emoji: '📦'
      },
      other_online_spends: {
        name: 'Online Shopping',
        emoji: '💸'
      },
      other_offline_spends: {
        name: 'Offline Shopping',
        emoji: '🏪'
      },
      grocery_spends_online: {
        name: 'Groceries',
        emoji: '🥦'
      },
      online_food_ordering: {
        name: 'Food Delivery',
        emoji: '🛵'
      },
      fuel: {
        name: 'Fuel',
        emoji: '⛽'
      },
      dining_or_going_out: {
        name: 'Dining Out',
        emoji: '🥗'
      },
      flights_annual: {
        name: 'Flight Bookings',
        emoji: '✈️'
      },
      hotels_annual: {
        name: 'Hotel Stays',
        emoji: '🛌'
      },
      mobile_phone_bills: {
        name: 'Mobile & WiFi',
        emoji: '📱'
      },
      electricity_bills: {
        name: 'Electricity',
        emoji: '⚡'
      },
      water_bills: {
        name: 'Water',
        emoji: '💧'
      },
      insurance_health_annual: {
        name: 'Health Insurance',
        emoji: '🛡️'
      },
      insurance_car_or_bike_annual: {
        name: 'Vehicle Insurance',
        emoji: '🚗'
      },
      rent: {
        name: 'House Rent',
        emoji: '🏠'
      },
      school_fees: {
        name: 'School Fees',
        emoji: '🎓'
      }
    };

    // Create lookup maps for both cards' spending breakdown
    const userBreakdownMap = new Map<string, number>();
    const geniusBreakdownMap = new Map<string, number>();

    // Populate user card savings by category
    if (userCard.spending_breakdown_array) {
      userCard.spending_breakdown_array.forEach(item => {
        if (item.on && item.savings) {
          userBreakdownMap.set(item.on, item.savings);
        }
      });
    }

    // Populate genius card savings by category
    if (geniusCard.spending_breakdown_array) {
      geniusCard.spending_breakdown_array.forEach(item => {
        if (item.on && item.savings) {
          geniusBreakdownMap.set(item.on, item.savings);
        }
      });
    }

    // Build category comparison list
    const allCategories = new Set([...userBreakdownMap.keys(), ...geniusBreakdownMap.keys()]);
    allCategories.forEach(categoryKey => {
      if (categoryMap[categoryKey]) {
        const categoryInfo = categoryMap[categoryKey];
        const userSaving = Math.round(userBreakdownMap.get(categoryKey) || 0);
        const geniusSaving = Math.round(geniusBreakdownMap.get(categoryKey) || 0);

        // Only show categories with meaningful savings
        if (userSaving > 0 || geniusSaving > 0) {
          categories.push({
            category: categoryInfo.name,
            emoji: categoryInfo.emoji,
            userSaving: userSaving,
            geniusSaving: geniusSaving
          });
        }
      }
    });

    // Sort by the higher saving value between the two cards
    return categories.sort((a, b) => Math.max(b.userSaving, b.geniusSaving) - Math.max(a.userSaving, a.geniusSaving));
  };
  const isUserWinner = userCardData && geniusCardData && userCardData.annual_saving >= geniusCardData.annual_saving;

  // Render card selection
  if (step === 'select') {
    return <>
        <Navigation />
        <div className="min-h-screen bg-background pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="section-shell">
          {/* Header with Home Button */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 sm:mb-10 px-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-5 bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                Beat My Card
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
                Select your current card and see if Card Genius can find a better match
              </p>
              
              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
                <Badge variant="secondary" className="px-4 py-2 text-sm font-medium bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20 transition-colors">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI-Powered
                </Badge>
                <Badge variant="secondary" className="px-4 py-2 text-sm font-medium bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
                  <Shield className="w-4 h-4 mr-2" />
                  Unbiased Results
                </Badge>
                <Badge variant="secondary" className="px-4 py-2 text-sm font-medium bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20 transition-colors">
                  <Zap className="w-4 h-4 mr-2" />
                  Instant Comparison
                </Badge>
              </div>
            </div>

            <CardSearchDropdown cards={filteredCards} selectedCard={selectedCard} onCardSelect={handleCardSelect} onClearSelection={() => setSelectedCard(null)} isLoading={isLoading} />
          </div>
        </div>
        </div>
        <Footer />
      </>;
  }

  // Render questionnaire
  if (step === 'questions') {
    const question = questions[currentStep];
    const progress = (currentStep + 1) / questions.length * 100;
    return <>
        <Navigation />
        <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-4 py-8">
          {/* Header with Navigation */}
          <div className="flex items-center justify-between mb-8">
            <Button variant="ghost" onClick={() => navigate('/')} className="gap-2 hover:bg-primary/10">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Button>
            
            <Button variant="ghost" onClick={() => setStep('select')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Card Selection
            </Button>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Question {currentStep + 1} of {questions.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300" style={{
                  width: `${progress}%`
                }} />
              </div>
            </div>

            {/* Question card */}
            <div className="bg-card border border-border rounded-2xl p-8 shadow-lg mb-6">
              <SpendingInput question={question.question} emoji={question.emoji} value={responses[question.field] || 0} onChange={value => setResponses({
                ...responses,
                [question.field]: value
              })} min={question.min} max={question.max} step={question.step} showRupee={!question.isCount} />
            </div>

            {/* Navigation buttons */}
            <div className="flex flex-col items-center gap-3 mt-8">
              <div className="flex items-center justify-between w-full gap-4">
                <Button variant="outline" onClick={handlePrev} disabled={currentStep === 0} className="rounded-full border-2 border-muted-foreground/20 bg-background hover:bg-muted/50 text-muted-foreground px-8 h-12 transition-all duration-200">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                
                <Button variant="ghost" onClick={handleSkipAll} disabled={isCalculating} className="text-foreground hover:text-foreground/80 font-semibold text-base px-0">
                  {isCalculating ? "Calculating..." : "Skip All"}
                </Button>

                <Button onClick={handleNext} disabled={isCalculating} className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-12 shadow-md hover:shadow-lg transition-all duration-200">
                  {isCalculating ? <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Calculating...
                    </> : currentStep === questions.length - 1 ? <>
                      See Results
                      <Sparkles className="ml-2 h-4 w-4" />
                    </> : <>
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>}
                </Button>
              </div>

              <Button variant="ghost" onClick={handleSkip} className="text-sm text-muted-foreground hover:text-muted-foreground/80 px-0 h-auto">
                Skip this question →
              </Button>
            </div>
          </div>
        </div>
        </div>
        <Footer />
      </>;
  }

  // Render results
  if (step === 'results' && userCardData && geniusCardData) {
    const savingsDifference = Math.abs(geniusCardData.annual_saving - userCardData.annual_saving);
    const monthlySavings = Math.max(Math.round(savingsDifference / 12), 0);
    const maxSavings = Math.max(userCardData.annual_saving, geniusCardData.annual_saving);
    const userAnnualText = userCardData.annual_saving?.toLocaleString('en-IN') || '0';
    const geniusAnnualText = geniusCardData.annual_saving?.toLocaleString('en-IN') || '0';
    const savingsPercent = userCardData.annual_saving > 0 ? ((geniusCardData.annual_saving - userCardData.annual_saving) / userCardData.annual_saving) * 100 : 100;
    const heroGradient = isUserWinner ? 'from-emerald-500 via-emerald-600 to-emerald-700' : 'from-blue-600 via-indigo-600 to-purple-600';
    const heroTitle = isUserWinner ? 'You’re already winning!' : 'We Found Your Upgrade!';
    const heroSubtitle = isUserWinner
      ? `Your ${userCardData.name} already earns ₹${userAnnualText} every year.`
      : `Switch to ${geniusCardData.name} and unlock ₹${savingsDifference.toLocaleString('en-IN')} more annually.`;
    const comparisonBars = [
      {
        label: 'Your Card',
        value: userCardData.annual_saving || 0,
        accent: 'from-rose-400 to-rose-500'
      },
      {
        label: 'Recommended Card',
        value: geniusCardData.annual_saving || 0,
        accent: 'from-blue-500 to-blue-600'
      }
    ];
    const extractNumeric = (input: string) => Number(input.replace(/[^0-9.-]/g, ''));
    const formatCurrencyValue = (value?: number | string) => {
      if (value === null || value === undefined) return 'Not available';
      if (typeof value === 'number') {
        if (value === 0) return '₹0';
        return `₹${Math.round(value).toLocaleString('en-IN')}`;
      }
      const trimmed = value.trim();
      if (!trimmed) return 'Not available';
      const numeric = extractNumeric(trimmed);
      if (!Number.isNaN(numeric)) {
        if (numeric === 0) return '₹0';
        return `₹${Math.round(numeric).toLocaleString('en-IN')}`;
      }
      return trimmed;
    };
    const formatFeeValue = (value?: string | number) => {
      if (value === null || value === undefined) return 'Not available';
      if (typeof value === 'number') {
        if (value === 0) return 'Free';
        return `₹${value.toLocaleString('en-IN')}`;
      }
      const trimmed = value.trim();
      if (!trimmed) return 'Not available';
      const numeric = extractNumeric(trimmed);
      if (!Number.isNaN(numeric)) {
        return numeric === 0 ? 'Free' : `₹${numeric.toLocaleString('en-IN')}`;
      }
      return trimmed;
    };
    const formatTextValue = (value?: string) => {
      if (!value || !value.trim()) return 'Not available';
      return value.trim();
    };
    const userMilestoneValue = userCardData.milestone_benefits_only ?? userCardData.total_extra_benefits;
    const geniusMilestoneValue = geniusCardData.milestone_benefits_only ?? geniusCardData.total_extra_benefits;
    const comparisonRows = [
      {
        label: 'Milestone / Miles Benefit',
        helper: 'Vouchers or miles earned after hitting spend targets',
        user: formatCurrencyValue(userMilestoneValue),
        genius: formatCurrencyValue(geniusMilestoneValue)
      },
      {
        label: 'Joining Fee',
        helper: 'One-time fee in the first year',
        user: formatFeeValue(userCardData.joining_fee_text ?? userCardData.joining_fees),
        genius: formatFeeValue(geniusCardData.joining_fee_text ?? geniusCardData.joining_fees)
      },
      {
        label: 'Joining Fee Waiver',
        helper: 'How the joining fee gets reversed',
        user: formatTextValue(userCardData.joining_fee_offset),
        genius: formatTextValue(geniusCardData.joining_fee_offset)
      },
      {
        label: 'Annual Fee',
        helper: 'Yearly renewal fee from year two',
        user: formatFeeValue(userCardData.annual_fee_text ?? userCardData.annual_fee),
        genius: formatFeeValue(geniusCardData.annual_fee_text ?? geniusCardData.annual_fee)
      },
      {
        label: 'Annual Fee Waiver',
        helper: 'Spend condition to get annual fee waived',
        user: formatTextValue(userCardData.annual_fee_waiver),
        genius: formatTextValue(geniusCardData.annual_fee_waiver)
      }
    ].filter(row => row.user !== 'Not available' || row.genius !== 'Not available');
    const trustSignals = [
      {
        icon: <Shield className="w-5 h-5 text-primary" />,
        title: '100% Secure',
        subtitle: 'Your data stays encrypted'
      },
      {
        icon: <Zap className="w-5 h-5 text-primary" />,
        title: 'Instant Approval',
        subtitle: 'Decision in 60 seconds'
      },
      {
        icon: <CheckCircle2 className="w-5 h-5 text-primary" />,
        title: 'Zero Joining Fee',
        subtitle: 'Free application & cancellation'
      }
    ];

    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-slate-50 pt-24 pb-16">
          <div className="section-shell max-w-6xl mx-auto space-y-10">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setStep('select');
                  setCurrentStep(0);
                  setResponses({});
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="gap-2 hover:bg-primary/5 border-primary/30 text-primary hover:border-primary"
              >
                <ArrowLeft className="h-4 w-4" />
                Change Card Selection
              </Button>
            </div>

            {/* Celebration Hero */}
            <section className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${heroGradient} text-white p-8 sm:p-10 shadow-2xl`}>
              <div className="absolute -right-12 -top-12 w-44 h-44 bg-white/20 rounded-full blur-3xl" />
              <div className="absolute -left-20 bottom-0 w-52 h-52 bg-white/10 rounded-full blur-3xl" />
              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center">
                <div className="flex-1 space-y-4">
                  <div className="inline-flex items-center gap-3 border border-white/30 rounded-full px-4 py-2 text-sm font-semibold">
                    <Trophy className="w-5 h-5 text-yellow-300 animate-bounce" />
                    {isUserWinner ? 'Perfect Match' : 'Card Genius Recommendation'}
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black">{heroTitle}</h1>
                  <p className="text-lg text-white/80 max-w-2xl">{heroSubtitle}</p>
                </div>
                <div className="flex-1 bg-white/15 rounded-2xl p-6 backdrop-blur">
                  <p className="text-sm uppercase tracking-[0.3em] text-white/70 mb-2">
                    {isUserWinner ? 'Your yearly rewards' : 'Extra savings this year'}
                  </p>
                  <div className="flex items-end gap-4">
                    <p className="text-4xl font-black">
                      ₹{(isUserWinner ? userCardData.annual_saving : savingsDifference).toLocaleString('en-IN')}
                    </p>
                    {!isUserWinner && (
                      <span className="text-white/70 text-sm mb-2">≈ ₹{monthlySavings.toLocaleString('en-IN')}/mo</span>
                    )}
                  </div>
                  {!isUserWinner && (
                    <div className="mt-4 inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      <TrendingUp className="w-4 h-4" />
                      {savingsPercent.toFixed(1)}% higher than your current card
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Comparison */}
            <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Annual Savings Comparison</h2>
              <div className="space-y-6">
                {comparisonBars.map((bar, idx) => {
                  const percent = maxSavings > 0 ? Math.max((bar.value / maxSavings) * 100, 12) : 12;
                  return (
                    <div key={bar.label} className="space-y-2">
                      <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
                        <span>{bar.label}</span>
                        <span className="text-base text-slate-900">₹{bar.value.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="h-12 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${bar.accent} flex items-center justify-end pr-4 text-white font-bold`}
                          style={{ width: `${percent}%` }}
                        >
                          {idx === 0 && maxSavings > 0 ? `${Math.round((bar.value / maxSavings) * 100)}%` : idx === 1 ? '100%' : ''}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Card Comparison */}
            <section className="grid lg:grid-cols-2 gap-8">
              {[userCardData, geniusCardData].map((card, index) => {
                const isWinnerCard = (index === 0 && isUserWinner) || (index === 1 && !isUserWinner);
                return (
                  <div
                    key={card.id || index}
                    className={`relative bg-white border rounded-3xl p-6 shadow-lg transition-all ${
                      isWinnerCard ? 'border-4 border-blue-400 shadow-blue-100 scale-[1.01]' : 'border-slate-100'
                    }`}
                  >
                    {isWinnerCard && (
                      <div className="absolute -top-4 left-6 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg">
                        <Sparkles className="w-4 h-4" />
                        Winner Choice
                      </div>
                    )}
                    <div className="bg-slate-50 rounded-2xl p-6 mb-5">
                      <img
                        src={card.image}
                        alt={card.name}
                        className="w-full h-48 object-contain drop-shadow-2xl"
                        onError={e => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    </div>
                    <div className="space-y-1 text-center mb-6">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{card.banks?.name || 'Credit Card'}</p>
                      <h3 className="text-2xl font-bold text-slate-900">{card.name}</h3>
                      {card.card_type && (
                        <span className="inline-flex items-center px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-600">
                          {card.card_type}
                        </span>
                      )}
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-5 text-center space-y-2 mb-6">
                      <p className="text-xs text-slate-500 uppercase tracking-[0.3em]">Annual Savings</p>
                      <p className="text-4xl font-black text-slate-900">₹{card.annual_saving?.toLocaleString('en-IN') || '0'}</p>
                      <p className="text-sm text-slate-500">≈ ₹{Math.round((card.annual_saving || 0) / 12).toLocaleString('en-IN')}/month</p>
                    </div>
                    <div className="space-y-3 text-sm text-slate-700">
                      {card.joining_fees && (
                        <div className="flex justify-between border-b border-slate-100 pb-2">
                          <span>Joining Fee</span>
                          <strong>₹{card.joining_fees}</strong>
                        </div>
                      )}
                      {card.annual_fee && (
                        <div className="flex justify-between border-b border-slate-100 pb-2">
                          <span>Annual Fee</span>
                          <strong>₹{card.annual_fee}</strong>
                        </div>
                      )}
                      {card.welcome_bonus && (
                        <div className="flex justify-between">
                          <span>Welcome Bonus</span>
                          <strong>{card.welcome_bonus}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </section>

            {/* Data-backed highlights */}
            {comparisonRows.length > 0 && (
              <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col gap-2">
                  <h3 className="text-2xl font-bold">{isUserWinner ? 'How your card stacks up' : 'Why switch to this card'}</h3>
                  <p className="text-sm text-slate-500">Pulled directly from each card’s actual fees, waivers, and milestone benefits.</p>
                </div>
                <div className="overflow-hidden rounded-2xl border border-slate-100">
                  <div className="grid grid-cols-[1.2fr,1fr,1fr] bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-[0.25em]">
                    <div className="px-4 py-3">Metric</div>
                    <div className="px-4 py-3 text-center">Your Card</div>
                    <div className="px-4 py-3 text-center">Recommended Card</div>
                  </div>
                  {comparisonRows.map(row => (
                    <div key={row.label} className="grid grid-cols-[1.2fr,1fr,1fr] border-t border-slate-100">
                      <div className="px-4 py-4">
                        <p className="font-semibold text-slate-900">{row.label}</p>
                        {row.helper && <p className="text-sm text-slate-500 mt-1">{row.helper}</p>}
                      </div>
                      <div className="px-4 py-4 text-center font-medium text-slate-900">{row.user}</div>
                      <div className="px-4 py-4 text-center font-medium text-slate-900">{row.genius}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Category breakdown */}
            {categorySavings.length > 0 && (
              <div className="max-w-4xl mx-auto">
                <Accordion type="single" collapsible className="bg-white border border-slate-200 rounded-3xl">
                  <AccordionItem value="breakdown" className="border-none">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-lg font-bold text-slate-900">Category-wise breakdown</h3>
                          <p className="text-sm text-slate-500">See exactly where the extra savings come from</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div className="space-y-4">
                        {categorySavings.map((category, idx) => {
                          const difference = category.geniusSaving - category.userSaving;
                          return (
                            <div key={idx} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">{category.emoji}</span>
                                  <p className="font-semibold text-slate-900">{category.category}</p>
                                </div>
                                {difference > 0 && (
                                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                                    +₹{difference.toLocaleString('en-IN')} more
                                  </span>
                                )}
                              </div>
                              <div className="grid sm:grid-cols-2 gap-4 mt-3">
                                {[{ label: 'Your Card', value: category.userSaving, accent: 'from-rose-300 to-rose-400' }, { label: 'Recommended Card', value: category.geniusSaving, accent: 'from-blue-400 to-blue-500' }].map(column => (
                                  <div key={column.label} className="space-y-2">
                                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{column.label}</p>
                                    <p className="text-xl font-bold text-slate-900">₹{column.value.toLocaleString('en-IN')}</p>
                                    <div className="h-2 bg-white rounded-full overflow-hidden">
                                      <div className={`h-full bg-gradient-to-r ${column.accent}`} style={{ width: category.geniusSaving > 0 ? `${(column.value / Math.max(category.geniusSaving, 1)) * 100}%` : '100%' }} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}

            {/* CTA */}
            <section className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <Button
                  size="lg"
                  className="w-full md:flex-1 text-lg font-semibold bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 hover:shadow-xl hover:scale-[1.01] transition"
                  onClick={() => handleApplyNow(isUserWinner ? userCardData : geniusCardData)}
                >
                  Apply for {isUserWinner ? 'This Card' : 'Better Card'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full md:w-auto text-lg"
                  onClick={() => {
                    setStep('select');
                    setCurrentStep(0);
                    setResponses({});
                    setSelectedCard(null);
                    setUserCardData(null);
                    setGeniusCardData(null);
                    setCategorySavings([]);
                  }}
                >
                  Try Another Card
                </Button>
              </div>
            </section>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Loading state for results
  if (step === 'results' && (!userCardData || !geniusCardData)) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
          <p className="text-xl text-muted-foreground">Loading comparison results...</p>
        </div>
      </div>;
  }

  return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-md">
        <p className="text-xl text-muted-foreground mb-4">Something went wrong</p>
        <Button onClick={() => {
        setStep('select');
        setCurrentStep(0);
        setResponses({});
        setSelectedCard(null);
      }}>
          Start Over
        </Button>
      </div>
    </div>;
};
export default BeatMyCard;