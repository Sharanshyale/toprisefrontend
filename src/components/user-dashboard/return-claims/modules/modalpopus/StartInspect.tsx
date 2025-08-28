import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import DynamicButton from "@/components/common/button/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast as useGlobalToast } from "@/components/ui/toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { startInspectReturnRequest } from "@/service/return-service";

// Mock function to simulate uploading an image to a server and returning a URL


interface InspectionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: FormValues) => void;
  returnId?: string | null;
}

const schema = z.object({
  skuMatch: z.boolean(),
  condition: z.string().min(1, "Condition is required"),
  conditionNotes: z.string().optional(),
  inspectionImages: z.array(z.string()).optional(),
  isApproved: z.boolean(),
  rejectionReason: z.string().optional(),
}).refine((data) => {
  if (!data.isApproved && !data.rejectionReason) {
    return false; // rejectionReason is required when not approved
  }
  return true;
}, {
  message: "Rejection reason is required when not approved",
  path: ["rejectionReason"],
});

type FormValues = z.infer<typeof schema>;

export default function InspectionForm({ open, onClose, onSubmit, returnId }: InspectionFormProps) {
  const { showToast } = useGlobalToast();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
    control,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      skuMatch: true,
      condition: "",
      conditionNotes: "",
      inspectionImages: [],
      isApproved: true,
      rejectionReason: "",
    },
  });

  const isApproved = watch("isApproved");

  // Handle file upload
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const files = event.target.files;
  if (!files) return;

  try {
    const base64Images: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validation
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 5 * 1024 * 1024) continue;

      // Convert to base64
      const base64 = await fileToBase64(file);
      base64Images.push(base64);
    }

    setUploadedImages(base64Images);
    setValue("inspectionImages", base64Images);

    showToast(`${base64Images.length} image(s) uploaded successfully`, "success");
  } catch (error) {
    showToast("Failed to upload images", "error");
  }

  if (fileInputRef.current) fileInputRef.current.value = "";
};
  // Remove image
  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    setValue("inspectionImages", newImages);
  };

  // Reset images when dialog closes
  useEffect(() => {
    if (!open) {
      setUploadedImages([]);
      setValue("inspectionImages", []);
    }
  }, [open, setValue]);

  const handleFormSubmit = async (data: FormValues) => {
    if (!returnId) {
      showToast("Return ID is required", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      // Create JSON body instead of FormData
      const requestBody = {
        skuMatch: data.skuMatch,
        condition: data.condition,
        isApproved: data.isApproved,
        ...(data.conditionNotes && { conditionNotes: data.conditionNotes }),
        ...(data.inspectionImages && data.inspectionImages.length > 0 && { 
          inspectionImages: data.inspectionImages 
        }),
        ...(!data.isApproved && data.rejectionReason && { 
          rejectionReason: data.rejectionReason 
        }),
      };

      // Log the request body for debugging
      console.log("JSON request body before submission:", requestBody);

      // Assuming startInspectReturnRequest is imported from your service/api module
      const response = await startInspectReturnRequest(returnId, requestBody);
      if (response.success) {
        showToast("Inspection submitted successfully.", "success");
        if (onSubmit) onSubmit(data);
        onClose();
        reset(); // Reset form fields after successful submission
      } else {
        const errorMessage = response.message || "Failed to submit inspection data.";
        console.error("API error response:", response);
        showToast(errorMessage || "Failed to submit inspection data.", "error");
      }
    } catch (error: any) {
      console.error("Full error object:", error);
      let errorMessage = "Failed to submit inspection data.";
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        console.error("Error request:", error.request);
        errorMessage = "No response received from the server. Please check your network connection.";
      } else {
        console.error("Error message:", error.message);
        errorMessage = error.message || errorMessage;
      }
      showToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Product Inspection</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">SKU Match</label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="skuMatch"
                    checked={watch("skuMatch")}
                    onCheckedChange={(checked) => setValue("skuMatch", Boolean(checked))}
                  />
                  <label htmlFor="skuMatch" className="text-sm font-medium text-gray-700">
                    SKU matches
                  </label>
                </div>
              </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                  <Select
                    onValueChange={(value) => setValue("condition", value)}
                    value={watch("condition")}
                  >
                    <SelectTrigger className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2">
                      <SelectValue placeholder="Select product condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Fair">Fair</SelectItem>
                    <SelectItem value="Poor">Poor</SelectItem>
                    <SelectItem value="Damaged">Damaged</SelectItem>
                  </SelectContent>
                </Select>
                {errors.condition && (
                  <span className="text-xs text-red-500">{errors.condition.message}</span>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Condition Notes</label>
                <Textarea
                  {...register("conditionNotes")}
                  className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2"
                  placeholder="Enter any notes about the condition"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Inspection Images</label>

                {/* Upload Button */}
                <div className="mb-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <DynamicButton
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 h-10 border-dashed border-2 border-gray-300 hover:border-gray-400"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Images
                  </DynamicButton>
                </div>
                {/* Image Preview Grid */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {uploadedImages.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Inspection ${index + 1}`}
                          className="w-full h-20 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {/* Image Count */}
                {uploadedImages.length > 0 && (
                  <p className="text-xs text-gray-500">
                    {uploadedImages.length} image(s) uploaded
                  </p>
                )}
                {errors.inspectionImages && (
                  <span className="text-xs text-red-500">{errors.inspectionImages.message}</span>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Approval Status</label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isApproved"
                    checked={watch("isApproved")}
                    onCheckedChange={(checked) => setValue("isApproved", Boolean(checked))}
                  />
                  <label htmlFor="isApproved" className="text-sm font-medium text-gray-700">
                    Approved
                  </label>
                </div>
              </div>
              {!isApproved && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason</label>
                  <Textarea
                    {...register("rejectionReason")}
                    className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2"
                    placeholder="Enter reason for rejection"
                  />
                  {errors.rejectionReason && (
                    <span className="text-xs text-red-500">{errors.rejectionReason.message}</span>
                  )}
                </div>
              )}
              <DynamicButton type="submit" className="w-full">
                Submit Inspection
              </DynamicButton>
            </CardContent>
          </Card>
        </form>
      </DialogContent>
    </Dialog>
  );
}
