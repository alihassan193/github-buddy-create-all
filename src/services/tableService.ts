import { apiClient } from './apiClient';

// Get all tables - matches /api/tables endpoint
export const getAllTables = async (params?: {
  club_id?: number;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<any[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.club_id) queryParams.append('club_id', params.club_id.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get(`/api/tables?${queryParams.toString()}`);
    
    if (response.success) {
      return response.data || [];
    }
    
    throw new Error(response.message || 'Failed to fetch tables');
  } catch (error) {
    console.error('Error fetching tables:', error);
    throw error;
  }
};

// Get table by ID
export const getTableById = async (tableId: number): Promise<any> => {
  try {
    const response = await apiClient.get(`/api/tables/${tableId}`);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch table');
  } catch (error) {
    console.error('Error fetching table:', error);
    throw error;
  }
};

// Get table pricing - matches /api/tables/:tableId/pricing endpoint
export const getTablePricing = async (tableId: number, clubId: number): Promise<any[]> => {
  try {
    const response = await apiClient.get(`/api/tables/${tableId}/pricing?club_id=${clubId}`);
    
    if (response.success) {
      return response.data || [];
    }
    
    throw new Error(response.message || 'Failed to fetch table pricing');
  } catch (error) {
    console.error('Error fetching table pricing:', error);
    throw error;
  }
};

// Create new table
export const createTable = async (tableData: {
  table_number: string | number;
  club_id?: number;
  status?: string;
  table_type?: string;
  description?: string;
}): Promise<any> => {
  try {
    // Convert table_number to string if it's a number
    const processedData = {
      ...tableData,
      table_number: tableData.table_number.toString()
    };
    
    const response = await apiClient.post('/api/tables', processedData);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to create table');
  } catch (error) {
    console.error('Error creating table:', error);
    throw error;
  }
};

// Update table
export const updateTable = async (tableId: number, tableData: {
  table_number?: string;
  status?: string;
  table_type?: string;
  description?: string;
}): Promise<any> => {
  try {
    const response = await apiClient.put(`/api/tables/${tableId}`, tableData);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to update table');
  } catch (error) {
    console.error('Error updating table:', error);
    throw error;
  }
};

// Update table pricing - matches /api/tables/:tableId/pricing endpoint
export const updateTablePricing = async (tableId: number, pricingData: {
  club_id: number;
  game_type_id: number;
  price: number;
  fixed_price?: number | null;
  price_per_minute?: number | null;
  time_limit_minutes?: number | null;
  is_unlimited_time: boolean;
}): Promise<any> => {
  try {
    const response = await apiClient.put(`/api/tables/${tableId}/pricing`, pricingData);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to update table pricing');
  } catch (error) {
    console.error('Error updating table pricing:', error);
    throw error;
  }
};

// Delete table
export const deleteTable = async (tableId: number): Promise<void> => {
  try {
    const response = await apiClient.delete(`/api/tables/${tableId}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete table');
    }
  } catch (error) {
    console.error('Error deleting table:', error);
    throw error;
  }
};
