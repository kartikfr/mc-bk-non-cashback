import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cardService } from "@/services/cardService";

const CardListing = () => {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<any>({
    banks_ids: [],
    annualFees: "",
    free_cards: "",
    credit_score: "",
    card_networks: []
  });

  useEffect(() => {
    fetchCards();
  }, [filters]);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const response = await cardService.getCardListing({
        slug: "",
        banks_ids: filters.banks_ids,
        card_networks: filters.card_networks,
        annualFees: filters.annualFees,
        credit_score: filters.credit_score,
        sort_by: "relevance",
        free_cards: filters.free_cards,
        eligiblityPayload: {
          pincode: "110001",
          inhandIncome: "50000",
          empStatus: "salaried"
        },
        cardGeniusPayload: {}
      });

      if (response.data && response.data.cards) {
        setCards(response.data.cards);
      }
    } catch (error) {
      console.error('Failed to fetch cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchCards();
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters((prev: any) => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      banks_ids: [],
      annualFees: "",
      free_cards: "",
      credit_score: "",
      card_networks: []
    });
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Search */}
      <section className="pt-28 pb-12 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl lg:text-5xl font-bold text-center mb-6">
            Explore 200+ Credit Cards
          </h1>
          
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search by card name, bank, or benefit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-12 h-14 text-lg"
                />
              </div>
              <Button size="lg" onClick={handleSearch}>
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex gap-8">
            {/* Filters Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-28 bg-card rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-6">Filters</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Annual Fee</h3>
                    <div className="space-y-2">
                      {[
                        { label: 'All Cards', value: '' },
                        { label: 'Free Cards', value: 'free' },
                        { label: '₹0 - ₹500', value: '0-500' },
                        { label: '₹500 - ₹2,000', value: '500-2000' },
                        { label: '₹2,000+', value: '2000+' }
                      ].map((fee) => (
                        <label key={fee.value} className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name="fee" 
                            className="accent-primary"
                            checked={filters.annualFees === fee.value}
                            onChange={() => handleFilterChange('annualFees', fee.value)}
                          />
                          <span className="text-sm">{fee.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Credit Score</h3>
                    <div className="space-y-2">
                      {[
                        { label: 'All Scores', value: '' },
                        { label: 'Excellent (750+)', value: '750+' },
                        { label: 'Good (650-750)', value: '650-750' },
                        { label: 'Fair (550-650)', value: '550-650' }
                      ].map((score) => (
                        <label key={score.value} className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name="score" 
                            className="accent-primary"
                            checked={filters.credit_score === score.value}
                            onChange={() => handleFilterChange('credit_score', score.value)}
                          />
                          <span className="text-sm">{score.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Card Network</h3>
                    <div className="space-y-2">
                      {['Visa', 'Mastercard', 'RuPay', 'American Express'].map((network) => (
                        <label key={network} className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="accent-primary"
                            checked={filters.card_networks.includes(network.toLowerCase())}
                            onChange={(e) => {
                              const value = network.toLowerCase();
                              setFilters((prev: any) => ({
                                ...prev,
                                card_networks: e.target.checked
                                  ? [...prev.card_networks, value]
                                  : prev.card_networks.filter((n: string) => n !== value)
                              }));
                            }}
                          />
                          <span className="text-sm">{network}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <Button variant="outline" className="w-full" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>
              </div>
            </aside>

            {/* Card Grid */}
            <div className="flex-1">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-4 text-muted-foreground">Loading cards...</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {cards.slice(0, 12).map((card, index) => (
                    <div
                      key={card.id || index}
                      className="bg-card rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all hover:-translate-y-2"
                    >
                      <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-4">
                        <img
                          src={card.card_bg_image}
                          alt={card.name}
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-2">{card.name}</h3>
                        
                        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg mb-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Joining</p>
                            <p className="text-sm font-semibold">{card.joining_fee_text || 'Free'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Annual</p>
                            <p className="text-sm font-semibold">{card.annual_fee_text || 'Free'}</p>
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
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CardListing;
