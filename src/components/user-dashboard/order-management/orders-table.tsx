"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Edit,
  Eye,
  MoreHorizontal,
} from "lucide-react";
// Replaced shadcn Button with shared DynamicButton where used
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast as GlobalToast } from "@/components/ui/toast";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import SearchInput from "@/components/common/search/SearchInput";
import OrdersFilters from "@/components/user-dashboard/order-management/OrdersFilters";
import DynamicButton from "@/components/common/button/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { getOrders, updateOrderStatusByDealerReq, fetchPicklists } from "@/service/order-service";
import AssignDealersModal from "@/components/user-dashboard/order-management/module/order-popus/AssignDealersModal";
import CreatePicklist from "@/components/user-dashboard/order-management/module/OrderDetailCards/CreatePicklist";
import { orderResponse } from "@/types/order-Types";
import {
  fetchOrdersFailure,
  fetchOrdersRequest,
  fetchOrdersSuccess,
} from "@/store/slice/order/orderSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import useDebounce from "@/utils/useDebounce";
interface Order {
  id: string;
  date: string;
  customer: string;
  number: string;
  payment: string;
  value: string;
  skus: number;
  dealers: number;
  status: "Pending" | "Approved";
}

export default function OrdersTable() {
  const [orders, setOrders] = useState<any[]>([]);
  const { showToast } = GlobalToast();
  const route = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("Requests");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const dispatch = useAppDispatch();
  const ordersState = useAppSelector((state) => state.order.orders);
  const loading = useAppSelector((state: any) => state.order.loading);
  const error = useAppSelector((state: any) => state.order.error);
  const auth = useAppSelector((state) => state.auth.user);
  const isAuthorized = ["Super-admin", "Fulfillment-Admin"].includes(auth?.role);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  // Filtered orders must be declared before pagination logic

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Action modal state
  const [actionOpen, setActionOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<
    "assignDealers" | "createPicklist" | "markPacked" | "viewPicklists" | null
  >(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [dealerId, setDealerId] = useState("");
  const [staffId, setStaffId] = useState("");
  const [totalWeightKg, setTotalWeightKg] = useState<number>(0);
  const [assignmentsJson, setAssignmentsJson] = useState("[]");
  const [skuListJson, setSkuListJson] = useState("[]");
  const [loadingAction, setLoadingAction] = useState(false);
  const [picklistsData, setPicklistsData] = useState<any[]>([]);

  // Sorting state
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Orders filters state
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [filterOrderSource, setFilterOrderSource] = useState("all");
  // Search + Sort combined
  const filteredOrders = useMemo(() => {
    let list = ordersState;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (order: any) =>
          order.orderId?.toLowerCase().includes(q) ||
          order.customer?.toLowerCase().includes(q) ||
          order.number?.toLowerCase().includes(q)
      );
    }
    // Apply side-panel filters
    if (filterStatus !== "all") {
      const fs = filterStatus.toLowerCase();
      list = list.filter((o: any) => String(o.status || "").toLowerCase() === fs);
    }
    if (filterPayment !== "all") {
      const fp = filterPayment.toLowerCase();
      list = list.filter((o: any) => String(o.payment || "").toLowerCase() === fp);
    }
    if (filterOrderSource !== "all") {
      const fsr = filterOrderSource.toLowerCase();
      list = list.filter((o: any) => String(o.orderSource || "").toLowerCase() === fsr);
    }
    if (sortField) {
      list = [...list].sort((a: any, b: any) => {
        let aValue: any;
        let bValue: any;
        switch (sortField) {
          case "orderId":
            aValue = a.orderId?.toLowerCase() || "";
            bValue = b.orderId?.toLowerCase() || "";
            break;
          case "date":
            aValue = new Date(a.orderDate).getTime();
            bValue = new Date(b.orderDate).getTime();
            break;
          case "customer":
            aValue = a.customer?.toLowerCase() || "";
            bValue = b.customer?.toLowerCase() || "";
            break;
          case "number":
            aValue = a.number?.toLowerCase() || "";
            bValue = b.number?.toLowerCase() || "";
            break;
          case "payment":
            aValue = a.payment?.toLowerCase() || "";
            bValue = b.payment?.toLowerCase() || "";
            break;
          case "value":
            aValue = parseFloat(String(a.value).replace(/[^0-9.-]+/g, "")) || 0;
            bValue = parseFloat(String(b.value).replace(/[^0-9.-]+/g, "")) || 0;
            break;
          case "skus":
            aValue = Array.isArray(a.skus) ? a.skus.length : 1;
            bValue = Array.isArray(b.skus) ? b.skus.length : 1;
            break;
          case "dealers":
            aValue = a.dealers || 0;
            bValue = b.dealers || 0;
            break;
          case "status":
            aValue = a.status?.toLowerCase() || "";
            bValue = b.status?.toLowerCase() || "";
            break;
          default:
            return 0;
        }
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      });
    }
    return list;
  }, [ordersState, searchQuery, filterStatus, filterPayment, filterOrderSource, sortField, sortDirection]);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedData = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  console.log("paginatedData", paginatedData);

  const handleViewOrder = (id: string) => {
    setOrderDetails(id);
    route.push(`/user/dashboard/order/orderdetails/${id}`);
    // Clear loading state after navigation (simulated delay)
    setTimeout(() => setOrderDetails(null), 1000);
  };
  // Simulate loading
  useEffect(() => {
    let timer: NodeJS.Timeout;
    async function fetchOrders() {
      dispatch(fetchOrdersRequest());

      try {
        const response = await getOrders();
        const mappedOrders = response.data.map((order: any) => ({
          id: order._id,
          orderId: order.orderId,
          orderDate: new Date(order.orderDate).toLocaleDateString(), // Format as needed
          customer: order.customerDetails?.name || "",
          number: order.customerDetails?.phone || "",
          payment: order.paymentType,
          value: `₹${order.order_Amount}`,
          skus:
            order.skus?.map((sku: any) => ({
              sku: sku.sku,
              quantity: sku.quantity,
              productId: sku.productId,
              productName: sku.productName,
              _id: sku._id,
            })) || [],
          skusCount: order.skus?.length || 0,
          dealers: order.dealerMapping?.length || 0,
          dealerMapping: order.dealerMapping || [],
          status: order.status,
          deliveryCharges: order.deliveryCharges,
          GST: order.GST,
          orderType: order.orderType,
          orderSource: order.orderSource,
          auditLogs: order.auditLogs || [],
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        }));
        dispatch(fetchOrdersSuccess(mappedOrders));
        console.log(response);
        setOrders(response.data);
        timer = setTimeout(() => {
          setOrders(response.data);
        }, 2000);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        dispatch(fetchOrdersFailure(error));
      }
    }
    fetchOrders();
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [dispatch]);
  // Debounced search functionality
  const performSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    setIsSearching(false);
  }, []);

  const { debouncedCallback: debouncedSearch, cleanup: cleanupDebounce } =
    useDebounce(performSearch, 500);

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setIsSearching(value.trim() !== "");
    debouncedSearch(value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setIsSearching(false);
    setCurrentPage(1);
  };

  const refreshOrders = useCallback(async () => {
    try {
      dispatch(fetchOrdersRequest());
      const response = await getOrders();
      const mappedOrders = response.data.map((order: any) => ({
        id: order._id,
        orderId: order.orderId,
        orderDate: new Date(order.orderDate).toLocaleDateString(),
        customer: order.customerDetails?.name || "",
        number: order.customerDetails?.phone || "",
        payment: order.paymentType,
        value: `₹${order.order_Amount}`,
        skus:
          order.skus?.map((sku: any) => ({
            sku: sku.sku,
            quantity: sku.quantity,
            productId: sku.productId,
            productName: sku.productName,
            _id: sku._id,
          })) || [],
        skusCount: order.skus?.length || 0,
        dealers: order.dealerMapping?.length || 0,
        dealerMapping: order.dealerMapping || [],
        status: order.status,
        deliveryCharges: order.deliveryCharges,
        GST: order.GST,
        orderType: order.orderType,
        orderSource: order.orderSource,
        auditLogs: order.auditLogs || [],
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      }));
      dispatch(fetchOrdersSuccess(mappedOrders));
    } catch (error) {
      dispatch(fetchOrdersFailure(error as any));
    }
  }, [dispatch]);

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded text-xs font-medium";
    const s = (status || "").toLowerCase();
    if (s === "pending" || s === "created") {
      return `${baseClasses} text-yellow-700 bg-yellow-100`;
    }
    if (s === "approved" || s === "confirmed") {
      return `${baseClasses} text-green-700 bg-green-100`;
    }
    if (s === "packed") {
      return `${baseClasses} text-blue-700 bg-blue-100`;
    }
    if (s === "delivered" || s === "completed") {
      return `${baseClasses} text-emerald-700 bg-emerald-100`;
    }
    if (s === "cancelled" || s === "canceled") {
      return `${baseClasses} text-red-700 bg-red-100`;
    }
    return `${baseClasses} text-gray-700 bg-gray-100`;
  };

  return (
    <div className="w-full">
      <Card className="shadow-sm rounded-none">
        {/* Header */}
        <CardHeader className="space-y-4 sm:space-y-6">
          <CardTitle className="text-[#000000] font-bold text-lg font-sans">
            <span>Order Management</span>
          </CardTitle>

          {/* Search and Filters */}
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 gap-4 w-full">
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:gap-3 w-full lg:w-auto">

              <SearchInput
                placeholder="Search Spare parts"
                value={searchInput}
                onChange={handleSearchChange}
                onClear={handleClearSearch}
                isLoading={isSearching}
              />
              <OrdersFilters
                currentStatus={filterStatus}
                onStatusChange={(v) => { setFilterStatus(v); setCurrentPage(1); }}
                currentPayment={filterPayment}
                onPaymentChange={(v) => { setFilterPayment(v); setCurrentPage(1); }}
                currentOrderType={"all"}
                onOrderTypeChange={() => { /* no-op: order type removed */ }}
                currentOrderSource={filterOrderSource}
                onOrderSourceChange={(v) => { setFilterOrderSource(v); setCurrentPage(1); }}
                onResetFilters={() => { setFilterStatus("all"); setFilterPayment("all"); setFilterOrderSource("all"); setCurrentPage(1); }}
                orders={ordersState}
              />
            </div>
          </div>

          {/* Orders Section Header */}
          <div className="mb-4">
            <CardTitle className="font-sans font-bold text-lg text-[#000000]">
              Order
            </CardTitle>
            <CardDescription className="text-sm text-[#737373] font-medium font-sans">
              Manage your Orders details
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden sm:block overflow-x-auto">
            <Table className="min-w-full table-fixed">
              <TableHeader>
                <TableRow className="border-b  border-[#E5E5E5] bg-gray-50/50">
                  <TableHead className="px-4 py-4 w-8 font-[Red Hat Display]">
                    <Checkbox
                      // checked={allSelected}
                      // onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>

                  <TableHead
                    className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer select-none"
                    onClick={() => {
                      setSortField((prev) => (prev === "orderId" ? "orderId" : "orderId"));
                      setSortDirection((prev) => (sortField === "orderId" ? (prev === "asc" ? "desc" : "asc") : "asc"));
                    }}
                    title="Sort by Order ID"
                  >
                    <span className="inline-flex items-center gap-1">
                      Order ID
                      {sortField === "orderId" && (sortDirection === "asc" ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3" />)}
                    </span>
                  </TableHead>
                  <TableHead
                    className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer select-none"
                    onClick={() => {
                      setSortField((prev) => (prev === "date" ? "date" : "date"));
                      setSortDirection((prev) => (sortField === "date" ? (prev === "asc" ? "desc" : "asc") : "asc"));
                    }}
                    title="Sort by Date"
                  >
                    <span className="inline-flex items-center gap-1">
                      Date
                      {sortField === "date" && (sortDirection === "asc" ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3" />)}
                    </span>
                  </TableHead>
                  <TableHead
                    className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer select-none"
                    onClick={() => {
                      setSortField((prev) => (prev === "customer" ? "customer" : "customer"));
                      setSortDirection((prev) => (sortField === "customer" ? (prev === "asc" ? "desc" : "asc") : "asc"));
                    }}
                    title="Sort by Customer"
                  >
                    <span className="inline-flex items-center gap-1">
                      Customer
                      {sortField === "customer" && (sortDirection === "asc" ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3" />)}
                    </span>
                  </TableHead>
                  <TableHead
                    className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer select-none"
                    onClick={() => {
                      setSortField((prev) => (prev === "number" ? "number" : "number"));
                      setSortDirection((prev) => (sortField === "number" ? (prev === "asc" ? "desc" : "asc") : "asc"));
                    }}
                    title="Sort by Number"
                  >
                    <span className="inline-flex items-center gap-1">
                      Number
                      {sortField === "number" && (sortDirection === "asc" ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3" />)}
                    </span>
                  </TableHead>
                  <TableHead
                    className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer select-none"
                    onClick={() => {
                      setSortField((prev) => (prev === "payment" ? "payment" : "payment"));
                      setSortDirection((prev) => (sortField === "payment" ? (prev === "asc" ? "desc" : "asc") : "asc"));
                    }}
                    title="Sort by Payment"
                  >
                    <span className="inline-flex items-center gap-1">
                      Payment
                      {sortField === "payment" && (sortDirection === "asc" ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3" />)}
                    </span>
                  </TableHead>
                  <TableHead
                    className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer select-none"
                    onClick={() => {
                      setSortField((prev) => (prev === "value" ? "value" : "value"));
                      setSortDirection((prev) => (sortField === "value" ? (prev === "asc" ? "desc" : "asc") : "asc"));
                    }}
                    title="Sort by Value"
                  >
                    <span className="inline-flex items-center gap-1">
                      Value
                      {sortField === "value" && (sortDirection === "asc" ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3" />)}
                    </span>
                  </TableHead>
                  <TableHead
                    className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer select-none"
                    onClick={() => {
                      setSortField((prev) => (prev === "skus" ? "skus" : "skus"));
                      setSortDirection((prev) => (sortField === "skus" ? (prev === "asc" ? "desc" : "asc") : "asc"));
                    }}
                    title="Sort by SKUs count"
                  >
                    <span className="inline-flex items-center gap-1">
                      No.of Skus
                      {sortField === "skus" && (sortDirection === "asc" ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3" />)}
                    </span>
                  </TableHead>
                  <TableHead
                    className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer select-none"
                    onClick={() => {
                      setSortField((prev) => (prev === "dealers" ? "dealers" : "dealers"));
                      setSortDirection((prev) => (sortField === "dealers" ? (prev === "asc" ? "desc" : "asc") : "asc"));
                    }}
                    title="Sort by Dealers"
                  >
                    <span className="inline-flex items-center gap-1">
                      Dealer
                      {sortField === "dealers" && (sortDirection === "asc" ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3" />)}
                    </span>
                  </TableHead>
                  <TableHead
                    className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer select-none"
                    onClick={() => {
                      setSortField((prev) => (prev === "status" ? "status" : "status"));
                      setSortDirection((prev) => (sortField === "status" ? (prev === "asc" ? "desc" : "asc") : "asc"));
                    }}
                    title="Sort by Status"
                  >
                    <span className="inline-flex items-center gap-1">
                      Status
                      {sortField === "status" && (sortDirection === "asc" ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3" />)}
                    </span>
                  </TableHead>
                  {isAuthorized && (
                    <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display]">
                      Actions
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 10 }).map((_, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="px-4 py-4 w-8">
                          <Skeleton className="w-5 h-5 rounded" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="w-16 h-12 rounded-md" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-4 w-3/4 mb-2" />
                          <Skeleton className="h-3 w-1/2" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-3 w-1/2" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-3 w-1/2" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-3 w-1/2" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-3 w-1/2" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-3 w-1/2" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-3 w-1/2" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-3 w-1/2" />
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center">
                          <Skeleton className="h-8 w-8 rounded" />
                        </TableCell>
                      </TableRow>
                    ))
                  : paginatedData.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="px-4 py-4 w-8">
                          <Checkbox />
                        </TableCell>
                        <TableCell
                          className="px-6 py-4 font-medium max-w-[160px] truncate cursor-pointer"
                          title={order.orderId}
                          onClick={() => handleViewOrder(order.id)}
                        >
                          {order.orderId}
                        </TableCell>
                        <TableCell className="px-6 py-4 font-semibold text-[#000000] font-sans whitespace-nowrap">
                          {order.orderDate}
                        </TableCell>
                        <TableCell className="px-6 py-4 font-semibold text-[#000000] max-w-[180px] truncate" title={order.customer}>
                          {order.customer}
                        </TableCell>
                        <TableCell className="px-6 py-4 font-semibold text-[#000000] max-w-[160px] truncate" title={order.number}>
                          {order.number}
                        </TableCell>
                        <TableCell className="px-6 py-4 font-semibold text-[#000000] max-w-[140px] truncate" title={order.payment}>
                          {order.payment}
                        </TableCell>
                        <TableCell className="px-6 py-4 font-semibold text-[#000000] max-w-[120px] truncate" title={order.value}>
                          {order.value}
                        </TableCell>
                        <TableCell className="px-6 py-4 font-semibold text-[#000000] whitespace-nowrap">
                          {Array.isArray(order.skus) ? order.skus.length : 1}
                        </TableCell>
                        <TableCell className="px-6 py-4 font-semibold text-[#000000] whitespace-nowrap">
                          {order.dealers}
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap">
                          <span className={getStatusBadge(order.status)}>
                            {order.status}
                          </span>
                        </TableCell>
                        {isAuthorized && (
                          <TableCell className="px-6 py-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <DynamicButton
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-gray-100"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </DynamicButton>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-48 rounded-lg shadow-lg border border-neutral-200 p-1 font-red-hat b3 text-base"
                              >
                                <DropdownMenuItem 
                                  className="b3 text-base font-red-hat flex items-center gap-2 rounded hover:bg-neutral-100" 
                                  onClick={() => handleViewOrder(order.id)}
                                >
                                  <Eye className="h-4 w-4 mr-2" /> View
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>
          {!loading && !error && paginatedData.length > 0 && totalPages > 1 && (
            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mt-8 px-4 sm:px-6 pb-6">
              {/* Left: Showing X-Y of Z products */}
              <div className="text-sm text-gray-600 text-center sm:text-left">
                {`Showing ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(
                  currentPage * itemsPerPage,
                  paginatedData.length
                )} of ${paginatedData.length} products`}
              </div>
              {/* Pagination Controls */}
              <div className="flex justify-center sm:justify-end">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.min(totalPages, 3) }).map(
                      (_, idx) => {
                        let pageNum;
                        if (totalPages <= 3) {
                          pageNum = idx + 1;
                        } else if (currentPage <= 2) {
                          pageNum = idx + 1;
                        } else if (currentPage >= totalPages - 1) {
                          pageNum = totalPages - 2 + idx;
                        } else {
                          pageNum = currentPage - 1 + idx;
                        }

                        // Prevent out-of-bounds pageNum
                        if (pageNum < 1 || pageNum > totalPages) return null;

                        return (
                          <PaginationItem
                            key={pageNum}
                            className="hidden sm:block"
                          >
                            <PaginationLink
                              isActive={currentPage === pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className="cursor-pointer"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                    )}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          )}
        </CardContent>

        {/* Empty State */}
        {paginatedData.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-500 text-lg mb-2">No orders found</p>
            <p className="text-gray-400 text-sm">
              Try adjusting your search terms
            </p>
          </div>
        )}
      </Card>
      {/* Action Modal */}
      <Dialog
        open={isAuthorized && actionOpen && (activeAction === "markPacked" || activeAction === "viewPicklists")}
        onOpenChange={setActionOpen}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {activeAction === "markPacked" && "Mark Order as Packed"}
              {activeAction === "viewPicklists" && "Picklists"}
            </DialogTitle>
          </DialogHeader>

          {activeAction === "markPacked" && (
            <div className="space-y-3">
              <div>
                <Label>Order ID</Label>
                <Input readOnly value={selectedOrder?.id || ""} />
              </div>
              <div>
                <Label>Dealer ID</Label>
                <Input value={dealerId} onChange={(e) => setDealerId(e.target.value)} />
              </div>
              <div>
                <Label>Total Weight (kg)</Label>
                <Input type="number" value={totalWeightKg} onChange={(e) => setTotalWeightKg(parseFloat(e.target.value) || 0)} />
              </div>
              <DynamicButton
                onClick={async () => {
                  try {
                    setLoadingAction(true);
                    await updateOrderStatusByDealerReq({ orderId: selectedOrder?.id, dealerId, total_weight_kg: totalWeightKg });
                    showToast("Order marked as packed", "success");
                    setActionOpen(false);
                    await refreshOrders();
                  } catch (e) {
                    showToast("Failed to mark packed", "error");
                  } finally {
                    setLoadingAction(false);
                  }
                }}
                disabled={loadingAction}
              >
                {loadingAction ? "Updating..." : "Mark Packed"}
              </DynamicButton>
            </div>
          )}

          {activeAction === "viewPicklists" && (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {picklistsData.length === 0 ? (
                <p className="text-sm text-gray-600">No picklists found.</p>
              ) : (
                picklistsData.map((p: any) => (
                  <div key={p._id} className="border rounded p-3 text-sm">
                    <div className="font-medium mb-1">{p._id}</div>
                    <div>Order: {p.linkedOrderId}</div>
                    <div>Dealer: {p.dealerId}</div>
                    <div>Scan: {p.scanStatus}</div>
                    <div>Invoice: {p.invoiceGenerated ? "Yes" : "No"}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Separated modals */}
      <AssignDealersModal
        open={isAuthorized && actionOpen && activeAction === "assignDealers"}
        onOpenChange={(open) => {
          if (!open) { setActionOpen(false); setActiveAction(null) } else { setActionOpen(true) }
        }}
        orderId={selectedOrder?.id}
      />
      <CreatePicklist
        open={isAuthorized && actionOpen && activeAction === "createPicklist"}
        onClose={() => { setActionOpen(false); setActiveAction(null) }}
        orderId={selectedOrder?.id || ""}
        defaultDealerId={dealerId}
        defaultSkuList={[]}
      />
      {/* Removed unused AssignPicklistModal */}
    </div>
  );
}
