import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { getReturnRequestsById, validateReturnRequest } from "@/service/return-service";
import DynamicButton from "@/components/common/button/button";


interface ValidateReturnRequestByIdProps {
  open: boolean;
  onClose: () => void;
  returnId: string | null;
}

export default function ReturnRequestById({ open, onClose, returnId }: ValidateReturnRequestByIdProps) {
  const [returnRequest, setReturnRequest] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [validateLoading, setValidateLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    const fetchReturnRequest = async () => {
      if (returnId) {
        setLoading(true);
        // Reset states when fetching new data
        setError(null);
        setSuccess(false);
        try {
          const response = await getReturnRequestsById(returnId);
          setReturnRequest(response.data || null);
        } catch (e) {
          setReturnRequest(null);
        }
        setLoading(false);
      }
    };
    fetchReturnRequest();
  }, [returnId]);

  // Reset states when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setError(null);
      setSuccess(false);
    }
  }, [open]);

const handleValidate = async () => {
  if (!returnId) return;

  setValidateLoading(true);
  setError(null);
  setSuccess(false); // Reset success state

  try {
    const response = await validateReturnRequest(returnId);
    console.log("Validation response:", response); // Debug log
    
    if (response.success) {
      setSuccess(true);
      // Optionally refresh the return request data to show updated status
      setTimeout(() => {
        const fetchUpdatedData = async () => {
          try {
            const updatedResponse = await getReturnRequestsById(returnId);
            setReturnRequest(updatedResponse.data || null);
          } catch (e) {
            console.error("Error fetching updated data:", e);
          }
        };
        fetchUpdatedData();
      }, 1000);
    } else {
      setError(response.message || "Failed to validate return request. Please try again.");
    }
  } catch (err: any) {
    console.error("Error validating return request:", err);
    setError(err.response?.data?.message || "An error occurred while validating the return request.");
  } finally {
    setValidateLoading(false);
  }
};

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const closeImageViewer = () => {
    setSelectedImage(null);
  };

  if (!returnRequest || loading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return Request Details</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">Loading...</div>
        </DialogContent>
      </Dialog>
    );
  }

  // If the API response is the object itself, use it directly
  const data = returnRequest;
  const inspection = data?.inspection || {};
  const refund = data?.refund || {};
  const timestamps = data?.timestamps || {};
  const order = data?.orderId || {};
  const customer = order?.customerDetails || {};

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Return Request Overview</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
            <div className="text-amber-800 font-semibold">Return Reason</div>
            <div className="text-amber-900 text-base">{data.returnReason || "-"}</div>
            <div className="mt-3 text-amber-800 font-semibold">Description</div>
            <div className="text-amber-900 whitespace-pre-wrap">{data.returnDescription || "-"}</div>
          </div>
            {/* Core Return Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="font-semibold text-gray-700 mb-2">Return Info</div>
                <div className="space-y-1 text-sm">
                  <div>SKU: <span className="font-medium">{data.sku}</span></div>
                  <div>Quantity: {data.quantity}</div>
                                                      <div>Action Taken: {data.actionTaken}</div>
                  <div>Eligibility: {data.isEligible ? "Eligible" : "Not Eligible"}</div>
                  <div>Eligibility Reason: {data.eligibilityReason}</div>
                  <div>Return Window: {data.returnWindowDays} days</div>
                  <div>Status: <span className="font-semibold">{data.returnStatus}</span></div>
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-700 mb-2">Customer & Order</div>
                <div className="space-y-1 text-sm">
                  <div>Name: {customer.name}</div>
                  <div>Phone: {customer.phone}</div>
                  <div>Email: {customer.email}</div>
                  <div>Address: {customer.address}</div>
                  <div>Order ID: {order.orderId}</div>
                  <div>Order Date: {order.orderDate ? new Date(order.orderDate).toLocaleString() : "-"}</div>
                </div>
              </div>
            </div>

            {/* Inspection & Refund */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="font-semibold text-gray-700 mb-2">Inspection</div>
                <div className="space-y-1 text-sm">
                  <div>SKU Match: {inspection.skuMatch ? "Yes" : "No"}</div>
                  <div>Approved: {inspection.isApproved ? "Yes" : "No"}</div>
                </div>
                {inspection.inspectionImages && inspection.inspectionImages.length > 0 && (
                  <div className="mt-2">
                    <div className="font-medium text-gray-600 mb-1">Inspection Images</div>
                    <div className="grid grid-cols-2 gap-2">
                      {inspection.inspectionImages.map((img: string, idx: number) => (
                        <img 
                          key={idx} 
                          src={img} 
                          alt={`inspection-${idx}`} 
                          className="w-20 h-20 bg-gray-200 rounded-md object-cover cursor-pointer hover:opacity-80 transition-opacity" 
                          onClick={() => handleImageClick(img)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <div className="font-semibold text-gray-700 mb-2">Refund</div>
                <div className="space-y-1 text-sm">
                  <div>Amount: ₹{refund.refundAmount}</div>
                  <div>Method: {refund.refundMethod}</div>
                  <div>Status: {refund.refundStatus}</div>
                  <div>Refund ID: {refund.refund_id}</div>
                </div>
              </div>
            </div>

            {/* Images */}
            <div>
              <div className="font-semibold text-gray-700 mb-2">Return Images</div>
              {data.returnImages && data.returnImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {data.returnImages.map((img: string, idx: number) => (
                    <img 
                      key={idx} 
                      src={img} 
                      alt={`return-${idx}`} 
                      className="w-24 h-24 bg-gray-200 rounded-md object-cover cursor-pointer hover:opacity-80 transition-opacity" 
                      onClick={() => handleImageClick(img)}
                    />
                  ))}
                </div>
              ) : (
                <div className="aspect-video bg-gray-200 rounded-md text-center flex items-center justify-center text-gray-400">No Images</div>
              )}
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="font-semibold text-gray-700 mb-2">Timestamps</div>
                <div className="space-y-1 text-sm">
                  <div>Requested At: {timestamps.requestedAt ? new Date(timestamps.requestedAt).toLocaleString() : "-"}</div>
                  <div>Validated At: {timestamps.validatedAt ? new Date(timestamps.validatedAt).toLocaleString() : "-"}</div>
                  
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-700 mb-2">Meta</div>
                <div className="space-y-1 text-sm">
                  <div>Is Product Returnable: {data.isProductReturnable ? "Yes" : "No"}</div>
                  <div>Is Within Return Window: {data.isWithinReturnWindow ? "Yes" : "No"}</div>
                  <div>Notes: {Array.isArray(data.notes) && data.notes.length > 0 ? data.notes.join(", ") : "-"}</div>
                </div>
              </div>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <div className="rounded-md border border-green-200 bg-green-50 p-4">
                <div className="text-green-800 font-semibold">✓ Validation Successful</div>
                <div className="text-green-700 text-sm">Return request has been validated successfully.</div>
              </div>
            )}
            
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-4">
                <div className="text-red-800 font-semibold">✗ Validation Failed</div>
                <div className="text-red-700 text-sm">{error}</div>
              </div>
            )}

            {/* Validation Button - Only show when status is pending */}
            {data.returnStatus?.toLowerCase() === "pending" && (
              <div className="flex justify-end pt-2">
                <DynamicButton
                  variant="outline"
                  customClassName="bg-green-50 border-green-200 hover:bg-green-100 hover:text-green-600 text-green-600"
                  onClick={handleValidate}
                  text={validateLoading ? "Validating..." : "Validate Return"}
                  disabled={validateLoading}
                />
              </div>
            )}
          </div>
        </DialogContent>
        <DialogFooter></DialogFooter>
      </Dialog>

      {/* Image Viewer Modal */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={closeImageViewer}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>Image Viewer</DialogTitle>
            </DialogHeader>
            <div className="p-6 pt-0">
              <div className="flex justify-center">
                <img 
                  src={selectedImage} 
                  alt="Full size view" 
                  className="max-w-full max-h-[70vh] object-contain rounded-md"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}