
import { apiClient } from './apiClient';

// Create player - matches /api/players endpoint
export const createPlayer = async (playerData: {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  date_of_birth?: string;
  membership_type?: string;
}): Promise<any> => {
  try {
    const response = await apiClient.post('/api/players', playerData);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to create player');
  } catch (error) {
    console.error('Error creating player:', error);
    throw error;
  }
};

// Get all players - matches /api/players endpoint
export const getAllPlayers = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<any> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const response = await apiClient.get(`/api/players?${queryParams.toString()}`);
    
    if (response.success) {
      return response.data?.players || response.data || [];
    }
    
    throw new Error(response.message || 'Failed to fetch players');
  } catch (error) {
    console.error('Error fetching players:', error);
    throw error;
  }
};

// Get player by ID - matches /api/players/:id endpoint
export const getPlayerById = async (id: number): Promise<any> => {
  try {
    const response = await apiClient.get(`/api/players/${id}`);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Player not found');
  } catch (error) {
    console.error('Error fetching player:', error);
    throw error;
  }
};

// Update player - matches /api/players/:id endpoint
export const updatePlayer = async (id: number, playerData: {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  date_of_birth?: string;
  membership_type?: string;
}): Promise<any> => {
  try {
    const response = await apiClient.put(`/api/players/${id}`, playerData);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to update player');
  } catch (error) {
    console.error('Error updating player:', error);
    throw error;
  }
};

// Delete player - matches /api/players/:id endpoint
export const deletePlayer = async (id: number): Promise<void> => {
  try {
    const response = await apiClient.delete(`/api/players/${id}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete player');
    }
  } catch (error) {
    console.error('Error deleting player:', error);
    throw error;
  }
};

// Search players with club_id - matches /api/players/search endpoint
export const searchPlayers = async (query: string, clubId?: number): Promise<any[]> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('search', query);
    if (clubId) queryParams.append('club_id', clubId.toString());

    console.log('Searching players with query:', query, 'clubId:', clubId);

    const response = await apiClient.get(`/api/players/search?${queryParams.toString()}`);
    
    if (response.success) {
      return response.data || [];
    }
    
    throw new Error(response.message || 'Failed to search players');
  } catch (error) {
    console.error('Error searching players:', error);
    throw error;
  }
};

// Get player sessions - matches /api/players/:id/sessions endpoint
export const getPlayerSessions = async (playerId: number, params?: {
  page?: number;
  limit?: number;
}): Promise<any> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get(`/api/players/${playerId}/sessions?${queryParams.toString()}`);
    
    if (response.success) {
      return response.data?.sessions || response.data || [];
    }
    
    throw new Error(response.message || 'Failed to fetch player sessions');
  } catch (error) {
    console.error('Error fetching player sessions:', error);
    throw error;
  }
};
