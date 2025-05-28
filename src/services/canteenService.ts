
import { apiClient } from './apiClient';

// Get all canteen categories
export const getAllCategories = async (clubId?: number): Promise<any[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (clubId) queryParams.append('club_id', clubId.toString());
    
    const response = await apiClient.get(`/api/canteen/categories?${queryParams.toString()}`);
    return response;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Get all canteen items
export const getAllCanteenItems = async (params?: {
  category_id?: number;
  is_available?: boolean;
  page?: number;
  limit?: number;
  club_id?: number;
}): Promise<any> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.category_id) queryParams.append('category_id', params.category_id.toString());
    if (params?.is_available !== undefined) queryParams.append('is_available', params.is_available.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.club_id) queryParams.append('club_id', params.club_id.toString());

    const response = await apiClient.get(`/api/canteen/items?${queryParams.toString()}`);
    return response;
  } catch (error) {
    console.error('Error fetching canteen items:', error);
    throw error;
  }
};

// Get canteen item by ID
export const getCanteenItemById = async (id: number): Promise<any> => {
  try {
    const response = await apiClient.get(`/api/canteen/items/${id}`);
    return response;
  } catch (error) {
    console.error('Error fetching canteen item:', error);
    throw error;
  }
};

// Create canteen item
export const createCanteenItem = async (itemData: {
  name: string;
  description?: string;
  price: number;
  category_id: number;
  stock_quantity?: number;
  is_available?: boolean;
  club_id: number;
}): Promise<any> => {
  try {
    const response = await apiClient.post('/api/canteen/items', itemData);
    return response;
  } catch (error) {
    console.error('Error creating canteen item:', error);
    throw error;
  }
};

// Update canteen item
export const updateCanteenItem = async (id: number, itemData: {
  name?: string;
  description?: string;
  price?: number;
  category_id?: number;
  stock_quantity?: number;
  is_available?: boolean;
}): Promise<any> => {
  try {
    const response = await apiClient.put(`/api/canteen/items/${id}`, itemData);
    return response;
  } catch (error) {
    console.error('Error updating canteen item:', error);
    throw error;
  }
};

// Delete canteen item
export const deleteCanteenItem = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/api/canteen/items/${id}`);
  } catch (error) {
    console.error('Error deleting canteen item:', error);
    throw error;
  }
};

// Create canteen invoice
export const createCanteenInvoice = async (invoiceData: {
  club_id: number;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  items: Array<{ canteen_item_id: number; quantity: number }>;
  payment_method?: string;
  discount_amount?: number;
  notes?: string;
  is_guest?: boolean;
  player_id?: number;
}): Promise<any> => {
  try {
    const response = await apiClient.post('/api/canteen/invoice', invoiceData);
    return response;
  } catch (error) {
    console.error('Error creating canteen invoice:', error);
    throw error;
  }
};

// Create quick sale
export const createQuickSale = async (saleData: {
  club_id: number;
  canteen_item_id: number;
  quantity?: number;
  customer_name?: string;
  payment_method?: string;
}): Promise<any> => {
  try {
    const response = await apiClient.post('/api/canteen/quick-sale', saleData);
    return response;
  } catch (error) {
    console.error('Error creating quick sale:', error);
    throw error;
  }
};

// Get canteen sales report
export const getCanteenSalesReport = async (clubId: number, params?: {
  startDate?: string;
  endDate?: string;
  item_id?: number;
}): Promise<any> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.item_id) queryParams.append('item_id', params.item_id.toString());

    const response = await apiClient.get(`/api/canteen/sales-report/${clubId}?${queryParams.toString()}`);
    return response;
  } catch (error) {
    console.error('Error fetching canteen sales report:', error);
    throw error;
  }
};
