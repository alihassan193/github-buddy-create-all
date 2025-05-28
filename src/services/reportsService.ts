
import { apiClient } from './apiClient';

// Get club dashboard statistics
export const getClubDashboard = async (clubId: number, params?: {
  period?: 'today' | 'week' | 'month';
}): Promise<any> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.period) queryParams.append('period', params.period);

    const response = await apiClient.get(`/api/reports/club/${clubId}/dashboard?${queryParams.toString()}`);
    return response;
  } catch (error) {
    console.error('Error fetching club dashboard:', error);
    throw error;
  }
};

// Get revenue report
export const getRevenueReport = async (clubId: number, params?: {
  startDate?: string;
  endDate?: string;
}): Promise<any> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const response = await apiClient.get(`/api/reports/club/${clubId}/revenue?${queryParams.toString()}`);
    return response;
  } catch (error) {
    console.error('Error fetching revenue report:', error);
    throw error;
  }
};

// Get table utilization report
export const getTableUtilizationReport = async (clubId: number, params?: {
  period?: 'day' | 'week' | 'month';
}): Promise<any> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.period) queryParams.append('period', params.period);

    const response = await apiClient.get(`/api/reports/club/${clubId}/table-utilization?${queryParams.toString()}`);
    return response;
  } catch (error) {
    console.error('Error fetching table utilization report:', error);
    throw error;
  }
};

// Legacy methods for backward compatibility
export const getDashboardStats = async (params?: {
  start_date?: string;
  end_date?: string;
  club_id?: number;
}): Promise<any> => {
  try {
    if (params?.club_id) {
      return getClubDashboard(params.club_id, { period: 'today' });
    }
    
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);

    const response = await apiClient.get(`/api/reports/dashboard?${queryParams.toString()}`);
    return response;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

export const getSessionReport = async (params?: {
  start_date?: string;
  end_date?: string;
  club_id?: number;
}): Promise<any> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.club_id) queryParams.append('club_id', params.club_id.toString());

    const response = await apiClient.get(`/api/reports/sessions?${queryParams.toString()}`);
    return response;
  } catch (error) {
    console.error('Error fetching session report:', error);
    throw error;
  }
};

export const getPlayerReport = async (params?: {
  start_date?: string;
  end_date?: string;
  club_id?: number;
}): Promise<any> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.club_id) queryParams.append('club_id', params.club_id.toString());

    const response = await apiClient.get(`/api/reports/players?${queryParams.toString()}`);
    return response;
  } catch (error) {
    console.error('Error fetching player report:', error);
    throw error;
  }
};
