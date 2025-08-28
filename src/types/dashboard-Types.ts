export interface OrderStatusCounts {
  Confirmed: number;
  Assigned: number;
  Shipped: number;
  Delivered: number;
  Cancelled: number;
  Returned: number;
}

export interface OrderStatsDateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

export interface OrderStatsData {
  totalOrders: number;
  statusCounts: OrderStatusCounts;
  todaysOrders: number;
  todaysStatusCounts: OrderStatusCounts;
  dateRange: OrderStatsDateRange;
}

export interface OrderStatsResponse {
  success: boolean;
  data: OrderStatsData;
}

export interface OrderStatsQuery {
  startDate: string;
  endDate: string;
}

// Order summary (for two-line chart over week/month)
export type OrderSummaryPeriod = "week" | "month";

export interface OrderSummaryTimePoint {
  label: string; // e.g., Monday or day-of-month
  currentDate: string;
  previousDate: string;
  currentAmount: number;
  previousAmount: number;
  currentOrders: number;
  previousOrders: number;
}

export interface OrderSummarySnapshot {
  date: string;
  order_Amount: number;
  orderCount: number;
}

export interface OrderSummarySummary {
  currentTotalAmount: number;
  previousTotalAmount: number;
  currentTotalOrders: number;
  previousTotalOrders: number;
  amountPercentageChange: number;
  orderCountPercentageChange: number;
  comparisonText: string; // e.g., "+20% than last week"
}

export interface OrderSummaryData {
  summary: OrderSummarySummary;
  timeSeriesData: OrderSummaryTimePoint[];
  currentPeriodData: OrderSummarySnapshot[];
  previousPeriodData: OrderSummarySnapshot[];
  period: OrderSummaryPeriod;
  dateRanges: {
    current: { start: string; end: string };
    previous: { start: string; end: string };
  };
}

export interface OrderSummaryResponse {
  success: boolean;
  data: OrderSummaryData;
}

// Product stats
export interface ProductStatsData {
  total: number;
  created: number;
  pending: number;
  rejected: number;
  live: number;
  approved: number;
}

export interface ProductStatsResponse {
  success: boolean;
  message: string;
  data: ProductStatsData;
}

// Employee stats (subset needed for dashboard)
export interface EmployeeStatsPeriod {
  startDate: string | null;
  endDate: string | null;
  isAllTime: boolean;
}

export interface EmployeeStatsSummary {
  totalEmployees: number;
  employeesWithDealers: number;
  employeesWithRegions: number;
  recentlyActiveEmployees: number;
  avgEmployeesPerRole: number;
}

export interface EmployeeStatsResponse {
  success: boolean;
  message: string;
  data: {
    period: EmployeeStatsPeriod;
    summary: EmployeeStatsSummary;
  };
}

// Dealer stats (subset needed for dashboard)
export interface DealerStatsPeriod {
  startDate: string | null;
  endDate: string | null;
  isAllTime: boolean;
}

export interface DealerStatsSummary {
  totalDealers: number;
  activeDealers: number;
  deactivatedDealers: number;
  dealersWithUploadAccess: number;
  dealersWithAssignedEmployees: number;
  avgCategoriesPerDealer: number;
}

export interface DealerStatsResponse {
  success: boolean;
  message: string;
  data: {
    period: DealerStatsPeriod;
    summary: DealerStatsSummary;
  };
}

// User counts for bar chart
export interface UserCountsData {
  total: number;
  Users: number;
  Dealers: number;
  SuperAdmins: number;
  FulfillmentAdmins: number;
  FulfillmentStaffs: number;
  InventoryAdmins: number;
  InventoryStaffs: number;
  Customer_Support: number;
}

export interface UserCountsResponse {
  success: boolean;
  message: string;
  data: UserCountsData;
}
