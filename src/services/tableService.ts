
import { apiClient } from './apiClient';

// Get all tables - matches /api/tables endpoint
export const getAllTables = async (params?: {
  page?: number;
  limit?: number;
}): Promise<any> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get(`/api/tables?${queryParams.toString()}`);
    return response.data || response;
  } catch (error) {
    console.error('Error fetching tables:', error);
    throw error;
  }
};

// Get table by ID
export const getTableById = async (id: number): Promise<any> => {
  try {
    const response = await apiClient.get(`/api/tables/${id}`);
    return response.data || response;
  } catch (error) {
    console.error('Error fetching table:', error);
    throw error;
  }
};

// Create table - matches /api/tables endpoint
export const createTable = async (tableData: {
  table_number: number;
  club_id?: number; // Made optional with default fallback
  table_type?: string;
  status?: string;
  description?: string;
}): Promise<any> => {
  try {
    // Use a default club_id of 1 if not provided
    const dataWithClubId = {
      ...tableData,
      club_id: tableData.club_id || 1
    };
    
    const response = await apiClient.post('/api/tables', dataWithClubId);
    return response.data || response;
  } catch (error) {
    console.error('Error creating table:', error);
    throw error;
  }
};

// Update table
export const updateTable = async (id: number, tableData: {
  table_number?: number;
  table_type?: string;
  status?: string;
  description?: string;
}): Promise<any> => {
  try {
    const response = await apiClient.put(`/api/tables/${id}`, tableData);
    return response.data || response;
  } catch (error) {
    console.error('Error updating table:', error);
    throw error;
  }
};

// Delete table
export const deleteTable = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/api/tables/${id}`);
  } catch (error) {
    console.error('Error deleting table:', error);
    throw error;
  }
};

// Get available tables - matches /api/tables/available endpoint
export const getAvailableTables = async (): Promise<any[]> => {
  try {
    const response = await apiClient.get('/api/tables/available');
    return response.data || response;
  } catch (error) {
    console.error('Error fetching available tables:', error);
    throw error;
  }
};

// Update table status - matches /api/tables/:id/status endpoint
export const updateTableStatus = async (id: number, status: string): Promise<any> => {
  try {
    const response = await apiClient.put(`/api/tables/${id}/status`, { status });
    return response.data || response;
  } catch (error) {
    console.error('Error updating table status:', error);
    throw error;
  }
};

// Update table pricing - matches /api/tables/:id/pricing endpoint
export const updateTablePricing = async (id: number, pricingData: Array<{
  game_type_id: number;
  price: number;
  time_limit_minutes?: number;
  is_unlimited?: boolean;
}>): Promise<any> => {
  try {
    const response = await apiClient.put(`/api/tables/${id}/pricing`, { pricing: pricingData });
    return response.data || response;
  } catch (error) {
    console.error('Error updating table pricing:', error);
    throw error;
  }
};
