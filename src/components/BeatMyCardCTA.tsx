import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Swords, ArrowRight } from "lucide-react";

const BeatMyCardCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-8 bg-background">
      <div className="container mx-auto px-4">
        <div 
          onClick={() => navigate('/beat-my-card')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') navigate('/beat-my-card'); }}
          className="max-w-5xl mx-auto bg-gradient-to-br from-sky-50/80 to-white dark:from-sky-950/20 dark:to-background rounded-3xl p-10 md:p-14 border-[1.5px] border-sky-100 dark:border-sky-900/50 relative overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group"
          aria-label="Navigate to Beat My Card"
        >
          {/* Decorative gradient blob */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-sky-200/30 to-blue-300/20 dark:from-sky-800/20 dark:to-blue-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500" />
          
          <div className="relative z-10 text-center">
            {/* Icon with gradient background and glow */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-sky-100 to-blue-50 dark:from-sky-900/50 dark:to-blue-900/30 mb-6 shadow-lg ring-1 ring-sky-200/50 dark:ring-sky-800/50 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
              <Swords className="w-10 h-10 text-sky-600 dark:text-sky-400 group-hover:animate-pulse" />
            </div>
            
            {/* Heading */}
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-400 dark:to-blue-400 bg-clip-text text-transparent">
              Beat My Card
            </h2>
            
            {/* Subheading */}
            <p className="text-lg md:text-xl text-foreground/80 mb-8 max-w-2xl mx-auto">
              Test our AI Card Genius v/s Your Card. See the magic!
            </p>
            
            {/* CTA Button */}
            <Button
              size="lg"
              onClick={(e) => { e.stopPropagation(); navigate('/beat-my-card'); }}
              className="bg-sky-600 hover:bg-sky-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-6 text-base group/btn"
            >
              Challenge AI Card Genius
              <ArrowRight className="ml-2 w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
            
            {/* Trust indicator */}
            <p className="mt-6 text-sm text-muted-foreground font-medium">
              Find out if there's a better card for your spending
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BeatMyCardCTA;
