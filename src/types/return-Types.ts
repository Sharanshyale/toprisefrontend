// Return Claims Type Definitions

export interface ReturnRequestsResponse {
  success: boolean;
  message: string;
  data: {
    returnRequests: ReturnRequest[];
    pagination: ReturnPagination;
  };
}

export interface SingleReturnResponse {
  success: boolean;
  message: string;
  data: ReturnRequest;
}

export interface ReturnRequest {
  _id: string;
  orderId: OrderInfo | null;
  customerId: string;
  sku: string;
  quantity: number;
  returnReason: string;
  returnDescription: string;
  returnImages: string[];
  isEligible: boolean;
  eligibilityReason: string;
  returnWindowDays: number;
  returnStatus: ReturnStatus;
  actionTaken: ReturnAction;
  originalOrderDate: string;
  dealerId?: string;
  notes: string[];
  pickupRequest: PickupRequest;
  inspection: InspectionDetails;
  refund: RefundDetails;
  timestamps: ReturnTimestamps;
  isProductReturnable: boolean;
  isWithinReturnWindow: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface OrderInfo {
  _id: string;
  orderId: string;
  orderDate: string;
  customerDetails: CustomerDetails;
}

export interface CustomerDetails {
  userId: string;
  name: string;
  phone: string;
  address: string;
  pincode: string;
  email: string;
}

export interface PickupRequest {
  pickupId: string;
  pickupAddress: Address;
  deliveryAddress: Address;
  scheduledDate: string;
  logisticsPartner: string;
  trackingNumber?: string;
  completedDate?: string;
}

export interface Address {
  address: string;
  city: string;
  pincode: string;
  state: string;
}

export interface InspectionDetails {
  skuMatch: boolean;
  inspectionImages: string[];
  isApproved: boolean;
  condition: InspectionCondition;
  conditionNotes: string;
  rejectionReason?: string;
  inspectedAt?: string;
  inspectedBy?: string;
}

export interface RefundDetails {
  refundAmount: number;
  refundMethod: RefundMethod;
  refundStatus: RefundStatus;
}

export interface ReturnTimestamps {
  requestedAt: string;
  validatedAt?: string;
  pickupScheduledAt?: string;
  pickupCompletedAt?: string;
  inspectionStartedAt?: string;
  inspectionCompletedAt?: string;
}

export interface ReturnPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Enums and Type Unions
export type ReturnStatus = 
  | "Requested"
  | "Validated" 
  | "Approved" 
  | "Rejected" 
  | "Pickup_Scheduled" 
  | "Pickup_Completed" 
  | "Approved"
  | "Refund_Processed"
  | "Completed"
  | "Under_Inspection";

export type ReturnAction = 
  | "Pending" 
  | "Approved" 
  | "Rejected" 
  | "Refund" 
  | "Replacement" 
  | "Store_Credit";

export type InspectionCondition = 
  | "New" 
  | "Good" 
  | "Fair" 
  | "Damaged" 
  | "Defective";

export type RefundMethod = 
  | "Original_Payment_Method" 
  | "Bank_Transfer" 
  | "Store_Credit" 
  | "Cash";

export type RefundStatus = 
  | "Pending" 
  | "Processing" 
  | "Completed" 
  | "Failed" 
  | "Cancelled";

// Filter and Search Types
export interface ReturnRequestFilters {
  returnStatus?: ReturnStatus[];
  actionTaken?: ReturnAction[];
  customerId?: string;
  orderId?: string;
  sku?: string;
  dealerId?: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  refundStatus?: RefundStatus[];
  inspectionCondition?: InspectionCondition[];
  logisticsPartner?: string;
}

export interface ReturnRequestSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: ReturnRequestFilters;
}

// Create/Update Types
export interface CreateReturnRequestPayload {
  orderId: string;
  customerId: string;
  sku: string;
  quantity: number;
  returnReason: string;
  returnDescription: string;
  returnImages: string[];
  dealerId?: string;
}

export interface UpdateReturnRequestPayload {
  returnStatus?: ReturnStatus;
  actionTaken?: ReturnAction;
  notes?: string[];
  inspection?: Partial<InspectionDetails>;
  refund?: Partial<RefundDetails>;
  pickupRequest?: Partial<PickupRequest>;
}

// API Response Types
export interface SingleReturnRequestResponse {
  success: boolean;
  message: string;
  data: ReturnRequest;
}

export interface ReturnRequestActionResponse {
  success: boolean;
  message: string;
  data?: {
    returnRequest: ReturnRequest;
    actionDetails?: any;
  };
}

// Statistics and Analytics Types
export interface ReturnRequestStats {
  totalReturns: number;
  pendingReturns: number;
  approvedReturns: number;
  rejectedReturns: number;
  totalRefundAmount: number;
  avgProcessingTime: number;
  returnsByReason: Record<string, number>;
  returnsByStatus: Record<ReturnStatus, number>;
}

export interface ReturnRequestStatsResponse {
  success: boolean;
  message: string;
  data: ReturnRequestStats;
}
