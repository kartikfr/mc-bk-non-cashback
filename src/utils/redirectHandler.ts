/**
 * Redirect Handler Utility
 * Manages secure redirects to bank partner websites with interstitial page
 */

export interface RedirectParams {
  networkUrl: string;
  bankName: string;
  bankLogo?: string;
  cardName: string;
  cardId?: string | number;
}

/**
 * Opens the redirect interstitial page in a new tab
 * @param params - Redirect parameters including bank and card details
 * @returns Window object of the newly opened tab, or null if blocked
 */
export const openRedirectInterstitial = (params: RedirectParams): Window | null => {
  const { networkUrl, bankName, bankLogo, cardName, cardId } = params;

  // Validate required parameters
  if (!networkUrl) {
    console.error('Redirect handler: networkUrl is required');
    return null;
  }

  // Sanitize and validate the URL
  let validatedUrl: URL;
  try {
    validatedUrl = new URL(networkUrl);
    
    // Only allow https URLs (with exception for local development)
    if (validatedUrl.protocol !== 'https:' && !validatedUrl.hostname.includes('localhost')) {
      console.error('Redirect handler: Only HTTPS URLs are allowed');
      return null;
    }
  } catch (error) {
    console.error('Redirect handler: Invalid URL', error);
    return null;
  }

  // Build query parameters for the interstitial page
  const queryParams = new URLSearchParams({
    url: networkUrl,
    bank: bankName,
    card: cardName,
  });

  if (bankLogo) {
    queryParams.append('logo', bankLogo);
  }

  if (cardId) {
    queryParams.append('cardId', String(cardId));
  }

  // Build the interstitial URL
  const interstitialUrl = `/redirect?${queryParams.toString()}`;

  // Track the click event
  trackRedirectClick({
    cardId,
    cardName,
    bankName,
    targetUrl: networkUrl,
  });

  // Open in new tab
  try {
    const newWindow = window.open(interstitialUrl, '_blank', 'noopener,noreferrer');
    
    // Check if popup was blocked
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      console.warn('Redirect handler: Popup blocked');
      // Fallback: open in same tab
      window.location.href = interstitialUrl;
      return null;
    }

    return newWindow;
  } catch (error) {
    console.error('Redirect handler: Failed to open window', error);
    return null;
  }
};

/**
 * Track redirect click events for analytics
 */
const trackRedirectClick = (data: {
  cardId?: string | number;
  cardName: string;
  bankName: string;
  targetUrl: string;
}) => {
  try {
    // Use sendBeacon for reliable tracking even if page unloads
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/redirect-click', JSON.stringify({
        event: 'apply_click',
        ...data,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
      }));
    }

    // Also log to console in development
    if (import.meta.env.DEV) {
      console.log('Redirect click tracked:', data);
    }
  } catch (error) {
    console.error('Failed to track redirect click:', error);
  }
};

/**
 * Extract bank name from card data
 */
export const extractBankName = (card: any): string => {
  // Try multiple possible locations for bank name
  return card.banks?.name || 
         card.bank_name || 
         card.bankName || 
         card.name?.split(' ')[0] || // First word of card name as fallback
         'Bank';
};

/**
 * Extract bank logo from card data
 */
export const extractBankLogo = (card: any): string | undefined => {
  return card.banks?.logo || 
         card.bank_logo || 
         card.bankLogo || 
         undefined;
};

/**
 * Validate if a URL is from an allowed domain (whitelist)
 * This is a client-side check; server-side validation should also be implemented
 */
export const isAllowedDomain = (url: string, allowedDomains?: string[]): boolean => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // If no whitelist provided, allow all (rely on server-side validation)
    if (!allowedDomains || allowedDomains.length === 0) {
      return true;
    }

    // Check if hostname matches any allowed domain
    return allowedDomains.some(domain => {
      const normalizedDomain = domain.toLowerCase();
      return hostname === normalizedDomain || hostname.endsWith(`.${normalizedDomain}`);
    });
  } catch {
    return false;
  }
};
