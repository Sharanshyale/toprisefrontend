"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogOverlay } from "@/components/ui/dialog"
import { DynamicButton } from "@/components/common/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast as GlobalToast } from "@/components/ui/toast"
import { createPicklist } from "@/service/order-service"
import { getAssignedEmployeesForDealer } from "@/service/dealerServices"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CreatePicklistProps {
  open: boolean
  onClose: () => void
  orderId: string
  defaultDealerId?: string
  defaultSkuList?: Array<{ sku: string; quantity: number; barcode?: string }>
}

type SkuRow = { sku: string; quantity: number; barcode?: string }

const CreatePicklist: React.FC<CreatePicklistProps> = ({
  open,
  onClose,
  orderId,
  defaultDealerId = "",
  defaultSkuList = [],
}) => {
  const { showToast } = GlobalToast()
  const [dealerId, setDealerId] = useState<string>(defaultDealerId)
  const [staffId, setStaffId] = useState<string>("")
  const [skuRows, setSkuRows] = useState<SkuRow[]>(
    defaultSkuList.length > 0 ? defaultSkuList : [{ sku: "", quantity: 1 }],
  )
  const [barcodeVisible, setBarcodeVisible] = useState<Record<number, boolean>>({})
  const [submitting, setSubmitting] = useState(false)
  const [assignedEmployees, setAssignedEmployees] = useState<
    Array<{ id: string; name: string; email?: string; role?: string }>
  >([])
  const [loadingEmployees, setLoadingEmployees] = useState<boolean>(false)

  // Keep local state in sync when dialog opens with new defaults
  useEffect(() => {
    if (open) {
      setDealerId(defaultDealerId || "")
      setSkuRows(defaultSkuList.length > 0 ? defaultSkuList : [{ sku: "", quantity: 1 }])
      setBarcodeVisible({})
    }
  }, [open, defaultDealerId, defaultSkuList])

  // Load assigned employees for dealer when dealerId becomes available
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!dealerId) {
        setAssignedEmployees([])
        return
      }
      try {
        setLoadingEmployees(true)
        const res = await getAssignedEmployeesForDealer(dealerId)
        const list = ((res?.data as any)?.assignedEmployees || []) as Array<any>
        const onlyFulfilment = list.filter((e) => (e.role || "").toLowerCase() === "fulfillment-staff")
        const mapped = onlyFulfilment.map((e) => ({
          id: e.employeeId,
          name: e.name || e.employeeId_code || e.employeeId,
          email: e.email,
          role: e.role,
        }))
        setAssignedEmployees(mapped)
        // If current staffId is not in list, clear it
        if (!mapped.some((m) => m.id === staffId)) {
          setStaffId("")
        }
      } catch (err) {
        setAssignedEmployees([])
      } finally {
        setLoadingEmployees(false)
      }
    }
    fetchEmployees()
  }, [dealerId])

  const updateRow = (index: number, field: keyof SkuRow, value: string) => {
    setSkuRows((prev) => {
      const next = [...prev]
      if (field === "quantity") {
        const parsed = Number.parseInt(value || "0", 10)
        next[index].quantity = isNaN(parsed) || parsed <= 0 ? 1 : parsed
      } else {
        next[index][field] = value
      }
      return next
    })
  }

  const addRow = () => setSkuRows((prev) => [...prev, { sku: "", quantity: 1 }])
  const removeRow = (index: number) => {
    setSkuRows((prev) => prev.filter((_, i) => i !== index))
    setBarcodeVisible((prev) => {
      const next = { ...prev }
      delete next[index]
      return next
    })
  }
  const toggleBarcode = (index: number) => setBarcodeVisible((prev) => ({ ...prev, [index]: !prev[index] }))

  const handleCreate = async () => {
    try {
      setSubmitting(true)
      if (!orderId) {
        showToast("Missing orderId", "error")
        return
      }
      if (!dealerId) {
        showToast("Enter Dealer ID", "error")
        return
      }
      if (!staffId) {
        showToast("Select a Fulfilment Staff", "error")
        return
      }
      const skuList = skuRows
        .map((r) => ({ sku: (r.sku || "").trim(), quantity: r.quantity || 1, barcode: (r.barcode || "").trim() }))
        .filter((r) => r.sku)
      if (skuList.length === 0) {
        showToast("Add at least one SKU", "error")
        return
      }
      await createPicklist({ orderId, dealerId, fulfilmentStaff: staffId, skuList })
      showToast("Picklist created", "success")
      onClose()
    } catch (e) {
      showToast("Failed to create picklist", "error")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogOverlay className="bg-black/50" />
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-gray-100">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            Create New Picklist
          </DialogTitle>
        </DialogHeader>

        <div className="py-6 space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Fulfilment Staff
            </Label>
            <div className="flex items-center gap-3">
              <Select value={staffId} onValueChange={setStaffId}>
                <SelectTrigger className="min-w-[300px] h-10 border-gray-200 focus:border-gray-400 focus:ring-1 focus:ring-gray-400">
                  <SelectValue
                    placeholder={
                      loadingEmployees
                        ? "Loading staff..."
                        : assignedEmployees.length
                          ? "Select fulfilment staff"
                          : "No assigned staff available"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {assignedEmployees.map((s) => (
                    <SelectItem key={s.id} value={s.id} className="py-2">
                      <div className="flex flex-col">
                        <span className="font-medium">{s.name}</span>
                        {s.email && <span className="text-xs text-gray-500">{s.email}</span>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {loadingEmployees && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin"></div>
                  Loading...
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              SKU Items
            </Label>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-12 gap-3 text-xs font-medium text-gray-600 px-1">
                <div className="col-span-5">SKU Code</div>
                <div className="col-span-2">Quantity</div>
                <div className="col-span-4">Barcode (Optional)</div>
                <div className="col-span-1"></div>
              </div>

              {skuRows.map((row, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-3 items-center bg-white rounded-md p-3 border border-gray-200"
                >
                  <div className="col-span-5">
                    <Input
                      placeholder="Enter SKU code"
                      value={row.sku}
                      onChange={(e) => updateRow(idx, "sku", e.target.value)}
                      className="border-gray-200 focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min={1}
                      placeholder="1"
                      value={String(row.quantity)}
                      onChange={(e) => updateRow(idx, "quantity", e.target.value)}
                      className="border-gray-200 focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                    />
                  </div>
                  <div className="col-span-4">
                    {barcodeVisible[idx] || (row.barcode && row.barcode.length > 0) ? (
                      <Input
                        placeholder="Enter barcode"
                        value={row.barcode || ""}
                        onChange={(e) => updateRow(idx, "barcode", e.target.value)}
                        className="border-gray-200 focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                      />
                    ) : (
                      <DynamicButton
                        variant="outline"
                        size="sm"
                        onClick={() => toggleBarcode(idx)}
                        className="text-xs border-gray-200 hover:border-gray-300"
                      >
                        + Add Barcode
                      </DynamicButton>
                    )}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    {skuRows.length > 1 && (
                      <DynamicButton
                        variant="outline"
                        size="sm"
                        onClick={() => removeRow(idx)}
                        className="text-xs text-red-600 border-red-200 hover:border-red-300 hover:bg-red-50"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </DynamicButton>
                    )}
                  </div>
                </div>
              ))}

              <DynamicButton
                variant="outline"
                size="sm"
                onClick={addRow}
                className="w-full border-dashed border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-700"
              >
                <svg className="w-4 h-4 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Add Another SKU
              </DynamicButton>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t border-gray-100 flex gap-3">
          <DynamicButton variant="outline" onClick={onClose} className="border-gray-200 hover:border-gray-300">
            Cancel
          </DynamicButton>
          <DynamicButton
            className="bg-red-600 hover:bg-red-700 text-white shadow-sm"
            onClick={handleCreate}
            disabled={submitting}
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Create Picklist
              </div>
            )}
          </DynamicButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreatePicklist
