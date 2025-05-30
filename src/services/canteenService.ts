
import { apiClient } from './apiClient';

// Get all canteen categories - matches /api/canteen/categories endpoint
export const getAllCategories = async (): Promise<any[]> => {
  try {
    const response = await apiClient.get('/api/canteen/categories');
    return response.data || response;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Create canteen category - matches /api/canteen/categories endpoint
export const createCanteenCategory = async (categoryData: {
  name: string;
  description?: string;
}): Promise<any> => {
  try {
    const response = await apiClient.post('/api/canteen/categories', categoryData);
    return response.data || response;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

// Get all canteen items - matches /api/canteen/items endpoint
export const getAllCanteenItems = async (params?: {
  page?: number;
  limit?: number;
}): Promise<any> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get(`/api/canteen/items?${queryParams.toString()}`);
    return response.data || response;
  } catch (error) {
    console.error('Error fetching canteen items:', error);
    throw error;
  }
};

// Get canteen item by ID
export const getCanteenItemById = async (id: number): Promise<any> => {
  try {
    const response = await apiClient.get(`/api/canteen/items/${id}`);
    return response.data || response;
  } catch (error) {
    console.error('Error fetching canteen item:', error);
    throw error;
  }
};

// Create canteen item - matches /api/canteen/items endpoint
export const createCanteenItem = async (itemData: {
  name: string;
  description?: string;
  price: number;
  category_id: number;
  club_id: number;
  is_available?: boolean;
  initial_stock?: number;
  minimum_stock?: number;
}): Promise<any> => {
  try {
    const response = await apiClient.post('/api/canteen/items', itemData);
    return response.data || response;
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
  is_available?: boolean;
}): Promise<any> => {
  try {
    const response = await apiClient.put(`/api/canteen/items/${id}`, itemData);
    return response.data || response;
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

// Update stock - matches /api/canteen/stock/:id endpoint
export const updateStock = async (itemId: number, stockData: {
  quantity: number;
  operation: 'add' | 'subtract';
}): Promise<any> => {
  try {
    const response = await apiClient.put(`/api/canteen/stock/${itemId}`, stockData);
    return response.data || response;
  } catch (error) {
    console.error('Error updating stock:', error);
    throw error;
  }
};

// Get low stock items - matches /api/canteen/low-stock endpoint
export const getLowStockItems = async (): Promise<any[]> => {
  try {
    const response = await apiClient.get('/api/canteen/low-stock');
    return response.data || response;
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    throw error;
  }
};

// Add order to session - matches /api/canteen/order endpoint
export const addOrderToSession = async (orderData: {
  session_id: number;
  items: Array<{
    item_id: number;
    quantity: number;
  }>;
}): Promise<any> => {
  try {
    const response = await apiClient.post('/api/canteen/order', orderData);
    return response.data || response;
  } catch (error) {
    console.error('Error adding order to session:', error);
    throw error;
  }
};

// Legacy functions for backward compatibility
export const createCanteenInvoice = async (invoiceData: any): Promise<any> => {
  console.warn('createCanteenInvoice is deprecated, use invoice service instead');
  return addOrderToSession(invoiceData);
};

export const createQuickSale = async (saleData: any): Promise<any> => {
  console.warn('createQuickSale is deprecated, use addOrderToSession instead');
  return addOrderToSession(saleData);
};

export const getCanteenSalesReport = async (clubId: number, params?: any): Promise<any> => {
  console.warn('getCanteenSalesReport is deprecated, use reports service instead');
  return {};
};
