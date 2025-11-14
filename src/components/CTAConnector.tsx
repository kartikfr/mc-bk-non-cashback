import { Zap } from "lucide-react";

const CTAConnector = () => {
  return (
    <div className="relative -my-8 py-8 flex items-center justify-center">
      {/* Animated vertical line */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-px h-full bg-gradient-to-b from-emerald-200 via-sky-200 to-emerald-200 dark:from-emerald-900 dark:via-sky-900 dark:to-emerald-900 opacity-30" />
      </div>
      
      {/* Animated dots */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 dark:bg-emerald-600 animate-pulse" style={{ animationDelay: '0s' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-sky-400 dark:bg-sky-600 animate-pulse" style={{ animationDelay: '0.3s' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 dark:bg-emerald-600 animate-pulse" style={{ animationDelay: '0.6s' }} />
      </div>
      
      {/* Central badge */}
      <div className="relative z-10 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-50 via-sky-50 to-emerald-50 dark:from-emerald-950 dark:via-sky-950 dark:to-emerald-950 border border-border/50 shadow-lg">
        <Zap className="w-4 h-4 text-primary animate-pulse" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Choose Your Path
        </span>
        <Zap className="w-4 h-4 text-secondary animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>
    </div>
  );
};

export default CTAConnector;
