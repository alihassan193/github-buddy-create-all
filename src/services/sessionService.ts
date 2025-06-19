
import { apiClient } from './apiClient';

// Start session - matches /api/sessions endpoint
export const startSession = async (sessionData: {
  table_id: number;
  player_id?: number;
  player_name?: string;
  game_type_id: number;
  pricing_id: number;
  is_guest?: boolean;
  notes?: string;
}): Promise<any> => {
  try {
    const requestData = {
      table_id: sessionData.table_id,
      game_type_id: sessionData.game_type_id,
      pricing_id: sessionData.pricing_id,
      is_guest: sessionData.is_guest || false,
      notes: sessionData.notes,
      ...(sessionData.player_id && { player_id: sessionData.player_id }),
      ...(sessionData.is_guest && sessionData.player_name && { 
        guest_player_name: sessionData.player_name 
      })
    };

    console.log('Starting session with data:', requestData);

    const response = await apiClient.post('/api/sessions', requestData);
    
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
export const endSession = async (sessionId: number, endData?: {
  total_amount?: number;
  notes?: string;
}): Promise<any> => {
  try {
    const response = await apiClient.put(`/api/sessions/${sessionId}/end`, endData || {});
    
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
      return response.data; // Return the full data object with sessions and pagination
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

// Get active sessions - helper function
export const getActiveSessions = async (): Promise<any[]> => {
  try {
    const response = await getAllSessions({ status: 'active' });
    return response?.sessions || [];
  } catch (error) {
    console.error('Error fetching active sessions:', error);
    return []; // Return empty array instead of throwing for UI stability
  }
};

// Get completed sessions - helper function
export const getCompletedSessions = async (): Promise<any[]> => {
  try {
    const response = await getAllSessions({ status: 'completed' });
    return response?.sessions || [];
  } catch (error) {
    console.error('Error fetching completed sessions:', error);
    return [];
  }
};

// Update session amount
export const updateSessionAmount = async (sessionId: number, amount: number): Promise<any> => {
  try {
    const response = await apiClient.put(`/api/sessions/${sessionId}`, {
      total_amount: amount
    });
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to update session amount');
  } catch (error) {
    console.error('Error updating session amount:', error);
    throw error;
  }
};

// Add canteen order to session
export const addCanteenOrderToSession = async (sessionId: number, orderData: {
  items: Array<{
    item_id: number;
    quantity: number;
  }>;
}): Promise<any> => {
  try {
    console.log('Adding canteen order to session:', sessionId, orderData);
    
    const response = await apiClient.post(`/api/sessions/${sessionId}/orders`, orderData);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to add canteen order');
  } catch (error) {
    console.error('Error adding canteen order:', error);
    throw error;
  }
};

// Get session orders
export const getSessionOrders = async (sessionId: number): Promise<any[]> => {
  try {
    const response = await apiClient.get(`/api/sessions/${sessionId}/orders`);
    
    if (response.success) {
      return response.data || [];
    }
    
    throw new Error(response.message || 'Failed to get session orders');
  } catch (error) {
    console.error('Error fetching session orders:', error);
    return [];
  }
};
