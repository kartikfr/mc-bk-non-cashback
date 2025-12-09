import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SpendingInput } from "@/components/ui/spending-input";
import { ArrowLeft, ArrowRight, Loader2, Trophy, TrendingUp, Award, Sparkles, ChevronDown, Shield, CheckCircle2, Zap, ArrowUp, ArrowDown, Percent, CreditCard, Info, ExternalLink } from "lucide-react";
import { cardService, SpendingData } from "@/services/cardService";
import { toast } from "sonner";
import { CardSearchDropdown } from "@/components/CardSearchDropdown";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { redirectToCardApplication } from "@/utils/redirectHandler";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  presets?: number[]; // Custom presets for quick selection
}

// Helper function to get personalized steps and presets based on question field
// Returns only 5 presets (excluding 0) for better UX
const getQuestionConfig = (field: keyof SpendingData, max?: number): { step: number; presets: number[] } => {
  const configs: Record<string, { step: number; presets: number[] }> = {
    // Shopping - Amazon/Flipkart: For ranges up to 30k, use smaller increments
    amazon_spends: { 
      step: 100, 
      presets: max && max <= 30000 
        ? [1000, 5000, 10000, 20000, 30000] 
        : [1000, 5000, 10000, 20000, 50000] 
    },
    flipkart_spends: { 
      step: 100, 
      presets: max && max <= 30000 
        ? [1000, 5000, 10000, 20000, 30000] 
        : [1000, 5000, 10000, 20000, 50000] 
    },
    other_online_spends: { step: 200, presets: [500, 2000, 5000, 10000, 20000] },
    other_offline_spends: { step: 500, presets: [1000, 5000, 10000, 20000, 50000] },
    
    // Grocery: 200, 500, 1000 increments
    grocery_spends_online: { step: 200, presets: [1000, 3000, 5000, 10000, 20000] },
    
    // Food Delivery: 100, 200, 500 increments
    online_food_ordering: { step: 100, presets: [500, 2000, 5000, 10000, 20000] },
    
    // Fuel: 100, 200, 500 increments
    fuel: { step: 100, presets: [1000, 3000, 5000, 10000, 15000] },
    
    // Dining: 200, 500, 1000 increments
    dining_or_going_out: { step: 200, presets: [1000, 3000, 5000, 10000, 15000] },
    
    // Travel - Annual: 1000, 2000, 5000 increments
    flights_annual: { step: 1000, presets: [10000, 50000, 100000, 200000, 300000] },
    hotels_annual: { step: 1000, presets: [10000, 50000, 100000, 150000, 200000] },
    
    // Bills - Mobile/Water: 50, 100, 200 increments
    mobile_phone_bills: { step: 50, presets: [500, 1000, 2000, 5000, 10000] },
    water_bills: { step: 50, presets: [500, 1000, 2000, 3000, 5000] },
    
    // Electricity: 100, 200, 500 increments
    electricity_bills: { step: 100, presets: [1000, 3000, 5000, 10000, 15000] },
    
    // Insurance - Annual: 1000, 5000, 10000 increments
    insurance_health_annual: { step: 1000, presets: [10000, 25000, 50000, 75000, 100000] },
    insurance_car_or_bike_annual: { step: 1000, presets: [5000, 10000, 25000, 35000, 50000] },
    
    // Rent: 1000, 2000, 5000 increments
    rent: { step: 1000, presets: [5000, 15000, 25000, 40000, 60000] },
    
    // School Fees: 1000, 2000, 5000 increments
    school_fees: { step: 1000, presets: [5000, 10000, 20000, 30000, 50000] },
    
    // Lounge visits: 2, 4, 6, 8, 10 options
    domestic_lounge_usage_quarterly: { step: 1, presets: [2, 4, 6, 8, 10] },
    international_lounge_usage_quarterly: { step: 1, presets: [2, 4, 6, 8, 10] },
  };
  
  const config = configs[field as string] || { step: 500, presets: [1000, 5000, 10000, 20000, 50000] };
  
  // Filter presets to max value and ensure exactly 5 presets (excluding 0)
  const filteredPresets = config.presets.filter(p => p <= (max || 1000000)).slice(0, 5);
  
  return { step: config.step, presets: filteredPresets };
};
const questions: SpendingQuestion[] = [{
  field: 'amazon_spends',
  question: 'How much do you spend on Amazon in a month?',
  emoji: '🛍️',
  min: 0,
  max: 30000,
  ...getQuestionConfig('amazon_spends', 30000)
}, {
  field: 'flipkart_spends',
  question: 'How much do you spend on Flipkart in a month?',
  emoji: '📦',
  min: 0,
  max: 30000,
  ...getQuestionConfig('flipkart_spends', 30000)
}, {
  field: 'other_online_spends',
  question: 'How much do you spend on other online shopping?',
  emoji: '💸',
  min: 0,
  max: 50000,
  ...getQuestionConfig('other_online_spends', 50000)
}, {
  field: 'other_offline_spends',
  question: 'How much do you spend at local shops or offline stores monthly?',
  emoji: '🏪',
  min: 0,
  max: 50000,
  ...getQuestionConfig('other_offline_spends', 50000)
}, {
  field: 'grocery_spends_online',
  question: 'How much do you spend on groceries (Blinkit, Zepto etc.) every month?',
  emoji: '🥦',
  min: 0,
  max: 50000,
  ...getQuestionConfig('grocery_spends_online', 50000)
}, {
  field: 'online_food_ordering',
  question: 'How much do you spend on food delivery apps in a month?',
  emoji: '🛵🍜',
  min: 0,
  max: 30000,
  ...getQuestionConfig('online_food_ordering', 30000)
}, {
  field: 'fuel',
  question: 'How much do you spend on fuel in a month?',
  emoji: '⛽',
  min: 0,
  max: 20000,
  ...getQuestionConfig('fuel', 20000)
}, {
  field: 'dining_or_going_out',
  question: 'How much do you spend on dining out in a month?',
  emoji: '🥗',
  min: 0,
  max: 30000,
  ...getQuestionConfig('dining_or_going_out', 30000)
}, {
  field: 'flights_annual',
  question: 'How much do you spend on flights in a year?',
  emoji: '✈️',
  min: 0,
  max: 500000,
  ...getQuestionConfig('flights_annual', 500000)
}, {
  field: 'hotels_annual',
  question: 'How much do you spend on hotel stays in a year?',
  emoji: '🛌',
  min: 0,
  max: 300000,
  ...getQuestionConfig('hotels_annual', 300000)
}, {
  field: 'domestic_lounge_usage_quarterly',
  question: 'How often do you visit domestic airport lounges in a year?',
  emoji: '🇮🇳',
  min: 0,
  max: 20,
  ...getQuestionConfig('domestic_lounge_usage_quarterly', 20),
  isCount: true
}, {
  field: 'international_lounge_usage_quarterly',
  question: 'Plus, what about international airport lounges?',
  emoji: '🌎',
  min: 0,
  max: 20,
  ...getQuestionConfig('international_lounge_usage_quarterly', 20),
  isCount: true
}, {
  field: 'mobile_phone_bills',
  question: 'How much do you spend on recharging your mobile or Wi-Fi monthly?',
  emoji: '📱',
  min: 0,
  max: 10000,
  ...getQuestionConfig('mobile_phone_bills', 10000)
}, {
  field: 'electricity_bills',
  question: "What's your average monthly electricity bill?",
  emoji: '⚡️',
  min: 0,
  max: 20000,
  ...getQuestionConfig('electricity_bills', 20000)
}, {
  field: 'water_bills',
  question: 'And what about your monthly water bill?',
  emoji: '💧',
  min: 0,
  max: 5000,
  ...getQuestionConfig('water_bills', 5000)
}, {
  field: 'insurance_health_annual',
  question: 'How much do you pay for health or term insurance annually?',
  emoji: '🛡️',
  min: 0,
  max: 100000,
  ...getQuestionConfig('insurance_health_annual', 100000)
}, {
  field: 'insurance_car_or_bike_annual',
  question: 'How much do you pay for car or bike insurance annually?',
  emoji: '🚗',
  min: 0,
  max: 50000,
  ...getQuestionConfig('insurance_car_or_bike_annual', 50000)
}, {
  field: 'rent',
  question: 'How much do you pay for house rent every month?',
  emoji: '🏠',
  min: 0,
  max: 100000,
  ...getQuestionConfig('rent', 100000)
}, {
  field: 'school_fees',
  question: 'How much do you pay in school fees monthly?',
  emoji: '🎓',
  min: 0,
  max: 50000,
  ...getQuestionConfig('school_fees', 50000)
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
  // Edge case handling: Determine if user's card is better or equal (calculated in results section)

  // Render card selection
  if (step === 'select') {
    return <>
        <Navigation />
        <div className="min-h-screen bg-background pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="section-shell">
          {/* Header with Home Button */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-6 sm:mb-8 px-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                Beat My Card
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-4 sm:mb-6 max-w-2xl mx-auto leading-tight">
                Is your card costing you money? Compare with 100+ cards instantly.
              </p>
              
              {/* Trust Indicators */}
              <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 mb-8 sm:mb-10 flex-nowrap overflow-x-auto pb-2 scrollbar-hide">
                <Badge variant="secondary" className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20 transition-colors whitespace-nowrap flex-shrink-0">
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                  AI-Powered Evaluation
                </Badge>
                <Badge variant="secondary" className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors whitespace-nowrap flex-shrink-0">
                  <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                  Unbiased Results
                </Badge>
                <Badge variant="secondary" className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20 transition-colors whitespace-nowrap flex-shrink-0">
                  <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                  Accurate Comparison
                </Badge>
              </div>
            </div>

            {/* Centered Search Section */}
            <div className="max-w-2xl mx-auto px-4 sm:px-6">
              {/* Reassurance Text - Above Search */}
              <div className="text-center mb-5 sm:mb-6">
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  We ask <span className="font-semibold text-foreground">19 quick questions</span> to match a card to your lifestyle. Takes less than 2 minutes.
                </p>
              </div>

              {/* Card Search - Centered and Enhanced */}
              <div className="relative">
                <CardSearchDropdown 
                  cards={filteredCards} 
                  selectedCard={selectedCard} 
                  onCardSelect={handleCardSelect} 
                  onClearSelection={() => setSelectedCard(null)} 
                  isLoading={isLoading}
                  placeholder="Search for your credit card (e.g., HDFC Millennia, SBI Cashback…)"
                />
              </div>
            </div>
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
          <div className="flex items-center justify-end mb-8">
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
              })} min={question.min} max={question.max} step={question.step} showRupee={!question.isCount} presets={question.presets} />
            </div>

            {/* Navigation buttons */}
            <div className="flex flex-col items-center gap-3 mt-8">
              <div className="flex items-center justify-between w-full gap-4">
                <Button variant="outline" onClick={handlePrev} disabled={currentStep === 0} className="rounded-full border-2 border-muted-foreground/20 bg-background hover:bg-muted/50 text-muted-foreground px-8 h-12 transition-all duration-200">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
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

              {/* Skip this question - Moved above Skip All */}
              <Button variant="ghost" onClick={handleSkip} className="text-sm text-muted-foreground hover:text-muted-foreground/80 px-0 h-auto">
                Skip this question →
              </Button>

              {/* Skip All - Moved below */}
              {currentStep !== questions.length - 1 && (
                <Button variant="ghost" onClick={handleSkipAll} disabled={isCalculating} className="text-xs text-muted-foreground hover:text-muted-foreground/80 px-0 h-auto">
                  {isCalculating ? "Calculating..." : "Skip all (not recommended)"}
                </Button>
              )}
            </div>
          </div>
        </div>
        </div>
        <Footer />
      </>;
  }

  // Render results
  if (step === 'results' && userCardData && geniusCardData) {
    // Edge case handling: Safe calculation with fallbacks
    const userSavings = userCardData?.annual_saving || 0;
    const geniusSavings = geniusCardData?.annual_saving || 0;
    const savingsDifference = Math.abs(geniusSavings - userSavings);
    const monthlySavings = Math.max(Math.round(savingsDifference / 12), 0);
    const maxSavings = Math.max(userSavings, geniusSavings);
    const userAnnualText = userSavings.toLocaleString('en-IN');
    const geniusAnnualText = geniusSavings.toLocaleString('en-IN');
    const savingsPercent = userSavings > 0 ? ((geniusSavings - userSavings) / userSavings) * 100 : (geniusSavings > 0 ? 100 : 0);
    
    // Edge case handling: Determine if user's card is better or equal
    const isUserWinner = userSavings >= geniusSavings;
    
    // Edge case: Check if savings are equal (tie scenario - within ₹100)
    const isTie = Math.abs(userSavings - geniusSavings) < 100;
    
    // Edge case: Check if difference is negligible (< 1% or < ₹100)
    const isNegligibleDifference = savingsDifference < 100 || 
      (userSavings > 0 && savingsDifference / userSavings < 0.01);
    
    // Edge case: Determine hero content based on winner status
    const heroGradient = isUserWinner ? 'from-emerald-500 via-emerald-600 to-emerald-700' : 'from-blue-600 via-indigo-600 to-purple-600';
    const heroTitle = isUserWinner 
      ? (isTie ? 'Great Choice! Your Card is Already Optimal' : 'You Are Already Winning!')
      : (isNegligibleDifference ? 'Your Card is Nearly Optimal' : 'We Found Your Upgrade!');
    const heroSubtitle = isUserWinner
      ? (isTie 
          ? `Your ${userCardData.name} performs equally well, earning ₹${userAnnualText} annually.`
          : `Your ${userCardData.name} already earns ₹${userAnnualText} every year - that's the best match for your spending!`)
      : (isNegligibleDifference
          ? `The difference is minimal. Your current card earns ₹${userAnnualText} vs ₹${geniusAnnualText} - both are great options.`
          : `Switch to ${geniusCardData.name} and unlock ₹${savingsDifference.toLocaleString('en-IN')} more annually.`);
    const comparisonBars = [
      {
        label: 'Your Card',
        value: userSavings,
        accent: 'from-rose-400 to-rose-500'
      },
      {
        label: 'Recommended Card',
        value: geniusSavings,
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
                    {isUserWinner 
                      ? (isTie ? 'Excellent Choice - Cards Are Equal' : 'Perfect Match - Your Card Wins!')
                      : (isNegligibleDifference ? 'Both Cards Are Great Options' : 'Card Genius Recommendation')
                    }
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
                      ₹{(isUserWinner ? userSavings : savingsDifference).toLocaleString('en-IN')}
                    </p>
                    {!isUserWinner && !isNegligibleDifference && (
                      <span className="text-white/70 text-sm mb-2">≈ ₹{monthlySavings.toLocaleString('en-IN')}/mo</span>
                    )}
                    {isUserWinner && (
                      <span className="text-white/70 text-sm mb-2">Your annual savings</span>
                    )}
                  </div>
                  {!isUserWinner && !isNegligibleDifference && (
                    <div className="mt-4 inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      <TrendingUp className="w-4 h-4" />
                      {savingsPercent > 0 ? `${savingsPercent.toFixed(1)}% higher than your current card` : 'Better option available'}
                    </div>
                  )}
                  {isUserWinner && (
                    <div className="mt-4 inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      <Award className="w-4 h-4" />
                      {isTie ? 'Your card matches the best option!' : 'You already have the optimal card for your spending!'}
                    </div>
                  )}
                  {isNegligibleDifference && (
                    <div className="mt-4 inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      <Shield className="w-4 h-4" />
                      Both cards offer similar value - choose based on other features
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Annual Savings Comparison - Side by Side Cards */}
            <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Annual Savings Comparison</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Current Card Savings */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border-2 border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide whitespace-nowrap">Your Current Card</span>
                      </div>
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500 uppercase tracking-[0.3em]">Annual Savings</p>
                    <p className="text-4xl font-black text-slate-900">₹{userCardData.annual_saving?.toLocaleString('en-IN') || '0'}</p>
                    <p className="text-sm text-slate-500">≈ ₹{Math.round((userCardData.annual_saving || 0) / 12).toLocaleString('en-IN')}/month</p>
                        </div>
                      </div>
                {/* Recommended Card Savings */}
                <div className={`bg-gradient-to-br rounded-2xl p-6 border-2 relative ${
                  isUserWinner 
                    ? 'from-slate-50 to-slate-100 border-slate-200' 
                    : isNegligibleDifference
                    ? 'from-amber-50 to-orange-50 border-amber-200'
                    : 'from-blue-50 to-indigo-50 border-blue-200'
                }`}>
                  {!isUserWinner && !isNegligibleDifference && (
                    <div className="absolute -top-3 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                      <TrendingUp className="w-3 h-3" />
                      Better Option
                    </div>
                  )}
                  {isNegligibleDifference && (
                    <div className="absolute -top-3 right-4 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                      <Award className="w-3 h-3" />
                      Similar
              </div>
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-sm font-semibold uppercase tracking-wide whitespace-nowrap ${
                      isUserWinner ? 'text-slate-600' : isNegligibleDifference ? 'text-amber-700' : 'text-blue-700'
                    }`}>
                      {isUserWinner ? 'Alternative Card' : 'Recommended Card'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className={`text-xs uppercase tracking-[0.3em] ${
                      isUserWinner ? 'text-slate-500' : isNegligibleDifference ? 'text-amber-600' : 'text-blue-600'
                    }`}>
                      Annual Savings
                    </p>
                    <p className={`text-4xl font-black ${
                      isUserWinner ? 'text-slate-900' : isNegligibleDifference ? 'text-amber-900' : 'text-blue-900'
                    }`}>
                      ₹{geniusSavings.toLocaleString('en-IN')}
                    </p>
                    <p className={`text-sm ${
                      isUserWinner ? 'text-slate-500' : isNegligibleDifference ? 'text-amber-600' : 'text-blue-600'
                    }`}>
                      ≈ ₹{Math.round(geniusSavings / 12).toLocaleString('en-IN')}/month
                    </p>
                  </div>
                </div>
              </div>
              {/* Gain Display - Only show if there's a meaningful difference */}
              {!isUserWinner && !isNegligibleDifference && savingsDifference >= 100 && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-1">You Gain</p>
                      <p className="text-3xl font-black text-green-900">+₹{savingsDifference.toLocaleString('en-IN')} / year</p>
                      <p className="text-sm text-green-600 mt-1">≈ +₹{monthlySavings.toLocaleString('en-IN')}/month extra savings</p>
                    </div>
                    <div className="hidden sm:flex items-center justify-center w-16 h-16 bg-green-500 rounded-full">
                      <ArrowUp className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
              )}
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
                    <div className="space-y-2 text-center mb-6">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400 whitespace-nowrap truncate">{card.banks?.name || 'Credit Card'}</p>
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 line-clamp-2 leading-tight px-2">{card.name}</h3>
                      {card.card_type && (
                        <span className="inline-flex items-center px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-600 whitespace-nowrap">
                          {card.card_type}
                        </span>
                      )}
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-5 text-center space-y-2 mb-6">
                      <p className="text-xs text-slate-500 uppercase tracking-[0.3em]">Annual Savings</p>
                      <p className="text-4xl font-black text-slate-900">₹{card.annual_saving?.toLocaleString('en-IN') || '0'}</p>
                      <p className="text-sm text-slate-500">≈ ₹{Math.round((card.annual_saving || 0) / 12).toLocaleString('en-IN')}/month</p>
                    </div>
                    {/* Icon-based Highlights */}
                    <div className="space-y-3">
                      {card.reward_rate && (
                        <div className="bg-blue-50 rounded-lg p-3 flex items-start gap-2">
                          <Percent className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0 flex-1 overflow-hidden">
                            <p className="text-xs text-slate-500 mb-1">Cashback Rate</p>
                            <p className="text-sm font-bold text-slate-900 break-words">{card.reward_rate}</p>
                        </div>
                        </div>
                      )}
                      {card.spending_breakdown_array && card.spending_breakdown_array.length > 0 && (() => {
                        const topCategories = card.spending_breakdown_array
                          .filter(item => item.savings > 0)
                          .sort((a, b) => b.savings - a.savings)
                          .slice(0, 2);
                        const categoriesText = topCategories.map(cat => cat.on?.replace(/_/g, ' ')).join(', ');
                        return topCategories.length > 0 ? (
                          <div className="bg-green-50 rounded-lg p-3 flex items-start gap-2">
                            <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1 overflow-hidden">
                              <p className="text-xs text-slate-500 mb-1">Top Categories</p>
                              <p className="text-sm font-bold text-slate-900 truncate" title={categoriesText}>
                                {categoriesText}
                              </p>
                        </div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  </div>
                );
              })}
            </section>

            {/* Data-backed highlights */}
            {comparisonRows.length > 0 && (
              <section className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-sm space-y-6 overflow-hidden">
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl sm:text-2xl font-bold">{isUserWinner ? 'How your card stacks up' : 'Why switch to this card'}</h3>
                  <p className="text-sm text-slate-500">Pulled directly from each card's actual fees, waivers, and milestone benefits.</p>
                </div>
                <TooltipProvider>
                  <div className="w-full overflow-hidden flex justify-center">
                    <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm max-w-2xl w-full">
                    <div className="grid grid-cols-3 bg-gradient-to-r from-slate-50 to-slate-100 text-xs font-bold text-slate-700 uppercase tracking-wide border-b-2 border-slate-200">
                      <div className="px-4 sm:px-6 py-4 sm:py-5 border-r border-slate-300 text-left">Metric</div>
                      <div className="px-4 sm:px-6 py-4 sm:py-5 text-center border-r border-slate-300">Your Card</div>
                      <div className="px-4 sm:px-6 py-4 sm:py-5 text-center">Recommended Card</div>
                  </div>
                    {comparisonRows.map((row, index) => {
                      // Determine which value is better (lower is better for fees, higher is better for benefits)
                      const isFeeRelated = row.label.toLowerCase().includes('fee');
                      const userStr = String(row.user || '');
                      const geniusStr = String(row.genius || '');
                      const userNum = extractNumeric(userStr);
                      const geniusNum = extractNumeric(geniusStr);
                      
                      // Handle special cases (Free = 0, Not available = not comparable)
                      const userFree = userStr.toLowerCase().includes('free');
                      const geniusFree = geniusStr.toLowerCase().includes('free');
                      const userNotAvail = userStr.toLowerCase().includes('not available') || userStr.toLowerCase().includes('n/a');
                      const geniusNotAvail = geniusStr.toLowerCase().includes('not available') || geniusStr.toLowerCase().includes('n/a');
                      
                      let userIsBetter = null;
                      let geniusIsBetter = null;
                      
                      if (!userNotAvail && !geniusNotAvail) {
                        if (userFree && !geniusFree) {
                          userIsBetter = isFeeRelated;
                          geniusIsBetter = !isFeeRelated;
                        } else if (!userFree && geniusFree) {
                          userIsBetter = !isFeeRelated;
                          geniusIsBetter = isFeeRelated;
                        } else if (!isNaN(userNum) && !isNaN(geniusNum) && userNum > 0 && geniusNum > 0) {
                          userIsBetter = isFeeRelated ? userNum <= geniusNum : userNum >= geniusNum;
                          geniusIsBetter = isFeeRelated ? geniusNum < userNum : geniusNum > userNum;
                        }
                      }

                      return (
                        <div key={row.label} className={`grid grid-cols-3 border-t border-slate-200 hover:bg-slate-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                          <div className="px-4 sm:px-6 py-4 sm:py-5 border-r border-slate-200">
                            <div className="flex items-start gap-1.5 sm:gap-2">
                              <p className="font-semibold text-slate-900 text-sm leading-tight">{row.label}</p>
                              {row.helper && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="w-4 h-4 text-slate-400 hover:text-blue-600 cursor-help mt-0.5 flex-shrink-0 transition-colors" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p className="text-sm">{row.helper}</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                      </div>
                    </div>
                          <div className="px-4 sm:px-6 py-4 sm:py-5 border-r border-slate-200">
                            <div className="flex items-center justify-center min-w-0">
                              <span className="text-sm break-words leading-tight text-center text-slate-900">{row.user}</span>
                </div>
                          </div>
                          <div className="px-4 sm:px-6 py-4 sm:py-5">
                            <div className="flex items-center justify-center min-w-0">
                              <span className="text-sm break-words leading-tight text-center text-slate-900">{row.genius}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    </div>
                  </div>
                </TooltipProvider>
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
                  className="w-full md:flex-1 text-sm sm:text-base md:text-lg font-semibold bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 hover:shadow-xl hover:scale-[1.01] transition px-3 sm:px-6"
                  onClick={() => handleApplyNow(isUserWinner ? userCardData : geniusCardData)}
                >
                  <span className="hidden sm:inline">Apply for the Recommended Card – Fast & Paperless</span>
                  <span className="sm:hidden">Apply Now – Fast & Paperless</span>
                  <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 ml-1.5 sm:ml-2 flex-shrink-0" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full md:w-auto text-sm sm:text-base md:text-lg px-3 sm:px-6"
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
                  <span className="hidden sm:inline">Edit My Spending Inputs</span>
                  <span className="sm:hidden">Edit Spending</span>
                </Button>
              </div>
            </section>
            
            {/* Sticky Bottom CTA - Mobile Only */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/98 backdrop-blur-md border-t-2 border-slate-200 p-3 sm:p-4 z-50 shadow-2xl md:hidden safe-area-inset-bottom">
              <div className="flex gap-2 sm:gap-3">
                <Button
                  size="lg"
                  className="flex-1 font-semibold bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 text-xs sm:text-sm px-2 sm:px-4"
                  onClick={() => handleApplyNow(isUserWinner ? userCardData : geniusCardData)}
                >
                  <span className="truncate">
                    {isUserWinner ? 'Keep Current' : isNegligibleDifference ? 'Compare' : 'Apply Now'}
                  </span>
                  <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 ml-1.5 sm:ml-2 flex-shrink-0" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-3 sm:px-4 text-xs sm:text-sm font-semibold whitespace-nowrap"
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
                  Edit Spending
                </Button>
              </div>
            </div>
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