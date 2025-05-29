
import { apiClient } from './apiClient';

// Create game pricing - matches /api/game-pricing endpoint
export const createGamePricing = async (pricingData: {
  game_type_id: number;
  club_id: number;
  price_per_hour?: number;
  price_per_player?: number;
  minimum_charge?: number;
  is_active?: boolean;
}): Promise<any> => {
  try {
    const response = await apiClient.post('/api/game-pricing', pricingData);
    return response.data || response;
  } catch (error) {
    console.error('Error creating game pricing:', error);
    throw error;
  }
};

// Get all game pricings - matches /api/game-pricing endpoint
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

// Update game pricing - matches /api/game-pricing/:id endpoint
export const updateGamePricing = async (id: number, pricingData: {
  price_per_hour?: number;
  price_per_player?: number;
  minimum_charge?: number;
  is_active?: boolean;
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
