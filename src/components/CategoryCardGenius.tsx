import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { ShoppingBag, Utensils, Fuel, Plane, Coffee, ShoppingCart, CreditCard, ChevronDown, TrendingUp, Sparkles, Loader2 } from "lucide-react";
import { cardService, SpendingData } from "@/services/cardService";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { SpendingInput } from "./ui/spending-input";

const creditCardFacts = [
  "💳 The first credit card was introduced in 1950 by Diners Club!",
  "🌟 Cashback rewards can save you thousands annually if used smartly",
  "✈️ Travel cards can get you free flights worth lakhs every year",
  "🛡️ Credit cards offer better fraud protection than debit cards",
  "💰 Premium cards often pay for themselves through benefits alone",
  "🎁 Welcome bonuses can be worth ₹10,000+ on premium cards",
  "⚡ Using 30% or less of your credit limit boosts your credit score",
  "🏨 Hotel cards can save you up to 50% on premium stays",
  "🍽️ Dining cards offer up to 20% savings on restaurant bills",
  "⛽ Fuel surcharge waivers can save ₹4,000+ annually",
  "📱 Contactless payments are 10x faster than cash transactions",
  "🎯 Category-specific cards can give 5-10% returns on spending",
  "💎 Airport lounge access saves ₹2,000+ per visit",
  "🔒 EMI conversions at 0% interest can save huge amounts",
  "🎊 Milestone benefits reward you for regular spending",
  "🌐 International cards save 3-5% on forex markup fees",
  "⭐ Co-branded cards offer exclusive brand discounts up to 30%",
  "🎪 Entertainment cards get you buy-1-get-1 movie tickets",
  "💡 Smart card users save an average of ₹50,000+ yearly",
  "🚀 The right card can turn everyday spending into wealth!"
];

const categories = [
  { 
    id: 'shopping', 
    name: 'Shopping', 
    icon: ShoppingBag, 
    color: 'text-pink-500',
    questions: [
      { field: 'amazon_spends', question: 'How much do you spend on Amazon in a month?', emoji: '🛍️', min: 0, max: 100000, step: 500 },
      { field: 'flipkart_spends', question: 'How much do you spend on Flipkart in a month?', emoji: '📦', min: 0, max: 100000, step: 500 },
      { field: 'other_online_spends', question: 'How much do you spend on other online shopping?', emoji: '💸', min: 0, max: 50000, step: 500 },
      { field: 'other_offline_spends', question: 'How much do you spend at local shops or offline stores monthly?', emoji: '🏪', min: 0, max: 100000, step: 1000 },
    ]
  },
  { 
    id: 'bills', 
    name: 'Paying Bills', 
    icon: CreditCard, 
    color: 'text-indigo-500',
    questions: [
      { field: 'mobile_phone_bills', question: 'How much do you spend on recharging your mobile or Wi-Fi monthly?', emoji: '📱', min: 0, max: 10000, step: 100 },
      { field: 'electricity_bills', question: "What's your average monthly electricity bill?", emoji: '⚡️', min: 0, max: 10000, step: 100 },
      { field: 'water_bills', question: 'And what about your monthly water bill?', emoji: '💧', min: 0, max: 5000, step: 100 },
      { field: 'insurance_health_annual', question: 'How much do you pay for health or term insurance annually?', emoji: '🛡️', min: 0, max: 100000, step: 5000 },
    ]
  },
  { 
    id: 'fuel', 
    name: 'Fuel', 
    icon: Fuel, 
    color: 'text-blue-500',
    questions: [
      { field: 'fuel', question: 'How much do you spend on fuel in a month?', emoji: '⛽', min: 0, max: 20000, step: 500 },
    ]
  },
  { 
    id: 'travel', 
    name: 'Flight & Hotel', 
    icon: Plane, 
    color: 'text-purple-500',
    questions: [
      { field: 'flights_annual', question: 'How much do you spend on flights in a year?', emoji: '✈️', min: 0, max: 500000, step: 5000 },
      { field: 'hotels_annual', question: 'How much do you spend on hotel stays in a year?', emoji: '🛌', min: 0, max: 300000, step: 5000 },
      { field: 'domestic_lounge_usage_quarterly', question: 'How often do you visit domestic airport lounges in a year?', emoji: '🇮🇳', min: 0, max: 50, step: 1 },
      { field: 'international_lounge_usage_quarterly', question: 'Plus, what about international airport lounges?', emoji: '🌎', min: 0, max: 50, step: 1 },
    ]
  },
  { 
    id: 'food_delivery', 
    name: 'Food Delivery', 
    icon: Coffee, 
    color: 'text-red-500',
    questions: [
      { field: 'online_food_ordering', question: 'How much do you spend on food delivery apps in a month?', emoji: '🛵🍜', min: 0, max: 30000, step: 500 },
    ]
  },
  { 
    id: 'grocery', 
    name: 'Grocery', 
    icon: ShoppingCart, 
    color: 'text-green-500',
    questions: [
      { field: 'grocery_spends_online', question: 'How much do you spend on groceries (Blinkit, Zepto etc.) every month?', emoji: '🥦', min: 0, max: 50000, step: 500 },
    ]
  },
  { 
    id: 'dining', 
    name: 'Dining Out', 
    icon: Utensils, 
    color: 'text-orange-500',
    questions: [
      { field: 'dining_or_going_out', question: 'How much do you spend on dining out in a month?', emoji: '🥗', min: 0, max: 30000, step: 500 },
    ]
  },
];

const CategoryCardGenius = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showQuestions, setShowQuestions] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);

  // Rotate facts during loading
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setCurrentFactIndex((prev) => (prev + 1) % creditCardFacts.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const selectedCategoryData = categories.find(c => c.id === selectedCategory);
  const currentQuestion = selectedCategoryData?.questions[currentQuestionIndex];

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowQuestions(true);
    setCurrentQuestionIndex(0);
    setResponses({});
    setResults(null);
  };

  const handleNext = () => {
    if (!selectedCategoryData) return;
    
    if (currentQuestionIndex < selectedCategoryData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Submit to API
      handleCalculate();
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleCalculate = async () => {
    setLoading(true);
    setCurrentFactIndex(0);
    try {
      // Prepare the payload with all fields set to 0 except user inputs
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
      
      if (response.status === 'success' && response.data?.savings) {
        // The API returns data.savings array, sort by total_savings_yearly and get top 3
        const sortedCards = response.data.savings
          .sort((a: any, b: any) => (b.total_savings_yearly || 0) - (a.total_savings_yearly || 0))
          .slice(0, 3);
        
        // Fetch full card details for each card to get card_bg_image
        const cardsWithDetails = await Promise.all(
          sortedCards.map(async (card: any) => {
            try {
              // Use card_alias from the API response
              const cardAlias = card.card_alias || card.seo_card_alias;
              if (!cardAlias) {
                console.warn('No card alias found for card:', card);
                return {
                  ...card,
                  card_bg_image: '/placeholder.svg',
                  annual_fees: card.joining_fees || '0',
                  category_savings: card.spending_breakdown || {}
                };
              }

              const detailsResponse = await cardService.getCardDetails(cardAlias);
              const cardDetails = detailsResponse.data?.[0] || {};
              
              return {
                ...card,
                card_name: card.card_name || cardDetails.name || cardDetails.card_name,
                card_bg_image: cardDetails.card_bg_image || card.card_bg_image || '/placeholder.svg',
                annual_fees: cardDetails.annual_fee_text || card.joining_fees || '0',
                joining_fees: card.joining_fees || cardDetails.joining_fee_text || '0',
                category_savings: card.spending_breakdown || {}
              };
            } catch (error) {
              console.error(`Failed to fetch details for ${card.card_alias || card.seo_card_alias}:`, error);
              return {
                ...card,
                card_bg_image: card.card_bg_image || '/placeholder.svg',
                annual_fees: card.joining_fees || '0',
                category_savings: card.spending_breakdown || {}
              };
            }
          })
        );
        
        setResults(cardsWithDetails);
      }
    } catch (error) {
      console.error('Error calculating:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetCalculator = () => {
    setSelectedCategory(null);
    setShowQuestions(false);
    setCurrentQuestionIndex(0);
    setResponses({});
    setResults(null);
  };

  const getTotalSpending = () => {
    return Object.values(responses).reduce((sum, val) => sum + val, 0);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <div className="container mx-auto px-4">
        {/* Header - Always visible */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">Smart Card Calculator</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Find Your Perfect Card in 30 Seconds
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tell us where you spend, and we'll calculate exactly how much you can save with the right credit card
          </p>
        </div>

        {/* Category Selection - Always visible */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.id)}
              className={`p-6 rounded-2xl bg-card shadow-md hover:shadow-xl transition-all text-center group relative overflow-hidden ${
                selectedCategory === category.id ? 'ring-2 ring-primary shadow-glow' : ''
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <category.icon className={`w-8 h-8 mx-auto mb-3 ${category.color} group-hover:scale-110 transition-transform relative z-10`} />
              <p className="text-sm font-semibold relative z-10">{category.name}</p>
            </button>
          ))}
        </div>

        {/* Results Section */}
        {results && results.length > 0 ? (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-6 py-3 rounded-full mb-4 border border-green-200">
                <TrendingUp className="w-5 h-5" />
                <span className="font-bold">Your Personalized Results</span>
              </div>
              <h3 className="text-3xl font-bold mb-3">Top 3 Cards Just For You</h3>
              <p className="text-lg text-muted-foreground">
                Based on your ₹{getTotalSpending().toLocaleString()} monthly {selectedCategoryData?.name.toLowerCase()} spending
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {results.map((card: any, index: number) => (
                <div
                  key={card.id || index}
                  className="bg-card rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary/20 relative"
                >
                  {index === 0 && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 px-3 py-1 text-xs font-bold shadow-lg">
                        🏆 Best Match
                      </Badge>
                    </div>
                  )}
                  
                  {/* Card Image */}
                  <div className="relative h-64 overflow-hidden bg-gradient-to-br from-muted to-muted/50">
                    <img
                      src={card.card_bg_image}
                      alt={card.card_name}
                      className="w-full h-full object-contain p-8 hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-6">
                    {/* Card Name */}
                    <h3 className="text-xl font-bold mb-4 min-h-[3rem] line-clamp-2">{card.card_name}</h3>

                    {/* Savings Highlight - Prominent */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-2 border-green-300 dark:border-green-700 rounded-xl p-5 mb-4 shadow-md">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-bold text-green-800 dark:text-green-300">You'll Save</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">Per Year</Badge>
                      </div>
                      <p className="text-4xl font-black text-green-600 dark:text-green-400 mb-2">
                        ₹{card.total_savings_yearly?.toLocaleString() || '0'}
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-300 font-medium">
                        💰 That's ₹{Math.round((card.total_savings_yearly || 0) / 12).toLocaleString()} every month with your spending pattern!
                      </p>
                    </div>

                    {/* Fees */}
                    <div className="grid grid-cols-2 gap-3 p-4 bg-muted/50 rounded-lg mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Joining Fee</p>
                        <p className="font-bold text-sm">
                          {card.joining_fees === 0 || card.joining_fees === '0' ? (
                            <span className="text-green-600">FREE</span>
                          ) : (
                            `₹${card.joining_fees?.toLocaleString()}`
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Annual Fee</p>
                        <p className="font-bold text-sm">
                          {card.annual_fees === 0 || card.annual_fees === '0' ? (
                            <span className="text-green-600">FREE</span>
                          ) : (
                            `₹${card.annual_fees?.toLocaleString()}`
                          )}
                        </p>
                      </div>
                    </div>

                  {/* Category Savings Breakdown */}
                  {card.category_savings && Object.keys(card.category_savings).length > 0 && (
                    <details className="mb-4 bg-muted/30 rounded-lg p-3">
                      <summary className="cursor-pointer text-sm font-bold text-primary hover:text-primary/80 flex items-center gap-2">
                        <ChevronDown className="w-4 h-4" />
                        See Detailed Savings Breakdown
                      </summary>
                      <div className="mt-3 space-y-2 pl-2 border-l-2 border-primary/20">
                        {Object.entries(card.category_savings).map(([category, data]: [string, any]) => {
                          const savingsValue = data?.savings || 0;
                          const spendValue = data?.spend || 0;
                          
                          if (savingsValue === 0 && spendValue === 0) return null;
                          
                          return (
                            <div key={category} className="py-2 border-b border-muted/20 last:border-0">
                              <div className="flex justify-between items-center text-sm mb-1">
                                <span className="text-muted-foreground capitalize font-medium">
                                  {category.replace(/_/g, ' ')}
                                </span>
                                <span className="font-bold text-green-600">
                                  +₹{savingsValue.toLocaleString()}
                                </span>
                              </div>
                              {spendValue > 0 && (
                                <p className="text-xs text-muted-foreground">
                                  On ₹{spendValue.toLocaleString()} spend
                                  {data?.cashback_percentage && ` • ${data.cashback_percentage}% back`}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </details>
                  )}

                    {/* CTA Buttons */}
                    <div className="space-y-2">
                      <Button className="w-full shadow-lg" size="lg">
                        Apply Now
                      </Button>
                      <Button variant="outline" className="w-full" size="sm">
                        View Full Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Button
                variant="outline"
                size="lg"
                onClick={resetCalculator}
                className="shadow-lg hover:shadow-xl"
              >
                Try Another Category
              </Button>
            </div>
          </div>
        ) : loading ? (
          /* Loading State with Fun Facts */
          <div className="max-w-2xl mx-auto text-center animate-fade-in">
            <div className="bg-card rounded-3xl p-12 shadow-2xl border-2 border-primary/20">
              <div className="mb-8">
                <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Crunching the numbers...</h3>
              <p className="text-muted-foreground mb-8">
                Our AI is analyzing thousands of card combinations to find your perfect match
              </p>
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-6 min-h-[100px] flex items-center justify-center">
                <p className="text-lg font-medium text-foreground animate-fade-in">
                  {creditCardFacts[currentFactIndex]}
                </p>
              </div>
            </div>
          </div>
        ) : showQuestions && selectedCategoryData && currentQuestion ? (
          /* Questions Section */
          <div className="max-w-3xl mx-auto animate-fade-in">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {selectedCategoryData.questions.length}
                </span>
                <span className="text-sm font-bold text-primary">
                  {Math.round(((currentQuestionIndex + 1) / selectedCategoryData.questions.length) * 100)}% Complete
                </span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-primary via-secondary to-accent transition-all duration-500 shadow-lg"
                  style={{ width: `${((currentQuestionIndex + 1) / selectedCategoryData.questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <SpendingInput
              question={currentQuestion.question}
              emoji={currentQuestion.emoji}
              value={responses[currentQuestion.field] || 0}
              onChange={(value) => setResponses(prev => ({ ...prev, [currentQuestion.field]: value }))}
              min={currentQuestion.min}
              max={currentQuestion.max}
              step={currentQuestion.step}
            />

            {/* Navigation */}
            <div className="flex gap-4 mt-8">
              <Button
                variant="outline"
                size="lg"
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className="flex-1"
              >
                Previous
              </Button>
              <Button
                size="lg"
                onClick={handleNext}
                disabled={loading}
                className="flex-1 shadow-lg"
              >
                {currentQuestionIndex === selectedCategoryData.questions.length - 1 ? (
                  <>
                    Show My Results
                    <Sparkles className="ml-2 w-4 h-4" />
                  </>
                ) : (
                  'Next'
                )}
              </Button>
            </div>

            <div className="text-center mt-6">
              <button
                onClick={resetCalculator}
                className="text-muted-foreground hover:text-primary font-medium transition-colors text-sm"
              >
                ← Choose Different Category
              </button>
            </div>
          </div>
        ) : (
          /* Initial State - Instructions */
          <div className="max-w-2xl mx-auto text-center bg-card rounded-2xl p-8 shadow-lg">
            <p className="text-lg text-muted-foreground mb-6">
              💡 <strong>How it works:</strong> Pick a category above, answer quick questions about your spending, 
              and instantly see the top 3 cards that'll save you the most money
            </p>
            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-lg">1</div>
                <span className="font-medium">Choose Category</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-lg">2</div>
                <span className="font-medium">Answer Questions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-lg">3</div>
                <span className="font-medium">Get Top 3 Cards</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoryCardGenius;
