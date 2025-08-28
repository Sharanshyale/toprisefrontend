export interface ProductResponse {
  success: boolean;
  message: string;
  data: {
    products: Product[];
    pagination: Pagination;
  }
}

export interface AvailableDealers {
  dealers_Ref?: string;
  quantity_per_dealer?: number;
  dealer_margin?: number;
  aler_margin?: string;
  dealer_priority_override?: string;
  inStock?: boolean;
  last_stock_update?: string;
}

export interface Product {
  available_dealers: AvailableDealers[];
  Qc_status: string;
  _id: string;
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
  created_by: string;
  iteration_number: number;
  last_stock_inquired: string;
  created_at: string;
  updated_at: string;
  rejection_state: any[];
  change_logs: any[];
  __v: number;
}

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
  main_category: boolean;
  _id: string;
  category_name: string;
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
  updated_by: string;
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

export interface Variant {
  _id: string;
  variant_name: string;
  variant_code: string;
  Year: string[];
  model: string;
  created_by: string;
  updated_by: VariantUpdate[];
  variant_status: string;
  variant_Description: string;
  created_at: string;
  updated_at: string;
  __v: number;
}

export interface VariantUpdate {
  updated_by: string;
  change_logs: string;
  _id: string;
  updated_at: string;
}
export interface Pagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export type AddProductPayload = Omit<Product, '_id' | 'created_at' | 'updated_at' | 'Qc_status' | 'available_dealers' | 'brand' | 'category' | 'sub_category' | 'model' | 'year_range' | 'variant' | 'created_by' | 'iteration_number' | 'last_stock_inquired' | 'rejection_state' | 'change_logs' | '__v'>;
