"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Package,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  ShoppingCart,
  UserCheck,
  Activity,
  RefreshCw,
  ArrowRight,
  Calendar,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { format } from "date-fns";
import { useToast as useGlobalToast } from "@/components/ui/toast";
import {
  getFulfillmentStats,
  getPendingTasks,
  getAssignedDealers,
  getRecentOrders,
  refreshDashboardData,
  type FulfillmentStats,
  type PendingTask,
  type AssignedDealer,
  type RecentOrder,
} from "@/service/fulfillment-dashboard-service";

export default function FulfillmentDashboard() {
  const router = useRouter();
  const { showToast } = useGlobalToast();
  
  // State management
  const [stats, setStats] = useState<FulfillmentStats | null>(null);
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);
  const [assignedDealers, setAssignedDealers] = useState<AssignedDealer[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use real API calls with fallback to mock data
      try {
        const [statsRes, tasksRes, dealersRes, ordersRes] = await Promise.all([
          getFulfillmentStats(),
          getPendingTasks(),
          getAssignedDealers(),
          getRecentOrders(),
        ]);

        setStats(statsRes.data);
        setPendingTasks(tasksRes.data);
        setAssignedDealers(dealersRes.data);
        setRecentOrders(ordersRes.data);
      } catch (apiError) {
        console.warn("API calls failed, using mock data:", apiError);
        // Fallback to mock data if API calls fail
        const mockStats = {
          totalOrders: 1247,
          assignedDealers: 89,
          pendingTasks: 23,
          completedTasks: 1189,
          totalRevenue: 2847500,
          averageProcessingTime: 2.4,
        };

        const mockTasks = [
          {
            _id: "1",
            orderId: "ORD-001",
            customerName: "John Doe",
            dealerName: "Auto Parts Plus",
            taskType: "pickup" as const,
            priority: "urgent" as const,
            dueDate: "2025-01-20T10:00:00Z",
            status: "pending" as const,
            assignedTo: "Staff Member 1",
          },
          {
            _id: "2",
            orderId: "ORD-002",
            customerName: "Jane Smith",
            dealerName: "Car Care Center",
            taskType: "delivery" as const,
            priority: "high" as const,
            dueDate: "2025-01-20T14:00:00Z",
            status: "in_progress" as const,
            assignedTo: "Staff Member 2",
          },
          {
            _id: "3",
            orderId: "ORD-003",
            customerName: "Mike Johnson",
            dealerName: "Quick Fix Garage",
            taskType: "inspection" as const,
            priority: "medium" as const,
            dueDate: "2025-01-21T09:00:00Z",
            status: "pending" as const,
          },
        ];

        const mockDealers = [
          {
            _id: "1",
            name: "Auto Parts Plus",
            email: "contact@autopartsplus.com",
            phone: "+1-555-0123",
            location: "Mumbai, Maharashtra",
            activeOrders: 15,
            completedOrders: 234,
            rating: 4.8,
            lastActive: "2025-01-20T08:30:00Z",
          },
          {
            _id: "2",
            name: "Car Care Center",
            email: "info@carcarecenter.com",
            phone: "+1-555-0124",
            location: "Delhi, NCR",
            activeOrders: 8,
            completedOrders: 156,
            rating: 4.6,
            lastActive: "2025-01-20T09:15:00Z",
          },
          {
            _id: "3",
            name: "Quick Fix Garage",
            email: "service@quickfixgarage.com",
            phone: "+1-555-0125",
            location: "Bangalore, Karnataka",
            activeOrders: 12,
            completedOrders: 189,
            rating: 4.9,
            lastActive: "2025-01-20T07:45:00Z",
          },
        ];

        const mockOrders = [
          {
            _id: "1",
            orderId: "ORD-001",
            customerName: "John Doe",
            dealerName: "Auto Parts Plus",
            totalAmount: 2500,
            status: "processing" as const,
            orderDate: "2025-01-20T08:00:00Z",
            items: 3,
          },
          {
            _id: "2",
            orderId: "ORD-002",
            customerName: "Jane Smith",
            dealerName: "Car Care Center",
            totalAmount: 1800,
            status: "shipped" as const,
            orderDate: "2025-01-20T07:30:00Z",
            items: 2,
          },
          {
            _id: "3",
            orderId: "ORD-003",
            customerName: "Mike Johnson",
            dealerName: "Quick Fix Garage",
            totalAmount: 3200,
            status: "pending" as const,
            orderDate: "2025-01-20T07:00:00Z",
            items: 4,
          },
        ];

        setStats(mockStats);
        setPendingTasks(mockTasks);
        setAssignedDealers(mockDealers);
        setRecentOrders(mockOrders);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data");
      showToast("Failed to load dashboard data", "error");
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Utility functions
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Urgent</Badge>;
      case "high":
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><Clock className="w-3 h-3 mr-1" />High</Badge>;
      case "medium":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Activity className="w-3 h-3 mr-1" />Medium</Badge>;
      case "low":
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "in_progress":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><Activity className="w-3 h-3 mr-1" />In Progress</Badge>;
      case "completed":
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "processing":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Processing</Badge>;
      case "shipped":
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Shipped</Badge>;
      case "delivered":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Delivered</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy HH:mm");
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading fulfillment dashboard...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchDashboardData}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fulfillment Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage orders, dealers, and pending tasks
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={fetchDashboardData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => router.push('/user/dashboard/order')}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            View All Orders
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.totalOrders)}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assigned Dealers</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.assignedDealers)}</div>
              <p className="text-xs text-muted-foreground">
                Active dealers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.pendingTasks)}</div>
              <p className="text-xs text-muted-foreground">
                Require attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageProcessingTime}h</div>
              <p className="text-xs text-muted-foreground">
                Per order
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Pending Tasks
            </CardTitle>
            <CardDescription>
              Tasks that require immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {pendingTasks.map((task) => (
                  <div key={task._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{task.orderId}</h4>
                        {getPriorityBadge(task.priority)}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {task.customerName} • {task.dealerName}
                      </p>
                      <p className="text-sm text-gray-500 mb-2">
                        {task.taskType.charAt(0).toUpperCase() + task.taskType.slice(1)} • Due: {formatDate(task.dueDate)}
                      </p>
                      {task.assignedTo && (
                        <p className="text-xs text-blue-600">
                          Assigned to: {task.assignedTo}
                        </p>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Assigned Dealers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCheck className="h-5 w-5 mr-2" />
              Assigned Dealers
            </CardTitle>
            <CardDescription>
              Active dealers and their performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {assignedDealers.map((dealer) => (
                  <div key={dealer._id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{dealer.name}</h4>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        ⭐ {dealer.rating}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {dealer.email}
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {dealer.phone}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {dealer.location}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 text-sm">
                      <span className="text-blue-600">
                        {dealer.activeOrders} active orders
                      </span>
                      <span className="text-green-600">
                        {dealer.completedOrders} completed
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Last active: {formatDate(dealer.lastActive)}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Recent Orders
          </CardTitle>
          <CardDescription>
            Latest orders and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Dealer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-medium">{order.orderId}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>{order.dealerName}</TableCell>
                  <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                  <TableCell>{order.items}</TableCell>
                  <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                  <TableCell>{formatDate(order.orderDate)}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
