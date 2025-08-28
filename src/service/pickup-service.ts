import apiClient from "@/apiClient";

// Types for pickup data
export interface PickupRequest {
  _id: string;
  pickupId: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  dealerName: string;
  dealerPhone: string;
  pickupAddress: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  scheduledDate: string;
  status: "pending" | "scheduled" | "in_progress" | "packed" | "picked_up" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  items: PickupItem[];
  notes?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PickupItem {
  _id: string;
  productName: string;
  sku: string;
  quantity: number;
  condition: "new" | "used" | "damaged";
  notes?: string;
}

// API Response types
export interface PickupRequestsResponse {
  success: boolean;
  message: string;
  data: PickupRequest[];
}

export interface PickupRequestResponse {
  success: boolean;
  message: string;
  data: PickupRequest;
}

// API functions
export const getPickupRequests = async (): Promise<PickupRequestsResponse> => {
  try {
    const response = await apiClient.get('/orders/api/pickup/requests');
    return response.data;
  } catch (error) {
    console.error('Error fetching pickup requests:', error);
    throw error;
  }
};

export const getPickupRequestById = async (pickupId: string): Promise<PickupRequestResponse> => {
  try {
    const response = await apiClient.get(`/orders/api/pickup/requests/${pickupId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching pickup request:', error);
    throw error;
  }
};

export const updatePickupStatus = async (
  pickupId: string, 
  status: "pending" | "scheduled" | "in_progress" | "packed" | "picked_up" | "completed" | "cancelled",
  notes?: string
): Promise<any> => {
  try {
    const response = await apiClient.put(`/orders/api/pickup/requests/${pickupId}/status`, {
      status,
      notes
    });
    return response.data;
  } catch (error) {
    console.error('Error updating pickup status:', error);
    throw error;
  }
};

export const assignPickupToStaff = async (
  pickupId: string, 
  staffId: string
): Promise<any> => {
  try {
    const response = await apiClient.put(`/orders/api/pickup/requests/${pickupId}/assign`, {
      staffId
    });
    return response.data;
  } catch (error) {
    console.error('Error assigning pickup:', error);
    throw error;
  }
};

export const createPickupRequest = async (
  pickupData: Omit<PickupRequest, '_id' | 'pickupId' | 'createdAt' | 'updatedAt'>
): Promise<any> => {
  try {
    const response = await apiClient.post('/orders/api/pickup/requests', pickupData);
    return response.data;
  } catch (error) {
    console.error('Error creating pickup request:', error);
    throw error;
  }
};

export const cancelPickupRequest = async (
  pickupId: string, 
  reason?: string
): Promise<any> => {
  try {
    const response = await apiClient.put(`/orders/api/pickup/requests/${pickupId}/cancel`, {
      reason
    });
    return response.data;
  } catch (error) {
    console.error('Error cancelling pickup request:', error);
    throw error;
  }
};

// Filter and search functions
export const getPickupRequestsByStatus = async (status: string): Promise<PickupRequestsResponse> => {
  try {
    const response = await apiClient.get(`/orders/api/pickup/requests?status=${status}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching pickup requests by status:', error);
    throw error;
  }
};

export const getPickupRequestsByPriority = async (priority: string): Promise<PickupRequestsResponse> => {
  try {
    const response = await apiClient.get(`/orders/api/pickup/requests?priority=${priority}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching pickup requests by priority:', error);
    throw error;
  }
};

export const searchPickupRequests = async (searchTerm: string): Promise<PickupRequestsResponse> => {
  try {
    const response = await apiClient.get(`/orders/api/pickup/requests/search?q=${searchTerm}`);
    return response.data;
  } catch (error) {
    console.error('Error searching pickup requests:', error);
    throw error;
  }
};

// Statistics functions
export const getPickupStatistics = async (): Promise<any> => {
  try {
    const response = await apiClient.get('/orders/api/pickup/statistics');
    return response.data;
  } catch (error) {
    console.error('Error fetching pickup statistics:', error);
    throw error;
  }
};

// Bulk operations
export const bulkUpdatePickupStatus = async (
  pickupIds: string[], 
  status: string,
  notes?: string
): Promise<any> => {
  try {
    const response = await apiClient.put('/orders/api/pickup/requests/bulk-status', {
      pickupIds,
      status,
      notes
    });
    return response.data;
  } catch (error) {
    console.error('Error bulk updating pickup status:', error);
    throw error;
  }
};

export const bulkAssignPickup = async (
  pickupIds: string[], 
  staffId: string
): Promise<any> => {
  try {
    const response = await apiClient.put('/orders/api/pickup/requests/bulk-assign', {
      pickupIds,
      staffId
    });
    return response.data;
  } catch (error) {
    console.error('Error bulk assigning pickup:', error);
    throw error;
  }
};
