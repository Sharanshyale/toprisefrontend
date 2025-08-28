import React, { useCallback, useEffect, useState } from "react";
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

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useAppSelector } from "@/store/hooks";
import {
  createVariant,
  createVariants,
  getModels,
  getYearRange,
} from "@/service/product-Service";

// Type definitions
interface Model {
  _id: string;
  model_name: string;
}

interface Year {
  _id: string;
  year_name: string;
}

// Validation schema for variant creation
const variantSchema = z.object({
  variant_name: z
    .string()
    .min(2, "Variant name must be at least 2 characters")
    .max(100, "Variant name must not exceed 100 characters"),

  variant_code: z
    .string()
    .min(1, "Variant code must be at least 1 character")
    .max(20, "Variant code must not exceed 20 characters"),

  variant_Description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must not exceed 500 characters"),

  model: z.string().min(1, "Please select a model"),

Year: z.array(z.union([z.string(), z.object({ _id: z.string(), year_name: z.string() })])).min(1, "Please select at least one year"),
});

type VariantFormValues = z.infer<typeof variantSchema>;

interface CreateVariantProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (variant: any) => void;
}

export default function CreateVariant({
  open,
  onClose,
  onSuccess,
}: CreateVariantProps) {
  const { showToast } = useGlobalToast();
  const [models, setModels] = useState<any[]>([]);
  const [years, setYears] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const auth = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<VariantFormValues>({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      variant_name: "",
      variant_code: "",
      variant_Description: "",
      model: "",
      Year: [],
    },
  });

  // Fetch models and years for select options
  useEffect(() => {
    const fetchModelsAndYears = async () => {
      setLoading(true);
      try {
        const modelsResponse = await getModels();
        const yearsResponse = await getYearRange();

        setModels(modelsResponse.data || []);
        setYears(yearsResponse.data || []);
      } catch (err: any) {
        console.error("Failed to fetch models or years:", err);
        showToast(
          "Failed to fetch models or years. Please try again.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchModelsAndYears();
  }, [showToast]);

  // Handle form submission
  const handleFormSubmit = useCallback(
    async (data: VariantFormValues) => {
      // Check if user is authenticated
      if (!auth.user?._id) {
        showToast("Authentication required. Please log in again.", "error");
        return;
      }

      try {
        console.log("Form data before submission:", data);

        const formData = new FormData();
        formData.append("variant_name", data.variant_name);
        formData.append("variant_code", data.variant_code);
        formData.append("variant_Description", data.variant_Description);
        formData.append("model", data.model);
        formData.append("created_by", auth.user._id);
        formData.append("updated_by", auth.user._id);

   
        const yearIds = data.Year.map((year) =>
          typeof year === "object" && year !== null && "_id" in year ? (year as any)._id : year
        );
        formData.append("Year", data.Year.map((year) => (typeof year === "object" && year !== null ? (year as any)._id : year)).join(","));


        console.log("FormData being sent:");
        for (let pair of formData.entries()) {
          console.log(`${pair[0]}: ${pair[1]}`);
        }

        // Submit API call
        const response = await createVariants(formData);
        console.log("API response:", response);

        if (response?.data) {
          showToast("Variant created successfully!", "success");

          // Reset form and close dialog
          reset();
          onClose();

          // Call success callback if provided
          if (onSuccess) {
            onSuccess(data);
          }
        } else {
          console.error("Unexpected API response:", response);
          showToast(
            "Failed to create variant. Unexpected server response.",
            "error"
          );
        }
      } catch (err: any) {
        console.error("Error during form submission:", err);
        if (err.response) {
          console.error("API error response:", err.response);
        }
        showToast("Failed to create variant. Please try again.", "error");
      }
    },
    [showToast, reset, onClose, onSuccess, auth.user]
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Create New Variant
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Model */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Model <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="model"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={loading}
                >
                  <SelectTrigger className="bg-gray-50 border-gray-200 rounded-lg">
                    <SelectValue
                      placeholder={
                        loading
                          ? "Loading models..."
                          : (!models || !Array.isArray(models) || models.length === 0)
                          ? "No models available"
                          : "Select a model"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {models && Array.isArray(models) && models.length > 0
                      ? models.map((option: Model) => (
                          <SelectItem key={option?._id || Math.random()} value={option?._id || ""}>
                            {option?.model_name || "Unknown Model"}
                          </SelectItem>
                        ))
                      : !loading && (
                          <SelectItem value="no-data" disabled>
                            No models available
                          </SelectItem>
                        )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.model && (
              <span className="text-red-500 text-sm">
                {errors.model.message}
              </span>
            )}
          </div>

          {/* Year */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Year <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="Year"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(value) => {
                    // Check if the value is already selected
                    const isSelected = field.value.some(
                      (year) =>
                        typeof year === "object" && year !== null && "_id" in year
                          ? (year as any)._id === value
                          : year === value
                    );
                    if (isSelected) {
                      // Remove the selected year
                      field.onChange(
                        field.value.filter((year: string | Year) => (typeof year === "object" && year !== null ? year._id : year) !== value)
                      );
                    } else {
                      // Add the selected year
                      const selectedYear = years.find(
                        (year) => year._id === value
                      );
                      if (selectedYear) {
                        field.onChange([...field.value, selectedYear]);
                      }
                    }
                  }}
                  disabled={loading}
                >
                  <SelectTrigger className="bg-gray-50 border-gray-200 rounded-lg">
                    <SelectValue
                      placeholder={
                        loading
                          ? "Loading years..."
                          : (!years || !Array.isArray(years) || years.length === 0)
                          ? "No years available"
                          : (field.value && Array.isArray(field.value) && field.value.length > 0)
                          ? `${field.value.length} year(s) selected`
                          : "Select years"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {years && Array.isArray(years) && years.length > 0
                      ? years.map((option: Year) => (
                          <SelectItem key={option?._id || Math.random()} value={option?._id || ""}>
                            {option?.year_name || "Unknown Year"}
                          </SelectItem>
                        ))
                      : !loading && (
                          <SelectItem value="no-data" disabled>
                            No years available
                          </SelectItem>
                        )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.Year && (
              <span className="text-red-500 text-sm">
                {errors.Year.message}
              </span>
            )}
          </div>
          {/* Variant Name */}
          <div className="space-y-2">
            <Label htmlFor="variant_name" className="text-sm font-medium">
              Variant Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="variant_name"
              placeholder="Enter variant name (e.g., Z Plus Pro)"
              className="bg-gray-50 border-gray-200 rounded-lg"
              {...register("variant_name")}
            />
            {errors.variant_name && (
              <span className="text-red-500 text-sm">
                {errors.variant_name.message}
              </span>
            )}
          </div>

          {/* Variant Code */}
          <div className="space-y-2">
            <Label htmlFor="variant_code" className="text-sm font-medium">
              Variant Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="variant_code"
              placeholder="Enter variant code (e.g., ZPP2024)"
              className="bg-gray-50 border-gray-200 rounded-lg"
              {...register("variant_code")}
            />
            {errors.variant_code && (
              <span className="text-red-500 text-sm">
                {errors.variant_code.message}
              </span>
            )}
          </div>

          {/* Variant Description */}
          <div className="space-y-2">
            <Label
              htmlFor="variant_Description"
              className="text-sm font-medium"
            >
              Variant Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="variant_Description"
              placeholder="Enter detailed description (e.g., Top-tier variant with advanced features)"
              className="bg-gray-50 border-gray-200 rounded-lg min-h-[100px] resize-none"
              {...register("variant_Description")}
            />
            {errors.variant_Description && (
              <span className="text-red-500 text-sm">
                {errors.variant_Description.message}
              </span>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#C72920] hover:bg-[#C72920]/90"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating...
                </>
              ) : (
                "Create Variant"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
