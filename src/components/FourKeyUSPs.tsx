import { useNavigate } from "react-router-dom";
import { Target, ArrowRight, Clock, Star } from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { Badge } from "./ui/badge";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Custom SVG Icons
const CardWithTags = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="18" width="32" height="20" rx="2" />
    <line x1="8" y1="26" x2="40" y2="26" strokeWidth="3" />
    <rect x="26" y="12" width="8" height="4" rx="1" />
    <rect x="30" y="8" width="6" height="4" rx="1" />
    <rect x="34" y="4" width="4" height="4" rx="1" />
  </svg>
);

const MagicWandSparkles = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="10" y1="38" x2="30" y2="18" />
    <path d="M30 18l2-6 2 6 6 2-6 2-2 6-2-6-6-2z" />
    <path d="M14 14l1-3 1 3 3 1-3 1-1 3-1-3-3-1z" />
    <path d="M38 30l1-3 1 3 3 1-3 1-1 3-1-3-3-1z" />
  </svg>
);

const StackedCards = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="14" width="28" height="18" rx="2" opacity="0.4" />
    <rect x="10" y="17" width="28" height="18" rx="2" opacity="0.7" />
    <rect x="14" y="20" width="28" height="18" rx="2" />
    <line x1="18" y1="28" x2="38" y2="28" />
  </svg>
);

const FourKeyUSPs = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!sectionRef.current || !cardsRef.current) return;

    const cards = cardsRef.current.querySelectorAll('.feature-card');
    
    gsap.fromTo(cards, {
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
  }, { scope: sectionRef });

  const features = [
    {
      icon: MagicWandSparkles,
      iconColor: "bg-gradient-to-br from-purple-500 to-purple-600",
      title: "Super Card Genius",
      description: "Get personalized card recommendations with estimated savings.",
      cta: "Get My Match",
      redirect: "/card-genius",
      timeLabel: "60 sec",
      isRecommended: true,
    },
    {
      icon: CardWithTags,
      iconColor: "bg-gradient-to-br from-blue-500 to-blue-600",
      title: "Category Card Genius",
      description: "Find the best card for shopping, travel, fuel, or groceries.",
      cta: "Find Category Card",
      redirect: "/card-genius-category",
      timeLabel: "30 sec",
      isRecommended: false,
    },
    {
      icon: Target,
      iconColor: "bg-gradient-to-br from-green-500 to-green-600",
      title: "Beat My Card",
      description: "Compare your current card with better alternatives.",
      cta: "Compare Now",
      redirect: "/beat-my-card",
      timeLabel: "1 min",
      isRecommended: false,
    },
    {
      icon: StackedCards,
      iconColor: "bg-gradient-to-br from-orange-500 to-orange-600",
      title: "Browse All Cards",
      description: "Explore 100+ cards with verified fees and benefits.",
      cta: "Explore Cards",
      redirect: "/cards",
      timeLabel: "",
      isRecommended: false,
    }
  ];

  return (
    <section ref={sectionRef} className="py-16 sm:py-20 md:py-24 bg-background">
      <div className="section-shell">
        {/* Section Heading - Minimal */}
        <div className="text-center mb-8 sm:mb-12 px-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3">
            Find Your Perfect Card
          </h2>
        </div>

        {/* Feature Cards Grid */}
        <div ref={cardsRef} className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-6 lg:gap-8 px-2 sm:px-0">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isSuperGenius = feature.isRecommended;
            
            return (
              <div
                key={index}
                onClick={() => {
                  navigate(feature.redirect);
                  setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                }}
                className={`feature-card bg-card rounded-xl sm:rounded-2xl shadow-card p-4 sm:p-6 md:p-8 flex flex-col cursor-pointer transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 sm:hover:-translate-y-2 group h-full touch-target relative ${
                  isSuperGenius 
                    ? 'border-2 border-primary/40 lg:scale-105 lg:z-10 order-first' 
                    : ''
                }`}
              >
                {/* Recommended Badge */}
                {isSuperGenius && (
                  <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 z-20">
                    <Badge className="bg-primary text-primary-foreground text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 shadow-lg flex items-center gap-1">
                      <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                      <span className="hidden sm:inline">Recommended</span>
                      <span className="sm:hidden">⭐</span>
                    </Badge>
                  </div>
                )}

                {/* Icon */}
                <div className={`w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full ${feature.iconColor} flex items-center justify-center mb-3 sm:mb-4 md:mb-5 group-hover:scale-110 transition-transform duration-300 mx-auto ${isSuperGenius ? 'ring-2 ring-primary/30' : ''}`}>
                  <Icon className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
                </div>

                {/* Title */}
                <h3 className={`text-sm sm:text-base md:text-lg lg:text-xl font-bold text-foreground mb-1.5 sm:mb-2 text-center leading-tight ${isSuperGenius ? 'text-primary' : ''}`}>
                  {feature.title}
                </h3>

                {/* Time Label - Only if exists */}
                {feature.timeLabel && (
                  <div className="flex items-center justify-center mb-2 sm:mb-3 md:mb-4">
                    <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span className="font-medium">{feature.timeLabel}</span>
                    </div>
                  </div>
                )}

                {/* Description - Concise */}
                <p className="text-[11px] sm:text-xs md:text-sm text-muted-foreground leading-relaxed mb-3 sm:mb-4 md:mb-6 text-center flex-grow line-clamp-3 sm:line-clamp-none">
                  {feature.description}
                </p>

                {/* CTA Button */}
                <div className={`mt-auto flex items-center justify-center gap-1.5 sm:gap-2 text-primary text-[11px] sm:text-xs md:text-sm font-semibold group-hover:gap-2 sm:group-hover:gap-3 transition-all ${
                  isSuperGenius ? 'text-primary font-bold' : ''
                }`}>
                  <span className="text-center">{feature.cta}</span>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FourKeyUSPs;
