class AuthManager {
  private token: string | null = null;
  private expiresAt: Date | null = null;
  private readonly API_KEY = '9F476773305B9EE7DE245875FF416DD1FB7281A1B51F2A475F36C6CA4A27FE2E';
  private readonly TOKEN_URL = 'https://uat-platform.bankkaro.com/partner/token';

  async getToken(): Promise<string> {
    // Return cached token if still valid
    if (this.token && this.expiresAt && this.expiresAt > new Date()) {
      return this.token;
    }

    try {
      const response = await fetch(this.TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 'x-api-key': this.API_KEY })
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
