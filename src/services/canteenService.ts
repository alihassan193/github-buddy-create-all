
import { apiClient } from './apiClient';

// Get all canteen categories - matches /api/canteen/categories endpoint
export const getAllCategories = async (): Promise<any[]> => {
  try {
    const response = await apiClient.get('/api/canteen/categories');
    
    if (response.success) {
      return response.data || [];
    }
    
    throw new Error(response.message || 'Failed to fetch categories');
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
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to create category');
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

// Get all canteen items - matches /api/canteen/items endpoint
export const getAllCanteenItems = async (params?: {
  category_id?: number;
  is_available?: boolean;
  page?: number;
  limit?: number;
}): Promise<any> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.category_id) queryParams.append('category_id', params.category_id.toString());
    if (params?.is_available !== undefined) queryParams.append('is_available', params.is_available.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get(`/api/canteen/items?${queryParams.toString()}`);
    
    if (response.success) {
      return response.data?.items || response.data || [];
    }
    
    throw new Error(response.message || 'Failed to fetch canteen items');
  } catch (error) {
    console.error('Error fetching canteen items:', error);
    throw error;
  }
};

// Get canteen item by ID
export const getCanteenItemById = async (id: number): Promise<any> => {
  try {
    const response = await apiClient.get(`/api/canteen/items/${id}`);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Canteen item not found');
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
  stock_quantity?: number;
}): Promise<any> => {
  try {
    const response = await apiClient.post('/api/canteen/items', itemData);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to create canteen item');
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
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to update canteen item');
  } catch (error) {
    console.error('Error updating canteen item:', error);
    throw error;
  }
};

// Delete canteen item
export const deleteCanteenItem = async (id: number): Promise<void> => {
  try {
    const response = await apiClient.delete(`/api/canteen/items/${id}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete canteen item');
    }
  } catch (error) {
    console.error('Error deleting canteen item:', error);
    throw error;
  }
};

// Update stock - matches /api/canteen/stock/:item_id endpoint
export const updateStock = async (itemId: number, stockData: {
  quantity: number;
  operation?: 'add' | 'subtract';
}): Promise<any> => {
  try {
    // Your API expects just quantity, not operation
    const response = await apiClient.put(`/api/canteen/stock/${itemId}`, {
      quantity: stockData.quantity
    });
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to update stock');
  } catch (error) {
    console.error('Error updating stock:', error);
    throw error;
  }
};

// Get low stock items - matches /api/canteen/low-stock endpoint
export const getLowStockItems = async (): Promise<any[]> => {
  try {
    const response = await apiClient.get('/api/canteen/low-stock');
    
    if (response.success) {
      return response.data || [];
    }
    
    throw new Error(response.message || 'Failed to fetch low stock items');
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    throw error;
  }
};

// Legacy functions for backward compatibility (these don't exist in your API)
export const addOrderToSession = async (orderData: {
  session_id: number;
  items: Array<{
    item_id: number;
    quantity: number;
  }>;
}): Promise<any> => {
  console.warn('addOrderToSession not implemented in backend API');
  throw new Error('Order functionality not yet implemented');
};

export const createCanteenInvoice = async (invoiceData: any): Promise<any> => {
  console.warn('createCanteenInvoice deprecated, use invoice service instead');
  throw new Error('Use invoice service instead');
};

export const createQuickSale = async (saleData: any): Promise<any> => {
  console.warn('createQuickSale deprecated, use addOrderToSession instead');
  throw new Error('Quick sale functionality not yet implemented');
};

export const getCanteenSalesReport = async (clubId: number, params?: any): Promise<any> => {
  console.warn('getCanteenSalesReport deprecated, use reports service instead');
  throw new Error('Use reports service instead');
};
