"use client"

import { X } from "lucide-react"
import { DynamicButton } from "@/components/common/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface CancelOrderModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CancelOrderModal({ isOpen, onClose }: CancelOrderModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="bg-transparent" />
      <DialogContent className="w-full max-w-md p-6 rounded-lg bg-white shadow-lg mx-auto">
        <DialogHeader className="relative flex flex-col items-center text-center pt-4 pb-6">
          <img
            src="/upload/cancelorder.png"
            alt="Question mark illustration"
            className="mb-4 h-24 w-24 sm:h-32 sm:w-32"
          />
          <DialogTitle className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
            Are you sure you want to Cancel Order
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              Reason
            </label>
            <Textarea
              id="reason"
              placeholder="Please provide a reason for deleting the product"
              className="min-h-[100px] border-gray-300 focus:border-red-500 focus:ring-red-500"
            />
          </div>
          <DynamicButton className="w-full bg-red-600 text-white hover:bg-red-700 py-2 text-base">Submit</DynamicButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}
