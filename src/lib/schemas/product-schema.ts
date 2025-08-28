import { z } from "zod";

export const dealerProductSchema = z.object({
  // Core Product Identity
  sku_code: z.string().min(1, "SKU Code is required"),
  manufacturer_part_name: z.string().optional(),
  product_name: z.string().min(1, "Product Name is required"),
  brand: z.string().optional(),
  hsn_code: z.number().optional(),
  category: z.string().min(1, "Category is required"),
  sub_category: z.string().min(1, "Sub-category is required"),
  product_type: z.string().min(1, "Product type is required"),
  vehicle_type: z.string().optional(),
  // Added fields
  no_of_stock: z.coerce
    .number()
    .int({ message: "No. of Stock must be an integer" }),

  updatedBy: z.string().optional(),
  fulfillment_priority: z.coerce
    .number()
    .int({ message: "Fulfillment Priority must be an integer" })
    .optional(),
  admin_notes: z.string().optional(),
  // Vehicle Compatibility
  make: z.string().min(1, "Make is required"),
  // make2: z.string().optional(),
  model: z.string().min(1, "Model is required"),
  year_range: z.string().optional(),
  variant: z.string().min(1, "Variant is required"),
  fitment_notes: z.string().optional(),
  is_universal: z.boolean().optional(),
  is_consumable: z.boolean().optional(),
  // Technical Specifications
  keySpecifications: z.string().optional(),
  dimensions: z.string().optional(),
  weight: z.string().optional(),
  certifications: z.string().optional(),
  warranty: z.number().optional(),
  // Media & Documentation
  images: z.string().optional(), // Assuming string for now, could be FileList later
  videoUrl: z.string().optional(),
  brochure_available: z.string().optional(),
  // Pricing details
  mrp_with_gst: z.number().min(1, "MRP is required"),
  gst_percentage: z.number().min(1, "GST is required"),
  selling_price: z.number().min(1, "Selling Price is required"),

  // Return & Availability
  is_returnable: z.boolean(),
  return_policy: z.string().min(1, "Return Policy is required"),
  // Dealer-Level Mapping & Routing
  availableDealers: z.string().optional(),
  quantityPerDealer: z.string().optional(),
  dealerMargin: z.string().optional(),
  dealerPriorityOverride: z.string().optional(),
  stockExpiryRule: z.string().optional(),
  lastStockUpdate: z.string().optional(),
  LastinquiredAt: z.string().optional(),
  // Status, Audit & Metadata
  active: z.string().optional(),
  createdBy: z.string().optional(),
  modifiedAtBy: z.string().optional(),
  changeLog: z.string().optional(),
  // SEO & Search Optimization
  seo_title: z.string().optional(),
  searchTags: z.string().optional(),
  search_tags: z.array(z.string()).optional(),
  seo_description: z.string().optional(),
  created_by: z.string().optional(),
  // Dealer ID field
  addedByDealerId: z.string().optional(),
});
