
import { apiClient } from './apiClient';

// Get dashboard statistics - matches /api/reports/dashboard endpoint
export const getDashboardStats = async (): Promise<any> => {
  try {
    const response = await apiClient.get('/api/reports/dashboard');
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch dashboard statistics');
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// Get revenue report - matches /api/reports/revenue endpoint
export const getRevenueReport = async (params?: {
  start_date?: string;
  end_date?: string;
  group_by?: 'day' | 'week' | 'month';
}): Promise<any[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.group_by) queryParams.append('group_by', params.group_by);

    const response = await apiClient.get(`/api/reports/revenue?${queryParams.toString()}`);
    
    if (response.success) {
      return response.data || [];
    }
    
    throw new Error(response.message || 'Failed to fetch revenue report');
  } catch (error) {
    console.error('Error fetching revenue report:', error);
    throw error;
  }
};

// Get session report - matches /api/reports/sessions endpoint
export const getSessionReport = async (params?: {
  start_date?: string;
  end_date?: string;
}): Promise<any[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);

    const response = await apiClient.get(`/api/reports/sessions?${queryParams.toString()}`);
    
    if (response.success) {
      return response.data || [];
    }
    
    throw new Error(response.message || 'Failed to fetch session report');
  } catch (error) {
    console.error('Error fetching session report:', error);
    throw error;
  }
};

// Get player report - matches /api/reports/players endpoint
export const getPlayerReport = async (params?: {
  start_date?: string;
  end_date?: string;
}): Promise<any[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);

    const response = await apiClient.get(`/api/reports/players?${queryParams.toString()}`);
    
    if (response.success) {
      return response.data || [];
    }
    
    throw new Error(response.message || 'Failed to fetch player report');
  } catch (error) {
    console.error('Error fetching player report:', error);
    throw error;
  }
};
