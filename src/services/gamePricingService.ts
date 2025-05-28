
import { apiClient } from './apiClient';

// Create game pricing
export const createGamePricing = async (pricingData: {
  game_type_id: number;
  table_id: number;
  price_per_hour?: number;
  price_per_game?: number;
  effective_from?: string;
}): Promise<any> => {
  try {
    const response = await apiClient.post('/api/game-pricing', pricingData);
    return response.data || response;
  } catch (error) {
    console.error('Error creating game pricing:', error);
    throw error;
  }
};

// Get all game pricings
export const getAllGamePricings = async (): Promise<any[]> => {
  try {
    const response = await apiClient.get('/api/game-pricing');
    return response.data || response;
  } catch (error) {
    console.error('Error fetching game pricings:', error);
    throw error;
  }
};

// Get game pricing by ID
export const getGamePricingById = async (id: number): Promise<any> => {
  try {
    const response = await apiClient.get(`/api/game-pricing/${id}`);
    return response.data || response;
  } catch (error) {
    console.error('Error fetching game pricing:', error);
    throw error;
  }
};

// Update game pricing
export const updateGamePricing = async (id: number, pricingData: {
  game_type_id?: number;
  table_id?: number;
  price_per_hour?: number;
  price_per_game?: number;
  effective_from?: string;
}): Promise<any> => {
  try {
    const response = await apiClient.put(`/api/game-pricing/${id}`, pricingData);
    return response.data || response;
  } catch (error) {
    console.error('Error updating game pricing:', error);
    throw error;
  }
};

// Delete game pricing
export const deleteGamePricing = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/api/game-pricing/${id}`);
  } catch (error) {
    console.error('Error deleting game pricing:', error);
    throw error;
  }
};
