export interface ProductRequest {
  _id: string;
  productId: string;
  productName: string;
  skuCode: string;
  requestedBy: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_review';
  requestType: 'new_product' | 'update_product' | 'price_change' | 'stock_update' | 'category_change';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  requestedChanges?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  attachments?: string[];
  reviewedBy?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  reviewedAt?: string;
  reviewNotes?: string;
  estimatedCompletionDate?: string;
  actualCompletionDate?: string;
  tags?: string[];
  category?: string;
  subcategory?: string;
  brand?: string;
  estimatedCost?: number;
  impactLevel: 'low' | 'medium' | 'high';
  affectedSystems?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductRequestResponse {
  success: boolean;
  message: string;
  data: {
    requests: ProductRequest[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface ProductRequestStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  inReviewRequests: number;
  urgentRequests: number;
  highPriorityRequests: number;
  averageProcessingTime: number;
  requestsByType: {
    new_product: number;
    update_product: number;
    price_change: number;
    stock_update: number;
    category_change: number;
  };
  requestsByPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  recentActivity: {
    newRequests: number;
    processedRequests: number;
    averageResponseTime: number;
  };
}

export interface ProductRequestStatsResponse {
  success: boolean;
  message: string;
  data: ProductRequestStats;
}

export interface CreateProductRequestRequest {
  productId?: string;
  productName: string;
  skuCode?: string;
  requestType: 'new_product' | 'update_product' | 'price_change' | 'stock_update' | 'category_change';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  requestedChanges?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  category?: string;
  subcategory?: string;
  brand?: string;
  estimatedCost?: number;
  impactLevel: 'low' | 'medium' | 'high';
  affectedSystems?: string[];
  tags?: string[];
}

export interface UpdateProductRequestRequest {
  status?: 'pending' | 'approved' | 'rejected' | 'in_review';
  reviewNotes?: string;
  estimatedCompletionDate?: string;
  actualCompletionDate?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface ProductRequestFilters {
  status?: 'pending' | 'approved' | 'rejected' | 'in_review';
  requestType?: 'new_product' | 'update_product' | 'price_change' | 'stock_update' | 'category_change';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  requestedBy?: string;
  reviewedBy?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  search?: string;
}
