class AuthManager {
  private token: string | null = null;
  private expiresAt: Date | null = null;
  private readonly apiKey: string;
  private readonly tokenUrl: string;

  constructor() {
    const fallbackKey = '9F476773305B9EE7DE245875FF416DD1FB7281A1B51F2A475F36C6CA4A27FE2E';
    const fallbackTokenUrl = 'https://uat-platform.bankkaro.com/partner/token';

    this.apiKey = (import.meta.env.VITE_PARTNER_API_KEY || fallbackKey).trim();
    this.tokenUrl = (import.meta.env.VITE_PARTNER_TOKEN_URL || fallbackTokenUrl).trim();

    if (!import.meta.env.VITE_PARTNER_API_KEY && import.meta.env.DEV) {
      console.warn('[authManager] VITE_PARTNER_API_KEY is not set. Falling back to the baked-in key. Please configure an env variable before production.');
    }

    if (!import.meta.env.VITE_PARTNER_TOKEN_URL && import.meta.env.DEV) {
      console.warn('[authManager] VITE_PARTNER_TOKEN_URL is not set. Falling back to the default UAT token endpoint.');
    }
  }

  async getToken(): Promise<string> {
    // Return cached token if still valid
    if (this.token && this.expiresAt && this.expiresAt > new Date()) {
      return this.token;
    }

    try {
      const response = await fetch(this.tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 'x-api-key': this.apiKey })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch auth token');
      }

      const data = await response.json();
      
      if (data.status === 'success' && data.data.jwttoken) {
        this.token = data.data.jwttoken;
        this.expiresAt = new Date(data.data.expiresAt);
        return this.token;
      }

      throw new Error('Invalid token response');
    } catch (error) {
      console.error('Auth error:', error);
      throw error;
    }
  }

  async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const token = await this.getToken();
    
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'partner-token': token,
        'Content-Type': 'application/json'
      }
    });
  }
}

export const authManager = new AuthManager();
