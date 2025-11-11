import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Calculator } from "lucide-react";
import { Button } from "./ui/button";
import gsap from "gsap";

const HeroSection = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      // Card rotation animation
      gsap.to(cardRef.current, {
        rotateY: 360,
        duration: 20,
        repeat: -1,
        ease: "none"
      });

      // Float animation
      gsap.to(cardRef.current, {
        y: -20,
        duration: 2,
        yoyo: true,
        repeat: -1,
        ease: "power1.inOut"
      });
    }

    if (contentRef.current) {
      const children = contentRef.current.children;
      gsap.from(children, {
        opacity: 0,
        y: 50,
        duration: 1.2,
        stagger: 0.2,
        ease: "power3.out"
      });
    }
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero pt-20">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-primary/10 rounded-full blur-3xl -top-48 -left-48 animate-float"></div>
        <div className="absolute w-96 h-96 bg-secondary/10 rounded-full blur-3xl -bottom-48 -right-48 animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div ref={contentRef} className="text-center lg:text-left">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Find Your Perfect <br />
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Credit Card
              </span>{" "}
              in 60 Seconds
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8">
              AI-powered recommendations. Real savings. Zero hassle.
            </p>

            <div className="flex flex-wrap gap-4 justify-center lg:justify-start mb-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Trusted by 2M+ Indians
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                100% Free
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Unbiased Advice
              </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link to="/cards">
                <Button size="lg" className="shadow-xl hover:shadow-glow transition-all">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Find Me The Best Card
                </Button>
              </Link>
              <Link to="/card-genius">
                <Button size="lg" variant="outline" className="border-2 hover:bg-accent">
                  <Calculator className="w-5 h-5 mr-2" />
                  Try Card Genius
                </Button>
              </Link>
            </div>
          </div>

          {/* Animated Card */}
          <div className="relative flex justify-center lg:justify-end">
            <div 
              ref={cardRef}
              className="relative w-80 h-52 rounded-2xl shadow-2xl overflow-hidden"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-glow to-secondary rounded-2xl p-6 text-white">
                <div className="flex justify-between items-start mb-8">
                  <div className="text-sm font-medium">MoneyControl</div>
                  <div className="w-12 h-8 bg-white/20 rounded"></div>
                </div>
                <div className="space-y-2 mb-6">
                  <div className="w-3/4 h-3 bg-white/30 rounded"></div>
                  <div className="w-1/2 h-3 bg-white/30 rounded"></div>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-xs opacity-70">Card Number</div>
                    <div className="font-mono text-sm">•••• •••• •••• 1234</div>
                  </div>
                  <div className="w-10 h-10 bg-white/20 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
