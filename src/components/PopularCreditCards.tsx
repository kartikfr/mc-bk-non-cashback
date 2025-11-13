import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cardService } from "@/services/cardService";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { openRedirectInterstitial, extractBankName, extractBankLogo } from "@/utils/redirectHandler";

const categories = {
  shopping: {
    title: "Online Shopping",
    aliases: ['idfc-power-plus-credit-card', 'sbi-cashback-credit-card', 'hdfc-swiggy-credit-card']
  },
  dining: {
    title: "Dining",
    aliases: ['hdfc-swiggy-credit-card', 'hdfc-millenia-credit-card', 'au-zenith-plus-credit-card']
  },
  travel: {
    title: "Travel",
    aliases: ['hdfc-indigo-credit-card', 'indusind-legend-credit-card', 'amex-gold-credit-card']
  },
  editor: {
    title: "Editor's Choice",
    aliases: ['hdfc-tata-neu-plus-credit-card', 'axis-bank-magnus-credit-card', 'amex-gold-credit-card']
  }
};

const PopularCreditCards = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('travel');

  useEffect(() => {
    const fetchCards = async () => {
      const allCards: any = {};
      
      for (const [key, category] of Object.entries(categories)) {
        const cardData = await Promise.all(
          category.aliases.map(async (alias) => {
            try {
              const response = await cardService.getCardDetails(alias);
              return response.data?.[0] || null;
            } catch (error) {
              console.error(`Failed to fetch ${alias}:`, error);
              return null;
            }
          })
        );
        allCards[key] = cardData.filter(Boolean);
      }
      
      setCards(allCards);
      setLoading(false);
    };

    fetchCards();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">Loading popular cards...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Cards That Match Your Lifestyle
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Handpicked cards tailored to how you spend—because every purchase deserves rewards
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 mb-12">
            {Object.entries(categories).map(([key, category]) => (
              <TabsTrigger key={key} value={key}>
                {category.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(categories).map(([key, category]) => (
            <TabsContent key={key} value={key} className="mt-0">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {cards[key]?.map((card: any, index: number) => {
                  const topUsps = card.product_usps
                    ?.filter((usp: any) => usp.priority <= 2)
                    .sort((a: any, b: any) => a.priority - b.priority)
                    .slice(0, 2) || [];

                  return (
                    <div
                      key={card.id || index}
                      className="bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
                    >
                      {/* Card Image */}
                      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-muted to-muted/50">
                        <img
                          src={card.card_bg_image}
                          alt={card.name}
                          className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-500"
                        />
                        
                        {/* Tags overlay */}
                        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                          {card.tags?.slice(0, 3).map((tag: any) => (
                            <Badge key={tag.id} variant="secondary" className="text-xs">
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="p-6">
                        {/* Card Name */}
                        <h3 className="text-xl font-bold mb-2 line-clamp-2">
                          {card.name}
                        </h3>

                        {/* Rating */}
                        {card.user_rating_count && (
                          <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-semibold">{card.rating}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              ({card.user_rating_count.toLocaleString()} reviews)
                            </span>
                          </div>
                        )}

                        {/* Fees */}
                        <div className="grid grid-cols-2 gap-3 p-4 bg-muted/50 rounded-lg mb-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Joining Fee</p>
                            <p className="font-bold text-sm">
                              {card.joining_fee_text === '0' ? 'FREE' : `₹${card.joining_fee_text}`}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Annual Fee</p>
                            <p className="font-bold text-sm">
                              {card.annual_fee_text === '0' ? 'FREE' : `₹${card.annual_fee_text}`}
                            </p>
                          </div>
                        </div>

                        {/* USPs */}
                        <div className="space-y-3 mb-6">
                          {topUsps.map((usp: any, i: number) => (
                            <div key={i} className="flex gap-3">
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-primary text-xs font-bold">{i + 1}</span>
                              </div>
                              <div>
                                <p className="font-semibold text-sm mb-1">{usp.header}</p>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {usp.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* CTA Buttons */}
                        <div className="space-y-2">
                          <Button 
                            className="w-full" 
                            size="lg"
                            onClick={() => openRedirectInterstitial({
                              networkUrl: card.network_url,
                              bankName: extractBankName(card),
                              bankLogo: extractBankLogo(card),
                              cardName: card.name,
                              cardId: card.id
                            })}
                          >
                            Apply Now
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full" 
                            size="sm"
                            onClick={() => navigate(`/cards/${card.seo_card_alias}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default PopularCreditCards;
