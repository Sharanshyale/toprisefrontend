import apiClient from "@/apiClient";
import { 
  DealerOrdersApiResponse, 
  DealerOrder,
  UpdateOrderStatusRequest,
  UpdateOrderStatusResponse,
  DealerPickList,
  DealerPickListApiResponse
} from "@/types/dealerOrder-types";
import { getCookie, getAuthToken } from "@/utils/auth";

/**
 * Get orders by dealer ID
 * @param dealerId - Optional dealer ID, will try to get from cookie/token if not provided
 * @returns Promise<DealerOrder[]>
 */
export const getOrdersByDealerId = async (dealerId?: string): Promise<DealerOrder[]> => {
  try {
    // If dealerId is not provided, try to get it from cookie
    let id = dealerId;
    if (!id) {
      id = getCookie("dealerId");
      if (!id) {
        // Try to extract from token
        const token = getAuthToken();
        if (token) {
          try {
            const payloadBase64 = token.split(".")[1];
            if (payloadBase64) {
              const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
              const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
              const payloadJson = atob(paddedBase64);
              const payload = JSON.parse(payloadJson);
              // Try dealerId, fallback to id
              id = payload.dealerId || payload.id;
            }
          } catch (err) {
            console.error("Failed to decode token for dealerId:", err);
          }
        }
      }
      if (!id) {
        throw new Error("Dealer ID not found in cookie, argument, or token");
      }
    }

    console.log(`[getOrdersByDealerId] Fetching orders for dealer ID: ${id}`);
    
    const response = await apiClient.get<DealerOrdersApiResponse>(
      `/orders/api/orders/get/order-by-dealer/${id}`
    );

    console.log(`[getOrdersByDealerId] Successfully fetched ${response.data.orders.length} orders`);
    return response.data.orders;
  } catch (error) {
    console.error("Error fetching orders by dealer ID:", error);
    throw error;
  }
};

/**
 * Update order status by dealer
 * @param dealerId - Dealer ID
 * @param orderId - Order ID to update
 * @param totalWeightKg - Total weight in kilograms
 * @returns Promise<UpdateOrderStatusResponse>
 */
export const updateOrderStatusByDealer = async (
  dealerId: string, 
  orderId: string,
  totalWeightKg: number
): Promise<UpdateOrderStatusResponse> => {
  try {
    console.log(`[updateOrderStatusByDealer] Updating order ${orderId} for dealer ${dealerId} with weight ${totalWeightKg}kg`);
    
    const requestData: UpdateOrderStatusRequest = {
      dealerId,
      orderId,
      total_weight_kg: totalWeightKg
    };

    const response = await apiClient.put<UpdateOrderStatusResponse>(
      `/orders/api/orders/update/order-status-by-dealer`,
      requestData
    );

    console.log(`[updateOrderStatusByDealer] Successfully updated order status to: ${response.data.orderStatus}`);
    return response.data;
  } catch (error) {
    console.error("Error updating order status by dealer:", error);
    throw error;
  }
};

/**
 * Get dealer pick list by dealer ID
 * @param dealerId - The dealer ID to fetch pick list for
 * @returns Promise<DealerPickList[]>
 */
export const getDealerPickList = async (dealerId: string): Promise<DealerPickList[]> => {
  try {
    const response = await apiClient.get<DealerPickListApiResponse>(
      `/orders/api/orders/picklists/dealer/${dealerId}`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching dealer pick list:", error);
    throw error;
  }
};

//  Picklist of orders