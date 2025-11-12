import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { cardService } from '@/services/cardService';
import Navigation from '@/components/Navigation';
import { Star, ChevronDown, ChevronUp, Share2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';

interface CardData {
  id: number;
  name: string;
  nick_name: string;
  card_type: string;
  rating: number;
  user_rating_count: number;
  image: string;
  card_bg_image: string;
  card_bg_gradient: string;
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
  const [card, setCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFixedCTA, setShowFixedCTA] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchCardDetails();
  }, [alias]);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const heroBottom = heroRef.current.getBoundingClientRect().bottom;
        setShowFixedCTA(heroBottom < 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchCardDetails = async () => {
    if (!alias) return;
    
    try {
      setLoading(true);
      const response = await cardService.getCardDetailsByAlias(alias);
      if (response.status === 'success' && response.data?.[0]) {
        setCard(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching card details:', error);
      toast.error('Failed to load card details');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: card?.name || 'Credit Card',
          text: `Check out ${card?.name}`,
          url: url,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleApply = () => {
    if (card?.network_url) {
      window.open(card.network_url, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
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
      <div className="min-h-screen bg-background">
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
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
                {card.card_bg_image && (
                  <img 
                    src={card.card_bg_image} 
                    alt={`${card.name} background`}
                    className="w-full h-auto rounded-2xl shadow-2xl"
                  />
                )}
                {card.image && (
                  <img 
                    src={card.image} 
                    alt={card.name}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-auto"
                  />
                )}
              </div>
            </div>

            {/* Card Info */}
            <div className="text-white space-y-6 animate-fade-in">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{card.name}</h1>
                <div className="flex items-center gap-4 flex-wrap">
                  <Badge variant="secondary" className="text-sm">
                    {card.card_type}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(card.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-400'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm" aria-label={`${card.rating} out of 5 stars (${card.user_rating_count} reviews)`}>
                      {card.rating} ({card.user_rating_count?.toLocaleString()} reviews)
                    </span>
                  </div>
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
              <div className="flex gap-4 flex-wrap">
                <Button 
                  size="lg" 
                  onClick={handleApply}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold animate-pulse"
                >
                  Apply Now
                  <ExternalLink className="ml-2 w-4 h-4" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={handleShare}
                  className="border-white text-white hover:bg-white/10"
                >
                  <Share2 className="mr-2 w-4 h-4" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fixed CTA (Mobile) */}
      {showFixedCTA && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-50 md:hidden animate-slide-in-right">
          <Button 
            className="w-full" 
            size="lg"
            onClick={handleApply}
          >
            Apply Now - Instant Decision in 60s
          </Button>
        </div>
      )}

      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* USPs Grid */}
        <section className="animate-fade-in">
          <h2 className="text-2xl font-bold text-foreground mb-6">Key Highlights</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sortedUSPs.map((usp, index) => (
              <div 
                key={index}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <h3 className="font-semibold text-foreground mb-2">{usp.header}</h3>
                <p className="text-sm text-muted-foreground">{usp.description}</p>
              </div>
            ))}
          </div>
        </section>

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

        {/* Fees & Savings */}
        <section className="bg-card border border-border rounded-xl p-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Fees & Savings</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Joining Fee</p>
              <p className="text-2xl font-bold text-foreground">₹{card.joining_fee_text}</p>
              {card.joining_fee_offset && (
                <p className="text-xs text-muted-foreground mt-1">{card.joining_fee_offset}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Annual Fee</p>
              <p className="text-2xl font-bold text-foreground">₹{card.annual_fee_text}</p>
              {card.annual_fee_waiver && (
                <p className="text-xs text-muted-foreground mt-1">Waiver: {card.annual_fee_waiver}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Estimated Annual Savings</p>
              <p className="text-2xl font-bold text-primary">₹{card.annual_saving}</p>
            </div>
          </div>
        </section>

        {/* Eligibility */}
        <section className="bg-card border border-border rounded-xl p-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Eligibility</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Age</p>
              <p className="text-lg font-semibold text-foreground">{card.min_age}-{card.max_age} years</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Credit Score</p>
              <p className="text-lg font-semibold text-foreground">{card.crif}+</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Min Income (Salaried)</p>
              <p className="text-lg font-semibold text-foreground">₹{card.income_salaried} LPA</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Employment</p>
              <p className="text-lg font-semibold text-foreground capitalize">{card.employment_type}</p>
            </div>
          </div>
        </section>

        {/* Rewards & Redemption */}
        <section className="bg-card border border-border rounded-xl p-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Rewards & Redemption</h2>
          <div className="space-y-4">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Reward Conversion Rate</p>
              <p className="text-xl font-bold text-foreground">{card.reward_conversion_rate}</p>
            </div>
            {card.redemption_options && (
              <div dangerouslySetInnerHTML={{ __html: card.redemption_options }} className="prose prose-sm max-w-none" />
            )}
            {card.redemption_catalogue && (
              <Button 
                variant="outline" 
                onClick={() => window.open(card.redemption_catalogue, '_blank', 'noopener,noreferrer')}
              >
                View Reward Catalogue
                <ExternalLink className="ml-2 w-4 h-4" />
              </Button>
            )}
          </div>
        </section>

        {/* Bank Fee Structure */}
        {card.bank_fee_structure && (
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6">Fee Structure</h2>
            <Accordion type="single" collapsible className="bg-card border border-border rounded-xl">
              <AccordionItem value="forex">
                <AccordionTrigger className="px-6">Foreign Currency Markup</AccordionTrigger>
                <AccordionContent className="px-6">
                  <p className="font-semibold mb-2">{card.bank_fee_structure.forex_markup}</p>
                  {card.bank_fee_structure.forex_markup_comment && (
                    <div dangerouslySetInnerHTML={{ __html: card.bank_fee_structure.forex_markup_comment }} className="prose prose-sm max-w-none text-muted-foreground" />
                  )}
                </AccordionContent>
              </AccordionItem>
              {card.bank_fee_structure.apr_fees && (
                <AccordionItem value="apr">
                  <AccordionTrigger className="px-6">APR Fees</AccordionTrigger>
                  <AccordionContent className="px-6">
                    <p className="font-semibold mb-2">{card.bank_fee_structure.apr_fees}</p>
                    {card.bank_fee_structure.apr_fees_comment && (
                      <div dangerouslySetInnerHTML={{ __html: card.bank_fee_structure.apr_fees_comment }} className="prose prose-sm max-w-none text-muted-foreground" />
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

        {/* All Benefits */}
        {card.product_benefits && card.product_benefits.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6">All Card Benefits</h2>
            <Accordion type="single" collapsible className="space-y-4">
              {card.product_benefits.map((benefit, index) => (
                <AccordionItem 
                  key={index} 
                  value={`benefit-${index}`}
                  className="bg-card border border-border rounded-xl overflow-hidden"
                >
                  <AccordionTrigger className="px-6 hover:no-underline">
                    <span className="font-semibold">{benefit.sub_type}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6">
                    <div 
                      dangerouslySetInnerHTML={{ __html: benefit.html_text }} 
                      className="prose prose-sm max-w-none text-muted-foreground"
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        )}

        {/* How to Apply */}
        <section className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-border rounded-xl p-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">How to Apply</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                1
              </div>
              <p className="text-sm text-muted-foreground">Click Apply Now</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                2
              </div>
              <p className="text-sm text-muted-foreground">Complete KYC Details</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                3
              </div>
              <p className="text-sm text-muted-foreground">Await Approval</p>
            </div>
          </div>
          <div className="text-center">
            <Button size="lg" onClick={handleApply}>
              Apply Now
              <ExternalLink className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </section>

        {/* Terms & Conditions */}
        <section>
          <Accordion type="single" collapsible className="bg-card border border-border rounded-xl">
            <AccordionItem value="tnc">
              <AccordionTrigger className="px-6">
                <h2 className="text-xl font-bold">Terms & Conditions</h2>
              </AccordionTrigger>
              <AccordionContent className="px-6">
                <p className="text-sm text-muted-foreground whitespace-pre-line">{card.tnc}</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </div>

      {/* Footer Section */}
      <div className="bg-card border-t border-border py-8">
        <div className="container mx-auto px-4 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Issued by {card.banks?.name || 'Bank'}
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="ghost" size="sm" onClick={() => window.print()}>
              Print
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
