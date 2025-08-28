"use client"
import type React from "react"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DynamicButton } from "@/components/common/button"
import { useToast as GlobalToast } from "@/components/ui/toast"
import { assignDealersToOrder } from "@/service/order-service"
import { getAllDealers } from "@/service/dealerServices"
import type { Dealer } from "@/types/dealer-types"
import { Package, Users, ArrowRight } from "lucide-react"

interface ProductItem {
  sku?: string
  dealerId: any
}

interface AssignDealersPerSkuModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId?: string
  products?: ProductItem[] | null
}

const AssignDealersPerSkuModal: React.FC<AssignDealersPerSkuModalProps> = ({
  open,
  onOpenChange,
  orderId = "",
  products = [],
}) => {
  const { showToast } = GlobalToast()
  const [dealers, setDealers] = useState<Dealer[]>([])
  const [loadingDealers, setLoadingDealers] = useState(false)
  const [loading, setLoading] = useState(false)
  const [assignments, setAssignments] = useState<Array<{ sku: string; dealerId: string }>>([])

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

  const initializeAssignments = () => {
    const initial = (products || []).map((p) => ({ sku: p?.sku || "", dealerId: safeDealerId(p?.dealerId) }))
    setAssignments(initial)
  }

  useEffect(() => {
    if (!open) return
    initializeAssignments()
    const loadDealers = async () => {
      try {
        setLoadingDealers(true)
        const res = await getAllDealers()
        setDealers(((res as any)?.data || []) as Dealer[])
      } catch {
        setDealers([])
      } finally {
        setLoadingDealers(false)
      }
    }
    loadDealers()
  }, [open])

  const onAssign = async () => {
    try {
      setLoading(true)
      const payload = {
        orderId,
        assignments: assignments.filter((a) => a.sku && a.dealerId),
      }
      await assignDealersToOrder(payload as any)
      showToast("Dealers assigned", "success")
      onOpenChange(false)
    } catch (e) {
      showToast("Failed to assign dealers", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Package className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">Assign Dealers to SKUs</DialogTitle>
              <p className="text-sm text-gray-600 mt-1">Match each SKU with the appropriate dealer</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4 border">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-red-600" />
               <p className="text-xs text-gray-600">
              {(products || []).length} SKU{(products || []).length !== 1 ? "s" : ""} to assign
            </p>
            </div>
           
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-red-600" />
              <h3 className="font-medium text-sm">SKU Assignments</h3>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {(products || []).map((p, idx) => (
                <div
                  key={`${p?.sku}-${idx}`}
                  className="bg-white border rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="grid grid-cols-12 gap-4 items-end">
                    <div className="col-span-5">
                      <Label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                        <Package className="h-3 w-3 text-red-600" />
                        SKU
                      </Label>
                      <Input readOnly value={p?.sku || ""} className="mt-1 bg-gray-50 font-mono text-sm" />
                    </div>

                    <div className="col-span-1 flex justify-center">
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>

                    <div className="col-span-6">
                      <Label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                        <Users className="h-3 w-3 text-red-600" />
                        Dealer
                      </Label>
                      <Select
                        value={assignments[idx]?.dealerId || ""}
                        onValueChange={(val) => {
                          setAssignments((prev) => {
                            const next = [...prev]
                            next[idx] = { sku: p?.sku || "", dealerId: val }
                            return next
                          })
                        }}
                      >
                        <SelectTrigger className="w-full mt-1 focus:ring-2 focus:ring-red-500 focus:border-red-500">
                          <SelectValue placeholder={loadingDealers ? "Loading dealers..." : "Select dealer"} />
                        </SelectTrigger>
                        <SelectContent>
                          {dealers.map((d) => (
                            <SelectItem key={(d as any)._id as any} value={(d as any)._id as string}>
                              <div className="flex flex-col">
                                <span className="font-medium">{d.trade_name || d.legal_name}</span>
                                <span className="text-xs text-gray-500">{(d.user_id as any)?.email}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <DynamicButton
              onClick={onAssign}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Assigning...
                </>
              ) : (
                <>
                  <Users className="h-4 w-4" />
                  Assign Dealers
                </>
              )}
            </DynamicButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AssignDealersPerSkuModal
