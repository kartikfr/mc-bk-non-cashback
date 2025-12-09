import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SpendingInput } from "@/components/ui/spending-input";
import { SpendingData } from "@/services/cardService";
import { Sparkles } from "lucide-react";

interface GeniusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: string;
  onSubmit: (data: SpendingData) => void;
}

interface Question {
  key: keyof SpendingData;
  label: string;
  emoji: string;
  placeholder: string;
  showCurrency?: boolean;
  suffix?: string;
  min: number;
  max: number;
  step: number;
  presets: number[];
  context?: string;
}

// Helper function to get personalized steps and presets based on question field (matching Super Card Genius)
const getQuestionConfig = (field: string, max?: number): { step: number; presets: number[] } => {
  const configs: Record<string, { step: number; presets: number[] }> = {
    // Shopping - Amazon/Flipkart: For ranges up to 30k, use smaller increments
    amazon_spends: { 
      step: 100, 
      presets: max && max <= 30000 
        ? [1000, 5000, 10000, 20000, 30000] 
        : [1000, 5000, 10000, 20000, 50000] 
    },
    flipkart_spends: { 
      step: 100, 
      presets: max && max <= 30000 
        ? [1000, 5000, 10000, 20000, 30000] 
        : [1000, 5000, 10000, 20000, 50000] 
    },
    other_online_spends: { step: 200, presets: [500, 2000, 5000, 10000, 20000] },
    other_offline_spends: { step: 500, presets: [1000, 5000, 10000, 20000, 50000] },
    
    // Grocery: 200, 500, 1000 increments
    grocery_spends_online: { step: 200, presets: [1000, 3000, 5000, 10000, 20000] },
    
    // Food Delivery: 100, 200, 500 increments
    online_food_ordering: { step: 100, presets: [500, 2000, 5000, 10000, 20000] },
    
    // Fuel: 100, 200, 500 increments
    fuel: { step: 100, presets: [1000, 3000, 5000, 10000, 15000] },
    
    // Dining: 200, 500, 1000 increments
    dining_or_going_out: { step: 200, presets: [1000, 3000, 5000, 10000, 15000] },
    
    // Travel - Annual: 1000, 2000, 5000 increments
    flights_annual: { step: 1000, presets: [10000, 50000, 100000, 200000, 300000] },
    hotels_annual: { step: 1000, presets: [10000, 50000, 100000, 150000, 200000] },
    
    // Bills - Mobile/Water: 50, 100, 200 increments
    mobile_phone_bills: { step: 50, presets: [500, 1000, 2000, 5000, 10000] },
    water_bills: { step: 50, presets: [500, 1000, 2000, 3000, 5000] },
    
    // Electricity: 100, 200, 500 increments
    electricity_bills: { step: 100, presets: [1000, 3000, 5000, 10000, 15000] },
    
    // Insurance - Annual: 1000, 5000, 10000 increments
    insurance_health_annual: { step: 1000, presets: [10000, 25000, 50000, 75000, 100000] },
    insurance_car_or_bike_annual: { step: 1000, presets: [5000, 10000, 25000, 35000, 50000] },
    
    // Rent: 1000, 2000, 5000 increments
    rent: { step: 1000, presets: [5000, 15000, 25000, 40000, 60000] },
    
    // School Fees: 1000, 2000, 5000 increments
    school_fees: { step: 1000, presets: [5000, 10000, 20000, 30000, 50000] },
    
    // Lounge visits: 2, 4, 6, 8, 10 options
    domestic_lounge_usage_quarterly: { step: 1, presets: [2, 4, 6, 8, 10] },
    international_lounge_usage_quarterly: { step: 1, presets: [2, 4, 6, 8, 10] },
  };
  
  const config = configs[field] || { step: 500, presets: [1000, 5000, 10000, 20000, 50000] };
  
  // Filter presets to max value and ensure exactly 5 presets (excluding 0)
  const filteredPresets = config.presets.filter(p => p <= (max || 1000000)).slice(0, 5);
  
  return { step: config.step, presets: filteredPresets };
};
const categoryQuestions: Record<string, Question[]> = {
  shopping: [{
    key: "amazon_spends",
    label: "How much do you spend on Amazon in a month?",
    emoji: "🛍️",
    placeholder: "5000",
    min: 0,
    max: 30000,
    ...getQuestionConfig('amazon_spends', 30000),
    context: "This helps us calculate your cashback on Amazon and compare it with other cards."
  }, {
    key: "flipkart_spends",
    label: "How much do you spend on Flipkart in a month?",
    emoji: "📦",
    placeholder: "3000",
    min: 0,
    max: 30000,
    ...getQuestionConfig('flipkart_spends', 30000),
    context: "We use this to find cards that offer the best rewards on Flipkart purchases."
  }, {
    key: "other_online_spends",
    label: "How much do you spend on other online shopping?",
    emoji: "💸",
    placeholder: "2000",
    min: 0,
    max: 50000,
    ...getQuestionConfig('other_online_spends', 50000),
    context: "This helps us identify cards with the best general online shopping rewards."
  }, {
    key: "other_offline_spends",
    label: "How much do you spend at local shops or offline stores monthly?",
    emoji: "🏪",
    placeholder: "4000",
    min: 0,
    max: 50000,
    ...getQuestionConfig('other_offline_spends', 50000),
    context: "We match you with cards that offer rewards on offline purchases."
  }],
  grocery: [{
    key: "grocery_spends_online",
    label: "How much do you spend on groceries (Blinkit, Zepto etc.) every month?",
    emoji: "🥦",
    placeholder: "8000",
    min: 0,
    max: 50000,
    ...getQuestionConfig('grocery_spends_online', 50000),
    context: "This helps us find cards with the highest cashback on grocery purchases."
  }],
  "online-food": [{
    key: "online_food_ordering",
    label: "How much do you spend on food delivery apps in a month?",
    emoji: "🛵🍜",
    placeholder: "3000",
    min: 0,
    max: 30000,
    ...getQuestionConfig('online_food_ordering', 30000),
    context: "We calculate which cards offer the best rewards on food delivery."
  }],
  fuel: [{
    key: "fuel",
    label: "How much do you spend on fuel in a month?",
    emoji: "⛽",
    placeholder: "5000",
    min: 0,
    max: 20000,
    ...getQuestionConfig('fuel', 20000),
    context: "This helps us find cards with the best fuel surcharge waivers and rewards."
  }],
  dining: [{
    key: "dining_or_going_out",
    label: "How much do you spend on dining out in a month?",
    emoji: "🥗",
    placeholder: "4000",
    min: 0,
    max: 30000,
    ...getQuestionConfig('dining_or_going_out', 30000),
    context: "We match you with cards that offer the highest rewards on dining."
  }],
  travel: [{
    key: "flights_annual",
    label: "How much do you spend on flights in a year?",
    emoji: "✈️",
    placeholder: "50000",
    min: 0,
    max: 500000,
    ...getQuestionConfig('flights_annual', 500000),
    context: "This helps us recommend travel cards with the best air miles and discounts."
  }, {
    key: "hotels_annual",
    label: "How much do you spend on hotel stays in a year?",
    emoji: "🛌",
    placeholder: "30000",
    min: 0,
    max: 300000,
    ...getQuestionConfig('hotels_annual', 300000),
    context: "We find cards that offer the best hotel booking rewards and discounts."
  }, {
    key: "domestic_lounge_usage_quarterly",
    label: "How often do you visit domestic airport lounges in a year?",
    emoji: "🇮🇳",
    placeholder: "4",
    showCurrency: false,
    suffix: " visits",
    min: 0,
    max: 20,
    ...getQuestionConfig('domestic_lounge_usage_quarterly', 20),
    context: "This helps us calculate the value of complimentary lounge access."
  }, {
    key: "international_lounge_usage_quarterly",
    label: "Plus, what about international airport lounges?",
    emoji: "🌎",
    placeholder: "2",
    showCurrency: false,
    suffix: " visits",
    min: 0,
    max: 20,
    ...getQuestionConfig('international_lounge_usage_quarterly', 20),
    context: "We factor in international lounge access value for travel cards."
  }],
  utility: [{
    key: "mobile_phone_bills",
    label: "How much do you spend on recharging your mobile or Wi-Fi monthly?",
    emoji: "📱",
    placeholder: "500",
    min: 0,
    max: 10000,
    ...getQuestionConfig('mobile_phone_bills', 10000),
    context: "This helps us find cards with the best rewards on utility bill payments."
  }, {
    key: "electricity_bills",
    label: "What's your average monthly electricity bill?",
    emoji: "⚡️",
    placeholder: "1500",
    min: 0,
    max: 20000,
    ...getQuestionConfig('electricity_bills', 20000),
    context: "We match you with cards that offer rewards on electricity bill payments."
  }, {
    key: "water_bills",
    label: "And what about your monthly water bill?",
    emoji: "💧",
    placeholder: "500",
    min: 0,
    max: 5000,
    ...getQuestionConfig('water_bills', 5000),
    context: "This helps us calculate rewards on water bill payments."
  }, {
    key: "insurance_health_annual",
    label: "How much do you pay for health or term insurance annually?",
    emoji: "🛡️",
    placeholder: "10000",
    min: 0,
    max: 100000,
    ...getQuestionConfig('insurance_health_annual', 100000),
    context: "We find cards that offer rewards on insurance premium payments."
  }, {
    key: "insurance_car_or_bike_annual",
    label: "How much do you pay for car or bike insurance annually?",
    emoji: "🚗",
    placeholder: "8000",
    min: 0,
    max: 50000,
    ...getQuestionConfig('insurance_car_or_bike_annual', 50000),
    context: "This helps us match you with cards offering rewards on vehicle insurance."
  }, {
    key: "rent",
    label: "How much do you pay for house rent every month?",
    emoji: "🏠",
    placeholder: "15000",
    min: 0,
    max: 100000,
    ...getQuestionConfig('rent', 100000),
    context: "We find cards that offer rewards or cashback on rent payments."
  }, {
    key: "school_fees",
    label: "How much do you pay in school fees monthly?",
    emoji: "🎓",
    placeholder: "5000",
    min: 0,
    max: 50000,
    ...getQuestionConfig('school_fees', 50000),
    context: "This helps us identify cards with rewards on education expenses."
  }]
};
export default function GeniusDialog({
  open,
  onOpenChange,
  category,
  onSubmit
}: GeniusDialogProps) {
  const questions = categoryQuestions[category] || [];
  const initialSpendingData: SpendingData = {
    amazon_spends: 0,
    flipkart_spends: 0,
    other_online_spends: 0,
    other_offline_spends: 0,
    grocery_spends_online: 0,
    online_food_ordering: 0,
    fuel: 0,
    dining_or_going_out: 0,
    flights_annual: 0,
    hotels_annual: 0,
    domestic_lounge_usage_quarterly: 0,
    international_lounge_usage_quarterly: 0,
    mobile_phone_bills: 0,
    electricity_bills: 0,
    water_bills: 0,
    insurance_health_annual: 0,
    insurance_car_or_bike_annual: 0,
    rent: 0,
    school_fees: 0
  };
  const [spendingData, setSpendingData] = useState<SpendingData>(initialSpendingData);

  // Reset spending data whenever category changes
  useEffect(() => {
    setSpendingData(initialSpendingData);
  }, [category]);
  const handleInputChange = (key: keyof SpendingData, value: string) => {
    const numValue = parseInt(value) || 0;
    setSpendingData(prev => ({
      ...prev,
      [key]: numValue
    }));
  };
  const handleSubmit = () => {
    onSubmit(spendingData);
    onOpenChange(false);
  };
  const categoryLabels: Record<string, string> = {
    'fuel': 'Fuel',
    'shopping': 'Shopping',
    'online-food': 'Food Delivery',
    'dining': 'Dining',
    'grocery': 'Grocery',
    'travel': 'Travel',
    'utility': 'Utility'
  };

  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] sm:max-h-[80vh] overflow-hidden flex flex-col p-0">
        {/* Header - Fixed */}
        <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 border-b border-border bg-gradient-to-r from-purple-50 to-emerald-50 dark:from-purple-950/20 dark:to-emerald-950/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl md:text-2xl">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-purple-600 to-emerald-600">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-foreground">Calculate {categoryLabels[category]} Savings</div>
                <p className="text-xs sm:text-sm text-muted-foreground font-normal mt-0.5">
                  Get yearly savings for each card
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-2 sm:py-3">
          <div className="space-y-2 sm:space-y-3">
            {questions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No questions available for this category.</p>
              </div>
            ) : (
              questions.map((question, index) => (
                <SpendingInput 
                  key={question.key} 
                  question={question.label} 
                  emoji={question.emoji} 
                  value={spendingData[question.key] || 0} 
                  onChange={value => handleInputChange(question.key, value.toString())} 
                  min={question.min}
                  max={question.max} 
                  step={question.step}
                  presets={question.presets}
                  showCurrency={question.showCurrency !== false} 
                  showRupee={question.showCurrency !== false}
                  suffix={question.suffix} 
                  context={question.context}
                  className="mb-0"
                />
              ))
            )}
          </div>
        </div>
        
        {/* Footer - Fixed */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-border bg-card">
          <div className="flex gap-2 sm:gap-3">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1 h-10 sm:h-11 text-sm sm:text-base font-semibold"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="flex-1 h-10 sm:h-11 text-sm sm:text-base font-bold bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-700 hover:to-emerald-700 gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Calculate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
}