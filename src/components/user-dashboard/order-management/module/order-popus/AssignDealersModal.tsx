"use client"
import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DynamicButton } from "@/components/common/button"
import { useToast as GlobalToast } from "@/components/ui/toast"
import { assignDealersToOrder } from "@/service/order-service"

interface AssignDealersModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId?: string
}

const AssignDealersModal: React.FC<AssignDealersModalProps> = ({ open, onOpenChange, orderId = "" }) => {
  const { showToast } = GlobalToast()
  const [assignmentsJson, setAssignmentsJson] = useState("[]")
  const [loading, setLoading] = useState(false)

  const onAssign = async () => {
    try {
      setLoading(true)
      const assignments = JSON.parse(assignmentsJson || "[]")
      await assignDealersToOrder({ orderId, assignments })
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
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Assign Dealers to SKUs</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Order ID</Label>
            <Input readOnly value={orderId || ""} />
          </div>
          <div>
            <Label>Assignments (JSON)</Label>
            <Textarea rows={5} value={assignmentsJson} onChange={(e) => setAssignmentsJson(e.target.value)} />
          </div>
          <DynamicButton onClick={onAssign} disabled={loading}>
            {loading ? "Saving..." : "Assign"}
          </DynamicButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AssignDealersModal

