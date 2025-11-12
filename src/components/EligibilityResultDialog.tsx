import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';

interface EligibilityResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: any;
  cardName: string;
  cardAlias: string;
  networkUrl?: string;
  onRecheck: () => void;
}

export default function EligibilityResultDialog({
  open,
  onOpenChange,
  result,
  cardName,
  cardAlias,
  networkUrl,
  onRecheck
}: EligibilityResultDialogProps) {
  // Check if eligible: API returns success status with data array containing cards
  const isEligible = result?.status === 'success' && 
                     result?.data && 
                     Array.isArray(result.data) && 
                     result.data.length > 0;
  
  const hasData = result !== null && result !== undefined;

  useEffect(() => {
    if (open && isEligible) {
      // Trigger confetti for eligible result
      const duration = 2000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#4BA946', '#90EE90']
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#4BA946', '#90EE90']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      frame();

      // Mark as seen in session storage
      sessionStorage.setItem(`hasSeenEligibilityResult_${cardAlias}`, 'true');
    }
  }, [open, isEligible, cardAlias]);

  const handleApply = () => {
    // Track analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'eligibility_apply_click', {
        card_alias: cardAlias,
        from_eligibility_check: true
      });
    }

    if (networkUrl) {
      window.open(networkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleViewAlternatives = () => {
    // Track analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'eligibility_alternatives_click', {
        card_alias: cardAlias
      });
    }

    // Navigate to cards listing page
    window.location.href = '/cards';
  };

  const handleRecheckClick = () => {
    // Track analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'eligibility_recheck', {
        card_alias: cardAlias
      });
    }
    
    onOpenChange(false);
    setTimeout(onRecheck, 200);
  };

  // Eligible Result
  if (isEligible) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-green-500" />
              </div>
              <DialogTitle className="text-2xl text-green-500">
                You're eligible! 🎉
              </DialogTitle>
            </div>
            <p className="text-muted-foreground">
              You meet the initial eligibility criteria for this card. Click Apply to proceed.
            </p>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-3">Matched Criteria</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Location:</span> Your pincode is supported
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Income:</span> Meets minimum requirement
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Employment:</span> Eligible status
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleApply}
              className="w-full"
              size="lg"
            >
              Apply Now
              <ExternalLink className="ml-2 w-4 h-4" />
            </Button>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={handleViewAlternatives}
                className="flex-1"
              >
                View Alternatives
              </Button>
              <Button 
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Not Eligible Result
  if (hasData !== undefined) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-amber-500" />
              </div>
              <DialogTitle className="text-2xl text-foreground">
                Sorry — you're not eligible right now
              </DialogTitle>
            </div>
            <p className="text-muted-foreground">
              Based on the details you provided, this card isn't a match at the moment.
            </p>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-3">What You Can Do</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Check if your income meets the card's minimum requirement
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Verify your pincode is in the serviceable area
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Explore other cards that match your profile
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleViewAlternatives}
              className="w-full"
              size="lg"
            >
              See Recommended Cards
            </Button>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={handleRecheckClick}
                className="flex-1"
              >
                Recheck
              </Button>
              <Button 
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
}
