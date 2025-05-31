
import { apiClient } from './apiClient';

// Create game pricing - matches /api/game-pricing endpoint
export const createGamePricing = async (pricingData: {
  game_type_id: number;
  table_id: number;
  price_per_hour: number;
  price_per_game: number;
  effective_from: string;
}): Promise<any> => {
  try {
    const response = await apiClient.post('/api/game-pricing', pricingData);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to create game pricing');
  } catch (error) {
    console.error('Error creating game pricing:', error);
    throw error;
  }
};

// Get all game pricings - matches /api/game-pricing endpoint
export const getAllGamePricings = async (): Promise<any[]> => {
  try {
    const response = await apiClient.get('/api/game-pricing');
    
    if (response.success) {
      return response.data || [];
    }
    
    throw new Error(response.message || 'Failed to fetch game pricings');
  } catch (error) {
    console.error('Error fetching game pricings:', error);
    throw error;
  }
};

// Get game pricing by ID - matches /api/game-pricing/:id endpoint
export const getGamePricingById = async (id: number): Promise<any> => {
  try {
    const response = await apiClient.get(`/api/game-pricing/${id}`);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Game pricing not found');
  } catch (error) {
    console.error('Error fetching game pricing:', error);
    throw error;
  }
};

// Update game pricing - matches /api/game-pricing/:id endpoint
export const updateGamePricing = async (id: number, pricingData: {
  price_per_hour?: number;
  price_per_game?: number;
  effective_from?: string;
}): Promise<any> => {
  try {
    const response = await apiClient.put(`/api/game-pricing/${id}`, pricingData);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to update game pricing');
  } catch (error) {
    console.error('Error updating game pricing:', error);
    throw error;
  }
};

// Delete game pricing - matches /api/game-pricing/:id endpoint
export const deleteGamePricing = async (id: number): Promise<void> => {
  try {
    const response = await apiClient.delete(`/api/game-pricing/${id}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete game pricing');
    }
  } catch (error) {
    console.error('Error deleting game pricing:', error);
    throw error;
  }
};
