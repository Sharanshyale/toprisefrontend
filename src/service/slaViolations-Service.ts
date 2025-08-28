import apiClient from "@/apiClient";

// SLA Violation Statistics Service
export const slaViolationsService = {
  // Get SLA Violation Statistics
  getStats: async (params?: {
    startDate?: string;
    endDate?: string;
    dealerId?: string;
    groupBy?: "dealer" | "date" | "month";
  }) => {
    const response = await apiClient.get("/orders/api/sla-violations/stats", {
      params,
    });
    return response.data;
  },

  // Get Dealers with Multiple Violations
  getDealersWithViolations: async (params?: {
    minViolations?: number;
    startDate?: string;
    endDate?: string;
    includeDisabled?: boolean;
  }) => {
    const response = await apiClient.get(
      "/orders/api/sla-violations/dealers-with-violations",
      { params }
    );
    return response.data;
  },

  // Disable Dealer for Violations
  disableDealer: async (
    dealerId: string,
    data: {
      reason: string;
      adminNotes: string;
    }
  ) => {
    const response = await apiClient.put(
      `/orders/api/sla-violations/disable-dealer/${dealerId}`,
      data
    );
    return response.data;
  },

  // Get SLA Violation Trends
  getTrends: async (params?: {
    period?: "7d" | "30d" | "90d" | "1y";
    dealerId?: string;
  }) => {
    const response = await apiClient.get("/orders/api/sla-violations/trends", {
      params,
    });
    return response.data;
  },

  // Get Top Violating Dealers
  getTopViolators: async (params?: {
    limit?: number;
    startDate?: string;
    endDate?: string;
    sortBy?: "violations" | "minutes" | "avgMinutes" | "recent";
  }) => {
    const response = await apiClient.get(
      "/orders/api/sla-violations/top-violators",
      {
        params,
      }
    );
    return response.data;
  },

  // Resolve SLA Violation
  resolveViolation: async (
    violationId: string,
    data: {
      resolutionNotes: string;
    }
  ) => {
    const response = await apiClient.put(
      `/orders/api/sla-violations/resolve/${violationId}`,
      data
    );
    return response.data;
  },

  // Get SLA Violation Dashboard
  getDashboard: async () => {
    const response = await apiClient.get(
      "/orders/api/sla-violations/dashboard"
    );
    return response.data;
  },

  // Get SLA Violation Alerts
  getAlerts: async () => {
    const response = await apiClient.get("/orders/api/sla-violations/alerts");
    return response.data;
  },

  // Bulk Disable Dealers
  bulkDisableDealers: async (data: {
    dealerIds: string[];
    reason: string;
    adminNotes: string;
  }) => {
    const response = await apiClient.post(
      "/orders/api/sla-violations/bulk-disable",
      data
    );
    return response.data;
  },
};

export default slaViolationsService;
