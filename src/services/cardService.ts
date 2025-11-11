import { authManager } from './authManager';

const BASE_URL = 'https://uat-platform.bankkaro.com/partner';

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
      { method: 'POST', body: JSON.stringify({}) }
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

  async getCardListing(filters: any) {
    const response = await authManager.makeAuthenticatedRequest(
      `${BASE_URL}/cardgenius/cards`,
      {
        method: 'POST',
        body: JSON.stringify(filters)
      }
    );
    return response.json();
  }
};
