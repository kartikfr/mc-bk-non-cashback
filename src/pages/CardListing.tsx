import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, X, ArrowUpDown, CheckCircle2, Sparkles } from "lucide-react";
import { cardService } from "@/services/cardService";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import confetti from 'canvas-confetti';
import { toast } from "sonner";

const CardListing = () => {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [displayCount, setDisplayCount] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showEligibilityDialog, setShowEligibilityDialog] = useState(false);
  const [eligibilitySubmitted, setEligibilitySubmitted] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [eligibleCount, setEligibleCount] = useState(0);
  
  // API-compliant filters
  const [filters, setFilters] = useState({
    slug: "",
    banks_ids: [] as number[],
    card_networks: [] as string[],
    annualFees: "",
    credit_score: "",
    sort_by: "",
    free_cards: ""
  });

  // Eligibility payload
  const [eligibility, setEligibility] = useState({
    pincode: "",
    inhandIncome: "",
    empStatus: "salaried"
  });

  useEffect(() => {
    fetchCards();
  }, [filters]);

  const fetchCards = async () => {
    try {
      setLoading(true);
      
      const params: any = {
        slug: filters.slug || searchQuery || "",
        banks_ids: filters.banks_ids || [],
        card_networks: filters.card_networks || [],
        annualFees: filters.annualFees || "",
        credit_score: filters.credit_score || "",
        sort_by: filters.sort_by || "",
        free_cards: filters.free_cards || ""
      };

      // Only include eligibility if submitted and complete
      if (eligibilitySubmitted && eligibility.pincode && eligibility.inhandIncome && eligibility.empStatus) {
        params.eligiblityPayload = eligibility;
      }

      const response = await cardService.getCardListing(params);

      if (response.data && response.data.cards) {
        setCards(response.data.cards);
      } else {
        console.error('Invalid response:', response);
        toast.error('Failed to load cards. Please try again.');
      }
    } catch (error: any) {
      console.error('Failed to fetch cards:', error);
      
      if (error.message?.includes('API key')) {
        toast.error('API key expired. Please contact support.', {
          description: 'The authentication key needs to be renewed.'
        });
      } else {
        toast.error('Unable to load cards. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setDisplayCount(12); // Reset display count on new search
    fetchCards();
  };

  const loadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setDisplayCount(prev => prev + 12);
      setIsLoadingMore(false);
    }, 500);
  };

  const handleFilterChange = (filterType: string, value: string | boolean) => {
    setFilters((prev: any) => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      slug: "",
      banks_ids: [],
      card_networks: [],
      annualFees: "",
      credit_score: "",
      sort_by: "",
      free_cards: ""
    });
    setSearchQuery("");
    setDisplayCount(12);
  };

  const handleEligibilitySubmit = async () => {
    // Validate inputs
    if (!eligibility.pincode || eligibility.pincode.length !== 6) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }
    if (!eligibility.inhandIncome) {
      toast.error("Please enter your monthly income");
      return;
    }
    
    setLoading(true);
    setShowEligibilityDialog(false);
    
    try {
      const response = await cardService.getCardListing({
        slug: "",
        banks_ids: [],
        card_networks: [],
        annualFees: "",
        credit_score: "",
        sort_by: "",
        free_cards: "",
        eligiblityPayload: eligibility
      });

      if (response.data && response.data.cards) {
        setCards(response.data.cards);
        setEligibleCount(response.data.cards.length);
        setEligibilitySubmitted(true);
        
        // Show confetti and success dialog
        if (response.data.cards.length > 0) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
          setShowSuccessDialog(true);
        } else {
          toast.error("No cards match your eligibility criteria", {
            description: "Try adjusting your details or browse all cards"
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch eligible cards:', error);
      toast.error("Unable to check eligibility. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter sidebar component
  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Lifetime Free (LTF) */}
      <div>
        <h3 className="font-semibold mb-3">Lifetime Free (LTF)</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            className="accent-primary w-4 h-4"
            checked={filters.free_cards === "true"}
            onChange={(e) => handleFilterChange('free_cards', e.target.checked ? "true" : "")}
          />
          <span className="text-sm">Show only Lifetime Free cards</span>
        </label>
      </div>

      {/* Annual Fee Range */}
      <div>
        <h3 className="font-semibold mb-3">Annual Fee Range</h3>
        <div className="space-y-2">
          {[
            { label: 'All Fees', value: '' },
            { label: '₹0 - ₹500', value: '0-500' },
            { label: '₹500 - ₹1,000', value: '500-1000' },
            { label: '₹1,000 - ₹5,000', value: '1000-5000' },
            { label: '₹5,000+', value: '5000-100000' }
          ].map((fee) => (
            <label key={fee.value} className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="annualFee" 
                className="accent-primary"
                checked={filters.annualFees === fee.value}
                onChange={() => handleFilterChange('annualFees', fee.value)}
              />
              <span className="text-sm">{fee.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Credit Score */}
      <div>
        <h3 className="font-semibold mb-3">Minimum Credit Score</h3>
        <div className="space-y-2">
          {[
            { label: 'All Scores', value: '' },
            { label: '600+', value: '600' },
            { label: '650+', value: '650' },
            { label: '750+ (Excellent)', value: '750' },
            { label: '800+ (Premium)', value: '800' }
          ].map((score) => (
            <label key={score.value} className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="creditScore" 
                className="accent-primary"
                checked={filters.credit_score === score.value}
                onChange={() => handleFilterChange('credit_score', score.value)}
              />
              <span className="text-sm">{score.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Card Network */}
      <div>
        <h3 className="font-semibold mb-3">Card Network</h3>
        <div className="space-y-2">
          {['VISA', 'Mastercard', 'RuPay', 'AmericanExpress'].map((network) => (
            <label key={network} className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                className="accent-primary"
                checked={filters.card_networks.includes(network)}
                onChange={(e) => {
                  setFilters((prev: any) => ({
                    ...prev,
                    card_networks: e.target.checked
                      ? [...prev.card_networks, network]
                      : prev.card_networks.filter((n: string) => n !== network)
                  }));
                }}
              />
              <span className="text-sm">{network === 'AmericanExpress' ? 'American Express' : network}</span>
            </label>
          ))}
        </div>
      </div>

      <Button variant="outline" className="w-full" onClick={clearFilters}>
        Clear All Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Search */}
      <section className="pt-28 pb-12 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl lg:text-5xl font-bold text-center mb-6">
            Explore 200+ Credit Cards
          </h1>
          
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search by card name, bank, or benefit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-12 h-14 text-lg"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      handleSearch();
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              <Button size="lg" onClick={handleSearch}>
                Search
              </Button>
            </div>
            
            {/* Top Filters */}
            <div className="flex flex-wrap items-center gap-3 justify-center">
              {/* Eligibility Check Dropdown */}
              <Sheet open={showEligibilityDialog} onOpenChange={setShowEligibilityDialog}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Eligibility Check
                    {eligibilitySubmitted && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                  </Button>
                </SheetTrigger>
                <SheetContent side="top" className="h-auto">
                  <SheetHeader>
                    <SheetTitle className="text-2xl">Card Eligibility</SheetTitle>
                    <p className="text-sm text-muted-foreground">
                      Enter your details and get personalised card recommendations
                    </p>
                  </SheetHeader>

                  <div className="grid md:grid-cols-3 gap-4 py-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Pin Code*</label>
                      <Input
                        type="text"
                        placeholder="122003"
                        value={eligibility.pincode}
                        onChange={(e) => setEligibility(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                        maxLength={6}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Monthly In Hand Income*</label>
                      <Input
                        type="text"
                        placeholder="₹1,00,000"
                        value={eligibility.inhandIncome}
                        onChange={(e) => setEligibility(prev => ({ ...prev, inhandIncome: e.target.value.replace(/\D/g, '') }))}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Income Type*</label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant={eligibility.empStatus === "salaried" ? "default" : "outline"}
                          onClick={() => setEligibility(prev => ({ ...prev, empStatus: "salaried" }))}
                        >
                          💼 Salaried
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={eligibility.empStatus === "self_employed" ? "default" : "outline"}
                          onClick={() => setEligibility(prev => ({ ...prev, empStatus: "self_employed" }))}
                        >
                          💻 Self
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleEligibilitySubmit}
                    className="w-full"
                    disabled={!eligibility.pincode || !eligibility.inhandIncome}
                  >
                    Find Eligible Cards
                  </Button>
                </SheetContent>
              </Sheet>

              <Select
                value={filters.sort_by}
                onValueChange={(value) => handleFilterChange('sort_by', value)}
              >
                <SelectTrigger className="w-48">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">Recommended</SelectItem>
                  <SelectItem value="annual_savings">Annual Savings</SelectItem>
                  <SelectItem value="annual_fees">Annual Fees</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => handleFilterChange('free_cards', !filters.free_cards)}
                className={filters.free_cards ? "border-primary" : ""}
              >
                Free Cards Only
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex gap-8">
            {/* Desktop Filters Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-28 bg-card rounded-2xl shadow-lg p-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
                <h2 className="text-xl font-bold mb-6">Filters</h2>
                <FilterSidebar />
              </div>
            </aside>

            {/* Card Grid */}
            <div className="flex-1">
              {/* Mobile Filter Button */}
              <div className="lg:hidden mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {Math.min(displayCount, cards.length)} of {cards.length} cards
                </p>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterSidebar />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Active Filters */}
              {(filters.free_cards || filters.annualFees || filters.credit_score || searchQuery) && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {searchQuery && (
                    <Badge variant="secondary" className="gap-2">
                      Search: {searchQuery}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => {
                          setSearchQuery("");
                          handleSearch();
                        }}
                      />
                    </Badge>
                  )}
                  {filters.free_cards && (
                    <Badge variant="secondary" className="gap-2">
                      Lifetime Free
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => handleFilterChange('free_cards', "")}
                      />
                    </Badge>
                  )}
                  {filters.annualFees && (
                    <Badge variant="secondary" className="gap-2">
                      Fee: ₹{filters.annualFees}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => handleFilterChange('annualFees', '')}
                      />
                    </Badge>
                  )}
                  {filters.credit_score && (
                    <Badge variant="secondary" className="gap-2">
                      Credit Score: {filters.credit_score}+
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => handleFilterChange('credit_score', '')}
                      />
                    </Badge>
                  )}
                </div>
              )}

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-4 text-muted-foreground">Loading cards...</p>
                </div>
              ) : cards.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-xl text-muted-foreground">No cards found matching your criteria</p>
                  <Button variant="outline" className="mt-4" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {cards.slice(0, displayCount).map((card, index) => (
                      <div
                        key={card.id || index}
                        className="bg-card rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all hover:-translate-y-2"
                      >
                        <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-4">
                          {eligibilitySubmitted && (
                            <Badge className="absolute top-3 left-3 bg-green-500 gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Eligible
                            </Badge>
                          )}
                          {(card.joining_fee_text === "0" || card.joining_fee_text?.toLowerCase() === "free") && (
                            <Badge className="absolute top-3 right-3 bg-primary">LTF</Badge>
                          )}
                          <img
                            src={card.card_bg_image || card.image}
                            alt={card.name}
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                        </div>

                        <div className="p-6">
                          <div className="mb-2 flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {card.card_type}
                            </Badge>
                            {card.banks?.name && (
                              <span className="text-xs text-muted-foreground">{card.banks.name}</span>
                            )}
                          </div>
                          
                          <h3 className="text-xl font-bold mb-3 line-clamp-2">{card.name}</h3>
                          
                          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg mb-4">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Joining Fee</p>
                              <p className="text-sm font-semibold">
                                {card.joining_fee_text === "0" || card.joining_fee_text?.toLowerCase() === "free" 
                                  ? "Free" 
                                  : `₹${card.joining_fee_text}`}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Annual Fee</p>
                              <p className="text-sm font-semibold">
                                {card.annual_fee_text === "0" || card.annual_fee_text?.toLowerCase() === "free" 
                                  ? "Free" 
                                  : `₹${card.annual_fee_text}`}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Link to={`/cards/${card.seo_card_alias || card.card_alias}`} className="flex-1">
                              <Button variant="outline" className="w-full">Details</Button>
                            </Link>
                            <Button 
                              className="flex-1"
                              onClick={() => {
                                if (card.network_url) {
                                  window.open(card.network_url, '_blank', 'noopener,noreferrer');
                                }
                              }}
                            >
                              Apply
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Load More Button */}
                  {displayCount < cards.length && (
                    <div className="text-center mt-8">
                      <Button 
                        size="lg" 
                        variant="outline" 
                        onClick={loadMore}
                        disabled={isLoadingMore}
                      >
                        {isLoadingMore ? (
                          <>
                            <div className="inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                            Loading...
                          </>
                        ) : (
                          `Load More Cards (${cards.length - displayCount} remaining)`
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="text-3xl mb-2">🎉 Congratulations!</DialogTitle>
            <DialogDescription className="text-lg">
              You are eligible for <span className="text-2xl font-bold text-primary">{eligibleCount}</span> credit card{eligibleCount !== 1 ? 's' : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground mb-4">
              Browse through your personalized recommendations below
            </p>
            <Button onClick={() => setShowSuccessDialog(false)} className="w-full">
              View Cards
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CardListing;
