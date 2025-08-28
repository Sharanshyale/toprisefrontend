import apiClient from "@/apiClient";

// Types for the dashboard data
export interface FulfillmentStats {
  totalOrders: number;
  assignedDealers: number;
  pendingTasks: number;
  completedTasks: number;
  totalRevenue: number;
  averageProcessingTime: number;
}

export interface PendingTask {
  _id: string;
  orderId: string;
  customerName: string;
  dealerName: string;
  taskType: "pickup" | "delivery" | "inspection" | "refund";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate: string;
  status: "pending" | "in_progress" | "completed";
  assignedTo?: string;
}

export interface AssignedDealer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  activeOrders: number;
  completedOrders: number;
  rating: number;
  lastActive: string;
}

export interface RecentOrder {
  _id: string;
  orderId: string;
  customerName: string;
  dealerName: string;
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  orderDate: string;
  items: number;
}

// API Response types
export interface FulfillmentStatsResponse {
  success: boolean;
  message: string;
  data: FulfillmentStats;
}

export interface PendingTasksResponse {
  success: boolean;
  message: string;
  data: PendingTask[];
}

export interface AssignedDealersResponse {
  success: boolean;
  message: string;
  data: AssignedDealer[];
}

export interface RecentOrdersResponse {
  success: boolean;
  message: string;
  data: RecentOrder[];
}

// API functions
export const getFulfillmentStats = async (): Promise<FulfillmentStatsResponse> => {
  try {
    const response = await apiClient.get('/orders/api/fulfillment/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching fulfillment stats:', error);
    throw error;
  }
};

export const getPendingTasks = async (): Promise<PendingTasksResponse> => {
  try {
    const response = await apiClient.get('/orders/api/fulfillment/pending-tasks');
    return response.data;
  } catch (error) {
    console.error('Error fetching pending tasks:', error);
    throw error;
  }
};

export const getAssignedDealers = async (): Promise<AssignedDealersResponse> => {
  try {
    const response = await apiClient.get('/users/api/fulfillment/assigned-dealers');
    return response.data;
  } catch (error) {
    console.error('Error fetching assigned dealers:', error);
    throw error;
  }
};

export const getRecentOrders = async (): Promise<RecentOrdersResponse> => {
  try {
    const response = await apiClient.get('/orders/api/fulfillment/recent-orders');
    return response.data;
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    throw error;
  }
};

// Task management functions
export const updateTaskStatus = async (
  taskId: string, 
  status: "pending" | "in_progress" | "completed",
  notes?: string
): Promise<any> => {
  try {
    const response = await apiClient.put(`/orders/api/fulfillment/tasks/${taskId}/status`, {
      status,
      notes
    });
    return response.data;
  } catch (error) {
    console.error('Error updating task status:', error);
    throw error;
  }
};

export const assignTaskToStaff = async (
  taskId: string, 
  staffId: string
): Promise<any> => {
  try {
    const response = await apiClient.put(`/orders/api/fulfillment/tasks/${taskId}/assign`, {
      staffId
    });
    return response.data;
  } catch (error) {
    console.error('Error assigning task:', error);
    throw error;
  }
};

// Dealer management functions
export const getDealerDetails = async (dealerId: string): Promise<any> => {
  try {
    const response = await apiClient.get(`/users/api/dealers/${dealerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dealer details:', error);
    throw error;
  }
};

export const updateDealerStatus = async (
  dealerId: string, 
  status: "active" | "inactive" | "suspended"
): Promise<any> => {
  try {
    const response = await apiClient.put(`/users/api/dealers/${dealerId}/status`, {
      status
    });
    return response.data;
  } catch (error) {
    console.error('Error updating dealer status:', error);
    throw error;
  }
};

// Order management functions
export const getOrderDetails = async (orderId: string): Promise<any> => {
  try {
    const response = await apiClient.get(`/orders/api/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw error;
  }
};

export const updateOrderStatus = async (
  orderId: string, 
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
): Promise<any> => {
  try {
    const response = await apiClient.put(`/orders/api/orders/${orderId}/status`, {
      status
    });
    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Dashboard refresh function
export const refreshDashboardData = async (): Promise<{
  stats: FulfillmentStats;
  tasks: PendingTask[];
  dealers: AssignedDealer[];
  orders: RecentOrder[];
}> => {
  try {
    const [statsRes, tasksRes, dealersRes, ordersRes] = await Promise.all([
      getFulfillmentStats(),
      getPendingTasks(),
      getAssignedDealers(),
      getRecentOrders(),
    ]);

    return {
      stats: statsRes.data,
      tasks: tasksRes.data,
      dealers: dealersRes.data,
      orders: ordersRes.data,
    };
  } catch (error) {
    console.error('Error refreshing dashboard data:', error);
    throw error;
  }
};
