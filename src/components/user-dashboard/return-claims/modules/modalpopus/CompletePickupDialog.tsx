"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { completePickup } from "@/service/return-service"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Package } from "lucide-react"

interface CompletePickupDialogProps {
  open: boolean
  onClose: () => void
  onComplete: (success: boolean) => void
  returnId: string | null
  returnRequest?: any
}

export default function CompletePickupDialog({
  open,
  onClose,
  onComplete,
  returnId,
  returnRequest
}: CompletePickupDialogProps) {
  const [trackingNumber, setTrackingNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Auto-populate tracking number when modal opens
  useEffect(() => {
    if (open && returnRequest) {
      // Get tracking number from pickup request if available
      const pickupTrackingNumber = returnRequest?.pickupRequest?.trackingNumber
      if (pickupTrackingNumber) {
        setTrackingNumber(pickupTrackingNumber)
      } else {
        // If no tracking number in pickup request, generate a default one
        const defaultTracking = `TRK_${Date.now()}`
        setTrackingNumber(defaultTracking)
      }
    }
  }, [open, returnRequest])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!trackingNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a tracking number",
        variant: "destructive",
      })
      return
    }

    if (!returnId) {
      toast({
        title: "Error",
        description: "Return ID is missing",
        variant: "destructive",
      })
      return
    }

    // Check if return request has the correct status
    if (returnRequest && returnRequest.returnStatus !== "Pickup_Scheduled") {
      toast({
        title: "Invalid Status",
        description: "Only returns with 'Pickup Scheduled' status can be completed.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const response = await completePickup(returnId, {
        trackingNumber: trackingNumber.trim()
      })

      if (response.success) {
        toast({
          title: "Success",
          description: "Pickup completed successfully",
        })
        onComplete(true)
        handleClose()
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to complete pickup",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      
      // Better error handling for different types of errors
      let errorMessage = "Failed to complete pickup. Please try again."
      
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 500) {
          errorMessage = "Server error: Internal server error occurred. Please contact support."
        } else if (error.response.data?.message) {
          errorMessage = `Server error: ${error.response.data.message}`
        } else {
          errorMessage = `Server error: ${error.response.status} - ${error.response.statusText}`
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = "No response from server. Please check your connection."
      } else {
        // Something else happened
        errorMessage = error.message || "An unexpected error occurred."
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setLoading(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Complete Pickup
          </DialogTitle>
          <DialogDescription>
            Complete pickup for return with "Pickup Scheduled" status. Tracking number has been auto-populated.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="trackingNumber">Tracking Number *</Label>
            <Input
              id="trackingNumber"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking number"
              disabled={loading}
              required
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500">
              This tracking number was automatically populated from the pickup request.
            </p>
          </div>

          {returnRequest && (
            <div className="bg-gray-50 p-3 rounded-lg space-y-2">
              <p className="text-sm font-medium text-gray-700">Return Details:</p>
              <div className="text-xs text-gray-600 space-y-1">
                <p>SKU: {returnRequest.sku}</p>
                <p>Quantity: {returnRequest.quantity}</p>
                <p>Customer: {returnRequest.orderId?.customerDetails?.name || 'N/A'}</p>
                {returnRequest?.pickupRequest?.logisticsPartner && (
                  <p>Logistics Partner: {returnRequest.pickupRequest.logisticsPartner}</p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !trackingNumber.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Completing...
                </>
              ) : (
                "Complete Pickup"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
