// Customer Details Interface
export interface CustomerDetails {
  userId: string;
  name: string;
  phone: string;
  address: string;
  pincode: string;
  email: string;
}

// SKU Interface
export interface SKU {
  sku: string;
  quantity: number;
  productId: string;
  productName: string;
  dealerMapped: any[];
  _id: string;
}

// Dealer Mapping Interface
export interface DealerMapping {
  sku: string;
  dealerId: string;
  status?: string;
  _id: string;
}

// Timestamps Interface
export interface Timestamps {
  createdAt: string;
  assignedAt?: string;
  packedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

// Order Details Interface
export interface OrderDetails {
  _id: string;
  orderId: string;
  orderDate: string;
  orderType: string;
  orderSource: string;
  skus: SKU[];
  order_Amount: number;
  customerDetails: CustomerDetails;
  paymentType: string;
  dealerMapping: DealerMapping[];
  status: string;
  timestamps: Timestamps;
  auditLogs: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  payment_id?: string | null;
}

// Dealer Order Interface
export interface DealerOrder {
  orderId: string;
  orderDetails: OrderDetails;
  status: string;
  customerDetails: CustomerDetails;
  DealerProducts: SKU[];
}

// API Response for getting orders by dealer
export interface DealerOrdersApiResponse {
  orders: DealerOrder[];
}

// Update Order Status Request Interface
export interface UpdateOrderStatusRequest {
  dealerId: string;
  orderId: string;
  total_weight_kg: number;
}

// Update Order Status Response Interface
export interface UpdateOrderStatusResponse {
  message: string;
  orderStatus: string;
  order: OrderDetails;
}

// Order Status Enum
export enum OrderStatus {
  PENDING = "Pending",
  ASSIGNED = "Assigned",
  PACKED = "Packed",
  SHIPPED = "Shipped",
  DELIVERED = "Delivered",
  CANCELLED = "Cancelled"
}

// Order Type Enum
export enum OrderType {
  ONLINE = "Online",
  OFFLINE = "Offline"
}

// Payment Type Enum
export enum PaymentType {
  COD = "COD",
  PREPAID = "Prepaid",
  CREDIT = "Credit"
}

// Dealer Pick List Item Interface
export interface DealerPickListItem {
  sku: string;
  quantity: number;
  barcode: string;
  _id: string;
}

// Dealer Pick List Interface
export interface DealerPickList {
  _id: string;
  linkedOrderId: string;
  dealerId: string;
  fulfilmentStaff: string;
  skuList: DealerPickListItem[];
  scanStatus: string;
  invoiceGenerated: boolean;
  updatedAt: string;
  createdAt: string;
  __v: number;
  dealerInfo: any;
}

// Dealer Pick List API Response
export interface DealerPickListApiResponse {
  success: boolean;
  message: string;
  data: DealerPickList[];
}
