import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ExternalLink, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

const REDIRECT_ANALYTICS_ENABLED = (import.meta.env.VITE_ENABLE_REDIRECT_ANALYTICS || '').toString().toLowerCase() === 'true';

interface RedirectState {
  bankName: string;
  bankLogo: string;
  bankDomain: string;
  targetUrl: string;
  cardName: string;
  countdown: number;
  status: 'redirecting' | 'error' | 'blocked';
}

export default function RedirectInterstitial() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState<RedirectState>({
    bankName: '',
    bankLogo: '',
    bankDomain: '',
    targetUrl: '',
    cardName: '',
    countdown: 3,
    status: 'redirecting'
  });
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Parse URL parameters
    const bankName = searchParams.get('bank') || 'Bank';
    const bankLogo = searchParams.get('logo') || '';
    const targetUrl = searchParams.get('url') || '';
    const cardName = searchParams.get('card') || '';

    // Validate target URL
    if (!targetUrl || targetUrl === '') {
      setState(prev => ({ 
        ...prev, 
        bankName,
        bankLogo,
        cardName,
        status: 'error' 
      }));
      return;
    }

    // Additional HTTPS validation
    try {
      const url = new URL(targetUrl);
      if (url.protocol !== 'https:' && !url.hostname.includes('localhost')) {
        console.error('Non-HTTPS URL detected');
        setState(prev => ({ ...prev, status: 'error' }));
        return;
      }
    } catch (e) {
      console.error('Invalid URL format');
      setState(prev => ({ ...prev, status: 'error' }));
      return;
    }

    // Extract domain from URL
    let bankDomain = '';
    try {
      const urlObj = new URL(targetUrl);
      bankDomain = urlObj.hostname.replace('www.', '');
    } catch {
      bankDomain = 'bank website';
    }

    setState(prev => ({
      ...prev,
      bankName,
      bankLogo,
      bankDomain,
      targetUrl,
      cardName
    }));

    // Start countdown
    let count = 3;
    countdownRef.current = setInterval(() => {
      count -= 1;
      setState(prev => ({ ...prev, countdown: count }));

      if (count <= 0) {
        if (countdownRef.current) clearInterval(countdownRef.current);
        performRedirect(targetUrl);
      }
    }, 1000);

    // Cleanup
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [searchParams]);

  const performRedirect = (url: string) => {
    if (hasRedirected.current) return;
    hasRedirected.current = true;

    try {
      // Track event
      if (REDIRECT_ANALYTICS_ENABLED && typeof window !== 'undefined' && navigator.sendBeacon) {
        navigator.sendBeacon('/api/redirect-event', JSON.stringify({
          event: 'redirect_confirm',
          bank: state.bankName,
          card: state.cardName,
          timestamp: Date.now()
        }));
      }

      // Perform redirect
      window.location.href = url;
    } catch (error) {
      console.error('Redirect failed:', error);
      setState(prev => ({ ...prev, status: 'error' }));
    }
  };

  const handleContinue = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    performRedirect(state.targetUrl);
  };

  const handleCancel = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    navigate(-1);
  };

  const progressValue = ((3 - state.countdown) / 3) * 100;

  if (state.status === 'error') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-card rounded-2xl shadow-2xl p-8 md:p-12 text-center animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
            We're preparing to take you to {state.bankName || 'the bank site'}
          </h1>
          
          <p className="text-muted-foreground mb-4">
            The redirect link is missing or invalid. This may be due to:
          </p>
          
          <ul className="text-left text-muted-foreground mb-8 max-w-md mx-auto space-y-2">
            <li>• Bank not yet configured in our system</li>
            <li>• Temporary connectivity issue</li>
            <li>• Invalid bank identifier</li>
          </ul>

          <div className="flex flex-col gap-3 justify-center max-w-sm mx-auto">
            <Button variant="outline" onClick={() => navigate('/cards')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Cards
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/contact')}>
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      {/* Meta refresh fallback for no-JS users */}
      <noscript>
        <meta httpEquiv="refresh" content={`3;url=${state.targetUrl}`} />
      </noscript>
      
      <div className="max-w-2xl w-full bg-card rounded-2xl shadow-2xl p-8 md:p-12 text-center animate-fade-in border border-border/50">
        {/* Bank Logo */}
        {state.bankLogo && (
          <div className="mb-6">
            <img 
              src={state.bankLogo} 
              alt={`${state.bankName} logo`}
              className="h-16 md:h-20 object-contain mx-auto"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Main Heading */}
        <h1 className="text-2xl md:text-3xl font-bold mb-3 text-foreground">
          Redirecting you to {state.bankName}
        </h1>
        
        <p className="text-muted-foreground mb-6">
          You'll be taken to the bank's website to complete your application.
        </p>

        {/* Countdown Display */}
        <div className="mb-8">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-1" role="timer" aria-live="polite">
                  {state.countdown}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  seconds
                </div>
              </div>
            </div>
          </div>
          
          <Progress value={progressValue} className="h-2 mb-3" />
          
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {state.countdown > 0 ? `Redirecting in ${state.countdown}...` : 'Redirecting now...'}
          </p>
        </div>

        {/* Domain Information */}
        <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-border/50">
          <div className="flex items-center justify-center gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Opening:</span>
            <span className="font-semibold text-foreground">{state.bankDomain}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <Button 
            size="lg"
            onClick={handleContinue}
            className="font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Continue to {state.bankName}
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            onClick={handleCancel}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancel & Stay Here
          </Button>
        </div>

        {/* Direct Link Fallback */}
        <div className="mb-6">
          <a 
            href={state.targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            Open bank site (no wait)
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Footer Disclaimer */}
        <div className="text-xs text-muted-foreground pt-6 border-t border-border/50">
          <p>
            You're leaving our site. We don't send personal data — only a tracking token for analytics.
            <br />
            <a href="/privacy" className="text-primary hover:underline ml-1">Privacy Policy</a>
          </p>
          <noscript>
            <p className="mt-4 text-warning">
              JavaScript is disabled. You will be redirected automatically in 3 seconds, or{' '}
              <a href={state.targetUrl} className="text-primary hover:underline font-semibold">click here</a>.
            </p>
          </noscript>
        </div>
      </div>
    </div>
  );
}
