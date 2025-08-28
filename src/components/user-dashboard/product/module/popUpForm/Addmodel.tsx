"use client"

import React, { useCallback, useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useToast as useGlobalToast } from '@/components/ui/toast'
import { editProduct, getBrandByType, getModelByBrand, getTypes } from '@/service/product-Service'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const addModelSchema = z.object({
  selectedTypeId: z.string().min(1, "Type is required"),
  selectedBrandId: z.string().min(1, "Brand is required"),
  selectedModelId: z.string().min(1, "Model is required"),
});

type AddModelFormData = z.infer<typeof addModelSchema>;

interface AddModelProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
}

export default function Addmodel({ isOpen, onClose, productId }: AddModelProps) {
  const { showToast } = useGlobalToast();
  const [loading, setLoading] = useState(false);
  const [types, setTypes] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [loadingTypes, setLoadingTypes] = useState<boolean>(false);
  const [loadingBrands, setLoadingBrands] = useState<boolean>(false);
  const [loadingModels, setLoadingModels] = useState<boolean>(false);

  const {
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AddModelFormData>({
    resolver: zodResolver(addModelSchema),
    defaultValues: {
      selectedTypeId: "",
      selectedBrandId: "",
      selectedModelId: "",
    },
  });

  const selectedTypeId = watch("selectedTypeId");
  const selectedBrandId = watch("selectedBrandId");

  // Fetch types when dialog opens
  useEffect(() => {
    if (isOpen) {
      const fetchTypes = async () => {
        try {
          setLoadingTypes(true);
          const typesData = await getTypes();
          const typesArray = Array.isArray(typesData.data) 
            ? typesData.data 
            : [];
          setTypes(typesArray);
        } catch (err: any) {
          console.error("Error fetching types:", err);
          showToast("Failed to load types. Please try again.", "error");
        } finally {
          setLoadingTypes(false);
        }
      };
      fetchTypes();
    }
  }, [isOpen, showToast]);

  // Fetch brands when type is selected
  useEffect(() => {
    if (selectedTypeId) {
      const fetchBrands = async () => {
        try {
          setLoadingBrands(true);
          const brandsData = await getBrandByType(selectedTypeId);
          const brandsArray = Array.isArray(brandsData.data) 
            ? brandsData.data 
            : [];
          setBrands(brandsArray);
          // Reset brand and model selection when type changes
          reset({ 
            selectedTypeId: selectedTypeId, 
            selectedBrandId: "", 
            selectedModelId: "" 
          });
        } catch (err: any) {
          console.error("Error fetching brands:", err);
          showToast("Failed to load brands for selected type. Please try again.", "error");
          setBrands([]);
        } finally {
          setLoadingBrands(false);
        }
      };
      fetchBrands();
    } else {
      setBrands([]);
      setModels([]);
    }
  }, [selectedTypeId, showToast, reset]);

  // Fetch models when brand is selected
  useEffect(() => {
    if (selectedBrandId) {
      const fetchModels = async () => {
        try {
          setLoadingModels(true);
          const modelsData = await getModelByBrand(selectedBrandId);
          const modelsArray = Array.isArray(modelsData.data) 
            ? modelsData.data 
            : [];
          setModels(modelsArray);
          // Reset model selection when brand changes
          reset({ 
            selectedTypeId: selectedTypeId, 
            selectedBrandId: selectedBrandId, 
            selectedModelId: "" 
          });
        } catch (err: any) {
          console.error("Error fetching models:", err);
          showToast("Failed to load models for selected brand. Please try again.", "error");
          setModels([]);
        } finally {
          setLoadingModels(false);
        }
      };
      fetchModels();
    } else {
      setModels([]);
    }
  }, [selectedBrandId, showToast, reset, selectedTypeId]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      reset();
      setTypes([]);
      setBrands([]);
      setModels([]);
    }
  }, [isOpen, reset]);

  const handleFormSubmit = useCallback(
    async (data: AddModelFormData) => {
      try {
        setLoading(true);
        const payload: any = {
          type: data.selectedTypeId,
          brand: data.selectedBrandId,
          model: data.selectedModelId,
        };
        
        await editProduct(productId, payload);
        showToast(" Model added successfully", "success");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        reset();
        onClose();
      } catch (err: any) {
        console.error("Error adding model:", err);
        showToast("Failed to add model. Please try again.", "error");
      } finally {
        setLoading(false);
      }
    },
    [showToast, reset, onClose, productId]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Type, Brand & Model</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="space-y-4">
            {/* Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Type</label>
              <Controller
                name="selectedTypeId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={loadingTypes}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={loadingTypes ? "Loading types..." : "Choose a type"} />
                    </SelectTrigger>
                    <SelectContent>
                      {types && types.length > 0 ? (
                        types.map((type: any) => (
                          <SelectItem key={type?._id || type?.id} value={type?._id || type?.id}>
                            {type?.type_name || type?.name || "Unnamed Type"}
                          </SelectItem>
                        ))
                      ) : null}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.selectedTypeId && (
                <span className="text-red-500 text-sm">{errors.selectedTypeId.message}</span>
              )}
            </div>

            {/* Brand Selection - only show when type is selected */}
            {selectedTypeId && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Brand</label>
                <Controller
                  name="selectedBrandId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={loadingBrands}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={loadingBrands ? "Loading brands..." : "Choose a brand"} />
                      </SelectTrigger>
                      <SelectContent>
                        {brands && brands.length > 0 ? (
                          brands.map((brand: any) => (
                            <SelectItem key={brand?._id || brand?.id} value={brand?._id || brand?.id}>
                              {brand?.brand_name || brand?.name || "Unnamed Brand"}
                            </SelectItem>
                          ))
                        ) : null}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.selectedBrandId && (
                  <span className="text-red-500 text-sm">{errors.selectedBrandId.message}</span>
                )}
              </div>
            )}

            {/* Model Selection - only show when brand is selected */}
            {selectedBrandId && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Model</label>
                <Controller
                  name="selectedModelId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={loadingModels}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={loadingModels ? "Loading models..." : "Choose a model"} />
                      </SelectTrigger>
                      <SelectContent>
                        {models && models.length > 0 ? (
                          models.map((model: any) => (
                            <SelectItem key={model?._id || model?.id} value={model?._id || model?.id}>
                              {model?.model_name || model?.name || "Unnamed Model"}
                            </SelectItem>
                          ))
                        ) : null}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.selectedModelId && (
                  <span className="text-red-500 text-sm">{errors.selectedModelId.message}</span>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || loading || !selectedTypeId || !selectedBrandId || !watch("selectedModelId")}>
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
