import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { ShoppingBag, Utensils, Fuel, Plane, Coffee, ShoppingCart, CreditCard, ChevronDown, TrendingUp, Sparkles, Loader2 } from "lucide-react";
import { cardService, SpendingData } from "@/services/cardService";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { SpendingInput } from "./ui/spending-input";
import { useNavigate } from "react-router-dom";
import { redirectToCardApplication } from "@/utils/redirectHandler";
import { toast } from "sonner";
import { enrichCardGeniusResults, CardGeniusResult } from "@/lib/cardGenius";
import { sanitizeHtml } from "@/lib/sanitize";

const formatCategoryName = (raw: string | null | undefined): string => {
  if (!raw) return "";
  return raw
    .toString()
    .trim()
    .replace(/[_]+/g, " ") // underscores -> spaces
    .replace(/\s+/g, " ") // collapse multiple spaces
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

interface CategoryQuestion {
  field: keyof SpendingData;
  question: string;
  emoji: string;
  min: number;
  max: number;
  step: number;
  showCurrency?: boolean;
  showRupee?: boolean;
  suffix?: string;
  optional?: boolean;
}

interface CategoryConfig {
  id: string;
  name: string;
  icon: any;
  color: string;
  questions: CategoryQuestion[];
  examples?: string; // Subtext with examples
}
const creditCardFacts = ["💳 The first credit card was introduced in 1950 by Diners Club!", "🌟 Cashback rewards can save you thousands annually if used smartly", "✈️ Travel cards can get you free flights worth lakhs every year", "🛡️ Credit cards offer better fraud protection than debit cards", "💰 Premium cards often pay for themselves through benefits alone", "🎁 Welcome bonuses can be worth ₹10,000+ on premium cards", "⚡ Using 30% or less of your credit limit boosts your credit score", "🏨 Hotel cards can save you up to 50% on premium stays", "🍽️ Dining cards offer up to 20% savings on restaurant bills", "⛽ Fuel surcharge waivers can save ₹4,000+ annually", "📱 Contactless payments are 10x faster than cash transactions", "🎯 Category-specific cards can give 5-10% returns on spending", "💎 Airport lounge access saves ₹2,000+ per visit", "🔒 EMI conversions at 0% interest can save huge amounts", "🎊 Milestone benefits reward you for regular spending", "🌐 International cards save 3-5% on forex markup fees", "⭐ Co-branded cards offer exclusive brand discounts up to 30%", "🎪 Entertainment cards get you buy-1-get-1 movie tickets", "💡 Smart card users save an average of ₹50,000+ yearly", "🚀 The right card can turn everyday spending into wealth!"];
const categories: CategoryConfig[] = [{
  id: 'shopping',
  name: 'Shopping',
  icon: ShoppingBag,
  color: 'text-pink-500',
  examples: 'Amazon, Flipkart',
  questions: [{
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
  }]
}, {
  id: 'bills',
  name: 'Paying Bills',
  icon: CreditCard,
  color: 'text-indigo-500',
  examples: 'Electricity, DTH',
  questions: [{
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
    max: 10000,
    step: 100
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
    step: 5000
  }]
}, {
  id: 'fuel',
  name: 'Fuel',
  icon: Fuel,
  color: 'text-blue-500',
  examples: 'Petrol, diesel',
  questions: [{
    field: 'fuel',
    question: 'How much do you spend on fuel in a month?',
    emoji: '⛽',
    min: 0,
    max: 20000,
    step: 500
  }]
}, {
  id: 'travel',
  name: 'Flight & Hotel',
  icon: Plane,
  color: 'text-purple-500',
  examples: 'Travel bookings, hotels',
  questions: [{
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
    suffix: ' visits',
    optional: true
  }, {
    field: 'international_lounge_usage_quarterly',
    question: 'Plus, what about international airport lounges?',
    emoji: '🌎',
    min: 0,
    max: 50,
    step: 1,
    showCurrency: false,
    suffix: ' visits',
    optional: true
  }]
}, {
  id: 'food_delivery',
  name: 'Food Delivery',
  icon: Coffee,
  color: 'text-red-500',
  examples: 'Swiggy, Zomato',
  questions: [{
    field: 'online_food_ordering',
    question: 'How much do you spend on food delivery apps in a month?',
    emoji: '🛵🍜',
    min: 0,
    max: 30000,
    step: 500
  }]
}, {
  id: 'grocery',
  name: 'Grocery',
  icon: ShoppingCart,
  color: 'text-green-500',
  examples: 'Blinkit, Zepto',
  questions: [{
    field: 'grocery_spends_online',
    question: 'How much do you spend on groceries (Blinkit, Zepto etc.) every month?',
    emoji: '🥦',
    min: 0,
    max: 50000,
    step: 500
  }]
}, {
  id: 'dining',
  name: 'Dining Out',
  icon: Utensils,
  color: 'text-orange-500',
  examples: 'Restaurants, cafes',
  questions: [{
    field: 'dining_or_going_out',
    question: 'How much do you spend on dining out in a month?',
    emoji: '🥗',
    min: 0,
    max: 30000,
    step: 500
  }]
}];
const CategoryCardGenius = () => {
  const navigate = useNavigate();
  const resultsRef = useRef<HTMLDivElement>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showQuestions, setShowQuestions] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CardGeniusResult[]>([]);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [cardCatalog, setCardCatalog] = useState<any[]>([]);
  const [cardCatalogLoading, setCardCatalogLoading] = useState(false);

  // Rotate facts during loading
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setCurrentFactIndex(prev => (prev + 1) % creditCardFacts.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchCatalog = async () => {
      const baseParams = {
        slug: "",
        banks_ids: [],
        card_networks: [],
        annualFees: "",
        credit_score: "",
        sort_by: "",
        free_cards: "",
        eligiblityPayload: {},
        cardGeniusPayload: []
      };

      try {
        setCardCatalogLoading(true);
        const response = await cardService.getCardListing(baseParams, controller.signal);
        if (!isMounted) return;

        const data = Array.isArray(response?.data?.cards)
          ? response.data.cards
          : Array.isArray(response?.data)
            ? response.data
            : [];
        setCardCatalog(Array.isArray(data) ? data : []);
      } catch (error: any) {
        if (error?.name === 'AbortError') {
          return;
        }
        console.error('Failed to preload card catalog:', error);
      } finally {
        if (isMounted) {
          setCardCatalogLoading(false);
        }
      }
    };

    fetchCatalog();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);
  // Get all questions from selected categories
  const getAllQuestions = () => {
    if (selectedCategories.length === 0) return [];
    const allQuestions: Array<{ question: CategoryQuestion; categoryId: string; categoryName: string }> = [];
    selectedCategories.forEach(categoryId => {
      const category = categories.find(c => c.id === categoryId);
      if (category) {
        category.questions.forEach(q => {
          allQuestions.push({
            question: q,
            categoryId: categoryId,
            categoryName: category.name
          });
        });
      }
    });
    return allQuestions;
  };

  const allQuestions = getAllQuestions();
  const currentQuestionData = allQuestions[currentQuestionIndex];
  const currentQuestion = currentQuestionData?.question;

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategories(prev => {
      const isSelected = prev.includes(categoryId);
      if (isSelected) {
        // Deselect category
        const newSelection = prev.filter(id => id !== categoryId);
        // Clear responses for this category
        const category = categories.find(c => c.id === categoryId);
        if (category) {
          setResponses(prevResponses => {
            const newResponses = { ...prevResponses };
            category.questions.forEach(q => {
              delete newResponses[q.field];
            });
            return newResponses;
          });
        }
        // Reset questions if no categories selected
        if (newSelection.length === 0) {
          setShowQuestions(false);
          setCurrentQuestionIndex(0);
          setResults([]);
        } else {
          // Recalculate question index
          const newAllQuestions = newSelection.flatMap(catId => {
            const cat = categories.find(c => c.id === catId);
            return cat ? cat.questions.map(q => ({ question: q, categoryId: catId, categoryName: cat.name })) : [];
          });
          // Adjust current question index if needed
          if (currentQuestionIndex >= newAllQuestions.length) {
            setCurrentQuestionIndex(Math.max(0, newAllQuestions.length - 1));
          }
        }
        return newSelection;
      } else {
        // Select category
        const newSelection = [...prev, categoryId];
        // Start questions if this is the first category
        if (prev.length === 0) {
          setShowQuestions(true);
          setCurrentQuestionIndex(0);
          setResponses({});
          setResults([]);
        }
        return newSelection;
      }
    });
  };
  const handleNext = () => {
    if (allQuestions.length === 0) return;
    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleCalculate();
    }
  };
  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  const handleCalculate = async () => {
    if (selectedCategories.length === 0) {
      toast.error("Please select at least one category.");
      return;
    }

    // Check if at least one required question has a value
    const requiredQuestions = allQuestions
      .filter(qd => !qd.question.optional)
      .map(qd => qd.question);
    
    const questionsToCheck = requiredQuestions.length > 0 ? requiredQuestions : allQuestions.map(qd => qd.question);
    const hasValue = questionsToCheck.some(q => {
      const val = responses[q.field];
      return typeof val === 'number' && val > 0;
    });

    if (!hasValue) {
      toast.error("Please fill at least one required field before viewing your results.");
      setCurrentQuestionIndex(0);
      return;
    }
    setLoading(true);
    setCurrentFactIndex(0);
    try {
      const payload: SpendingData = {
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
        ...responses
      };

      const response = await cardService.calculateCardGenius(payload);
      const savingsArray = Array.isArray(response?.data?.savings)
        ? response.data.savings
        : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.cards)
            ? response.data.cards
            : [];

      if (!savingsArray.length) {
        toast.error("We couldn't find matching cards. Try adjusting your inputs.");
        setResults([]);
        return;
      }

      const enriched = await enrichCardGeniusResults({
        savings: savingsArray,
        responses,
        fetchDetails: true
      });

      const topCards = enriched.filter(card => card.net_savings > 0).slice(0, 3);

      if (!topCards.length) {
        toast.error("No high-value cards found for this pattern. Try different inputs.");
        setResults([]);
        return;
      }

      setResults(topCards);

        setTimeout(() => {
          resultsRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }, 100);
    } catch (error) {
      console.error('Error calculating:', error);
      toast.error("Something went wrong while crunching the numbers. Please retry.");
    } finally {
      setLoading(false);
    }
  };
  const resetCalculator = () => {
    setSelectedCategories([]);
    setShowQuestions(false);
    setCurrentQuestionIndex(0);
    setResponses({});
    setResults([]);
  };
  const getTotalSpending = () => {
    return Object.values(responses).reduce((sum, val) => sum + val, 0);
  };
  const findCatalogMatch = (card: any) => {
    if (!Array.isArray(cardCatalog) || cardCatalog.length === 0) {
      return null;
    }

    const probes = [card.seo_card_alias, card.card_alias, card.slug, card.card_name, card.name]
      .filter(Boolean)
      .map((value: string) => value.toString().trim().toLowerCase());

    return cardCatalog.find((catalogCard: any) => {
      const catalogAliases = [catalogCard.seo_card_alias, catalogCard.card_alias, catalogCard.slug, catalogCard.name]
        .filter(Boolean)
        .map((value: string) => value.toString().trim().toLowerCase());

      return catalogAliases.some(alias => probes.includes(alias));
    }) || null;
  };
  const handleViewDetails = (card: any) => {
    try {
      const matchingCard = findCatalogMatch(card);
      const alias = matchingCard?.seo_card_alias || matchingCard?.card_alias || matchingCard?.slug || card.seo_card_alias || card.card_alias || card.slug;
      if (alias) {
        navigate(`/cards/${alias}`);
      } else {
        console.warn('No alias found to navigate', {
          card
        });
      }
    } catch (error) {
      console.error('Error navigating to card details:', error);
    }
  };
  const handleApplyNow = (card: any) => {
    try {
      const matchingCard = findCatalogMatch(card) || card;
      const success = redirectToCardApplication(matchingCard, {
        cardName: matchingCard.card_name || matchingCard.name || card.card_name
      });

      if (!success) {
        toast.error("Unable to open the bank site. Please allow pop-ups or try again later.");
        if (!cardCatalogLoading) {
        handleViewDetails(card);
        }
      }
    } catch (error) {
      console.error('Error applying for card:', error);
      handleViewDetails(card);
    }
  };
  return <section className="pt-20 sm:pt-28 pb-8 sm:pb-12 md:pb-20 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <div className="section-shell px-4 sm:px-6">
        {/* Header - Always visible */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 sm:mb-3 md:mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent px-2">
            Find India's Best Credit Cards for Your Spending Style
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-2xl sm:max-w-4xl mx-auto px-4 text-center leading-relaxed">
            Pick a category, answer a few questions, and see how much you could save each month
          </p>
        </div>

        {/* Category Selection - Always visible */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8 md:mb-12">
          {categories.map(category => {
            const isSelected = selectedCategories.includes(category.id);
            return (
              <button 
                key={category.id} 
                onClick={() => handleCategorySelect(category.id)} 
                className={`p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl md:rounded-2xl bg-card shadow-md hover:shadow-xl transition-all text-center group relative overflow-hidden touch-target min-h-[100px] sm:min-h-[110px] md:min-h-[130px] flex flex-col items-center justify-center ${isSelected ? 'ring-2 ring-primary shadow-glow bg-primary/5' : ''}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-20 w-5 h-5 sm:w-6 sm:h-6 bg-primary rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white text-[10px] sm:text-xs md:text-sm font-bold">✓</span>
                  </div>
                )}
                <category.icon className={`w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 mx-auto mb-1.5 sm:mb-2 md:mb-3 ${category.color} group-hover:scale-110 transition-transform relative z-10`} />
                <p className="text-[10px] sm:text-xs md:text-sm font-semibold relative z-10 leading-tight px-1 mb-0.5 sm:mb-1">{category.name}</p>
                {category.examples && (
                  <p className="text-[8px] sm:text-[9px] md:text-[10px] text-muted-foreground relative z-10 leading-tight px-1 whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                    {category.examples}
                  </p>
                )}
              </button>
            );
          })}
        </div>
        {selectedCategories.length > 0 && (
          <div className="mb-4 sm:mb-6 md:mb-8">
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <span className="text-xs sm:text-sm md:text-base font-semibold text-muted-foreground whitespace-nowrap flex-shrink-0">Selected:</span>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                {selectedCategories.map(catId => {
                  const category = categories.find(c => c.id === catId);
                  return category ? (
                    <Badge key={catId} variant="secondary" className="px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs md:text-sm whitespace-nowrap flex-shrink-0">
                      {category.name}
                    </Badge>
                  ) : null;
                })}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetCalculator}
                className="text-[10px] sm:text-xs md:text-sm whitespace-nowrap flex-shrink-0 h-7 sm:h-8 px-2 sm:px-3"
              >
                Clear All
              </Button>
            </div>
          </div>
        )}

        {/* How It Works - Moved below categories, lighter design */}
        {!showQuestions && results.length === 0 && (
          <div className="max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
            <div className="bg-muted/30 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 border border-border/50">
              <h3 className="text-xs sm:text-sm font-semibold text-foreground mb-2 sm:mb-3 text-center">
                How it works
              </h3>
              <p className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-muted-foreground text-center whitespace-nowrap overflow-x-auto scrollbar-hide">
                1️⃣ Choose category → 2️⃣ Answer questions → 3️⃣ See top cards
              </p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {results && results.length > 0 ? <div ref={resultsRef} className="animate-fade-in scroll-mt-20">
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-green-50 text-green-700 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full mb-3 sm:mb-4 border border-green-200">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-bold text-xs sm:text-sm md:text-base">Your Personalized Results</span>
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3">Top 3 Cards Just For You</h3>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground px-2">
                Based on your ₹{getTotalSpending().toLocaleString()} monthly spending across {selectedCategories.length} {selectedCategories.length === 1 ? 'category' : 'categories'}
              </p>
            </div>

            <div className="cards-grid mb-6 sm:mb-8 md:mb-12 gap-4 sm:gap-6">
              {results.map((card: any, index: number) => <div key={card.id || index} className="bg-card rounded-xl sm:rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary/20 relative">
                  {index === 0 && <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold shadow-lg">
                        🏆 Best Match
                      </Badge>
                    </div>}
                  
                  {/* Card Image */}
                  <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden bg-gradient-to-br from-muted to-muted/50">
                    <img src={card.card_bg_image} alt={card.card_name} className="w-full h-full object-contain p-4 sm:p-6 md:p-8 hover:scale-105 transition-transform duration-500" />
                  </div>

                  <div className="p-4 sm:p-5 md:p-6">
                    {/* Card Name */}
                    <h3 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 min-h-[2.5rem] sm:min-h-[3rem] line-clamp-2">{card.card_name}</h3>

                    {/* Savings Highlight - Prominent */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-2 border-green-300 dark:border-green-700 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 mb-3 sm:mb-4 shadow-md">
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                          <span className="text-xs sm:text-sm font-bold text-green-800 dark:text-green-300">You'll Save</span>
                        </div>
                        <Badge variant="secondary" className="text-[10px] sm:text-xs">Per Year</Badge>
                      </div>
                      <p className="text-2xl sm:text-3xl md:text-4xl font-black text-green-600 dark:text-green-400 mb-1.5 sm:mb-2">
                        ₹{card.net_savings?.toLocaleString() || "0"}
                      </p>
                      <div className="space-y-0.5 sm:space-y-1 text-[10px] sm:text-xs text-green-700 dark:text-green-300 font-medium">
                        {card.total_savings_yearly && card.total_savings_yearly > 0 ? (
                          <p>Base savings: ₹{card.total_savings_yearly.toLocaleString()}</p>
                        ) : null}
                        {card.total_extra_benefits && card.total_extra_benefits > 0 ? <p>Milestones: +₹{card.total_extra_benefits.toLocaleString()}</p> : null}
                        {card.airport_lounge_value && card.airport_lounge_value > 0 && (
                          <>
                            {card.domestic_lounge_value > 0 && (
                              <p>Domestic lounges: +₹{card.domestic_lounge_value.toLocaleString()} ({Math.min(responses['domestic_lounge_usage_quarterly'] || 0, card.domestic_lounges_unlocked || 0)} visits × ₹750)</p>
                            )}
                            {card.international_lounge_value > 0 && (
                              <p>International lounges: +₹{card.international_lounge_value.toLocaleString()} ({Math.min(responses['international_lounge_usage_quarterly'] || 0, card.international_lounges_unlocked || 0)} visits × ₹1,250)</p>
                            )}
                          </>
                        )}
                        {card.joining_fees && card.joining_fees !== 0 ? <p>Fees deducted: -₹{card.joining_fees.toLocaleString()}</p> : null}
                      </div>
                    </div>

                    {/* Fees */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 p-3 sm:p-4 bg-muted/50 rounded-lg mb-3 sm:mb-4">
                      <div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">Joining Fee</p>
                        <p className="font-bold text-xs sm:text-sm">
                          {card.joining_fees === 0 ? <span className="text-green-600">FREE</span> : `₹${card.joining_fees?.toLocaleString()}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">Annual Fee</p>
                        <p className="font-bold text-xs sm:text-sm">
                          {card.annual_fees === 0 ? <span className="text-green-600">FREE</span> : `₹${card.annual_fees?.toLocaleString()}`}
                        </p>
                      </div>
                    </div>

                  {/* Savings Breakdown */}
                  {(card.spending_breakdown && Object.keys(card.spending_breakdown).length > 0) || (card.airport_lounge_value && card.airport_lounge_value > 0) ? (
                    <details className="mb-4 bg-muted/30 rounded-lg p-3">
                      <summary className="cursor-pointer text-sm font-bold text-primary hover:text-primary/80 flex items-center gap-2">
                        <ChevronDown className="w-4 h-4" />
                        See Detailed Savings Breakdown
                      </summary>
                      <div className="mt-3 space-y-3">
                        {/* Spending Category Breakdown */}
                        {card.spending_breakdown && Object.entries(card.spending_breakdown).map(([key, data]: [string, any]) => {
                          const savingsValue = Number(data?.savings ?? data?.total_savings ?? 0);
                          const spendValue = Number(data?.spend ?? data?.spending ?? 0);
                          if (!savingsValue && !spendValue) return null;
                          
                          // Always format category name nicely (API may return underscored keys)
                          const rawName =
                            typeof data?.on === "string" && data.on.trim().length > 0
                              ? data.on
                              : key;
                          const categoryName = formatCategoryName(rawName);
                          
                          return (
                            <div key={key} className="bg-white dark:bg-muted/50 rounded-lg p-4 border border-border shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <h4 className="text-sm font-semibold text-foreground mb-1">
                                    {categoryName}
                                  </h4>
                                  {spendValue > 0 && (
                                    <p className="text-xs text-muted-foreground">
                                      On ₹{spendValue.toLocaleString()} spend
                                    </p>
                                  )}
                                </div>
                                <div className="text-right ml-4">
                                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                  +₹{savingsValue.toLocaleString()}
                                </span>
                              </div>
                              </div>
                              
                              {(() => {
                                if (!Array.isArray(data?.explanation)) return null;
                                
                                // Check if this is a lounge category (exclude from monthly addition)
                                const categoryLower = categoryName.toLowerCase();
                                const keyLower = key.toLowerCase();
                                const isLounge = 
                                  categoryLower.includes('lounge') ||
                                  keyLower.includes('lounge');
                                
                                const meaningfulBlocks = data.explanation
                                  .filter((block: any) => {
                                    if (typeof block !== 'string') return false;
                                    const trimmed = block.trim();
                                    // Filter out empty strings, "0", "zero", and any string that's just whitespace or numbers
                                    return trimmed !== '' && 
                                           trimmed !== '0' && 
                                           trimmed.toLowerCase() !== 'zero' &&
                                           !/^\d+$/.test(trimmed); // Filter out strings that are just numbers
                                  });
                                if (!meaningfulBlocks.length) return null;
                                
                                // Process blocks to add "monthly" if not lounge category
                                const processedBlocks = meaningfulBlocks.map((block: string) => {
                                  if (isLounge) {
                                    return block; // Don't modify lounge explanations
                                  }
                                  // Add "monthly" before "spend" or "spending" for all other categories (including flight & hotel)
                                  return block
                                    .replace(/On spend of/gi, 'On monthly spend of')
                                    .replace(/On spending of/gi, 'On monthly spending of')
                                    .replace(/on spend of/gi, 'on monthly spend of')
                                    .replace(/on spending of/gi, 'on monthly spending of');
                                });
                                
                                const combinedHtml = processedBlocks
                                  .map(block => `<p>${block}</p>`)
                                  .join('');
                                return (
                                  <div className="mt-3 pt-3 border-t border-muted/50">
                                    <div 
                                      className="text-xs text-muted-foreground leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-strong:text-foreground prose-strong:font-semibold"
                                      dangerouslySetInnerHTML={{ 
                                        __html: sanitizeHtml(combinedHtml) 
                                      }}
                                    />
                                  </div>
                                );
                              })()}
                            </div>
                          );
                        })}
                        
                        {/* Airport Lounge Breakdown */}
                        {card.airport_lounge_value && card.airport_lounge_value > 0 && (
                          <div className="mt-4 pt-4 border-t-2 border-primary/30">
                            <h3 className="text-sm font-bold text-primary mb-3 uppercase tracking-wide">
                              Airport Lounge Benefits
                            </h3>
                            
                            <div className="space-y-3">
                              {card.domestic_lounge_value > 0 && (
                                <div className="bg-white dark:bg-muted/50 rounded-lg p-4 border border-border shadow-sm">
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                      <h4 className="text-sm font-semibold text-foreground mb-1">
                                        Domestic Airport Lounges 🇮🇳
                                      </h4>
                                      <p className="text-xs text-muted-foreground">
                                        {Math.min(responses['domestic_lounge_usage_quarterly'] || 0, card.domestic_lounges_unlocked || 0)} visits × ₹750
                                        {card.domestic_lounges_unlocked && card.domestic_lounges_unlocked > 0 && (
                                          <span className="ml-1">(Card allows up to {card.domestic_lounges_unlocked} visits)</span>
                                        )}
                                      </p>
                                    </div>
                                    <div className="text-right ml-4">
                                      <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                        +₹{card.domestic_lounge_value.toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {card.international_lounge_value > 0 && (
                                <div className="bg-white dark:bg-muted/50 rounded-lg p-4 border border-border shadow-sm">
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                      <h4 className="text-sm font-semibold text-foreground mb-1">
                                        International Airport Lounges 🌎
                                      </h4>
                                      <p className="text-xs text-muted-foreground">
                                        {Math.min(responses['international_lounge_usage_quarterly'] || 0, card.international_lounges_unlocked || 0)} visits × ₹1,250
                                        {card.international_lounges_unlocked && card.international_lounges_unlocked > 0 && (
                                          <span className="ml-1">(Card allows up to {card.international_lounges_unlocked} visits)</span>
                                        )}
                                      </p>
                                    </div>
                                    <div className="text-right ml-4">
                                      <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                        +₹{card.international_lounge_value.toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {card.airport_lounge_value > 0 && (
                                <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-lg p-4 border-2 border-purple-200 dark:border-purple-800">
                                  <div className="flex justify-between items-center">
                                    <span className="font-semibold text-foreground">
                                      Total Lounge Value
                                    </span>
                                    <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                                      +₹{card.airport_lounge_value.toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </details>
                  ) : null}

                    {/* CTA Buttons */}
                    <div className="space-y-2">
                      <Button className="w-full shadow-lg text-sm sm:text-base" size="lg" onClick={() => handleApplyNow(card)}>
                        Apply Now
                      </Button>
                      <Button variant="outline" className="w-full text-xs sm:text-sm" size="sm" onClick={() => handleViewDetails(card)}>
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>)}
            </div>
          </div> : loading ? (/* Loading State with Fun Facts */
      <div className="max-w-2xl mx-auto text-center animate-fade-in px-4">
            <div className="bg-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl border-2 border-primary/20">
              <div className="mb-4 sm:mb-6 md:mb-8">
                <Loader2 className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto text-primary animate-spin" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4">Crunching the numbers...</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 md:mb-8 px-2">
                Our AI is analyzing thousands of card combinations to find your perfect match
              </p>
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 min-h-[80px] sm:min-h-[100px] flex items-center justify-center">
                <p className="text-sm sm:text-base md:text-lg font-medium text-foreground animate-fade-in px-2">
                  {creditCardFacts[currentFactIndex]}
                </p>
              </div>
            </div>
          </div>) : showQuestions && selectedCategories.length > 0 && currentQuestion ? (/* Questions Section */
      <div className="max-w-3xl mx-auto animate-fade-in px-4">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                  <span className="text-sm font-semibold text-muted-foreground">
                    Question {currentQuestionIndex + 1} of {allQuestions.length}
                  </span>
                  {currentQuestionData && (
                    <Badge variant="outline" className="text-xs">
                      {currentQuestionData.categoryName}
                    </Badge>
                  )}
                </div>
                <span className="text-sm font-bold text-primary">
                  {Math.round((currentQuestionIndex + 1) / allQuestions.length * 100)}% Complete
                </span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-primary via-secondary to-accent transition-all duration-500 shadow-lg" style={{
              width: `${(currentQuestionIndex + 1) / allQuestions.length * 100}%`
            }} />
              </div>
            </div>

            {/* Question */}
            <SpendingInput question={currentQuestion.question} emoji={currentQuestion.emoji} value={responses[currentQuestion.field] || 0} onChange={value => setResponses(prev => ({
          ...prev,
          [currentQuestion.field]: value
        }))} min={currentQuestion.min} max={currentQuestion.max} step={currentQuestion.step} showCurrency={currentQuestion.showCurrency ?? true} showRupee={currentQuestion.showRupee ?? true} suffix={currentQuestion.suffix || ""} />

            {/* Navigation */}
            <div className="flex gap-2 sm:gap-3 md:gap-4 mt-6 sm:mt-8">
              <Button variant="outline" size="lg" onClick={handlePrev} disabled={currentQuestionIndex === 0} className="flex-1 text-sm sm:text-base h-11 sm:h-12">
                Previous
              </Button>
              <Button size="lg" onClick={handleNext} disabled={loading} className="flex-1 shadow-lg text-sm sm:text-base h-11 sm:h-12">
                {currentQuestionIndex === allQuestions.length - 1 ? <>
                    <span className="hidden sm:inline">Show My Results</span>
                    <span className="sm:hidden">Results</span>
                    <Sparkles className="ml-2 w-4 h-4" />
                  </> : 'Next'}
              </Button>
            </div>

            <div className="text-center mt-4 sm:mt-6">
              <button onClick={resetCalculator} className="text-muted-foreground hover:text-primary font-medium transition-colors text-xs sm:text-sm">
                ← Change Categories
              </button>
            </div>
          </div>) : null}
      </div>
    </section>;
};
export default CategoryCardGenius;