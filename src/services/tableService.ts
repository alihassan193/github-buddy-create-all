import { apiClient } from './apiClient';

// Get all tables
export const getAllTables = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<any> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
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

// Create table
export const createTable = async (tableData: {
  table_number: string;
  table_type?: string;
  hourly_rate?: number;
  status?: string;
}): Promise<any> => {
  try {
    const response = await apiClient.post('/api/tables', tableData);
    return response.data || response;
  } catch (error) {
    console.error('Error creating table:', error);
    throw error;
  }
};

// Update table
export const updateTable = async (id: number, tableData: {
  table_number?: string;
  table_type?: string;
  hourly_rate?: number;
  status?: string;
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

// Get available tables
export const getAvailableTables = async (): Promise<any[]> => {
  try {
    const response = await apiClient.get('/api/tables/available');
    return response.data || response;
  } catch (error) {
    console.error('Error fetching available tables:', error);
    throw error;
  }
};

// Update table status
export const updateTableStatus = async (id: number, status: string): Promise<any> => {
  try {
    const response = await apiClient.put(`/api/tables/${id}/status`, { status });
    return response.data || response;
  } catch (error) {
    console.error('Error updating table status:', error);
    throw error;
  }
};

// Update table pricing
export const updateTablePricing = async (tableId: number, pricingData: Array<{
  game_type_id: number;
  price: number;
  time_limit_minutes?: number;
  is_unlimited: boolean;
}>): Promise<any> => {
  try {
    const response = await apiClient.put(`/api/tables/${tableId}/pricing`, { pricing: pricingData });
    return response.data || response;
  } catch (error) {
    console.error('Error updating table pricing:', error);
    throw error;
  }
};
