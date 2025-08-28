"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { DynamicButton } from "@/components/common/button"
import { useToast as GlobalToast } from "@/components/ui/toast"
import { updateOrderStatusByDealerReq } from "@/service/order-service"

interface MarkPackedModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId?: string
  dealerId?: string
}

const MarkPackedModal: React.FC<MarkPackedModalProps> = ({ open, onOpenChange, orderId = "", dealerId = "" }) => {
  const { showToast } = GlobalToast()
  const [totalWeightKg, setTotalWeightKg] = useState<number>(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) setTotalWeightKg(0)
  }, [open])

  const onMarkPacked = async () => {
    try {
      setLoading(true)
      await updateOrderStatusByDealerReq({ orderId, dealerId, total_weight_kg: totalWeightKg } as any)
      showToast("Order marked as packed", "success")
      onOpenChange(false)
    } catch (e) {
      showToast("Failed to mark packed", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-0 shadow-2xl">
        <DialogHeader className="pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">Mark Entire Order as Packed</DialogTitle>
              <p className="text-sm text-gray-500 mt-1">Enter the total weight to complete packing for the entire order</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Info Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="text-sm font-medium text-gray-800">Order Details</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 font-medium">Order ID:</span>
                <p className="text-gray-800 font-mono">{orderId || "N/A"}</p>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Dealer ID:</span>
                <p className="text-gray-800 font-mono">{dealerId || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Weight Input Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l3-1m-3 1l-3-1"
                />
              </svg>
              Total Weight (kg)
            </Label>
            <div className="relative">
              <Input
                type="number"
                value={totalWeightKg}
                onChange={(e) => setTotalWeightKg(Number.parseFloat(e.target.value) || 0)}
                className="pl-4 pr-12 h-12 text-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">kg</div>
            </div>
            <p className="text-xs text-gray-500">Enter the total weight of the entire packed order</p>
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <DynamicButton
              onClick={onMarkPacked}
              disabled={loading || totalWeightKg <= 0}
              variant="destructive"
              size="sm"
              className="px-4"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Updating Order...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Mark as Packed
                </>
              )}
            </DynamicButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default MarkPackedModal
