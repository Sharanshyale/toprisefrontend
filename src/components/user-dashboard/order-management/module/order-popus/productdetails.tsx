"use client"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from "@/components/ui/dialog"
import { getProductById } from "@/service/product-Service"

interface ProductPopupModalProps {
  isOpen: boolean
  onClose: () => void
  productId?: string
}

export default function ProductPopupModal({ isOpen, onClose, productId = "" }: ProductPopupModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [product, setProduct] = useState<any | null>(null)

  useEffect(() => {
    async function fetchProduct() {
      if (!isOpen || !productId) {
        setProduct(null)
        return
      }
      try {
        setLoading(true)
        setError("")
        const res = await getProductById(productId)
        
        const data = (res as any)?.data ?? res
        const prod = Array.isArray(data?.products) ? data.products[0] : data
        setProduct(prod || null)
      } catch (e: any) {
        setError("Failed to load product")
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [isOpen, productId])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="bg-transparent" />
      <DialogContent className="w-full max-w-5xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
        <DialogHeader className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">Product Details</DialogTitle>
              <p className="text-sm text-gray-500">SKU level information</p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh] bg-gray-50">
          {loading && <div className="text-sm text-gray-600">Loading...</div>}
          {error && !loading && <div className="text-sm text-red-600">{error}</div>}
          {!loading && !error && (
            <>
              {/* Core Product Identity */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Core Product Identity</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Product Name</p>
                      <p className="text-base font-semibold text-gray-900">{product?.product_name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">SKU Code</p>
                      <p className="text-base font-semibold text-gray-900">{product?.sku_code || productId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">MPN</p>
                      <p className="text-base font-semibold text-gray-900">{product?.manufacturer_part_name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Brand</p>
                      <p className="text-base font-semibold text-gray-900">{product?.brand?.brand_name || "-"}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Category</p>
                      <p className="text-base font-semibold text-gray-900">{product?.category?.category_name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Sub-category</p>
                      <p className="text-base font-semibold text-gray-900">
                        {product?.sub_category?.subcategory_name || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Product Type</p>
                      <p className="text-base font-semibold text-gray-900">{product?.product_type || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">HSN Code</p>
                      <p className="text-base font-semibold text-gray-900">{product?.hsn_code || "-"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle Compatibility */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Vehicle Compatibility</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Make</p>
                      <p className="text-base font-semibold text-gray-900">
                        {Array.isArray(product?.make) ? product.make.join(", ") : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Model</p>
                      <p className="text-base font-semibold text-gray-900">{product?.model?.model_name || "-"}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Year Range</p>
                      <p className="text-base font-semibold text-gray-900">
                        {Array.isArray(product?.year_range)
                          ? product.year_range.map((y: any) => y.year_name).join(", ")
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Variant</p>
                      <p className="text-base font-semibold text-gray-900">
                        {Array.isArray(product?.variant)
                          ? product.variant.map((v: any) => v.variant_name).join(", ")
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-xs text-gray-500">Fitment Notes</p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{product?.fitment_notes || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Is Universal</p>
                    <p className="text-base font-semibold text-gray-900">{product?.is_universal ? "True" : "False"}</p>
                  </div>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Technical Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Key Specifications</p>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{product?.key_specifications || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Certifications</p>
                      <p className="text-sm text-gray-800">{product?.certifications || "-"}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Warranty</p>
                      <p className="text-sm text-gray-800">{product?.warranty ? `${product.warranty} months` : "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Weight</p>
                      <p className="text-sm text-gray-800">{product?.weight ?? "-"} kg</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Is Consumable</p>
                      <p className="text-sm text-gray-800">{product?.is_consumable ? "True" : "False"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Media & Assets */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Media & Assets</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {product && Array.isArray(product.images) && product.images.length > 0 ? (
                        <>
                          <img
                            src={product.images[0]}
                            alt="Main"
                            className="aspect-video bg-gray-200 rounded-md object-cover"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            {product.images.slice(1).map((img: string, idx: number) => (
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
                        <div className="col-span-2 aspect-video bg-gray-200 rounded-md" />
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Video URL</span>
                      <span className="text-sm text-gray-400">N/A</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Brochure Available</span>
                      <span className="text-sm font-medium text-gray-900">
                        {typeof product?.brochure_available === "boolean"
                          ? product.brochure_available
                            ? "True"
                            : "False"
                          : "False"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing & Tax */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Pricing & Tax</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">MRP (with GST)</p>
                    <p className="text-base font-semibold text-gray-900">
                      {product?.mrp_with_gst ? `₹${product.mrp_with_gst}` : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">GST %</p>
                    <p className="text-base font-semibold text-gray-900">{product?.gst_percentage ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Returnable</p>
                    <p className="text-base font-semibold text-gray-900">{product?.is_returnable ? "True" : "False"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Return Policy</p>
                    <p className="text-sm text-gray-800">{product?.return_policy || "-"}</p>
                  </div>
                </div>
              </div>

              {/* Dealer-Level Mapping & Routing */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Dealer-Level Mapping & Routing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Quantity in Stock</p>
                    <p className="text-base font-semibold text-gray-900">{product?.no_of_stock ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Fulfilment Priority</p>
                    <p className="text-base font-semibold text-gray-900">{product?.fulfillment_priority ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Last Stock Update</p>
                    <p className="text-sm text-gray-800">
                      {Array.isArray(product?.available_dealers) && product.available_dealers.length > 0
                        ? product.available_dealers[0]?.last_stock_update || "-"
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Last Inquired At</p>
                    <p className="text-sm text-gray-800">{product?.last_stock_inquired || "-"}</p>
                  </div>
                </div>
              </div>

              {/* SEO & Search Optimization */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">SEO & Search Optimization</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">SEO Title</p>
                    <p className="text-sm text-gray-800">{product?.seo_title || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">SEO Description</p>
                    <p className="text-sm text-gray-800">{product?.seo_description || "-"}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-500">Search Tags</p>
                    <p className="text-sm text-gray-800">
                      {Array.isArray(product?.search_tags) ? product.search_tags.join(", ") : "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status, Audit & Metadata */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Status, Audit & Metadata</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="text-sm text-gray-800">{product?.live_status || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Created By</p>
                    <p className="text-sm text-gray-800">{product?.created_by || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Created At</p>
                    <p className="text-sm text-gray-800">{product?.created_at || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Updated At</p>
                    <p className="text-sm text-gray-800">{product?.updated_at || "-"}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
