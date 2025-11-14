import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SpendingInput } from "@/components/ui/spending-input";
import { ArrowLeft, ArrowRight, Loader2, Trophy, TrendingUp, Award, Sparkles } from "lucide-react";
import { cardService, SpendingData } from "@/services/cardService";
import { toast } from "sonner";
import { CardSearchDropdown } from "@/components/CardSearchDropdown";

interface Card {
  id: number;
  name: string;
  seo_card_alias: string;
  image: string;
  banks?: {
    name: string;
  };
  annual_saving?: number;
}

interface SpendingQuestion {
  field: keyof SpendingData;
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
        school_fees: responses.school_fees || 0,
      };

      const calculateResponse = await cardService.calculateCardGenius(completePayload);
      
      console.log("Card Genius API Response:", calculateResponse);
      
      // API returns: { status: "success", data: { success: true, savings: [...] } }
      if (calculateResponse.status === "success" && 
          calculateResponse.data?.success && 
          calculateResponse.data?.savings && 
          calculateResponse.data.savings.length > 0) {
        
        const savingsArray = calculateResponse.data.savings;
        console.log("Savings Array:", savingsArray);
        
        // Sort by total_savings to get the top card
        const sortedCards = [...savingsArray].sort((a: any, b: any) => {
          const aSaving = a.total_savings || 0;
          const bSaving = b.total_savings || 0;
          return bSaving - aSaving;
        });
        
        const topCard = sortedCards[0];
        console.log("Top Card:", topCard);
        
        // Find the user's selected card in the results by matching seo_card_alias
        const userCardInResults = savingsArray.find(
          (card: any) => card.seo_card_alias === selectedCard.seo_card_alias
        );
        
        console.log("User's Selected Card in Results:", userCardInResults);
        
        if (!userCardInResults) {
          toast.error("Your selected card was not found in the results");
          return;
        }
        
        // Fetch detailed data for both cards
        const [userCard, geniusCard] = await Promise.all([
          cardService.getCardDetailsByAlias(selectedCard.seo_card_alias),
          cardService.getCardDetailsByAlias(topCard.seo_card_alias)
        ]);

        if (userCard.status === "success" && userCard.data?.[0]) {
          setUserCardData({
            ...userCard.data[0],
            annual_saving: userCardInResults.total_savings || 0
          });
        }

        if (geniusCard.status === "success" && geniusCard.data?.[0]) {
          setGeniusCardData({
            ...geniusCard.data[0], 
            annual_saving: topCard.total_savings || 0
          });
        }

        setStep('results');
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

  const isUserWinner = userCardData && geniusCardData && 
    userCardData.annual_saving >= geniusCardData.annual_saving;

  // Render card selection
  if (step === 'select') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                Beat My Card
              </h1>
              <p className="text-lg text-muted-foreground">
                Select your current card and see if Card Genius can find a better match
              </p>
            </div>

            <CardSearchDropdown
              cards={filteredCards}
              selectedCard={selectedCard}
              onCardSelect={handleCardSelect}
              onClearSelection={() => setSelectedCard(null)}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    );
  }

  // Render questionnaire
  if (step === 'questions') {
    const question = questions[currentStep];
    const progress = ((currentStep + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => setStep('select')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Card Selection
          </Button>

          <div className="max-w-2xl mx-auto">
            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Question {currentStep + 1} of {questions.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Question card */}
            <div className="bg-card border border-border rounded-2xl p-8 shadow-lg mb-6">
              <SpendingInput
                question={question.question}
                emoji={question.emoji}
                value={responses[question.field] || 0}
                onChange={(value) => setResponses({ ...responses, [question.field]: value })}
                min={question.min}
                max={question.max}
                step={question.step}
              />
            </div>

            {/* Navigation buttons */}
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={isCalculating}
                  className="flex-1"
                >
                  {isCalculating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Calculating...
                    </>
                  ) : currentStep === questions.length - 1 ? (
                    <>
                      See Results
                      <Sparkles className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>

              {/* Skip buttons */}
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="flex-1 text-muted-foreground"
                >
                  Skip Question
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleSkipAll}
                  disabled={isCalculating}
                  className="flex-1 text-muted-foreground"
                >
                  {isCalculating ? "Calculating..." : "Skip All & See Results"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render results
  if (step === 'results' && userCardData && geniusCardData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          <div className="max-w-5xl mx-auto">
            {/* Verdict Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 mb-4">
                {isUserWinner ? (
                  <Trophy className="w-10 h-10 text-primary" />
                ) : (
                  <Award className="w-10 h-10 text-secondary" />
                )}
              </div>
              
              <h1 className="text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Verdict
                </span>
              </h1>

              {isUserWinner ? (
                <div>
                  <p className="text-2xl font-semibold text-primary mb-2">
                    You Win! 🎉
                  </p>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Excellent choice! Your <strong>{userCardData.name}</strong> is already optimized for your spending pattern.
                    <br />
                    You're making the most of your rewards!
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-2xl font-semibold text-secondary mb-2">
                    Card Genius Wins! 🏆
                  </p>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    <strong>{geniusCardData.name}</strong> beats your {userCardData.name}!
                    <br />
                    You could save ₹{(geniusCardData.annual_saving - userCardData.annual_saving).toLocaleString('en-IN')} more per year.
                  </p>
                </div>
              )}
            </div>

            {/* Card Comparison */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* User's Card */}
              <div className={`bg-card border-2 rounded-2xl p-6 transition-all ${
                isUserWinner ? 'border-primary shadow-lg shadow-primary/20' : 'border-border'
              }`}>
                {isUserWinner && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
                    <Trophy className="w-4 h-4" />
                    WINNER
                  </div>
                )}
                <img
                  src={userCardData.image}
                  alt={userCardData.name}
                  className="w-full h-48 object-contain mb-4"
                />
                <h3 className="text-xl font-bold mb-1">{userCardData.name}</h3>
                <p className="text-muted-foreground mb-4">{userCardData.banks?.name || 'Credit Card'}</p>
                
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Annual Savings</p>
                  <p className="text-3xl font-bold text-primary">
                    ₹{userCardData.annual_saving?.toLocaleString('en-IN') || '0'}
                  </p>
                </div>
              </div>

              {/* Genius Card */}
              <div className={`bg-card border-2 rounded-2xl p-6 transition-all ${
                !isUserWinner ? 'border-secondary shadow-lg shadow-secondary/20' : 'border-border'
              }`}>
                {!isUserWinner && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-semibold mb-4">
                    <Trophy className="w-4 h-4" />
                    WINNER
                  </div>
                )}
                <img
                  src={geniusCardData.image}
                  alt={geniusCardData.name}
                  className="w-full h-48 object-contain mb-4"
                />
                <h3 className="text-xl font-bold mb-1">{geniusCardData.name}</h3>
                <p className="text-muted-foreground mb-4">{geniusCardData.banks?.name || 'Credit Card'}</p>
                
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Annual Savings</p>
                  <p className="text-3xl font-bold text-secondary">
                    ₹{geniusCardData.annual_saving?.toLocaleString('en-IN') || '0'}
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setStep('select');
                  setCurrentStep(0);
                  setResponses({});
                  setSelectedCard(null);
                }}
              >
                Try Another Card
              </Button>
              {!isUserWinner && (
                <Button
                  size="lg"
                  onClick={() => navigate(`/card/${geniusCardData.seo_card_alias}`)}
                >
                  Apply for Better Card
                  <TrendingUp className="ml-2 h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default BeatMyCard;
