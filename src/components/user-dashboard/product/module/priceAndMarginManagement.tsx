"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTokenPayload } from "@/utils/cookies";
import {
  Search,
  Filter,
  ChevronDown,
  Upload,
  Plus,
  MoreHorizontal,
  FileUp,
  PlusIcon,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { EditIcon } from "@/components/ui/TicketIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import addSquare from "../../../../../public/assets/addSquare.svg";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect } from "react";
import Image from "next/image";
import { getProducts } from "@/service/product-Service";
import slaViolationsService from "@/service/slaViolations-Service";

// Types for SLA Violations
interface SLAViolation {
  _id: string;
  dealer_id: string;
  order_id: string;
  violation_minutes: number;
  resolved: boolean;
  resolved_at?: string;
  resolution_notes?: string;
  created_at: string;
  dealerInfo?: {
    trade_name: string;
    legal_name: string;
    is_active: boolean;
  };
}

interface DealerWithViolations {
  dealerId: string;
  dealerInfo: {
    trade_name: string;
    legal_name: string;
    is_active: boolean;
  };
  violationStats: {
    totalViolations: number;
    totalViolationMinutes: number;
    avgViolationMinutes: number;
    maxViolationMinutes: number;
    unresolvedViolations: number;
    firstViolation: string;
    lastViolation: string;
    violationDates: string[];
  };
  riskLevel: "High" | "Medium" | "Low";
  eligibleForDisable: boolean;
}

interface DashboardData {
  quickStats: {
    totalViolations: number;
    totalViolationMinutes: number;
    avgViolationMinutes: number;
    maxViolationMinutes: number;
    resolvedViolations: number;
    unresolvedViolations: number;
    uniqueDealerCount: number;
    resolutionRate: number;
  };
  dealersWithViolations: {
    totalDealers: number;
    highRiskDealers: number;
    mediumRiskDealers: number;
    eligibleForDisable: number;
  };
  topViolators: Array<{
    rank: number;
    dealerId: string;
    dealerInfo: {
      trade_name: string;
    };
    stats: {
      totalViolations: number;
      avgViolationMinutes: number;
    };
    riskLevel: string;
  }>;
  trends: {
    period: string;
    summary: {
      totalViolations: number;
      avgViolationsPerDay: number;
    };
  };
  lastUpdated: string;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Met":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="w-3 h-3 mr-1" />
          {status}
        </Badge>
      );
    case "Violated":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          <XCircle className="w-3 h-3 mr-1" />
          {status}
        </Badge>
      );
    case "Pending":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <Clock className="w-3 h-3 mr-1" />
          {status}
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "Critical":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          {priority}
        </Badge>
      );
    case "High":
      return (
        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
          {priority}
        </Badge>
      );
    case "Medium":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          {priority}
        </Badge>
      );
    case "Low":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          {priority}
        </Badge>
      );
    default:
      return <Badge variant="secondary">{priority}</Badge>;
  }
};

export default function SLAViolationsAndReporting() {
  const route = useRouter();
  const payload = getTokenPayload();
  const isAllowed = payload?.role === "Inventory-Admin" || payload?.role === "Super-admin";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedViolationIds, setSelectedViolationIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("tabular");
  
  // Data states
  const [dashboardData, setDashboardData] = useState<DashboardData | null>({
    quickStats: {
      totalViolations: 0,
      totalViolationMinutes: 0,
      avgViolationMinutes: 0,
      maxViolationMinutes: 0,
      resolvedViolations: 0,
      unresolvedViolations: 0,
      uniqueDealerCount: 0,
      resolutionRate: 0,
    },
    dealersWithViolations: {
      totalDealers: 0,
      highRiskDealers: 0,
      mediumRiskDealers: 0,
      eligibleForDisable: 0,
    },
    topViolators: [],
    trends: {
      period: "30d",
      summary: {
        totalViolations: 0,
        avgViolationsPerDay: 0,
      },
    },
    lastUpdated: new Date().toISOString(),
  });
  const [dealersWithViolations, setDealersWithViolations] = useState<DealerWithViolations[]>([]);
  const [topViolators, setTopViolators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Action states
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState<DealerWithViolations | null>(null);
  const [disableReason, setDisableReason] = useState("");
  const [disableNotes, setDisableNotes] = useState("");
  const [showBulkDisableModal, setShowBulkDisableModal] = useState(false);
  const [bulkDisableReason, setBulkDisableReason] = useState("");
  const [bulkDisableNotes, setBulkDisableNotes] = useState("");

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allViolationIds = dealersWithViolations.map((dealer) => dealer.dealerId);
      setSelectedViolationIds(allViolationIds);
    } else {
      setSelectedViolationIds([]);
    }
  };

  const handleSelectViolation = (event: React.ChangeEvent<HTMLInputElement>, id: string) => {
    if (event.target.checked) {
      setSelectedViolationIds((prev) => [...prev, id]);
    } else {
      setSelectedViolationIds((prev) => prev.filter((violationId) => violationId !== id));
    }
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await slaViolationsService.getDashboard();
      if (response.success && response.data) {
        setDashboardData(response.data);
      } else {
        console.warn("Dashboard API response:", response);
        setError("Invalid dashboard data received");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch dealers with violations
  const fetchDealersWithViolations = async () => {
    try {
      const response = await slaViolationsService.getDealersWithViolations();
      if (response.success && response.data?.dealers) {
        setDealersWithViolations(response.data.dealers);
      } else {
        console.warn("Dealers API response:", response);
        setDealersWithViolations([]);
      }
    } catch (error) {
      console.error("Error fetching dealers with violations:", error);
      setDealersWithViolations([]);
    }
  };

  // Fetch top violators
  const fetchTopViolators = async () => {
    try {
      const response = await slaViolationsService.getTopViolators({ limit: 10 });
      if (response.success && response.data) {
        setTopViolators(response.data);
      } else {
        console.warn("Top violators API response:", response);
        setTopViolators([]);
      }
    } catch (error) {
      console.error("Error fetching top violators:", error);
      setTopViolators([]);
    }
  };

  // Disable dealer
  const handleDisableDealer = async () => {
    if (!selectedDealer) return;
    
    try {
      const response = await slaViolationsService.disableDealer(selectedDealer.dealerId, {
        reason: disableReason,
        adminNotes: disableNotes,
      });
      
      if (response.success) {
        setShowDisableModal(false);
        setSelectedDealer(null);
        setDisableReason("");
        setDisableNotes("");
        // Refresh data
        fetchDashboardData();
        fetchDealersWithViolations();
      }
    } catch (error) {
      console.error("Error disabling dealer:", error);
    }
  };

  // Bulk disable dealers
  const handleBulkDisableDealers = async () => {
    try {
      const response = await slaViolationsService.bulkDisableDealers({
        dealerIds: selectedViolationIds,
        reason: bulkDisableReason,
        adminNotes: bulkDisableNotes,
      });
      
      if (response.success) {
        setShowBulkDisableModal(false);
        setSelectedViolationIds([]);
        setBulkDisableReason("");
        setBulkDisableNotes("");
        // Refresh data
        fetchDashboardData();
        fetchDealersWithViolations();
      }
    } catch (error) {
      console.error("Error bulk disabling dealers:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchDealersWithViolations();
    fetchTopViolators();
  }, []);
  
  const handleExportReport = () => {
    // Handle export functionality
    console.log("Exporting SLA violations report");
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 font-sans">
              SLA Violations & Reporting
            </h1>
            <p className="text-base font-medium font-sans text-gray-500">
              Monitor and analyze Service Level Agreement violations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => {
                fetchDashboardData();
                fetchDealersWithViolations();
                fetchTopViolators();
              }}
              disabled={loading}
            >
              <div className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}>
                {loading ? (
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                ) : (
                  <TrendingUp className="w-4 h-4" />
                )}
              </div>
              Refresh
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleExportReport}
            >
              <FileUp className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-red-800 font-medium">Error</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => setError(null)}
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Violations</p>
                <p className="text-2xl font-bold text-red-600">
                  {loading ? "..." : dashboardData?.quickStats?.totalViolations || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {dashboardData?.quickStats?.resolutionRate ? `${100 - dashboardData.quickStats.resolutionRate}% violation rate` : "Loading..."}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolution Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {loading ? "..." : `${dashboardData?.quickStats?.resolutionRate || 0}%`}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {dashboardData?.quickStats?.resolvedViolations || 0} resolved violations
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Violation Time</p>
                <p className="text-2xl font-bold text-orange-600">
                  {loading ? "..." : `${dashboardData?.quickStats?.avgViolationMinutes || 0}m`}
                </p>
                <p className="text-xs text-gray-500 mt-1">Minutes over SLA</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Risk Dealers</p>
                <p className="text-2xl font-bold text-red-700">
                  {loading ? "..." : dashboardData?.dealersWithViolations?.highRiskDealers || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Require immediate attention</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-red-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white border border-gray-200">
          <TabsTrigger value="tabular" className="flex items-center gap-2">
            <Table className="h-4 w-4" />
            Tabular View
          </TabsTrigger>
          <TabsTrigger value="statistical" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Statistical View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tabular" className="space-y-6">
          <Card className="shadow-sm rounded-none">
            <CardHeader className="space-y-6">
              {/* Search and Actions Row */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                {/* Left Side - Search and Filters */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
                  {/* Search Bar */}
                  <div className="relative w-full sm:w-80 lg:w-96">
                    <div className="flex items-center gap-2 h-10 rounded-lg bg-[#EBEBEB] px-3 py-2">
                      <Search className="h-4 w-4 text-[#737373] flex-shrink-0" />
                      <Input
                        placeholder="Search SLA violations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[#737373] placeholder:text-[#737373] h-auto p-0"
                      />
                    </div>
                  </div>

                  {/* Filter Buttons */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 bg-transparent border-gray-300 hover:bg-gray-50 min-w-[100px]"
                    >
                      <Filter className="h-4 w-4" />
                      <span className="b3 font-poppins">Filters</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>

            {/* Dealers with Violations Table */}
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow className="border-b border-[#E5E5E5] bg-gray-50/50">
                      <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left">
                        <input type="checkbox" onChange={handleSelectAll} />
                      </TableHead>
                      <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left">
                        Dealer ID
                      </TableHead>
                      <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[200px]">
                        Dealer Name
                      </TableHead>
                      <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[120px]">
                        Total Violations
                      </TableHead>
                      <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[120px]">
                        Avg Violation Time
                      </TableHead>
                      <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[120px]">
                        Unresolved
                      </TableHead>
                      <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[100px]">
                        Risk Level
                      </TableHead>
                      <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[100px]">
                        Status
                      </TableHead>
                      <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-center min-w-[80px]">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2">Loading dealers with violations...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : dealersWithViolations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                          No dealers with violations found
                        </TableCell>
                      </TableRow>
                                         ) : (
                       dealersWithViolations.filter(dealer => dealer && dealer.dealerId).map((dealer, index) => (
                        <TableRow
                          key={dealer.dealerId}
                          className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                          }`}
                        >
                          <TableCell className="px-6 py-4">
                            <input 
                              type="checkbox" 
                              checked={selectedViolationIds.includes(dealer.dealerId)}
                              onChange={(e) => handleSelectViolation(e, dealer.dealerId)}
                            />
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <span className="text-gray-700 b2 font-redHat">
                              {dealer.dealerId.slice(-8)}
                            </span>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <div>
                              <div className="font-medium text-gray-900 b2 font-redhat">
                                {dealer.dealerInfo?.trade_name || "Unknown Dealer"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {dealer.dealerInfo?.legal_name || "No legal name"}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <span className="text-gray-700 b2 font-semibold">
                              {dealer.violationStats?.totalViolations || 0}
                            </span>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <span className="text-gray-700 b2">
                              {dealer.violationStats?.avgViolationMinutes || 0}m
                            </span>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <span className={`text-sm font-medium ${
                              (dealer.violationStats?.unresolvedViolations || 0) > 0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {dealer.violationStats?.unresolvedViolations || 0}
                            </span>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            {getPriorityBadge(dealer.riskLevel || "Unknown")}
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            {getStatusBadge(dealer.dealerInfo?.is_active ? "Active" : "Disabled")}
                          </TableCell>
                          <TableCell className="px-6 py-4 text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-gray-100"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem className="cursor-pointer">
                                  View Details
                                </DropdownMenuItem>
                                {dealer.eligibleForDisable && (
                                  <DropdownMenuItem 
                                    className="cursor-pointer text-red-600 hover:text-red-700"
                                    onClick={() => {
                                      setSelectedDealer(dealer);
                                      setShowDisableModal(true);
                                    }}
                                  >
                                    Disable Dealer
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem className="cursor-pointer">
                                  View Violations
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                  Contact Dealer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Footer - Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/30">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-gray-500 order-2 sm:order-1">
                    Showing {dealersWithViolations.length} dealers with violations
                  </p>
                  <div className="flex items-center gap-2 order-1 sm:order-2">
                    {selectedViolationIds.length > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="min-w-[120px]"
                        onClick={() => setShowBulkDisableModal(true)}
                      >
                        Disable Selected ({selectedViolationIds.length})
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistical" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Level Distribution */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Risk Level Distribution</CardTitle>
                <CardDescription>Breakdown of dealers by risk level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-medium">High Risk</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {loading ? "..." : dashboardData?.dealersWithViolations?.highRiskDealers || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm font-medium">Medium Risk</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {loading ? "..." : dashboardData?.dealersWithViolations?.mediumRiskDealers || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium">Low Risk</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {loading ? "..." : (dashboardData?.dealersWithViolations?.totalDealers || 0) - 
                        (dashboardData?.dealersWithViolations?.highRiskDealers || 0) - 
                        (dashboardData?.dealersWithViolations?.mediumRiskDealers || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-700 rounded-full"></div>
                      <span className="text-sm font-medium">Eligible for Disable</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {loading ? "..." : dashboardData?.dealersWithViolations?.eligibleForDisable || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SLA Performance Metrics */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">SLA Performance</CardTitle>
                <CardDescription>Overall SLA compliance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Resolution Rate</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${dashboardData?.quickStats?.resolutionRate || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{dashboardData?.quickStats?.resolutionRate || 0}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Violation Rate</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ width: `${dashboardData?.quickStats?.resolutionRate ? 100 - dashboardData.quickStats.resolutionRate : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {dashboardData?.quickStats?.resolutionRate ? 100 - dashboardData.quickStats.resolutionRate : 0}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Unique Dealers</span>
                    <span className="text-sm text-gray-600">{dashboardData?.quickStats?.uniqueDealerCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Unresolved Violations</span>
                    <span className="text-sm text-gray-600">{dashboardData?.quickStats?.unresolvedViolations || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Violators */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Top Violating Dealers</CardTitle>
              <CardDescription>Dealers with the highest number of SLA violations</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <span className="ml-2">Loading top violators...</span>
                </div>
              ) : topViolators.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No top violators data available
                </div>
              ) : (
                <div className="space-y-4">
                  {topViolators.slice(0, 5).map((violator, index) => (
                    <div key={violator.dealerId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-600">#{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {violator.dealerInfo?.trade_name || "Unknown Dealer"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {violator.stats?.totalViolations || 0} violations
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {violator.stats?.avgViolationMinutes || 0}m avg
                        </div>
                        <div className="text-xs text-gray-500">
                          {violator.riskLevel || "Unknown"} Risk
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Disable Dealer Modal */}
      <Dialog open={showDisableModal} onOpenChange={setShowDisableModal}>
        <DialogContent className="sm:max-w-[425px]">
                     <DialogHeader>
             <DialogTitle>Disable Dealer</DialogTitle>
             <DialogDescription>
               Are you sure you want to disable {selectedDealer?.dealerInfo?.trade_name || "Unknown Dealer"}? 
               This action cannot be undone.
             </DialogDescription>
           </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason for Disable</Label>
              <Input
                id="reason"
                value={disableReason}
                onChange={(e) => setDisableReason(e.target.value)}
                placeholder="Enter reason for disabling dealer"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Admin Notes</Label>
              <Textarea
                id="notes"
                value={disableNotes}
                onChange={(e) => setDisableNotes(e.target.value)}
                placeholder="Additional notes or context"
                rows={3}
              />
            </div>
                         {selectedDealer && (
               <div className="bg-gray-50 p-3 rounded-lg">
                 <h4 className="font-medium text-sm mb-2">Dealer Information</h4>
                 <div className="text-sm text-gray-600 space-y-1">
                   <div><strong>Name:</strong> {selectedDealer.dealerInfo?.trade_name || "Unknown Dealer"}</div>
                   <div><strong>Total Violations:</strong> {selectedDealer.violationStats?.totalViolations || 0}</div>
                   <div><strong>Risk Level:</strong> {selectedDealer.riskLevel || "Unknown"}</div>
                   <div><strong>Unresolved:</strong> {selectedDealer.violationStats?.unresolvedViolations || 0}</div>
                 </div>
               </div>
             )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisableModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDisableDealer}
              disabled={!disableReason.trim()}
            >
              Disable Dealer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Disable Dealers Modal */}
      <Dialog open={showBulkDisableModal} onOpenChange={setShowBulkDisableModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Bulk Disable Dealers</DialogTitle>
            <DialogDescription>
              Are you sure you want to disable {selectedViolationIds.length} dealers? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="bulk-reason">Reason for Bulk Disable</Label>
              <Input
                id="bulk-reason"
                value={bulkDisableReason}
                onChange={(e) => setBulkDisableReason(e.target.value)}
                placeholder="Enter reason for bulk disabling dealers"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bulk-notes">Admin Notes</Label>
              <Textarea
                id="bulk-notes"
                value={bulkDisableNotes}
                onChange={(e) => setBulkDisableNotes(e.target.value)}
                placeholder="Additional notes or context"
                rows={3}
              />
            </div>
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <h4 className="font-medium text-sm mb-2 text-red-800">Warning</h4>
              <div className="text-sm text-red-700">
                This will disable {selectedViolationIds.length} dealers permanently. 
                All their unresolved violations will be marked as resolved.
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDisableModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleBulkDisableDealers}
              disabled={!bulkDisableReason.trim()}
            >
              Disable {selectedViolationIds.length} Dealers
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

