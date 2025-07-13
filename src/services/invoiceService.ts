import { apiClient } from './apiClient';

// Create invoice - matches /api/invoices endpoint
export const createInvoice = async (invoiceData: {
  player_id: number;
  session_id?: number;
  items: Array<{
    item_name: string;
    quantity: number;
    unit_price: number;
  }>;
  tax_rate?: number;
  discount?: number;
}): Promise<any> => {
  try {
    const response = await apiClient.post('/api/invoices', invoiceData);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to create invoice');
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
};

// Get all invoices - matches /api/invoices endpoint
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
    
    if (response.success) {
      return response.data?.invoices || response.data || [];
    }
    
    throw new Error(response.message || 'Failed to fetch invoices');
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }
};

// Get invoice by ID - matches /api/invoices/:id endpoint
export const getInvoiceById = async (id: number): Promise<any> => {
  try {
    const response = await apiClient.get(`/api/invoices/${id}`);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Invoice not found');
  } catch (error) {
    console.error('Error fetching invoice:', error);
    throw error;
  }
};

// Update invoice status - matches /api/invoices/:id/status endpoint
export const updateInvoiceStatus = async (id: number, statusData: {
  payment_status: 'pending' | 'paid' | 'cancelled';
  payment_method?: 'cash' | 'card' | 'jazzCash' | 'Easypaisa' | 'Others';
  notes?: string;
}): Promise<any> => {
  try {
    const response = await apiClient.put(`/api/invoices/${id}/status`, statusData);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to update invoice status');
  } catch (error) {
    console.error('Error updating invoice status:', error);
    throw error;
  }
};

// Delete invoice - matches /api/invoices/:id endpoint
export const deleteInvoice = async (id: number): Promise<void> => {
  try {
    const response = await apiClient.delete(`/api/invoices/${id}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete invoice');
    }
  } catch (error) {
    console.error('Error deleting invoice:', error);
    throw error;
  }
};

export const getInvoiceBySessionId = async (sessionId: number) => {
  const response = await apiClient.get(`/invoices/session/${sessionId}`);
  return response.data;
};
