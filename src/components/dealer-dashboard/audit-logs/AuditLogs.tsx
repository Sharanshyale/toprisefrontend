"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
  ShoppingCart
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AuditLogs() {
  const [searchValue, setSearchValue] = useState("")
  const [activeTab, setActiveTab] = useState("orders")

  // Summary statistics data for different services (dealer-specific)
  const summaryStats = {
    orders: [
      {
        title: "Order Events",
        value: "234",
        color: "text-blue-600",
        chartColor: "bg-blue-500",
        trend: "up"
      },
      {
        title: "Order Updates",
        value: "156",
        color: "text-yellow-600",
        chartColor: "bg-yellow-500",
        trend: "up"
      },
      {
        title: "Order Cancellations",
        value: "12",
        color: "text-red-600",
        chartColor: "bg-red-500",
        trend: "down"
      },
      {
        title: "Order Completions",
        value: "66",
        color: "text-green-600",
        chartColor: "bg-green-500",
        trend: "up"
      }
    ],
    products: [
      {
        title: "Product Events",
        value: "456",
        color: "text-purple-600",
        chartColor: "bg-purple-500",
        trend: "up"
      },
      {
        title: "Product Submissions",
        value: "234",
        color: "text-blue-600",
        chartColor: "bg-blue-500",
        trend: "up"
      },
      {
        title: "Product Updates",
        value: "189",
        color: "text-yellow-600",
        chartColor: "bg-yellow-500",
        trend: "up"
      },
      {
        title: "Product Approvals",
        value: "33",
        color: "text-green-600",
        chartColor: "bg-green-500",
        trend: "stable"
      }
    ],
    users: [
      {
        title: "User Events",
        value: "123",
        color: "text-indigo-600",
        chartColor: "bg-indigo-500",
        trend: "up"
      },
      {
        title: "Login Attempts",
        value: "89",
        color: "text-blue-600",
        chartColor: "bg-blue-500",
        trend: "up"
      },
      {
        title: "Failed Logins",
        value: "12",
        color: "text-red-600",
        chartColor: "bg-red-500",
        trend: "down"
      },
      {
        title: "Profile Updates",
        value: "22",
        color: "text-orange-600",
        chartColor: "bg-orange-500",
        trend: "stable"
      }
    ]
  }

  // Sample dealer audit log data for different services
  const auditLogs = {
    orders: [
      {
        id: "DEALER-ORD-AUD-20240218-00123",
        user: "Dealer001",
        action: "Order Status Update",
        resource: "Order #ORD-12345",
        ipAddress: "192.168.1.100",
        severity: "low",
        timestamp: "2024-02-18 14:30:25",
        status: "success",
        details: "Updated order status to Ready for Pickup"
      },
      {
        id: "DEALER-ORD-AUD-20240218-00124",
        user: "Dealer002",
        action: "Order Assignment",
        resource: "Order #ORD-12346",
        ipAddress: "192.168.1.101",
        severity: "medium",
        timestamp: "2024-02-18 14:25:10",
        status: "success",
        details: "Assigned order to pickup team"
      },
      {
        id: "DEALER-ORD-AUD-20240218-00125",
        user: "Dealer003",
        action: "Order Cancellation",
        resource: "Order #ORD-12347",
        ipAddress: "192.168.1.102",
        severity: "high",
        timestamp: "2024-02-18 14:20:15",
        status: "success",
        details: "Cancelled due to inventory unavailability"
      },
      {
        id: "DEALER-ORD-AUD-20240218-00126",
        user: "System",
        action: "Order Auto-Assignment",
        resource: "Order #ORD-12348",
        ipAddress: "127.0.0.1",
        severity: "low",
        timestamp: "2024-02-18 14:15:00",
        status: "success",
        details: "Automatically assigned to nearest dealer"
      }
    ],
    products: [
      {
        id: "DEALER-PROD-AUD-20240218-00123",
        user: "Dealer001",
        action: "Product Submission",
        resource: "Product #PROD-789",
        ipAddress: "192.168.1.103",
        severity: "low",
        timestamp: "2024-02-18 14:30:25",
        status: "success",
        details: "Submitted new product: Samsung Galaxy S24"
      },
      {
        id: "DEALER-PROD-AUD-20240218-00124",
        user: "Dealer002",
        action: "Product Update",
        resource: "Product #PROD-790",
        ipAddress: "192.168.1.104",
        severity: "medium",
        timestamp: "2024-02-18 14:25:10",
        status: "success",
        details: "Updated product description and images"
      },
      {
        id: "DEALER-PROD-AUD-20240218-00125",
        user: "Dealer003",
        action: "Bulk Product Upload",
        resource: "Product Import",
        ipAddress: "192.168.1.105",
        severity: "high",
        timestamp: "2024-02-18 14:20:15",
        status: "success",
        details: "Uploaded 50 new products via CSV"
      },
      {
        id: "DEALER-PROD-AUD-20240218-00126",
        user: "Dealer004",
        action: "Product Deactivation",
        resource: "Product #PROD-791",
        ipAddress: "192.168.1.106",
        severity: "medium",
        timestamp: "2024-02-18 14:15:00",
        status: "success",
        details: "Deactivated out-of-stock product"
      }
    ],
    users: [
      {
        id: "DEALER-USER-AUD-20240218-00123",
        user: "Dealer001",
        action: "Profile Update",
        resource: "Profile Management",
        ipAddress: "192.168.1.107",
        severity: "low",
        timestamp: "2024-02-18 14:30:25",
        status: "success",
        details: "Updated contact information"
      },
      {
        id: "DEALER-USER-AUD-20240218-00124",
        user: "System",
        action: "Failed Login Attempt",
        resource: "Authentication",
        ipAddress: "203.45.67.89",
        severity: "high",
        timestamp: "2024-02-18 14:25:10",
        status: "failed",
        details: "Multiple failed attempts from suspicious IP"
      },
      {
        id: "DEALER-USER-AUD-20240218-00125",
        user: "Dealer002",
        action: "Password Change",
        resource: "Security",
        ipAddress: "192.168.1.108",
        severity: "medium",
        timestamp: "2024-02-18 14:20:15",
        status: "success",
        details: "Password changed successfully"
      },
      {
        id: "DEALER-USER-AUD-20240218-00126",
        user: "Dealer003",
        action: "Account Settings Update",
        resource: "Account Management",
        ipAddress: "192.168.1.109",
        severity: "low",
        timestamp: "2024-02-18 14:15:00",
        status: "success",
        details: "Updated notification preferences"
      }
    ]
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Success</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>
    }
  }

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case "orders":
        return "Dealer Order Audit Log"
      case "products":
        return "Dealer Product Audit Log"
      case "users":
        return "Dealer User Audit Log"
      default:
        return "Dealer Audit Log"
    }
  }

  const getTabDescription = (tab: string) => {
    switch (tab) {
      case "orders":
        return "Track all dealer order-related activities including status updates, assignments, and cancellations"
      case "products":
        return "Monitor dealer product lifecycle events including submissions, updates, and approvals"
      case "users":
        return "Audit dealer account activities including profile updates, security events, and settings changes"
      default:
        return "Dealer system audit trail"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Search */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={`Find dealer ${activeTab} audit events by ID, user, or action`}
              className="pl-10 bg-white border-gray-200"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="flex items-center gap-2 bg-white border-gray-200">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Select>
              <SelectTrigger className="w-40 bg-white border-gray-200">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="timestamp">Timestamp</SelectItem>
                <SelectItem value="severity">Severity</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="action">Action</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Alert Banner */}
        <div className="bg-black text-white p-4 rounded-lg border-l-4 border-red-500">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">
                  Suspicious activity detected: Multiple failed login attempts from dealer account
                </p>
                <p className="text-gray-300 text-sm mt-1">
                  This pattern requires immediate review by admin team.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-white border-white hover:bg-white hover:text-black">
                Escalate for Review
              </Button>
              <Button variant="outline" size="sm" className="text-white border-white hover:bg-white hover:text-black">
                View Details
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
          </TabsList>

          {["orders", "products", "users"].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {summaryStats[tab as keyof typeof summaryStats].map((stat, index) => (
                  <Card key={index} className="bg-white border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                          <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                          <p className="text-xs text-gray-500 mt-1">last 30 days</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className={`w-8 h-8 rounded ${stat.chartColor} opacity-20`}></div>
                          <div className="flex space-x-1 mt-2">
                            {[...Array(4)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-1 h-${Math.floor(Math.random() * 4) + 2} ${stat.chartColor} rounded`}
                                style={{ height: `${Math.floor(Math.random() * 12) + 4}px` }}
                              ></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Main Content Area */}
              <Card className="bg-white border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{getTabTitle(tab)}</h2>
                      <p className="text-sm text-gray-600 mt-1">{getTabDescription(tab)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" className="flex items-center gap-2 bg-white border-gray-200">
                        <Filter className="h-4 w-4" />
                        Filter
                      </Button>
                      <Select>
                        <SelectTrigger className="w-32 bg-white border-gray-200">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="timestamp">Timestamp</SelectItem>
                          <SelectItem value="severity">Severity</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        New Audit Event
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2 bg-white border-gray-200">
                        <Download className="h-4 w-4" />
                        Export
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-medium text-gray-700">Audit ID</TableHead>
                        <TableHead className="font-medium text-gray-700">Dealer ID</TableHead>
                        <TableHead className="font-medium text-gray-700">Action</TableHead>
                        <TableHead className="font-medium text-gray-700">Resource</TableHead>
                        <TableHead className="font-medium text-gray-700">IP Address</TableHead>
                        <TableHead className="font-medium text-gray-700">Severity</TableHead>
                        <TableHead className="font-medium text-gray-700">Timestamp</TableHead>
                        <TableHead className="font-medium text-gray-700">Status</TableHead>
                        <TableHead className="font-medium text-gray-700">Details</TableHead>
                        <TableHead className="font-medium text-gray-700">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs[tab as keyof typeof auditLogs].map((log, index) => (
                        <TableRow key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <TableCell className="font-mono text-sm">{log.id}</TableCell>
                          <TableCell className="font-medium">{log.user}</TableCell>
                          <TableCell>{log.action}</TableCell>
                          <TableCell>{log.resource}</TableCell>
                          <TableCell className="font-mono text-sm">{log.ipAddress}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${getSeverityColor(log.severity)}`}></div>
                              <span className="capitalize">{log.severity}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">{log.timestamp}</TableCell>
                          <TableCell>{getStatusBadge(log.status)}</TableCell>
                          <TableCell className="text-sm text-gray-600 max-w-xs truncate" title={log.details}>
                            {log.details}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
