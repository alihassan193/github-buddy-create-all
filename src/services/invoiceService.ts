
import { apiClient } from './apiClient';

// Create invoice - matches /api/invoices endpoint
export const createInvoice = async (invoiceData: {
  session_id: number;
  payment_method?: string;
  discount_percentage?: number;
  tax_percentage?: number;
}): Promise<any> => {
  try {
    const response = await apiClient.post('/api/invoices', invoiceData);
    return response.data || response;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
};

// Get all invoices - matches /api/invoices endpoint
export const getAllInvoices = async (params?: {
  page?: number;
  limit?: number;
  start_date?: string;
  end_date?: string;
}): Promise<any> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);

    const response = await apiClient.get(`/api/invoices?${queryParams.toString()}`);
    return response.data || response;
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }
};

// Get invoice by ID - matches /api/invoices/:id endpoint
export const getInvoiceById = async (id: number): Promise<any> => {
  try {
    const response = await apiClient.get(`/api/invoices/${id}`);
    return response.data || response;
  } catch (error) {
    console.error('Error fetching invoice:', error);
    throw error;
  }
};

// Update invoice status - matches /api/invoices/:id/status endpoint
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
