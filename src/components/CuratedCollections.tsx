import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { cardService } from "@/services/cardService";
import { Button } from "./ui/button";
import { Star, ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const collections = {
  shopping: {
    title: "Best for Shopping",
    emoji: "🛍️",
    aliases: ['axis-flipkart-credit-card', 'sbi-cashback-credit-card', 'hdfc-swiggy-credit-card']
  },
  dining: {
    title: "Best for Dining",
    emoji: "🍽️",
    aliases: ['hdfc-swiggy-credit-card', 'hdfc-millenia-credit-card', 'au-zenith-plus-credit-card']
  },
  travel: {
    title: "Best for Travel",
    emoji: "✈️",
    aliases: ['hdfc-indigo-credit-card', 'indusind-legend-credit-card', 'amex-gold-credit-card']
  },
  moneycontrol_picks: {
    title: "MoneyControl Picks",
    emoji: "⭐",
    aliases: ['hdfc-tata-neu-plus-credit-card', 'axis-bank-magnus-credit-card', 'amex-gold-credit-card']
  }
};

const CuratedCollections = () => {
  const [cards, setCards] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCards = async () => {
      const allCards: any = {};
      
      for (const [key, collection] of Object.entries(collections)) {
        const cardData = await Promise.all(
          collection.aliases.slice(0, 3).map(async (alias) => {
            try {
              const response = await cardService.getCardDetails(alias);
              return response.data;
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

  useEffect(() => {
    if (!loading && sectionRef.current) {
      ScrollTrigger.batch('.collection-card', {
        onEnter: (batch) => {
          gsap.from(batch, {
            opacity: 0,
            y: 60,
            stagger: 0.15,
            duration: 0.8,
            ease: 'power2.out'
          });
        },
        start: 'top 80%',
        once: true
      });
    }
  }, [loading]);

  if (loading) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading collections...</div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Curated Collections</h2>
          <p className="text-xl text-muted-foreground">
            Handpicked cards for your lifestyle
          </p>
        </div>

        <div className="space-y-16">
          {Object.entries(collections).map(([key, collection]) => (
            <div key={key}>
              <div className="flex items-center gap-3 mb-8">
                <span className="text-4xl">{collection.emoji}</span>
                <h3 className="text-3xl font-bold">{collection.title}</h3>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards[key]?.map((card: any, index: number) => (
                  <div
                    key={card.id || index}
                    className="collection-card bg-card rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={card.card_bg_image}
                        alt={card.name}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                      />
                    </div>

                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <img src={card.bank_logo} alt={card.bank_name} className="h-6" />
                      </div>

                      <h4 className="text-xl font-bold mb-3">{card.name}</h4>

                      {card.average_rating && (
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < Math.floor(card.average_rating) ? 'fill-current' : ''}`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            ({card.user_rating_count?.toLocaleString() || 0})
                          </span>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Joining Fee</p>
                          <p className="text-sm font-semibold">{card.joining_fee_text || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Annual Fee</p>
                          <p className="text-sm font-semibold">{card.annual_fee_text || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        {card.product_usps?.slice(0, 2).map((usp: any, i: number) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-primary mt-0.5">✓</span>
                            <span className="text-muted-foreground">{usp.header}</span>
                          </div>
                        ))}
                      </div>

                      <Link to={`/cards/${card.slug}`}>
                        <Button className="w-full group">
                          View Details
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CuratedCollections;
