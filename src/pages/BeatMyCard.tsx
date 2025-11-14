import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Loader2, Trophy, TrendingUp, Award } from "lucide-react";
import { cardService, SpendingData } from "@/services/cardService";
import { toast } from "sonner";
import { SpendingInput } from "@/components/ui/spending-input";

interface Card {
  id: number;
  name: string;
  seo_card_alias: string;
  image: string;
  banks: {
    name: string;
  };
  annual_saving?: number;
}

interface SpendingQuestion {
  key: keyof SpendingData;
  question: string;
  emoji: string;
  min: number;
  max: number;
  step: number;
}

const questions: SpendingQuestion[] = [
  { key: "amazon_spends", question: "How much do you spend on Amazon monthly?", emoji: "📦", min: 0, max: 50000, step: 500 },
  { key: "flipkart_spends", question: "How much do you spend on Flipkart monthly?", emoji: "🛒", min: 0, max: 50000, step: 500 },
  { key: "other_online_spends", question: "Other online shopping spends?", emoji: "💻", min: 0, max: 50000, step: 500 },
  { key: "other_offline_spends", question: "Offline shopping spends?", emoji: "🏪", min: 0, max: 50000, step: 500 },
  { key: "grocery_spends_online", question: "Online grocery spends?", emoji: "🥬", min: 0, max: 30000, step: 500 },
  { key: "online_food_ordering", question: "Food delivery spends?", emoji: "🍕", min: 0, max: 20000, step: 500 },
  { key: "fuel", question: "Monthly fuel expenses?", emoji: "⛽", min: 0, max: 20000, step: 500 },
  { key: "dining_or_going_out", question: "Dining out expenses?", emoji: "🍽️", min: 0, max: 30000, step: 500 },
  { key: "flights_annual", question: "Annual flight bookings?", emoji: "✈️", min: 0, max: 200000, step: 5000 },
  { key: "hotels_annual", question: "Annual hotel bookings?", emoji: "🏨", min: 0, max: 200000, step: 5000 },
  { key: "domestic_lounge_usage_quarterly", question: "Domestic lounge visits per quarter?", emoji: "🛋️", min: 0, max: 20, step: 1 },
  { key: "international_lounge_usage_quarterly", question: "International lounge visits per quarter?", emoji: "🌍", min: 0, max: 20, step: 1 },
  { key: "mobile_phone_bills", question: "Monthly mobile bills?", emoji: "📱", min: 0, max: 5000, step: 100 },
  { key: "electricity_bills", question: "Monthly electricity bills?", emoji: "💡", min: 0, max: 10000, step: 100 },
  { key: "water_bills", question: "Monthly water bills?", emoji: "💧", min: 0, max: 3000, step: 100 },
  { key: "insurance_health_annual", question: "Annual health insurance premium?", emoji: "🏥", min: 0, max: 100000, step: 1000 },
  { key: "insurance_car_or_bike_annual", question: "Annual vehicle insurance?", emoji: "🚗", min: 0, max: 50000, step: 1000 },
  { key: "rent", question: "Monthly rent payment?", emoji: "🏠", min: 0, max: 100000, step: 1000 },
  { key: "school_fees", question: "Monthly school fees?", emoji: "🎓", min: 0, max: 50000, step: 1000 },
];

const BeatMyCard = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'select' | 'questions' | 'results'>('select');
  const [cards, setCards] = useState<Card[]>([]);
  const [filteredCards, setFilteredCards] = useState<Card[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<SpendingData>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [userCardData, setUserCardData] = useState<Card | null>(null);
  const [geniusCardData, setGeniusCardData] = useState<Card | null>(null);

  useEffect(() => {
    fetchCards();
  }, []);

  useEffect(() => {
    if (Array.isArray(cards)) {
      const filtered = cards.filter(card =>
        card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.banks.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCards(filtered);
    }
  }, [searchQuery, cards]);

  const fetchCards = async () => {
    setIsLoading(true);
    try {
      const response = await cardService.getCardListing({
        slug: "",
        banks_ids: [],
        card_networks: [],
        annualFees: "",
        credit_score: "",
        sort_by: "",
        free_cards: "",
        eligiblityPayload: {},
        cardGeniusPayload: []
      });
      
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
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResults();
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateResults = async () => {
    setIsCalculating(true);
    try {
      const calculateResponse = await cardService.calculateCardGenius(responses);
      
      if (calculateResponse.status === "success" && calculateResponse.data) {
        const topCard = calculateResponse.data[0];
        
        // Fetch detailed data for both cards
        const [userCard, geniusCard] = await Promise.all([
          cardService.getCardDetailsByAlias(selectedCard!.seo_card_alias),
          cardService.getCardDetailsByAlias(topCard.seo_card_alias)
        ]);

        if (userCard.status === "success" && userCard.data?.[0]) {
          setUserCardData({
            ...userCard.data[0],
            annual_saving: topCard.user_card_saving || 0
          });
        }

        if (geniusCard.status === "success" && geniusCard.data?.[0]) {
          setGeniusCardData({
            ...geniusCard.data[0],
            annual_saving: topCard.annual_saving || 0
          });
        }

        setStep('results');
      }
    } catch (error) {
      toast.error("Failed to calculate results");
      console.error(error);
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

            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for your card..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid gap-4 max-h-[60vh] overflow-y-auto pr-2">
                {filteredCards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => handleCardSelect(card)}
                    className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary hover:shadow-lg transition-all text-left"
                  >
                    <img
                      src={card.image}
                      alt={card.name}
                      className="w-20 h-12 object-contain"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{card.name}</h3>
                      <p className="text-sm text-muted-foreground">{card.banks.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render questionnaire
  if (step === 'questions') {
    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Button
            variant="ghost"
            onClick={() => setStep('select')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Card Selection
          </Button>

          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
            <div className="mb-6">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Question {currentQuestion + 1} of {questions.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <SpendingInput
              question={question.question}
              emoji={question.emoji}
              value={responses[question.key] || 0}
              onChange={(value) => setResponses({ ...responses, [question.key]: value })}
              min={question.min}
              max={question.max}
              step={question.step}
            />

            <div className="flex gap-3 mt-8">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentQuestion === 0}
                className="flex-1"
              >
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
                ) : currentQuestion === questions.length - 1 ? (
                  "See Results"
                ) : (
                  "Next"
                )}
              </Button>
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
                  <p className="text-lg text-muted-foreground">
                    Great choice! Your {userCardData.name} is already optimized for your spending pattern.
                    <br />
                    You're making the most of your rewards!
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-2xl font-semibold text-secondary mb-2">
                    {geniusCardData.name}
                  </p>
                  <p className="text-lg text-muted-foreground">
                    beats your {userCardData.name}!
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
                <p className="text-muted-foreground mb-4">{userCardData.banks.name}</p>
                
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">You Save Annually</p>
                  <p className="text-3xl font-bold text-primary">
                    ₹{userCardData.annual_saving?.toLocaleString('en-IN')}
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
                <p className="text-muted-foreground mb-4">{geniusCardData.banks.name}</p>
                
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">You Save Annually</p>
                  <p className="text-3xl font-bold text-secondary">
                    ₹{geniusCardData.annual_saving?.toLocaleString('en-IN')}
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
                  setCurrentQuestion(0);
                  setResponses({});
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
