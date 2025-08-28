"use client"
import type React from "react"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DynamicButton } from "@/components/common/button"
import { assignPicklistToStaff } from "@/service/order-service"
import { getAssignedEmployeesForDealer } from "@/service/dealerServices"
import { getDealerPickList } from "@/service/dealerOrder-services"
import type { DealerPickList } from "@/types/dealerOrder-types"
import { ClipboardList, Users, Loader2 } from "lucide-react"

interface AssignPicklistForDealerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId?: string
  dealerId?: string
}

const AssignPicklistForDealerModal: React.FC<AssignPicklistForDealerModalProps> = ({
  open,
  onOpenChange,
  orderId = "",
  dealerId = "",
}) => {
  const [picklistId, setPicklistId] = useState("")
  const [staffId, setStaffId] = useState("")
  const [availablePicklists, setAvailablePicklists] = useState<DealerPickList[]>([])
  const [assignedEmployees, setAssignedEmployees] = useState<{ id: string; name: string }[]>([])
  const [loadingAssignPicklists, setLoadingAssignPicklists] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchPicklists = async () => {
      setLoadingAssignPicklists(true)
      const picklists = await getDealerPickList(dealerId)
      setAvailablePicklists(picklists)
      setLoadingAssignPicklists(false)
    }

    const fetchAssignedEmployees = async () => {
      try {
        const res = await getAssignedEmployeesForDealer(dealerId)
        const raw: any = res?.data as any
        const list: any[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.assignedEmployees)
            ? raw.assignedEmployees
            : Array.isArray(raw?.data)
              ? raw.data
              : []

        const mapped = list.map((rec: any) => {
          const assignedUser = rec.assigned_user || rec.user
          const idFromPayload = rec.employeeId || rec.employee_id || rec._id
          const idFromAssigned = typeof assignedUser === "string" ? assignedUser : assignedUser?._id
          const nameFromPayload =
            rec.name ||
            rec.employeeName ||
            rec.user?.username ||
            rec.user?.First_name ||
            rec.assigned_user?.username ||
            rec.assigned_user?.First_name
          return { id: String(idFromPayload || idFromAssigned || ""), name: String(nameFromPayload || "") }
        })
        setAssignedEmployees(mapped)
      } catch (err) {
        console.error("[AssignPicklistForDealerModal] failed to load assigned employees:", err)
        setAssignedEmployees([])
      }
    }

    fetchPicklists()
    fetchAssignedEmployees()
  }, [dealerId])

  const onAssign = async () => {
    try {
      setLoading(true)
      await assignPicklistToStaff({ picklistId, staffId } as any)
      onOpenChange(false)
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
              <ClipboardList className="h-5 w-5 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-semibold">Assign Picklist to Staff</DialogTitle>
          </div>
          <p className="text-sm text-gray-600">
            Select a picklist and assign it to a fulfillment staff member for processing.
          </p>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-red-600" />
              <Label className="text-sm font-medium">Available Picklists</Label>
            </div>
            <Select value={picklistId} onValueChange={setPicklistId}>
              <SelectTrigger className="min-w-full h-11 border-gray-200 focus:border-red-500 focus:ring-red-500">
                <SelectValue
                  placeholder={
                    loadingAssignPicklists
                      ? "Loading picklists..."
                      : availablePicklists.length
                        ? "Select a picklist to assign"
                        : "No picklists available for this order"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availablePicklists.map((pl) => (
                  <SelectItem key={pl._id} value={pl._id} className="py-3">
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">ID: {pl._id}</span>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {pl.skuList?.length ?? 0} SKUs
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {loadingAssignPicklists && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading available picklists...
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-red-600" />
              <Label className="text-sm font-medium">Fulfillment Staff</Label>
            </div>
            <Select value={staffId} onValueChange={setStaffId}>
              <SelectTrigger className="min-w-full h-11 border-gray-200 focus:border-red-500 focus:ring-red-500">
                <SelectValue
                  placeholder={assignedEmployees.length ? "Select a staff member" : "No assigned staff available"}
                />
              </SelectTrigger>
              <SelectContent>
                {assignedEmployees.map((s) => (
                  <SelectItem key={s.id} value={s.id} className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-gray-600" />
                      </div>
                      <span className="font-medium">{s.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <DynamicButton
              onClick={onAssign}
              disabled={loading || !picklistId || !staffId}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <ClipboardList className="h-4 w-4" />
                  Assign Picklist
                </>
              )}
            </DynamicButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AssignPicklistForDealerModal
