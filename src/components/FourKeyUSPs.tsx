import { useNavigate } from "react-router-dom";
import { Target, ArrowRight, Wand2, Layers } from "lucide-react";

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

  const features = [
    {
      icon: CardWithTags,
      iconColor: "bg-blue-500",
      title: "AI Category Card Genius",
      description: "Choose your spending category, answer a few questions, and find the perfect card tailored to your needs",
      cta: "Get Started",
      redirect: "/card-genius-category"
    },
    {
      icon: MagicWandSparkles,
      iconColor: "bg-purple-500",
      title: "AI Super Card Genius",
      description: "Complete our 19-question assessment and get personalized card recommendations ranked by Net Annual Savings",
      cta: "Get Started",
      redirect: "/card-genius"
    },
    {
      icon: Target,
      iconColor: "bg-green-500",
      title: "Beat My Card",
      description: "Compare your existing card with better alternatives based on your actual spending patterns and save more",
      cta: "Get Started",
      redirect: "/beat-my-card"
    },
    {
      icon: StackedCards,
      iconColor: "bg-orange-500",
      title: "Browse All Cards",
      description: "Explore our comprehensive database of credit cards with detailed comparisons and real user reviews",
      cta: "Get Started",
      redirect: "/cards"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Find Your Perfect Card in 4 Easy Ways
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the method that works best for you
          </p>
        </div>

        {/* 4 Circular Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                onClick={() => {
                  navigate(feature.redirect);
                  setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                }}
                className="bg-card rounded-2xl shadow-card p-8 flex flex-col items-center text-center cursor-pointer transition-all duration-300 hover:shadow-card-hover hover:-translate-y-2 group h-full"
              >
                {/* Circular Icon */}
                <div className={`w-24 h-24 rounded-full ${feature.iconColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-12 h-12 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-foreground mb-4 min-h-[3.5rem] flex items-center">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-grow">
                  {feature.description}
                </p>

                {/* CTA */}
                <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                  <span>{feature.cta}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
