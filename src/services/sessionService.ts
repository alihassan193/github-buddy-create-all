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

// Get active sessions using the specific active endpoint
export const getActiveSessions = async (clubId?: number): Promise<any[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (clubId) queryParams.append('club_id', clubId.toString());
    
    const response = await apiClient.get(`/api/sessions/active?${queryParams.toString()}`);
    
    if (response.success) {
      return response.data || [];
    }
    
    throw new Error(response.message || 'Failed to fetch active sessions');
  } catch (error) {
    console.error('Error fetching active sessions:', error);
    return [];
  }
};

// Get completed sessions by filtering all sessions
export const getCompletedSessions = async (clubId?: number): Promise<any[]> => {
  try {
    const response = await getAllSessions({ 
      club_id: clubId,
      status: 'completed' 
    });
    return response.sessions || [];
  } catch (error) {
    console.error('Error fetching completed sessions:', error);
    return [];
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

// Start two-player session with updated structure
export const startTwoPlayerSession = async (sessionData: {
  table_id: number;
  game_type_id: number;
  player_id: number;
  player_2_id: number;
  pricing_id: number;
  club_id: number;
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

// Announce loser (changed from announce winner)
export const announceLoser = async (sessionId: number, loserPlayer: 'player_1' | 'player_2'): Promise<any> => {
  try {
    const winnerPlayer = loserPlayer === 'player_1' ? 'player_2' : 'player_1';
    
    const response = await apiClient.put(`/api/sessions/${sessionId}/announce-result`, {
      winner_player: winnerPlayer,
      loser_player: loserPlayer
    });
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to announce loser');
  } catch (error) {
    console.error('Error announcing loser:', error);
    throw error;
  }
};

// Start session with updated structure
export const startSession = async (sessionData: {
  table_id: number;
  game_type_id: number;
  player_id?: number;
  guest_player_name?: string;
  guest_player_phone?: string;
  is_guest?: boolean;
  pricing_id: number;
  club_id: number;
  estimated_duration?: number;
  notes?: string;
}): Promise<any> => {
  try {
    const requestData = {
      table_id: sessionData.table_id,
      game_type_id: sessionData.game_type_id,
      pricing_id: sessionData.pricing_id,
      club_id: sessionData.club_id,
      estimated_duration: sessionData.estimated_duration || 120,
      notes: sessionData.notes,
      ...(sessionData.player_id && { player_id: sessionData.player_id }),
      ...(sessionData.guest_player_name && { guest_player_name: sessionData.guest_player_name }),
      ...(sessionData.guest_player_phone && { guest_player_phone: sessionData.guest_player_phone }),
      ...(sessionData.is_guest !== undefined && { is_guest: sessionData.is_guest })
    };

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

// Create new session (alias for startSession for backward compatibility)
export const createSession = async (sessionData: {
  table_id: number;
  game_type_id: number;
  player_id?: number;
  guest_player_name?: string;
  guest_player_phone?: string;
  is_guest?: boolean;
  pricing_id: number;
  club_id: number;
  estimated_duration?: number;
  notes?: string;
}): Promise<any> => {
  return startSession(sessionData);
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
export const endSession = async (sessionId: number, notes?: string): Promise<any> => {
  try {
    const requestData = notes ? { notes } : {};
    const response = await apiClient.post(`/api/sessions/${sessionId}/end`, requestData);
    
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

// Add canteen order to session using the new endpoint
export const addCanteenOrderToSession = async (sessionId: number, orderData: {
  items: Array<{
    item_id: number;
    quantity: number;
  }>;
}): Promise<any> => {
  try {
    const requestData = {
      session_id: sessionId,
      items: orderData.items
    };

    const response = await apiClient.post('/api/canteen/orders', requestData);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to add canteen order');
  } catch (error) {
    console.error('Error adding canteen order:', error);
    throw error;
  }
};

// Create quick sale for general POS
export const createQuickSale = async (saleData: {
  club_id: number;
  customer_name?: string;
  payment_method: string;
  items: Array<{
    canteen_item_id: number;
    quantity: number;
  }>;
}): Promise<any> => {
  try {
    const response = await apiClient.post('/api/canteen/quick-sale', saleData);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to create quick sale');
  } catch (error) {
    console.error('Error creating quick sale:', error);
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
