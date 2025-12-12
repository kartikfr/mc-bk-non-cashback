import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { cardService } from "@/services/cardService";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Clock, ChevronRight } from "lucide-react";
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
    title: "Best for Shopping",
    aliases: ['amex-platinum-travel-credit-card', 'sbi-cashback-credit-card', 'hdfc-swiggy-credit-card'],
    filterValue: 'shopping'
  },
  travel: {
    title: "Best for Travel",
    aliases: ['icici-mmt-platinum-credit-card', 'hdfc-infinia-credit-card', 'axis-bank-magnus-credit-card'],
    filterValue: 'travel'
  },
  fuel: {
    title: "Best for Fuel",
    aliases: ['indian-oil-rbl-bank-xtra-credit-card', 'idfc-power-plus-credit-card', 'indianoil-rbl-bank-credit-card'],
    filterValue: 'fuel'
  },
  beginners: {
    title: "Best for Beginners",
    aliases: ['hdfc-tata-neu-plus-credit-card', 'sbi-cashback-credit-card', 'hdfc-millenia-credit-card'],
    filterValue: 'all'
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

// Helper function to get category from card
const getCardCategory = (card: any): string => {
  if (card.category) return card.category;
  if (card.card_type) return card.card_type;
  if (card.card_category) return card.card_category;
  return '';
};

// Helper function to format category name
const formatCategoryName = (category: string): string => {
  if (!category) return '';
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Helper to get all tags from card
const getCardTags = (card: any): Array<{ id: number; name: string }> => {
  // Use tags array first (preferred)
  if (card.tags && Array.isArray(card.tags) && card.tags.length > 0) {
    return card.tags.filter((tag: any) => tag.name);
  }
  // Fallback to category if tags not available
  const cardCategory = getCardCategory(card);
  if (cardCategory) {
    return [{ id: 0, name: formatCategoryName(cardCategory) }];
  }
  return [];
};

const PopularCreditCards = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('editor');
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const filterBarRef = useRef<HTMLDivElement>(null);

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

  // Sticky filter bar effect
  useEffect(() => {
    if (!filterBarRef.current) return;

    const handleScroll = () => {
      const filterBar = filterBarRef.current;
      if (!filterBar) return;

      const section = sectionRef.current;
      if (!section) return;

      const sectionTop = section.getBoundingClientRect().top;
      const shouldStick = sectionTop <= 0;

      if (shouldStick) {
        filterBar.classList.add('sticky-filter-active');
      } else {
        filterBar.classList.remove('sticky-filter-active');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

  // Get current date for "Last Updated"
  const lastUpdated = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  if (loading) {
  return <section ref={sectionRef} className="py-[var(--section-space-lg)] bg-muted/30">
        <div className="section-shell">
          <div className="text-center">
            <div className="animate-pulse">Loading popular cards...</div>
          </div>
        </div>
      </section>;
  }

  return (
    <section ref={sectionRef} className="py-8 sm:py-12 md:py-16 bg-muted/30">
      <div className="section-shell">
        {/* Compact Header */}
        <div className="mb-4 sm:mb-5 px-4">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 sm:gap-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
              Moneycontrol's Top Cards for 2025
          </h2>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Clock className="w-3 h-3 flex-shrink-0" />
              <span>Last updated: {lastUpdated}</span>
            </div>
          </div>
        </div>

        {/* Sticky Horizontal Scroll Filter Bar */}
        <div 
          ref={filterBarRef}
          className="sticky-filter-bar mb-6 sm:mb-8 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 bg-background/95 backdrop-blur-sm border-b border-border/50 transition-all duration-300 z-30"
        >
          <div className="relative">
            {/* Scrollable Filter Chips */}
            <div className="overflow-x-auto scrollbar-hide pb-3">
              <div className="flex gap-2 sm:gap-3 min-w-max">
                {Object.entries(categories).map(([key, category]) => {
                  const isActive = activeTab === key;
                  return (
                    <button
                      key={key} 
                      onClick={() => setActiveTab(key)}
                      className={`relative flex-shrink-0 px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-medium transition-all duration-300 touch-target rounded-full whitespace-nowrap ${
                        isActive
                          ? 'text-primary font-bold bg-primary/10'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                        {category.title}
                      {/* Animated Underline */}
                      {isActive && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                      )}
                    </button>
                  );
                })}
                {/* Scroll Hint */}
                <div className="flex items-center px-2 text-muted-foreground/50 flex-shrink-0">
                  <ChevronRight className="w-4 h-4 animate-pulse" />
                </div>
                </div>
              </div>
            </div>
          </div>

        {/* Cards Content */}
              <div className="relative">
          {/* Mobile: Swipeable carousel */}
                <div className="md:hidden">
                  <div className="overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4" ref={cardsRef}>
              <div className="flex gap-5">
                {cards[activeTab]?.map((card: any, index: number) => {
                        const topUsps = customUSPs[card.seo_card_alias] || card.product_usps?.filter((usp: any) => usp.priority <= 2).sort((a: any, b: any) => a.priority - b.priority).slice(0, 2) || [];
                  const cardKey = String(card.id || card.seo_card_alias || `${activeTab}-${index}`);
                  
                  return (
                    <div key={card.id || index} className="popular-card flex-shrink-0 w-[85vw] max-w-sm snap-center bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl border border-border/50 transition-all duration-300 flex flex-col active:scale-[0.98]">
                      {/* Card Image - Shrunk by 60% */}
                      <div className="relative h-32 sm:h-36 overflow-hidden bg-gradient-to-br from-muted to-muted/50 flex-shrink-0">
                        <img src={card.card_bg_image} alt={card.name} className="w-full h-full object-contain p-4" />
                                </div>

                      <div className="p-4 sm:p-5 flex flex-col flex-grow space-y-3">
                                  {/* Card Name */}
                        <h3 className="text-base sm:text-lg font-bold line-clamp-2 leading-tight">
                                    {card.name}
                                  </h3>

                        {/* Best For Pills - Show all tags */}
                        {getCardTags(card).length > 0 && (
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold text-muted-foreground">Best For:</span>
                            {getCardTags(card).map((tag, idx) => (
                              <Badge key={tag.id || idx} variant="outline" className="text-xs font-medium border-primary/30 text-primary">
                                {tag.name}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Two Benefit Headings */}
                                  {topUsps.length > 0 && (
                          <div className="space-y-2">
                            {topUsps.slice(0, 2).map((usp: any, idx: number) => (
                              <div key={idx} className="p-2.5 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                                <p className="font-semibold text-xs sm:text-sm text-primary leading-tight">
                                  {usp.header}
                                </p>
                              </div>
                            ))}
                                    </div>
                                  )}

                        {/* Fees */}
                        <div className="inline-flex items-center gap-3 self-start px-3 py-1.5 bg-muted/50 rounded-full text-xs border border-border">
                                    <div>
                                      <span className="text-muted-foreground">Fees: </span>
                                      <span className="font-bold">{card.annual_fee_text === '0' ? 'FREE' : `₹${card.annual_fee_text}/yr`}</span>
                                    </div>
                                  </div>

                        {/* CTA Buttons - Reversed Hierarchy */}
                                  <div className="space-y-2 mt-auto pt-2">
                          <Button 
                            className="w-full touch-target h-11 font-semibold shadow-md" 
                            onClick={() => {
                                      const alias = getCardAlias(card);
                                      if (alias) {
                                        navigate(`/cards/${alias}`);
                                      } else {
                                        toast.error('Unable to view card details');
                                      }
                            }}
                          >
                                      View Details
                                    </Button>
                          <Button 
                            variant="outline" 
                            className="w-full touch-target h-10 border-2" 
                            size="sm" 
                            onClick={() => handleApply(card)}
                          >
                            Apply Now
                          </Button>
                                  </div>
                                </div>
                    </div>
                  );
                      })}
                    </div>
                  </div>
                  
            {/* Pagination Dots */}
                  <div className="flex justify-center gap-2 mt-6">
              {cards[activeTab]?.slice(0, 3).map((_: any, idx: number) => (
                      <div 
                        key={idx} 
                        className="h-1.5 rounded-full bg-muted-foreground/20 transition-all duration-300"
                        style={{ width: idx === 0 ? '24px' : '8px' }}
                />
                    ))}
                  </div>
          </div>
                  
          {/* Desktop Grid */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8" ref={cardsRef}>
            {cards[activeTab]?.map((card: any, index: number) => {
              const topUsps = customUSPs[card.seo_card_alias] || card.product_usps?.filter((usp: any) => usp.priority <= 2).sort((a: any, b: any) => a.priority - b.priority).slice(0, 2) || [];
              
              return (
                <div key={card.id || index} className="popular-card bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group flex flex-col h-full border border-border/50">
                  {/* Card Image - Shrunk by 60% */}
                  <div className="relative h-40 lg:h-44 overflow-hidden bg-gradient-to-br from-muted to-muted/50 flex-shrink-0">
                    <img src={card.card_bg_image} alt={card.name} className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500" />
                  </div>

                  <div className="p-5 lg:p-6 flex flex-col flex-grow">
                    {/* Card Name */}
                    <h3 className="text-lg md:text-xl font-bold mb-2 line-clamp-2 min-h-[3rem]">
                      {card.name}
                    </h3>

                    {/* Best For Pills - Show all tags */}
                    {getCardTags(card).length > 0 && (
                      <div className="mb-4 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground">Best For:</span>
                        {getCardTags(card).map((tag, idx) => (
                          <Badge key={tag.id || idx} variant="outline" className="text-xs font-medium border-primary/30 text-primary">
                            {tag.name}
                          </Badge>
                        ))}
                </div>
                    )}

                    {/* Two Benefit Headings */}
                    {topUsps.length > 0 && (
                      <div className="space-y-2.5 mb-5">
                        {topUsps.slice(0, 2).map((usp: any, idx: number) => (
                          <div key={idx} className="p-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                            <p className="font-semibold text-sm text-primary leading-tight">
                              {usp.header}
                            </p>
                        </div>
                        ))}
                      </div>
                    )}

                        {/* Fees */}
                    <div className="grid grid-cols-2 gap-3 p-3 bg-muted/50 rounded-xl mb-5 text-sm">
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

                    {/* CTA Buttons - Reversed Hierarchy */}
                        <div className="space-y-2 mt-auto">
                      <Button 
                        className="w-full touch-target shadow-md" 
                        size="lg" 
                        onClick={() => {
                            const alias = getCardAlias(card);
                            if (alias) {
                              navigate(`/cards/${alias}`);
                            } else {
                              toast.error('Unable to view card details');
                            }
                        }}
                      >
                            View Details
                          </Button>
                      <Button 
                        variant="outline" 
                        className="w-full touch-target border-2" 
                        size="sm" 
                        onClick={() => handleApply(card)}
                      >
                        Apply Now
                      </Button>
                        </div>
                      </div>
                </div>
              );
                  })}
                </div>
              </div>
              
              {/* View All Cards Button */}
        <div className="mt-8 sm:mt-10 flex justify-center px-4 sm:px-0">
                <Button 
                  size="lg" 
                  onClick={() => {
              navigate(`/cards?category=${categories[activeTab as keyof typeof categories].filterValue}`);
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
      </div>
    </section>
  );
};

export default PopularCreditCards;
