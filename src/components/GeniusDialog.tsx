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
  placeholder: string;
  showCurrency?: boolean;
  suffix?: string;
  max?: number;
  step?: number;
}
const categoryQuestions: Record<string, Question[]> = {
  shopping: [{
    key: "amazon_spends",
    label: "How much do you spend on Amazon in a month?",
    placeholder: "5000",
    max: 500000,
    step: 1000
  }, {
    key: "flipkart_spends",
    label: "How much do you spend on Flipkart in a month?",
    placeholder: "3000",
    max: 500000,
    step: 1000
  }, {
    key: "other_online_spends",
    label: "How much do you spend on other online shopping?",
    placeholder: "2000",
    max: 500000,
    step: 1000
  }, {
    key: "other_offline_spends",
    label: "How much do you spend at local shops or offline stores monthly?",
    placeholder: "4000",
    max: 500000,
    step: 1000
  }],
  grocery: [{
    key: "grocery_spends_online",
    label: "How much do you spend on groceries (Blinkit, Zepto etc.) every month?",
    placeholder: "8000",
    max: 200000,
    step: 1000
  }],
  "online-food": [{
    key: "online_food_ordering",
    label: "How much do you spend on food delivery apps in a month?",
    placeholder: "3000",
    max: 200000,
    step: 500
  }],
  fuel: [{
    key: "fuel",
    label: "How much do you spend on fuel in a month?",
    placeholder: "5000",
    max: 200000,
    step: 500
  }],
  dining: [{
    key: "dining_or_going_out",
    label: "How much do you spend on dining out in a month?",
    placeholder: "4000",
    max: 200000,
    step: 500
  }],
  travel: [{
    key: "flights_annual",
    label: "How much do you spend on flights in a year?",
    placeholder: "50000",
    max: 2000000,
    step: 5000
  }, {
    key: "hotels_annual",
    label: "How much do you spend on hotel stays in a year?",
    placeholder: "30000",
    max: 2000000,
    step: 5000
  }, {
    key: "domestic_lounge_usage_quarterly",
    label: "How often do you visit domestic airport lounges in a year?",
    placeholder: "4",
    showCurrency: false,
    suffix: " visits",
    max: 100,
    step: 1
  }, {
    key: "international_lounge_usage_quarterly",
    label: "Plus, what about international airport lounges?",
    placeholder: "2",
    showCurrency: false,
    suffix: " visits",
    max: 100,
    step: 1
  }],
  utility: [{
    key: "mobile_phone_bills",
    label: "How much do you spend on recharging your mobile or Wi-Fi monthly?",
    placeholder: "500",
    max: 50000,
    step: 100
  }, {
    key: "electricity_bills",
    label: "What's your average monthly electricity bill?",
    placeholder: "1500",
    max: 100000,
    step: 500
  }, {
    key: "water_bills",
    label: "And what about your monthly water bill?",
    placeholder: "500",
    max: 50000,
    step: 100
  }, {
    key: "insurance_health_annual",
    label: "How much do you pay for health or term insurance annually?",
    placeholder: "10000",
    max: 500000,
    step: 1000
  }, {
    key: "insurance_car_or_bike_annual",
    label: "How much do you pay for car or bike insurance annually?",
    placeholder: "8000",
    max: 500000,
    step: 1000
  }, {
    key: "rent",
    label: "How much do you pay for house rent every month?",
    placeholder: "15000",
    max: 500000,
    step: 1000
  }, {
    key: "school_fees",
    label: "How much do you pay in school fees monthly?",
    placeholder: "5000",
    max: 500000,
    step: 1000
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
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          <div className="space-y-4">
            {questions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No questions available for this category.</p>
              </div>
            ) : (
              questions.map((question, index) => (
                <div key={question.key} className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {index + 1}
                    </span>
                    {question.label}
                  </label>
                  <SpendingInput 
                    key={question.key} 
                    question="" 
                    emoji="" 
                    value={spendingData[question.key] || 0} 
                    onChange={value => handleInputChange(question.key, value.toString())} 
                    showCurrency={question.showCurrency} 
                    suffix={question.suffix} 
                    max={question.max} 
                    step={question.step}
                  />
                </div>
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