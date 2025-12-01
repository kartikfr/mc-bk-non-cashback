import { useNavigate } from "react-router-dom";
import { Target, ArrowRight, Wand2, Layers } from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Custom SVG Icons for better visual representation
const CardWithTags = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {/* Main card */}
    <rect x="8" y="18" width="32" height="20" rx="2" />
    {/* Card stripe */}
    <line x1="8" y1="26" x2="40" y2="26" strokeWidth="3" />
    {/* Category tags */}
    <rect x="26" y="12" width="8" height="4" rx="1" />
    <rect x="30" y="8" width="6" height="4" rx="1" />
    <rect x="34" y="4" width="4" height="4" rx="1" />
  </svg>
);

const MagicWandSparkles = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {/* Wand stick */}
    <line x1="10" y1="38" x2="30" y2="18" />
    {/* Wand tip star */}
    <path d="M30 18l2-6 2 6 6 2-6 2-2 6-2-6-6-2z" />
    {/* Sparkle 1 */}
    <path d="M14 14l1-3 1 3 3 1-3 1-1 3-1-3-3-1z" />
    {/* Sparkle 2 */}
    <path d="M38 30l1-3 1 3 3 1-3 1-1 3-1-3-3-1z" />
  </svg>
);

const StackedCards = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {/* Card 1 (back) */}
    <rect x="6" y="14" width="28" height="18" rx="2" opacity="0.4" />
    {/* Card 2 (middle) */}
    <rect x="10" y="17" width="28" height="18" rx="2" opacity="0.7" />
    {/* Card 3 (front) */}
    <rect x="14" y="20" width="28" height="18" rx="2" />
    {/* Card detail line */}
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
      icon: CardWithTags,
      iconColor: "bg-blue-500",
      title: "Category Card Genius",
      description: "AI Powered tool to find the best card by category for your spends",
      cta: "Get Started",
      redirect: "/card-genius-category"
    },
    {
      icon: MagicWandSparkles,
      iconColor: "bg-purple-500",
      title: "Super Card Genius",
      description: "AI Powered tool to find the best card for YOU!",
      cta: "Get Started",
      redirect: "/card-genius"
    },
    {
      icon: Target,
      iconColor: "bg-green-500",
      title: "Beat My Card",
      description: "Test our Card Genius AI v/s Your Card. See the magic!",
      cta: "Get Started",
      redirect: "/beat-my-card"
    },
    {
      icon: StackedCards,
      iconColor: "bg-orange-500",
      title: "Browse All Cards",
      description: "Browse all cards with clear benefits, fees, and features in one place.",
      cta: "Get Started",
      redirect: "/cards"
    }
  ];

  return (
    <section ref={sectionRef} className="py-12 sm:py-16 md:py-20 lg:py-24 bg-background">
      <div className="section-shell">
        {/* Section Heading */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16 space-y-3 sm:space-y-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground px-4">
            Find Your Perfect Card
          </h2>
        </div>

        {/* 4 Circular Feature Cards - Mobile: 2x2, Tablet: 2x2, Desktop: 1x4 */}
        <div ref={cardsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                onClick={() => {
                  navigate(feature.redirect);
                  setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                }}
                className="feature-card bg-card rounded-xl sm:rounded-2xl shadow-card p-4 sm:p-6 md:p-8 flex flex-col items-center text-center cursor-pointer transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 sm:hover:-translate-y-2 group h-full touch-target"
              >
                {/* Circular Icon */}
                <div className={`w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full ${feature.iconColor} flex items-center justify-center mb-3 sm:mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-foreground mb-2 sm:mb-3 min-h-[2.5rem] sm:min-h-[3rem] flex items-center px-1">
                  {feature.title}
                </h3>

                {/* Description - Hidden on mobile, shown on tablet+ */}
                <p className="hidden sm:block text-xs md:text-sm text-muted-foreground leading-relaxed mb-4 md:mb-6 flex-grow">
                  {feature.description}
                </p>

                {/* CTA */}
                <div className="flex items-center gap-1.5 sm:gap-2 text-primary text-xs sm:text-sm md:text-base font-semibold group-hover:gap-2 sm:group-hover:gap-3 transition-all">
                  <span>{feature.cta}</span>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
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
