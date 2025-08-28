"use client";
import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DynamicButton from "@/components/common/button/button";

interface OrderConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  orderId?: string;
}

export default function OrderConfirmationDialog({
  open,
  onClose,
  orderId
}: OrderConfirmationDialogProps) {
  // Close dialog after 5 seconds automatically (optional)
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto-close after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Order Confirmed</DialogTitle>
        </DialogHeader>
        <div className="py-4 text-center">
          <div className="mx-auto my-4 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Thank you for your order!
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Your order has been placed successfully.
          </p>
          {orderId && (
            <p className="text-sm text-gray-500 mb-4">
              Order ID: <span className="font-medium">{orderId}</span>
            </p>
          )}
          <p className="text-sm text-gray-500">
            You will receive an email confirmation shortly.
          </p>
        </div>
        <div className="flex justify-center">
          <DynamicButton onClick={onClose}>
            Continue Shopping
          </DynamicButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
