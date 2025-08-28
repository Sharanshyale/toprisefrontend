// Payment Details Types
export interface PaymentDetailsResponse {
  success: boolean;
  message: string;
  data: {
    data: PaymentDetail[];
    pagination: PaymentPagination;
  };
}

export interface PaymentDetail {
  _id: string;
  order_id: string | null;
  razorpay_order_id: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  amount: number;
  created_at: string;
  is_refund: boolean;
  refund_successful: boolean;
  __v: number;
  acquirer_data?: AcquirerData;
  payment_id?: string;
}

export interface AcquirerData {
  bank_transaction_id?: string;
  rrn?: string;
  upi_transaction_id?: string;
}

export type PaymentMethod = 
  | "netbanking"
  | "upi"
  | "Razorpay"
  | "card"
  | "wallet";

export type PaymentStatus = 
  | "paid"
  | "created"
  | "Created"
  | "failed"
  | "refunded"
  | "pending";

// Additional utility types for payment filtering and management
export interface PaymentFilters {
  payment_method?: PaymentMethod;
  payment_status?: PaymentStatus;
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
  is_refund?: boolean;
}

export interface PaymentSummary {
  total_payments: number;
  total_amount: number;
  successful_payments: number;
  failed_payments: number;
  pending_payments: number;
  refunded_payments: number;
}

// Pagination interface for payment details
export interface PaymentPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Single Payment Detail Response (for getPaymentDetailsById)
export interface PaymentDetailByIdResponse {
  success: boolean;
  message: string;
  data: PaymentDetail;
}

// For creating/updating payment records (if needed)
export type CreatePaymentPayload = Omit<PaymentDetail, '_id' | 'created_at' | '__v'>;
export type UpdatePaymentPayload = Partial<Pick<PaymentDetail, 'payment_status' | 'is_refund' | 'refund_successful' | 'acquirer_data' | 'payment_id'>>;
