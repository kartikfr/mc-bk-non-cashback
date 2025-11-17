import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { cardService } from '@/services/cardService';
import Navigation from '@/components/Navigation';
import { Star, ChevronDown, ChevronUp, Share2, ExternalLink, Gift, Award, Sparkles, ArrowLeft, Shield, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';
import EligibilityDialog from '@/components/EligibilityDialog';
import { sanitizeHtml } from '@/lib/sanitize';
import { openRedirectInterstitial, extractBankName, extractBankLogo } from '@/utils/redirectHandler';
import { CompareToggleIcon } from '@/components/comparison/CompareToggleIcon';
import { ComparePanel } from '@/components/comparison/ComparePanel';
import { useComparison } from '@/contexts/ComparisonContext';

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
  const navigate = useNavigate();
  const [card, setCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFixedCTA, setShowFixedCTA] = useState(false);
  const [selectedBenefitCategory, setSelectedBenefitCategory] = useState<string>('All');
  const [showEligibilityDialog, setShowEligibilityDialog] = useState(false);
  const [isComparePanelOpen, setIsComparePanelOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
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
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    if (card?.network_url) {
      openRedirectInterstitial({
        networkUrl: card.network_url,
        bankName: extractBankName(card),
        bankLogo: extractBankLogo(card),
        cardName: card.name,
        cardId: card.id
      });
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
          <Link to="/cards">
            <Button>Back to Cards</Button>
          </Link>
        </div>
      </div>
    );
  }

  const sortedUSPs = [...(card.product_usps || [])].sort((a, b) => a.priority - b.priority);
  const topUSPs = sortedUSPs.slice(0, 4);

  // Group benefits by type for horizontal scroll - exclude "All Benefits" and "all" variations
  const benefitTypes = card.product_benefits 
    ? Array.from(new Set(card.product_benefits
        .map(b => b.benefit_type)
        .filter(type => type && type.toLowerCase() !== 'all' && type.toLowerCase() !== 'all benefits')
      ))
    : [];
  
  const benefitCategories = ['All', ...benefitTypes];

  const filteredBenefits = selectedBenefitCategory === 'All' 
    ? card.product_benefits?.filter(b => 
        b.benefit_type && 
        b.benefit_type.toLowerCase() !== 'all' && 
        b.benefit_type.toLowerCase() !== 'all benefits'
      )
    : card.product_benefits?.filter(b => b.benefit_type === selectedBenefitCategory);

  return (
    <div className="min-h-screen bg-background pt-24 md:pt-28">
      <Navigation />
      
      {/* Back Button & Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-4 mb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigate('/cards');
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
          <Link to="/cards" className="hover:text-foreground">Cards</Link>
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
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
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
            <div className="text-white space-y-6 animate-fade-in">
              {/* Share Button - Top Right */}
              <button
                onClick={handleShare}
                className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full flex items-center justify-center transition-all"
                aria-label="Share card"
              >
                <Share2 className="w-5 h-5 text-white" />
              </button>

              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{card.name}</h1>
                <div className="flex items-center gap-4 flex-wrap">
                  <Badge variant="secondary" className="text-sm">
                    {card.card_type}
                  </Badge>
                </div>
              </div>

              {/* Top USPs */}
              <div className="space-y-2">
                {topUSPs.slice(0, 2).map((usp, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">✓</span>
                    <div>
                      <p className="font-semibold">{usp.header}</p>
                      <p className="text-sm text-gray-200">{usp.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex gap-3 flex-wrap items-center">
                <Button 
                  size="lg" 
                  onClick={handleApply}
                  className="bg-white text-primary hover:bg-white/90 font-semibold"
                >
                  Apply Now
                  <ExternalLink className="ml-2 w-4 h-4" />
                </Button>
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
                  className="border-white text-white hover:bg-white/10"
                >
                  <Shield className="mr-2 w-4 h-4" />
                  Check Eligibility
                </Button>
                <Button
                  size="sm"
                  variant={isSelected(card.seo_card_alias) ? "secondary" : "ghost"}
                  onClick={() => {
                    startComparisonWith(card);
                    setIsComparePanelOpen(true);
                  }}
                  className={isSelected(card.seo_card_alias) 
                    ? "border border-white/50 text-white bg-white/20 hover:bg-white/30" 
                    : "border border-white/30 text-white/80 hover:text-white hover:bg-white/10"
                  }
                >
                  {isSelected(card.seo_card_alias) ? (
                    <>
                      <Check className="mr-2 w-4 h-4" />
                      Added
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 w-4 h-4" />
                      Compare
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Apply Now Button */}
      {showFixedCTA && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-3 z-50 shadow-lg animate-slide-in-right">
          <div className="container mx-auto px-4 flex gap-3">
            <Button 
              className="flex-1" 
              size="lg"
              onClick={handleApply}
            >
              Apply Now - Instant Decision
              <ExternalLink className="ml-2 w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant={isSelected(card.seo_card_alias) ? "default" : "outline"}
              onClick={() => {
                startComparisonWith(card);
                setIsComparePanelOpen(true);
              }}
              className={isSelected(card.seo_card_alias)
                ? "border-2 border-primary bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                : "border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold"
              }
            >
              {isSelected(card.seo_card_alias) ? (
                <>
                  <Check className="mr-2 w-5 h-5" />
                  Added
                </>
              ) : (
                <>
                  <Plus className="mr-2 w-5 h-5" />
                  Compare
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Quick Navigation */}
      {showFixedCTA && (
        <div className="fixed top-24 left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border z-40 shadow-md">
          <div className="container mx-auto px-4">
            <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
              {[
                { id: 'fees', label: 'Fees', ref: feesRef },
                { id: 'benefits', label: 'Benefits', ref: benefitsRef },
                { id: 'rewards', label: 'Rewards', ref: rewardsRef },
                { id: 'fee-structure', label: 'Fee Structure', ref: feeStructureRef },
                { id: 'all-benefits', label: 'All Benefits', ref: allBenefitsRef },
                { id: 'tnc', label: 'T&Cs', ref: tncRef }
              ].map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.ref, section.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                    activeSection === section.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Fees & Eligibility - Moved to top as users want to see this first */}
        <div className="grid lg:grid-cols-2 gap-6" ref={feesRef}>
          {/* Fees */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Fees</h2>
            <section className="bg-card border border-border rounded-xl p-6" id="fees">
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 pb-4 border-b border-border">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Joining Fee</p>
                    <p className="text-2xl font-bold text-foreground">₹{card.joining_fee_text}</p>
                  </div>
                  {card.joining_fee_offset && (
                    <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-2.5 max-w-full md:max-w-sm">
                      <p className="text-xs font-medium text-primary leading-relaxed">
                        {card.joining_fee_offset}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Annual Fee</p>
                    <p className="text-2xl font-bold text-foreground">₹{card.annual_fee_text}</p>
                  </div>
                  {card.annual_fee_waiver && (
                    <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-2.5 max-w-full md:max-w-sm">
                      <p className="text-xs font-semibold text-primary mb-1">Waiver</p>
                      <p className="text-xs text-primary/90 leading-relaxed">
                        {card.annual_fee_waiver}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Eligibility */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Eligibility</h2>
            <section className="bg-card border border-border rounded-xl p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Age</p>
                  <p className="text-lg font-semibold text-foreground">{card.min_age}-{card.max_age} years</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Credit Score</p>
                  <p className="text-lg font-semibold text-foreground">{card.crif}+</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Min Income</p>
                  <p className="text-lg font-semibold text-foreground">₹{card.income_salaried} LPA</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Employment</p>
                  <p className="text-lg font-semibold text-foreground capitalize">{card.employment_type}</p>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* All Benefits - Improved layout */}
        {sortedUSPs.length > 2 && (
          <section className="animate-fade-in" ref={benefitsRef} id="benefits">
            <h2 className="text-2xl font-bold text-foreground mb-6">Key Benefits</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {sortedUSPs.slice(2).map((usp, index) => (
                <div 
                  key={index}
                  className="bg-card border border-border rounded-lg p-5 hover:border-primary/50 transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-primary text-lg">✓</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1.5">{usp.header}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{usp.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Best For */}
        {card.tags && card.tags.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6">Best For</h2>
            <div className="flex flex-wrap gap-3">
              {card.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="text-sm px-4 py-2">
                  {tag.name}
                </Badge>
              ))}
            </div>
          </section>
        )}


        {/* Rewards & Redemption - Aligned with Design System */}
        <section className="bg-card border border-border rounded-xl p-8" ref={rewardsRef} id="rewards">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-sm">
              <Gift className="w-7 h-7 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Rewards & Redemption</h2>
          </div>
          
          <div className="space-y-6">
            {/* Reward Conversion Rate */}
            <div className="bg-background border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-primary" />
                <p className="text-sm font-medium text-muted-foreground">Reward Conversion Rate</p>
              </div>
              <p className="text-3xl font-bold text-primary">
                {card.reward_conversion_rate}
              </p>
            </div>

            {/* Redemption Options & Catalogue - Single Aligned Section */}
            <div className="bg-background border border-border rounded-xl p-6 space-y-4">
              {/* Redemption Options */}
              {card.redemption_options && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Redemption Options</h3>
                  </div>
                  <div 
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(card.redemption_options) }}
                    className="prose prose-sm max-w-none text-muted-foreground 
                      [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-2 
                      [&>li]:text-muted-foreground [&>li]:leading-relaxed
                      [&>p]:mb-3 [&>p]:leading-relaxed
                      [&>strong]:text-foreground [&>strong]:font-semibold"
                  />
                </div>
              )}

              {/* Redemption Catalogue */}
              {card.redemption_catalogue && card.redemption_catalogue !== 'N/A' && (
                <div className={card.redemption_options ? 'pt-4 border-t border-border' : ''}>
                  <div className="flex items-center gap-2 mb-3">
                    <ExternalLink className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Redemption Catalogue</h3>
                  </div>
                  <a 
                    href={card.redemption_catalogue}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
                  >
                    View Redemption Catalogue
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Bank Fee Structure */}
        {card.bank_fee_structure && (
          <section ref={feeStructureRef} id="fee-structure">
            <h2 className="text-2xl font-bold text-foreground mb-6">Fee Structure</h2>
            <Accordion type="single" collapsible className="bg-card border border-border rounded-xl">
              <AccordionItem value="forex">
                <AccordionTrigger className="px-6">Foreign Currency Markup</AccordionTrigger>
                <AccordionContent className="px-6">
                  <p className="font-semibold mb-2">{card.bank_fee_structure.forex_markup}</p>
                  {card.bank_fee_structure.forex_markup_comment && (
                    <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(card.bank_fee_structure.forex_markup_comment) }} className="prose prose-sm max-w-none text-muted-foreground" />
                  )}
                </AccordionContent>
              </AccordionItem>
              {card.bank_fee_structure.apr_fees && (
                <AccordionItem value="apr">
                  <AccordionTrigger className="px-6">APR Fees</AccordionTrigger>
                  <AccordionContent className="px-6">
                    <p className="font-semibold mb-2">{card.bank_fee_structure.apr_fees}</p>
                    {card.bank_fee_structure.apr_fees_comment && (
                      <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(card.bank_fee_structure.apr_fees_comment) }} className="prose prose-sm max-w-none text-muted-foreground" />
                    )}
                  </AccordionContent>
                </AccordionItem>
              )}
              <AccordionItem value="late">
                <AccordionTrigger className="px-6">Late Payment Charges</AccordionTrigger>
                <AccordionContent className="px-6 space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-semibold mb-2">Amount Range</p>
                      {card.bank_fee_structure.late_payment_annual?.split('|').map((range, i) => (
                        <p key={i} className="text-muted-foreground">{range.trim()}</p>
                      ))}
                    </div>
                    <div>
                      <p className="font-semibold mb-2">Late Fee</p>
                      {card.bank_fee_structure.late_payment_fine?.split('|').map((fee, i) => (
                        <p key={i} className="text-muted-foreground">{fee.trim()}</p>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
        )}

        {/* Exclusions */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Exclusions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Accordion type="single" collapsible className="bg-card border border-border rounded-xl">
              <AccordionItem value="earnings">
                <AccordionTrigger className="px-6">Earning Exclusions</AccordionTrigger>
                <AccordionContent className="px-6">
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {card.exclusion_earnings?.split(',').map((item, i) => (
                      <li key={i}>{item.trim()}</li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Accordion type="single" collapsible className="bg-card border border-border rounded-xl">
              <AccordionItem value="spends">
                <AccordionTrigger className="px-6">Spending Exclusions</AccordionTrigger>
                <AccordionContent className="px-6">
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {card.exclusion_spends?.split(',').map((item, i) => (
                      <li key={i}>{item.trim()}</li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* All Card Benefits - With Horizontal Scroll Categories */}
        {card.product_benefits && card.product_benefits.length > 0 && (
          <section className="animate-fade-in" ref={allBenefitsRef} id="all-benefits">
            <h2 className="text-3xl font-bold text-foreground mb-6">All Card Benefits</h2>
            
            {/* Horizontal Scrollable Category Pills */}
            <div className="relative mb-6">
              <div className="overflow-x-auto pb-3 scrollbar-hide">
                <div className="flex gap-3 min-w-max">
                  {benefitCategories.map((category) => {
                    const isActive = selectedBenefitCategory === category;
                    const categoryCount = category === 'All' 
                      ? card.product_benefits?.length 
                      : card.product_benefits?.filter(b => b.benefit_type === category).length;
                    
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
                        className={`px-6 py-3 rounded-full text-sm font-semibold whitespace-nowrap transition-all shadow-md ${
                          isActive 
                            ? 'bg-primary text-primary-foreground scale-105 shadow-lg' 
                            : 'bg-card text-muted-foreground hover:bg-muted border border-border'
                        }`}
                      >
                        <span>{formattedCategory}</span>
                        <span className={`ml-2 text-xs ${isActive ? 'opacity-90' : 'opacity-60'}`}>
                          ({categoryCount})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Benefits List */}
            <div className="space-y-3">
              {filteredBenefits && filteredBenefits.length > 0 ? (
                filteredBenefits.map((benefit, index) => (
                  <div 
                    key={index}
                    className="bg-card border-2 border-border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-md transition-all duration-200"
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 shadow-md">
                          <span className="text-primary-foreground text-sm font-bold">✓</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-foreground mb-3">{benefit.sub_type}</h3>
                          <div 
                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(benefit.html_text) }}
                            className="prose prose-sm max-w-none text-muted-foreground 
                              [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1 
                              [&>li]:text-muted-foreground [&>li]:leading-relaxed
                              [&>p]:mb-2 [&>p]:leading-relaxed
                              [&>strong]:text-foreground [&>strong]:font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No benefits found in this category
                </div>
              )}
            </div>
          </section>
        )}

        {/* How to Apply - Enhanced */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-2 border-primary/20 rounded-2xl p-10 shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -z-10" />
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Ready to Get Started?</h2>
            <p className="text-muted-foreground">Apply now and get instant decision in 60 seconds</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-lg">
                1
              </div>
              <p className="font-semibold text-foreground mb-1">Click Apply Now</p>
              <p className="text-sm text-muted-foreground">Start your application</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-lg">
                2
              </div>
              <p className="font-semibold text-foreground mb-1">Complete KYC Details</p>
              <p className="text-sm text-muted-foreground">Submit your documents</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-lg">
                3
              </div>
              <p className="font-semibold text-foreground mb-1">Get Instant Decision</p>
              <p className="text-sm text-muted-foreground">Approval in 60 seconds</p>
            </div>
          </div>
          <div className="text-center">
            <Button size="lg" onClick={handleApply} className="px-8 shadow-lg hover:shadow-xl transition-all">
              Apply Now - Get Instant Decision
              <ExternalLink className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </section>

        {/* Terms & Conditions - Improved */}
        <section ref={tncRef} id="tnc">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <button
              onClick={(e) => {
                const content = e.currentTarget.nextElementSibling;
                if (content) {
                  content.classList.toggle('hidden');
                  const icon = e.currentTarget.querySelector('svg');
                  if (icon) {
                    icon.classList.toggle('rotate-180');
                  }
                }
              }}
              className="w-full px-6 py-5 flex items-center justify-between hover:bg-muted/50 transition-colors group"
            >
              <h2 className="text-xl font-bold text-foreground">Terms & Conditions</h2>
              <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform rotate-180 group-hover:text-foreground" />
            </button>
            <div className="px-6 pb-6">
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{card.tnc}</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer Section - Enhanced */}
      <div className="bg-gradient-to-r from-muted/30 to-muted/50 border-t-2 border-border py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-6 py-3 shadow-sm">
              <Star className="w-5 h-5 text-primary fill-primary" />
              <p className="text-sm font-semibold text-foreground">
                Issued by {card.banks?.name || 'Bank'}
              </p>
            </div>
            <div className="flex justify-center gap-4">
              <Button variant="outline" size="lg" onClick={handleShare} className="shadow-sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share Card
              </Button>
              <Button variant="outline" size="lg" onClick={() => window.print()} className="shadow-sm">
                Print Details
              </Button>
            </div>
            <p className="text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              All information is subject to change. Please verify with the issuing bank before applying. 
              Terms and conditions apply.
            </p>
          </div>
        </div>
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
    </div>
  );
}
