import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SpendingInput } from "@/components/ui/spending-input";
import { ArrowLeft, ArrowRight, Sparkles, ChevronDown } from "lucide-react";
import { cardService } from "@/services/cardService";
import type { SpendingData } from "@/services/cardService";
import { useToast } from "@/hooks/use-toast";

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
  joining_fees: number;
  total_savings: number;
  total_savings_yearly: number;
  spending_breakdown: {
    [key: string]: {
      spend: number;
      points_earned: number;
      savings: number;
      cashback_percentage?: number;
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
          .sort((a: any, b: any) => (b.total_savings_yearly || 0) - (a.total_savings_yearly || 0))
          .slice(0, 3);

        // Fetch card details for each
        const cardsWithDetails = await Promise.all(
          sortedSavings.map(async (saving: any) => {
            try {
              const cardDetails = await cardService.getCardDetails(saving.card_alias);
              return {
                card_name: cardDetails.data?.card_name || saving.card_alias,
                card_bg_image: cardDetails.data?.card_bg_image,
                joining_fees: cardDetails.data?.annual_fees || 0,
                total_savings: saving.total_savings || 0,
                total_savings_yearly: saving.total_savings_yearly || 0,
                spending_breakdown: saving.spending_breakdown || {}
              };
            } catch (error) {
              console.error(`Error fetching details for ${saving.card_alias}:`, error);
              return {
                card_name: saving.card_alias,
                joining_fees: 0,
                total_savings: saving.total_savings || 0,
                total_savings_yearly: saving.total_savings_yearly || 0,
                spending_breakdown: saving.spending_breakdown || {}
              };
            }
          })
        );

        setResults(cardsWithDetails);
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

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };


  if (showResults) {
    const totalMonthlySpend = Object.values(responses).reduce((acc, val) => acc + (val || 0), 0);
    const totalAnnualSpend = totalMonthlySpend * 12;
    const [activeTab, setActiveTab] = useState<'quick' | 'detailed'>('quick');
    const [selectedCard, setSelectedCard] = useState<CardResult | null>(null);

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
              {selectedCard.card_bg_image && (
                <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl p-8 flex items-center justify-center">
                  <img
                    src={selectedCard.card_bg_image}
                    alt={selectedCard.card_name}
                    className="w-full max-w-sm h-64 object-contain"
                  />
                </div>
              )}

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
                    <span className="text-lg font-semibold text-foreground">₹0</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground">Joining Fees</span>
                    <span className="text-lg font-semibold text-foreground">-₹{selectedCard.joining_fees.toLocaleString()}</span>
                  </div>
                  
                  <div className="h-px bg-border"></div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-foreground">Your Net Savings</span>
                    <span className="text-2xl font-bold text-green-600">₹{(selectedCard.total_savings_yearly - selectedCard.joining_fees).toLocaleString()}</span>
                  </div>
                </div>

                <Button className="w-full" size="lg">Apply Now</Button>
              </div>
            </div>

            {/* Savings Breakdown */}
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Your Total Savings Breakdown</h2>
              
              {/* Category Pills */}
              <div className="flex flex-wrap gap-2 mb-6">
                {Object.entries(selectedCard.spending_breakdown || {}).map(([category, details]) => {
                  if (!details || !details.spend || details.spend === 0) return null;
                  return (
                    <button
                      key={category}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      {category.replace(/_/g, ' ')} Savings
                    </button>
                  );
                })}
              </div>

              {/* Breakdown Table */}
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-4 font-semibold text-sm text-foreground">Savings Breakdown</th>
                      <th className="text-right p-4 font-semibold text-sm text-foreground">Yearly</th>
                      <th className="text-right p-4 font-semibold text-sm text-foreground">Monthly</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(selectedCard.spending_breakdown || {}).map(([category, details]) => {
                      if (!details || !details.spend || details.spend === 0) return null;
                      return (
                        <tr key={category} className="border-t border-border">
                          <td className="p-4">
                            <div>
                              <p className="font-medium text-foreground capitalize">{category.replace(/_/g, ' ')}</p>
                              <p className="text-sm text-muted-foreground">Total Spends: ₹{((details.spend || 0) * 12).toLocaleString()}</p>
                              <p className="text-sm text-muted-foreground">Points Earned: {((details.points_earned || 0) * 12).toLocaleString()}</p>
                            </div>
                          </td>
                          <td className="p-4 text-right font-semibold text-foreground">₹{((details.savings || 0) * 12).toLocaleString()}</td>
                          <td className="p-4 text-right font-semibold text-foreground">₹{(details.savings || 0).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                    <tr className="border-t-2 border-border bg-muted">
                      <td className="p-4 font-bold text-foreground">Total Savings</td>
                      <td className="p-4 text-right font-bold text-foreground">₹{selectedCard.total_savings_yearly.toLocaleString()}</td>
                      <td className="p-4 text-right font-bold text-foreground">₹{Math.round(selectedCard.total_savings_yearly / 12).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      );
    }

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
          <div className="flex gap-3 mb-6">
            <Button variant="outline" size="sm" className="gap-2">
              Eligibility <ChevronDown className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              Lifetime Free Cards
            </Button>
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
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-semibold text-sm text-foreground">Credit Cards</th>
                    <th className="text-center p-4 font-semibold text-sm text-foreground">Total<br/>Savings</th>
                    <th className="text-center p-4 font-semibold text-sm text-foreground">Milestone<br/>Benefits</th>
                    <th className="text-center p-4 font-semibold text-sm text-foreground">Joining<br/>Fees</th>
                    <th className="text-center p-4 font-semibold text-sm text-foreground">Net<br/>Savings</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((card, index) => {
                    const netSavings = card.total_savings_yearly - card.joining_fees;
                    return (
                      <tr 
                        key={index} 
                        className={`border-t border-border hover:bg-muted/30 transition-colors ${
                          index === 0 ? 'bg-green-50/50' : ''
                        }`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-4">
                            {card.card_bg_image && (
                              <img
                                src={card.card_bg_image}
                                alt={card.card_name}
                                className="w-20 h-12 object-contain"
                              />
                            )}
                            <div>
                              <p className="font-semibold text-foreground">{card.card_name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-center font-semibold text-foreground">
                          ₹{card.total_savings_yearly.toLocaleString()}
                        </td>
                        <td className="p-4 text-center font-semibold text-foreground">
                          ₹0
                        </td>
                        <td className="p-4 text-center font-semibold text-foreground">
                          ₹{card.joining_fees.toLocaleString()}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className="font-bold text-green-600">
                              ₹{netSavings.toLocaleString()}
                            </span>
                            <button
                              onClick={() => setSelectedCard(card)}
                              className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                            >
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

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
