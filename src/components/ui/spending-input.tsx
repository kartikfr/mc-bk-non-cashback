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
}: SpendingInputProps) => {
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

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

  const percentage = ((localValue - min) / (max - min)) * 100;

  return (
    <div className={cn("mb-6 sm:mb-8 p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl shadow-card transition-all duration-300", isFocused && "shadow-card-hover ring-2 ring-primary/20", className)}>
      <label className="block mb-3 sm:mb-4">
        <span className="text-base sm:text-lg font-medium text-charcoal-800">
          {question} <span className="text-xl sm:text-2xl ml-1 sm:ml-2">{emoji}</span>
        </span>
      </label>

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

      <div className="relative pt-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue}
          onChange={handleSliderChange}
          style={{
            background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${percentage}%, hsl(var(--charcoal-200)) ${percentage}%, hsl(var(--charcoal-200)) 100%)`
          }}
          className="w-full h-2.5 sm:h-2 rounded-full appearance-none cursor-pointer touch-target
                   [&::-webkit-slider-thumb]:appearance-none
                   [&::-webkit-slider-thumb]:w-7
                   [&::-webkit-slider-thumb]:h-7
                   sm:[&::-webkit-slider-thumb]:w-6
                   sm:[&::-webkit-slider-thumb]:h-6
                   [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-white
                   [&::-webkit-slider-thumb]:border-3
                   [&::-webkit-slider-thumb]:border-primary
                   [&::-webkit-slider-thumb]:cursor-pointer
                   [&::-webkit-slider-thumb]:shadow-lg
                   [&::-webkit-slider-thumb]:transition-transform
                   [&::-webkit-slider-thumb]:active:scale-110
                   [&::-moz-range-thumb]:w-7
                   [&::-moz-range-thumb]:h-7
                   sm:[&::-moz-range-thumb]:w-6
                   sm:[&::-moz-range-thumb]:h-6
                   [&::-moz-range-thumb]:rounded-full
                   [&::-moz-range-thumb]:bg-white
                   [&::-moz-range-thumb]:border-3
                   [&::-moz-range-thumb]:border-primary
                   [&::-moz-range-thumb]:cursor-pointer
                   [&::-moz-range-thumb]:shadow-lg"
        />
        <div className="flex justify-between mt-2 sm:mt-3 text-xs sm:text-sm text-charcoal-500">
          <span>{(showRupee && showCurrency) ? '₹' : ''}{min.toLocaleString('en-IN')}{suffix}</span>
          <span>{(showRupee && showCurrency) ? '₹' : ''}{max.toLocaleString('en-IN')}{suffix}</span>
        </div>
      </div>
    </div>
  );
};
