import { useNavigate } from "react-router-dom";
import { CreditCard, Sparkles, Target, TrendingUp, ArrowRight } from "lucide-react";

const FourKeyUSPs = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: CreditCard,
      iconColor: "bg-blue-500",
      title: "Card Genius by Category",
      description: "Choose your spending category, answer a few questions, and find the perfect card tailored to your needs",
      cta: "Get Started",
      redirect: "/card-genius"
    },
    {
      icon: Sparkles,
      iconColor: "bg-purple-500",
      title: "Super Card Genius",
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
      icon: TrendingUp,
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
