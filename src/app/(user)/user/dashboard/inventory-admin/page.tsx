"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Package, 
  Users, 
  Building, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  FileText,
  DollarSign,
  BarChart3,
  Activity,
  ShoppingCart,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from "lucide-react";
import { useRouter } from "next/navigation";
import { inventoryAdminService, InventoryAdminDashboardData } from "@/service/inventory-admin-service";

export default function InventoryAdminDashboard() {
  const [dashboardData, setDashboardData] = useState<InventoryAdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchInventoryAdminStats();
  }, []);

  const fetchInventoryAdminStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await inventoryAdminService.getDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error("Failed to fetch inventory admin stats:", error);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getGrowthIcon = (value: number) => {
    if (value > 0) return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    if (value < 0) return <ArrowDownRight className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getGrowthColor = (value: number) => {
    if (value > 0) return "text-green-600";
    if (value < 0) return "text-red-600";
    return "text-gray-600";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
          <span>Loading Inventory Admin Dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchInventoryAdminStats} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-600">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Comprehensive overview of products, dealers, and inventory operations</p>
        </div>
        <Button onClick={fetchInventoryAdminStats} variant="outline">
          <Activity className="mr-2 h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.productStats.totalProducts.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getGrowthIcon(dashboardData.summary.monthlyGrowth.products)}
              <span className={`ml-1 ${getGrowthColor(dashboardData.summary.monthlyGrowth.products)}`}>
                {Math.abs(dashboardData.summary.monthlyGrowth.products)}% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Dealers</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.dealerStats.activeDealers}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getGrowthIcon(dashboardData.summary.monthlyGrowth.dealers)}
              <span className={`ml-1 ${getGrowthColor(dashboardData.summary.monthlyGrowth.dealers)}`}>
                {Math.abs(dashboardData.summary.monthlyGrowth.dealers)}% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.requestStats.totalRequests}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getGrowthIcon(dashboardData.summary.monthlyGrowth.requests)}
              <span className={`ml-1 ${getGrowthColor(dashboardData.summary.monthlyGrowth.requests)}`}>
                {Math.abs(dashboardData.summary.monthlyGrowth.requests)}% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardData.summary.totalInventoryValue)}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatCurrency(dashboardData.summary.avgProductPrice)} per product
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Product Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Product Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Live Products</span>
              <Badge variant="default">{dashboardData.productStats.liveProducts}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending Approval</span>
              <Badge variant="secondary">{dashboardData.productStats.pendingProducts}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Approved</span>
              <Badge variant="default">{dashboardData.productStats.approvedProducts}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Rejected</span>
              <Badge variant="destructive">{dashboardData.productStats.rejectedProducts}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Low Stock</span>
              <Badge variant="secondary">{dashboardData.stockAlerts.lowStockCount}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Out of Stock</span>
              <Badge variant="destructive">{dashboardData.stockAlerts.outOfStockCount}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Critical Stock</span>
              <Badge variant="destructive">{dashboardData.stockAlerts.criticalStockCount}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">In Stock</span>
              <Badge variant="default">
                {dashboardData.productStats.totalProducts - dashboardData.stockAlerts.outOfStockCount - dashboardData.stockAlerts.lowStockCount}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Request Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Request Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending</span>
              <Badge variant="secondary">{dashboardData.requestStats.pendingRequests}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">In Review</span>
              <Badge variant="outline">{dashboardData.requestStats.inReviewRequests}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Approved</span>
              <Badge variant="default">{dashboardData.requestStats.approvedRequests}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Rejected</span>
              <Badge variant="destructive">{dashboardData.requestStats.rejectedRequests}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Categories and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Top Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.summary.topCategories.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{category.name}</span>
                    <span className="text-sm text-gray-600">{category.count} products</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress value={category.percentage} className="flex-1" />
                    <span className="text-xs text-gray-500 w-12">{category.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => router.push("/user/dashboard/product")}
            >
              <Package className="mr-2 h-4 w-4" />
              Manage Products
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => router.push("/user/dashboard/requests")}
            >
              <FileText className="mr-2 h-4 w-4" />
              View Requests
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => router.push("/user/dashboard/dealer")}
            >
              <Building className="mr-2 h-4 w-4" />
              Manage Dealers
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => router.push("/user/dashboard/content")}
            >
              <FileText className="mr-2 h-4 w-4" />
              Content Management
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => router.push("/user/dashboard/audit-logs")}
            >
              <Eye className="mr-2 h-4 w-4" />
              Audit Logs
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Dealer Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Building className="mr-2 h-5 w-5" />
            Dealer Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{dashboardData.dealerStats.totalDealers}</div>
              <p className="text-sm text-gray-600">Total Dealers</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{dashboardData.dealerStats.activeDealers}</div>
              <p className="text-sm text-gray-600">Active Dealers</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{dashboardData.dealerStats.dealersWithUploadAccess}</div>
              <p className="text-sm text-gray-600">Upload Access</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{dashboardData.dealerStats.deactivatedDealers}</div>
              <p className="text-sm text-gray-600">Deactivated</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-lg font-semibold">{dashboardData.dealerStats.avgCategoriesPerDealer.toFixed(1)}</div>
              <p className="text-sm text-gray-600">Average Categories per Dealer</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.recentActivity.length > 0 ? (
              dashboardData.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(activity.status)}
                    <div>
                      <p className="font-medium text-sm">{activity.type}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      {activity.actorName && (
                        <p className="text-xs text-gray-500">by {activity.actorName}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(activity.status)}>
                      {activity.status}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No recent activity</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
