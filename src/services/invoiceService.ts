
import { apiClient } from './apiClient';

// Create invoice
export const createInvoice = async (invoiceData: {
  player_id?: number;
  session_id?: number;
  items?: Array<{
    item_name: string;
    quantity: number;
    unit_price: number;
  }>;
  tax_rate?: number;
  discount?: number;
}): Promise<any> => {
  try {
    const response = await apiClient.post('/api/invoices', invoiceData);
    return response.data || response;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
};

// Get all invoices
export const getAllInvoices = async (params?: {
  status?: string;
  player_id?: number;
  page?: number;
  limit?: number;
}): Promise<any> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.player_id) queryParams.append('player_id', params.player_id.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get(`/api/invoices?${queryParams.toString()}`);
    return response.data || response;
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }
};

// Get invoice by ID
export const getInvoiceById = async (id: number): Promise<any> => {
  try {
    const response = await apiClient.get(`/api/invoices/${id}`);
    return response.data || response;
  } catch (error) {
    console.error('Error fetching invoice:', error);
    throw error;
  }
};

// Update invoice status
export const updateInvoiceStatus = async (id: number, statusData: {
  status: 'pending' | 'paid' | 'cancelled';
  payment_method?: string;
}): Promise<any> => {
  try {
    const response = await apiClient.put(`/api/invoices/${id}/status`, statusData);
    return response.data || response;
  } catch (error) {
    console.error('Error updating invoice status:', error);
    throw error;
  }
};

// Delete invoice
export const deleteInvoice = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/api/invoices/${id}`);
  } catch (error) {
    console.error('Error deleting invoice:', error);
    throw error;
  }
};
