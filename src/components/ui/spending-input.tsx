import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface SpendingInputProps {
  question: string;
  emoji: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  showCurrency?: boolean;
  showRupee?: boolean;
  suffix?: string;
  context?: string; // Why this question matters
  presets?: number[]; // Custom presets for quick selection
}

export const SpendingInput = ({
  question,
  emoji,
  value,
  onChange,
  min = 0,
  max = 1000000,
  step = 500,
  className,
  showCurrency = true,
  showRupee = true,
  suffix = "",
  context,
  presets,
}: SpendingInputProps) => {
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const [isSliderHovered, setIsSliderHovered] = useState(false);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    setLocalValue(val);
    onChange(val);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setLocalValue(val);
    onChange(val);
  };

  const handlePresetClick = (presetValue: number) => {
    const clampedValue = Math.max(min, Math.min(max, presetValue));
    setLocalValue(clampedValue);
    onChange(clampedValue);
  };

  const percentage = ((localValue - min) / (max - min)) * 100;

  // Generate presets based on max value if custom presets not provided
  const getDefaultPresets = () => {
    if (max <= 10000) {
      return [0, Math.floor(max * 0.2), Math.floor(max * 0.5), Math.floor(max * 0.7), max];
    } else if (max <= 50000) {
      return [0, 2000, 5000, 10000, 20000];
    } else if (max <= 100000) {
      return [0, 2000, 5000, 10000, 20000];
    } else {
      return [0, 20000, 50000, 100000, 200000];
    }
  };

  const finalPresets = (presets || getDefaultPresets()).filter(p => p <= max);

  // Generate intermediate markers for the slider
  const generateMarkers = () => {
    const range = max - min;
    const markers: number[] = [];
    
    // Determine interval based on range
    let interval: number;
    if (range <= 10000) {
      // For ranges up to 10k, use 2k intervals
      interval = 2000;
    } else if (range <= 50000) {
      // For ranges up to 50k, use 10k intervals
      interval = 10000;
    } else if (range <= 100000) {
      // For ranges up to 100k, use 20k intervals
      interval = 20000;
    } else if (range <= 500000) {
      // For ranges up to 500k, use 100k intervals
      interval = 100000;
    } else {
      // For larger ranges, use 200k intervals
      interval = 200000;
    }
    
    // Generate markers
    let current = min;
    while (current <= max) {
      markers.push(current);
      current += interval;
    }
    
    // Ensure max is included
    if (markers[markers.length - 1] !== max) {
      markers.push(max);
    }
    
    return markers;
  };
  
  const markers = generateMarkers();

  return (
    <div className={cn("mb-4 sm:mb-5 p-4 sm:p-5 bg-white rounded-xl sm:rounded-2xl shadow-card transition-all duration-300", isFocused && "shadow-card-hover ring-2 ring-primary/20", className)}>
      <label className="block mb-2 sm:mb-3">
        <span className="text-lg sm:text-xl md:text-2xl font-semibold text-charcoal-800">
          {question} <span className="text-2xl sm:text-3xl md:text-4xl ml-1 sm:ml-2">{emoji}</span>
        </span>
      </label>
      
      {/* Context/Subtext */}
      {context && (
        <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
          {context}
        </p>
      )}

      <div className="relative mb-4 sm:mb-6">
        {showRupee && showCurrency && (
          <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-charcoal-500 text-lg sm:text-xl pointer-events-none">
            ₹
          </span>
        )}
        <input
          type="number"
          value={localValue}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            "w-full pr-3 sm:pr-4 py-3 sm:py-4 text-xl sm:text-2xl font-mono font-bold text-primary border-2 border-charcoal-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 touch-target",
            (showRupee && showCurrency) ? "pl-10 sm:pl-12" : "pl-3 sm:pl-4"
          )}
          placeholder="0"
          min={min}
          step={step}
        />
        {suffix && (
          <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-charcoal-500 text-xs sm:text-sm pointer-events-none">
            {suffix}
          </span>
        )}
      </div>

      {/* Slider Label */}
      <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 font-medium">
        Drag the slider or type the amount
      </p>

      {/* Quick-tap Presets */}
      {finalPresets.length > 0 && (
        <div className="flex gap-1.5 sm:gap-2 md:gap-3 mb-3 sm:mb-4 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
          {finalPresets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handlePresetClick(preset)}
              className={cn(
                "px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs md:text-sm font-medium rounded-lg transition-all duration-200 touch-target flex-shrink-0 whitespace-nowrap",
                localValue === preset
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-foreground hover:bg-muted/80 border border-border"
              )}
            >
              {showRupee && showCurrency ? '₹' : ''}{preset.toLocaleString('en-IN')}{suffix}
            </button>
          ))}
        </div>
      )}

      <div className="relative pt-2">
        <div className="relative">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={localValue}
            onChange={handleSliderChange}
            onMouseEnter={() => setIsSliderHovered(true)}
            onMouseLeave={() => setIsSliderHovered(false)}
            style={{
              background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${percentage}%, hsl(var(--charcoal-200)) ${percentage}%, hsl(var(--charcoal-200)) 100%)`
            }}
            className={cn(
              "w-full h-2.5 sm:h-2 rounded-full appearance-none cursor-pointer touch-target transition-all relative z-10",
              isSliderHovered && "h-3 sm:h-2.5",
              "[&::-webkit-slider-thumb]:appearance-none",
              "[&::-webkit-slider-thumb]:w-7",
              "[&::-webkit-slider-thumb]:h-7",
              "sm:[&::-webkit-slider-thumb]:w-6",
              "sm:[&::-webkit-slider-thumb]:h-6",
              "[&::-webkit-slider-thumb]:rounded-full",
              "[&::-webkit-slider-thumb]:bg-white",
              "[&::-webkit-slider-thumb]:border-3",
              "[&::-webkit-slider-thumb]:border-primary",
              "[&::-webkit-slider-thumb]:cursor-pointer",
              "[&::-webkit-slider-thumb]:shadow-lg",
              "[&::-webkit-slider-thumb]:transition-all",
              isSliderHovered && "[&::-webkit-slider-thumb]:scale-125 [&::-webkit-slider-thumb]:shadow-xl",
              "[&::-webkit-slider-thumb]:active:scale-110",
              "[&::-moz-range-thumb]:w-7",
              "[&::-moz-range-thumb]:h-7",
              "sm:[&::-moz-range-thumb]:w-6",
              "sm:[&::-moz-range-thumb]:h-6",
              "[&::-moz-range-thumb]:rounded-full",
              "[&::-moz-range-thumb]:bg-white",
              "[&::-moz-range-thumb]:border-3",
              "[&::-moz-range-thumb]:border-primary",
              "[&::-moz-range-thumb]:cursor-pointer",
              "[&::-moz-range-thumb]:shadow-lg",
              "[&::-moz-range-thumb]:transition-all"
            )}
          />
          
          {/* Intermediate markers */}
          <div className="absolute top-0 left-0 right-0 h-2.5 sm:h-2 pointer-events-none flex justify-between items-start">
            {markers.map((marker, index) => {
              const position = ((marker - min) / (max - min)) * 100;
              return (
                <div
                  key={marker}
                  className="absolute flex flex-col items-center"
                  style={{ 
                    left: `${position}%`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  <div className="w-0.5 h-2.5 sm:h-2 bg-charcoal-300 rounded-full" />
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Marker labels */}
        <div className="relative mt-1 sm:mt-2 flex justify-between text-[10px] sm:text-xs text-charcoal-500">
          {markers.map((marker, index) => {
            const position = ((marker - min) / (max - min)) * 100;
            return (
              <span
                key={marker}
                className="absolute flex-shrink-0"
                style={{
                  left: `${position}%`,
                  transform: index === 0 ? 'translateX(0)' : index === markers.length - 1 ? 'translateX(-100%)' : 'translateX(-50%)'
                }}
              >
                {(showRupee && showCurrency) ? '₹' : ''}{marker.toLocaleString('en-IN')}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
