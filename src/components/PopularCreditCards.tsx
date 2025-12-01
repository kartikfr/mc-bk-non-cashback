import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { cardService } from "@/services/cardService";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Star, ChevronDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { redirectToCardApplication } from "@/utils/redirectHandler";
import { toast } from "sonner";
import { getCardAlias } from "@/utils/cardAlias";
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
  const [expandedMobileCard, setExpandedMobileCard] = useState<string | null>(null);

  const handleApply = (card: any) => {
    const success = redirectToCardApplication(card);
    if (!success) {
      toast.error("Unable to open the bank site. Please allow pop-ups or try again later.");
    }
  };
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
  return <section ref={sectionRef} className="py-[var(--section-space-lg)] bg-muted/30">
        <div className="section-shell">
          <div className="text-center">
            <div className="animate-pulse">Loading popular cards...</div>
          </div>
        </div>
      </section>;
  }
  return <section ref={sectionRef} className="py-12 sm:py-16 md:py-20 bg-muted/30">
      <div className="section-shell">
        <div className="text-center mb-6 sm:mb-8 space-y-2 sm:space-y-3 px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Explore our Top Cards
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">Hand-picked recommendations curated by category.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Floating Chips Bar */}
          <div className="mb-8 sm:mb-10 py-4 sm:py-5">
            <div className="relative max-w-max mx-auto">
              {/* Soft Container */}
              <div className="relative bg-muted/60 backdrop-blur-xl rounded-3xl shadow-lg border border-border/20 px-2 py-2">
                {/* Left fade indicator */}
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-muted/80 to-transparent rounded-l-3xl pointer-events-none z-10" />
                
                {/* Right fade indicator */}
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-muted/80 to-transparent rounded-r-3xl pointer-events-none z-10" />
                
                {/* Chips Container */}
                <div className="overflow-x-auto scrollbar-hide">
                  <TabsList className="flex w-max gap-2 bg-transparent p-0">
                    {Object.entries(categories).map(([key, category]) => <TabsTrigger 
                      key={key} 
                      value={key} 
                      className="flex-shrink-0 whitespace-nowrap rounded-2xl text-xs sm:text-sm font-medium py-2.5 sm:py-3 px-4 sm:px-6 touch-target transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-bold data-[state=active]:scale-105 data-[state=active]:shadow-md data-[state=inactive]:bg-white data-[state=inactive]:text-foreground data-[state=inactive]:hover:bg-white/80 data-[state=inactive]:hover:scale-[1.02] border-0"
                    >
                        {category.title}
                      </TabsTrigger>)}
                  </TabsList>
                </div>
              </div>
            </div>
          </div>

          {Object.entries(categories).map(([key, category]) => <TabsContent key={key} value={key} className="mt-0 animate-in fade-in-50 duration-500">
              {/* Mobile: Swipeable carousel, Desktop: Grid */}
              <div className="relative">
                {/* Mobile Carousel Container */}
                <div className="md:hidden">
                  <div className="overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4" ref={cardsRef}>
                    <div className="flex gap-4">
                      {cards[key]?.map((card: any, index: number) => {
                        const topUsps = customUSPs[card.seo_card_alias] || card.product_usps?.filter((usp: any) => usp.priority <= 2).sort((a: any, b: any) => a.priority - b.priority).slice(0, 2) || [];
                        const cardKey = String(card.id || card.seo_card_alias || `${key}-${index}`);
                        const isExpanded = expandedMobileCard === cardKey;
                        const primaryUsp = topUsps[0];
                        return <div key={card.id || index} className="popular-card flex-shrink-0 w-[85vw] max-w-sm snap-center bg-card rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl border border-border/50 transition-all duration-300 flex flex-col active:scale-[0.98]">
                                {/* Card Image */}
                                <div className="relative h-52 overflow-hidden bg-gradient-to-br from-muted to-muted/50 flex-shrink-0">
                                  <img src={card.card_bg_image} alt={card.name} className="w-full h-full object-contain p-6" />
                                </div>

                                <div className="p-5 flex flex-col flex-grow space-y-4">
                                  {/* Card Name */}
                                  <h3 className="text-lg font-bold line-clamp-2 leading-tight">
                                    {card.name}
                                  </h3>

                                  {/* Key Benefit - Single, prominent with icon (mobile: show only first; expandable) */}
                                  {primaryUsp && (
                                    <div className="p-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20">
                                      <p className="font-bold text-sm text-primary mb-1 line-clamp-1">
                                        {primaryUsp.header}
                                      </p>
                                      <p className={`text-xs text-muted-foreground leading-relaxed ${!isExpanded ? 'line-clamp-2' : ''}`}>
                                        {primaryUsp.description}
                                      </p>
                                      {primaryUsp.description && primaryUsp.description.length > 120 && (
                                        <button
                                          type="button"
                                          className="mt-1 text-[11px] font-semibold text-primary hover:text-primary/80"
                                          onClick={() =>
                                            setExpandedMobileCard(isExpanded ? null : cardKey)
                                          }
                                        >
                                          {isExpanded ? "Show less" : "Read more"}
                                        </button>
                                      )}
                                    </div>
                                  )}

                                  {/* Fees - Compact pill format */}
                                  <div className="inline-flex items-center gap-3 self-start px-4 py-2 bg-muted/50 rounded-full text-xs border border-border">
                                    <div>
                                      <span className="text-muted-foreground">Fees: </span>
                                      <span className="font-bold">{card.annual_fee_text === '0' ? 'FREE' : `₹${card.annual_fee_text}/yr`}</span>
                                    </div>
                                  </div>

                                  {/* Collapsible More Benefits (desktop only; hidden on mobile to keep layout clean) */}

                                  {/* CTA Buttons - Full width, stacked */}
                                  <div className="space-y-2 mt-auto pt-2">
                                    <Button className="w-full touch-target h-12 font-semibold shadow-md" onClick={() => handleApply(card)}>
                                      Apply Now
                                    </Button>
                                    <Button variant="outline" className="w-full touch-target h-10 border-2" size="sm" onClick={() => {
                                      const alias = getCardAlias(card);
                                      if (alias) {
                                        navigate(`/cards/${alias}`);
                                      } else {
                                        toast.error('Unable to view card details');
                                      }
                                    }}>
                                      View Details
                                    </Button>
                                  </div>
                                </div>
                              </div>;
                      })}
                    </div>
                  </div>
                  
                  {/* Enhanced Pagination Dots */}
                  <div className="flex justify-center gap-2 mt-6">
                    {cards[key]?.slice(0, 3).map((_: any, idx: number) => (
                      <div 
                        key={idx} 
                        className="h-1.5 rounded-full bg-muted-foreground/20 transition-all duration-300"
                        style={{ width: idx === 0 ? '24px' : '8px' }}
                      ></div>
                    ))}
                  </div>
                  
                  {/* Swipe hint with animation */}
                  <div className="text-center mt-4 flex items-center justify-center gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-4 py-2 rounded-full border border-border/30">
                      <span className="animate-pulse">←</span> 
                      <span className="font-medium">Swipe to explore</span>
                      <span className="animate-pulse">→</span>
                    </div>
                  </div>
                </div>

                {/* Desktop Grid - Hidden on mobile */}
                <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                        <h3 className="text-lg md:text-xl font-bold mb-4 line-clamp-2 min-h-[3rem]">
                          {card.name}
                        </h3>

                        {/* Fees */}
                        <div className="grid grid-cols-2 gap-3 p-4 bg-muted/50 rounded-2xl mb-4 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Joining Fee</p>
                            <p className="font-bold">
                              {card.joining_fee_text === '0' ? 'FREE' : `₹${card.joining_fee_text}`}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Annual Fee</p>
                            <p className="font-bold">
                              {card.annual_fee_text === '0' ? 'FREE' : `₹${card.annual_fee_text}`}
                            </p>
                          </div>
                        </div>

                        {/* USPs - Full display on desktop */}
                        <div className="space-y-3 mb-6 flex-grow">
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
                          <Button className="w-full touch-target" size="lg" onClick={() => handleApply(card)}>
                            Apply Now
                          </Button>
                          <Button variant="outline" className="w-full touch-target" size="sm" onClick={() => {
                            const alias = getCardAlias(card);
                            if (alias) {
                              navigate(`/cards/${alias}`);
                            } else {
                              toast.error('Unable to view card details');
                            }
                          }}>
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>;
                  })}
                </div>
              </div>
              
              {/* View All Cards Button */}
              <div className="mt-8 sm:mt-12 flex justify-center px-4 sm:px-0">
                <Button 
                  size="lg" 
                  onClick={() => {
                    navigate(`/cards?category=${category.filterValue}`);
                    window.scrollTo({
                      top: 0,
                      behavior: 'smooth'
                    });
                  }} 
                  className="w-full sm:w-auto sm:min-w-[200px] touch-target"
                >
                  View All Cards
                </Button>
              </div>
            </TabsContent>)}
        </Tabs>
      </div>
    </section>;
};
export default PopularCreditCards;