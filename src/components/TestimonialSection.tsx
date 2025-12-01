import { useEffect, useRef } from "react";
import { Star, Quote } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
const testimonials = [{
  name: "Rahul Sharma",
  role: "Software Engineer",
  image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
  rating: 5,
  text: "Saved ₹45,000 last year just by switching to the right cards. The AI Card Genius tool is a game-changer!",
  savings: "₹45,000/year"
}, {
  name: "Priya Menon",
  role: "Marketing Manager",
  image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
  rating: 5,
  text: "I had 3 credit cards but was using them all wrong. Now I know exactly which card to use where. My cashback tripled!",
  savings: "₹32,000/year"
}, {
  name: "Amit Patel",
  role: "Business Owner",
  image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
  rating: 5,
  text: "The category-based recommendations are spot on. I'm earning more rewards than ever on my business expenses.",
  savings: "₹78,000/year"
}, {
  name: "Sneha Reddy",
  role: "Consultant",
  image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
  rating: 5,
  text: "Finally, someone who makes credit cards simple! No jargon, just real savings. Love the comparison features.",
  savings: "₹28,500/year"
}, {
  name: "Vikram Singh",
  role: "Travel Blogger",
  image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
  rating: 5,
  text: "Got my dream travel card through MoneyControl. Free flights, lounge access, and amazing rewards. Worth every penny!",
  savings: "₹92,000/year"
}, {
  name: "Ananya Iyer",
  role: "Doctor",
  image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
  rating: 5,
  text: "As a busy professional, I don't have time to research cards. This platform did it for me in minutes. Brilliant!",
  savings: "₹41,200/year"
}, {
  name: "Karan Malhotra",
  role: "Entrepreneur",
  image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop",
  rating: 5,
  text: "The fuel card recommendations alone saved me thousands. Plus the dining rewards are incredible. Highly recommend!",
  savings: "₹55,000/year"
}, {
  name: "Divya Kapoor",
  role: "Teacher",
  image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
  rating: 5,
  text: "I was skeptical about premium cards but the calculator showed me how much I'd save. Now I'm a believer!",
  savings: "₹35,800/year"
}];
const TestimonialCard = ({
  testimonial,
  index
}: {
  testimonial: typeof testimonials[0];
  index: number;
}) => <div className="testimonial-card flex-shrink-0 w-72 sm:w-80 md:w-96 bg-card rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-lg transition-shadow duration-300 border border-border/50">
    <div className="flex items-center gap-1 mb-3 sm:mb-4">
      {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />)}
    </div>
    
    <Quote className="w-6 h-6 sm:w-8 sm:h-8 text-primary/20 mb-2 sm:mb-3" />
    
    <p className="text-sm sm:text-base text-foreground mb-4 sm:mb-6 leading-relaxed line-clamp-4">
      "{testimonial.text}"
    </p>
    
    <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-border/50">
      <div className="flex items-center gap-2 sm:gap-3">
        <img src={testimonial.image} alt={testimonial.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-primary/20" loading="lazy" />
        <div>
          <p className="font-semibold text-sm sm:text-base text-foreground">{testimonial.name}</p>
          <p className="text-xs sm:text-sm text-muted-foreground">{testimonial.role}</p>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-[10px] sm:text-xs text-muted-foreground">Saved</p>
        <p className="text-xs sm:text-sm font-bold text-green-600">{testimonial.savings}</p>
      </div>
    </div>
  </div>;
const TestimonialSection = () => {
  const rowRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!rowRef.current) return;

    // Enable infinite scroll on all screen sizes
    // Adjust duration based on screen size - slower on mobile for better readability
    const duration = window.innerWidth < 768 ? 60 : 50;

    const tween = gsap.to(rowRef.current, {
      x: "-50%",
      duration: duration,
      ease: "none",
      repeat: -1
    });
    
    return () => tween.kill();
  }, [rowRef]);

  useEffect(() => {
    if (!sectionRef.current) return;
    gsap.fromTo(sectionRef.current, {
      opacity: 0,
      y: 50
    }, {
      opacity: 1,
      y: 0,
      duration: 1,
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
        end: "top 50%",
        scrub: 1
      }
    });
  }, []);
  return <section ref={sectionRef} className="py-[var(--section-space-lg)] bg-gradient-to-b from-background via-accent/5 to-background overflow-hidden">
      <div className="section-shell mb-8 sm:mb-12">
        <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4 px-4">
          {/* Overall Rating - Prominent on mobile */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-2">
            <div className="flex items-center gap-1">
              <span className="text-2xl sm:text-3xl text-yellow-500">★★★★★</span>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-lg sm:text-xl font-bold text-foreground">4.8 out of 5</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Based on 2,247 reviews</p>
            </div>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            India's Smartest Are Saving
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
            See how everyday people are saving thousands with the right credit card
          </p>
        </div>
      </div>

      {/* Infinite horizontal scroll with gradient edges */}
      <div className="relative">
        {/* Gradient edges */}
        <div className="absolute inset-y-0 left-0 w-8 sm:w-12 md:w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-8 sm:w-12 md:w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        
        <div className="overflow-hidden">
          <div ref={rowRef} className="flex gap-4 sm:gap-6" style={{ width: "200%" }}>
            {[...testimonials, ...testimonials].map((testimonial, index) => <TestimonialCard key={`testimonial-${index}`} testimonial={testimonial} index={index} />)}
          </div>
        </div>
      </div>

      {/* Stats section */}
      <div className="section-shell mt-12 sm:mt-16">
        <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto px-4">
          <div className="text-center">
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1 sm:mb-2">100+</p>
            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground leading-tight">Credit Cards Reviewed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1 sm:mb-2">₹10K</p>
            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground leading-tight">Avg. Annual Savings</p>
          </div>
          <div className="text-center">
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1 sm:mb-2">6+</p>
            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground leading-tight">Spending Categories</p>
          </div>
        </div>
      </div>
    </section>;
};
export default TestimonialSection;