
import { GameType } from "../types";
import { apiClient } from "./apiClient";

// Get all game types
export const getAllGameTypes = async (): Promise<GameType[]> => {
  try {
    const response = await apiClient.get("/api/game-types");
    console.log("API Response - Game Types:", response);
    return response.data || [];
  } catch (error) {
    console.error("Error fetching game types:", error);
    // Return default game types if API fails
    return [
      { id: 1, name: "Frames" },
      { id: 2, name: "Century" },
    ];
  }
};

// Create game type
export const createGameType = async (gameTypeData: {
  name: string;
  pricing_type?: string;
}): Promise<GameType> => {
  try {
    const response = await apiClient.post("/api/game-types", gameTypeData);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to create game type');
  } catch (error) {
    console.error('Error creating game type:', error);
    throw error;
  }
};

// Update game type
export const updateGameType = async (id: number, gameTypeData: {
  name?: string;
  pricing_type?: string;
}): Promise<GameType> => {
  try {
    const response = await apiClient.put(`/api/game-types/${id}`, gameTypeData);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to update game type');
  } catch (error) {
    console.error('Error updating game type:', error);
    throw error;
  }
};

// Delete game type
export const deleteGameType = async (id: number): Promise<void> => {
  try {
    const response = await apiClient.delete(`/api/game-types/${id}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete game type');
    }
  } catch (error) {
    console.error('Error deleting game type:', error);
    throw error;
  }
};
