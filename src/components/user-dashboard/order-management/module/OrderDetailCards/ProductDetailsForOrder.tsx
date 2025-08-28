"use client"
import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Edit, Package, HandHeart, Truck, UserCheck, Eye, MoreHorizontal } from "lucide-react"
import { DynamicButton } from "@/components/common/button"
import CreatePicklist from "./CreatePicklist"
import { useToast as GlobalToast } from "@/components/ui/toast"
import AssignDealersPerSkuModal from "../order-popus/AssignDealersPerSkuModal"
import AssignPicklistForDealerModal from "../order-popus/AssignPicklistForDealerModal"
import MarkPackedModal from "../order-popus/MarkPackedModal"
import ViewPicklistsModal from "../order-popus/ViewPicklistsModal"
import { useAppSelector } from "@/store/hooks"

interface ProductItem {
  _id?: string
  productId?: string
  productName: string
  dealerId: any
  sku?: string
  quantity?: number
  mrp: number
  gst: number | string 
  totalPrice: number
  image?: string
}

interface ProductDetailsForOrderProps {
  products: ProductItem[] | null | undefined
  onProductEyeClick: (product: ProductItem) => void
  onDealerEyeClick: (dealerId: string) => void
  orderId?: string
}

export default function ProductDetailsForOrder({
  products,
  onProductEyeClick,
  onDealerEyeClick,
  orderId = "",
}: ProductDetailsForOrderProps) {
  // const [picklistOpen, setPicklistOpen] = useState(false) // removed; creation moved to dealer modal
  // const [activeDealerId, setActiveDealerId] = useState<string>("")
  const [viewPicklistsOpen, setViewPicklistsOpen] = useState(false)
  const [actionOpen, setActionOpen] = useState(false)
  const [activeAction, setActiveAction] = useState<"assignDealers" | "assignPicklist" | "markPacked" | "createPicklist" | null>(null)
  const [dealerId, setDealerId] = useState("")
  const [createPicklistOpen, setCreatePicklistOpen] = useState(false)
  const [activeProductForPicklist, setActiveProductForPicklist] = useState<ProductItem | null>(null)
  // Remove per-product mark packed state - now works per order
  const { showToast } = GlobalToast()
  const auth = useAppSelector((state) => state.auth.user)
  const isAuthorized = ["Super-admin", "Fulfillment-Admin"].includes(auth?.role)
  const isPlaceholderString = (value: string) => {
    const v = (value || "").trim().toLowerCase()
    return v === "n/a" || v === "na" || v === "null" || v === "undefined" || v === "-"
  }

  const safeDealerId = (dealer: any): string => {
    if (dealer == null) return ""
    if (typeof dealer === "string") return isPlaceholderString(dealer) ? "" : dealer
    if (typeof dealer === "number") return Number.isFinite(dealer) ? String(dealer) : ""
    const id = dealer._id || dealer.id
    if (typeof id === "string" && isPlaceholderString(id)) return ""
    return id ? String(id) : ""
  }

  const getDealerCount = (dealer: any): number => {
    if (dealer == null) return 0
    if (Array.isArray(dealer)) return dealer.map(safeDealerId).filter(Boolean).length
    if (typeof dealer === "string") return safeDealerId(dealer) ? 1 : 0
    if (typeof dealer === "number") return Number.isFinite(dealer) ? 1 : 0
    if (typeof dealer === "object") return safeDealerId(dealer) ? 1 : 0
    return 0
  }

  // cleaned unused dealer-loading and assignment helpers

  return (
    <>
      <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="pb-3 lg:pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">Product Details</CardTitle>
            <p className="text-xs sm:text-sm text-gray-600">Product that order by the customer</p>
          </div>
          <div className="flex flex-col items-start gap-1 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span>No.of Product:</span>
              <span className="font-medium">{products?.length || 0}</span>
            </div>
            {products && products.length > 3 && (
              <DynamicButton
                text="View All"
                customClassName="px-2 py-1 text-xs h-7 min-w-0"
              />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Desktop Table View - Fixed width columns */}
        <div className="hidden xl:block">
  <div className="w-full bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
    <table className="w-full table-fixed">
      <thead className="bg-gray-50">
        <tr>
          <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider w-[35%]">
            Product Name
          </th>
          <th className="text-left py-4 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider w-[15%]">
            Dealers
          </th>
          <th className="text-left py-4 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider w-[12%]">
            MRP
          </th>
          <th className="text-left py-4 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider w-[8%]">
            GST
          </th>
          <th className="text-left py-4 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider w-[15%]">
            Total Price
          </th>
          {isAuthorized && (
            <th className="text-left py-4 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider w-[15%]">
              Actions
            </th>
          )}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {products?.map((productItem: ProductItem, index: number) => (
          <tr 
            key={productItem._id || index} 
            className="hover:bg-gray-50 transition-colors duration-150"
          >
            <td className="py-4 px-6 align-middle w-[35%]">
              <div className="flex items-center gap-3">
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {productItem.productName}
                    </p>
                    <button 
                      onClick={() => onProductEyeClick(productItem)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="View product details"
                    >
                      <Eye className="w-4 h-4 flex-shrink-0" />
                    </button>
                  </div>
                </div>
              </div>
            </td>
            <td className="py-4 px-4 align-middle w-[15%]">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900">{getDealerCount(productItem.dealerId)}</span>
                <button
                  onClick={() => onDealerEyeClick(safeDealerId(productItem.dealerId))}
                  className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="View dealers"
                >
                  <Eye className="w-4 h-4 flex-shrink-0" />
                </button>
              </div>
            </td>
            <td className="py-4 px-4 text-sm font-medium text-gray-900 w-[12%]">
              ₹{productItem.mrp.toLocaleString()}
            </td>
            <td className="py-4 px-4 text-sm font-medium text-gray-900 w-[8%]">
              {productItem.gst}%
            </td>
            <td className="py-4 px-4 text-sm font-medium text-gray-900 w-[15%]">
              ₹{productItem.totalPrice.toLocaleString()}
            </td>
            {isAuthorized && (
              <td className="py-4 px-4 align-middle w-[15%]">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <DynamicButton
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-gray-100"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </DynamicButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-lg shadow-lg border border-neutral-200 p-1">
                    <DropdownMenuItem className="flex items-center gap-2 rounded hover:bg-neutral-100" onClick={() => { setActiveAction("assignDealers"); setActionOpen(true); }}>
                      <Edit className="h-4 w-4 mr-2" /> Assign Dealers
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2 rounded hover:bg-neutral-100" onClick={() => { setActiveAction("assignPicklist"); const d = safeDealerId(productItem.dealerId); setDealerId(d); setActionOpen(true); }}>
                      <Edit className="h-4 w-4 mr-2" /> Assign Picklist
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2 rounded hover:bg-neutral-100" onClick={() => { setActiveProductForPicklist(productItem); setCreatePicklistOpen(true); }}>
                      <Edit className="h-4 w-4 mr-2" /> Create Picklist
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2 rounded hover:bg-neutral-100" onClick={() => { setActiveAction("markPacked"); setDealerId(safeDealerId(productItem.dealerId)); setActionOpen(true); }}>
                      <Package className="h-4 w-4 mr-2" /> Mark as Packed
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
    
    {/* Global View Picklists action */}
    {isAuthorized && (
      <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
        <DynamicButton
          text="View Picklists"
          customClassName="px-6 py-2 text-sm font-medium rounded-md shadow-sm border"
          onClick={() => {
            const firstDealer = products && products.length > 0 ? products[0].dealerId : ""
            const dId = safeDealerId(firstDealer as any)
            if (!dId) {
              showToast("No dealer found for this order", "error")
              return
            }
            setDealerId(dId)
            setViewPicklistsOpen(true)
          }}
        />
      </div>
    )}
  </div>
</div>

        {/* Card View for Mobile and Tablet */}
        <div className="xl:hidden p-4 space-y-3">
          {products?.map((productItem: ProductItem) => (
            <div key={productItem._id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-gray-900 text-sm truncate flex-1">{productItem.productName}</h3>
                    <button 
                      onClick={() => onProductEyeClick(productItem)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="View product details"
                    >
                      <Eye className="w-4 h-4 flex-shrink-0" />
                    </button>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">Dealers:</span>
                        <span className="text-xs text-gray-900 font-semibold">{getDealerCount(productItem.dealerId)}</span>
                        <button
                          onClick={() => onDealerEyeClick(safeDealerId(productItem.dealerId))}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          aria-label="View dealers"
                        >
                          <Eye className="w-4 h-4 flex-shrink-0" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-xs text-gray-600 block">MRP</span>
                        <span className="text-xs text-gray-900 font-semibold">₹{productItem.mrp.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-600 block">GST</span>
                        <span className="text-xs text-gray-900 font-semibold">{productItem.gst}%</span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-600 block">Total Price</span>
                        <span className="text-xs text-gray-900 font-semibold">₹{productItem.totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {isAuthorized && (
                <div className="flex justify-end mt-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <DynamicButton
                        variant="outline"
                        size="sm"
                        className="h-8 bg-white border border-gray-300 rounded-md shadow-sm w-20 justify-between text-xs"
                      >
                        Actions
                        <ChevronDown className="h-4 w-4 ml-1" />
                      </DynamicButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-lg shadow-lg border border-neutral-200 p-1">
                      <DropdownMenuItem 
                        className="flex items-center gap-2 rounded hover:bg-neutral-100" 
                        onClick={() => { 
                          setActiveAction("assignDealers"); 
                          setActionOpen(true); 
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" /> Assign Dealers
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="flex items-center gap-2 rounded hover:bg-neutral-100" 
                        onClick={() => { 
                          setActiveAction("assignPicklist"); 
                          const d = safeDealerId(productItem.dealerId); 
                          setDealerId(d); 
                          setActionOpen(true); 
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" /> Assign Picklist
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="flex items-center gap-2 rounded hover:bg-neutral-100" 
                        onClick={() => { 
                          setActiveProductForPicklist(productItem); 
                          setCreatePicklistOpen(true); 
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" /> Create Picklist
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="flex items-center gap-2 rounded hover:bg-neutral-100" 
                        onClick={() => { 
                          setActiveAction("markPacked"); 
                          setDealerId(safeDealerId(productItem.dealerId)); 
                          setActionOpen(true); 
                        }}
                      >
                        <Package className="h-4 w-4 mr-2" /> Mark as Packed
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}

              {/* View Picklists button for mobile view */}
              <div className="flex justify-end mt-3">
                <DynamicButton
                  text="View Picklists"
                  variant="outline"
                  customClassName="px-4 py-2 text-xs font-medium rounded-md shadow-sm border w-full"
                  onClick={() => {
                    const dId = safeDealerId(productItem.dealerId)
                    if (!dId) {
                      showToast("No dealer found for this product", "error")
                      return
                    }
                    setDealerId(dId)
                    setViewPicklistsOpen(true)
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
      {/* Separated modals for actions */}
      <AssignDealersPerSkuModal
        open={isAuthorized && actionOpen && activeAction === "assignDealers"}
        onOpenChange={(open) => {
          if (!open) { setActionOpen(false); setActiveAction(null) } else { setActionOpen(true) }
        }}
        orderId={orderId}
        products={(products || []).map((p) => ({ sku: p.sku, dealerId: p.dealerId }))}
      />
      <AssignPicklistForDealerModal
        open={isAuthorized && actionOpen && activeAction === "assignPicklist"}
        onOpenChange={(open) => {
          if (!open) { setActionOpen(false); setActiveAction(null) } else { setActionOpen(true) }
        }}
        orderId={orderId}
        dealerId={dealerId}
      />
      <MarkPackedModal
        open={isAuthorized && actionOpen && activeAction === "markPacked"}
        onOpenChange={(open) => {
          if (!open) { 
            setActionOpen(false); 
            setActiveAction(null); 
            // setActiveProductForMarkPacked(null); // Clean up product state - no longer needed
          } else { 
            setActionOpen(true) 
          }
        }}
        orderId={orderId}
        dealerId={dealerId} // This will be the order's dealerId
      />
      {/* Removed local CreatePicklist modal; use dealer modal's create flow */}

      <ViewPicklistsModal
        open={isAuthorized && viewPicklistsOpen}
        onOpenChange={setViewPicklistsOpen}
        dealerId={dealerId}
        orderId={orderId}
      />

      <CreatePicklist
        open={isAuthorized && createPicklistOpen}
        onClose={() => setCreatePicklistOpen(false)}
        orderId={orderId}
        defaultDealerId={activeProductForPicklist?.dealerId ? safeDealerId(activeProductForPicklist.dealerId) : ""}
        defaultSkuList={activeProductForPicklist ? [{ sku: activeProductForPicklist.sku || "", quantity: activeProductForPicklist.quantity || 1 }] : []}
      />
    </>
  )
}
