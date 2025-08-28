export interface orderResponse {
    success: boolean;
    message: string;
    data: Order[];
}
interface Order {
  _id: string;
  orderId: string;
  orderDate: string; 
  deliveryCharges: number;
  GST: number;
  orderType: string;
  orderSource: string;
  skus: Array<{
    sku: string;
    quantity: number;
    productId: string;
    productName: string;
    _id: string;
  }>;
  order_Amount: number;
  customerDetails: {
    userId: string;
    name: string;
    phone: string;
    address: string;
    pincode: string;
    email: string;
    userInfo: null | any; 
  };
  paymentType: string;
  status: string;
  timestamps: {
    createdAt: string; 
  };
  dealerMapping: any[]; 
  auditLogs: any[];     
  createdAt: string;    
  updatedAt: string;    
  __v: number;
}

// Picklist types for OMS operations
export interface PicklistSkuItem {
  sku: string;
  quantity: number;
  barcode: string;
  _id?: string;
}

export interface Picklist {
  _id: string;
  linkedOrderId: string;
  dealerId: string;
  fulfilmentStaff: string;
  skuList: PicklistSkuItem[];
  scanStatus: string;
  invoiceGenerated: boolean;
  updatedAt: string;
  createdAt: string;
  __v: number;
  dealerInfo: any | null;
}

export interface PicklistResponse {
  success: boolean;
  message: string;
  data: Picklist[];
}

// Requests for Assign Dealers → Create Picklist → Assign Picklist → Pack
export interface AssignDealersRequest {
  orderId: string;
  assignments: Array<{ sku: string; dealerId: string }>;
}

export interface CreatePicklistRequest {
  orderId: string;
  dealerId: string;
  fulfilmentStaff: string;
  skuList: PicklistSkuItem[];
}

export interface AssignPicklistRequest {
  picklistId: string;
  staffId: string;
}

export interface UpdateOrderStatusByDealerRequest {
  orderId: string;
  dealerId: string;
  total_weight_kg: number;
}