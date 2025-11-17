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
}) => <div className="testimonial-card flex-shrink-0 w-80 bg-card rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-border/50 hover:border-primary/30">
    <div className="flex items-center gap-1 mb-4">
      {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
    </div>
    
    <Quote className="w-8 h-8 text-primary/20 mb-3" />
    
    <p className="text-foreground mb-6 leading-relaxed">
      "{testimonial.text}"
    </p>
    
    <div className="flex items-center justify-between pt-4 border-t border-border/50">
      <div className="flex items-center gap-3">
        <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20" />
        <div>
          <p className="font-semibold text-foreground">{testimonial.name}</p>
          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs text-muted-foreground">Saved</p>
        <p className="text-sm font-bold text-green-600">{testimonial.savings}</p>
      </div>
    </div>
  </div>;
const TestimonialSection = () => {
  const rowRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!rowRef.current) return;

    // Infinite scroll animation (left to right)
    gsap.to(rowRef.current, {
      x: "-50%",
      duration: 50,
      ease: "none",
      repeat: -1
    });

    // Section fade in on scroll
    if (sectionRef.current) {
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
    }
  }, []);
  return <section ref={sectionRef} className="py-20 bg-gradient-to-b from-background via-accent/5 to-background overflow-hidden">
      <div className="container mx-auto px-4 mb-12">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-semibold">Real Stories, Real Savings</span>
          </div>
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mx-0 px-[40px] my-0 md:text-5xl">India’s Smartest Are Saving</h2>
          <p className="text-xl text-muted-foreground">
            See how everyday people like you are earning more rewards and saving thousands with the right credit card
          </p>
        </div>
      </div>

      {/* Single horizontal scroll */}
      <div className="relative">
        <div className="overflow-hidden">
          <div ref={rowRef} className="flex gap-6" style={{
          width: "200%"
        }}>
            {[...testimonials, ...testimonials].map((testimonial, index) => <TestimonialCard key={`testimonial-${index}`} testimonial={testimonial} index={index} />)}
          </div>
        </div>
      </div>

      {/* Stats section */}
      <div className="container mx-auto px-4 mt-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <p className="text-4xl font-bold text-primary mb-2">100+</p>
            <p className="text-sm text-muted-foreground">Credit Cards Reviewed</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-primary mb-2">₹10K</p>
            <p className="text-sm text-muted-foreground">Avg. Annual Savings</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-primary mb-2">6+</p>
            <p className="text-sm text-muted-foreground">Spending Categories</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-primary mb-2">24/7</p>
            <p className="text-sm text-muted-foreground">Real Insight</p>
          </div>
        </div>
      </div>
    </section>;
};
export default TestimonialSection;