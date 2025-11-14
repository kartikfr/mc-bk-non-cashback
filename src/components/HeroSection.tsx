import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { CreditCard3D } from "./CreditCard3D";
import { gsap } from "gsap";
import { Sparkles, GitCompare, Cpu, Wallet } from "lucide-react";

const HeroSection = () => {
  const navigate = useNavigate();
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadlineRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

    timeline
      .from(headlineRef.current, {
        y: 60,
        opacity: 0,
        duration: 1,
      })
      .from(
        subheadlineRef.current,
        {
          y: 40,
          opacity: 0,
          duration: 0.8,
        },
        "-=0.6"
      );
    
    // Animate stats separately without affecting buttons
    if (statsRef.current) {
      gsap.from(statsRef.current.children, {
        scale: 0.8,
        opacity: 0,
        stagger: 0.1,
        duration: 0.5,
        delay: 0.8,
      });
    }
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero pt-20">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating circles */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-primary/5 animate-float"
            style={{
              width: `${Math.random() * 300 + 100}px`,
              height: `${Math.random() * 300 + 100}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${Math.random() * 10 + 15}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left space-y-8">
            <h1
              ref={headlineRef}
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-charcoal-900 leading-tight"
            >
              Stop Leaving{" "}
              <span className="bg-gradient-accent bg-clip-text text-transparent">
                Money
              </span>{" "}
              on the Table
            </h1>

            <p
              ref={subheadlineRef}
              className="text-xl md:text-2xl text-charcoal-700 max-w-2xl mx-auto lg:mx-0"
            >
              Find the credit card that pays you back for living your life. Get personalized recommendations in 60 seconds.
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm text-charcoal-600">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-primary" />
                <span className="font-medium">AI-Powered Picks</span>
              </div>
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" />
                <span className="font-medium">₹1K-5K Real Cashback</span>
              </div>
              <div className="flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-primary" />
                <span className="font-medium">Easy Comparison</span>
              </div>
            </div>

            {/* CTA Buttons - Always Visible */}
            <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start opacity-100">
              <Button
                size="lg"
                onClick={() => {
                  navigate("/cards");
                  setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                }}
                className="group shadow-xl"
              >
                <Sparkles className="mr-2 group-hover:rotate-12 transition-transform" />
                Discover Credit Cards
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  navigate("/card-genius");
                  setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                }}
                className="shadow-lg"
              >
                Try AI Card Recommendation
              </Button>
            </div>

            {/* Stats */}
            <div ref={statsRef} className="grid grid-cols-3 gap-6 pt-8 border-t border-charcoal-200">
              <div className="text-center lg:text-left">
                <div className="text-3xl md:text-4xl font-mono font-bold text-primary">100+</div>
                <div className="text-sm text-charcoal-600 mt-1">Credit Cards</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl md:text-4xl font-mono font-bold text-primary">₹10K</div>
                <div className="text-sm text-charcoal-600 mt-1">Avg. Yearly Savings</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl md:text-4xl font-mono font-bold text-primary">6+</div>
                <div className="text-sm text-charcoal-600 mt-1">Categories Covered</div>
              </div>
            </div>
          </div>

          {/* Right Content - 3D Card */}
          <div className="flex justify-center items-center lg:justify-end">
            <CreditCard3D
              cardImage="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&auto=format&fit=crop"
              cardName="Your Dream Card"
              className="w-full max-w-lg"
            />
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  );
};

export default HeroSection;
