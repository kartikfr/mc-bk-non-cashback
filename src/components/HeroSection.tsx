import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { CreditCard3D } from "./CreditCard3D";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Sparkles, CreditCard } from "lucide-react";

gsap.registerPlugin(useGSAP, ScrollTrigger);
const HeroSection = () => {
  const navigate = useNavigate();
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadlineRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const floatingElementsRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const timeline = gsap.timeline({
      defaults: {
        ease: "power3.out",
        force3D: true
      }
    });

    timeline.from(headlineRef.current, {
      y: 60,
      opacity: 0,
      duration: 1
    }).from(subheadlineRef.current, {
      y: 40,
      opacity: 0,
      duration: 0.8
    }, "-=0.6").from(cardRef.current, {
      y: 80,
      opacity: 0,
      scale: 0.9,
      duration: 1.2,
      ease: "power3.out"
    }, "-=0.4");

    // Parallax effect for floating background elements
    if (floatingElementsRef.current) {
      const floatingCircles = floatingElementsRef.current.querySelectorAll('.floating-circle');
      
      floatingCircles.forEach((circle, index) => {
        gsap.to(circle, {
          y: -100 - (index * 30),
          scrollTrigger: {
            trigger: floatingElementsRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1.5,
            invalidateOnRefresh: true
          }
        });
      });
    }

    return () => {
      timeline.kill();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);
  return <section className="relative overflow-visible sm:overflow-hidden bg-gradient-hero pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 lg:pb-20 min-h-[85vh] sm:min-h-screen flex items-center">
      {/* Animated Background Elements with Parallax - Simplified on mobile */}
      <div ref={floatingElementsRef} className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 sm:opacity-100">
        {/* Floating circles - fewer on mobile */}
        {[...Array(5)].map((_, i) => <div key={i} className={`floating-circle absolute rounded-full bg-primary/5 animate-float ${i > 2 ? 'hidden sm:block' : ''}`} style={{
        width: `${Math.random() * 300 + 100}px`,
        height: `${Math.random() * 300 + 100}px`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${i * 0.5}s`,
        animationDuration: `${Math.random() * 10 + 15}s`
      }} />)}
      </div>

      <div className="section-shell relative z-10 w-full">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left space-y-5 sm:space-y-6 md:space-y-7 max-w-2xl w-full order-2 lg:order-1">
            <h1 ref={headlineRef} className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-charcoal-900 leading-[1.1] tracking-tight px-2 sm:px-0">
              You're Losing Money{" "}
              <span className="text-[hsl(145,100%,33%)]">
                With the Wrong Card
              </span>
            </h1>

            <p ref={subheadlineRef} className="text-sm sm:text-base md:text-lg lg:text-xl text-charcoal-700 max-w-xl mx-auto lg:mx-0 leading-snug px-4 sm:px-0 line-clamp-2">
              Find the credit card that pays you back for living your life. Get personalized recommendations in 60 seconds.
            </p>

            {/* CTA Buttons */}
            <div ref={ctaRef} className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start opacity-100 pt-1 sm:pt-2 px-4 sm:px-0">
              <Button 
                size="lg" 
                onClick={() => {
                  navigate("/cards");
                  setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                }} 
                className="w-full sm:w-auto group shadow-xl text-base sm:text-lg px-6 sm:px-8 py-6 sm:py-7 touch-target"
              >
                <CreditCard className="mr-2 w-5 h-5" />
                Find My Best Card
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => {
                  navigate("/card-genius");
                  setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                }} 
                className="w-full sm:w-auto shadow-lg text-base sm:text-lg px-6 sm:px-8 py-6 sm:py-7 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground touch-target"
              >
                <Sparkles className="mr-2 w-5 h-5" />
                <span className="hidden xs:inline">Try AI Card Recommendation</span>
                <span className="xs:hidden">AI Recommendation</span>
              </Button>
            </div>
          </div>

          {/* Right Content - 3D Card - Visible on all screens */}
          <div ref={cardRef} className="flex justify-center items-center w-full pointer-events-auto order-1 lg:order-2 px-2 sm:px-4 lg:px-0 py-4 sm:py-0 overflow-visible">
            <CreditCard3D 
              cardName="Your Dream Card" 
              estimatedSavings={8450}
              className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-[380px] lg:max-w-[450px] xl:max-w-[500px]" 
            />
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 sm:h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>;
};
export default HeroSection;