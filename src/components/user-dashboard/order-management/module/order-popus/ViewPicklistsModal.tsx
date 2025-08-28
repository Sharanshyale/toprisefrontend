"use client"
import type React from "react"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast as GlobalToast } from "@/components/ui/toast"
import { getDealerPickList } from "@/service/dealerOrder-services"
import type { DealerPickList } from "@/types/dealerOrder-types"

interface ViewPicklistsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dealerId?: string
  orderId?: string
}

const ViewPicklistsModal: React.FC<ViewPicklistsModalProps> = ({ open, onOpenChange, dealerId = "", orderId }) => {
  const { showToast } = GlobalToast()
  const [picklists, setPicklists] = useState<DealerPickList[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    const load = async () => {
      try {
        if (!dealerId) {
          setPicklists([])
          showToast("No dealer found for this order", "error")
          return
        }
        setLoading(true)
        const data = await getDealerPickList(dealerId)
        // If orderId is provided and API returns linkedOrderId, optionally filter
        const filtered =
          (orderId ? (data || []).filter((pl: any) => String(pl.linkedOrderId) === String(orderId)) : data) || []
        setPicklists(filtered)
      } catch (e) {
        setPicklists([])
        showToast("Failed to load picklists", "error")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [open, dealerId, orderId])

  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
        case "completed":
        case "scanned":
          return "bg-green-100 text-green-800 border-green-200"
        case "pending":
        case "in-progress":
          return "bg-yellow-100 text-yellow-800 border-yellow-200"
        case "failed":
        case "error":
          return "bg-red-100 text-red-800 border-red-200"
        default:
          return "bg-gray-100 text-gray-800 border-gray-200"
      }
    }

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}
      >
        {status}
      </span>
    )
  }

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-12">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-sm text-gray-600">Loading picklists...</p>
      </div>
    </div>
  )

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No picklists found</h3>
      <p className="text-sm text-gray-500">There are no picklists available for this dealer.</p>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b border-gray-200">
          <DialogTitle className="text-xl font-semibold text-gray-900">Dealer Picklists</DialogTitle>
          {dealerId && (
            <p className="text-sm text-gray-600 mt-1">
              Dealer ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">{dealerId}</span>
            </p>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <LoadingSpinner />
          ) : picklists.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="p-1">
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">{picklists.length}</span> picklist{picklists.length !== 1 ? "s" : ""}{" "}
                  found
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold text-gray-900">Picklist ID</TableHead>
                      <TableHead className="font-semibold text-gray-900">Status</TableHead>
                      <TableHead className="font-semibold text-gray-900">Invoice</TableHead>
                      <TableHead className="font-semibold text-gray-900">SKUs</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {picklists.map((pl, index) => (
                      <TableRow key={pl._id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <TableCell className="font-mono text-sm bg-gray-100 rounded px-2 py-1 max-w-[200px]">
                          <div className="truncate" title={pl._id}>
                            {pl._id}
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={pl.scanStatus} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {pl.invoiceGenerated ? (
                              <>
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-green-700 font-medium">Generated</span>
                              </>
                            ) : (
                              <>
                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                <span className="text-gray-600">Pending</span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 max-w-[250px]">
                            {(pl.skuList || []).map((s) => (
                              <div
                                key={s._id}
                                className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-xs"
                              >
                                <span className="font-mono text-gray-800">{s.sku}</span>
                                <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-medium">
                                  ×{s.quantity}
                                </span>
                              </div>
                            ))}
                            {(pl.skuList || []).length === 0 && (
                              <span className="text-gray-400 text-xs italic">No SKUs</span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ViewPicklistsModal
