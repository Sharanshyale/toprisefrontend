import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { validateReturnRequest } from "@/service/return-service"

interface ValidateReturnRequestProps {
  open: boolean;
  onClose: () => void;
  onValidationComplete?: (success: boolean) => void;
  returnId: string | null;
}

export default function ValidateReturnRequest({ 
  open, 
  onClose, 
  onValidationComplete,
  returnId 
}: ValidateReturnRequestProps) {
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleValidate = async () => {
    if (!returnId) return;
    
    setIsValidating(true)
    setError(null)
    
    try {
      const response = await validateReturnRequest(returnId)
      if (response.success) {
        setSuccess(true)
        onValidationComplete?.(true)
        // Auto close after showing success for 1.5 seconds
        setTimeout(() => {
          handleClose()
        }, 1500)
      } else {
        setError("Failed to validate return request. Please try again.")
      }
    } catch (err: any) {
      console.error("Error validating return request:", err)
      setError(err.response?.data?.message || "An error occurred while validating the return request.")
    } finally {
      setIsValidating(false)
    }
  }

  const handleClose = () => {
    setIsValidating(false)
    setError(null)
    setSuccess(false)
    onClose()
  }

  const handleCancel = () => {
    if (!isValidating) {
      handleClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {success ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                Validation Successful
              </>
            ) : (
              "Validate Return Request"
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {success ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-sm text-gray-600">
                Return request has been successfully validated!
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-3">
                Are you sure you want to validate this return request? This action will approve the return and cannot be undone.
              </p>
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm font-medium text-gray-700">Return ID:</p>
                <p className="text-sm text-gray-900 font-mono">{returnId?.slice(-8) || 'N/A'}</p>
              </div>
              
              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </>
          )}
        </div>

        {!success && (
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isValidating}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleValidate}
              disabled={isValidating || !returnId}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isValidating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Validating...
                </>
              ) : (
                "Validate Request"
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
