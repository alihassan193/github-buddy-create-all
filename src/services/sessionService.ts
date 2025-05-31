
import { apiClient } from './apiClient';

// Start session - matches /api/sessions endpoint
export const startSession = async (sessionData: {
  table_id: number;
  player_id: number;
  game_type_id: number;
}): Promise<any> => {
  try {
    const response = await apiClient.post('/api/sessions', sessionData);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to start session');
  } catch (error) {
    console.error('Error starting session:', error);
    throw error;
  }
};

// End session - matches /api/sessions/:id/end endpoint
export const endSession = async (sessionId: number, endData: {
  total_amount?: number;
  notes?: string;
}): Promise<any> => {
  try {
    const response = await apiClient.put(`/api/sessions/${sessionId}/end`, endData);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to end session');
  } catch (error) {
    console.error('Error ending session:', error);
    throw error;
  }
};

// Get all sessions - matches /api/sessions endpoint
export const getAllSessions = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<any> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get(`/api/sessions?${queryParams.toString()}`);
    
    if (response.success) {
      return response.data?.sessions || response.data || [];
    }
    
    throw new Error(response.message || 'Failed to fetch sessions');
  } catch (error) {
    console.error('Error fetching sessions:', error);
    throw error;
  }
};

// Get session by ID - matches /api/sessions/:id endpoint
export const getSessionById = async (id: number): Promise<any> => {
  try {
    const response = await apiClient.get(`/api/sessions/${id}`);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Session not found');
  } catch (error) {
    console.error('Error fetching session:', error);
    throw error;
  }
};

// Get active sessions - matches /api/sessions/active endpoint
export const getActiveSessions = async (): Promise<any[]> => {
  try {
    const response = await apiClient.get('/api/sessions/active');
    
    if (response.success) {
      return response.data || [];
    }
    
    throw new Error(response.message || 'Failed to get active sessions');
  } catch (error) {
    console.error('Error fetching active sessions:', error);
    throw error;
  }
};

// Get completed sessions (filter from all sessions)
export const getCompletedSessions = async (): Promise<any[]> => {
  try {
    const response = await getAllSessions({ status: 'completed' });
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('Error fetching completed sessions:', error);
    return [];
  }
};
