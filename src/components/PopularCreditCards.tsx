import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { cardService } from "@/services/cardService";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { openRedirectInterstitial, extractBankName, extractBankLogo } from "@/utils/redirectHandler";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);
const categories = {
  editor: {
    title: "Editor's Choice",
    aliases: ['hdfc-tata-neu-plus-credit-card', 'axis-bank-magnus-credit-card', 'amex-gold-credit-card'],
    filterValue: 'all'
  },
  shopping: {
    title: "Online Shopping",
    aliases: ['amex-platinum-travel-credit-card', 'sbi-cashback-credit-card', 'hdfc-swiggy-credit-card'],
    filterValue: 'shopping'
  },
  dining: {
    title: "Dining",
    aliases: ['hdfc-swiggy-credit-card', 'hdfc-millenia-credit-card', 'hsbc-live-plus-credit-card'],
    filterValue: 'dining'
  },
  travel: {
    title: "Travel",
    aliases: ['icici-mmt-platinum-credit-card', 'hdfc-infinia-credit-card', 'axis-bank-magnus-credit-card'],
    filterValue: 'travel'
  }
};

// Custom USP overrides for specific cards
const customUSPs: Record<string, Array<{ header: string; description: string; priority: number }>> = {
  'axis-bank-magnus-credit-card': [
    {
      header: "Unlimited Airport Lounge Access",
      description: "Complimentary unlimited international lounge visits with Priority Pass, plus 8 guest visits annually. also unlimited domestic lounge visits",
      priority: 2
    },
    {
      header: "Dining Delights Program",
      description: "Save up to 30% upto ₹1000 at over 4,000 restaurants in India with Axis Bank's Dining Delights program.",
      priority: 2
    }
  ],
  'amex-gold-credit-card': [
    {
      header: "Earn 1 Membership Rewards Point",
      description: "for every Rs. 50 spent including fuel and utilities spend",
      priority: 1
    },
    {
      header: "Earn 1,000 bonus Membership Rewards Points",
      description: "upon completing six transactions of ₹1,000 or more each month",
      priority: 2
    }
  ],
  'hdfc-millenia-credit-card': [
    {
      header: "5% Cashback on Select Merchants",
      description: "Earn 5% cashback on purchases made through Amazon, Flipkart, Flight & Hotel bookings via PayZapp and SmartBuy, with a minimum transaction size of ₹2,000",
      priority: 1
    },
    {
      header: "Exclusive Dining Privileges",
      description: "Enjoy up to 20% savings at premium restaurants across top cities through the Good Food Trail Dining program",
      priority: 2
    }
  ],
  'amex-platinum-travel-credit-card': [
    {
      header: "Membership Rewards on every spend",
      description: "Earn Membership Rewards points for every transaction, redeemable for travel, gift cards, or shopping.",
      priority: 1
    },
    {
      header: "Exclusive Annual Spend Milestone Reward",
      description: "Spend ₹1.90 Lacs in a Cardmembership year and receive Flipkart vouchers or travel benefits worth ₹4,500.",
      priority: 3
    }
  ],
  'hsbc-live-plus-credit-card': [
    {
      header: "10% Cashback on Dining and Food Delivery",
      description: "Earn 10% cashback on dining and food delivery spends, capped at ₹1,000 per billing cycle.",
      priority: 1
    },
    {
      header: "10% Cashback on Food Delivery",
      description: "Earn 10% cashback on food delivery spends, capped at ₹1,000 per billing cycle.",
      priority: 1
    }
  ],
  'icici-mmt-platinum-credit-card': [
    {
      header: "Unlimited Rewards and Redemption",
      description: " Earn up to ₹3 My Cash per ₹200 spent on MakeMyTrip and redeem without restrictions on flights, hotels, and holidays",
      priority: 1
    },
    {
      header: "Complimentary Airport Lounges ",
      description: "Enjoy 4 complimentary visits annually to domestic airport lounges",
      priority: 1
    }
  ],
  'hdfc-infinia-credit-card': [
    {
      header: "Reward Points for Travel ",
      description: "at ₹1 per point for flights and hotels via SmartBuy, or convert them into Air Miles at a 1:1 ratio for global travel flexibility",
      priority: 1
    },
    {
      header: "Minimal Forex Markup Fee ",
      description: "Benefit from a low 2% forex markup fee, ensuring cost-effective international transactions",
      priority: 2
    }
  ]
};
const PopularCreditCards = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('editor');
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fetchCards = async () => {
      const allCards: any = {};
      for (const [key, category] of Object.entries(categories)) {
        const cardData = await Promise.all(category.aliases.map(async alias => {
          try {
            const response = await cardService.getCardDetails(alias);
            return response.data?.[0] || null;
          } catch (error) {
            console.error(`Failed to fetch ${alias}:`, error);
            return null;
          }
        }));
        allCards[key] = cardData.filter(Boolean);
      }
      setCards(allCards);
      setLoading(false);
    };
    fetchCards();
  }, []);

  useGSAP(() => {
    if (!sectionRef.current || !cardsRef.current) return;

    const cardElements = cardsRef.current.querySelectorAll('.popular-card');
    
    gsap.fromTo(cardElements, {
      y: 60,
      opacity: 0,
      scale: 0.9
    }, {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 0.8,
      stagger: 0.15,
      ease: "power3.out",
      force3D: true,
      scrollTrigger: {
        trigger: cardsRef.current,
        start: "top 85%",
        end: "top 50%",
        toggleActions: "play none none reverse"
      }
    });
  }, { scope: sectionRef, dependencies: [activeTab, loading] });
  if (loading) {
  return <section ref={sectionRef} className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">Loading popular cards...</div>
          </div>
        </div>
      </section>;
  }
  return <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Explore our Top Cards
          </h2>
          
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 mb-12">
            {Object.entries(categories).map(([key, category]) => <TabsTrigger key={key} value={key}>
                {category.title}
              </TabsTrigger>)}
          </TabsList>

          {Object.entries(categories).map(([key, category]) => <TabsContent key={key} value={key} className="mt-0">
              <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {cards[key]?.map((card: any, index: number) => {
              const topUsps = customUSPs[card.seo_card_alias] || card.product_usps?.filter((usp: any) => usp.priority <= 2).sort((a: any, b: any) => a.priority - b.priority).slice(0, 2) || [];
              return <div key={card.id || index} className="popular-card bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group flex flex-col h-full">
                      {/* Card Image */}
                      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-muted to-muted/50 flex-shrink-0">
                        <img src={card.card_bg_image} alt={card.name} className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-500" />
                        
                        {/* Tags overlay */}
                        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                          {card.tags?.slice(0, 3).map((tag: any) => <Badge key={tag.id} variant="secondary" className="text-xs">
                              {tag.name}
                            </Badge>)}
                        </div>
                      </div>

                      <div className="p-6 flex flex-col flex-grow">
                        {/* Card Name */}
                        <h3 className="text-xl font-bold mb-4 line-clamp-2 min-h-[3.5rem]">
                          {card.name}
                        </h3>

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
                        <div className="space-y-3 mb-6 flex-grow min-h-[180px]">
                          {topUsps.map((usp: any, i: number) => <div key={i} className="flex gap-3">
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-primary text-xs font-bold">{i + 1}</span>
                              </div>
                              <div>
                                <p className="font-semibold text-sm mb-1">{usp.header}</p>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {usp.description}
                                </p>
                              </div>
                            </div>)}
                        </div>

                        {/* CTA Buttons */}
                        <div className="space-y-2 mt-auto">
                          <Button className="w-full" size="lg" onClick={() => openRedirectInterstitial({
                      networkUrl: card.network_url,
                      bankName: extractBankName(card),
                      bankLogo: extractBankLogo(card),
                      cardName: card.name,
                      cardId: card.id
                    })}>
                            Apply Now
                          </Button>
                          <Button variant="outline" className="w-full" size="sm" onClick={() => navigate(`/cards/${card.seo_card_alias}`)}>
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>;
            })}
              </div>
              
              {/* View All Cards Button */}
              <div className="mt-12 flex justify-center">
                <Button size="lg" onClick={() => {
              navigate(`/cards?category=${category.filterValue}`);
              window.scrollTo({
                top: 0,
                behavior: 'smooth'
              });
            }} className="min-w-[200px]">
                  View All Cards
                </Button>
              </div>
            </TabsContent>)}
        </Tabs>
      </div>
    </section>;
};
export default PopularCreditCards;