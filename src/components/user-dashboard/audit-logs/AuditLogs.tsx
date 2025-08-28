"use client";

import { useState, useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import {
  Search,
  Filter,
  ChevronDown,
  MoreHorizontal,
  AlertTriangle,
  FileText,
  Download,
  Upload,
  Plus,
  Package,
  Users,
  ShoppingCart,
  X,
  Clock,
  User,
  Globe,
  Monitor,
  AlertCircle,
  CheckCircle,
  Info,
  CalendarDays,
} from "lucide-react";
import Cookies from "js-cookie";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";

interface AuditLog {
  _id: string;
  action: string;
  actorId: string;
  actorRole: string;
  actorName: string;
  targetType: string;
  targetId: string;
  details: {
    method: string;
    url: string;
    statusCode: number;
    requestBody?: any;
  };
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  severity: string;
  category: string;
  executionTime: number;
  errorDetails: any;
  createdAt: string;
  updatedAt: string;
}

interface AuditLogsResponse {
  success: boolean;
  message: string;
  data: {
    logs: AuditLog[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export default function AuditLogs() {
  const auth = useAppSelector((state) => state.auth.user);
  const [searchValue, setSearchValue] = useState("");
  const [activeTab, setActiveTab] = useState(
    auth?.role === "Inventory-Admin" ? "products" : 
    auth?.role === "Fulfillment-Admin" ? "orders" : "orders"
  );
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [orderLogs, setOrderLogs] = useState<AuditLog[]>([]);
  const [userLogs, setUserLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Filter states
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedAction, setSelectedAction] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Summary statistics data for different services
  const summaryStats = {
         orders: [
       {
         title: "Order Events",
         value: orderLogs.length.toString(),
         color: "text-blue-600",
         chartColor: "bg-blue-500",
         trend: "up",
       },
       {
         title: "Order Modifications",
         value: orderLogs
           .filter((log) => log.action === "ORDER_UPDATED")
           .length.toString(),
         color: "text-yellow-600",
         chartColor: "bg-yellow-500",
         trend: "up",
       },
       {
         title: "Order Cancellations",
         value: orderLogs
           .filter((log) => log.action === "ORDER_CANCELLED")
           .length.toString(),
         color: "text-red-600",
         chartColor: "bg-red-500",
         trend: "down",
       },
       {
         title: "Order Completions",
         value: orderLogs
           .filter((log) => log.action === "ORDER_COMPLETED")
           .length.toString(),
         color: "text-green-600",
         chartColor: "bg-green-500",
         trend: "up",
       },
     ],
    products: [
      {
        title: "Product Events",
        value: auditLogs.length.toString(),
        color: "text-purple-600",
        chartColor: "bg-purple-500",
        trend: "up",
      },
      {
        title: "Product Updates",
        value: auditLogs
          .filter((log) => log.action === "PRODUCT_UPDATED")
          .length.toString(),
        color: "text-blue-600",
        chartColor: "bg-blue-500",
        trend: "up",
      },
      {
        title: "Product Creations",
        value: auditLogs
          .filter((log) => log.action === "PRODUCT_CREATED")
          .length.toString(),
        color: "text-green-600",
        chartColor: "bg-green-500",
        trend: "up",
      },
      {
        title: "Product Deletions",
        value: auditLogs
          .filter((log) => log.action === "PRODUCT_DELETED")
          .length.toString(),
        color: "text-red-600",
        chartColor: "bg-red-500",
        trend: "down",
      },
    ],
         users: [
       {
         title: "User Events",
         value: userLogs.length.toString(),
         color: "text-indigo-600",
         chartColor: "bg-indigo-500",
         trend: "up",
       },
       {
         title: "Employee Stats Access",
         value: userLogs
           .filter((log) => log.action === "EMPLOYEE_STATS_ACCESSED")
           .length.toString(),
         color: "text-blue-600",
         chartColor: "bg-blue-500",
         trend: "up",
       },
       {
         title: "Login Attempts",
         value: userLogs
           .filter((log) => log.action === "LOGIN_ATTEMPT")
           .length.toString(),
         color: "text-green-600",
         chartColor: "bg-green-500",
         trend: "up",
       },
       {
         title: "Permission Changes",
         value: userLogs
           .filter((log) => log.action === "PERMISSION_CHANGED")
           .length.toString(),
         color: "text-orange-600",
         chartColor: "bg-orange-500",
         trend: "stable",
       },
     ],
  };

  // Fetch audit logs from API
  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      // Get token from cookies using js-cookie
      const token = Cookies.get("token");
      
      if (!token) {
        console.error("No authentication token found in cookies");
        return;
      }
      
      const response = await fetch(
        "http://193.203.161.146:3000/api/category/api/audit/logs",
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include', // Include cookies in the request
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: AuditLogsResponse = await response.json();

      if (data.success) {
        setAuditLogs(data.data.logs);
      } else {
        console.error("Failed to fetch audit logs:", data.message);
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch order audit logs from API
  const fetchOrderLogs = async () => {
    setLoading(true);
    try {
      // Get token from cookies using js-cookie
      const token = Cookies.get("token");
      
      if (!token) {
        console.error("No authentication token found in cookies");
        return;
      }
      
      const response = await fetch(
        "http://193.203.161.146:3000/api/orders/api/analytics/audit-logs",
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include', // Include cookies in the request
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: AuditLogsResponse = await response.json();

      if (data.success) {
        setOrderLogs(data.data.logs);
      } else {
        console.error("Failed to fetch order audit logs:", data.message);
      }
    } catch (error) {
      console.error("Error fetching order audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user audit logs from API
  const fetchUserLogs = async () => {
    setLoading(true);
    try {
      // Get token from cookies using js-cookie
      const token = Cookies.get("token");
      
      if (!token) {
        console.error("No authentication token found in cookies");
        return;
      }
      
      const response = await fetch(
        "http://193.203.161.146:3000/api/users/api/audit/logs",
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include', // Include cookies in the request
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: AuditLogsResponse = await response.json();

      if (data.success) {
        setUserLogs(data.data.logs);
      } else {
        console.error("Failed to fetch user audit logs:", data.message);
      }
    } catch (error) {
      console.error("Error fetching user audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "products") {
      fetchAuditLogs();
    } else if (activeTab === "orders") {
      fetchOrderLogs();
    } else if (activeTab === "users") {
      fetchUserLogs();
    }
  }, [activeTab]);

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusBadge = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          Success
        </Badge>
      );
    } else if (statusCode >= 400 && statusCode < 500) {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          Failed
        </Badge>
      );
    } else if (statusCode >= 500) {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          Error
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          Pending
        </Badge>
      );
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "PRODUCT_UPDATED":
        return <Package className="h-4 w-4 text-blue-500" />;
      case "PRODUCT_CREATED":
        return <Plus className="h-4 w-4 text-green-500" />;
      case "PRODUCT_DELETED":
        return <X className="h-4 w-4 text-red-500" />;
      case "ORDER_CREATED":
        return <ShoppingCart className="h-4 w-4 text-green-500" />;
      case "ORDER_UPDATED":
        return <ShoppingCart className="h-4 w-4 text-blue-500" />;
      case "ORDER_CANCELLED":
        return <X className="h-4 w-4 text-red-500" />;
             case "ORDER_COMPLETED":
         return <CheckCircle className="h-4 w-4 text-green-500" />;
       case "EMPLOYEE_STATS_ACCESSED":
         return <Users className="h-4 w-4 text-blue-500" />;
       case "LOGIN_ATTEMPT":
         return <User className="h-4 w-4 text-green-500" />;
       case "PERMISSION_CHANGED":
         return <AlertCircle className="h-4 w-4 text-orange-500" />;
       default:
         return <FileText className="h-4 w-4 text-gray-500" />;
     }
   };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleLogClick = (log: AuditLog) => {
    setSelectedLog(log);
    setSidebarOpen(true);
  };

  // Get unique actions for current tab
  const getUniqueActions = () => {
    let logs: AuditLog[] = [];
    if (activeTab === "products") logs = auditLogs;
    else if (activeTab === "orders") logs = orderLogs;
    else if (activeTab === "users") logs = userLogs;
    
    return [...new Set(logs.map(log => log.action))];
  };

  // Filter logs based on current filters
  const getFilteredLogs = () => {
    let logs: AuditLog[] = [];
    if (activeTab === "products") logs = auditLogs;
    else if (activeTab === "orders") logs = orderLogs;
    else if (activeTab === "users") logs = userLogs;

    return logs.filter(log => {
      // Date filter
      if (startDate || endDate) {
        const logDate = new Date(log.timestamp);
        if (startDate && logDate < startDate) return false;
        if (endDate && logDate > endDate) return false;
      }

      // Action filter
      if (selectedAction && selectedAction !== "all" && log.action !== selectedAction) return false;

      // Search filter
      if (searchValue) {
        const searchLower = searchValue.toLowerCase();
        return (
          log.action.toLowerCase().includes(searchLower) ||
          log.actorName.toLowerCase().includes(searchLower) ||
          log.targetId.toLowerCase().includes(searchLower) ||
          log.ipAddress.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  };

  // Export filtered data
  const exportFilteredData = () => {
    const filteredLogs = getFilteredLogs();
    const csvContent = [
      // CSV Headers
      "Action,Actor Name,Actor Role,Target Type,Target ID,IP Address,Severity,Timestamp,Status,Execution Time,Category,URL",
      // CSV Data
      ...filteredLogs.map(log => [
        log.action,
        log.actorName,
        log.actorRole,
        log.targetType,
        log.targetId,
        log.ipAddress,
        log.severity,
        log.timestamp,
        log.details.statusCode,
        log.executionTime,
        log.category,
        log.details.url
      ].map(field => `"${field}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${activeTab}_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Clear filters
  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedAction("all");
    setSearchValue("");
  };

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case "orders":
        return "Order Audit Log";
      case "products":
        return "Product Audit Log";
      case "users":
        return "User Audit Log";
      default:
        return "Audit Log";
    }
  };

  const getTabDescription = (tab: string) => {
    switch (tab) {
      case "orders":
        return "Track all order-related activities including status changes, modifications, and cancellations";
      case "products":
        return "Monitor product lifecycle events including creation, updates, deletions, and approvals";
      case "users":
        return "Audit user account activities including logins, permission changes, and security events";
      default:
        return "System audit trail";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
                 {/* Header with Search and Filters */}
         <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
           <div className="relative flex-1 max-w-md">
             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
             <Input
               value={searchValue}
               onChange={(e) => setSearchValue(e.target.value)}
               placeholder={`Find ${activeTab} audit events by ID, user, or action`}
               className="pl-10 bg-white border-gray-200"
             />
           </div>
           <div className="flex items-center gap-2">
             <Button
               variant="outline"
               className="flex items-center gap-2 bg-white border-gray-200"
               onClick={() => setShowFilters(!showFilters)}
             >
               <Filter className="h-4 w-4" />
               Filters
             </Button>
             <Button
               variant="outline"
               className="flex items-center gap-2 bg-white border-gray-200"
               onClick={exportFilteredData}
             >
               <Download className="h-4 w-4" />
               Export
             </Button>
           </div>
         </div>

         {/* Filter Panel */}
         {showFilters && (
           <Card className="bg-white border-gray-200 p-6">
             <div className="flex flex-col lg:flex-row gap-6">
               {/* Date Range Filters */}
               <div className="flex flex-col gap-4 flex-1">
                 <Label className="text-sm font-medium text-gray-700">Date Range</Label>
                 <div className="flex gap-4">
                   <div className="flex-1">
                     <Popover>
                       <PopoverTrigger asChild>
                         <Button
                           variant="outline"
                           className="w-full justify-start text-left font-normal"
                         >
                           <CalendarDays className="mr-2 h-4 w-4" />
                           {startDate ? startDate.toLocaleDateString() : "Start date"}
                         </Button>
                       </PopoverTrigger>
                       <PopoverContent className="w-auto p-0">
                         <Calendar
                           mode="single"
                           selected={startDate}
                           onSelect={setStartDate}
                           initialFocus
                         />
                       </PopoverContent>
                     </Popover>
                   </div>
                   <div className="flex-1">
                     <Popover>
                       <PopoverTrigger asChild>
                         <Button
                           variant="outline"
                           className="w-full justify-start text-left font-normal"
                         >
                           <CalendarDays className="mr-2 h-4 w-4" />
                           {endDate ? endDate.toLocaleDateString() : "End date"}
                         </Button>
                       </PopoverTrigger>
                       <PopoverContent className="w-auto p-0">
                         <Calendar
                           mode="single"
                           selected={endDate}
                           onSelect={setEndDate}
                           initialFocus
                         />
                       </PopoverContent>
                     </Popover>
                   </div>
                 </div>
               </div>

               {/* Action Type Filter */}
               <div className="flex flex-col gap-4 flex-1">
                 <Label className="text-sm font-medium text-gray-700">Action Type</Label>
                                   <Select value={selectedAction} onValueChange={setSelectedAction}>
                    <SelectTrigger className="w-full bg-white border-gray-200">
                      <SelectValue placeholder="All actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All actions</SelectItem>
                      {getUniqueActions().map((action) => (
                        <SelectItem key={action} value={action}>
                          {action.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
               </div>

               {/* Clear Filters */}
               <div className="flex items-end">
                 <Button
                   variant="outline"
                   onClick={clearFilters}
                   className="bg-white border-gray-200"
                 >
                   Clear Filters
                 </Button>
               </div>
             </div>
           </Card>
         )}

         {/* Active Filters Summary */}
                   {(startDate || endDate || (selectedAction && selectedAction !== "all") || searchValue) && (
           <Card className="bg-blue-50 border-blue-200 p-4">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-4">
                 <span className="text-sm font-medium text-blue-800">Active Filters:</span>
                 <div className="flex flex-wrap gap-2">
                   {startDate && (
                     <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                       From: {startDate.toLocaleDateString()}
                     </Badge>
                   )}
                   {endDate && (
                     <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                       To: {endDate.toLocaleDateString()}
                     </Badge>
                   )}
                                       {selectedAction && selectedAction !== "all" && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Action: {selectedAction.replace(/_/g, " ")}
                      </Badge>
                    )}
                   {searchValue && (
                     <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                       Search: "{searchValue}"
                     </Badge>
                   )}
                 </div>
               </div>
               <div className="text-sm text-blue-600">
                 {getFilteredLogs().length} of {activeTab === "products" ? auditLogs.length : activeTab === "orders" ? orderLogs.length : userLogs.length} results
               </div>
             </div>
           </Card>
         )}

        {/* Alert Banner */}
        <div className="bg-black text-white p-4 rounded-lg border-l-4 border-red-500">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">
                  High-risk activity detected: Multiple failed login attempts
                  from IP 203.45.67.89
                </p>
                <p className="text-gray-300 text-sm mt-1">
                  This pattern matches known security threats. Immediate review
                  required.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-white border-white hover:bg-white hover:text-black"
              >
                Escalate for Review
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-white border-white hover:bg-white hover:text-black"
              >
                View Details
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full bg-white border border-gray-200 ${
            auth?.role === "Inventory-Admin" ? "grid-cols-1" : 
            auth?.role === "Fulfillment-Admin" ? "grid-cols-2" : "grid-cols-3"
          }`}>
            {(auth?.role !== "Inventory-Admin") && (
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Orders
              </TabsTrigger>
            )}
            {(auth?.role !== "Inventory-Admin" && auth?.role !== "Fulfillment-Admin") && (
              <TabsTrigger value="products" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Products
              </TabsTrigger>
            )}
            {(auth?.role !== "Inventory-Admin") && (
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
            )}
          </TabsList>

          {(auth?.role === "Inventory-Admin" ? ["products"] : 
            auth?.role === "Fulfillment-Admin" ? ["orders", "users"] : 
            ["orders", "products", "users"]).map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {summaryStats[tab as keyof typeof summaryStats].map(
                  (stat, index) => (
                    <Card key={index} className="bg-white border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              {stat.title}
                            </p>
                            <p className={`text-2xl font-bold ${stat.color}`}>
                              {stat.value}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              last 30 days
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            <div
                              className={`w-8 h-8 rounded ${stat.chartColor} opacity-20`}
                            ></div>
                            <div className="flex space-x-1 mt-2">
                              {[...Array(4)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-1 h-${
                                    Math.floor(Math.random() * 4) + 2
                                  } ${stat.chartColor} rounded`}
                                  style={{
                                    height: `${
                                      Math.floor(Math.random() * 12) + 4
                                    }px`,
                                  }}
                                ></div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>

              {/* Main Content Area */}
              <Card className="bg-white border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {getTabTitle(tab)}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {getTabDescription(tab)}
                      </p>
                    </div>
                                         <div className="flex items-center gap-2">
                       <Button className="flex items-center gap-2">
                         <Plus className="h-4 w-4" />
                         New Audit Event
                       </Button>
                     </div>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-medium text-gray-700">
                          Action
                        </TableHead>
                        <TableHead className="font-medium text-gray-700">
                          Actor
                        </TableHead>
                        <TableHead className="font-medium text-gray-700">
                          Target
                        </TableHead>
                        <TableHead className="font-medium text-gray-700">
                          IP Address
                        </TableHead>
                        <TableHead className="font-medium text-gray-700">
                          Severity
                        </TableHead>
                        <TableHead className="font-medium text-gray-700">
                          Timestamp
                        </TableHead>
                        <TableHead className="font-medium text-gray-700">
                          Status
                        </TableHead>
                        <TableHead className="font-medium text-gray-700">
                          Execution Time
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                                         <TableBody>
                       {tab === "products" &&
                         getFilteredLogs().map((log, index) => (
                           <TableRow
                             key={log._id}
                             className={`${
                               index % 2 === 0 ? "bg-white" : "bg-gray-50"
                             } cursor-pointer hover:bg-gray-100 transition-colors`}
                             onClick={() => handleLogClick(log)}
                           >
                             <TableCell>
                               <div className="flex items-center gap-2">
                                 {getActionIcon(log.action)}
                                 <span className="text-sm">
                                   {log.action.replace(/_/g, " ")}
                                 </span>
                               </div>
                             </TableCell>
                             <TableCell>
                               <div>
                                 <p className="font-medium text-sm">
                                   {log.actorName}
                                 </p>
                                 <p className="text-xs text-gray-500">
                                   {log.actorRole}
                                 </p>
                               </div>
                             </TableCell>
                             <TableCell>
                               <div>
                                 <p className="text-sm">{log.targetType}</p>
                                 <p className="text-xs text-gray-500">
                                   {log.targetId}
                                 </p>
                               </div>
                             </TableCell>
                             <TableCell className="font-mono text-sm">
                               {log.ipAddress}
                             </TableCell>
                             <TableCell>
                               <div className="flex items-center gap-2">
                                 <div
                                   className={`w-2 h-2 rounded-full ${getSeverityColor(
                                     log.severity
                                   )}`}
                                 ></div>
                                 <span className="capitalize text-sm">
                                   {log.severity?.toLowerCase()}
                                 </span>
                               </div>
                             </TableCell>
                             <TableCell className="text-sm text-gray-600">
                               {formatTimestamp(log.timestamp)}
                             </TableCell>
                             <TableCell>
                               {getStatusBadge(log.details.statusCode)}
                             </TableCell>
                             <TableCell className="text-sm text-gray-600">
                               {log.executionTime}ms
                             </TableCell>
                           </TableRow>
                         ))}
                       {tab === "orders" &&
                         getFilteredLogs().map((log, index) => (
                           <TableRow
                             key={log._id}
                             className={`${
                               index % 2 === 0 ? "bg-white" : "bg-gray-50"
                             } cursor-pointer hover:bg-gray-100 transition-colors`}
                             onClick={() => handleLogClick(log)}
                           >
                             <TableCell>
                               <div className="flex items-center gap-2">
                                 {getActionIcon(log.action)}
                                 <span className="text-sm">
                                   {log.action.replace(/_/g, " ")}
                                 </span>
                               </div>
                             </TableCell>
                             <TableCell>
                               <div>
                                 <p className="font-medium text-sm">
                                   {log.actorName}
                                 </p>
                                 <p className="text-xs text-gray-500">
                                   {log.actorRole}
                                 </p>
                               </div>
                             </TableCell>
                             <TableCell>
                               <div>
                                 <p className="text-sm">{log.targetType}</p>
                                 <p className="text-xs text-gray-500">
                                   {log.targetId}
                                 </p>
                               </div>
                             </TableCell>
                             <TableCell className="font-mono text-sm">
                               {log.ipAddress}
                             </TableCell>
                             <TableCell>
                               <div className="flex items-center gap-2">
                                 <div
                                   className={`w-2 h-2 rounded-full ${getSeverityColor(
                                     log.severity
                                   )}`}
                                 ></div>
                                 <span className="capitalize text-sm">
                                   {log.severity?.toLowerCase()}
                                 </span>
                               </div>
                             </TableCell>
                             <TableCell className="text-sm text-gray-600">
                               {formatTimestamp(log.timestamp)}
                             </TableCell>
                             <TableCell>
                               {getStatusBadge(log.details.statusCode)}
                             </TableCell>
                             <TableCell className="text-sm text-gray-600">
                               {log.executionTime}ms
                             </TableCell>
                           </TableRow>
                         ))}
                                                                      {tab === "users" &&
                         getFilteredLogs().map((log, index) => (
                            <TableRow
                              key={log._id}
                              className={`${
                                index % 2 === 0 ? "bg-white" : "bg-gray-50"
                              } cursor-pointer hover:bg-gray-100 transition-colors`}
                              onClick={() => handleLogClick(log)}
                            >
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getActionIcon(log.action)}
                                  <span className="text-sm">
                                    {log.action.replace(/_/g, " ")}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium text-sm">
                                    {log.actorName}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {log.actorRole}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="text-sm">{log.targetType}</p>
                                  <p className="text-xs text-gray-500">
                                    {log.targetId}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="font-mono text-sm">
                                {log.ipAddress}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-2 h-2 rounded-full ${getSeverityColor(
                                      log.severity
                                    )}`}
                                  ></div>
                                  <span className="capitalize text-sm">
                                    {log.severity?.toLowerCase()}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-gray-600">
                                {formatTimestamp(log.timestamp)}
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(log.details.statusCode)}
                              </TableCell>
                              <TableCell className="text-sm text-gray-600">
                                {log.executionTime}ms
                              </TableCell>
                            </TableRow>
                          ))}
                        {tab !== "products" && tab !== "orders" && tab !== "users" && (
                          <TableRow>
                            <TableCell
                              colSpan={8}
                              className="text-center text-gray-500 py-8"
                            >
                              No data available for {tab} tab
                            </TableCell>
                          </TableRow>
                        )}
                     </TableBody>
                  </Table>
                </div>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>

            {/* Details Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent className="w-[700px] sm:w-[700px] overflow-y-auto bg-gray-50">
          <SheetHeader className="bg-white p-6 border-b border-gray-200 -mx-6 -mt-6 mb-6">
            <SheetTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div>Audit Log Details</div>
                <div className="text-sm font-normal text-gray-500 mt-1">
                  Comprehensive information about this audit event
                </div>
              </div>
            </SheetTitle>
          </SheetHeader>
          
          {selectedLog && (
            <ScrollArea className="h-full px-2">
              <div className="space-y-8">
                {/* Basic Information */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Info className="h-5 w-5 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Basic Information
                    </h3>
                  </div>
                  <div className="grid gap-4">
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <Clock className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 mb-1">Timestamp</div>
                        <div className="text-sm text-gray-600">
                          {formatTimestamp(selectedLog.timestamp)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <User className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 mb-1">Actor</div>
                        <div className="text-sm text-gray-600">
                          {selectedLog.actorName}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Role: {selectedLog.actorRole}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <Globe className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 mb-1">IP Address</div>
                        <div className="text-sm font-mono text-gray-600">
                          {selectedLog.ipAddress}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <Monitor className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 mb-1">User Agent</div>
                        <div className="text-xs text-gray-600 break-all">
                          {selectedLog.userAgent}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Details */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Package className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Action Details
                    </h3>
                  </div>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-900">Action</span>
                      </div>
                      <Badge variant="outline" className="px-3 py-1">
                        {selectedLog.action.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-900 mb-1">Target Type</div>
                        <div className="text-sm text-gray-600">{selectedLog.targetType}</div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-900 mb-1">Category</div>
                        <div className="text-sm text-gray-600">{selectedLog.category}</div>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-900 mb-1">Target ID</div>
                      <div className="text-sm font-mono text-gray-600 break-all">
                        {selectedLog.targetId}
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-900">Severity</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getSeverityColor(selectedLog.severity)}`}></div>
                        <span className="text-sm font-medium capitalize">
                          {selectedLog.severity?.toLowerCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Request Details */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Request Details
                    </h3>
                  </div>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-900 mb-1">Method</div>
                        <Badge variant="outline" className="mt-1">
                          {selectedLog.details.method}
                        </Badge>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-900 mb-1">Status</div>
                        <div className="mt-1">
                          {getStatusBadge(selectedLog.details.statusCode)}
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-900 mb-1">URL</div>
                      <div className="text-sm font-mono text-gray-600 break-all">
                        {selectedLog.details.url}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-900 mb-1">Execution Time</div>
                      <div className="text-sm text-gray-600">
                        {selectedLog.executionTime}ms
                      </div>
                    </div>
                  </div>
                </div>

                {selectedLog.details.requestBody && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Request Body
                      </h3>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <pre className="text-xs overflow-x-auto text-gray-700 leading-relaxed">
                        {JSON.stringify(selectedLog.details.requestBody, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {selectedLog.errorDetails && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Error Details
                      </h3>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <pre className="text-xs text-red-800 overflow-x-auto leading-relaxed">
                        {JSON.stringify(selectedLog.errorDetails, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
