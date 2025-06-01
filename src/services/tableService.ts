import { apiClient } from './apiClient';

// Create table - matches /api/tables endpoint
export const createTable = async (tableData: {
  table_number: number;
  table_type?: string;
  description?: string;
  hourly_rate?: number;
  club_id?: number;
}): Promise<any> => {
  try {
    const response = await apiClient.post('/api/tables', {
      table_number: tableData.table_number.toString(),
      table_type: tableData.table_type || 'standard',
      hourly_rate: tableData.hourly_rate || 15.00,
      club_id: tableData.club_id || 1
    });
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to create table');
  } catch (error) {
    console.error('Error creating table:', error);
    throw error;
  }
};

// Get all tables - matches /api/tables endpoint
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
    
    if (response.success) {
      return response.data?.tables || response.data || [];
    }
    
    throw new Error(response.message || 'Failed to fetch tables');
  } catch (error) {
    console.error('Error fetching tables:', error);
    throw error;
  }
};

// Get table by ID - matches /api/tables/:id endpoint
export const getTableById = async (id: number): Promise<any> => {
  try {
    const response = await apiClient.get(`/api/tables/${id}`);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Table not found');
  } catch (error) {
    console.error('Error fetching table:', error);
    throw error;
  }
};

// Update table - matches /api/tables/:id endpoint
export const updateTable = async (id: number, tableData: {
  table_number?: string;
  table_type?: string;
  hourly_rate?: number;
  description?: string;
}): Promise<any> => {
  try {
    const response = await apiClient.put(`/api/tables/${id}`, tableData);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to update table');
  } catch (error) {
    console.error('Error updating table:', error);
    throw error;
  }
};

// Delete table - matches /api/tables/:id endpoint
export const deleteTable = async (id: number): Promise<void> => {
  try {
    const response = await apiClient.delete(`/api/tables/${id}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete table');
    }
  } catch (error) {
    console.error('Error deleting table:', error);
    throw error;
  }
};

// Get available tables - matches /api/tables/available endpoint
export const getAvailableTables = async (): Promise<any[]> => {
  try {
    const response = await apiClient.get('/api/tables/available');
    
    if (response.success) {
      return response.data || [];
    }
    
    throw new Error(response.message || 'Failed to get available tables');
  } catch (error) {
    console.error('Error fetching available tables:', error);
    throw error;
  }
};

// Update table status - matches /api/tables/:id/status endpoint
export const updateTableStatus = async (id: number, status: string): Promise<any> => {
  try {
    const response = await apiClient.put(`/api/tables/${id}/status`, { status });
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to update table status');
  } catch (error) {
    console.error('Error updating table status:', error);
    throw error;
  }
};

// Add missing updateTablePricing function
export const updateTablePricing = async (tableId: number, pricingData: Array<{
  game_type_id: number;
  price: number;
  time_limit_minutes?: number;
  is_unlimited: boolean;
}>): Promise<any> => {
  try {
    const response = await apiClient.put(`/api/tables/${tableId}/pricing`, {
      pricing: pricingData
    });
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to update table pricing');
  } catch (error) {
    console.error('Error updating table pricing:', error);
    throw error;
  }
};
