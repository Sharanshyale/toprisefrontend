export interface Brand {
  _id: string;
  brand_name: string;
  brand_code: string;
  type: string;
  created_by: string;
  updated_by: string;
  brand_logo: string;
  status: string;
  created_at: string;
  updated_at: string;
  __v: number;
  featured_brand: boolean;
}

export interface Category {
  _id: string;
  category_name: string;
  type: string;
  category_code: string;
  category_image: string;
  category_Status: string;
  category_description: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  __v: number;
}

export interface SubCategory {
  _id: string;
  subcategory_name: string;
  subcategory_code: string;
  subcategory_status: string;
  subcategory_image: string;
  subcategory_description: string;
  created_by: string;
  updated_by: string[]; 
  category_ref: string;
  created_at: string;
  updated_at: string;
  __v: number;
}

export interface Model {
  _id: string;
  model_name: string;
  model_code: string;
  brand_ref: string;
  model_image: string;
  created_by: string;
  updated_by: string;
  status: string;
  created_at: string;
  updated_at: string;
  __v: number;
}

export interface YearRange {
  _id: string;
  year_name: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  __v: number;
}

export interface VariantUpdateLog {
  updated_by: string;
  change_logs: string;
  _id: string;
  updated_at: string;
}

export interface Variant {
  _id: string;
  variant_name: string;
  variant_code: string;
  Year: string[];
  model: string;
  created_by: string;
  updated_by: VariantUpdateLog[];
  variant_status: string;
  variant_Description: string;
  created_at: string;
  updated_at: string;
  __v: number;
}

export interface ChangeLog {
  iteration_number: number;
  modified_At: string;
  modified_by: string;
  changes: string;
  _id: string;
  old_value?: string;
  new_value?: string;
}

export interface AvailableDealer {
  dealers_Ref: string;
  quantity_per_dealer?: number;
  dealer_margin?: number;
  dealer_priority_override?: number;
  last_stock_update?: string;
  inStock?: boolean;
}

export interface Product {
  _id: string;
  id: string; // Make this required, not optional
  sku_code: string;
  manufacturer_part_name: string;
  no_of_stock: number;
  product_name: string;
  brand: Brand;
  hsn_code: string;
  out_of_stock: boolean;
  category: Category;
  sub_category: SubCategory;
  product_type: string;
  is_universal: boolean;
  is_consumable: boolean;
  make: string[];
  model: Model;
  year_range: YearRange[];
  variant: Variant[];
  fitment_notes: string;
  fulfillment_priority: number;
  product_Version: string;
  admin_notes: string;
  key_specifications: string;
  weight: number;
  certifications: string;
  warranty: number;
  images: string[];
  brochure_available: boolean;
  seo_title: string;
  seo_description: string;
  seo_metaData: string;
  search_tags: string[];
  mrp_with_gst: number;
  selling_price: number;
  gst_percentage: number;
  is_returnable: boolean;
  return_policy: string;
  live_status: string;
  Qc_status: string;
  created_by: string;
  iteration_number: number;
  last_stock_inquired: string;
  created_at: string;
  updated_at: string;
  rejection_state: any[];
  __v: number;
  dimensions: string;
  change_logs: ChangeLog[];
  available_dealers: AvailableDealer[];
}

export interface ProductsApiResponse {
  success: boolean;
  message: string;
  data: Product[];
}

export interface UserPermissions {
  allowedFields: string[];
  read: boolean;
  write: boolean;
  update: boolean;
  delete: boolean;
}

export interface PermissionCheckResponse {
  message: string;
  hasPermission: boolean;
  data: {
    permissionModule: string;
    role: string;
    userPermissions: UserPermissions;
  };
}

// --- Update Stock By Dealer API Types ---
export interface UpdateStockByDealerRequest {
  dealerId: string;
  quantity: number;
}

export interface UpdateStockByDealerResponse {
  success: boolean;
  message: string;
  data?: any;
}

// --- Bulk Upload By Dealer API Types ---
export interface BulkUploadByDealerRequest {
  dataFile: File;
  imageZip: File;
  dealerId: string;
}

export interface BulkUploadByDealerResponse {
  success: boolean;
  message: string;
  data?: any;
  errors?: string[];
  uploadedCount?: number;
  failedCount?: number;
}

