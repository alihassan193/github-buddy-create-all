
import { apiClient } from './apiClient';

// Start a new session
export const startSession = async (sessionData: {
  table_id: number;
  player_id: number;
  game_type_id: number;
}): Promise<any> => {
  try {
    const response = await apiClient.post('/api/sessions', sessionData);
    return response.data || response;
  } catch (error) {
    console.error('Error starting session:', error);
    throw error;
  }
};

// End session
export const endSession = async (sessionId: number): Promise<any> => {
  try {
    const response = await apiClient.put(`/api/sessions/${sessionId}/end`, {});
    return response.data || response;
  } catch (error) {
    console.error('Error ending session:', error);
    throw error;
  }
};

// Get all sessions
export const getAllSessions = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<any> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const response = await apiClient.get(`/api/sessions?${queryParams.toString()}`);
    return response.data || response;
  } catch (error) {
    console.error('Error fetching sessions:', error);
    throw error;
  }
};

// Get session by ID
export const getSessionById = async (id: number): Promise<any> => {
  try {
    const response = await apiClient.get(`/api/sessions/${id}`);
    return response.data || response;
  } catch (error) {
    console.error('Error fetching session:', error);
    throw error;
  }
};

// Get active sessions
export const getActiveSessions = async (): Promise<any[]> => {
  try {
    const response = await apiClient.get('/api/sessions/active');
    return response.data || response;
  } catch (error) {
    console.error('Error fetching active sessions:', error);
    throw error;
  }
};

// Get session real-time data
export const getSessionRealTimeData = async (sessionId: number): Promise<any> => {
  try {
    const response = await apiClient.get(`/api/sessions/${sessionId}/realtime`);
    return response.data || response;
  } catch (error) {
    console.error('Error fetching session real-time data:', error);
    throw error;
  }
};

// Pause session
export const pauseSession = async (sessionId: number): Promise<any> => {
  try {
    const response = await apiClient.put(`/api/sessions/${sessionId}/pause`, {});
    return response.data || response;
  } catch (error) {
    console.error('Error pausing session:', error);
    throw error;
  }
};

// Resume session
export const resumeSession = async (sessionId: number): Promise<any> => {
  try {
    const response = await apiClient.put(`/api/sessions/${sessionId}/resume`, {});
    return response.data || response;
  } catch (error) {
    console.error('Error resuming session:', error);
    throw error;
  }
};
