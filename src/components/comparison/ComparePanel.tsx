import { useState } from 'react';
import { useComparison } from '@/contexts/ComparisonContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  X, 
  Star, 
  ExternalLink, 
  Trophy,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComparePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ComparePanel({ open, onOpenChange }: ComparePanelProps) {
  const { selectedCards, removeCard } = useComparison();
  const [showDifferencesOnly, setShowDifferencesOnly] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['summary']));

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const getBestValue = (field: string, isLower: boolean = false) => {
    const values = selectedCards.map(card => {
      const val = card[field];
      if (typeof val === 'string') {
        return parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
      }
      return parseFloat(val) || 0;
    });

    const bestValue = isLower ? Math.min(...values) : Math.max(...values);
    return values.map(v => v === bestValue && bestValue !== 0);
  };

  const allSame = (field: string) => {
    if (selectedCards.length < 2) return false;
    const firstValue = selectedCards[0][field];
    return selectedCards.every(card => card[field] === firstValue);
  };

  if (selectedCards.length === 0) {
    return null;
  }

  const sections = [
    {
      id: 'summary',
      title: 'Summary',
      alwaysExpanded: true
    },
    {
      id: 'costs',
      title: 'Costs & Savings',
      fields: [
        { key: 'joining_fee_text', label: 'Joining Fee', highlight: 'lower' },
        { key: 'annual_fee_text', label: 'Annual Fee', highlight: 'lower' },
        { key: 'annual_saving', label: 'Annual Savings', highlight: 'higher' }
      ]
    },
    {
      id: 'rewards',
      title: 'Rewards & Benefits',
      fields: [
        { key: 'reward_conversion_rate', label: 'Reward Conversion' },
        { key: 'redemption_options', label: 'Redemption Options', html: true }
      ]
    },
    {
      id: 'eligibility',
      title: 'Eligibility',
      fields: [
        { key: 'min_age', label: 'Minimum Age' },
        { key: 'max_age', label: 'Maximum Age' },
        { key: 'income_salaried', label: 'Income Required (Salaried)' },
        { key: 'crif', label: 'Credit Score' },
        { key: 'employment_type', label: 'Employment Type' }
      ]
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-6xl max-h-[90vh] p-0"
        aria-labelledby="compare-dialog-title"
        aria-modal="true"
      >
        <DialogHeader className="p-6 pb-4 border-b sticky top-0 bg-background z-10">
          <div className="flex items-center justify-between">
            <DialogTitle id="compare-dialog-title" className="text-2xl font-bold">
              Compare Cards ({selectedCards.length})
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDifferencesOnly(!showDifferencesOnly)}
              className="gap-2"
            >
              {showDifferencesOnly ? 'Show All' : 'Show Differences Only'}
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-100px)]">
          <div className="p-6">
            {/* Cards Summary */}
            <div className="grid gap-6 mb-8" style={{ gridTemplateColumns: `200px repeat(${selectedCards.length}, 1fr)` }}>
              <div /> {/* Empty cell for labels column */}
              {selectedCards.map((card, idx) => (
                <div 
                  key={card.id || idx}
                  className="bg-card border-2 border-border rounded-xl p-4 relative"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCard(card.id?.toString() || card.seo_card_alias)}
                    className="absolute top-2 right-2 w-6 h-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>

                  <div className="mb-3 h-32 flex items-center justify-center bg-muted/30 rounded-lg">
                    <img 
                      src={card.card_bg_image || card.image || '/placeholder.svg'}
                      alt={card.name}
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  </div>

                  <h3 className="font-bold text-lg mb-2 line-clamp-2">{card.name}</h3>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    <Badge variant="outline" className="text-xs">
                      {card.card_type}
                    </Badge>
                  </div>

                  {card.rating && (
                    <div className="flex items-center gap-1 mb-3 text-sm">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{card.rating}</span>
                      <span className="text-muted-foreground">
                        ({card.user_rating_count?.toLocaleString()})
                      </span>
                    </div>
                  )}

                  {card.tags && card.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {card.tags.slice(0, 3).map((tag: any) => (
                        <Badge key={tag.id} variant="secondary" className="text-xs">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      if (card.network_url) {
                        window.open(card.network_url, '_blank', 'noopener,noreferrer');
                      }
                    }}
                  >
                    Apply Now
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Comparison Sections */}
            {sections.map(section => {
              const isExpanded = expandedSections.has(section.id);
              
              if (section.id === 'summary') return null; // Already shown above

              return (
                <div key={section.id} className="mb-6">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors mb-3"
                  >
                    <h3 className="font-bold text-lg">{section.title}</h3>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>

                  {isExpanded && section.fields && (
                    <div className="space-y-2">
                      {section.fields.map(field => {
                        const isSame = allSame(field.key);
                        if (showDifferencesOnly && isSame) return null;

                        const bestValues = field.highlight 
                          ? getBestValue(field.key, field.highlight === 'lower')
                          : [];

                        return (
                          <div 
                            key={field.key}
                            className="grid gap-4 p-4 bg-card border border-border rounded-lg"
                            style={{ gridTemplateColumns: `200px repeat(${selectedCards.length}, 1fr)` }}
                          >
                            <div className="font-semibold text-sm text-muted-foreground flex items-center">
                              {field.label}
                              {isSame && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  Same for all
                                </Badge>
                              )}
                            </div>
                            
                            {selectedCards.map((card, idx) => {
                              const value = card[field.key];
                              const isBest = bestValues[idx];
                              
                              return (
                                <div 
                                  key={idx}
                                  className={cn(
                                    "p-3 rounded-lg text-sm",
                                    isBest && "bg-green-50 dark:bg-green-950 border-2 border-green-500/50"
                                  )}
                                >
                                  {isBest && (
                                    <Trophy className="w-4 h-4 text-green-600 inline mr-1" />
                                  )}
                                  {field.html ? (
                                    <div 
                                      dangerouslySetInnerHTML={{ __html: value || 'N/A' }}
                                      className="prose prose-sm max-w-none line-clamp-3"
                                    />
                                  ) : (
                                    <span className={cn(isBest && "font-semibold")}>
                                      {value || 'N/A'}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Key Benefits */}
            <div className="mb-6">
              <button
                onClick={() => toggleSection('benefits')}
                className="w-full flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors mb-3"
              >
                <h3 className="font-bold text-lg">Key Benefits</h3>
                {expandedSections.has('benefits') ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>

              {expandedSections.has('benefits') && (
                <div 
                  className="grid gap-4"
                  style={{ gridTemplateColumns: `200px repeat(${selectedCards.length}, 1fr)` }}
                >
                  <div className="font-semibold text-sm text-muted-foreground">
                    Top Benefits
                  </div>
                  {selectedCards.map((card, idx) => (
                    <div key={idx} className="space-y-2">
                      {card.product_usps?.slice(0, 3).map((usp: any, uspIdx: number) => (
                        <div key={uspIdx} className="p-3 bg-card border border-border rounded-lg">
                          <p className="font-semibold text-sm mb-1">{usp.header}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {usp.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
