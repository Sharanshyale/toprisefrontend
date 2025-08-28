import apiClient from "@/apiClient";

// Stock Management APIs
export const updateProductStock = async (productId: string, newStock: number, reason: string) => {
  try {
    const response = await apiClient.put(`/products/v1/updateStock/${productId}`, {
      no_of_stock: newStock,
      stockUpdateReason: reason,
      updatedBy: new Date().toISOString()
    });
    return response.data;
  } catch (error) {
    console.error('Error updating product stock:', error);
    throw error;
  }
};

export const getStockHistory = async (productId: string) => {
  try {
    const response = await apiClient.get(`/products/v1/stockHistory/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching stock history:', error);
    throw error;
  }
};

// Dealer Assignment APIs
export const assignProductToDealers = async (productId: string, dealerIds: string[]) => {
  try {
    const response = await apiClient.post(`/products/v1/assignDealers/${productId}`, {
      dealerIds,
      assignedBy: new Date().toISOString()
    });
    return response.data;
  } catch (error) {
    console.error('Error assigning product to dealers:', error);
    throw error;
  }
};

export const unassignProductFromDealers = async (productId: string, dealerIds: string[]) => {
  try {
    const response = await apiClient.delete(`/products/v1/unassignDealers/${productId}`, {
      data: { dealerIds }
    });
    return response.data;
  } catch (error) {
    console.error('Error unassigning product from dealers:', error);
    throw error;
  }
};

export const getProductDealerAssignments = async (productId: string) => {
  try {
    const response = await apiClient.get(`/products/v1/dealerAssignments/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product dealer assignments:', error);
    throw error;
  }
};

// Dealer Management APIs
export const getAllDealers = async () => {
  try {
    const response = await apiClient.get('/users/api/dealers');
    return response.data;
  } catch (error) {
    console.error('Error fetching dealers:', error);
    throw error;
  }
};

export const getActiveDealers = async () => {
  try {
    const response = await apiClient.get('/users/api/dealers/active');
    return response.data;
  } catch (error) {
    console.error('Error fetching active dealers:', error);
    throw error;
  }
};

// Product Management APIs for Inventory-Staff
export const getProductsForInventoryStaff = async (filters?: any) => {
  try {
    const response = await apiClient.get('/products/v1/inventory-staff', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching products for inventory staff:', error);
    throw error;
  }
};

export const updateProductForInventoryStaff = async (productId: string, updateData: any) => {
  try {
    const response = await apiClient.put(`/products/v1/inventory-staff/${productId}`, {
      ...updateData,
      updatedBy: new Date().toISOString()
    });
    return response.data;
  } catch (error) {
    console.error('Error updating product for inventory staff:', error);
    throw error;
  }
};

// Bulk Operations for Inventory-Staff
export const bulkUpdateStock = async (updates: Array<{productId: string, newStock: number, reason: string}>) => {
  try {
    const response = await apiClient.post('/products/v1/bulkUpdateStock', {
      updates,
      updatedBy: new Date().toISOString()
    });
    return response.data;
  } catch (error) {
    console.error('Error bulk updating stock:', error);
    throw error;
  }
};

export const bulkAssignDealers = async (assignments: Array<{productId: string, dealerIds: string[]}>) => {
  try {
    const response = await apiClient.post('/products/v1/bulkAssignDealers', {
      assignments,
      assignedBy: new Date().toISOString()
    });
    return response.data;
  } catch (error) {
    console.error('Error bulk assigning dealers:', error);
    throw error;
  }
};

// Inventory Reports
export const getInventoryReport = async (filters?: any) => {
  try {
    const response = await apiClient.get('/products/v1/inventory-report', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching inventory report:', error);
    throw error;
  }
};

export const getLowStockAlerts = async () => {
  try {
    const response = await apiClient.get('/products/v1/low-stock-alerts');
    return response.data;
  } catch (error) {
    console.error('Error fetching low stock alerts:', error);
    throw error;
  }
};

export const getOutOfStockProducts = async () => {
  try {
    const response = await apiClient.get('/products/v1/out-of-stock');
    return response.data;
  } catch (error) {
    console.error('Error fetching out of stock products:', error);
    throw error;
  }
};

// Types for Inventory-Staff
export interface StockUpdate {
  productId: string;
  oldStock: number;
  newStock: number;
  reason: string;
  updatedBy: string;
  updatedAt: string;
}

export interface DealerAssignment {
  productId: string;
  dealerId: string;
  dealerName: string;
  assignedBy: string;
  assignedAt: string;
  isActive: boolean;
}

export interface InventoryStaffProduct {
  _id: string;
  product_name: string;
  sku_code: string;
  no_of_stock: number;
  selling_price: number;
  mrp_with_gst: number;
  brand?: string;
  category?: string;
  sub_category?: string;
  product_type?: string;
  is_returnable?: boolean;
  return_policy?: number;
  images?: string[];
  assignedDealers?: string[];
  stockHistory?: StockUpdate[];
  lastStockUpdate?: string;
}
