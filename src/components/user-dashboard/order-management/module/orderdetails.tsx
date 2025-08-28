"use client";
import { useState, useEffect, use, useMemo } from "react";
import {
  ChevronDown,
  Edit,
  Package,
  HandHeart,
  Truck,
  UserCheck,
  Eye,
  ExternalLink,
  Calendar,
  CreditCard,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
// Removed unused shadcn Button import; using shared DynamicButton where needed
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import DealerIdentification from "@/components/user-dashboard/order-management/module/order-popus/dealerIdentification"; // Correct import path
import CancelOrderModal from "@/components/user-dashboard/order-management/module/order-popus/cancelorder";
import ProductPopupModal from "@/components/user-dashboard/order-management/module/order-popus/productdetails";
import ProductDetailsForOrder from "@/components/user-dashboard/order-management/module/OrderDetailCards/ProductDetailsForOrder";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useParams } from "next/navigation";
import { getOrderById } from "@/service/order-service";
import { getDealerById } from "@/service/dealerServices";
import {
  fetchOrderByIdSuccess,
  fetchOrderByIdRequest,
  fetchOrderByIdFailure,
} from "@/store/slice/order/orderByIdSlice";
import DynamicButton from "@/components/common/button/button";
// import CreatePickList from "./order-popus/CreatePickList"; // removed old JSON-based modal

import formatDate from "@/utils/formateDate";

// Helper function to get status badge styling
const getStatusBadgeClasses = (status: string) => {
  const s = (status || "").toLowerCase();
  if (s === "delivered" || s === "completed") {
    return "bg-emerald-100 text-emerald-800 hover:bg-emerald-100";
  }
  if (s === "packed") {
    return "bg-blue-100 text-blue-800 hover:bg-blue-100";
  }
  if (s === "shipped") {
    return "bg-purple-100 text-purple-800 hover:bg-purple-100";
  }
  if (s === "cancelled" || s === "canceled") {
    return "bg-red-100 text-red-800 hover:bg-red-100";
  }
  if (s === "pending" || s === "created") {
    return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
  }
  if (s === "approved" || s === "confirmed") {
    return "bg-green-100 text-green-800 hover:bg-green-100";
  }
  return "bg-gray-100 text-gray-800 hover:bg-gray-100";
};

interface ProductItem {
  id: string;
  name: string;
  dealerId: string;
  mrp: number;
  gst: string;
  totalPrice: number;
  image: string;
}
type Params = { id: string };

function buildTrackingSteps(orderData: any) {
  if (!orderData) return [];

  const firstSku = orderData?.skus?.[0] || {};
  const skuTracking = firstSku?.tracking_info || {};
  const skuTimestamps = skuTracking?.timestamps || {};
  const orderTimestamps = orderData?.timestamps || {};
  const borzo = orderData?.order_track_info || skuTracking || {};
  const orderStatus = (orderData?.status || "").toLowerCase();

  // Get timestamps with proper fallbacks
  const confirmedAt = skuTimestamps?.confirmedAt || orderTimestamps?.createdAt || orderData?.createdAt;
  const assignedAt = skuTimestamps?.assignedAt || orderTimestamps?.assignedAt;
  const packedAt = skuTimestamps?.packedAt || orderTimestamps?.packedAt;
  const shippedAt = skuTimestamps?.shippedAt || orderTimestamps?.shippedAt;
  const deliveredAt = skuTimestamps?.deliveredAt || orderTimestamps?.deliveredAt;

  // Check if any dealer mapping has "packed" status
  const hasPackedStatus = orderData?.dealerMapping?.some((m: any) => 
    (m?.status || "").toLowerCase() === "packed"
  );

  // SIMPLIFIED LOGIC: Only show steps as completed based on actual order status
  // This ensures tracking matches the backend status exactly
  
  // Confirmed: Always true if order exists
  const isConfirmed = true;
  
  // Assigned: Only if order status is assigned or higher
  const isAssigned = ["assigned", "packed", "shipped", "delivered", "completed"].includes(orderStatus);
  
  // Packed: Only if order status is packed or higher
  const isPacked = ["packed", "shipped", "delivered", "completed"].includes(orderStatus);
  
  // Shipped: Only if order status is shipped or higher
  const isShipped = ["shipped", "delivered", "completed"].includes(orderStatus);
  
  // Delivered: Only if order status is delivered or completed
  const isDelivered = ["delivered", "completed"].includes(orderStatus);

  const borzoStatus = borzo?.borzo_order_status || "";
  const borzoUrl = borzo?.borzo_tracking_url;

  return [
    {
      title: "Confirmed",
      status: isConfirmed ? "completed" : "pending",
      description: "Your order has been confirmed.",
      time: confirmedAt ? formatDate(confirmedAt, { includeTime: true, timeFormat: "12h" }) : "",
      details: [],
    },
    {
      title: "Assigned",
      status: isAssigned ? "completed" : "pending",
      description: "Order assigned for processing.",
      time: assignedAt ? formatDate(assignedAt, { includeTime: true, timeFormat: "12h" }) : "",
      details: [],
    },
    {
      title: "Packed",
      status: isPacked ? "completed" : "pending",
      description: "Items packed and ready to ship.",
      time: packedAt ? formatDate(packedAt, { includeTime: true, timeFormat: "12h" }) : "",
      details: [],
    },
    {
      title: "Shipped",
      status: isShipped ? "completed" : "pending",
      description: borzoStatus ? `Courier: ${borzoStatus}${borzoUrl ? " (Track available)" : ""}` : "Shipment in progress",
      time: shippedAt ? formatDate(shippedAt, { includeTime: true, timeFormat: "12h" }) : "",
      details: [],
    },
    {
      title: "Delivered",
      status: isDelivered ? "completed" : "pending",
      description: isDelivered ? "Package delivered successfully" : "Your item will be delivered soon",
      time: deliveredAt ? formatDate(deliveredAt, { includeTime: true, timeFormat: "12h" }) : "",
      details: [],
    },
  ];
}

export default function OrderDetailsView() {
  const [loading, setLoading] = useState(true);
  const [dealerModalOpen, setDealerModalOpen] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState<any>(null); // State to hold dealer data for the modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const dispatch = useAppDispatch();

  const params = useParams<Params>();
  const orderId = params.id;
  console.log(orderId);
  // Product modal state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [order, setOrder] = useState<any>({});

  // Use the correct root state type and property name as per your store setup
  const orderById = useAppSelector(
    (state: any) => state.orderById.orders as any
  ); // Ensure it's treated as an object
  const loadingById = useAppSelector((state: any) => state.orderById.loading);
  const errorById = useAppSelector((state: any) => state.orderById.error);
  console.log(orderById);
  const auth = useAppSelector((state: any) => state.auth.user);
  const isAuthorized = ["Super-admin", "Fulfillment-Admin"].includes(auth?.role);
  
  // Simulate loading
  useEffect(() => {
    let timer: NodeJS.Timeout;
    async function fetchOrder() {
      dispatch(fetchOrderByIdRequest());
      try {
        const response = await getOrderById(orderId);

        const item = response.data;
        dispatch(fetchOrderByIdSuccess(item));

        timer = setTimeout(() => {
          setLoading(false);
        }, 2000);
      } catch (error: any) {
        console.error(`Failed to fetch order with id ${orderId}:`, error);
        dispatch(fetchOrderByIdFailure(error.message));
        setLoading(false);
      }
    }
    fetchOrder();

    return () => clearTimeout(timer);
  }, []);

  // Compute tracking steps from live order data
  const trackingSteps = useMemo(() => {
    console.log("Order data for tracking:", {
      status: orderById?.status,
      dealerMapping: orderById?.dealerMapping,
      timestamps: orderById?.timestamps,
      skus: orderById?.skus?.map((s: any) => ({
        tracking_info: s.tracking_info,
        timestamps: s.tracking_info?.timestamps
      }))
    });
    const steps = buildTrackingSteps(orderById);
    console.log("Computed tracking steps:", steps);
    console.log("Current order status:", orderById?.status, "Steps that should be completed based on status:", {
      confirmed: true, // Always true if order exists
      assigned: ["assigned", "packed", "shipped", "delivered", "completed"].includes(orderById?.status?.toLowerCase()),
      packed: ["packed", "shipped", "delivered", "completed"].includes(orderById?.status?.toLowerCase()),
      shipped: ["shipped", "delivered", "completed"].includes(orderById?.status?.toLowerCase()),
      delivered: ["delivered", "completed"].includes(orderById?.status?.toLowerCase())
    });
    return steps;
  }, [orderById]);

  // Loading Skeleton Component
  const LoadingSkeleton = () => (
    <div className="p-3 sm:p-4 lg:p-6 bg-(neutral-100)-50 min-h-screen">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 lg:mb-8">
        <div>
          <Skeleton className="h-6 sm:h-8 w-40 sm:w-48 mb-2" />
          <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 sm:h-6 w-12 sm:w-16" />
          <Skeleton className="h-8 sm:h-10 w-24 sm:w-28" />
        </div>
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {/* Left Column Skeleton */}
        <div className="space-y-4 lg:space-y-6">
          {/* Customer Information Skeleton */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3 lg:pb-4">
              <Skeleton className="h-5 lg:h-6 w-32 lg:w-40 mb-2" />
              <Skeleton className="h-3 lg:h-4 w-24 lg:w-32" />
            </CardHeader>
            <CardContent className="space-y-3 lg:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                <div>
                  <Skeleton className="h-3 lg:h-4 w-10 lg:w-12 mb-1" />
                  <Skeleton className="h-4 lg:h-5 w-24 lg:w-32" />
                </div>
                <div>
                  <Skeleton className="h-3 lg:h-4 w-10 lg:w-12 mb-1" />
                  <Skeleton className="h-4 lg:h-5 w-36 lg:w-48" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                <div>
                  <Skeleton className="h-3 lg:h-4 w-16 lg:w-20 mb-1" />
                  <Skeleton className="h-4 lg:h-5 w-28 lg:w-36" />
                </div>
                <div>
                  <Skeleton className="h-3 lg:h-4 w-20 lg:w-24 mb-1" />
                  <Skeleton className="h-4 lg:h-5 w-44 lg:w-56" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tracking Information Skeleton */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3 lg:pb-4">
              <Skeleton className="h-5 lg:h-6 w-36 lg:w-44 mb-2" />
              <Skeleton className="h-3 lg:h-4 w-28 lg:w-36" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4 lg:space-y-6">
                {[...Array(4)].map((_, index) => (
                  <div
                    key={index}
                    className="relative flex items-start gap-3 lg:gap-4"
                  >
                    <Skeleton className="w-3 h-3 lg:w-4 lg:h-4 rounded-full flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0 pb-4 lg:pb-6">
                      <Skeleton className="h-4 lg:h-5 w-24 lg:w-32 mb-1" />
                      <Skeleton className="h-3 lg:h-4 w-36 lg:w-48 mb-1" />
                      <Skeleton className="h-3 w-32 lg:w-40 mb-2" />
                      <Skeleton className="h-3 lg:h-4 w-44 lg:w-56 mb-1" />
                      <Skeleton className="h-3 w-28 lg:w-36" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Product Details Skeleton */}
        <div className="space-y-4 lg:space-y-6">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3 lg:pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <Skeleton className="h-5 lg:h-6 w-24 lg:w-32 mb-2" />
                  <Skeleton className="h-3 lg:h-4 w-36 lg:w-48" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 lg:h-4 w-16 lg:w-20" />
                  <Skeleton className="h-3 lg:h-4 w-3 lg:w-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Desktop Table Skeleton Only */}
              <div className="w-full">
                <table className="w-full table-fixed">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="py-3 px-4">
                        <Skeleton className="h-3 w-24" />
                      </th>
                      <th className="py-3 px-2">
                        <Skeleton className="h-3 w-16" />
                      </th>
                      <th className="py-3 px-2">
                        <Skeleton className="h-3 w-12" />
                      </th>
                      <th className="py-3 px-2">
                        <Skeleton className="h-3 w-8" />
                      </th>
                      <th className="py-3 px-2">
                        <Skeleton className="h-3 w-16" />
                      </th>
                      <th className="py-3 px-2">
                        <Skeleton className="h-3 w-16" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(4)].map((_, idx) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Skeleton className="w-8 h-8 rounded" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <Skeleton className="h-3 w-16" />
                        </td>
                        <td className="py-3 px-2">
                          <Skeleton className="h-3 w-12" />
                        </td>
                        <td className="py-3 px-2">
                          <Skeleton className="h-3 w-8" />
                        </td>
                        <td className="py-3 px-2">
                          <Skeleton className="h-3 w-16" />
                        </td>
                        <td className="py-3 px-2">
                          <Skeleton className="h-6 w-16 rounded" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  // No page-level restriction: everyone can view; actions remain gated below

  // Handler to open modal with dealer data
  const handleDealerEyeClick = async (dealerId: string) => {
    try {
      const res = await getDealerById(dealerId);
      const dealer = (res as any)?.data || (res as any);
      // Pass through raw dealer object; DealerIdentification resolves names dynamically
      setSelectedDealer({ ...dealer, dealerId: dealerId });
      setDealerModalOpen(true);
    } catch (e) {
      // Fallback: open modal with minimal info
      setSelectedDealer({ dealerId: dealerId });
      setDealerModalOpen(true);
    }
  };

  // Function to extract product data from orderById
  const product = (orderData: any) => {
    if (!orderData || !orderData.skus) {
      return [];
    }

    return orderData.skus.map((sku: any) => ({
      productId: sku.productId || sku._id,
      productName: sku.productName || "",
      dealerId: sku.dealerId || orderData.dealerMapping?.[0]?.dealerId || "N/A", // Get from dealerMapping or SKU
      sku: sku.sku || "",
      quantity: sku.quantity || 0,
      mrp: sku.mrp || 0, // This might need to be fetched from product details
      gst: sku.gst || orderData.GST || 0,
      totalPrice: sku.totalPrice || sku.quantity * (sku.mrp || 0), // Calculate if not provided
      _id: sku._id,
    }));
  };

  // Handler to open modal with product data
  const handleProductEyeClick = (product: any) => {
    setSelectedProduct({
      productId: product.productId || product.id,
      productName: product.productName || product.name,
      category: "Braking", // You can update this if you have category info
      brand: "Maruti Suzuki", // You can update this if you have brand info
      description:
        "High-quality front brake pads designed for Swift 2016 Petrol models. Ensures optimal braking performance and durability.", // Update as needed
      mrp: product.mrp,
      gst: product.gst,
      totalPrice: product.totalPrice,
      stockQuantity: 150, // Update as needed
      dealerPrice: 600.0, // Update as needed
      lastUpdated: "2025-07-22 10:30 AM", // Update as needed
      status: "Active", // Update as needed
      image: product.image,
      remarks:
        "Popular item, frequently restocked. Check for new models compatibility.", // Update as needed
    });
    setProductModalOpen(true);
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6 bg-(neutral-100)-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 lg:mb-8">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-2">
            Order Details
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">Order Overview</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={`px-2 sm:px-3 py-1 text-xs sm:text-sm ${getStatusBadgeClasses(orderById?.status)}`}>
            {orderById?.status || "Active"}
          </Badge>
          {isAuthorized && (
            <DynamicButton
              variant="outline"
              customClassName="border-gray-300 text-gray-700 hover:bg-gray-50 px-3 sm:px-4 h-8 sm:h-10 text-xs sm:text-sm"
              text="Cancel Order"
              onClick={() => setCancelModalOpen(true)}
            />
          )}
        </div>
      </div>

      {/* Order Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Order Date</p>
                <p className="font-semibold text-gray-900">
                  {orderById?.orderDate ? formatDate(orderById.orderDate, { includeTime: true }) : "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Type</p>
                <p className="font-semibold text-gray-900">
                  {orderById?.paymentType || "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Truck className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Delivery Type</p>
                <p className="font-semibold text-gray-900">
                  {orderById?.type_of_delivery || "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Package className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="font-semibold text-gray-900">
                  ₹{orderById?.order_Amount?.toLocaleString() || "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Order Date</p>
                <p className="font-semibold text-gray-900">
                  {orderById?.orderDate ? formatDate(orderById.orderDate, { includeTime: true }) : "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Type</p>
                <p className="font-semibold text-gray-900">
                  {orderById?.paymentType || "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Truck className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Delivery Type</p>
                <p className="font-semibold text-gray-900">
                  {orderById?.type_of_delivery || "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Package className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="font-semibold text-gray-900">
                  ₹{orderById?.order_Amount?.toLocaleString() || "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {/* Left Column */}
        <div className="space-y-4 lg:space-y-6">
          {/* Customer Information */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3 lg:pb-4">
              <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-gray-600" />
                Customer Information
              </CardTitle>
              <p className="text-xs sm:text-sm text-gray-600">
                Customer Details
              </p>
            </CardHeader>
            <CardContent className="space-y-3 lg:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 flex items-center gap-1">
                    <UserCheck className="h-3 w-3" />
                    Name
                  </p>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">
                    {orderById?.customerDetails?.name || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Email
                  </p>
                  <p className="font-medium text-gray-900 text-sm sm:text-base break-all">
                    {orderById?.customerDetails?.email || "-"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Phone Number
                  </p>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">
                    {orderById?.customerDetails?.phone || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Delivery Address
                  </p>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">
                    {orderById?.customerDetails?.address || "-"},{" "}
                    {orderById?.customerDetails?.pincode || ""}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tracking Information */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3 lg:pb-4">
              <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Truck className="h-5 w-5 text-gray-600" />
                Tracking Information
              </CardTitle>
              <p className="text-xs sm:text-sm text-gray-600">
                Check the order status
              </p>
            </CardHeader>
            <CardContent>
              {/* Vertical Progress Bar */}
              <div className="relative">
                {trackingSteps.map((step, index) => {
                  const isLast = index === trackingSteps.length - 1;
                  const isCompleted = step.status === "completed";
                  const nextStep = trackingSteps[index + 1];
                  const nextCompleted = nextStep && nextStep.status === "completed";
                  
                  // Determine connector color based on current and next step status
                  let connectorColor = "bg-gray-200";
                  if (isCompleted && nextCompleted) {
                    connectorColor = "bg-green-500";
                  } else if (isCompleted && !nextCompleted) {
                    connectorColor = "bg-green-500";
                  }
                  
                  const circleColor = isCompleted ? "bg-green-500" : "bg-gray-300";
                  
                  return (
                    <div key={index} className="relative flex items-start gap-4">
                      {/* Vertical Line - Only show if not the last step */}
                      {!isLast && (
                        <div
                          className={`absolute left-2 top-4 w-0.5 h-full ${connectorColor}`}
                        ></div>
                      )}

                      {/* Progress Circle */}
                      <div
                        className={`w-4 h-4 rounded-full flex-shrink-0 mt-1 relative z-10 ${circleColor}`}
                      ></div>

                      {/* Step Content */}
                      <div className="flex-1 min-w-0 pb-6">
                        <div className="flex items-center gap-1 mb-1">
                          <h3 className={`font-semibold ${isCompleted ? 'text-green-700' : 'text-gray-900'}`}>
                            {step.title}
                          </h3>
                        </div>
                        <p className={`text-sm mb-1 ${isCompleted ? 'text-green-600' : 'text-gray-700'}`}>
                          {step.description}
                        </p>
                        {step.time && (
                          <p className={`text-xs mb-2 ${isCompleted ? 'text-green-500' : 'text-gray-500'}`}>
                            {step.time}
                          </p>
                        )}

                        {/* Additional Details */}
                        {step.details.map((detail, detailIndex) => (
                          <div key={detailIndex} className="mb-1">
                            <p className="text-sm text-gray-600">{detail}</p>
                            <p className="text-xs text-gray-500">
                              Sun, 16 Jun '24 - 7:51 pm
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Borzo Tracking Information */}
              {orderById?.order_track_info && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Courier Tracking
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Status</p>
                      <p className="font-medium text-gray-900 text-sm">
                        {orderById.order_track_info.borzo_order_status || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Last Updated</p>
                      <p className="font-medium text-gray-900 text-sm">
                        {orderById.order_track_info.borzo_last_updated ? 
                          formatDate(orderById.order_track_info.borzo_last_updated, { includeTime: true }) : "-"}
                      </p>
                    </div>
                    {orderById.order_track_info.borzo_tracking_url && (
                      <div className="sm:col-span-2">
                        <p className="text-xs text-gray-600 mb-1">Tracking URL</p>
                        <a 
                          href={orderById.order_track_info.borzo_tracking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                        >
                          Track Package
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Product Details */}
        <div className="space-y-4 lg:space-y-6">
          <ProductDetailsForOrder
            products={product(orderById)}
            onProductEyeClick={handleProductEyeClick}
            onDealerEyeClick={handleDealerEyeClick}
            orderId={orderId}
          />

          {/* Order Summary */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3 lg:pb-4">
              <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">
                  ₹{(orderById?.order_Amount - (orderById?.GST || 0) - (orderById?.deliveryCharges || 0)).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">GST</span>
                <span className="font-medium text-gray-900">
                  ₹{orderById?.GST?.toLocaleString() || "0"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Delivery Charges</span>
                <span className="font-medium text-gray-900">
                  ₹{orderById?.deliveryCharges?.toLocaleString() || "0"}
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-semibold text-gray-900 text-lg">
                    ₹{orderById?.order_Amount?.toLocaleString() || "0"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* DealerIdentification Modal */}
      <DealerIdentification
        isOpen={dealerModalOpen}
        onClose={() => setDealerModalOpen(false)}
        dealerData={selectedDealer}
        orderId={String(orderById?._id || orderId)}
        skus={(orderById?.skus || []).map((s: any) => ({
          sku: s.sku,
          quantity: s.quantity,
          barcode: s.barcode || "",
          dealerId: s.dealerId || orderById?.dealerMapping?.[0]?.dealerId || ""
        }))}
      />
      {/* CancelOrder Modal */}
      {isAuthorized && (
        <CancelOrderModal
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
        />
      )}
      {/* Product Details Modal */}
      <ProductPopupModal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        productId={selectedProduct?.productId}
      />
    </div>
  );
}
