"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, Filter, ChevronDown, Edit, Eye, MoreHorizontal, ChevronUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast as GlobalToast } from "@/components/ui/toast";
import SearchInput from "@/components/common/search/SearchInput";
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
import { getOrdersByDealerId, updateOrderStatusByDealer, getDealerPickList } from "@/service/dealerOrder-services";
import { DealerOrder, DealerPickList } from "@/types/dealerOrder-types";
import {
  fetchOrdersFailure,
  fetchOrdersRequest,
  fetchOrdersSuccess,
} from "@/store/slice/order/orderSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import useDebounce from "@/utils/useDebounce";
import DynamicPagination from "@/components/common/pagination/DynamicPagination";
import DealerProductsModal from "./DealerProductsModal";
import { getCookie, getAuthToken } from "@/utils/auth";
import PickListModal from "./PickListModal";
import OrderFilters from "./OrderFilters";

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
  dealerProducts: any[];
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
  const [orderDetails, setOrderDetails] = useState<any>(null);
  
  // Sorting state
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Filters state
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPayment, setFilterPayment] = useState<string>("all");
  
  // Modal state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedOrderProducts, setSelectedOrderProducts] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");

  // Pick List Modal state
  const [pickListModalOpen, setPickListModalOpen] = useState(false);
  const [pickListData, setPickListData] = useState<DealerPickList[]>([]);
  const [pickListOrderId, setPickListOrderId] = useState("");
  const [pickListLoading, setPickListLoading] = useState(false);

  // Filtered orders must be declared before pagination logic
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Sort and filter orders
  const filteredAndSortedOrders = useMemo(() => {
    let currentOrders = ordersState;

    // Apply search
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      currentOrders = currentOrders.filter(
        (order: any) =>
          order.orderId?.toLowerCase().includes(q) ||
          order.customer?.toLowerCase().includes(q) ||
          order.number?.toLowerCase().includes(q)
      );
    }

    // Apply filters
    if (filterStatus !== "all") {
      currentOrders = currentOrders.filter((o: any) => String(o.status) === filterStatus);
    }
    if (filterPayment !== "all") {
      currentOrders = currentOrders.filter((o: any) => String(o.payment) === filterPayment);
    }

    // Sort orders
    if (sortField) {
      currentOrders.sort((a: any, b: any) => {
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
            aValue = parseFloat(a.value?.replace(/[^0-9.-]+/g, "")) || 0;
            bValue = parseFloat(b.value?.replace(/[^0-9.-]+/g, "")) || 0;
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
        
        if (sortDirection === "asc") {
          return aValue.localeCompare ? aValue.localeCompare(bValue) : aValue - bValue;
        } else {
          return bValue.localeCompare ? bValue.localeCompare(aValue) : bValue - aValue;
        }
      });
    }
    
    return currentOrders;
  }, [ordersState, searchQuery, filterStatus, filterPayment, sortField, sortDirection]);

  const filteredOrders = filteredAndSortedOrders;

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedData = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  console.log("paginatedData", paginatedData);

  const handleViewOrder = (id: string) => {
    setOrderDetails(id);
    setTimeout(() => setOrderDetails(null), 1000);
  };

  const handleViewProducts = (order: any) => {
    setSelectedOrderProducts(order.dealerProducts || []);
    setSelectedOrderId(order.orderId);
    setViewModalOpen(true);
  };

  const handleMarkAsPacked = async (order: any, totalWeightKg: number) => {
    try {
      // Show loading state
      showToast("Updating Status: Marking order as packed...", "success");
  
      // Get dealer ID from token/cookie
      let dealerId = getCookie("dealerId");
      
      if (!dealerId) {
        const token = getAuthToken();
        if (token) {
          try {
            const payloadBase64 = token.split(".")[1];
            if (payloadBase64) {
              const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
              const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
              const payloadJson = atob(paddedBase64);
              const payload = JSON.parse(payloadJson);
              dealerId = payload.dealerId || payload.id;
            }
          } catch (err) {
            console.error("Failed to decode token for dealerId:", err);
          }
        }
      }
  
      if (!dealerId) {
        showToast("Error: Dealer ID not found. Please login again.", "error");
        throw new Error("Dealer ID not found");
      }
  
      // Call the API with total weight
      const response = await updateOrderStatusByDealer(dealerId, order.id, totalWeightKg);
      
      // Update the local state immediately
      const updatedOrders = ordersState.map((o: any) => 
        o.id === order.id 
          ? { ...o, status: "Packed" }
          : o
      );
      
      // Update both local state and Redux store
      setOrders(updatedOrders);
      dispatch(fetchOrdersSuccess(updatedOrders));
  
      // Show success message
      showToast(`Packed! Order ${order.orderId} is now ready for shipment.`, "success");
      console.log(`Packed! Order ${order.orderId} is now ready for shipment.`);
      console.log("Order status updated:", response);
      
      return response; // Return response for success handling
    } catch (error) {
      console.error("Error updating order status:", error);
      showToast("Failed to update order status. Please try again.", "error");
      throw error; // Re-throw so the modal can handle the error
    }
  };

  const handleViewPickList = async (order: any) => {
    setPickListOrderId(order.orderId);
    setPickListLoading(true);
    try {
      // Try to get dealerId from order.dealerMapping[0].dealerId
      const dealerId = order.dealerMapping && order.dealerMapping[0]?.dealerId;
      if (!dealerId) {
        showToast("Dealer ID not found for this order.", "error");
        setPickListLoading(false);
        return;
      }
      const data = await getDealerPickList(dealerId);
      setPickListData(data);
      setPickListModalOpen(true);
    } catch (error) {
      showToast("Failed to fetch pick list.", "error");
    } finally {
      setPickListLoading(false);
    }
  };

  // Fetch orders from backend
  useEffect(() => {
    async function fetchOrders() {
      dispatch(fetchOrdersRequest());
      try {
        const response = await getOrdersByDealerId();
        console.log("Raw backend response:", response);
        
                 const mappedOrders = response.map((order: DealerOrder) => {
           // Log the exact status from backend
           console.log(`Order ${order.orderId} - Raw status from backend:`, order.status);
           console.log(`Order ${order.orderId} - Status type:`, typeof order.status);
           console.log(`Order ${order.orderId} - Status value:`, JSON.stringify(order.status));
           
           return {
             id: order.orderDetails._id,
             orderId: order.orderId,
             orderDate: new Date(order.orderDetails.orderDate).toLocaleDateString(),
             customer: order.customerDetails?.name || "",
             number: order.customerDetails?.phone || "",
             payment: order.orderDetails.paymentType,
             value: `₹${order.orderDetails.order_Amount}`,
             skus: order.orderDetails.skus || [],
             skusCount: order.orderDetails.skus?.length || 0,
             dealers: order.orderDetails.dealerMapping?.length || 0,
             dealerMapping: order.orderDetails.dealerMapping || [],
             status: order.status, // Show exact backend status without fallback
             deliveryCharges: order.orderDetails.order_Amount,
             orderType: order.orderDetails.orderType,
             orderSource: order.orderDetails.orderSource,
             auditLogs: order.orderDetails.auditLogs || [],
             createdAt: order.orderDetails.createdAt,
             updatedAt: order.orderDetails.updatedAt,
             dealerProducts: order.DealerProducts || [], 
           };
         });
        
        console.log("Mapped orders with statuses:", mappedOrders.map(o => ({ orderId: o.orderId, status: o.status })));
        
        dispatch(fetchOrdersSuccess(mappedOrders));
        setOrders(mappedOrders);
      } catch (error) {
        console.error("Failed to fetch dealer orders:", error);
        dispatch(fetchOrdersFailure(error));
      }
    }
    fetchOrders();
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

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ChevronUp className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === "asc" ? 
      <ChevronUp className="w-4 h-4 text-[#C72920]" /> : 
      <ChevronDown className="w-4 h-4 text-[#C72920]" />;
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded text-xs font-medium";
    
    // Handle null/undefined status
    if (!status) {
      return `${baseClasses} text-gray-700 bg-gray-100`;
    }
    
    // Convert to lowercase for case-insensitive comparison
    const statusLower = status.toLowerCase();
    
    switch (statusLower) {
      case "pending":
        return `${baseClasses} text-yellow-700 bg-yellow-100`;
      case "approved":
      case "confirmed":
        return `${baseClasses} text-green-700 bg-green-100`;
      case "packed":
        return `${baseClasses} text-blue-700 bg-blue-100`;
      case "shipped":
        return `${baseClasses} text-purple-700 bg-purple-100`;
      case "delivered":
        return `${baseClasses} text-green-900 bg-green-200`;
      case "cancelled":
      case "canceled":
        return `${baseClasses} text-red-700 bg-red-100`;
      case "processing":
        return `${baseClasses} text-orange-700 bg-orange-100`;
      case "ready":
        return `${baseClasses} text-indigo-700 bg-indigo-100`;
      default:
        console.log(`Unknown status: ${status}, using default styling`);
        return `${baseClasses} text-gray-700 bg-gray-100`;
    }
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
              <OrderFilters
                search={searchInput}
                onSearchChange={handleSearchChange}
                currentStatus={filterStatus}
                onStatusChange={setFilterStatus}
                currentPayment={filterPayment}
                onPaymentChange={setFilterPayment}
                onResetFilters={() => {
                  setFilterStatus("all");
                  setFilterPayment("all");
                }}
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
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="border-b border-[#E5E5E5] bg-gray-50/50">
                  <TableHead className="px-4 py-4 w-8 font-[Red Hat Display]">
                    <Checkbox aria-label="Select all" />
                  </TableHead>
                  <TableHead 
                    className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer hover:text-[#C72920] transition-colors"
                    onClick={() => handleSort("orderId")}
                  >
                    <div className="flex items-center gap-1">
                      Order ID
                      {getSortIcon("orderId")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer hover:text-[#C72920] transition-colors"
                    onClick={() => handleSort("date")}
                  >
                    <div className="flex items-center gap-1">
                      Date
                      {getSortIcon("date")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer hover:text-[#C72920] transition-colors"
                    onClick={() => handleSort("customer")}
                  >
                    <div className="flex items-center gap-1">
                      Customer
                      {getSortIcon("customer")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer hover:text-[#C72920] transition-colors"
                    onClick={() => handleSort("number")}
                  >
                    <div className="flex items-center gap-1">
                      Number
                      {getSortIcon("number")}
                    </div>
                  </TableHead>


                  <TableHead 
                    className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer hover:text-[#C72920] transition-colors"
                    onClick={() => handleSort("skus")}
                  >
                    <div className="flex items-center gap-1">
                      No.of Skus
                      {getSortIcon("skus")}
                    </div>
                  </TableHead>

                  <TableHead 
                    className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer hover:text-[#C72920] transition-colors"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center gap-1">
                      Status
                      {getSortIcon("status")}
                    </div>
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display]">
                    Actions
                  </TableHead>
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
                        <TableCell className="px-6 py-4 font-medium">
                          {order.orderId}
                        </TableCell>
                        <TableCell className="px-6 py-4 font-semibold text-[#000000] font-sans">
                          {order.orderDate}
                        </TableCell>
                        <TableCell className="px-6 py-4 font-semibold text-[#000000]">
                          {order.customer}
                        </TableCell>
                        <TableCell className="px-6 py-4 font-semibold text-[#000000]">
                          {order.number}
                        </TableCell>


                        <TableCell className="px-6 py-4 font-semibold text-[#000000]">
                          {Array.isArray(order.skus) ? order.skus.length : 1}
                        </TableCell>

                        <TableCell className="px-6 py-4">
                          <span className={getStatusBadge(order.status)}>
                            {order.status !== null && order.status !== undefined ? order.status : "No Status"}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-9 px-4 rounded-lg border border-neutral-300 b3 text-base font-sans text-gray-900 flex items-center gap-1 shadow-sm hover:border-red-100 focus:ring-2 focus:ring-red-100"
                              >
                                Mark Action
                                <ChevronDown className="h-4 w-4 ml-1" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-36 rounded-lg shadow-lg border border-neutral-200 p-1 font-red-hat b3 text-base"
                            >
                              <DropdownMenuItem 
                                className="b3 text-base font-red-hat flex items-center gap-2 rounded hover:bg-neutral-100 cursor-pointer"
                                onClick={() => handleViewProducts(order)}
                              >
                                <Eye className="h-4 w-4" />
                                View Products
                              </DropdownMenuItem>

                              <DropdownMenuItem 
                                className="b3 text-base font-red-hat flex items-center gap-2 rounded hover:bg-neutral-100 cursor-pointer"
                                onClick={() => handleViewPickList(order)}
                              >
                                <Eye className="h-4 w-4" />
                                Pick List
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>
          {!loading && !error && paginatedData.length > 0 && totalPages > 1 && (
            <DynamicPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredOrders.length}
              itemsPerPage={itemsPerPage}
            />
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

      {/* Dealer Products Modal */}
      <DealerProductsModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        products={selectedOrderProducts}
        orderId={selectedOrderId}
      />

      {/* Pick List Modal */}
      <PickListModal
        isOpen={pickListModalOpen}
        onClose={() => setPickListModalOpen(false)}
        pickLists={pickListData}
        orderId={pickListOrderId}
        orderStatus={ordersState.find((o: any) => o.orderId === pickListOrderId)?.status || ""}
        onMarkAsPacked={async (totalWeightKg) => {
          try {
            console.log("Starting mark as packed process...");
            console.log("Current order status:", ordersState.find((o: any) => o.orderId === pickListOrderId)?.status);
            
            // Find the current order and mark it as packed
            const currentOrder = ordersState.find((o: any) => o.orderId === pickListOrderId);
            if (currentOrder) {
              console.log("Found current order:", currentOrder.orderId, "Status:", currentOrder.status);
              
              await handleMarkAsPacked(currentOrder, totalWeightKg);
              
              console.log("API call completed, refreshing orders...");
              
              // Refresh orders to ensure status is updated
              try {
                const refreshedOrders = await getOrdersByDealerId();
                console.log("Refreshed orders from backend:", refreshedOrders);
                
                                 const mappedOrders = refreshedOrders.map((order: DealerOrder) => {
                   console.log(`Refreshed order ${order.orderId} - Raw status:`, order.status);
                   console.log(`Refreshed order ${order.orderId} - Status type:`, typeof order.status);
                   return {
                     id: order.orderDetails._id,
                     orderId: order.orderId,
                     orderDate: new Date(order.orderDetails.orderDate).toLocaleDateString(),
                     customer: order.customerDetails?.name || "",
                     number: order.customerDetails?.phone || "",
                     payment: order.orderDetails.paymentType,
                     value: `₹${order.orderDetails.order_Amount}`,
                     skus: order.orderDetails.skus || [],
                     skusCount: order.orderDetails.skus?.length || 0,
                     dealers: order.orderDetails.dealerMapping?.length || 0,
                     dealerMapping: order.orderDetails.dealerMapping || [],
                     status: order.status, // Keep exact backend status
                     deliveryCharges: order.orderDetails.order_Amount,
                     orderType: order.orderDetails.orderType,
                     orderSource: order.orderDetails.orderSource,
                     auditLogs: order.orderDetails.auditLogs || [],
                     createdAt: order.orderDetails.createdAt,
                     updatedAt: order.orderDetails.updatedAt,
                     dealerProducts: order.DealerProducts || [], 
                   };
                 });
                
                const updatedOrder = mappedOrders.find(o => o.orderId === pickListOrderId);
                console.log("Updated order after refresh:", updatedOrder?.orderId, "Status:", updatedOrder?.status);
                
                // Update both local state and Redux store with fresh data
                setOrders(mappedOrders);
                dispatch(fetchOrdersSuccess(mappedOrders));
              } catch (refreshError) {
                console.error("Failed to refresh orders:", refreshError);
              }
              
              console.log("Closing modal after successful update");
              // Only close modal after successful API call and refresh
              setPickListModalOpen(false);
            }
          } catch (error) {
            console.error("Failed to mark as packed:", error);
            // Don't close modal on error - let user see the error
          }
        }}
      />
    </div>
  );
}
