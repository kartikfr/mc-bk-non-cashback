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
  card_type?: string;
  annual_fee?: string;
  reward_rate?: string;
  welcome_bonus?: string;
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
        <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-4 py-8">
          {/* Header with Home Button */}
          <div className="flex items-center justify-between mb-8">
            
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-5xl md:text-6xl font-bold mb-5 bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                Beat My Card
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto px-px">
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
    const maxSavings = Math.max(userCardData.annual_saving, geniusCardData.annual_saving);
    return <>
        <Navigation />
        <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-4 py-8">
          {/* Header with Navigation Buttons */}
          <div className="flex items-center justify-between mb-8">
            
            
            <Button variant="outline" onClick={() => {
              setStep('select');
              setCurrentStep(0);
              setResponses({});
              window.scrollTo({
                top: 0,
                behavior: 'smooth'
              });
            }} className="gap-2 hover:bg-secondary/10 border-secondary/30 text-secondary hover:border-secondary">
              <ArrowLeft className="h-4 w-4" />
              Change Card Selection
            </Button>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Verdict Section */}
            <div className="text-center mb-12 animate-fade-in">
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 animate-scale-in ${isUserWinner ? 'bg-gradient-to-br from-primary/30 to-primary/10 shadow-lg shadow-primary/20' : 'bg-gradient-to-br from-secondary/30 to-secondary/10 shadow-lg shadow-secondary/20'}`}>
                <Trophy className={`w-14 h-14 ${isUserWinner ? 'text-primary' : 'text-secondary'}`} />
              </div>
              
              <h1 className="text-6xl font-bold mb-6">
                <span className={`bg-gradient-to-r ${isUserWinner ? 'from-primary to-primary/70' : 'from-secondary to-secondary/70'} bg-clip-text text-transparent`}>
                  {isUserWinner ? 'Perfect Match!' : 'We Found Better!'}
                </span>
              </h1>

              {isUserWinner ? <div className="space-y-3">
                  <p className="text-3xl font-bold text-primary">
                    You Win! 🎉
                  </p>
                  <p className="text-xl text-foreground max-w-2xl mx-auto leading-relaxed">
                    Excellent choice! Your <span className="font-bold text-primary">{userCardData.name}</span> is already optimized for your spending pattern.
                  </p>
                  <p className="text-lg text-muted-foreground">
                    You're already maximizing your rewards!
                  </p>
                </div> : <div className="space-y-3">
                  <p className="text-3xl font-bold text-secondary">
                    Card Genius Wins! 🏆
                  </p>
                  <p className="text-xl text-foreground max-w-2xl mx-auto leading-relaxed">
                    Switch to <span className="font-bold text-secondary">{geniusCardData.name}</span> and save an extra <span className="font-bold text-secondary">₹{savingsDifference.toLocaleString('en-IN')}</span> per year!
                  </p>
                  <p className="text-lg text-muted-foreground">
                    That's ₹{Math.round(savingsDifference / 12).toLocaleString('en-IN')} more every month
                  </p>
                </div>}
            </div>

            {/* Annual Savings Comparison */}
            <div className="mb-12 animate-fade-in bg-card border border-border rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-center mb-8 text-foreground">Annual Savings Comparison</h2>
              
              {/* Horizontal Parallel Bars */}
              <div className="flex items-center gap-6">
                {/* Your Card Section */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Your Card</span>
                    <span className="text-base font-bold text-foreground">₹{userCardData.annual_saving?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="relative h-12 bg-muted rounded-lg overflow-hidden">
                    <div className="absolute left-0 top-0 h-full bg-primary rounded-lg transition-all duration-500 flex items-center justify-center" style={{
                      width: `${maxSavings > 0 ? Math.max(userCardData.annual_saving / maxSavings * 100, 15) : 15}%`,
                      minWidth: '60px'
                    }}>
                      <span className="text-sm font-bold text-primary-foreground">
                        {maxSavings > 0 ? Math.round(userCardData.annual_saving / maxSavings * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Arrow Icon */}
                <div className="flex-shrink-0">
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                </div>

                {/* Card Genius Section */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Card Genius</span>
                    <span className="text-base font-bold text-blue-600 dark:text-blue-400">₹{geniusCardData.annual_saving?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="relative h-12 bg-muted rounded-lg overflow-hidden">
                    <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg transition-all duration-500 flex items-center justify-center" style={{
                      width: '100%'
                    }}>
                      <span className="text-sm font-bold text-white">
                        100%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {!isUserWinner && <div className="mt-6 text-center">
                  <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-6 py-3 rounded-full">
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-semibold">
                      {((geniusCardData.annual_saving - userCardData.annual_saving) / userCardData.annual_saving * 100).toFixed(1)}% Higher Savings
                    </span>
                  </div>
                </div>}
            </div>

            {/* Card Comparison */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* User's Card */}
              <div className={`animate-fade-in relative bg-card rounded-3xl overflow-hidden transition-all duration-300 ${isUserWinner ? 'border-4 border-primary shadow-2xl shadow-primary/30 scale-105' : 'border-2 border-border hover:border-primary/50'}`}>
                {isUserWinner && <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-primary/80 py-2 px-4 flex items-center justify-center gap-2 animate-fade-in">
                    <Trophy className="w-5 h-5 text-white" />
                    <span className="text-white font-bold text-sm">WINNER - YOUR CHOICE</span>
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>}
                
                <div className={`p-6 ${isUserWinner ? 'pt-16' : ''}`}>
                  <div className="bg-gradient-to-br from-muted/50 to-muted rounded-2xl p-6 mb-4">
                    <img src={userCardData.image} alt={userCardData.name} className="w-full h-52 object-contain drop-shadow-2xl" onError={e => {
                      console.error("Failed to load user card image:", userCardData.image);
                      e.currentTarget.src = '/placeholder.svg';
                    }} />
                  </div>
                  
                  <div className="text-center mb-4">
                    <h3 className="text-2xl font-bold mb-2 text-foreground">{userCardData.name}</h3>
                    <p className="text-muted-foreground font-medium">{userCardData.banks?.name || 'Credit Card'}</p>
                    {userCardData.card_type && <span className="inline-block mt-2 px-3 py-1 bg-muted rounded-full text-xs font-semibold uppercase text-muted-foreground">
                        {userCardData.card_type}
                      </span>}
                  </div>
                  
                  <div className={`rounded-2xl p-6 text-center mb-4 ${isUserWinner ? 'bg-primary/10' : 'bg-muted/50'}`}>
                    <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wide font-semibold">Annual Savings</p>
                    <p className={`text-5xl font-bold ${isUserWinner ? 'text-primary' : 'text-foreground'}`}>
                      ₹{userCardData.annual_saving?.toLocaleString('en-IN') || '0'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      ≈ ₹{Math.round((userCardData.annual_saving || 0) / 12).toLocaleString('en-IN')}/month
                    </p>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    {userCardData.joining_fees && <div className="flex justify-between items-center py-2 border-b border-border/50">
                        <span className="text-muted-foreground">Joining Fee</span>
                        <span className="font-bold text-foreground">₹{userCardData.joining_fees}</span>
                      </div>}
                    {userCardData.annual_fee && <div className="flex justify-between items-center py-2 border-b border-border/50">
                        <span className="text-muted-foreground">Annual Fee</span>
                        <span className="font-bold text-foreground">₹{userCardData.annual_fee}</span>
                      </div>}
                    {userCardData.welcome_bonus && <div className="flex justify-between items-center py-2 border-b border-border/50">
                        <span className="text-muted-foreground">Welcome Bonus</span>
                        <span className="font-bold text-foreground">{userCardData.welcome_bonus}</span>
                      </div>}
                  </div>
                </div>
              </div>

              {/* Genius Card */}
              <div className={`animate-fade-in relative bg-card rounded-3xl overflow-hidden transition-all duration-300 ${!isUserWinner ? 'border-4 border-secondary shadow-2xl shadow-secondary/30 scale-105' : 'border-2 border-border hover:border-secondary/50'}`}>
                {!isUserWinner && <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-secondary to-secondary/80 py-2 px-4 flex items-center justify-center gap-2 animate-fade-in">
                    <Trophy className="w-5 h-5 text-white" />
                    <span className="text-white font-bold text-sm">WINNER - CARD GENIUS RECOMMENDATION</span>
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>}
                
                <div className={`p-6 ${!isUserWinner ? 'pt-16' : ''}`}>
                  <div className="bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-2xl p-6 mb-4">
                    <img src={geniusCardData.image} alt={geniusCardData.name} className="w-full h-52 object-contain drop-shadow-2xl" onError={e => {
                      console.error("Failed to load genius card image:", geniusCardData.image);
                      e.currentTarget.src = '/placeholder.svg';
                    }} />
                  </div>
                  
                  <div className="text-center mb-4">
                    <h3 className="text-2xl font-bold mb-2 text-foreground">{geniusCardData.name}</h3>
                    <p className="text-muted-foreground font-medium">{geniusCardData.banks?.name || 'Credit Card'}</p>
                    {geniusCardData.card_type && <span className="inline-block mt-2 px-3 py-1 bg-secondary/10 rounded-full text-xs font-semibold uppercase text-secondary">
                        {geniusCardData.card_type}
                      </span>}
                  </div>
                  
                  <div className={`rounded-2xl p-6 text-center mb-4 ${!isUserWinner ? 'bg-secondary/10' : 'bg-muted/50'}`}>
                    <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wide font-semibold">Annual Savings</p>
                    <p className={`text-5xl font-bold ${!isUserWinner ? 'text-secondary' : 'text-foreground'}`}>
                      ₹{geniusCardData.annual_saving?.toLocaleString('en-IN') || '0'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      ≈ ₹{Math.round((geniusCardData.annual_saving || 0) / 12).toLocaleString('en-IN')}/month
                    </p>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    {geniusCardData.joining_fees && <div className="flex justify-between items-center py-2 border-b border-border/50">
                        <span className="text-muted-foreground">Joining Fee</span>
                        <span className="font-bold text-foreground">₹{geniusCardData.joining_fees}</span>
                      </div>}
                    {geniusCardData.annual_fee && <div className="flex justify-between items-center py-2 border-b border-border/50">
                        <span className="text-muted-foreground">Annual Fee</span>
                        <span className="font-bold text-foreground">₹{geniusCardData.annual_fee}</span>
                      </div>}
                    {geniusCardData.welcome_bonus && <div className="flex justify-between items-center py-2 border-b border-border/50">
                        <span className="text-muted-foreground">Welcome Bonus</span>
                        <span className="font-bold text-secondary">{geniusCardData.welcome_bonus}</span>
                      </div>}
                  </div>
                </div>
              </div>
            </div>

            {/* Why This Card Wins */}
            <div className="mb-12 animate-fade-in">
              <div className="bg-card border border-border rounded-2xl p-8">
                <h3 className={`text-2xl font-bold text-center mb-6 ${isUserWinner ? 'text-primary' : 'text-secondary'}`}>
                  {isUserWinner ? '✨ Why Your Card is Perfect' : '🚀 Why Switch to This Card?'}
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-4">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${isUserWinner ? 'bg-primary/10' : 'bg-secondary/10'}`}>
                      <Trophy className={`w-8 h-8 ${isUserWinner ? 'text-primary' : 'text-secondary'}`} />
                    </div>
                    <h4 className="font-semibold text-lg mb-2 text-foreground">Maximum Rewards</h4>
                    <p className="text-muted-foreground text-sm">
                      Optimized for your spending pattern to maximize cashback and rewards
                    </p>
                  </div>
                  <div className="text-center p-4">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${isUserWinner ? 'bg-primary/10' : 'bg-secondary/10'}`}>
                      <TrendingUp className={`w-8 h-8 ${isUserWinner ? 'text-primary' : 'text-secondary'}`} />
                    </div>
                    <h4 className="font-semibold text-lg mb-2 text-foreground">Better Savings</h4>
                    <p className="text-muted-foreground text-sm">
                      {isUserWinner ? 'Already the best card for your lifestyle and expenses' : `Save ₹${savingsDifference.toLocaleString('en-IN')} more annually compared to your current card`}
                    </p>
                  </div>
                  <div className="text-center p-4">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${isUserWinner ? 'bg-primary/10' : 'bg-secondary/10'}`}>
                      <Award className={`w-8 h-8 ${isUserWinner ? 'text-primary' : 'text-secondary'}`} />
                    </div>
                    <h4 className="font-semibold text-lg mb-2 text-foreground">Smart Choice</h4>
                    <p className="text-muted-foreground text-sm">
                      {isUserWinner ? 'Your spending habits perfectly align with this card\'s benefits' : 'Better rewards across all your spending categories'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Category-wise Savings Breakdown */}
            {categorySavings.length > 0 && <div className="mb-12 max-w-4xl mx-auto animate-fade-in">
                <Accordion type="single" collapsible className="bg-card border border-border rounded-2xl overflow-hidden">
                  <AccordionItem value="breakdown" className="border-none">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary/10">
                          <TrendingUp className="w-5 h-5 text-secondary" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-lg font-bold text-foreground">Category-wise Savings Breakdown</h3>
                          <p className="text-sm text-muted-foreground">See how you earn rewards across different spending categories</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div className="space-y-4 pt-4">
                        {categorySavings.map((category, index) => {
                        const difference = category.geniusSaving - category.userSaving;
                        const percentDiff = category.userSaving > 0 ? (difference / category.userSaving * 100).toFixed(0) : '100';
                        return <div key={index} className="bg-muted/30 rounded-xl p-4 hover:bg-muted/50 transition-colors">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">{category.emoji}</span>
                                  <span className="font-semibold text-foreground">{category.category}</span>
                                </div>
                                {difference > 0 && <span className="text-xs font-bold text-secondary bg-secondary/10 px-3 py-1 rounded-full">
                                    +₹{difference.toLocaleString('en-IN')} more
                                  </span>}
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Your Card</p>
                                  <div className="flex items-baseline gap-2">
                                    <p className="text-xl font-bold text-foreground">₹{category.userSaving.toLocaleString('en-IN')}</p>
                                    <p className="text-xs text-muted-foreground">/ year</p>
                                  </div>
                                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-primary/60 to-primary transition-all duration-500" style={{
                                  width: category.geniusSaving > 0 ? `${category.userSaving / category.geniusSaving * 100}%` : '100%'
                                }} />
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Card Genius</p>
                                  <div className="flex items-baseline gap-2">
                                    <p className="text-xl font-bold text-secondary">₹{category.geniusSaving.toLocaleString('en-IN')}</p>
                                    <p className="text-xs text-muted-foreground">/ year</p>
                                  </div>
                                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-secondary to-secondary/70 transition-all duration-500" style={{
                                  width: '100%'
                                }} />
                                  </div>
                                </div>
                              </div>
                            </div>;
                      })}
                        
                        <div className="bg-gradient-to-r from-secondary/10 to-primary/10 rounded-xl p-5 border-2 border-secondary/20 mt-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary/20">
                                <Trophy className="w-6 h-6 text-secondary" />
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">Total Annual Savings</p>
                                <div className="flex items-center gap-4">
                                  <div>
                                    <span className="text-xs text-muted-foreground">Your Card: </span>
                                    <span className="text-lg font-bold text-foreground">₹{userCardData?.annual_saving?.toLocaleString('en-IN')}</span>
                                  </div>
                                  <ArrowRight className="w-4 h-4 text-secondary" />
                                  <div>
                                    <span className="text-xs text-muted-foreground">Card Genius: </span>
                                    <span className="text-2xl font-bold text-secondary">₹{geniusCardData?.annual_saving?.toLocaleString('en-IN')}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Button variant="outline" size="lg" onClick={() => {
                setStep('select');
                setCurrentStep(0);
                setResponses({});
                setSelectedCard(null);
                setUserCardData(null);
                setGeniusCardData(null);
                setCategorySavings([]);
              }} className="text-lg px-8">
                Try Another Card
              </Button>
              {!isUserWinner && <Button size="lg" onClick={() => {
                const success = redirectToCardApplication(geniusCardData, {
                  cardName: geniusCardData.name,
                  bankName: geniusCardData.banks?.name || geniusCardData.name.split(' ')[0],
                  bankLogo: geniusCardData.image
                });
                if (!success) {
                  toast.error("Unable to open the bank site. Please allow pop-ups or try again later.");
                }
              }} className="text-lg px-8 bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70">
                  Apply for Better Card
                  <TrendingUp className="ml-2 h-5 w-5" />
                </Button>}
            </div>
          </div>
        </div>
        </div>
        <Footer />
      </>;
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