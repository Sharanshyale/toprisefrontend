import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import DynamicButton from "@/components/common/button/button"
import { inspectReturnRequest } from "@/service/return-service"
import { getUserIdFromToken } from "@/utils/auth"
import { useToast } from "@/components/ui/toast"
import StartInspect from "./StartInspect"

interface InspectDialogProps {
  open: boolean;
  onClose: () => void;
  returnId: string | null;
  returnStatus?: string;
  onInspectComplete?: (success: boolean) => void;
}

export default function InspectDialog({ open, onClose, returnId, returnStatus, onInspectComplete }: InspectDialogProps) {
  const [loading, setLoading] = useState(false)
  const [startInspectOpen, setStartInspectOpen] = useState(false)
  const { showToast } = useToast()

  const handleInspect = async () => {
    if (!returnId) {
      showToast("Return ID is required", "error")
      return
    }

    // If status is Under_Inspection, open the StartInspect dialog instead
    if (isUnderInspection) {
      setStartInspectOpen(true)
      return
    }

    try {
      setLoading(true)
      
      // Get staffId from cookies/auth
      const staffId = getUserIdFromToken()
      
      if (!staffId) {
        showToast("Staff ID not found. Please log in again.", "error")
        return
      }

      // Make API request to start inspection
      const response = await inspectReturnRequest(returnId, { staffId })
      
      if (response.success) {
        showToast("Inspection started successfully", "success")
        onInspectComplete?.(true)
        onClose()
      } else {
        showToast(response.message || "Failed to start inspection", "error")
        onInspectComplete?.(false)
      }
    } catch (error: any) {
      console.error("Error starting inspection:", error)
      showToast(
        error?.response?.data?.message || 
        error?.message || 
        "Failed to start inspection", 
        "error"
      )
      onInspectComplete?.(false)
    } finally {
      setLoading(false)
    }
  }

  const handleStartInspectClose = () => {
    setStartInspectOpen(false)
  }

  const handleStartInspectSubmit = (data: any) => {
    console.log("Inspection data submitted:", data)
    // Handle the inspection form submission here
    // You can call an API to submit the inspection data
    onInspectComplete?.(true)
    setStartInspectOpen(false)
    onClose()
  }

  const isUnderInspection = returnStatus === "Under_Inspection"

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isUnderInspection ? "Continue Inspection" : "Start Inspection"}
            </DialogTitle>
            <DialogDescription>
              {isUnderInspection 
                ? "This return request is currently under inspection. You can continue the inspection process."
                : "Are you sure you want to start the inspection process for this return request?"
              }
              <br />
              <span className="text-sm text-gray-500 mt-2 block">
                Return ID: {returnId}
              </span>
              {returnStatus && (
                <span className="text-sm text-gray-500 mt-1 block">
                  Current Status: {returnStatus.replace('_', ' ')}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex gap-3 pt-4">
            <DynamicButton
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </DynamicButton>
            
            <DynamicButton
              onClick={handleInspect}
              loading={loading}
              loadingText={isUnderInspection ? "Processing..." : "Starting Inspection..."}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isUnderInspection ? "Continue Inspection" : "Start Inspection"}
            </DynamicButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <StartInspect
        open={startInspectOpen}
        onClose={handleStartInspectClose}
        onSubmit={handleStartInspectSubmit}
        returnId={returnId}
      />
    </>
  )
}
