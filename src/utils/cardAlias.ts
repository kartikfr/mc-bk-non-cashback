/**
 * Extracts the SEO card alias from a card object, trying multiple possible field names.
 * This ensures we can navigate to the correct card detail page regardless of API response structure.
 * 
 * @param card - The card object from the API
 * @returns The SEO card alias string, or empty string if not found
 */
export function getCardAlias(card: any): string {
  if (!card) return '';
  
  // Try multiple possible field names in order of preference
  const aliasFields = [
    'seo_card_alias',
    'card_alias',
    'alias',
    'slug',
    'seo_alias',
    'card_slug',
  ];
  
  for (const field of aliasFields) {
    const value = card[field];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  
  // Fallback: try nested paths
  if (card.card?.seo_card_alias) {
    const value = card.card.seo_card_alias;
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  
  if (card.card?.card_alias) {
    const value = card.card.card_alias;
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  
  return '';
}

/**
 * Gets a unique identifier for a card, used for comparison and state management.
 * Tries alias first, then falls back to ID.
 * 
 * @param card - The card object from the API
 * @returns A unique identifier string
 */
export function getCardKey(card: any): string {
  const alias = getCardAlias(card);
  if (alias) return alias;
  
  // Fallback to ID if no alias found
  if (card?.id != null) {
    return String(card.id);
  }
  
  return '';
}

