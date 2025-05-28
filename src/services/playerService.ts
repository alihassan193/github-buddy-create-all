import { apiClient } from './apiClient';

// Create a new player
export const createPlayer = async (playerData: {
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  date_of_birth?: string;
  address?: string;
  membership_type?: string;
  club_id: number;
}): Promise<any> => {
  try {
    const response = await apiClient.post('/api/players', playerData);
    return response;
  } catch (error) {
    console.error('Error creating player:', error);
    throw error;
  }
};

// Search players
export const searchPlayers = async (params: {
  club_id: number;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<any> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('club_id', params.club_id.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get(`/api/players/search?${queryParams.toString()}`);
    return response;
  } catch (error) {
    console.error('Error searching players:', error);
    throw error;
  }
};

// Get all players (keeping for backward compatibility)
export const getAllPlayers = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  club_id?: number;
}): Promise<any> => {
  try {
    if (params?.club_id) {
      return searchPlayers({
        club_id: params.club_id,
        search: params.search,
        page: params.page,
        limit: params.limit
      });
    }
    
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const response = await apiClient.get(`/api/players?${queryParams.toString()}`);
    return response;
  } catch (error) {
    console.error('Error fetching players:', error);
    throw error;
  }
};

// Get player by ID
export const getPlayerById = async (id: number): Promise<any> => {
  try {
    const response = await apiClient.get(`/api/players/${id}`);
    return response;
  } catch (error) {
    console.error('Error fetching player:', error);
    throw error;
  }
};

// Update player
export const updatePlayer = async (id: number, playerData: {
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  date_of_birth?: string;
  address?: string;
  membership_type?: string;
}): Promise<any> => {
  try {
    const response = await apiClient.put(`/api/players/${id}`, playerData);
    return response;
  } catch (error) {
    console.error('Error updating player:', error);
    throw error;
  }
};

// Delete player
export const deletePlayer = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/api/players/${id}`);
  } catch (error) {
    console.error('Error deleting player:', error);
    throw error;
  }
};

// Get player sessions
export const getPlayerSessions = async (id: number, params?: {
  page?: number;
  limit?: number;
}): Promise<any> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get(`/api/players/${id}/sessions?${queryParams.toString()}`);
    return response;
  } catch (error) {
    console.error('Error fetching player sessions:', error);
    throw error;
  }
};
