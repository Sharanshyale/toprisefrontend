"use client";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import DynamicButton from "@/components/common/button/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast as useGlobalToast } from "@/components/ui/toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { refundInitiate } from "@/service/return-service";

interface InitiateRefundFormProps {
  open: boolean;
  onClose: () => void;
  returnId: string | null;
  onSubmit?: (reason: string) => void;
}

const schema = z.object({
  reason: z.string().min(1, "Reason is required"),
});
type FormValues = z.infer<typeof schema>;

export default function InitiateRefundForm({ open, onClose, returnId, onSubmit }: InitiateRefundFormProps) {
  const { showToast } = useGlobalToast();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
  });

  useEffect(() => {
    if (open) {
      setValue("reason", "");
    }
  }, [open, setValue]);

  const handleFormSubmit = async (data: FormValues) => {
    if (!returnId) {
      showToast("Return ID is missing", "error");
      return;
    }
    try {
      // Create JSON payload to send to API
      const requestPayload = {
        returnId: returnId,
        reason: data.reason
      };

      console.log("Sending refund initiation request:", requestPayload);
      
      const response = await refundInitiate(requestPayload);
      if (onSubmit) onSubmit(data.reason);
      showToast("Refund initiated successfully", "success");
      onClose();
    } catch (error) {
      console.error("Failed to initiate refund:", error);
      showToast("Failed to initiate refund. Please try again.", "error");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Initiate Refund</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <Card>
            <CardContent className="pt-0 px-0">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Refund</label>
                <textarea
                  {...register("reason")}
                  className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2"
                  placeholder="Enter reason for refund"
                  rows={4}
                />
                {errors.reason && (
                  <span className="text-xs text-red-500">{errors.reason.message as string}</span>
                )}
              </div>
              <DynamicButton type="submit">
                Initiate Refund
              </DynamicButton>
            </CardContent>
          </Card>
        </form>
      </DialogContent>
    </Dialog>
  );
}
