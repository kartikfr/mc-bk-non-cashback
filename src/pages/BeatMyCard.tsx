import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SpendingInput } from "@/components/ui/spending-input";
import { ArrowLeft, ArrowRight, Loader2, Trophy, TrendingUp, Award, Sparkles, ChevronDown, Shield, CheckCircle2, Zap, ArrowUp, ArrowDown, Percent, CreditCard, Info, ExternalLink, Play, FileText, List, Star } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  showCurrency?: boolean;
  suffix?: string;
  context?: string; // Why this question matters
  presets?: number[]; // Custom presets for quick selection
}

// Helper function to format category names properly
const formatCategoryName = (category: string): string => {
  if (!category) return '';
  
  // Map of category keys to proper display names
  const categoryMap: Record<string, string> = {
    'amazon_spends': 'Amazon Shopping',
    'flipkart_spends': 'Flipkart Shopping',
    'other_online_spends': 'Online Shopping',
    'other_offline_spends': 'Offline Shopping',
    'grocery_spends_online': 'Grocery Shopping',
    'online_food_ordering': 'Food Delivery',
    'fuel': 'Fuel',
    'dining_or_going_out': 'Dining Out',
    'flights_annual': 'Flight Bookings',
    'hotels_annual': 'Hotel Stays',
    'mobile_phone_bills': 'Mobile & WiFi',
    'electricity_bills': 'Electricity',
    'water_bills': 'Water',
    'insurance_health_annual': 'Health Insurance',
    'insurance_car_or_bike_annual': 'Vehicle Insurance',
    'rent': 'House Rent',
    'school_fees': 'School Fees',
    'domestic_lounge_usage_quarterly': 'Domestic Lounge',
    'international_lounge_usage_quarterly': 'International Lounge'
  };
  
  // Check if we have a mapped name
  if (categoryMap[category]) {
    return categoryMap[category];
  }
  
  // Fallback: Replace underscores with spaces and capitalize properly
  return category
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
};

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
  ...getQuestionConfig('amazon_spends', 30000),
  context: 'This helps us calculate your cashback on Amazon and compare it with other cards.'
}, {
  field: 'flipkart_spends',
  question: 'How much do you spend on Flipkart in a month?',
  emoji: '📦',
  min: 0,
  max: 30000,
  ...getQuestionConfig('flipkart_spends', 30000),
  context: 'We use this to find cards that offer the best rewards on Flipkart purchases.'
}, {
  field: 'other_online_spends',
  question: 'How much do you spend on other online shopping?',
  emoji: '💸',
  min: 0,
  max: 50000,
  ...getQuestionConfig('other_online_spends', 50000),
  context: 'This helps us identify cards with the best general online shopping rewards.'
}, {
  field: 'other_offline_spends',
  question: 'How much do you spend at local shops or offline stores monthly?',
  emoji: '🏪',
  min: 0,
  max: 50000,
  ...getQuestionConfig('other_offline_spends', 50000),
  context: 'We match you with cards that offer rewards on offline purchases.'
}, {
  field: 'grocery_spends_online',
  question: 'How much do you spend on groceries (Blinkit, Zepto etc.) every month?',
  emoji: '🥦',
  min: 0,
  max: 50000,
  ...getQuestionConfig('grocery_spends_online', 50000),
  context: 'This helps us find cards with the highest cashback on grocery purchases.'
}, {
  field: 'online_food_ordering',
  question: 'How much do you spend on food delivery apps in a month?',
  emoji: '🛵🍜',
  min: 0,
  max: 30000,
  ...getQuestionConfig('online_food_ordering', 30000),
  context: 'We calculate which cards offer the best rewards on food delivery.'
}, {
  field: 'fuel',
  question: 'How much do you spend on fuel in a month?',
  emoji: '⛽',
  min: 0,
  max: 20000,
  ...getQuestionConfig('fuel', 20000),
  context: 'This helps us find cards with the best fuel surcharge waivers and rewards.'
}, {
  field: 'dining_or_going_out',
  question: 'How much do you spend on dining out in a month?',
  emoji: '🥗',
  min: 0,
  max: 30000,
  ...getQuestionConfig('dining_or_going_out', 30000),
  context: 'We match you with cards that offer the highest rewards on dining.'
}, {
  field: 'flights_annual',
  question: 'How much do you spend on flights in a year?',
  emoji: '✈️',
  min: 0,
  max: 500000,
  ...getQuestionConfig('flights_annual', 500000),
  context: 'This helps us recommend travel cards with the best air miles and discounts.'
}, {
  field: 'hotels_annual',
  question: 'How much do you spend on hotel stays in a year?',
  emoji: '🛌',
  min: 0,
  max: 300000,
  ...getQuestionConfig('hotels_annual', 300000),
  context: 'We find cards that offer the best hotel booking rewards and discounts.'
}, {
  field: 'domestic_lounge_usage_quarterly',
  question: 'How often do you visit domestic airport lounges in a year?',
  emoji: '🇮🇳',
  min: 0,
  max: 20,
  showCurrency: false,
  suffix: ' visits',
  ...getQuestionConfig('domestic_lounge_usage_quarterly', 20),
  context: 'This helps us calculate the value of complimentary lounge access.'
}, {
  field: 'international_lounge_usage_quarterly',
  question: 'Plus, what about international airport lounges?',
  emoji: '🌎',
  min: 0,
  max: 20,
  showCurrency: false,
  suffix: ' visits',
  ...getQuestionConfig('international_lounge_usage_quarterly', 20),
  context: 'We factor in international lounge access value for travel cards.'
}, {
  field: 'mobile_phone_bills',
  question: 'How much do you spend on recharging your mobile or Wi-Fi monthly?',
  emoji: '📱',
  min: 0,
  max: 10000,
  ...getQuestionConfig('mobile_phone_bills', 10000),
  context: 'This helps us find cards with the best rewards on utility bill payments.'
}, {
  field: 'electricity_bills',
  question: "What's your average monthly electricity bill?",
  emoji: '⚡️',
  min: 0,
  max: 20000,
  ...getQuestionConfig('electricity_bills', 20000),
  context: 'We match you with cards that offer rewards on electricity bill payments.'
}, {
  field: 'water_bills',
  question: 'And what about your monthly water bill?',
  emoji: '💧',
  min: 0,
  max: 5000,
  ...getQuestionConfig('water_bills', 5000),
  context: 'This helps us calculate total utility rewards across all bills.'
}, {
  field: 'insurance_health_annual',
  question: 'How much do you pay for health or term insurance annually?',
  emoji: '🛡️',
  min: 0,
  max: 100000,
  ...getQuestionConfig('insurance_health_annual', 100000),
  context: 'We find cards that offer rewards on insurance premium payments.'
}, {
  field: 'insurance_car_or_bike_annual',
  question: 'How much do you pay for car or bike insurance annually?',
  emoji: '🚗',
  min: 0,
  max: 50000,
  ...getQuestionConfig('insurance_car_or_bike_annual', 50000),
  context: 'This helps us calculate rewards on vehicle insurance payments.'
}, {
  field: 'rent',
  question: 'How much do you pay for house rent every month?',
  emoji: '🏠',
  min: 0,
  max: 100000,
  ...getQuestionConfig('rent', 100000),
  context: 'We find cards that offer rewards on rent payments (where available).'
}, {
  field: 'school_fees',
  question: 'How much do you pay in school fees monthly?',
  emoji: '🎓',
  min: 0,
  max: 50000,
  ...getQuestionConfig('school_fees', 50000),
  context: 'This helps us calculate rewards on education-related expenses.'
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
  const [totalSpends, setTotalSpends] = useState<number | null>(null);
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
    // Don't navigate immediately - let user click "Start Evaluation" button
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

      // API returns: { status: "success", data: { success: true, savings: [...], total_spends: ... } }
      if (calculateResponse.status === "success" && calculateResponse.data?.success && calculateResponse.data?.savings && calculateResponse.data.savings.length > 0) {
        const savingsArray = calculateResponse.data.savings;
        
        // Extract total_beneficial_spends from API response (monthly beneficial spend)
        // Note: API already handles flights/hotels as annual (divides by 12) and excludes lounges (count-based)
        const apiTotalBeneficialSpends = calculateResponse.data?.total_beneficial_spends;
        if (apiTotalBeneficialSpends !== undefined && apiTotalBeneficialSpends !== null) {
          // total_beneficial_spends from API is already the correct monthly beneficial spend
          // Store it directly as monthly (we'll multiply by 12 only for annual display)
          const monthlySpend = typeof apiTotalBeneficialSpends === 'number' ? apiTotalBeneficialSpends : parseFloat(String(apiTotalBeneficialSpends)) || null;
          setTotalSpends(monthlySpend);
        } else {
          // Fallback: Calculate monthly beneficial spend manually
          // Exclude lounges (count-based) and handle flights/hotels as annual (divide by 12)
          const monthlySpends: number[] = [];
          const annualSpends: number[] = [];
          
          // Monthly spends (most categories)
          if (completePayload.amazon_spends) monthlySpends.push(completePayload.amazon_spends);
          if (completePayload.flipkart_spends) monthlySpends.push(completePayload.flipkart_spends);
          if (completePayload.other_online_spends) monthlySpends.push(completePayload.other_online_spends);
          if (completePayload.other_offline_spends) monthlySpends.push(completePayload.other_offline_spends);
          if (completePayload.grocery_spends_online) monthlySpends.push(completePayload.grocery_spends_online);
          if (completePayload.online_food_ordering) monthlySpends.push(completePayload.online_food_ordering);
          if (completePayload.fuel) monthlySpends.push(completePayload.fuel);
          if (completePayload.dining_or_going_out) monthlySpends.push(completePayload.dining_or_going_out);
          if (completePayload.mobile_phone_bills) monthlySpends.push(completePayload.mobile_phone_bills);
          if (completePayload.electricity_bills) monthlySpends.push(completePayload.electricity_bills);
          if (completePayload.water_bills) monthlySpends.push(completePayload.water_bills);
          if (completePayload.rent) monthlySpends.push(completePayload.rent);
          if (completePayload.school_fees) monthlySpends.push(completePayload.school_fees);
          
          // Annual spends (divide by 12 to get monthly equivalent)
          if (completePayload.flights_annual) annualSpends.push(completePayload.flights_annual / 12);
          if (completePayload.hotels_annual) annualSpends.push(completePayload.hotels_annual / 12);
          if (completePayload.insurance_health_annual) annualSpends.push(completePayload.insurance_health_annual / 12);
          if (completePayload.insurance_car_or_bike_annual) annualSpends.push(completePayload.insurance_car_or_bike_annual / 12);
          
          // Exclude lounges: domestic_lounge_usage_quarterly, international_lounge_usage_quarterly (count-based, not spend)
          
          const calculatedMonthlyTotal = [...monthlySpends, ...annualSpends].reduce((sum, val) => sum + val, 0);
          setTotalSpends(calculatedMonthlyTotal);
        }

        // Sort by Net Saving: total_savings_yearly + total_extra_benefits - joining_fees
        const extractNumeric = (val: string | number | undefined): number => {
          if (typeof val === 'number') return val;
          if (typeof val === 'string') {
            const num = Number(val.replace(/[^0-9.-]/g, ''));
            return isNaN(num) ? 0 : num;
          }
          return 0;
        };
        
        const sortedCards = [...savingsArray].sort((a: any, b: any) => {
          const aNetSaving = (a.total_savings_yearly || 0) + (a.total_extra_benefits || a.milestone_benefits_only || 0) - extractNumeric(a.joining_fees || a.joining_fee_text || 0);
          const bNetSaving = (b.total_savings_yearly || 0) + (b.total_extra_benefits || b.milestone_benefits_only || 0) - extractNumeric(b.joining_fees || b.joining_fee_text || 0);
          return bNetSaving - aNetSaving;
        });
        if (sortedCards.length === 0) {
          toast.error("No savings data returned. Please adjust your spending inputs and try again.");
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

        // Calculate user's card Net Saving to check if it's the winner
        const userCardNetSaving = (userCardInResults.total_savings_yearly || 0) + 
          (userCardInResults.total_extra_benefits || userCardInResults.milestone_benefits_only || 0) - 
          extractNumeric(userCardInResults.joining_fees || userCardInResults.joining_fee_text || 0);
        
        const topCardNetSaving = (sortedCards[0].total_savings_yearly || 0) + 
          (sortedCards[0].total_extra_benefits || sortedCards[0].milestone_benefits_only || 0) - 
          extractNumeric(sortedCards[0].joining_fees || sortedCards[0].joining_fee_text || 0);
        
        // If user's card is the winner (top card), compare with second best card
        const isUserCardWinner = userCardNetSaving >= topCardNetSaving;
        let comparisonCard;
        
        if (isUserCardWinner && sortedCards.length > 1) {
          // User's card wins - find the second best card that's different from user's card
          const secondBestCard = sortedCards.find((card: any) => 
            card.seo_card_alias !== selectedCard.seo_card_alias
          );
          
          if (secondBestCard) {
            // Compare with second best card (different from user's card)
            comparisonCard = secondBestCard;
          } else {
            // Fallback: if all cards are the same, use the top card
            comparisonCard = sortedCards[0];
          }
        } else {
          // User's card doesn't win - compare with top card
          comparisonCard = sortedCards[0];
        }
        
        if (!comparisonCard) {
          toast.error("We couldn't find a comparison card. Please try again.");
          return;
        }
        // Try to fetch detailed data for both cards, but use API data as fallback
        let userCardData = null;
        let geniusCardData = null;
        try {
          const [userCard, geniusCard] = await Promise.all([cardService.getCardDetailsByAlias(selectedCard.seo_card_alias).catch(err => {
            console.error("User card fetch failed:", err);
            return null;
          }), cardService.getCardDetailsByAlias(comparisonCard.seo_card_alias).catch(err => {
            console.error("Comparison card fetch failed:", err);
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
              total_extra_benefits: userCardInResults.total_extra_benefits ?? userCard.data[0].total_extra_benefits ?? userCard.data[0].milestone_benefits_only ?? 0,
              milestone_benefits_only: userCardInResults.milestone_benefits_only ?? userCard.data[0].milestone_benefits_only,
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
              total_extra_benefits: userCardInResults.total_extra_benefits ?? selectedCard.total_extra_benefits ?? selectedCard.milestone_benefits_only ?? 0,
              milestone_benefits_only: userCardInResults.milestone_benefits_only ?? selectedCard.milestone_benefits_only,
              spending_breakdown_array: userCardInResults.spending_breakdown_array || []
            };
          }

          // Comparison card data (genius card or second best) - prioritize image from API response
          if (geniusCard?.status === "success" && geniusCard.data?.[0]) {
            geniusCardData = {
              ...geniusCard.data[0],
              image: comparisonCard.image || geniusCard.data[0].image,
              // Use API image first
              annual_saving: comparisonCard.total_savings || 0,
              total_savings_yearly: comparisonCard.total_savings_yearly || 0,
              total_extra_benefits: comparisonCard.total_extra_benefits ?? geniusCard.data[0].total_extra_benefits ?? geniusCard.data[0].milestone_benefits_only ?? 0,
              milestone_benefits_only: comparisonCard.milestone_benefits_only ?? geniusCard.data[0].milestone_benefits_only,
              spending_breakdown_array: comparisonCard.spending_breakdown_array || []
            };
          } else {
            // Fallback: Create card data from API response with API image
            geniusCardData = {
              id: comparisonCard.id,
              name: comparisonCard.card_name,
              seo_card_alias: comparisonCard.seo_card_alias,
              image: comparisonCard.image || '',
              // Use API image directly
              annual_saving: comparisonCard.total_savings || 0,
              total_savings_yearly: comparisonCard.total_savings_yearly || 0,
              total_extra_benefits: comparisonCard.total_extra_benefits ?? comparisonCard.milestone_benefits_only ?? 0,
              milestone_benefits_only: comparisonCard.milestone_benefits_only,
              spending_breakdown_array: comparisonCard.spending_breakdown_array || [],
              banks: {
                name: comparisonCard.card_name.split(' ')[0]
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
    // Search example handlers
    const handleExampleClick = (example: string) => {
      const exampleCard = filteredCards.find(card => 
        card.name.toLowerCase().includes(example.toLowerCase())
      );
      if (exampleCard) {
        handleCardSelect(exampleCard);
      }
    };

    return <>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-b from-muted/5 via-background to-muted/5 pt-[90px] sm:pt-[110px] pb-6 sm:pb-8">
        <div className="section-shell">
          {/* Main Content Grid - 12 Column System */}
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            {/* Hero Section - Tightened */}
            <div className="text-center mb-5">
              <h1 className="text-[36px] sm:text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent leading-[1.4]">
                Beat My Card
              </h1>
              <p className="text-base text-[#6B7280] mb-3 max-w-2xl mx-auto leading-[1.4]">
                Is your card costing you money? Compare with 100+ cards instantly.
              </p>
              
              {/* Enhanced Trust Indicators - Hidden on Mobile */}
              <div className="hidden sm:flex items-center justify-center gap-2 md:gap-3 lg:gap-4 mb-5">
                <Badge variant="secondary" className="px-3 md:px-4 lg:px-5 py-2 md:py-2.5 text-xs md:text-sm lg:text-base font-semibold bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 text-purple-700 dark:text-purple-300 border-2 border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all shadow-sm hover:shadow-md whitespace-nowrap flex-shrink-0">
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2" />
                  AI-Powered Evaluation
                </Badge>
                <Badge variant="secondary" className="px-3 md:px-4 lg:px-5 py-2 md:py-2.5 text-xs md:text-sm lg:text-base font-semibold bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 text-blue-700 dark:text-blue-300 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all shadow-sm hover:shadow-md whitespace-nowrap flex-shrink-0">
                  <Shield className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2" />
                  Unbiased Results
                </Badge>
                <Badge variant="secondary" className="px-3 md:px-4 lg:px-5 py-2 md:py-2.5 text-xs md:text-sm lg:text-base font-semibold bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 text-amber-700 dark:text-amber-300 border-2 border-amber-200 dark:border-amber-800 hover:border-amber-300 dark:hover:border-amber-700 transition-all shadow-sm hover:shadow-md whitespace-nowrap flex-shrink-0">
                  <Zap className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2" />
                  Accurate Comparison
                </Badge>
              </div>
            </div>

            {/* Search Bar Section - Full Width, Centered */}
            <div className="max-w-3xl mx-auto mb-6 sm:mb-8">
              {/* Prominent Search Section */}
              <div className="bg-white dark:bg-card rounded-2xl p-4 sm:p-5 lg:p-6 border-2 border-border shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                <div className="mb-3 sm:mb-4">
                  <p className="text-xs sm:text-sm text-muted-foreground text-center leading-relaxed">
                    Complete <span className="font-semibold text-foreground">19 quick questions</span> — personalised match in under 2 minutes
                  </p>
          </div>

                  {/* Enhanced Search Bar */}
                  <div className="space-y-5">
                    <div className="relative">
                      <CardSearchDropdown 
                        cards={filteredCards} 
                        selectedCard={selectedCard} 
                        onCardSelect={handleCardSelect} 
                        onClearSelection={() => setSelectedCard(null)} 
                        isLoading={isLoading}
                        placeholder="Search your current card"
                      />
                    </div>
                  
                  {/* Primary CTA */}
                  {selectedCard ? (
                    <Button 
                      size="lg" 
                      onClick={() => setStep('questions')}
                      className="w-full h-12 sm:h-14 text-sm sm:text-base md:text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Start Evaluation
                    </Button>
                  ) : (
                    <Button 
                      size="lg" 
                      disabled
                      className="w-full h-12 sm:h-14 text-xs sm:text-sm md:text-base font-semibold opacity-50 cursor-not-allowed px-2"
                    >
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 flex-shrink-0" />
                      <span className="truncate">Select card to begin</span>
                    </Button>
                  )}

                </div>
              </div>
            </div>

            {/* Why You Might Be Using The Wrong Card - Comparison Table */}
            <div className="max-w-4xl mx-auto px-2 sm:px-0">
              <div className="bg-white dark:bg-card rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 border-2 border-border shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                <div className="text-center mb-3 sm:mb-4 md:mb-6">
                  <h3 className="text-xs sm:text-sm md:text-lg lg:text-xl xl:text-2xl font-bold text-foreground mb-1 sm:mb-1.5 md:mb-2 leading-tight px-1">
                    Why You Might Be Using The Wrong Card
                  </h3>
                  <p className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-muted-foreground leading-tight px-1">
                    Most people stick with their first card, missing better rewards
                  </p>
                </div>

                {/* Comparison Table - Mobile Optimized with Wrapped Content */}
                <div className="overflow-x-auto scrollbar-hide -mx-2 sm:mx-0">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 border-border">
                        <th className="text-left p-2 sm:p-2.5 md:p-3 text-xs sm:text-sm font-semibold text-foreground bg-muted/30 w-1/2">
                          Problem
                        </th>
                        <th className="text-left p-2 sm:p-2.5 md:p-3 text-xs sm:text-sm font-semibold text-foreground bg-muted/30 w-1/2">
                          How We Help
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="p-2 sm:p-2.5 md:p-3 text-xs sm:text-sm text-muted-foreground leading-relaxed break-words">
                          <div className="flex items-start gap-1 sm:gap-1.5">
                            <span className="text-red-500 text-sm sm:text-base md:text-lg flex-shrink-0 mt-0.5">✗</span>
                            <span className="break-words">Earning less cashback than you could</span>
                          </div>
                        </td>
                        <td className="p-2 sm:p-2.5 md:p-3 text-xs sm:text-sm text-foreground leading-relaxed break-words">
                          <div className="flex items-start gap-1 sm:gap-1.5">
                            <span className="text-green-500 text-sm sm:text-base md:text-lg flex-shrink-0 mt-0.5">✓</span>
                            <span className="font-medium break-words">We match cards to your spending</span>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="p-2 sm:p-2.5 md:p-3 text-xs sm:text-sm text-muted-foreground leading-relaxed break-words">
                          <div className="flex items-start gap-1 sm:gap-1.5">
                            <span className="text-red-500 text-sm sm:text-base md:text-lg flex-shrink-0 mt-0.5">✗</span>
                            <span className="break-words">Paying fees without max benefits</span>
                          </div>
                        </td>
                        <td className="p-2 sm:p-2.5 md:p-3 text-xs sm:text-sm text-foreground leading-relaxed break-words">
                          <div className="flex items-start gap-1 sm:gap-1.5">
                            <span className="text-green-500 text-sm sm:text-base md:text-lg flex-shrink-0 mt-0.5">✓</span>
                            <span className="font-medium break-words">We find better fee-to-benefit cards</span>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="p-2 sm:p-2.5 md:p-3 text-xs sm:text-sm text-muted-foreground leading-relaxed break-words">
                          <div className="flex items-start gap-1 sm:gap-1.5">
                            <span className="text-red-500 text-sm sm:text-base md:text-lg flex-shrink-0 mt-0.5">✗</span>
                            <span className="break-words">Missing category rewards</span>
                          </div>
                        </td>
                        <td className="p-2 sm:p-2.5 md:p-3 text-xs sm:text-sm text-foreground leading-relaxed break-words">
                          <div className="flex items-start gap-1 sm:gap-1.5">
                            <span className="text-green-500 text-sm sm:text-base md:text-lg flex-shrink-0 mt-0.5">✓</span>
                            <span className="font-medium break-words">We analyze 100+ cards for you</span>
                          </div>
                        </td>
                      </tr>
                      <tr className="hover:bg-muted/20 transition-colors">
                        <td className="p-2 sm:p-2.5 md:p-3 text-xs sm:text-sm text-muted-foreground leading-relaxed break-words">
                          <div className="flex items-start gap-1 sm:gap-1.5">
                            <span className="text-red-500 text-sm sm:text-base md:text-lg flex-shrink-0 mt-0.5">✗</span>
                            <span className="break-words">Deciding based on ads, not data</span>
                          </div>
                        </td>
                        <td className="p-2 sm:p-2.5 md:p-3 text-xs sm:text-sm text-foreground leading-relaxed break-words">
                          <div className="flex items-start gap-1 sm:gap-1.5">
                            <span className="text-green-500 text-sm sm:text-base md:text-lg flex-shrink-0 mt-0.5">✓</span>
                            <span className="font-medium break-words">Our AI wins 95% of the time</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Trust Badge - Mobile Optimized */}
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border">
                  <div className="flex flex-row items-center justify-center gap-2 sm:gap-3 md:gap-4">
                    <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 flex-shrink-0">
                      <Trophy className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-amber-500 flex-shrink-0" />
                      <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-foreground whitespace-nowrap">
                        Win rate: <span className="text-primary">95%</span>
                      </span>
                    </div>
                    <div className="w-px h-4 sm:h-5 bg-border flex-shrink-0"></div>
                    <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 flex-shrink-0">
                      <Shield className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-500 flex-shrink-0" />
                      <span className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground whitespace-nowrap">
                        Data-backed
                      </span>
                    </div>
                  </div>
                </div>
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
        <div className="min-h-screen bg-background pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Header with Navigation */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <Button variant="ghost" onClick={() => setStep('select')} className="gap-2 text-sm sm:text-base">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Card Selection</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Step Indicator - Matching Super Card Genius Style */}
            <div className="mb-4 sm:mb-6 rounded-2xl border border-border bg-card/90 shadow-[0_8px_30px_rgb(0,0,0,0.05)] p-3 sm:p-4 flex items-center justify-between flex-wrap gap-2 sm:gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary flex items-center gap-1 mb-1">
                  <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                    {currentStep + 1}
                  </span>
                  of {questions.length}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">Drag the slider or type the amount</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Progress</p>
                <p className="text-base sm:text-lg font-semibold text-foreground">{Math.round(progress)}%</p>
              </div>
            </div>

            {/* Question Card - Matching Super Card Genius Style */}
            <div className="animate-fade-in">
              <SpendingInput 
                question={question.question} 
                emoji={question.emoji} 
                value={responses[question.field] || 0} 
                onChange={value => setResponses({
                ...responses,
                [question.field]: value
                })} 
                min={question.min} 
                max={question.max} 
                step={question.step} 
                showCurrency={question.showCurrency !== false}
                showRupee={question.showCurrency !== false}
                suffix={question.suffix}
                context={question.context}
                presets={question.presets} 
              />
            </div>

            {/* Navigation Buttons - Matching Super Card Genius Style */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
              <Button
                size="lg"
                onClick={handleNext}
                disabled={isCalculating}
                className="w-full sm:flex-1 touch-target order-1"
                aria-label={currentStep === questions.length - 1 ? "Show results" : "Go to next question"}
              >
                  {isCalculating ? <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Calculating...
                    </> : currentStep === questions.length - 1 ? <>
                    Show My Results
                    <Sparkles className="ml-2" />
                    </> : <>
                      Next
                    <ArrowRight className="ml-2" />
                    </>}
                </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="w-full sm:flex-1 touch-target order-2"
                aria-label="Go to previous question"
              >
                <ArrowLeft className="mr-2" />
                  Previous
                </Button>
              </div>

            {/* Skip All Button - Matching Super Card Genius Style */}
            {currentStep !== questions.length - 1 && (
              <div className="flex justify-center pt-4 sm:pt-6 mt-6 sm:mt-8 mb-12 sm:mb-16 md:mb-20">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleSkipAll}
                        disabled={isCalculating}
                        className="text-xs sm:text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                        aria-label="Skip all remaining questions"
                      >
                        {isCalculating ? "Calculating..." : "Skip all (not recommended)"}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm">Skipping may reduce accuracy of your recommendations.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
            </div>
            )}
          </div>
        </div>
        </div>
        <Footer />
      </>;
  }

  // Render results
  if (step === 'results' && userCardData && geniusCardData) {
    // Calculate monthly beneficial spend from responses (fallback if API doesn't provide total_beneficial_spends)
    // This should match API logic: monthly spends + annual spends divided by 12, excluding lounges
    const calculateMonthlyBeneficialSpend = (spending: SpendingData): number => {
      const monthlySpends: number[] = [];
      const annualSpends: number[] = [];
      
      // Monthly spends (most categories)
      if (spending.amazon_spends) monthlySpends.push(spending.amazon_spends);
      if (spending.flipkart_spends) monthlySpends.push(spending.flipkart_spends);
      if (spending.other_online_spends) monthlySpends.push(spending.other_online_spends);
      if (spending.other_offline_spends) monthlySpends.push(spending.other_offline_spends);
      if (spending.grocery_spends_online) monthlySpends.push(spending.grocery_spends_online);
      if (spending.online_food_ordering) monthlySpends.push(spending.online_food_ordering);
      if (spending.fuel) monthlySpends.push(spending.fuel);
      if (spending.dining_or_going_out) monthlySpends.push(spending.dining_or_going_out);
      if (spending.mobile_phone_bills) monthlySpends.push(spending.mobile_phone_bills);
      if (spending.electricity_bills) monthlySpends.push(spending.electricity_bills);
      if (spending.water_bills) monthlySpends.push(spending.water_bills);
      if (spending.rent) monthlySpends.push(spending.rent);
      if (spending.school_fees) monthlySpends.push(spending.school_fees);
      
      // Annual spends (divide by 12 to get monthly equivalent)
      if (spending.flights_annual) annualSpends.push(spending.flights_annual / 12);
      if (spending.hotels_annual) annualSpends.push(spending.hotels_annual / 12);
      if (spending.insurance_health_annual) annualSpends.push(spending.insurance_health_annual / 12);
      if (spending.insurance_car_or_bike_annual) annualSpends.push(spending.insurance_car_or_bike_annual / 12);
      
      // Exclude lounges: domestic_lounge_usage_quarterly, international_lounge_usage_quarterly (count-based, not spend)
      
      return [...monthlySpends, ...annualSpends].reduce((sum, val) => sum + val, 0);
    };
    
    // Use API total_beneficial_spends (monthly) directly, otherwise calculate from responses
    // totalSpends state contains monthly beneficial spend from API
    const totalUserSpend = totalSpends !== null ? totalSpends : calculateMonthlyBeneficialSpend(responses);
    const totalUserSpendAnnual = totalUserSpend * 12; // Multiply monthly by 12 for annual display
    
    // Helper function to extract numeric value from fee strings
    const extractNumeric = (val: string | number | undefined): number => {
      if (typeof val === 'number') return val;
      if (typeof val === 'string') {
        const num = Number(val.replace(/[^0-9.-]/g, ''));
        return isNaN(num) ? 0 : num;
      }
      return 0;
    };
    
    // Calculate Net Savings: total_savings_yearly + total_extra_benefits - joining_fees
    const calculateNetSaving = (card: Card): number => {
      const annualSavings = card.total_savings_yearly || 0;
      const extraBenefits = card.total_extra_benefits || card.milestone_benefits_only || 0;
      const joiningFee = extractNumeric(card.joining_fees || card.joining_fee_text);
      return annualSavings + extraBenefits - joiningFee;
    };
    
    // Use total_savings_yearly for annual savings (not annual_saving which is monthly)
    const userAnnualSavings = userCardData?.total_savings_yearly || 0;
    const geniusAnnualSavings = geniusCardData?.total_savings_yearly || 0;
    
    // Calculate Net Savings
    const userNetSaving = calculateNetSaving(userCardData);
    const geniusNetSaving = calculateNetSaving(geniusCardData);
    
    // Calculate differences based on Net Saving (primary metric)
    const netSavingDifference = geniusNetSaving - userNetSaving; // Can be negative if user wins
    const monthlyNetSavings = Math.max(Math.round(Math.abs(netSavingDifference) / 12), 0);
    
    // Annual Savings differences (secondary metric)
    const savingsDifference = Math.abs(geniusAnnualSavings - userAnnualSavings);
    const monthlySavings = Math.max(Math.round(savingsDifference / 12), 0);
    
    // Formatting helpers
    const userNetText = userNetSaving.toLocaleString('en-IN');
    const geniusNetText = geniusNetSaving.toLocaleString('en-IN');
    const userAnnualText = userAnnualSavings.toLocaleString('en-IN');
    const geniusAnnualText = geniusAnnualSavings.toLocaleString('en-IN');
    
    // Calculate percentage difference based on Net Saving
    const netSavingPercent = userNetSaving > 0 
      ? ((geniusNetSaving - userNetSaving) / userNetSaving) * 100 
      : (geniusNetSaving > 0 ? 100 : 0);
    
    // Edge case handling: Determine if user's card is better or equal (based on Net Saving)
    const isUserWinner = userNetSaving >= geniusNetSaving;
    
    // Edge case: Check if savings are equal (tie scenario - within ₹100)
    const isTie = Math.abs(netSavingDifference) < 100;
    
    // Edge case: Check if difference is negligible (< 1% or < ₹100)
    const isNegligibleDifference = Math.abs(netSavingDifference) < 100 || 
      (userNetSaving > 0 && Math.abs(netSavingDifference) / userNetSaving < 0.01);
    
    // Edge case: Determine hero content based on winner status (using Net Saving)
    const heroGradient = isUserWinner 
      ? (isTie ? 'from-amber-500 via-amber-600 to-amber-700' : 'from-emerald-500 via-emerald-600 to-emerald-700')
      : (isNegligibleDifference ? 'from-amber-500 via-amber-600 to-amber-700' : 'from-blue-600 via-indigo-600 to-purple-600');
    
    const heroTitle = isUserWinner 
      ? (isTie ? 'Great Choice! Your Card is Already Optimal' : 'You Are Already Winning!')
      : (isNegligibleDifference ? 'Your Card is Nearly Optimal' : 'We Found Your Upgrade!');
    
    const heroSubtitle = isUserWinner
      ? (isTie 
          ? `Your ${userCardData.name} performs equally well with a Net Saving of ₹${userNetText}.`
          : `Your ${userCardData.name} has a Net Saving of ₹${userNetText} - that's the best match for your spending!`)
      : (isNegligibleDifference
          ? `The difference is minimal. Your card has ₹${userNetText} Net Saving vs ₹${geniusNetText} - both are great options.`
          : `Switch to ${geniusCardData.name} and unlock ₹${Math.abs(netSavingDifference).toLocaleString('en-IN')} more in Net Saving.`);
    const comparisonBars = [
      {
        label: 'Your Card',
        value: userAnnualSavings,
        accent: 'from-rose-400 to-rose-500'
      },
      {
        label: 'Recommended Card',
        value: geniusAnnualSavings,
        accent: 'from-blue-500 to-blue-600'
      }
    ];
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
    const userMilestoneValue = userCardData.total_extra_benefits ?? userCardData.milestone_benefits_only ?? 0;
    const geniusMilestoneValue = geniusCardData.total_extra_benefits ?? geniusCardData.milestone_benefits_only ?? 0;
    const comparisonRows = [
      {
        label: 'Milestone Benefit',
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
        <div className="min-h-screen bg-slate-50 pt-16 sm:pt-20 md:pt-24 pb-8 sm:pb-12 md:pb-16 overflow-x-hidden w-full box-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-4 md:px-6 lg:px-8 space-y-6 sm:space-y-8 md:space-y-10 w-full box-border" style={{ paddingLeft: 'max(16px, env(safe-area-inset-left))', paddingRight: 'max(16px, env(safe-area-inset-right))' }}>
            <div className="flex items-center justify-between pt-4 sm:pt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setStep('select');
                  setCurrentStep(0);
                  setResponses({});
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="gap-2 hover:bg-primary/5 border-primary/30 text-primary hover:border-primary text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2"
              >
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Change Card Selection</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </div>

            {/* Step 1: Which Card Wins - Hero Section */}
            <section className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-white border-2 border-slate-200 p-4 sm:p-5 md:p-6 shadow-lg w-full max-w-full box-border">
              {/* Step Indicator */}
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-600 text-white text-[10px] sm:text-xs font-bold">1</div>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wide">Which Card Wins</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 hover:text-slate-600 cursor-help ml-1" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm font-semibold mb-1">Card Comparison Result</p>
                      <p className="text-xs text-muted-foreground">This section shows which card saves you more money based on your spending pattern. The winning card is highlighted with its image and savings amount.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <div className="flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-center w-full max-w-full box-border">
                {/* Left Section - Comparison Message & Card Image */}
                <div className="flex-1 space-y-3 sm:space-y-4">
                  {!isUserWinner && !isNegligibleDifference && (
                    <>
                      <div className="inline-flex items-center gap-1.5 sm:gap-2 border-2 border-emerald-200 bg-emerald-50 rounded-full px-3 py-1 sm:px-3.5 sm:py-1.5 text-[10px] sm:text-xs font-bold text-emerald-700">
                        <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
                        <span>Better Card Found</span>
                  </div>
                      
                      {/* Comparison Message */}
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black leading-tight text-slate-900">
                          <span className="text-emerald-700">{geniusCardData.name}</span>
                          <span className="text-slate-600 mx-2">beats your</span>
                          <span className="text-slate-700">{userCardData.name}!</span>
                        </h1>
                </div>
                      
                      {/* Winning Card Image */}
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg sm:rounded-xl p-2 sm:p-3 border-2 border-emerald-200 shadow-md flex-shrink-0">
                          <img
                            src={geniusCardData.image}
                            alt={geniusCardData.name}
                            className="w-16 h-10 sm:w-20 sm:h-12 md:w-24 md:h-14 lg:w-28 lg:h-16 object-contain drop-shadow-lg"
                            onError={e => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                  </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-slate-500 mb-1">Winning Card</p>
                          <p className="text-sm sm:text-base md:text-lg font-bold text-slate-900 truncate">{geniusCardData.name}</p>
                          <p className="text-[10px] sm:text-xs text-slate-400">{geniusCardData.banks?.name || 'Credit Card'}</p>
                    </div>
                      </div>
                    </>
                  )}
                  
                  {isUserWinner && (
                    <>
                      <div className="inline-flex items-center gap-1.5 sm:gap-2 border-2 border-blue-200 bg-blue-50 rounded-full px-3 py-1 sm:px-3.5 sm:py-1.5 text-[10px] sm:text-xs font-bold text-blue-700">
                        <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" />
                        <span>Your Card Wins</span>
                    </div>
                      
                      <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black leading-tight text-slate-900">
                        <span className="text-blue-700">{userCardData.name}</span>
                        <span className="text-slate-600 mx-2">is your best choice!</span>
                      </h1>
                      
                      {/* Winning Card Image */}
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-2 sm:p-3 border-2 border-blue-200 shadow-md flex-shrink-0">
                          <img
                            src={userCardData.image}
                            alt={userCardData.name}
                            className="w-16 h-10 sm:w-20 sm:h-12 md:w-24 md:h-14 lg:w-28 lg:h-16 object-contain drop-shadow-lg"
                            onError={e => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-slate-500 mb-1">Your Winning Card</p>
                          <p className="text-sm sm:text-base md:text-lg font-bold text-slate-900 truncate">{userCardData.name}</p>
                          <p className="text-[10px] sm:text-xs text-slate-400">{userCardData.banks?.name || 'Credit Card'}</p>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {isNegligibleDifference && (
                    <>
                      <div className="inline-flex items-center gap-1.5 sm:gap-2 border-2 border-amber-200 bg-amber-50 rounded-full px-3 py-1 sm:px-3.5 sm:py-1.5 text-[10px] sm:text-xs font-bold text-amber-700">
                        <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600" />
                        <span>Both Cards Excellent</span>
                    </div>
                      
                      <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black leading-tight text-slate-900">
                        Both cards offer similar savings
                      </h1>
                    </>
                  )}
                </div>
                
                {/* Right Section - Hero Metric */}
                <div className="flex-1 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border-2 border-emerald-200 shadow-lg">
                  <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-emerald-700 mb-2 sm:mb-3 font-semibold">
                    {isUserWinner ? 'Net Saving' : 'Additional Savings'}
                  </p>
                  <div className="space-y-1 sm:space-y-1.5">
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-emerald-900 leading-none">
                        ₹{(isUserWinner ? userNetSaving : Math.abs(netSavingDifference)).toLocaleString('en-IN')}
                      </p>
                      {!isUserWinner && !isNegligibleDifference && (
                        <div className="bg-emerald-600 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md text-[10px] sm:text-xs font-bold">
                          +₹{Math.abs(netSavingDifference).toLocaleString('en-IN')}
                        </div>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-emerald-700 font-medium">
                      {!isUserWinner && !isNegligibleDifference 
                        ? `≈ ₹${monthlyNetSavings.toLocaleString('en-IN')}/month`
                        : 'Per year'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Step 2: Why This Card Wins - Card Comparison Section */}
            <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-2 sm:p-3 md:p-4 shadow-sm w-full max-w-full box-border overflow-hidden">
              {/* Step Indicator */}
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-600 text-white text-xs sm:text-sm font-bold">2</div>
                <span className="text-xs sm:text-sm font-semibold text-slate-600 uppercase tracking-wide">Why This Card Wins</span>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                <div className="flex-1 min-w-0">
                  <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-slate-900 mb-0.5 sm:mb-1">Side-by-Side Comparison</h2>
                  <p className="text-[10px] sm:text-xs md:text-sm text-slate-500">See exactly why the recommended card is better for you</p>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-slate-400 hover:text-slate-600 cursor-help flex-shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm font-semibold mb-1">Side-by-Side Card Comparison</p>
                      <p className="text-xs text-muted-foreground mb-2">Compare key metrics like Net Saving, Annual Savings, and Top Categories for both cards.</p>
                      <p className="text-xs font-medium mt-2">Net Saving Formula:</p>
                      <p className="text-xs text-muted-foreground">Annual Savings + Milestone Benefits - Joining Fee</p>
                      <p className="text-xs text-muted-foreground mt-1">This shows the actual value you get after all fees and benefits.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              {/* Comparison Table - Single Screen Fit */}
              <div className="w-full">
                <table className="w-full border-collapse table-fixed">
                  {/* Table Header with Card Images */}
                  <thead>
                    <tr>
                      <th className="w-[45%] p-1.5 sm:p-2 text-left align-top">
                        <div className="space-y-1.5 sm:space-y-2">
                          <div className="bg-slate-50 rounded-lg p-1.5 sm:p-2">
                            <img
                              src={userCardData.image}
                              alt={userCardData.name}
                              className="w-full h-16 sm:h-20 md:h-24 object-contain drop-shadow-lg"
                              onError={e => {
                                e.currentTarget.src = '/placeholder.svg';
                              }}
                            />
                      </div>
                          <div>
                            <p className="text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-0.5 line-clamp-1">{userCardData.banks?.name || 'Credit Card'}</p>
                            <h3 className="text-[10px] sm:text-xs md:text-sm font-bold text-slate-900 leading-tight line-clamp-2">{userCardData.name}</h3>
                    </div>
                  </div>
                      </th>
                      <th className="w-[10%] p-1.5 sm:p-2 text-center align-top">
                        <div className="text-[8px] sm:text-[9px] md:text-[10px] text-slate-500 font-medium">VS</div>
                      </th>
                      <th className="w-[45%] p-1.5 sm:p-2 text-right align-top relative">
                        {!isUserWinner && !isNegligibleDifference && (
                          <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-1 py-0.5 rounded-full text-[7px] sm:text-[8px] md:text-[9px] font-bold flex items-center gap-0.5 shadow-lg z-10">
                            <Sparkles className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                            <span className="hidden sm:inline">Winner</span>
                            <span className="sm:hidden">⭐</span>
                      </div>
                        )}
                        <div className="space-y-1.5 sm:space-y-2">
                          <div className="bg-slate-50 rounded-lg p-1.5 sm:p-2 border-2 border-blue-200">
                            <img
                              src={geniusCardData.image}
                              alt={geniusCardData.name}
                              className="w-full h-16 sm:h-20 md:h-24 object-contain drop-shadow-lg"
                              onError={e => {
                                e.currentTarget.src = '/placeholder.svg';
                              }}
                            />
                    </div>
                          <div>
                            <p className="text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-0.5 line-clamp-1">{geniusCardData.banks?.name || 'Credit Card'}</p>
                            <h3 className="text-[10px] sm:text-xs md:text-sm font-bold text-slate-900 leading-tight line-clamp-2">{geniusCardData.name}</h3>
                  </div>
                </div>
                      </th>
                    </tr>
                  </thead>
                    
                    {/* Table Body with Comparison Metrics */}
                    <tbody>
                      {/* Net Saving - Primary Metric */}
                      <tr className="border-t-2 border-slate-200">
                        <td className={`p-1.5 sm:p-2 ${isUserWinner ? 'bg-emerald-50/50' : 'bg-white'}`}>
                          <div className="space-y-0.5">
                            <p className="text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-slate-500">Net Saving</p>
                            <p className={`text-sm sm:text-base md:text-lg lg:text-xl font-black ${isUserWinner ? 'text-emerald-900' : 'text-slate-900'}`}>
                              ₹{userNetSaving.toLocaleString('en-IN')}
                            </p>
                            <p className="text-[7px] sm:text-[8px] md:text-[9px] text-slate-400">Per year</p>
                    </div>
                        </td>
                        <td className="p-1.5 sm:p-2 text-center align-middle">
                          {!isUserWinner && !isNegligibleDifference && (
                            <div className="flex flex-col items-center gap-0.5">
                              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                              <span className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-green-600 leading-tight">
                                +₹{Math.abs(netSavingDifference).toLocaleString('en-IN')}
                              </span>
                    </div>
                  )}
                          {isUserWinner && (
                            <div className="flex flex-col items-center gap-0.5">
                              <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
                              <span className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-emerald-600">Winner</span>
                  </div>
                          )}
                          {isNegligibleDifference && (
                            <div className="text-[8px] sm:text-[9px] md:text-[10px] text-slate-400">≈</div>
                          )}
                        </td>
                        <td className={`p-1.5 sm:p-2 text-right ${!isUserWinner && !isNegligibleDifference ? 'bg-emerald-50/50' : 'bg-white'}`}>
                          <div className="space-y-0.5">
                            <p className="text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-slate-500">Net Saving</p>
                            <p className={`text-sm sm:text-base md:text-lg lg:text-xl font-black ${!isUserWinner && !isNegligibleDifference ? 'text-emerald-900' : 'text-slate-900'}`}>
                              ₹{geniusNetSaving.toLocaleString('en-IN')}
                            </p>
                            <p className="text-[7px] sm:text-[8px] md:text-[9px] text-slate-400">Per year</p>
                  </div>
                        </td>
                      </tr>
                      
                      {/* Annual Savings */}
                      <tr className="border-t border-slate-200">
                        <td className="p-1.5 sm:p-2">
                          <div className="space-y-0.5">
                            <p className="text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-slate-500">Annual Savings</p>
                            <p className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-slate-700">
                              ₹{userAnnualSavings.toLocaleString('en-IN')}
                            </p>
                            <p className="text-[7px] sm:text-[8px] md:text-[9px] text-slate-400">≈ ₹{Math.round(userAnnualSavings / 12).toLocaleString('en-IN')}/mo</p>
                    </div>
                        </td>
                        <td className="p-1.5 sm:p-2 text-center align-middle">
                          {geniusAnnualSavings > userAnnualSavings && (
                            <div className="flex flex-col items-center gap-0.5">
                              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                              <span className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-green-600 leading-tight">
                                +₹{(geniusAnnualSavings - userAnnualSavings).toLocaleString('en-IN')}
                              </span>
                    </div>
                  )}
                          {userAnnualSavings > geniusAnnualSavings && (
                            <div className="flex flex-col items-center gap-0.5">
                              <ArrowDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                              <span className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-red-600 leading-tight">
                                -₹{(userAnnualSavings - geniusAnnualSavings).toLocaleString('en-IN')}
                    </span>
                  </div>
                          )}
                          {userAnnualSavings === geniusAnnualSavings && (
                            <div className="text-[8px] sm:text-[9px] md:text-[10px] text-slate-400">Equal</div>
                          )}
                        </td>
                        <td className="p-1.5 sm:p-2 text-right">
                          <div className="space-y-0.5">
                            <p className="text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-slate-500">Annual Savings</p>
                            <p className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-slate-700">
                              ₹{geniusAnnualSavings.toLocaleString('en-IN')}
                            </p>
                            <p className="text-[7px] sm:text-[8px] md:text-[9px] text-slate-400">≈ ₹{Math.round(geniusAnnualSavings / 12).toLocaleString('en-IN')}/mo</p>
                  </div>
                        </td>
                      </tr>
                      
                      {/* Top Categories */}
                      {(() => {
                        const userTopCategories = userCardData.spending_breakdown_array
                          ?.filter(item => item.savings > 0)
                          .sort((a, b) => b.savings - a.savings)
                          .slice(0, 2)
                          .map(cat => formatCategoryName(cat.on || ''))
                          .join(', ') || 'N/A';
                        
                        const geniusTopCategories = geniusCardData.spending_breakdown_array
                          ?.filter(item => item.savings > 0)
                          .sort((a, b) => b.savings - a.savings)
                          .slice(0, 2)
                          .map(cat => formatCategoryName(cat.on || ''))
                          .join(', ') || 'N/A';
                        
                        return (
                          <tr className="border-t border-slate-200">
                            <td className="p-1.5 sm:p-2">
                              <div className="flex items-start gap-1.5">
                                <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[8px] sm:text-[9px] md:text-[10px] text-slate-500 mb-0.5">Top Categories</p>
                                  <p className="text-[9px] sm:text-[10px] md:text-xs font-bold text-slate-900 break-words line-clamp-2">{userTopCategories}</p>
                </div>
                              </div>
                            </td>
                            <td className="p-1.5 sm:p-2 text-center align-middle">
                              <div className="text-[8px] sm:text-[9px] md:text-[10px] text-slate-400">vs</div>
                            </td>
                            <td className="p-1.5 sm:p-2 text-right">
                              <div className="flex items-start gap-1.5 justify-end">
                                <div className="flex-1 min-w-0 text-right">
                                  <p className="text-[8px] sm:text-[9px] md:text-[10px] text-slate-500 mb-0.5">Top Categories</p>
                                  <p className="text-[9px] sm:text-[10px] md:text-xs font-bold text-slate-900 break-words line-clamp-2">{geniusTopCategories}</p>
                                </div>
                                <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-600 mt-0.5 flex-shrink-0" />
                              </div>
                            </td>
                          </tr>
                        );
                      })()}
                    </tbody>
                  </table>
              </div>
              
              {/* Insight Line - Dynamic based on winner */}
              {!isUserWinner && !isNegligibleDifference && (() => {
                // Find categories where recommended card saves more than user's card
                const userBreakdown = userCardData.spending_breakdown_array || [];
                const geniusBreakdown = geniusCardData.spending_breakdown_array || [];
                
                // Create a map of user savings by category
                const userSavingsMap = new Map();
                userBreakdown.forEach(item => {
                  const categoryKey = item.on || '';
                  userSavingsMap.set(categoryKey, item.savings || 0);
                });
                
                // Find categories where genius card saves more
                const winningCategories = geniusBreakdown
                  .filter(item => {
                    const categoryKey = item.on || '';
                    const userSaving = userSavingsMap.get(categoryKey) || 0;
                    const geniusSaving = item.savings || 0;
                    return geniusSaving > userSaving;
                  })
                  .sort((a, b) => (b.savings || 0) - (a.savings || 0))
                  .slice(0, 3)
                  .map(cat => formatCategoryName(cat.on || ''));
                
                // Check if recommended card has better milestone benefits
                const userMilestone = userCardData.total_extra_benefits ?? userCardData.milestone_benefits_only ?? 0;
                const geniusMilestone = geniusCardData.total_extra_benefits ?? geniusCardData.milestone_benefits_only ?? 0;
                const hasBetterMilestone = geniusMilestone > userMilestone;
                
                const insightParts = [];
                if (winningCategories && winningCategories.length > 0) {
                  insightParts.push(winningCategories.join(' + '));
                }
                if (hasBetterMilestone) {
                  insightParts.push('milestone benefits');
                }
                
                return insightParts.length > 0 ? (
                  <div className="mt-4 sm:mt-5 p-3 sm:p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg">
                    <p className="text-xs sm:text-sm md:text-base text-emerald-900 font-semibold">
                      💡 <span className="ml-1">Most of your savings come from {insightParts.join(' + ')}.</span>
                    </p>
                  </div>
                ) : null;
              })()}
              
              {/* Total Annual Spend - Blended into Card Comparison Section */}
              <div className="mt-3 sm:mt-4 md:mt-5 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl sm:rounded-2xl border-2 border-blue-200 p-3 sm:p-4 md:p-5 w-full box-border overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 md:gap-6 w-full">
                    <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <CreditCard className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-5 text-blue-600" />
                      </div>
                      <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-blue-900 uppercase tracking-wide">Total Annual Spend</p>
                    </div>
                    <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-blue-900 mb-0.5 sm:mb-1">
                      ₹{totalUserSpendAnnual.toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs sm:text-sm md:text-base text-blue-700 font-medium">
                      ≈ ₹{totalUserSpend.toLocaleString('en-IN')} per month
                    </p>
                  </div>
                  <div className="bg-white/90 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 border border-blue-200 flex-shrink-0 w-full sm:w-auto box-border">
                    <p className="text-[9px] sm:text-[10px] md:text-xs text-blue-600 mb-1 font-medium">Based on your answers</p>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-green-600" />
                        <p className="text-[10px] sm:text-xs md:text-sm font-bold text-slate-900">
                          {Object.keys(responses).filter(key => responses[key] > 0).length} categories
                      </p>
                    </div>
                    </div>
                    <p className="text-[8px] sm:text-[9px] md:text-[10px] text-slate-500 mt-1">
                      This helps us recommend the best card for your spending pattern
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Step 3: How Savings Were Calculated - Detailed Breakdown */}
              <div className="mt-4 sm:mt-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-600 text-white text-[10px] sm:text-xs font-bold">3</div>
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wide">How Savings Were Calculated</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 hover:text-slate-600 cursor-help ml-1" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-sm font-semibold mb-1">Detailed Savings Breakdown</p>
                        <p className="text-xs text-muted-foreground">See exactly how Net Saving is calculated for each card. This breakdown shows Annual Savings from your spending, Milestone Benefits (vouchers/miles), and Joining Fees to give you the final Net Saving amount.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Accordion type="single" collapsible>
                <AccordionItem value="net-saving-breakdown" className="border-none">
                    <AccordionTrigger className="text-xs sm:text-sm text-slate-700 hover:text-slate-900 py-2">
                    <span className="flex items-center gap-2">
                        <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                      View detailed Net Saving calculation
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <div className="space-y-3 text-sm">
                      {[userCardData, geniusCardData].map((card, idx) => {
                        const cardNetSaving = idx === 0 ? userNetSaving : geniusNetSaving;
                        const annualSavings = idx === 0 ? userAnnualSavings : geniusAnnualSavings;
                        const extraBenefits = card.total_extra_benefits || card.milestone_benefits_only || 0;
                        const joiningFee = extractNumeric(card.joining_fees || card.joining_fee_text);
                  return (
                          <div key={idx} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                            <p className="font-semibold text-slate-900 mb-3">{idx === 0 ? 'Your Card' : 'Recommended Card'}</p>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-600">Annual Savings:</span>
                                <span className="font-medium text-slate-900">₹{annualSavings.toLocaleString('en-IN')}</span>
                      </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">Milestone Benefit:</span>
                                <span className="font-medium text-green-600">+ ₹{extraBenefits.toLocaleString('en-IN')}</span>
                        </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">Joining Fee:</span>
                                <span className="font-medium text-red-600">- ₹{joiningFee.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="border-t-2 border-slate-300 pt-2 mt-2 flex justify-between">
                                <span className="font-bold text-slate-900">Net Saving:</span>
                                <span className="font-black text-lg text-slate-900">₹{cardNetSaving.toLocaleString('en-IN')}</span>
                              </div>
                      </div>
                    </div>
                  );
                })}
              </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
                    </div>
            </section>


            {/* Data-backed highlights */}
            {comparisonRows.length > 0 && (
              <section className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-6 shadow-sm space-y-4 sm:space-y-6 overflow-hidden w-full max-w-full box-border">
                <div className="flex flex-col gap-1 sm:gap-2 w-full max-w-full">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold">{isUserWinner ? 'How your card stacks up' : 'Why switch to this card'}</h3>
                  <p className="text-xs sm:text-sm text-slate-500">Pulled directly from each card's actual fees, waivers, and milestone benefits.</p>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 hover:text-slate-600 cursor-help flex-shrink-0 mt-1" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-sm font-semibold mb-1">Detailed Fee & Benefit Comparison</p>
                          <p className="text-xs text-muted-foreground">Compare specific fees and benefits side-by-side. Green highlights show where the recommended card has an advantage, helping you understand exactly why it saves you more.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <TooltipProvider>
                  <div className="w-full max-w-full overflow-x-auto scrollbar-hide">
                    <div className="min-w-[500px] sm:min-w-0 overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto w-full box-border">
                    <div className="grid grid-cols-3 bg-gradient-to-r from-slate-50 to-slate-100 text-[10px] sm:text-xs font-bold text-slate-700 uppercase tracking-wide border-b-2 border-slate-200">
                      <div className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 md:py-5 border-r border-slate-300 text-left">Metric</div>
                      <div className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 md:py-5 text-center border-r border-slate-300">Your Card</div>
                      <div className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 md:py-5 text-center">Recommended Card</div>
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
                          <div className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 md:py-5 border-r border-slate-200">
                            <div className="flex items-start gap-1 sm:gap-1.5 md:gap-2">
                              <p className="font-semibold text-slate-900 text-xs sm:text-sm leading-tight">{row.label}</p>
                              {row.helper && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400 hover:text-blue-600 cursor-help mt-0.5 flex-shrink-0 transition-colors" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p className="text-sm">{row.helper}</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                      </div>
                    </div>
                          <div className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 md:py-5 border-r border-slate-200">
                            <div className="flex items-center justify-center min-w-0">
                              <span className="text-xs sm:text-sm break-words leading-tight text-center text-slate-900">{row.user}</span>
                </div>
                          </div>
                          <div className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 md:py-5">
                            <div className="flex items-center justify-center min-w-0">
                              <span className="text-xs sm:text-sm break-words leading-tight text-center text-slate-900">{row.genius}</span>
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
              <div className="max-w-4xl mx-auto w-full max-w-full box-border">
                <Accordion type="single" collapsible className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl w-full max-w-full box-border overflow-hidden">
                  <AccordionItem value="breakdown" className="border-none">
                    <AccordionTrigger className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 hover:no-underline">
                      <div className="flex items-center gap-2 sm:gap-3 w-full">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                          <h3 className="text-base sm:text-lg font-bold text-slate-900">Category-wise breakdown</h3>
                          <p className="text-xs sm:text-sm text-slate-500">See savings by spending category</p>
                            </div>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 hover:text-slate-600 cursor-help flex-shrink-0" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p className="text-sm font-semibold mb-1">Spending Category Analysis</p>
                                  <p className="text-xs text-muted-foreground">See how much each card saves you in different spending categories like groceries, travel, dining, etc. This helps you understand which card performs better for your specific spending habits.</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 sm:px-4 md:px-6 pb-4 sm:pb-6">
                      <div className="space-y-3 sm:space-y-4">
                        {categorySavings.map((category, idx) => {
                          const difference = category.geniusSaving - category.userSaving;
                          return (
                            <div key={idx} className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-sm">
                              {/* Category Header */}
                              <div className="flex items-center justify-between mb-3 sm:mb-4">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <span className="text-xl sm:text-2xl">{category.emoji}</span>
                                  <p className="font-semibold text-sm sm:text-base text-slate-900">{category.category}</p>
                                </div>
                              </div>
                              
                              {/* Numbers Display - No Progress Bars */}
                              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                {/* Your Card */}
                                <div className="bg-slate-50 rounded-lg p-3 sm:p-4 border border-slate-200">
                                  <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-[0.3em] mb-1.5 sm:mb-2">Your Card</p>
                                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900">
                                    ₹{category.userSaving.toLocaleString('en-IN')}
                                  </p>
                                  <p className="text-[9px] sm:text-[10px] text-slate-400 mt-1">Annual savings</p>
                                    </div>
                                
                                {/* Recommended Card */}
                                <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border-2 border-blue-200">
                                  <p className="text-[10px] sm:text-xs text-blue-600 uppercase tracking-[0.3em] mb-1.5 sm:mb-2 font-semibold">Recommended Card</p>
                                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-900">
                                    ₹{category.geniusSaving.toLocaleString('en-IN')}
                                  </p>
                                  <p className="text-[9px] sm:text-[10px] text-blue-500 mt-1">Annual savings</p>
                                  </div>
                              </div>
                              
                              {/* Increment/Difference Display */}
                              {difference !== 0 && (
                                <div className={`mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-200 flex items-center gap-2 sm:gap-3 ${
                                  difference > 0 ? 'text-green-700' : 'text-slate-700'
                                }`}>
                                  {difference > 0 ? (
                                    <>
                                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-green-600" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs sm:text-sm font-semibold text-green-700">
                                          Recommended card saves +₹{difference.toLocaleString('en-IN')} more
                                        </p>
                                        <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">
                                          in this category per year
                                        </p>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs sm:text-sm font-semibold text-slate-700">
                                          Your card saves ₹{Math.abs(difference).toLocaleString('en-IN')} more
                                        </p>
                                        <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">
                                          in this category per year
                                        </p>
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}
                              
                              {/* Equal Case */}
                              {difference === 0 && (
                                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-200 flex items-center gap-2 sm:gap-3 text-slate-600">
                                  <Award className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                  <p className="text-xs sm:text-sm font-medium">
                                    Both cards offer the same savings in this category
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}

            {/* Step 4: Take Action - CTA Section */}
            <section className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-lg w-full max-w-full box-border overflow-hidden">
              {/* Step Indicator */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-600 text-white text-xs sm:text-sm font-bold">4</div>
                <span className="text-xs sm:text-sm font-semibold text-slate-600 uppercase tracking-wide">Take Action</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 hover:text-slate-600 cursor-help ml-1" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm font-semibold mb-1">Next Steps</p>
                      <p className="text-xs text-muted-foreground">Apply for the recommended card to start saving more, or edit your spending inputs to see how different spending patterns affect your savings.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 mb-2">
                    {!isUserWinner && !isNegligibleDifference 
                      ? `Ready to save ₹${Math.abs(netSavingDifference).toLocaleString('en-IN')} more per year?`
                      : isUserWinner
                      ? 'Your current card is already great!'
                      : 'Both cards are excellent choices'
                    }
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600">
                    {!isUserWinner && !isNegligibleDifference
                      ? `Apply now and start maximizing your savings. The application takes less than 5 minutes.`
                      : isUserWinner
                      ? 'Keep using your current card to continue enjoying these savings.'
                      : 'Compare both options and choose the one that fits your lifestyle better.'
                    }
                  </p>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4 items-stretch w-full max-w-full">
                  {!isUserWinner && !isNegligibleDifference && (
                <Button
                  size="lg"
                      className="w-full md:flex-1 text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 hover:from-emerald-700 hover:via-green-600 hover:to-teal-600 hover:shadow-2xl hover:scale-[1.02] transition-all duration-200 px-6 sm:px-8 py-6 sm:py-7"
                      onClick={() => handleApplyNow(geniusCardData)}
                    >
                      <span className="hidden sm:inline">Apply Now & Save ₹{Math.abs(netSavingDifference).toLocaleString('en-IN')}/Year</span>
                      <span className="sm:hidden">Apply Now</span>
                      <ExternalLink className="w-5 h-5 sm:w-6 sm:h-6 ml-2 sm:ml-3 flex-shrink-0" />
                </Button>
                  )}
                  {isUserWinner && (
                    <Button
                      size="lg"
                      className="w-full md:flex-1 text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 hover:shadow-2xl hover:scale-[1.02] transition-all duration-200 px-6 sm:px-8 py-6 sm:py-7"
                      onClick={() => handleApplyNow(userCardData)}
                    >
                      <span className="hidden sm:inline">View Card Details</span>
                      <span className="sm:hidden">View Details</span>
                      <ExternalLink className="w-5 h-5 sm:w-6 sm:h-6 ml-2 sm:ml-3 flex-shrink-0" />
                    </Button>
                  )}
                <Button
                  variant="outline"
                  size="lg"
                    className="w-full md:w-auto text-sm sm:text-base md:text-lg px-4 sm:px-6 py-6 sm:py-7 border-2 font-semibold"
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
                    <span className="hidden sm:inline">Edit My Spending</span>
                  <span className="sm:hidden">Edit Spending</span>
                </Button>
                </div>
              </div>
            </section>
            
            {/* Sticky Bottom CTA - Mobile Only */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/98 backdrop-blur-md border-t-2 border-slate-200 p-3 sm:p-4 z-50 shadow-2xl md:hidden safe-area-inset-bottom w-full box-border overflow-hidden" style={{ paddingLeft: 'max(16px, env(safe-area-inset-left))', paddingRight: 'max(16px, env(safe-area-inset-right))' }}>
              <div className="flex gap-2 sm:gap-3 w-full max-w-full">
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