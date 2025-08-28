"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Eye, Clock, ChevronRight } from "lucide-react";
import { Productcard } from "./productCard";
import { getProductById, getProducts } from "@/service/product-Service";
import { useParams, useRouter } from "next/navigation";
import { Product } from "@/types/product-Types";
import { aproveProduct, deactivateProduct } from "@/service/product-Service";
import DynamicButton from "../../../common/button/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProductByIdSuccess, fetchProductByIdRequest, fetchProductByIdFailure } from "@/store/slice/product/productByIdSlice";
import RejectReason from "./tabs/Super-Admin/dialogue/RejectReason";
import SuperAdminDealersModal from "./SuperAdminDealersModal";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ViewProductDetails() {
  const [status, setStatus] = React.useState<string>("Created");
  const [product, setProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [isEditLoading, setIsEditLoading] = React.useState<boolean>(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [showDealersModal, setShowDealersModal] = React.useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = React.useState(false);
  const auth = useAppSelector((state) => state.auth.user);
  const id = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const allowedRoles = ["Super-admin", "Inventory-Admin", "Inventory-Staff"];
  const getStatusColor = (currentStatus: string) => {
    switch (currentStatus) {
      case "Created":
        return "text-gray-600 bg-gray-50 border-gray-200";
      case "Approved":
        return "text-green-600 bg-green-50 border-green-200";
      case "Pending":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "Rejected":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };
  // Function to handle product approval
  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
    if (newStatus === "Approved") {
      await aproveProduct(id.id);
    } else if (newStatus === "Pending") {
      await deactivateProduct(id.id);
    }
    else if (newStatus === "Rejected") {
      setIsRejectDialogOpen(true);
    }
  };
  const handleEdit = (idObj: { id: string }) => {
    setIsEditLoading(true);
    router.push(`/user/dashboard/product/productedit/${idObj.id}`);
  };
  React.useEffect(() => {
    const fetchProducts = async () => {
        dispatch(fetchProductByIdRequest());
      try {
        const response = await getProductById(id.id);
        // response is ProductResponse, which has data: Product[]
        const data = response.data;
        let prod: Product | null = null;
        if (Array.isArray(data) && data.length > 0) {
          prod = data[0];
        } else if (
          typeof data === "object" &&
          data !== null &&
          !Array.isArray(data)
        ) {
          prod = data as any;
        }
        setProduct(prod);
        dispatch(fetchProductByIdSuccess(prod));
        if (prod && prod.live_status) {
          setStatus(prod.live_status);
        }
        console.log("getProducts API response:", response);
      } catch (error) {
        console.error("getProducts API error:", error);
        dispatch(fetchProductByIdFailure(error as string));
      }
    };
    fetchProducts();
  }, []);

  // Update status if product changes
  React.useEffect(() => {
    if (product && product.live_status) {
      setStatus(product.live_status);
    }
  }, [product]);

  return (
    <div className="min-h-screen bg-(neutral-100)-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 font-sans">
              Product Overview
            </h1>
            <p className="text-base font-medium font-sans text-gray-500">
              Add your product description
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select onValueChange={handleStatusChange} value={status} disabled={!allowedRoles.includes(auth.role)}>
              <SelectTrigger
                className={`min-w-[120px] ${getStatusColor(status)}`}
                disabled={!allowedRoles.includes(auth.role)}
              >
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Created">Created</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            {allowedRoles.includes(auth.role) && (
              <DynamicButton
                variant="outline"
                customClassName="bg-red-50 border-red-200 hover:bg-red-100 hover:text-red-600 text-red-600"
                onClick={() => handleEdit(id)}
                text="Edit Product"
                icon={<Pencil />}
              />
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 space-y-8">
        {/* Core Product Identity */}
        <div>
          <Productcard
            title="Core Product Identity"
            description="the core identifiers that define the product's identity, brand, and origin."
            data={
              product
                ? [
                    { label: "SKU Code", value: product.sku_code || "-" },
                    {
                      label: "Manufacturer Part Number (MPN)",
                      value: product.manufacturer_part_name || "-",
                    },
                    {
                      label: "Product Name",
                      value: product.product_name || "-",
                    },
                    { label: "Brand", value: product.brand?.brand_name || "-" },
                    {
                      label: "Category",
                      value: product.category?.category_name || "-",
                    },
                    {
                      label: "Sub-category",
                      value: product.sub_category?.subcategory_name || "-",
                    },
                    {
                      label: "Product Type",
                      value: product.product_type || "-",
                    },
                    { label: "HSN Code", value: product.hsn_code || "-" },
                  ]
                : []
            }
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vehicle Compatibility */}
          <Productcard
            title="Vehicle Compatibility"
            description="The vehicle make, model, and variant the product is compatible with."
            data={
              product
                ? [
                    {
                      label: "Make",
                      value: Array.isArray(product.make)
                        ? product.make.join(", ")
                        : "-",
                    },
                    { label: "Model", value: product.model?.model_name || "-" },
                    {
                      label: "Year Range",
                      value: Array.isArray(product.year_range)
                        ? product.year_range.map((y) => y.year_name).join(", ")
                        : "-",
                    },
                    {
                      label: "Variant",
                      value: Array.isArray(product.variant)
                        ? product.variant.map((v) => v.variant_name).join(", ")
                        : "-",
                    },
                    {
                      label: "Fitment Notes",
                      value: product.fitment_notes || "-",
                    },
                    {
                      label: "Is Universal",
                      value: product.is_universal ? "True" : "False",
                    },
                  ]
                : []
            }
          />

          {/* Technical Specifications */}
          <Productcard
            title="Technical Specifications"
            description="Relevant technical details to help users understand the product quality and features."
            data={
              product
                ? [
                    {
                      label: "Key Specifications",
                      value: product.key_specifications || "-",
                    },
                    {
                      label: "Dimensions",
                      value: product.weight ? `${product.weight} kg` : "-",
                    },
                    {
                      label: "Certifications",
                      value: product.certifications || "-",
                    },
                    {
                      label: "Warranty",
                      value: product.warranty
                        ? `${product.warranty} months`
                        : "-",
                    },
                    {
                      label: "Is Consumable",
                      value: product.is_consumable ? "True" : "False",
                    },
                  ]
                : []
            }
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Media & Assets */}
          <Productcard
            title="Media & Assets"
            description="product images, videos, and brochures to enhance visual representation and credibility."
            data={[]}
          >
            <div className="col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-3 ">
                {product && Array.isArray(product.images) && product.images.length > 0 ? (
                  <>
                    {/* Show the first image as main */}
                    <img
                      src={product.images[0]}
                      alt="Main"
                      className="aspect-video bg-gray-200 rounded-md object-cover"
                    />
                    {/* Show remaining images, if any */}
                    <div className={`grid grid-cols-2 gap-2`}>
                      {product.images
                        .slice(1)
                        .map((img: string, idx: number) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`img-${idx + 1}`}
                            className="aspect-square bg-gray-200 rounded-md object-cover"
                          />
                        ))}
                    </div>
                  </>
                ) : (
                  // No images at all
                  <div className="col-span-2 aspect-video bg-gray-200 rounded-md" />
                )}
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 ">Video URL</span>
                  {/* No videoUrl in Product, so show N/A */}
                  <span className="text-sm text-gray-400">N/A</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Brochure Available
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {product && typeof product.brochure_available === "boolean"
                      ? product.brochure_available ? "True" : "False"
                      : "False"}
                  </span>
                </div>
              </div>
            </div>
          </Productcard>

          {/* Pricing & Tax */}
          <Productcard
            title="Pricing & Tax"
            description="The pricing and tax information required for listing and billing."
            data={
              product
                ? [
                    {
                      label: "MRP (with GST)",
                      value: product.mrp_with_gst
                        ? `₹${product.mrp_with_gst}`
                        : "-",
                    },
                    {
                      label: "GST %",
                      value: product.gst_percentage
                        ? String(product.gst_percentage)
                        : "-",
                    },
                    {
                      label: "Returnable",
                      value: product.is_returnable ? "True" : "False",
                    },
                    {
                      label: "Return Policy",
                      value: product.return_policy || "-",
                    },
                  ]
                : []
            }
          />
        </div>

        {/* Bottom Section */}
        <div className="space-y-6">
          {/* Dealer-Level Mapping & Routing */}
          <Productcard
            title="Dealer-Level Mapping & Routing"
            description="the core identifiers that define the product's identity, brand, and origin."
            data={
              product
                ? [
                    {
                      label: "Quantity per Dealer",
                      value:
                        product.no_of_stock !== undefined
                          ? String(product.no_of_stock)
                          : "-",
                    },
                    {
                      label: "Dealer Priority Override",
                      value:
                        product.fulfillment_priority !== undefined
                          ? String(product.fulfillment_priority)
                          : "-",
                    },
                    {
                      label: "Last Stock Update",
                      value: product.available_dealers && Array.isArray(product.available_dealers) && product.available_dealers.length > 0 
                        ? product.available_dealers[0]?.last_stock_update || "-"
                        : "-",
                    },
                    {
                      label: "Last Inquired At",
                      value: product.last_stock_inquired || "-",
                    },
                  ]
                : []
            }
          >
            {product && product.available_dealers && Array.isArray(product.available_dealers) && product.available_dealers.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">Available Dealers</h4>
                  <DynamicButton
                    variant="outline"
                    customClassName="text-red-600 border-red-200 hover:bg-red-50 text-sm px-1 py-1"
                    onClick={() => setShowDealersModal(true)}
                    icon={<Eye className="w-4 h-4" />}
                    text="View All"
                  />
                </div>
              </div>
            )}
          </Productcard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SEO & Search Optimization */}
            <Productcard
              title="SEO & Search Optimization"
              description="The pricing and tax information required for listing and billing."
              data={
                product
                  ? [
                      { label: "SEO Title", value: product.seo_title || "-" },
                      {
                        label: "SEO Description",
                        value: product.seo_description || "-",
                      },
                      {
                        label: "Search Tags",
                        value: Array.isArray(product.search_tags)
                          ? product.search_tags.join(", ")
                          : "-",
                      },
                    ]
                  : []
              }
            />

            {/* Product History */}
            <Productcard
              title="Product History"
              description="Track the history of changes and modifications made to this product."
              data={
                product
                  ? [
                      { label: "Product Version", value: product.product_Version || "-" },
                      {
                        label: "Iteration Number",
                        value: product.iteration_number ? String(product.iteration_number) : "-",
                      },
                      {
                        label: "Live Status",
                        value: product.live_status || "-",
                      },
                      {
                        label: "QC Status",
                        value: product.Qc_status || "-",
                      },
                      {
                        label: "Created At",
                        value: product.created_at ? new Date(product.created_at).toLocaleDateString() : "-",
                      },
                      {
                        label: "Last Updated",
                        value: product.updated_at ? new Date(product.updated_at).toLocaleDateString() : "-",
                      },
                    ]
                  : []
              }
                         >
               {product && product.change_logs && Array.isArray(product.change_logs) && product.change_logs.length > 0 && (
                 <div className="mt-4">
                   <div className="flex items-center justify-between mb-3">
                     <h4 className="text-sm font-medium text-gray-700">Change History</h4>
                     {product.change_logs.length > 3 && (
                       <DynamicButton
                         variant="outline"
                         customClassName="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs px-2 py-1"
                         onClick={() => setShowHistoryDrawer(true)}
                         icon={<ChevronRight className="w-3 h-3" />}
                         text="View More"
                       />
                     )}
                   </div>
                   <div className="space-y-3">
                     {product.change_logs.slice(0, 3).map((log: any, index: number) => (
                       <div key={log._id || index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                         <div className="flex items-center justify-between mb-2">
                           <span className="text-xs font-medium text-gray-600">
                             Iteration {log.iteration_number}
                           </span>
                           <span className="text-xs text-gray-500">
                             {new Date(log.modified_At).toLocaleDateString()}
                           </span>
                         </div>
                         <div className="text-xs text-gray-700 mb-1">
                           <span className="font-medium">Modified by:</span> {log.modified_by}
                         </div>
                         <div className="text-xs text-gray-700 mb-1">
                           <span className="font-medium">Changes:</span> {log.changes}
                         </div>
                         <div className="text-xs text-gray-600">
                           <details className="cursor-pointer">
                             <summary className="font-medium text-gray-700">View Details</summary>
                             <div className="mt-2 space-y-1">
                               <div>
                                 <span className="font-medium">Old Value:</span>
                                 <pre className="text-xs bg-gray-100 p-1 rounded mt-1 overflow-x-auto">
                                   {log.old_value}
                                 </pre>
                               </div>
                               <div>
                                 <span className="font-medium">New Value:</span>
                                 <pre className="text-xs bg-gray-100 p-1 rounded mt-1 overflow-x-auto">
                                   {log.new_value}
                                 </pre>
                               </div>
                             </div>
                           </details>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
            </Productcard>
          </div>
        </div>
      </div>
           <RejectReason
                    isOpen={isRejectDialogOpen}
                    onClose={() => setIsRejectDialogOpen(false)}
                    onSubmit={(data) => {
                   
                      setIsRejectDialogOpen(false);
                 
                    }}
                  />
      
             {/* Super Admin Dealers Modal */}
       <SuperAdminDealersModal
         open={showDealersModal}
         onClose={() => setShowDealersModal(false)}
         product={product}
       />

       {/* Product History Timeline Drawer */}
       <Sheet open={showHistoryDrawer} onOpenChange={setShowHistoryDrawer}>
         <SheetContent className="w-[600px] sm:w-[600px] overflow-y-auto bg-gray-50">
           <SheetHeader className="bg-white p-6 border-b border-gray-200 -mx-6 -mt-6 mb-6">
             <SheetTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
               <div className="p-2 bg-blue-100 rounded-lg">
                 <Clock className="h-6 w-6 text-blue-600" />
               </div>
               <div>
                 <div>Product Change History</div>
                 <div className="text-sm font-normal text-gray-500 mt-1">
                   Complete timeline of all product modifications
                 </div>
               </div>
             </SheetTitle>
           </SheetHeader>
           
           {product && product.change_logs && Array.isArray(product.change_logs) && (
             <ScrollArea className="h-full px-2">
               <div className="space-y-6">
                 {product.change_logs.map((log: any, index: number) => (
                   <div key={log._id || index} className="relative">
                     {/* Timeline connector */}
                     {index < product.change_logs.length - 1 && (
                       <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                     )}
                     
                     <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                       <div className="flex items-start gap-4">
                         {/* Timeline dot */}
                         <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                           <span className="text-sm font-semibold text-blue-600">
                             {log.iteration_number}
                           </span>
                         </div>
                         
                         <div className="flex-1 min-w-0">
                           <div className="flex items-center justify-between mb-3">
                             <h3 className="text-lg font-semibold text-gray-900">
                               Iteration {log.iteration_number}
                             </h3>
                             <span className="text-sm text-gray-500">
                               {new Date(log.modified_At).toLocaleDateString()} at {new Date(log.modified_At).toLocaleTimeString()}
                             </span>
                           </div>
                           
                           <div className="space-y-3">
                             <div className="flex items-center gap-2">
                               <span className="text-sm font-medium text-gray-700">Modified by:</span>
                               <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                 {log.modified_by}
                               </span>
                             </div>
                             
                             <div>
                               <span className="text-sm font-medium text-gray-700">Changes:</span>
                               <div className="mt-1 flex flex-wrap gap-1">
                                 {log.changes.split(', ').map((change: string, idx: number) => (
                                   <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                     {change.trim()}
                                   </span>
                                 ))}
                               </div>
                             </div>
                             
                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                               <div>
                                 <span className="text-sm font-medium text-gray-700">Previous Values:</span>
                                 <pre className="text-xs bg-gray-50 p-3 rounded-lg border border-gray-200 mt-1 overflow-x-auto text-gray-700">
                                   {log.old_value}
                                 </pre>
                               </div>
                               <div>
                                 <span className="text-sm font-medium text-gray-700">New Values:</span>
                                 <pre className="text-xs bg-green-50 p-3 rounded-lg border border-green-200 mt-1 overflow-x-auto text-green-700">
                                   {log.new_value}
                                 </pre>
                               </div>
                             </div>
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             </ScrollArea>
           )}
         </SheetContent>
       </Sheet>
     </div>
   );
 }
