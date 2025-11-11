import { Button } from "./ui/button";
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FinalCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-gradient-to-br from-primary/5 via-background to-primary/5">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-8">
            <TrendingUp className="w-10 h-10 text-primary" />
          </div>

          {/* Heading */}
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Find Your Perfect Credit Card?
          </h2>

          {/* Subheading */}
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Compare hundreds of credit cards, check your eligibility, and apply online in minutes. 
            Get expert recommendations tailored to your spending habits.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mb-12">
            <div className="p-6 rounded-xl bg-card shadow-md">
              <div className="text-3xl font-bold text-primary mb-2">200+</div>
              <div className="text-sm text-muted-foreground">Credit Cards</div>
            </div>
            <div className="p-6 rounded-xl bg-card shadow-md">
              <div className="text-3xl font-bold text-primary mb-2">₹45K</div>
              <div className="text-sm text-muted-foreground">Avg. Savings/Year</div>
            </div>
            <div className="p-6 rounded-xl bg-card shadow-md">
              <div className="text-3xl font-bold text-primary mb-2">2M+</div>
              <div className="text-sm text-muted-foreground">Happy Users</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="group shadow-xl min-w-[250px]"
              onClick={() => navigate("/cards")}
            >
              <Sparkles className="mr-2 group-hover:rotate-12 transition-transform" />
              Explore All Cards
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="shadow-lg min-w-[250px]"
              onClick={() => navigate("/card-genius")}
            >
              Try Card Genius
            </Button>
          </div>

          {/* Trust Badge */}
          <div className="mt-12 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>100% Safe & Secure | No Hidden Charges | Instant Eligibility Check</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
