import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
}

const categoryQuestions: Record<string, Question[]> = {
  shopping: [
    { key: "amazon_spends", label: "How much do you spend on Amazon in a month? 🛍️", placeholder: "5000" },
    { key: "flipkart_spends", label: "How much do you spend on Flipkart in a month? 📦", placeholder: "3000" },
    { key: "other_online_spends", label: "How much do you spend on other online shopping? 💸", placeholder: "2000" },
    { key: "other_offline_spends", label: "How much do you spend at local shops or offline stores monthly? 🏪", placeholder: "4000" }
  ],
  grocery: [
    { key: "grocery_spends_online", label: "How much do you spend on groceries (Blinkit, Zepto etc.) every month? 🥦", placeholder: "8000" }
  ],
  "online-food": [
    { key: "online_food_ordering", label: "How much do you spend on food delivery apps in a month? 🛵🍜", placeholder: "3000" }
  ],
  fuel: [
    { key: "fuel", label: "How much do you spend on fuel in a month? ⛽", placeholder: "5000" }
  ],
  dining: [
    { key: "dining_or_going_out", label: "How much do you spend on dining out in a month? 🥗", placeholder: "4000" }
  ],
  travel: [
    { key: "flights_annual", label: "How much do you spend on flights in a year? ✈️", placeholder: "50000" },
    { key: "hotels_annual", label: "How much do you spend on hotel stays in a year? 🛌", placeholder: "30000" },
    { key: "domestic_lounge_usage_quarterly", label: "How often do you visit domestic airport lounges in a year? 🇮🇳", placeholder: "4" },
    { key: "international_lounge_usage_quarterly", label: "Plus, what about international airport lounges? 🌎", placeholder: "2" }
  ],
  utility: [
    { key: "mobile_phone_bills", label: "How much do you spend on recharging your mobile or Wi-Fi monthly? 📱", placeholder: "500" },
    { key: "electricity_bills", label: "What's your average monthly electricity bill? ⚡️", placeholder: "1500" },
    { key: "water_bills", label: "And what about your monthly water bill? 💧", placeholder: "500" },
    { key: "insurance_health_annual", label: "How much do you pay for health or term insurance annually? 🛡️", placeholder: "10000" },
    { key: "insurance_car_or_bike_annual", label: "How much do you pay for car or bike insurance annually? 🚗", placeholder: "8000" },
    { key: "rent", label: "How much do you pay for house rent every month? 🏠", placeholder: "15000" },
    { key: "school_fees", label: "How much do you pay in school fees monthly? 🎓", placeholder: "5000" }
  ]
};

export default function GeniusDialog({ open, onOpenChange, category, onSubmit }: GeniusDialogProps) {
  const questions = categoryQuestions[category] || [];
  
  const [spendingData, setSpendingData] = useState<SpendingData>({
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
  });

  const handleInputChange = (key: keyof SpendingData, value: string) => {
    const numValue = parseInt(value) || 0;
    setSpendingData(prev => ({ ...prev, [key]: numValue }));
  };

  const handleSubmit = () => {
    onSubmit(spendingData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="w-6 h-6 text-primary" />
            Card Genius - {category.charAt(0).toUpperCase() + category.slice(1)} Spending
          </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Answer a few quick questions to estimate your yearly savings.
          </DialogDescription>
        
        <div className="space-y-6 mt-4">
          <p className="text-muted-foreground">
            Tell us about your spending habits and we'll calculate potential savings with the best cards!
          </p>
          
          <div className="space-y-4">
            {questions.map((question) => (
              <div key={question.key} className="space-y-2">
                <Label htmlFor={question.key} className="text-sm font-medium">
                  {question.label}
                </Label>
                <Input
                  id={question.key}
                  type="number"
                  placeholder={question.placeholder}
                  value={spendingData[question.key] || ""}
                  onChange={(e) => handleInputChange(question.key, e.target.value)}
                  className="h-12"
                />
              </div>
            ))}
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="gap-2">
              <Sparkles className="w-4 h-4" />
              Calculate Savings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
