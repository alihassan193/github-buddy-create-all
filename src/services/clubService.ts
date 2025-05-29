
import { apiClient } from './apiClient';

// Create a new club - matches /api/clubs endpoint
export const createClub = async (clubData: {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  opening_hours?: string;
  description?: string;
}): Promise<any> => {
  try {
    const response = await apiClient.post('/api/clubs', clubData);
    return response.data || response;
  } catch (error) {
    console.error('Error creating club:', error);
    throw error;
  }
};

// Get all clubs - matches /api/clubs endpoint
export const getAllClubs = async (params?: {
  page?: number;
  limit?: number;
}): Promise<any> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get(`/api/clubs?${queryParams.toString()}`);
    return response.data || response;
  } catch (error) {
    console.error('Error fetching clubs:', error);
    throw error;
  }
};

// Get club by ID - matches /api/clubs/:id endpoint
export const getClubById = async (id: number): Promise<any> => {
  try {
    const response = await apiClient.get(`/api/clubs/${id}`);
    return response.data || response;
  } catch (error) {
    console.error('Error fetching club:', error);
    throw error;
  }
};

// Update club - matches /api/clubs/:id endpoint
export const updateClub = async (id: number, clubData: {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  opening_hours?: string;
  description?: string;
}): Promise<any> => {
  try {
    const response = await apiClient.put(`/api/clubs/${id}`, clubData);
    return response.data || response;
  } catch (error) {
    console.error('Error updating club:', error);
    throw error;
  }
};

// Delete club - matches /api/clubs/:id endpoint
export const deleteClub = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/api/clubs/${id}`);
  } catch (error) {
    console.error('Error deleting club:', error);
    throw error;
  }
};
