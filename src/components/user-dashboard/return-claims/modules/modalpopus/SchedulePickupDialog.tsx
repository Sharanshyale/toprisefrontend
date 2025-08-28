import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, MapPin, Loader2, CheckCircle } from 'lucide-react'
import { schedulePickup } from "@/service/return-service"

interface SchedulePickupDialogProps {
  open: boolean;
  onClose: () => void;
  onScheduleComplete?: (success: boolean) => void;
  returnId: string | null;
  initialPickupAddress?: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
}

interface PickupFormData {
  scheduledDate: string;
  pickupAddress: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export default function SchedulePickupDialog({ 
  open, 
  onClose, 
  onScheduleComplete,
  returnId,
  initialPickupAddress 
}: SchedulePickupDialogProps) {
  const [isScheduling, setIsScheduling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // Get earliest available date (next business day)
  const getEarliestDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const [formData, setFormData] = useState<PickupFormData>({
    scheduledDate: getEarliestDate(),
    pickupAddress: {
      address: initialPickupAddress?.address || "",
      city: initialPickupAddress?.city || "",
      state: initialPickupAddress?.state || "",
      pincode: initialPickupAddress?.pincode || ""
    }
  })

  // Update form data when initial address changes
  useEffect(() => {
    if (initialPickupAddress) {
      setFormData(prev => ({
        ...prev,
        pickupAddress: {
          address: initialPickupAddress.address || "",
          city: initialPickupAddress.city || "",
          state: initialPickupAddress.state || "",
          pincode: initialPickupAddress.pincode || ""
        }
      }))
    }
  }, [initialPickupAddress])

  const handleAddressChange = (field: keyof PickupFormData['pickupAddress'], value: string) => {
    setFormData(prev => ({
      ...prev,
      pickupAddress: {
        ...prev.pickupAddress,
        [field]: value
      }
    }))
  }

  const handleDateChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      scheduledDate: value
    }))
  }

  const handleSchedule = async () => {
    if (!returnId) return;
    
    setIsScheduling(true)
    setError(null)
    
    try {
      // Convert date to ISO format with time
      const scheduledDateTime = new Date(formData.scheduledDate + 'T10:00:00Z').toISOString()
      
      const payload = {
        scheduledDate: scheduledDateTime,
        pickupAddress: formData.pickupAddress
      }

      const response = await schedulePickup(returnId, payload)
      if (response.success) {
        setSuccess(true)
        onScheduleComplete?.(true)
        // Auto close after showing success for 1.5 seconds
        setTimeout(() => {
          handleClose()
        }, 1500)
      } else {
        setError("Failed to schedule pickup. Please try again.")
      }
    } catch (err: any) {
      console.error("Error scheduling pickup:", err)
      setError(err.response?.data?.message || "An error occurred while scheduling the pickup.")
    } finally {
      setIsScheduling(false)
    }
  }

  const handleClose = () => {
    setIsScheduling(false)
    setError(null)
    setSuccess(false)
    // Reset form to initial state
    setFormData({
      scheduledDate: getEarliestDate(),
      pickupAddress: {
        address: initialPickupAddress?.address || "",
        city: initialPickupAddress?.city || "",
        state: initialPickupAddress?.state || "",
        pincode: initialPickupAddress?.pincode || ""
      }
    })
    onClose()
  }

  const handleCancel = () => {
    if (!isScheduling) {
      handleClose()
    }
  }

  const isFormValid = () => {
    return (
      formData.scheduledDate &&
      formData.pickupAddress.address.trim() &&
      formData.pickupAddress.city.trim() &&
      formData.pickupAddress.state.trim() &&
      formData.pickupAddress.pincode.trim()
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {success ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                Pickup Scheduled Successfully
              </>
            ) : (
              <>
                <Calendar className="h-5 w-5 text-blue-600" />
                Schedule Pickup
              </>
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
                Pickup has been successfully scheduled for {new Date(formData.scheduledDate).toLocaleDateString()}!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Pickup Date */}
              <div className="space-y-2">
                <Label htmlFor="pickup-date" className="text-sm font-medium text-gray-700">
                  Pickup Date
                </Label>
                <Input
                  id="pickup-date"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={getEarliestDate()}
                  className="w-full"
                  disabled={isScheduling}
                />
                <p className="text-xs text-gray-500">
                  Earliest available date: {new Date(getEarliestDate()).toLocaleDateString()}
                </p>
              </div>

              {/* Pickup Address Section */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Pickup Address
                </Label>
                
                {/* Address */}
                <div className="space-y-1">
                  <Label htmlFor="address" className="text-xs text-gray-600">
                    Address
                  </Label>
                  <Input
                    id="address"
                    value={formData.pickupAddress.address}
                    onChange={(e) => handleAddressChange('address', e.target.value)}
                    placeholder="Enter pickup address"
                    disabled={isScheduling}
                  />
                </div>

                {/* City and State */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="city" className="text-xs text-gray-600">
                      City
                    </Label>
                    <Input
                      id="city"
                      value={formData.pickupAddress.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      placeholder="City"
                      disabled={isScheduling}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="state" className="text-xs text-gray-600">
                      State
                    </Label>
                    <Input
                      id="state"
                      value={formData.pickupAddress.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      placeholder="State"
                      disabled={isScheduling}
                    />
                  </div>
                </div>

                {/* Pincode */}
                <div className="space-y-1">
                  <Label htmlFor="pincode" className="text-xs text-gray-600">
                    Pincode
                  </Label>
                  <Input
                    id="pincode"
                    value={formData.pickupAddress.pincode}
                    onChange={(e) => handleAddressChange('pincode', e.target.value)}
                    placeholder="Pincode"
                    disabled={isScheduling}
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0">⚠</div>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Return ID Display */}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-700">Return ID:</p>
                <p className="text-sm text-gray-900 font-mono">{returnId?.slice(-8) || 'N/A'}</p>
              </div>
            </div>
          )}
        </div>

        {!success && (
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isScheduling}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSchedule}
              disabled={isScheduling || !isFormValid() || !returnId}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isScheduling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                "Confirm Pickup"
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
