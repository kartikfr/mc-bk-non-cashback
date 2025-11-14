import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Sparkles, ArrowRight } from "lucide-react";

const CardGeniusCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-8 bg-background">
      <div className="container mx-auto px-4">
        <div 
          onClick={() => navigate('/card-genius')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') navigate('/card-genius'); }}
          className="max-w-5xl mx-auto bg-gradient-to-br from-emerald-50/80 to-white dark:from-emerald-950/20 dark:to-background rounded-3xl p-10 md:p-14 border-[1.5px] border-emerald-100 dark:border-emerald-900/50 relative overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group"
          aria-label="Navigate to Card Genius"
        >
          {/* Decorative gradient blob */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-emerald-200/30 to-green-300/20 dark:from-emerald-800/20 dark:to-green-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500" />
          
          <div className="relative z-10 text-center">
            {/* Icon with gradient background and glow */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-green-50 dark:from-emerald-900/50 dark:to-green-900/30 mb-6 shadow-lg ring-1 ring-emerald-200/50 dark:ring-emerald-800/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <Sparkles className="w-10 h-10 text-emerald-600 dark:text-emerald-400 group-hover:animate-pulse" />
            </div>
            
            {/* Heading */}
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-green-600 dark:from-emerald-400 dark:to-green-400 bg-clip-text text-transparent">
              Super Card Genius
            </h2>
            
            {/* Subheading */}
            <p className="text-lg md:text-xl text-foreground/80 mb-8 max-w-2xl mx-auto">
              AI Powered tool to find the best card for <span className="text-emerald-600 dark:text-emerald-400 font-semibold">YOU!</span>
            </p>
            
            {/* CTA Button */}
            <Button
              size="lg"
              onClick={(e) => { e.stopPropagation(); navigate('/card-genius'); }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-6 text-base group/btn"
            >
              Try Card Genius
              <ArrowRight className="ml-2 w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
            
            {/* Trust indicator */}
            <p className="mt-6 text-sm text-muted-foreground font-medium">
              Get personalized recommendations in under <strong className="text-foreground">2 minutes</strong>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CardGeniusCTA;
