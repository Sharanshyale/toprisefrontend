import apiClient from "@/apiClient";
import { OrderStatsQuery, OrderStatsResponse, ProductStatsResponse, EmployeeStatsResponse, DealerStatsResponse, OrderSummaryPeriod, OrderSummaryResponse, UserCountsResponse } from "@/types/dashboard-Types";

export async function fetchOrderStats(params: OrderStatsQuery): Promise<OrderStatsResponse> {
  const { startDate, endDate } = params;
  const response = await apiClient.get(
    `/orders/api/orders/get/order/stats`,
    { params: { startDate, endDate } }
  );
  return response.data as OrderStatsResponse;
}

export async function fetchProductStats(): Promise<ProductStatsResponse> {
  const response = await apiClient.get(
    `/category/products/v1/get/product-stats`
  );
  return response.data as ProductStatsResponse;
}

export async function fetchEmployeeStats(): Promise<EmployeeStatsResponse> {
  const response = await apiClient.get(
    `/users/api/users/employee/stats`
  );
  return response.data as EmployeeStatsResponse;
}

export async function fetchDealerStats(): Promise<DealerStatsResponse> {
  try {
    const response = await apiClient.get(
      `/users/api/users/dealer/stats`
    );
    return response.data as DealerStatsResponse;
  } catch (error: any) {
    console.error("Error fetching dealer stats:", error);
    
    // Handle the schema registration error specifically
    if (error?.response?.data?.message?.includes("Schema hasn't been registered for model")) {
      console.warn("Dealer model not registered in user service. Returning fallback data.");
      
      // Return fallback dealer stats data
      return {
        success: true,
        message: "Fallback dealer stats data",
        data: {
          totalDealers: 0,
          activeDealers: 0,
          deactivatedDealers: 0,
          dealersWithUploadAccess: 0,
          dealersWithAssignedEmployees: 0,
          avgCategoriesPerDealer: 0,
          period: {
            startDate: new Date().toISOString(),
            endDate: new Date().toISOString(),
          },
          summary: {
            totalDealers: 0,
            activeDealers: 0,
            deactivatedDealers: 0,
            dealersWithUploadAccess: 0,
            dealersWithAssignedEmployees: 0,
            avgCategoriesPerDealer: 0,
          }
        }
      } as DealerStatsResponse;
    }
    
    throw error;
  }
}

export async function fetchOrderSummary(period: OrderSummaryPeriod): Promise<OrderSummaryResponse> {
  const response = await apiClient.get(
    `/orders/api/orders/get/orderSummary`,
    { params: { period } }
  );
  return response.data as OrderSummaryResponse;
}

export async function fetchUserCounts(): Promise<UserCountsResponse> {
  try {
    const response = await apiClient.get(
      `/users/api/users/stats/userCounts`
    );
    return response.data as UserCountsResponse;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      const altResponse = await apiClient.get(
        `/users/api/users/user/stats/userCounts`
      );
      return altResponse.data as UserCountsResponse;
    }
    throw error;
  }
}