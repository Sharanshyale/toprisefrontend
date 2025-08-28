import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast as useGlobalToast } from "@/components/ui/toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { rejectBulkProducts, rejectProduct } from "@/service/product-Service";
import { updateProductLiveStatus } from "@/store/slice/product/productLiveStatusSlice";

const rejectReasonSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
});
type RejectReasonFormData = z.infer<typeof rejectReasonSchema>;

interface RejectReasonProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RejectReasonFormData) => void;
}

export default function RejectReason({ isOpen, onClose }: RejectReasonProps) {
  const { showToast } = useGlobalToast();
  const auth = useAppSelector((state) => state.auth);
  const selectedProducts = useAppSelector(
    (state) => state.productIdForBulkAction.products
  );
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RejectReasonFormData>({
    resolver: zodResolver(rejectReasonSchema),
    defaultValues: {
      reason: "",
    },
  });

  const handleFormSubmit = useCallback(
    async (data: RejectReasonFormData) => {
      try {
        const productIds = Object.keys(selectedProducts);
        // Create FormData for file upload
        const payload: any = {
          reason: data.reason,
          rejectedBy: auth.user._id,
          productIds: Object.values(selectedProducts),
        };
        if (payload) {
          await rejectBulkProducts(payload);
           productIds.forEach((id) => {
            dispatch(updateProductLiveStatus({ id, liveStatus: "Rejected" }));
          });
          showToast("Rejected successfully", "success");
         
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        // Reset form and close dialog
        reset();

        onClose();

        // Call success callback if provided
      } catch (err: any) {
        console.error("Error creating brand:", err);
        showToast("Failed to create brand. Please try again.", "error");
      }
    },
    [showToast, reset, onClose, auth.user._id]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Reason</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Controller
            name="reason"
            control={control}
            render={({ field }) => (
              <>
                <Textarea {...field} placeholder="Enter reason for rejection" />
                {errors.reason && (
                  <span className="text-red-500 text-sm">
                    {errors.reason.message}
                  </span>
                )}
              </>
            )}
          />
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || loading}>
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
