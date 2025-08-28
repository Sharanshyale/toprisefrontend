import { orderResponse, PicklistResponse, AssignDealersRequest, CreatePicklistRequest, AssignPicklistRequest, UpdateOrderStatusByDealerRequest } from "@/types/order-Types";
import apiClient from "@/apiClient";

export async function getOrders(): Promise<orderResponse> {
  try {
    const response = await apiClient.get(`/orders/api/orders/all`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    throw error;
  }
}

export async function getOrderById(id: string): Promise<orderResponse> {
  try {
    const response = await apiClient.get(`/orders/api/orders/id/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch order with id ${id}:`, error);
    throw error;
  }
}

// Assign dealers to SKUs
export async function assignDealersToOrder(payload: AssignDealersRequest): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiClient.post(`/orders/api/orders/assign-dealers`, payload);
    return response.data;
  } catch (error) {
    console.error("Failed to assign dealers:", error);
    throw error;
  }
}

// Fetch all picklists
export async function fetchPicklists(): Promise<PicklistResponse> {
  try {
    // Disable credentials for this GET to avoid CORS '*' with credentials
    const response = await apiClient.get(`/orders/api/orders/picklists`, { withCredentials: false });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch picklists:", error);
    throw error;
  }
}

// Create picklist explicitly
export async function createPicklist(payload: CreatePicklistRequest): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiClient.post(`/orders/api/orders/create-pickup`, payload);
    return response.data;
  } catch (error) {
    console.error("Failed to create picklist:", error);
    throw error;
  }
}

// Assign a picklist to a fulfilment staff
export async function assignPicklistToStaff(payload: AssignPicklistRequest): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiClient.post(`/orders/api/orders/assign-picklist`, payload);
    return response.data;
  } catch (error) {
    console.error("Failed to assign picklist:", error);
    throw error;
  }
}

// Dealer packs order with total weight
export async function updateOrderStatusByDealerReq(payload: UpdateOrderStatusByDealerRequest): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiClient.put(`/orders/api/orders/update/order-status-by-dealer`, payload);
    return response.data;
  } catch (error) {
    console.error("Failed to update order status by dealer:", error);
    throw error;
  }
}