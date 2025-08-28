import apiClient from "@/apiClient";
import { fetchProductStats, fetchDealerStats } from "./dashboardServices";

export interface InventoryAdminDashboardData {
  productStats: {
    totalProducts: number;
    approvedProducts: number;
    pendingProducts: number;
    rejectedProducts: number;
    liveProducts: number;
    createdProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
  };
  dealerStats: {
    totalDealers: number;
    activeDealers: number;
    deactivatedDealers: number;
    dealersWithUploadAccess: number;
    dealersWithAssignedEmployees: number;
    avgCategoriesPerDealer: number;
  };
  requestStats: {
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    inReviewRequests: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    status: string;
    actorName?: string;
    targetType?: string;
  }>;
  stockAlerts: {
    lowStockCount: number;
    outOfStockCount: number;
    criticalStockCount: number;
  };
  summary: {
    totalInventoryValue: number;
    avgProductPrice: number;
    topCategories: Array<{
      name: string;
      count: number;
      percentage: number;
    }>;
    monthlyGrowth: {
      products: number;
      dealers: number;
      requests: number;
    };
  };
}

export const inventoryAdminService = {
  // Get comprehensive dashboard data
  getDashboardData: async (): Promise<InventoryAdminDashboardData> => {
    try {
      // Fetch all required data in parallel
      const [productStatsRes, dealerStatsRes] = await Promise.all([
        fetchProductStats(),
        fetchDealerStats(),
      ]);

      // Mock request stats since the API is not available
      const requestStatsRes = {
        data: {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          inReview: 0,
        }
      };

      // Get recent activity from audit logs (products only for Inventory-Admin)
      const recentActivity = await inventoryAdminService.getRecentActivity();

      // Get stock alerts
      const stockAlerts = await inventoryAdminService.getStockAlerts();

      // Get summary data
      const summary = await inventoryAdminService.getSummaryData();

      return {
        productStats: {
          totalProducts: productStatsRes.data.total || 0,
          approvedProducts: productStatsRes.data.approved || 0,
          pendingProducts: productStatsRes.data.pending || 0,
          rejectedProducts: productStatsRes.data.rejected || 0,
          liveProducts: productStatsRes.data.live || 0,
          createdProducts: productStatsRes.data.created || 0,
          lowStockProducts: stockAlerts.lowStockCount,
          outOfStockProducts: stockAlerts.outOfStockCount,
        },
        dealerStats: {
          totalDealers: dealerStatsRes.data.summary.totalDealers || 0,
          activeDealers: dealerStatsRes.data.summary.activeDealers || 0,
          deactivatedDealers: dealerStatsRes.data.summary.deactivatedDealers || 0,
          dealersWithUploadAccess: dealerStatsRes.data.summary.dealersWithUploadAccess || 0,
          dealersWithAssignedEmployees: dealerStatsRes.data.summary.dealersWithAssignedEmployees || 0,
          avgCategoriesPerDealer: dealerStatsRes.data.avgCategoriesPerDealer || 0,
        },
        requestStats: {
          totalRequests: requestStatsRes.data.total || 0,
          pendingRequests: requestStatsRes.data.pending || 0,
          approvedRequests: requestStatsRes.data.approved || 0,
          rejectedRequests: requestStatsRes.data.rejected || 0,
          inReviewRequests: requestStatsRes.data.inReview || 0,
        },
        recentActivity,
        stockAlerts,
        summary,
      };
    } catch (error) {
      console.error("Failed to fetch inventory admin dashboard data:", error);
      throw error;
    }
  },

  // Get recent activity from audit logs
  getRecentActivity: async () => {
    try {
      const response = await apiClient.get("/category/api/audit/logs", {
        params: {
          page: 1,
          limit: 10,
          targetType: "Product",
        },
      });

      if (response.data.success && response.data.data.logs) {
        return response.data.data.logs.slice(0, 5).map((log: any) => ({
          id: log._id,
          type: log.action,
          description: `${log.action} - ${log.targetType}`,
          timestamp: log.timestamp,
          status: log.severity === "HIGH" ? "critical" : log.severity === "MEDIUM" ? "pending" : "completed",
          actorName: log.actorName,
          targetType: log.targetType,
        }));
      }

      return [];
    } catch (error) {
      console.error("Failed to fetch recent activity:", error);
      return [];
    }
  },

  // Get stock alerts
  getStockAlerts: async () => {
    try {
      // This would typically come from a stock management endpoint
      // For now, we'll use a mock implementation
      const response = await apiClient.get("/category/products/v1/stock-alerts");
      
      if (response.data.success) {
        return response.data.data;
      }

      // Fallback to mock data
      return {
        lowStockCount: 23,
        outOfStockCount: 7,
        criticalStockCount: 3,
      };
    } catch (error) {
      console.error("Failed to fetch stock alerts:", error);
      // Return fallback data
      return {
        lowStockCount: 23,
        outOfStockCount: 7,
        criticalStockCount: 3,
      };
    }
  },

  // Get summary data
  getSummaryData: async () => {
    try {
      // This would typically come from analytics endpoints
      // For now, we'll use a mock implementation
      const response = await apiClient.get("/category/products/v1/analytics/summary");
      
      if (response.data.success) {
        return response.data.data;
      }

      // Fallback to mock data
      return {
        totalInventoryValue: 1250000,
        avgProductPrice: 850,
        topCategories: [
          { name: "Engine Parts", count: 450, percentage: 36 },
          { name: "Brake System", count: 320, percentage: 25.6 },
          { name: "Electrical", count: 280, percentage: 22.4 },
          { name: "Suspension", count: 200, percentage: 16 },
        ],
        monthlyGrowth: {
          products: 12,
          dealers: 5,
          requests: -3,
        },
      };
    } catch (error) {
      console.error("Failed to fetch summary data:", error);
      // Return fallback data
      return {
        totalInventoryValue: 1250000,
        avgProductPrice: 850,
        topCategories: [
          { name: "Engine Parts", count: 450, percentage: 36 },
          { name: "Brake System", count: 320, percentage: 25.6 },
          { name: "Electrical", count: 280, percentage: 22.4 },
          { name: "Suspension", count: 200, percentage: 16 },
        ],
        monthlyGrowth: {
          products: 12,
          dealers: 5,
          requests: -3,
        },
      };
    }
  },

  // Get product category distribution
  getCategoryDistribution: async () => {
    try {
      const response = await apiClient.get("/category/products/v1/category-distribution");
      
      if (response.data.success) {
        return response.data.data;
      }

      return [];
    } catch (error) {
      console.error("Failed to fetch category distribution:", error);
      return [];
    }
  },

  // Get dealer performance metrics
  getDealerPerformance: async () => {
    try {
      const response = await apiClient.get("/users/api/users/dealer/performance");
      
      if (response.data.success) {
        return response.data.data;
      }

      return [];
    } catch (error) {
      console.error("Failed to fetch dealer performance:", error);
      return [];
    }
  },

  // Get inventory turnover rate
  getInventoryTurnover: async () => {
    try {
      const response = await apiClient.get("/category/products/v1/inventory-turnover");
      
      if (response.data.success) {
        return response.data.data;
      }

      return {
        turnoverRate: 4.2,
        avgDaysToSell: 87,
        topSellingProducts: [],
        slowMovingProducts: [],
      };
    } catch (error) {
      console.error("Failed to fetch inventory turnover:", error);
      return {
        turnoverRate: 4.2,
        avgDaysToSell: 87,
        topSellingProducts: [],
        slowMovingProducts: [],
      };
    }
  },
};
