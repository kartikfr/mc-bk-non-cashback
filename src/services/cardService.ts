import { authManager } from './authManager';

const DEFAULT_BASE_URL = 'https://uat-platform.bankkaro.com/partner';
const BASE_URL = (import.meta.env.VITE_PARTNER_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, '');

export interface SpendingData {
  amazon_spends?: number;
  flipkart_spends?: number;
  other_online_spends?: number;
  other_offline_spends?: number;
  grocery_spends_online?: number;
  online_food_ordering?: number;
  fuel?: number;
  dining_or_going_out?: number;
  flights_annual?: number;
  hotels_annual?: number;
  domestic_lounge_usage_quarterly?: number;
  international_lounge_usage_quarterly?: number;
  mobile_phone_bills?: number;
  electricity_bills?: number;
  water_bills?: number;
  insurance_health_annual?: number;
  insurance_car_or_bike_annual?: number;
  rent?: number;
  school_fees?: number;
}

export const cardService = {
  async getInitBundle() {
    const response = await authManager.makeAuthenticatedRequest(
      `${BASE_URL}/cardgenius/init-bundle`,
      { method: 'GET' }
    );
    return response.json();
  },

  async getCardDetails(alias: string) {
    const response = await authManager.makeAuthenticatedRequest(
      `${BASE_URL}/cardgenius/cards/${alias}`
    );
    return response.json();
  },

  async calculateCardGenius(spendingData: SpendingData) {
    const response = await authManager.makeAuthenticatedRequest(
      `${BASE_URL}/cardgenius/calculate`,
      {
        method: 'POST',
        body: JSON.stringify(spendingData)
      }
    );
    return response.json();
  },

  async getCardListing(params: {
    slug: string;
    banks_ids: number[];
    card_networks: string[];
    annualFees: string;
    credit_score: string;
    sort_by: string;
    free_cards: string;
    eligiblityPayload: {
      pincode?: string;
      inhandIncome?: string;
      empStatus?: string;
    };
    cardGeniusPayload: any[];
  }, signal?: AbortSignal) {
    const response = await authManager.makeAuthenticatedRequest(
      `${BASE_URL}/cardgenius/cards`,
      {
        method: 'POST',
        body: JSON.stringify(params),
        signal
      }
    );
    return response.json();
  },

  async getCardDetailsByAlias(alias: string) {
    const response = await authManager.makeAuthenticatedRequest(
      `${BASE_URL}/cardgenius/cards/${alias}`
    );
    return response.json();
  },

  async getPartnerCards(signal?: AbortSignal) {
    const response = await authManager.makeAuthenticatedRequest(
      `${BASE_URL}/cardgenius/cards`,
      { method: 'GET', signal }
    );
    return response.json();
  },

  async checkEligibility(params: {
    cardAlias: string;
    pincode: string;
    inhandIncome: string;
    empStatus: 'salaried' | 'self-employed';
  }) {
    const response = await authManager.makeAuthenticatedRequest(
      `${BASE_URL}/cardgenius/cards`,
      {
        method: 'POST',
        body: JSON.stringify({
          slug: '',
          banks_ids: [],
          card_networks: [],
          annualFees: '',
          credit_score: '',
          sort_by: '',
          free_cards: '',
          eligiblityPayload: {
            pincode: params.pincode,
            inhandIncome: params.inhandIncome,
            empStatus: params.empStatus
          },
          cardGeniusPayload: {}
        })
      }
    );
    return response.json();
  }
};
