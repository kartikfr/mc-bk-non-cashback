import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2 } from 'lucide-react';
import { cardService } from '@/services/cardService';
import { toast } from 'sonner';
import EligibilityResultDialog from './EligibilityResultDialog';

interface EligibilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardAlias: string;
  cardName: string;
  networkUrl?: string;
}

interface FormData {
  pincode: string;
  inhandIncome: string;
  empStatus: 'salaried' | 'self-employed' | '';
}

interface FormErrors {
  pincode?: string;
  inhandIncome?: string;
  empStatus?: string;
}

export default function EligibilityDialog({ 
  open, 
  onOpenChange, 
  cardAlias, 
  cardName,
  networkUrl 
}: EligibilityDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    pincode: '',
    inhandIncome: '',
    empStatus: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState<any>(null);

  // Rate limiting: max 3 checks per minute
  const [checkCount, setCheckCount] = useState(0);
  const [lastResetTime, setLastResetTime] = useState(Date.now());

  useEffect(() => {
    // Load prefilled data from session storage
    const savedData = sessionStorage.getItem(`eligibility_${cardAlias}`);
    if (savedData) {
      try {
        setFormData(JSON.parse(savedData));
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, [cardAlias]);

  useEffect(() => {
    // Reset rate limit counter every minute
    const now = Date.now();
    if (now - lastResetTime > 60000) {
      setCheckCount(0);
      setLastResetTime(now);
    }
  }, [lastResetTime]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Pincode validation
    if (!formData.pincode) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
    }

    // Income validation
    if (!formData.inhandIncome) {
      newErrors.inhandIncome = 'Income is required';
    } else {
      const income = parseInt(formData.inhandIncome.replace(/,/g, ''));
      if (isNaN(income) || income < 5000) {
        newErrors.inhandIncome = 'Please enter a valid income (minimum ₹5,000)';
      }
    }

    // Employment status validation
    if (!formData.empStatus) {
      newErrors.empStatus = 'Please select your employment status';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Track analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'eligibility_form_submit', {
        card_alias: cardAlias,
        income_range: getIncomeRange(formData.inhandIncome),
        emp_status: formData.empStatus
      });
    }

    try {
      // Save to session storage for prefill
      sessionStorage.setItem(`eligibility_${cardAlias}`, JSON.stringify(formData));

      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 12000)
      );

      const apiCall = cardService.checkEligibility({
        cardAlias,
        pincode: formData.pincode,
        inhandIncome: formData.inhandIncome.replace(/,/g, ''),
        empStatus: formData.empStatus as 'salaried' | 'self-employed'
      });

      const response = await Promise.race([apiCall, timeout]) as any;

      // Determine matched using robust parsing
      const raw = response?.data;
      let cards: any[] = [];
      let singleCard: any = null;
      if (Array.isArray(raw)) cards = raw;
      else if (raw && typeof raw === 'object') {
        if (Array.isArray(raw.cards)) cards = raw.cards;
        else if (Array.isArray(raw.items)) cards = raw.items;
        else if (Array.isArray(raw.results)) cards = raw.results;
        else singleCard = raw;
      }
      const matchedFromArray = cards.some((c: any) => (c?.seo_card_alias || c?.card_alias) === cardAlias);
      const matchedSingle = !!singleCard && ((singleCard.seo_card_alias || singleCard.card_alias) === cardAlias);

      // Track result analytics using exact card match
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'eligibility_result', {
          card_alias: cardAlias,
          eligible: matchedFromArray || matchedSingle
        });
      }

      setEligibilityResult(response);
      setShowResult(true);
      onOpenChange(false); // Close form dialog

    } catch (error: any) {
      console.error('Eligibility check error:', error);
      
      if (error.message === 'Request timeout') {
        toast.error('Request timed out. Please try again.');
      } else {
        toast.error('We couldn\'t check eligibility right now. Please try again.', {
          action: {
            label: 'Retry',
            onClick: () => handleSubmit(e)
          }
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIncomeRange = (income: string): string => {
    const num = parseInt(income.replace(/,/g, ''));
    if (num < 30000) return '<30k';
    if (num < 50000) return '30k-50k';
    if (num < 100000) return '50k-100k';
    return '100k+';
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleIncomeChange = (value: string) => {
    // Allow only numbers and format with commas
    const cleaned = value.replace(/[^\d]/g, '');
    const formatted = cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    handleInputChange('inhandIncome', formatted);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]" aria-labelledby="eligibility-dialog-title">
          <DialogHeader>
            <DialogTitle id="eligibility-dialog-title">Quick Eligibility Check - No Docs</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Pincode */}
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter your 6-digit pincode"
                value={formData.pincode}
                onChange={(e) => handleInputChange('pincode', e.target.value.replace(/\D/g, ''))}
                aria-invalid={!!errors.pincode}
                aria-describedby={errors.pincode ? 'pincode-error' : undefined}
                disabled={isSubmitting}
              />
              {errors.pincode && (
                <p id="pincode-error" className="text-sm text-destructive">
                  {errors.pincode}
                </p>
              )}
            </div>

            {/* Income */}
            <div className="space-y-2">
              <Label htmlFor="income">In-hand Income (₹ / month)</Label>
              <Input
                id="income"
                type="text"
                inputMode="numeric"
                placeholder="e.g. 50,000"
                value={formData.inhandIncome}
                onChange={(e) => handleIncomeChange(e.target.value)}
                aria-invalid={!!errors.inhandIncome}
                aria-describedby={errors.inhandIncome ? 'income-error' : undefined}
                disabled={isSubmitting}
              />
              {errors.inhandIncome && (
                <p id="income-error" className="text-sm text-destructive">
                  {errors.inhandIncome}
                </p>
              )}
            </div>

            {/* Employment Status */}
            <div className="space-y-2">
              <Label htmlFor="employment">Employment Status</Label>
              <RadioGroup
                value={formData.empStatus}
                onValueChange={(value) => handleInputChange('empStatus', value)}
                disabled={isSubmitting}
                aria-invalid={!!errors.empStatus}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="salaried" id="salaried" />
                  <Label htmlFor="salaried" className="font-normal cursor-pointer">
                    Salaried
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="self-employed" id="self-employed" />
                  <Label htmlFor="self-employed" className="font-normal cursor-pointer">
                    Self-employed
                  </Label>
                </div>
              </RadioGroup>
              {errors.empStatus && (
                <p className="text-sm text-destructive">
                  {errors.empStatus}
                </p>
              )}
            </div>

            {/* Privacy Notice */}
            <p className="text-xs text-muted-foreground">
              We only use this info to check eligibility. No documents required.
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  'Check'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Result Dialog */}
      <EligibilityResultDialog
        open={showResult}
        onOpenChange={setShowResult}
        result={eligibilityResult}
        cardName={cardName}
        cardAlias={cardAlias}
        networkUrl={networkUrl}
        onRecheck={() => {
          setShowResult(false);
          onOpenChange(true);
        }}
      />
    </>
  );
}
