"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  Package,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  RefreshCw,
  BarChart3,
  Activity,
  Target,
  Calendar,
  Filter,
} from "lucide-react";
import apiClient from "@/apiClient";
import { getDealerStats } from "@/service/dealerServices";

// Interfaces for API responses
interface SLAViolationSummary {
  totalViolations: number;
  totalViolationMinutes: number;
  avgViolationMinutes: number;
  maxViolationMinutes: number;
  resolvedViolations: number;
  unresolvedViolations: number;
  uniqueDealerCount: number;
  uniqueOrderCount: number;
  resolutionRate: number;
}

interface DealerWithViolations {
  dealerId: string;
  dealerInfo: {
    _id: string;
    trade_name: string;
    legal_name: string;
    email: string;
    assignedEmployees: Array<{
      employeeId: string;
      assignedAt: string;
      status: string;
      employeeDetails: {
        _id: string;
        name: string;
        email: string;
        role: string;
      };
    }>;
    employeeCount: number;
  };
  totalViolations: number;
  totalViolationMinutes: number;
  avgViolationMinutes: number;
  maxViolationMinutes: number;
  resolvedViolations: number;
  unresolvedViolations: number;
  firstViolation: string;
  lastViolation: string;
  violationRate: number;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  userGrowth: number;
  roleDistribution: {
    "Super-admin": number;
    "Fulfillment-Admin": number;
    "Fulfillment-Staff": number;
    "Inventory-Admin": number;
    "Inventory-Staff": number;
    Dealer: number;
    User: number;
    "Customer-Support": number;
  };
  recentActivity: {
    newUsers: number;
    activeUsers: number;
    loginCount: number;
  };
}

interface DealerStats {
  totalDealers: number;
  activeDealers: number;
  inactiveDealers: number;
  averageOrdersPerDealer: number;
  topPerformers: Array<{
    dealerId: string;
    dealerName: string;
    orderCount: number;
    totalRevenue: number;
    slaCompliance: number;
  }>;
}

interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  roleDistribution: {
    "Fulfillment-Staff": number;
    "Fulfillment-Admin": number;
    "Inventory-Staff": number;
    "Inventory-Admin": number;
    "Customer-Support": number;
  };
  performanceMetrics: {
    averageOrdersHandled: number;
    averageResolutionTime: number;
    satisfactionScore: number;
  };
}

interface OrderAnalytics {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
  totalRevenue: number;
  orderGrowth: number;
  fulfillmentRate: number;
}

interface AuditLog {
  _id: string;
  action: string;
  actorId: string;
  actorRole: string;
  actorName: string;
  targetId: string;
  targetIdentifier?: string;
  details: any;
  category: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [slaSummary, setSlaSummary] = useState<SLAViolationSummary | null>(
    null
  );
  const [dealersWithViolations, setDealersWithViolations] = useState<
    DealerWithViolations[]
  >([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [dealerStats, setDealerStats] = useState<DealerStats | null>(null);
  const [employeeStats, setEmployeeStats] = useState<EmployeeStats | null>(
    null
  );
  const [orderAnalytics, setOrderAnalytics] = useState<OrderAnalytics | null>(
    null
  );
  const [recentAuditLogs, setRecentAuditLogs] = useState<AuditLog[]>([]);

  // Filter states
  const [dateRange, setDateRange] = useState("30d");
  const [selectedService, setSelectedService] = useState("all");

  // API Functions
  const fetchSLAViolationSummary = async () => {
    try {
      const response = await apiClient.get(
        `/orders/api/sla-violations/summary?includeDetails=true`
      );
      
      if (response.data.success) {
        setSlaSummary(response.data.data.summary);
      }
    } catch (error) {
      console.error("Error fetching SLA summary:", error);
    }
  };

  const fetchDealersWithViolations = async () => {
    try {
      const response = await apiClient.get(
        `/orders/api/sla-violations/multiple-violations?includeDetails=true`
      );
      
      if (response.data.success) {
        setDealersWithViolations(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching dealers with violations:", error);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await apiClient.get(`/users/api/users/stats`);
      
      if (response.data.success) {
        setUserStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  const fetchDealerStats = async () => {
    try {
      const response = await apiClient.get(`/users/api/users/dealer/stats`);
      
      if (response.data.success) {
        setDealerStats(response.data.data);
      }
    } catch (error: any) {
      console.error("Error fetching dealer stats:", error);
      
      // Handle the schema registration error specifically
      if (error?.response?.data?.message?.includes("Schema hasn't been registered for model")) {
        console.warn("Dealer model not registered in user service. Trying alternative approach.");
        
        try {
          // Try alternative dealer stats endpoint
          const altResponse = await getDealerStats();
          if (altResponse.success) {
            setDealerStats(altResponse.data);
          } else {
            // Set fallback dealer stats data
            setDealerStats({
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
            });
          }
        } catch (altError) {
          console.error("Alternative dealer stats also failed:", altError);
          // Set fallback dealer stats data
          setDealerStats({
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
          });
        }
      }
    }
  };

  const fetchEmployeeStats = async () => {
    try {
      const response = await apiClient.get(`/users/api/users/employee/stats`);
      
      if (response.data.success) {
        setEmployeeStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching employee stats:", error);
    }
  };

  const fetchOrderAnalytics = async () => {
    try {
      const response = await apiClient.get(
        `/orders/api/analytics/orders?startDate=2024-01-01&endDate=2024-12-31`
      );
      
      if (response.data.success) {
        setOrderAnalytics(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching order analytics:", error);
    }
  };

  const fetchRecentAuditLogs = async () => {
    try {
      const response = await apiClient.get(
        `/orders/api/orders/audit-logs?page=1&limit=10`
      );
      
      if (response.data.success) {
        setRecentAuditLogs(response.data.data.logs || []);
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchSLAViolationSummary(),
        fetchDealersWithViolations(),
        fetchUserStats(),
        fetchDealerStats(),
        fetchEmployeeStats(),
        fetchOrderAnalytics(),
        fetchRecentAuditLogs(),
      ]);
    } catch (error) {
      setError("Failed to load reports data. Please try again.");
      console.error("Error fetching reports data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "completed":
      case "resolved":
        return "bg-green-100 text-green-800";
      case "pending":
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
      case "cancelled":
      case "unresolved":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "ORDER_CREATED":
        return <ShoppingCart className="h-4 w-4" />;
      case "USER_CREATED":
        return <Users className="h-4 w-4" />;
      case "PRODUCT_UPDATED":
        return <Package className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading reports...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchAllData}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Reports & Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive insights and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchAllData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sla">SLA Violations</TabsTrigger>
          <TabsTrigger value="users">Users & Dealers</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total SLA Violations
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(slaSummary?.totalViolations || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {slaSummary?.unresolvedViolations || 0} unresolved
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(userStats?.totalUsers || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(userStats?.activeUsers || 0)} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Orders
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(orderAnalytics?.totalOrders || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(orderAnalytics?.totalRevenue || 0)} revenue
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Resolution Rate
                </CardTitle>
                <Target className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPercentage(slaSummary?.resolutionRate || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  SLA compliance rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Detailed Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
                <CardDescription>Breakdown by user roles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userStats?.roleDistribution &&
                    Object.entries(userStats.roleDistribution).map(
                      ([role, count]) => (
                        <div
                          key={role}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm font-medium">{role}</span>
                          <Badge variant="secondary">
                            {formatNumber(count)}
                          </Badge>
                        </div>
                      )
                    )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Last 30 days activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">New Users</span>
                    <Badge variant="outline">
                      {formatNumber(userStats?.recentActivity?.newUsers || 0)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Active Users</span>
                    <Badge variant="outline">
                      {formatNumber(
                        userStats?.recentActivity?.activeUsers || 0
                      )}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Login Count</span>
                    <Badge variant="outline">
                      {formatNumber(userStats?.recentActivity?.loginCount || 0)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SLA Violations Tab */}
        <TabsContent value="sla" className="space-y-6">
          {/* SLA Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Average Violation Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(slaSummary?.avgViolationMinutes || 0)} min
                </div>
                <p className="text-xs text-muted-foreground">per violation</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Total Violation Minutes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(slaSummary?.totalViolationMinutes || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  cumulative minutes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Affected Dealers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(slaSummary?.uniqueDealerCount || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  dealers with violations
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Dealers with Violations Table */}
          <Card>
            <CardHeader>
              <CardTitle>Dealers with Multiple Violations</CardTitle>
              <CardDescription>Dealers requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dealer</TableHead>
                      <TableHead>Total Violations</TableHead>
                      <TableHead>Avg Time (min)</TableHead>
                      <TableHead>Resolved</TableHead>
                      <TableHead>Unresolved</TableHead>
                      <TableHead>Violation Rate</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dealersWithViolations.map((dealer) => (
                      <TableRow key={dealer.dealerId}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {dealer.dealerInfo?.trade_name ||
                                "Unknown Dealer"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {dealer.dealerInfo?.email || "No email"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatNumber(dealer.totalViolations)}
                        </TableCell>
                        <TableCell>
                          {formatNumber(dealer.avgViolationMinutes)}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">
                            {formatNumber(dealer.resolvedViolations)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-red-100 text-red-800">
                            {formatNumber(dealer.unresolvedViolations)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatPercentage(dealer.violationRate)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              dealer.unresolvedViolations > 0
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }
                          >
                            {dealer.unresolvedViolations > 0
                              ? "Needs Attention"
                              : "Resolved"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users & Dealers Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>User Statistics</CardTitle>
                <CardDescription>Comprehensive user analytics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatNumber(userStats?.totalUsers || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Users
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatNumber(userStats?.activeUsers || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Active Users
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">User Growth</span>
                    <Badge
                      variant={
                        userStats?.userGrowth && userStats.userGrowth > 0
                          ? "default"
                          : "destructive"
                      }
                    >
                      {userStats?.userGrowth
                        ? (userStats.userGrowth > 0 ? "+" : "") +
                          formatPercentage(userStats.userGrowth)
                        : "0%"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dealer Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Dealer Statistics</CardTitle>
                <CardDescription>Dealer performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatNumber(dealerStats?.totalDealers || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Dealers
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatNumber(dealerStats?.activeDealers || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Active Dealers
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg Orders per Dealer</span>
                    <span className="font-medium">
                      {formatNumber(dealerStats?.averageOrdersPerDealer || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Employee Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Employee Performance</CardTitle>
              <CardDescription>Staff analytics and metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {formatNumber(employeeStats?.totalEmployees || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Employees
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {formatNumber(
                      employeeStats?.performanceMetrics?.averageOrdersHandled ||
                        0
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Avg Orders Handled
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {formatNumber(
                      employeeStats?.performanceMetrics
                        ?.averageResolutionTime || 0
                    )}
                    h
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Avg Resolution Time
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          {/* Order Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Completed Orders
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(orderAnalytics?.completedOrders || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {orderAnalytics?.fulfillmentRate
                    ? formatPercentage(orderAnalytics.fulfillmentRate)
                    : "0%"}{" "}
                  fulfillment rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Orders
                </CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(orderAnalytics?.pendingOrders || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  awaiting processing
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Order Value
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(orderAnalytics?.averageOrderValue || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {orderAnalytics?.orderGrowth
                    ? (orderAnalytics.orderGrowth > 0 ? "+" : "") +
                      formatPercentage(orderAnalytics.orderGrowth)
                    : "0%"}{" "}
                  growth
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(orderAnalytics?.totalRevenue || 0)}
                </div>
                <p className="text-xs text-muted-foreground">total revenue</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Audit Logs</CardTitle>
              <CardDescription>
                Latest system activities and changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Actor</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentAuditLogs.map((log) => (
                      <TableRow key={log._id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getActionIcon(log.action)}
                            <span className="font-medium">{log.action}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{log.actorName}</div>
                            <div className="text-sm text-muted-foreground">
                              {log.actorRole}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {log.targetIdentifier || log.targetId}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {log.targetId}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(log.timestamp).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-mono">
                            {log.ipAddress}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
