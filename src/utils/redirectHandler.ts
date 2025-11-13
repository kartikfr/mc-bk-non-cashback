/**
 * Redirect Handler Utility
 * Manages secure redirects to bank partner websites with interstitial page
 */

// Hard-coded bank URL mapping - ONLY these URLs are allowed
const BANK_URLS: Record<string, string> = {
  AXIS: "https://www.axis.bank.in/cards/credit-card",
  IDFC: "https://www.idfcfirst.bank.in/credit-card",
  SBI: "https://www.sbicard.com/en/personal/credit-cards.page",
  HDFC: "https://applyonline.hdfcbank.com/cards/credit-cards.html?CHANNELSOURCE=ZETA&LGCode=MKTG&mc_id=hdfcbank_ccntb_paid_search_brand_ntb_unified&utm_source=paid_search_ntb&utm_medium=search&utm_campaign=CC-ACQ-HDFC_CC_Retail_Google_Search_Leads_NTB_br_super_brand_top-city&utm_content=marketing&utm_creative=generic_top-city_pixel-ltf&utm_term=Hdfc%20Credit%20Card&p_id=&gad_source=1&gad_campaignid=22991160211&gbraid=0AAAAAD74LQZOMxLfZof2fQmP-ULVXgTi9&gclid=CjwKCAiAoNbIBhB5EiwAZFbYGAjIZ0gduKikbOozHs7jAjebF18FVdeGRL1aD1BGcqbgGXsLLyTp7xoCyhoQAvD_BwE#nbb",
  AU: "https://cconboarding.aubank.in/auccself/#/landing",
  INDUSIND: "https://www.indusind.bank.in/in/en/personal/cards/credit-card.html",
  STAN_CHART: "https://www.sc.com/in/credit-cards/",
  AMEX: "https://www.americanexpress.com/en-in/",
  HSBC: "https://www.hsbc.co.in/credit-cards/products/visa-platinum/?WABFormEntryCommand=cmd_init&form.campaign_id=Platinum_Product&form.source=ZEE&WT.ac=CC_Platinum_zee2&gclid=NA&card=vpc&cid=INM:OK(:A0:CC:05:2505:031:ZEECC_Platinum&gad_source=1",
  KOTAK: "https://cards.kotak.com/",
  ICICI: "https://www.icici.bank.in/personal-banking/cards"
};

export interface RedirectParams {
  networkUrl?: string; // Optional now, will use hard-coded URLs
  bankName: string;
  bankLogo?: string;
  cardName: string;
  cardId?: string | number;
}

/**
 * Normalize bank name to match hard-coded URL keys
 */
const normalizeBankName = (bankName: string): string | null => {
  const normalized = bankName.toUpperCase().trim();
  
  // Direct matches
  if (BANK_URLS[normalized]) return normalized;
  
  // Handle common variations
  const variations: Record<string, string> = {
    'AXIS BANK': 'AXIS',
    'IDFC FIRST': 'IDFC',
    'IDFC FIRST BANK': 'IDFC',
    'SBI CARD': 'SBI',
    'SBI CARDS': 'SBI',
    'STATE BANK OF INDIA': 'SBI',
    'HDFC BANK': 'HDFC',
    'AU SMALL FINANCE': 'AU',
    'AU SMALL FINANCE BANK': 'AU',
    'AU BANK': 'AU',
    'INDUSIND': 'INDUSIND',
    'INDUSIND BANK': 'INDUSIND',
    'STANDARD CHARTERED': 'STAN_CHART',
    'STANDARD CHARTERED BANK': 'STAN_CHART',
    'SC BANK': 'STAN_CHART',
    'AMERICAN EXPRESS': 'AMEX',
    'AMEX': 'AMEX',
    'HSBC': 'HSBC',
    'HSBC BANK': 'HSBC',
    'KOTAK': 'KOTAK',
    'KOTAK MAHINDRA': 'KOTAK',
    'KOTAK MAHINDRA BANK': 'KOTAK',
    'ICICI': 'ICICI',
    'ICICI BANK': 'ICICI'
  };
  
  return variations[normalized] || null;
};

/**
 * Get hard-coded bank URL for a given bank name
 */
const getBankUrl = (bankName: string): string | null => {
  const normalizedKey = normalizeBankName(bankName);
  return normalizedKey ? BANK_URLS[normalizedKey] : null;
};

/**
 * Opens the redirect interstitial page in a new tab
 * @param params - Redirect parameters including bank and card details
 * @returns Window object of the newly opened tab, or null if blocked
 */
export const openRedirectInterstitial = (params: RedirectParams): Window | null => {
  const { bankName, bankLogo, cardName, cardId } = params;

  // Get hard-coded bank URL
  const bankUrl = getBankUrl(bankName);
  
  if (!bankUrl) {
    console.error('Redirect handler: Bank not found in whitelist:', bankName);
    // Still proceed to interstitial to show user-friendly error
  }

  // Build query parameters for the interstitial page
  const queryParams = new URLSearchParams({
    url: bankUrl || '',
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
    targetUrl: bankUrl || '',
  });

  // Open in new tab - NEVER modify the current page
  try {
    const newWindow = window.open(interstitialUrl, '_blank', 'noopener,noreferrer');
    
    // Check if popup was blocked
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      console.warn('Redirect handler: Popup blocked - user needs to allow popups');
      // DO NOT redirect current page - just log and return null
      // The current page stays intact, user can try again or check popup settings
      return null;
    }

    return newWindow;
  } catch (error) {
    console.error('Redirect handler: Failed to open window', error);
    // DO NOT modify current page even on error
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
