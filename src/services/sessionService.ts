
import { apiClient } from './apiClient';

// Get all sessions - matches /api/sessions endpoint
export const getAllSessions = async (params?: {
  club_id?: number;
  status?: string;
  table_id?: number;
  player_id?: number;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}): Promise<any> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.club_id) queryParams.append('club_id', params.club_id.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.table_id) queryParams.append('table_id', params.table_id.toString());
    if (params?.player_id) queryParams.append('player_id', params.player_id.toString());
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get(`/api/sessions?${queryParams.toString()}`);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch sessions');
  } catch (error) {
    console.error('Error fetching sessions:', error);
    throw error;
  }
};

// Get session by ID
export const getSessionById = async (sessionId: number): Promise<any> => {
  try {
    const response = await apiClient.get(`/api/sessions/${sessionId}`);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch session');
  } catch (error) {
    console.error('Error fetching session:', error);
    throw error;
  }
};

// Create new session
export const createSession = async (sessionData: {
  table_id: number;
  game_type_id: number;
  player_id?: number;
  guest_player_name?: string;
  guest_player_phone?: string;
  is_guest?: boolean;
  pricing_id?: number;
  notes?: string;
}): Promise<any> => {
  try {
    const response = await apiClient.post('/api/sessions', sessionData);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to create session');
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

// Update session
export const updateSession = async (sessionId: number, sessionData: {
  end_time?: string;
  paused_at?: string;
  paused_duration?: number;
  duration_minutes?: number;
  game_amount?: number;
  canteen_amount?: number;
  total_amount?: number;
  status?: string;
  payment_status?: string;
  notes?: string;
}): Promise<any> => {
  try {
    const response = await apiClient.put(`/api/sessions/${sessionId}`, sessionData);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to update session');
  } catch (error) {
    console.error('Error updating session:', error);
    throw error;
  }
};

// End session
export const endSession = async (sessionId: number): Promise<any> => {
  try {
    const response = await apiClient.put(`/api/sessions/${sessionId}/end`, {});
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to end session');
  } catch (error) {
    console.error('Error ending session:', error);
    throw error;
  }
};

// Pause session
export const pauseSession = async (sessionId: number): Promise<any> => {
  try {
    const response = await apiClient.put(`/api/sessions/${sessionId}/pause`, {});
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to pause session');
  } catch (error) {
    console.error('Error pausing session:', error);
    throw error;
  }
};

// Resume session
export const resumeSession = async (sessionId: number): Promise<any> => {
  try {
    const response = await apiClient.put(`/api/sessions/${sessionId}/resume`, {});
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to resume session');
  } catch (error) {
    console.error('Error resuming session:', error);
    throw error;
  }
};

// Delete session
export const deleteSession = async (sessionId: number): Promise<void> => {
  try {
    const response = await apiClient.delete(`/api/sessions/${sessionId}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete session');
    }
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
};
