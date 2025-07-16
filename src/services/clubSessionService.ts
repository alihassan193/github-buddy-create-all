
import { apiClient } from './apiClient';

// Open club session
export const openClubSession = async (clubId: number, openingCash: number, notes?: string): Promise<any> => {
  try {
    const response = await apiClient.post('/api/sessions/club-open', {
      club_id: clubId,
      opening_cash: openingCash,
      notes: notes || ''
    });
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to open club session');
  } catch (error) {
    console.error('Error opening club session:', error);
    throw error;
  }
};

// Close club session
export const closeClubSession = async (closingCash: number, notes?: string): Promise<any> => {
  try {
    const response = await apiClient.post('/api/sessions/club-close', {
      closing_cash: closingCash,
      notes: notes || ''
    });
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to close club session');
  } catch (error) {
    console.error('Error closing club session:', error);
    throw error;
  }
};

// Get active club session
export const getActiveClubSession = async (): Promise<any> => {
  try {
    const response = await apiClient.get('/api/sessions/club-session');
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to get active club session');
  } catch (error) {
    console.error('Error getting active club session:', error);
    throw error;
  }
};

// Get club session history
export const getClubSessionHistory = async (clubId: number, page: number = 1, limit: number = 10): Promise<any> => {
  try {
    const response = await apiClient.get(`/api/sessions/${clubId}/club-session?page=${page}&limit=${limit}`);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to get club session history');
  } catch (error) {
    console.error('Error getting club session history:', error);
    throw error;
  }
};
