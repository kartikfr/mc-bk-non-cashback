import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { cardService } from '@/services/cardService';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { ChevronDown, ChevronUp, ExternalLink, Gift, Award, Sparkles, ArrowLeft, Shield, Plus, Check, Percent, Info, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import EligibilityDialog from '@/components/EligibilityDialog';
import { sanitizeHtml } from '@/lib/sanitize';
import { redirectToCardApplication } from '@/utils/redirectHandler';
import { CompareToggleIcon } from '@/components/comparison/CompareToggleIcon';
import { ComparePanel } from '@/components/comparison/ComparePanel';
import { useComparison } from '@/contexts/ComparisonContext';
import { cn } from '@/lib/utils';

interface CardData {
  id: number;
  name: string;
  nick_name: string;
  seo_card_alias: string;
  card_type: string;
  rating: number;
  user_rating_count: number;
  image: string;
  card_bg_image: string;
  card_bg_gradient: string;
  card_apply_link: string;
  age_criteria: string;
  min_age: number;
  max_age: number;
  crif: string;
  income: string;
  income_salaried: string;
  income_self_emp: string;
  employment_type: string;
  joining_fee_text: string;
  joining_fee_offset: string;
  annual_fee_text: string;
  annual_fee_waiver: string;
  annual_saving: string;
  reward_conversion_rate: string;
  redemption_catalogue: string;
  redemption_options: string;
  exclusion_earnings: string;
  exclusion_spends: string;
  network_url: string;
  tnc: string;
  product_usps: Array<{
    header: string;
    description: string;
    priority: number;
    tag_id: number;
  }>;
  tags: Array<{
    id: number;
    name: string;
  }>;
  product_benefits?: Array<{
    benefit_type: string;
    benefit_name?: string;
    sub_type: string;
    html_text: string;
  }>;
  bank_fee_structure?: {
    forex_markup: string;
    forex_markup_comment: string;
    apr_fees: string;
    apr_fees_comment: string;
    atm_withdrawal: string;
    atm_withdrawal_comment: string;
    reward_redemption_fees: string;
    late_payment_annual: string;
    late_payment_fine: string;
  };
  banks: {
    name: string;
  };
}

export default function CardDetails() {
  const { alias } = useParams<{ alias: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [card, setCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFixedCTA, setShowFixedCTA] = useState(false);
  const [selectedBenefitCategory, setSelectedBenefitCategory] = useState<string>('All');
  const [showEligibilityDialog, setShowEligibilityDialog] = useState(false);
  const [isComparePanelOpen, setIsComparePanelOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [showAllBenefits, setShowAllBenefits] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<number>>(new Set());
  const { toggleCard, isSelected, startComparisonWith } = useComparison();
  const heroRef = useRef<HTMLDivElement>(null);
  const feesRef = useRef<HTMLDivElement>(null);
  const benefitsRef = useRef<HTMLDivElement>(null);
  const rewardsRef = useRef<HTMLDivElement>(null);
  const feeStructureRef = useRef<HTMLDivElement>(null);
  const allBenefitsRef = useRef<HTMLDivElement>(null);
  const tncRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchCardDetails();
  }, [alias]);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const heroRect = heroRef.current.getBoundingClientRect();
        const heroHeight = heroRect.height;
        const scrolledPastHero = heroRect.top + (heroHeight * 0.8); // Show when 80% of hero is scrolled
        setShowFixedCTA(scrolledPastHero < 0);
      }

      // Update active section for navigation
      const sections = [
        { ref: feesRef, id: 'fees' },
        { ref: benefitsRef, id: 'benefits' },
        { ref: rewardsRef, id: 'rewards' },
        { ref: feeStructureRef, id: 'fee-structure' },
        { ref: allBenefitsRef, id: 'all-benefits' },
        { ref: tncRef, id: 'tnc' }
      ];

      for (const section of sections) {
        if (section.ref.current) {
          const rect = section.ref.current.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>, sectionId: string) => {
    setActiveSection(sectionId);
    if (ref.current) {
      const navHeight = window.innerWidth < 640 ? 64 : window.innerWidth < 768 ? 72 : 80; // Responsive nav height
      const quickNavHeight = 60; // Quick navigation height (visible when showFixedCTA is true)
      const stickyCtaHeight = 70; // Sticky CTA button height
      const offset = navHeight + quickNavHeight + 20; // Total offset with padding
      const elementPosition = ref.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const fetchCardDetails = async () => {
    if (!alias) return;
    
    try {
      setLoading(true);
      const response = await cardService.getCardDetailsByAlias(alias);
      if (response.status === 'success' && response.data) {
        const cardData = Array.isArray(response.data) ? response.data[0] : response.data;
        if (cardData) {
          setCard(cardData);
        } else {
          toast.error('Card not found');
        }
      } else {
        toast.error('Failed to load card details');
      }
    } catch (error) {
      console.error('Error fetching card details:', error);
      toast.error('Unable to load card. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: `${card?.name} - Credit Card Details`,
      text: `Check out ${card?.name} - ${card?.card_type} card with great benefits!`,
      url: url,
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          // Fallback to clipboard
          navigator.clipboard.writeText(url);
          toast.success('Link copied to clipboard!');
        }
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleApply = () => {
    if (!card) return;
    const success = redirectToCardApplication(card);
    if (!success) {
      toast.error('Unable to open the bank application page. Please allow pop-ups or try again later.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 md:pt-28">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-background pt-24 md:pt-28">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Card not found</h1>
          <Link to={`/cards${searchParams.toString() ? '?' + searchParams.toString() : ''}`}>
            <Button>Back to Cards</Button>
          </Link>
        </div>
      </div>
    );
  }

  const sortedUSPs = [...(card.product_usps || [])].sort((a, b) => a.priority - b.priority);
  const topUSPs = sortedUSPs.slice(0, 4);

  // Helper function to extract percentage from text
  const extractPercentage = (text: string): string | null => {
    const match = text.match(/(\d+(?:\.\d+)?)%/);
    return match ? match[1] + '%' : null;
  };

  // Helper function to check if value is N/A or empty
  const isEmptyOrNA = (value: any): boolean => {
    if (!value) return true;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      // Strip HTML tags and check content
      const textContent = trimmed.replace(/<[^>]*>/g, '').trim();
      return trimmed === '' || 
             trimmed === 'N/A' || 
             trimmed === 'n/a' || 
             trimmed.toLowerCase() === 'not available' ||
             textContent === '' ||
             textContent === 'N/A' ||
             textContent === 'n/a' ||
             textContent.toLowerCase() === 'not available';
    }
    return false;
  };

  // Get "Best For" tags as simplified text
  const bestForText = card.tags && card.tags.length > 0 
    ? card.tags.map(t => t.name).join(' • ')
    : null;

  // Group benefits by type for horizontal scroll - exclude "All Benefits" and "all" variations
  // Also filter out categories that only have N/A or empty content
  const benefitTypes = card.product_benefits 
    ? Array.from(new Set(card.product_benefits
        .filter(b => {
          // Only include benefits with actual content (not N/A or empty)
          const hasContent = b.html_text && !isEmptyOrNA(b.html_text);
          return hasContent && 
                 b.benefit_type && 
                 b.benefit_type.toLowerCase() !== 'all' && 
                 b.benefit_type.toLowerCase() !== 'all benefits';
        })
        .map(b => b.benefit_type)
      ))
    : [];
  
  const benefitCategories = ['All', ...benefitTypes];

  // Filter benefits to only show those with actual content (not N/A or empty)
  const filteredBenefits = selectedBenefitCategory === 'All' 
    ? card.product_benefits?.filter(b => 
        b.html_text && !isEmptyOrNA(b.html_text) &&
        b.benefit_type && 
        b.benefit_type.toLowerCase() !== 'all' && 
        b.benefit_type.toLowerCase() !== 'all benefits'
      )
    : card.product_benefits?.filter(b => 
        b.html_text && !isEmptyOrNA(b.html_text) &&
        b.benefit_type === selectedBenefitCategory
      );

  return (
    <div className="min-h-screen bg-background pt-24 md:pt-28">
      <Navigation />
      
      {/* Back Button & Breadcrumb */}
      <div className="section-shell py-4">
        <div className="flex items-center gap-4 mb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Preserve URL params when navigating back to cards page
              const params = new URLSearchParams(searchParams);
              navigate(`/cards${params.toString() ? '?' + params.toString() : ''}`);
              setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
            }}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cards
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          {' / '}
          <Link 
            to={`/cards${searchParams.toString() ? '?' + searchParams.toString() : ''}`} 
            className="hover:text-foreground"
          >
            Cards
          </Link>
          {' / '}
          <span className="text-foreground">{card.name}</span>
        </div>
      </div>

      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative overflow-hidden py-12 md:py-20"
        style={{
          background: card.card_bg_gradient || 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)'
        }}
      >
        <div className="section-shell">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 items-center">
            {/* Card Image */}
            <div className="relative animate-fade-in">
              <div className="relative w-full max-w-md mx-auto">
                <img 
                  src={card.image || card.card_bg_image || '/placeholder.svg'} 
                  alt={card.name}
                  className="w-full h-auto rounded-2xl shadow-2xl"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              </div>
            </div>

            {/* Card Info */}
            <div className="text-white space-y-4 sm:space-y-6 animate-fade-in w-full">
              <div className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">{card.name}</h1>
                  {bestForText && (
                    <p className="text-xs sm:text-sm text-white/80 flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">Best for:</span>
                      <span>{bestForText}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col gap-3 w-full">
                {/* Apply Button */}
                <Button 
                  size="lg" 
                  onClick={handleApply}
                  className="w-full bg-white text-primary hover:bg-white/90 font-semibold text-sm sm:text-base md:text-base px-5 sm:px-6 h-12 sm:h-14"
                >
                  Apply Online – Quick, Paperless Process
                  <ExternalLink className="ml-2 w-4 h-4 flex-shrink-0" />
                </Button>
                {/* Check Eligibility Button */}
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => {
                    setShowEligibilityDialog(true);
                    if (typeof window !== 'undefined' && (window as any).gtag) {
                      (window as any).gtag('event', 'eligibility_modal_open', {
                        card_alias: alias,
                        card_name: card.name
                      });
                    }
                  }}
                  className="w-full border-white text-white hover:bg-white/10 text-sm sm:text-base md:text-base px-5 sm:px-6 h-12 sm:h-14"
                >
                  <Shield className="mr-2 w-4 h-4 flex-shrink-0" />
                  Check Eligibility (No Credit Score Impact)
                </Button>
                {/* Compare Button */}
                <Button
                  size="sm"
                  variant={isSelected(card.seo_card_alias) ? "secondary" : "ghost"}
                  onClick={() => {
                    startComparisonWith(card);
                    setIsComparePanelOpen(true);
                  }}
                  className={cn(
                    "w-full sm:w-auto border text-sm h-10 sm:h-11 px-4 sm:px-6 justify-center self-start",
                    isSelected(card.seo_card_alias) 
                      ? "border-white/50 text-white bg-white/20 hover:bg-white/30" 
                      : "border-white/30 text-white/80 hover:text-white hover:bg-white/10"
                  )}
                >
                  {isSelected(card.seo_card_alias) ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Added
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Compare
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Apply Now Button - Mobile Optimized */}
      {showFixedCTA && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/98 backdrop-blur-md border-t-2 border-border/80 p-3 sm:p-4 z-50 shadow-2xl safe-area-inset-bottom">
          <div className="container mx-auto px-3 sm:px-4 flex gap-2 sm:gap-3">
            <Button 
              className="flex-1 touch-target h-12 sm:h-14 font-bold text-xs sm:text-sm md:text-base shadow-lg px-2 sm:px-4" 
              size="lg"
              onClick={handleApply}
            >
              <span className="hidden sm:inline">Apply Online – Quick, Paperless</span>
              <span className="sm:hidden">Apply Online</span>
              <ExternalLink className="ml-1 sm:ml-2 w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
            <Button
              size="lg"
              variant={isSelected(card.seo_card_alias) ? "default" : "outline"}
              onClick={() => {
                startComparisonWith(card);
                setIsComparePanelOpen(true);
              }}
              className={`touch-target h-12 sm:h-14 px-4 sm:px-6 ${isSelected(card.seo_card_alias)
                ? "border-2 border-primary bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-lg"
                : "border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold"
              }`}
            >
              {isSelected(card.seo_card_alias) ? (
                <>
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                  <span className="hidden sm:inline">Added</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                  <span className="hidden sm:inline">Compare</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Quick Navigation - Enhanced with better UI */}
      {showFixedCTA && (
        <div className="fixed top-[64px] sm:top-[72px] md:top-20 left-0 right-0 bg-background/98 backdrop-blur-md border-b border-border/80 z-40 shadow-lg">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto py-2.5 sm:py-3 scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0 snap-x snap-mandatory">
              {[
                { id: 'fees', label: 'Fees', ref: feesRef },
                { id: 'benefits', label: 'Key Benefits', ref: benefitsRef },
                { id: 'rewards', label: 'Rewards', ref: rewardsRef },
                ...(card?.bank_fee_structure && Object.keys(card.bank_fee_structure).some(key => 
                  card.bank_fee_structure[key] && !isEmptyOrNA(card.bank_fee_structure[key])
                ) ? [{ id: 'fee-structure', label: 'Fee Structure', ref: feeStructureRef }] : []),
                ...(card?.product_benefits && card.product_benefits.length > 0 ? [{ id: 'all-benefits', label: 'All Benefits', ref: allBenefitsRef }] : []),
                ...(card?.tnc && !isEmptyOrNA(card.tnc) ? [{ id: 'tnc', label: 'T&Cs', ref: tncRef }] : [])
              ].filter(Boolean).map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.ref, section.id)}
                  className={cn(
                    "flex-shrink-0 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl whitespace-nowrap transition-all duration-200 touch-target min-h-[44px] snap-center",
                    activeSection === section.id
                      ? 'bg-primary text-primary-foreground shadow-md scale-105'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 active:bg-muted'
                  )}
                >
                  {section.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="section-shell py-8 sm:py-10 md:py-12 lg:py-16 space-y-10 sm:space-y-12 md:space-y-14 lg:space-y-16 pb-24 sm:pb-28 md:pb-32">
        {/* Fees & Eligibility - Moved to top as users want to see this first */}
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8" ref={feesRef}>
          {/* Fees */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 sm:mb-6">Fees</h2>
            <section className="bg-card border border-border rounded-xl p-6 sm:p-8" id="fees">
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 pb-4 sm:pb-6 border-b border-border">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-sm text-muted-foreground">Joining Fee</p>
                      {(() => {
                        const joiningFeeRaw = card.joining_fee_text ?? card.joining_fee ?? '0';
                        const annualFeeRaw = card.annual_fee_text ?? card.annual_fee ?? '0';
                        const joiningFee = parseInt(joiningFeeRaw?.toString().replace(/[^0-9]/g, ''), 10);
                        const annualFee = parseInt(annualFeeRaw?.toString().replace(/[^0-9]/g, ''), 10);
                        const joiningFeeNum = Number.isFinite(joiningFee) ? joiningFee : 0;
                        const annualFeeNum = Number.isFinite(annualFee) ? annualFee : 0;
                        const isLTF = joiningFeeNum === 0 && annualFeeNum === 0;
                        
                        if (!isLTF) return null;
                        
                        return (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge className="text-xs bg-primary text-primary-foreground cursor-help">
                                  LTF
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p className="font-semibold mb-1">LTF - Lifetime Free</p>
                                <p className="text-sm">
                                  This is a Lifetime Free credit card, meaning you pay ₹0 joining fee and ₹0 annual fee for the entire lifetime of the card. No charges ever!
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })()}
                    </div>
                    <p className="text-3xl sm:text-4xl font-bold text-foreground">₹{card.joining_fee_text}</p>
                    {card.joining_fee_offset && !isEmptyOrNA(card.joining_fee_offset) && (
                      <div className="mt-3 text-sm text-muted-foreground">
                        <div 
                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(card.joining_fee_offset) }}
                          className="prose prose-sm max-w-none text-sm text-muted-foreground leading-relaxed
                            [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-2 
                            [&>li]:text-muted-foreground [&>li]:leading-relaxed
                            [&>p]:mb-2 [&>p]:leading-relaxed
                            [&>strong]:text-foreground [&>strong]:font-semibold"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-2">Annual Fee</p>
                    <p className="text-3xl sm:text-4xl font-bold text-foreground">₹{card.annual_fee_text}</p>
                    {card.annual_fee_waiver && !isEmptyOrNA(card.annual_fee_waiver) && (
                      <div className="mt-3 text-sm text-muted-foreground">
                        <div 
                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(card.annual_fee_waiver) }}
                          className="prose prose-sm max-w-none text-sm text-muted-foreground leading-relaxed
                            [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-2 
                            [&>li]:text-muted-foreground [&>li]:leading-relaxed
                            [&>p]:mb-2 [&>p]:leading-relaxed
                            [&>strong]:text-foreground [&>strong]:font-semibold"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Eligibility */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Eligibility Snapshot</h2>
            <section className="bg-card border border-border rounded-xl p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <p className="text-sm text-muted-foreground">Ages</p>
                  </div>
                  <p className="text-lg sm:text-xl font-semibold text-foreground">{card.min_age}–{card.max_age} years</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <p className="text-sm text-muted-foreground">Recommended CIBIL</p>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Your credit score from CIBIL. Higher scores improve approval chances.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-lg sm:text-xl font-semibold text-foreground">{card.crif}+</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <p className="text-sm text-muted-foreground">Minimum Income (Salaried)</p>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Annual income required. Income proof (salary slips/ITR) will be required for verification.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-lg sm:text-xl font-semibold text-foreground">₹{card.income_salaried} LPA</p>
                  {card.income_self_emp && card.income_self_emp !== card.income_salaried && (
                    <p className="text-xs text-muted-foreground mt-1">Self-employed: ₹{card.income_self_emp} LPA</p>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <p className="text-sm text-muted-foreground">Employment Type</p>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Both salaried and self-employed individuals can apply. Documents may vary based on employment type.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-lg sm:text-xl font-semibold text-foreground capitalize">{card.employment_type}</p>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Key Benefits - Redesigned with Highlighted Cards */}
        {sortedUSPs.length > 0 && (
          <section className="animate-fade-in space-y-6 sm:space-y-8" ref={benefitsRef} id="benefits">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Key Benefits</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Everything you need to know about this card at a glance</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {topUSPs.map((usp, index) => {
                const percentage = extractPercentage(usp.header + ' ' + usp.description);
                const benefitType = usp.header.toLowerCase().includes('cashback') ? 'cashback' :
                                  usp.header.toLowerCase().includes('reward') ? 'rewards' :
                                  usp.header.toLowerCase().includes('discount') ? 'discount' :
                                  usp.header.toLowerCase().includes('fee') ? 'fee' : 'benefit';
                
                const isDescriptionExpanded = expandedDescriptions.has(index);
                const descriptionLength = usp.description?.length || 0;
                const shouldShowReadMore = descriptionLength > 120; // Show read more if description exceeds 120 characters
                const displayDescription = isDescriptionExpanded || !shouldShowReadMore 
                  ? usp.description 
                  : usp.description?.substring(0, 120) + '...';
                
                const toggleDescription = () => {
                  setExpandedDescriptions(prev => {
                    const newSet = new Set(prev);
                    if (newSet.has(index)) {
                      newSet.delete(index);
                    } else {
                      newSet.add(index);
                    }
                    return newSet;
                  });
                };
                
                return (
                  <div 
                    key={index}
                    className={cn(
                      "bg-gradient-to-br rounded-xl p-5 sm:p-6 border-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl flex flex-col h-full",
                      benefitType === 'cashback' && "from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800",
                      benefitType === 'rewards' && "from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800",
                      benefitType === 'discount' && "from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800",
                      benefitType === 'fee' && "from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200 dark:border-orange-800",
                      benefitType === 'benefit' && "from-primary/5 to-secondary/5 border-primary/20"
                    )}
                  >
                    <div className="flex flex-col h-full space-y-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md",
                          benefitType === 'cashback' && "bg-green-500 text-white",
                          benefitType === 'rewards' && "bg-blue-500 text-white",
                          benefitType === 'discount' && "bg-purple-500 text-white",
                          benefitType === 'fee' && "bg-orange-500 text-white",
                          benefitType === 'benefit' && "bg-primary text-primary-foreground"
                        )}>
                          {percentage ? (
                            <Percent className="w-6 h-6" />
                          ) : (
                            <Award className="w-6 h-6" />
                          )}
                        </div>
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <h3 className="font-bold text-sm sm:text-base text-foreground leading-tight">{usp.header}</h3>
                          <div className="space-y-1">
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                              {displayDescription}
                            </p>
                            {shouldShowReadMore && (
                              <button
                                onClick={toggleDescription}
                                className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                              >
                                {isDescriptionExpanded ? (
                                  <>
                                    Read Less
                                    <ChevronUp className="w-3 h-3" />
                                  </>
                                ) : (
                                  <>
                                    Read More
                                    <ChevronDown className="w-3 h-3" />
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Best For */}
        {card.tags && card.tags.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Best For</h2>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {card.tags.map((tag) => (
                <Badge 
                  key={tag.id} 
                  variant="secondary" 
                  className="text-sm sm:text-base px-4 py-2 sm:px-5 sm:py-2.5 font-medium"
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* Rewards & Redemption - Improved with N/A handling and cashback explanation */}
        {(card.reward_conversion_rate && !isEmptyOrNA(card.reward_conversion_rate)) || 
         (card.redemption_options && !isEmptyOrNA(card.redemption_options)) || 
         (card.redemption_catalogue && !isEmptyOrNA(card.redemption_catalogue)) ||
         (sortedUSPs.some(usp => usp.header.toLowerCase().includes('cashback'))) ? (
          <section ref={rewardsRef} id="rewards" className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Rewards & Redemption</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">How to earn and redeem rewards</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 sm:p-5">
              <div className="space-y-4">
                {/* Reward Conversion Rate */}
                {card.reward_conversion_rate && !isEmptyOrNA(card.reward_conversion_rate) && (
                  <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-4 h-4 text-muted-foreground" />
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Reward Conversion Rate</p>
                    </div>
                    <p className="text-lg sm:text-xl font-semibold text-foreground">
                      {card.reward_conversion_rate}
                    </p>
                  </div>
                )}

                {/* Redemption Options & Catalogue */}
                {(card.redemption_options && !isEmptyOrNA(card.redemption_options)) || 
                 (card.redemption_catalogue && !isEmptyOrNA(card.redemption_catalogue)) ||
                 sortedUSPs.some(usp => usp.header.toLowerCase().includes('cashback')) ? (
                  <div className="bg-background border border-border rounded-lg p-4 space-y-3">
                    {/* Redemption Options */}
                    {card.redemption_options && !isEmptyOrNA(card.redemption_options) ? (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-muted-foreground" />
                          <h3 className="text-sm sm:text-base font-semibold text-foreground">Redemption Options</h3>
                        </div>
                        <div 
                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(card.redemption_options) }}
                          className="prose prose-sm max-w-none text-xs sm:text-sm text-muted-foreground leading-relaxed
                            [&>ul]:list-disc [&>ul]:pl-4 [&>ul]:space-y-1.5 
                            [&>li]:text-muted-foreground [&>li]:leading-relaxed
                            [&>p]:mb-2 [&>p]:leading-relaxed
                            [&>strong]:text-foreground [&>strong]:font-semibold"
                        />
                      </div>
                    ) : sortedUSPs.some(usp => usp.header.toLowerCase().includes('cashback')) ? (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-muted-foreground" />
                          <h3 className="text-sm sm:text-base font-semibold text-foreground">Cashback Redemption</h3>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          Cashback is auto-adjusted in your monthly statement — no manual redemption required. The cashback earned will be credited directly to your account balance, reducing your outstanding amount.
                        </p>
                      </div>
                    ) : null}

                    {/* Redemption Catalogue */}
                    {card.redemption_catalogue && !isEmptyOrNA(card.redemption_catalogue) && (
                      <div className={(card.redemption_options && !isEmptyOrNA(card.redemption_options)) || sortedUSPs.some(usp => usp.header.toLowerCase().includes('cashback')) ? 'pt-3 border-t border-border' : ''}>
                        <div className="flex items-center gap-2 mb-2">
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                          <h3 className="text-sm sm:text-base font-semibold text-foreground">Redemption Catalogue</h3>
                        </div>
                        <a 
                          href={card.redemption_catalogue}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                        >
                          View Redemption Catalogue
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        {/* Fee Structure - Hide N/A sections */}
        {card.bank_fee_structure && 
         Object.keys(card.bank_fee_structure).some(key => 
           card.bank_fee_structure[key] && !isEmptyOrNA(card.bank_fee_structure[key])
         ) && (
          <section ref={feeStructureRef} id="fee-structure" className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Fee Structure</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Detailed fee breakdown and charges</p>
            </div>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <Accordion type="single" collapsible className="w-full">
                {(card.bank_fee_structure.forex_markup && !isEmptyOrNA(card.bank_fee_structure.forex_markup)) && (
                  <AccordionItem value="forex">
                    <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                      <span className="font-semibold">Foreign Currency Markup</span>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <p className="font-semibold mb-3 text-foreground">{card.bank_fee_structure.forex_markup}</p>
                      {card.bank_fee_structure.forex_markup_comment && !isEmptyOrNA(card.bank_fee_structure.forex_markup_comment) && (
                        <div 
                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(card.bank_fee_structure.forex_markup_comment) }} 
                          className="prose prose-sm max-w-none text-sm text-muted-foreground leading-relaxed" 
                        />
                      )}
                    </AccordionContent>
                  </AccordionItem>
                )}
                {(card.bank_fee_structure.apr_fees && !isEmptyOrNA(card.bank_fee_structure.apr_fees)) && (
                  <AccordionItem value="apr">
                    <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                      <span className="font-semibold">APR Fees</span>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <p className="font-semibold mb-3 text-foreground">{card.bank_fee_structure.apr_fees}</p>
                      {card.bank_fee_structure.apr_fees_comment && !isEmptyOrNA(card.bank_fee_structure.apr_fees_comment) && (
                        <div 
                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(card.bank_fee_structure.apr_fees_comment) }} 
                          className="prose prose-sm max-w-none text-sm text-muted-foreground leading-relaxed" 
                        />
                      )}
                    </AccordionContent>
                  </AccordionItem>
                )}
                {(card.bank_fee_structure.late_payment_fine && !isEmptyOrNA(card.bank_fee_structure.late_payment_fine)) && (
                  <AccordionItem value="late">
                    <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                      <span className="font-semibold">Late Payment Charges</span>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      {(card.bank_fee_structure.late_payment_annual && !isEmptyOrNA(card.bank_fee_structure.late_payment_annual)) ||
                       (card.bank_fee_structure.late_payment_fine && !isEmptyOrNA(card.bank_fee_structure.late_payment_fine)) ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          {card.bank_fee_structure.late_payment_annual && !isEmptyOrNA(card.bank_fee_structure.late_payment_annual) && (
                            <div>
                              <p className="font-semibold mb-2 text-foreground">Amount Range</p>
                              {card.bank_fee_structure.late_payment_annual.split('|').map((range, i) => (
                                <p key={i} className="text-muted-foreground mb-1">{range.trim()}</p>
                              ))}
                            </div>
                          )}
                          {card.bank_fee_structure.late_payment_fine && !isEmptyOrNA(card.bank_fee_structure.late_payment_fine) && (
                            <div>
                              <p className="font-semibold mb-2 text-foreground">Late Fee</p>
                              {card.bank_fee_structure.late_payment_fine.split('|').map((fee, i) => (
                                <p key={i} className="text-muted-foreground mb-1">{fee.trim()}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">{card.bank_fee_structure.late_payment_fine}</p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </div>
          </section>
        )}

        {/* Exclusions - Hide if N/A */}
        {((card.exclusion_earnings && !isEmptyOrNA(card.exclusion_earnings)) || 
          (card.exclusion_spends && !isEmptyOrNA(card.exclusion_spends))) && (
          <section className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Exclusions</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Spending and earning categories excluded from rewards/cashback</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {card.exclusion_earnings && !isEmptyOrNA(card.exclusion_earnings) && (
                <Accordion type="single" collapsible className="bg-card border border-border rounded-xl">
                  <AccordionItem value="earnings">
                    <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                      <span className="font-semibold">Earning Exclusions</span>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground leading-relaxed">
                        {card.exclusion_earnings.split(',').map((item, i) => (
                          <li key={i} className="pl-1">{item.trim()}</li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
              {card.exclusion_spends && !isEmptyOrNA(card.exclusion_spends) && (
                <Accordion type="single" collapsible className="bg-card border border-border rounded-xl">
                  <AccordionItem value="spends">
                    <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                      <span className="font-semibold">Spending Exclusions</span>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground leading-relaxed">
                        {card.exclusion_spends.split(',').map((item, i) => (
                          <li key={i} className="pl-1">{item.trim()}</li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </div>
          </section>
        )}

        {/* All Card Benefits - Enhanced with better UI */}
        {card.product_benefits && card.product_benefits.length > 0 && 
         card.product_benefits.some(b => b.html_text && !isEmptyOrNA(b.html_text)) && (
          <section className="animate-fade-in space-y-6 sm:space-y-8" ref={allBenefitsRef} id="all-benefits">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">All Card Benefits</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Comprehensive list of all benefits organized by category</p>
            </div>
            
            {/* Horizontal Scrollable Category Pills - Mobile Optimized */}
            <div className="relative">
              <div className="overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="flex gap-2 sm:gap-3 min-w-max">
                  {benefitCategories.map((category) => {
                    const isActive = selectedBenefitCategory === category;
                    // Only count benefits with actual content (not N/A or empty)
                    const categoryCount = category === 'All' 
                      ? card.product_benefits?.filter(b => 
                          b.html_text && !isEmptyOrNA(b.html_text) &&
                          b.benefit_type && 
                          b.benefit_type.toLowerCase() !== 'all' && 
                          b.benefit_type.toLowerCase() !== 'all benefits'
                        ).length 
                      : card.product_benefits?.filter(b => 
                          b.benefit_type === category && 
                          b.html_text && !isEmptyOrNA(b.html_text)
                        ).length;
                    
                    // Format category name: replace underscores and title case
                    const formattedCategory = category
                      .replace(/_/g, ' ')
                      .split(' ')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                      .join(' ');
                    
                    return (
                      <button
                        key={category}
                        onClick={() => setSelectedBenefitCategory(category)}
                        className={cn(
                          "px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all shadow-md touch-target min-h-[44px] flex items-center",
                          isActive 
                            ? 'bg-primary text-primary-foreground scale-105 shadow-lg' 
                            : 'bg-card text-muted-foreground hover:bg-muted border border-border'
                        )}
                      >
                        <span>{formattedCategory}</span>
                        <span className={cn("ml-2 text-[10px] sm:text-xs", isActive ? 'opacity-90' : 'opacity-60')}>
                          ({categoryCount})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Benefits List - Improved spacing and formatting */}
            <div className="space-y-4 sm:space-y-6">
              {filteredBenefits && filteredBenefits.length > 0 ? (
                filteredBenefits.map((benefit, index) => (
                  <div 
                    key={index}
                    className="bg-card border-2 border-border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="p-5 sm:p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 shadow-md">
                          <CheckCircle2 className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg sm:text-xl text-foreground mb-3">{benefit.sub_type}</h3>
                          <div 
                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(benefit.html_text) }}
                            className="prose prose-sm max-w-none text-sm sm:text-base text-muted-foreground leading-relaxed
                              [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-2 
                              [&>li]:text-muted-foreground [&>li]:leading-relaxed
                              [&>p]:mb-3 [&>p]:leading-relaxed
                              [&>strong]:text-foreground [&>strong]:font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-base">No benefits found in this category</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* How to Apply - Enhanced */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-2 border-primary/20 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -z-10" />
          
          <div className="text-center mb-6 sm:mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary mb-2">Quick & Paperless</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Ready to Get Started?</h2>
            <p className="text-sm sm:text-base text-muted-foreground">Apply online now with our quick, paperless process</p>
          </div>

          <div className="grid gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8 max-w-4xl mx-auto md:grid-cols-3">
            <div className="flex items-center gap-4 md:flex-col md:text-center md:items-center bg-background/70 border border-border rounded-2xl p-4 sm:p-5 shadow-md">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary to-secondary text-primary-foreground rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-bold shadow-lg">
                1
              </div>
              <div className="text-left md:text-center">
                <p className="font-semibold text-foreground mb-1 text-base sm:text-lg">Click Apply Online</p>
              <p className="text-sm text-muted-foreground">Start your application</p>
            </div>
            </div>
            <div className="flex items-center gap-4 md:flex-col md:text-center md:items-center bg-background/70 border border-border rounded-2xl p-4 sm:p-5 shadow-md">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary to-secondary text-primary-foreground rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-bold shadow-lg">
                2
              </div>
              <div className="text-left md:text-center">
                <p className="font-semibold text-foreground mb-1 text-base sm:text-lg">Complete KYC Details</p>
              <p className="text-sm text-muted-foreground">Submit your documents</p>
            </div>
            </div>
            <div className="flex items-center gap-4 md:flex-col md:text-center md:items-center bg-background/70 border border-border rounded-2xl p-4 sm:p-5 shadow-md">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary to-secondary text-primary-foreground rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-bold shadow-lg">
                3
              </div>
              <div className="text-left md:text-center">
                <p className="font-semibold text-foreground mb-1 text-base sm:text-lg">Quick Processing</p>
              <p className="text-sm text-muted-foreground">Bank will process your application shortly</p>
              </div>
            </div>
          </div>
        </section>

        {/* Terms & Conditions - Improved with Collapsible */}
        {card.tnc && !isEmptyOrNA(card.tnc) && (
          <section ref={tncRef} id="tnc" className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Terms & Conditions</h2>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <Accordion type="single" collapsible defaultValue="item-1">
                <AccordionItem value="item-1" className="border-none">
                  <AccordionTrigger className="px-6 py-5 hover:no-underline">
                    <span className="text-lg font-semibold text-foreground">View Terms & Conditions</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="pt-4 border-t border-border">
                      <div 
                        className="prose prose-sm max-w-none text-sm text-muted-foreground leading-relaxed whitespace-pre-line"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(card.tnc) }}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </section>
        )}
      </div>

      {/* Eligibility Dialog */}
      <EligibilityDialog
        open={showEligibilityDialog}
        onOpenChange={setShowEligibilityDialog}
        cardAlias={alias || ''}
        cardName={card.name}
        networkUrl={card.network_url}
      />

      {/* Comparison Panel */}
      <ComparePanel 
        open={isComparePanelOpen} 
        onOpenChange={setIsComparePanelOpen}
        preSelectedCard={card}
      />
      
      <Footer />
    </div>
  );
}
