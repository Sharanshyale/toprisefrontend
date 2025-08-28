"use client"

import React, { useCallback, useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useToast as useGlobalToast } from '@/components/ui/toast'
import { editProduct, getCategories, getSubCategories } from '@/service/product-Service'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const addCategorySchema = z.object({
  selectedCategoryId: z.string().min(1, "Category is required"),
  selectedSubCategoryId: z.string().min(1, "Subcategory is required"),
});

type AddCategoryFormData = z.infer<typeof addCategorySchema>;

interface AddCategoryProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
}

export default function AddCategory({ isOpen, onClose, productId }: AddCategoryProps) {
  const { showToast } = useGlobalToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false);
  const [loadingSubCategories, setLoadingSubCategories] = useState<boolean>(false);

  const {
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AddCategoryFormData>({
    resolver: zodResolver(addCategorySchema),
    defaultValues: {
      selectedCategoryId: "",
      selectedSubCategoryId: "",
    },
  });

  const selectedCategoryId = watch("selectedCategoryId");

  // Fetch categories when dialog opens
  useEffect(() => {
    if (isOpen) {
      const fetchCategories = async () => {
        try {
          setLoadingCategories(true);
          const categoriesData = await getCategories();
          const categoriesArray = Array.isArray(categoriesData.data) 
            ? categoriesData.data 
            : [];
          setCategories(categoriesArray);
        } catch (err: any) {
          console.error("Error fetching categories:", err);
          showToast("Failed to load categories. Please try again.", "error");
        } finally {
          setLoadingCategories(false);
        }
      };
      fetchCategories();
    }
  }, [isOpen, showToast]);

  // Fetch subcategories when category is selected
  useEffect(() => {
    if (selectedCategoryId) {
      const fetchSubCategories = async () => {
        try {
          setLoadingSubCategories(true);
          const subCategoriesData = await getSubCategories();
          const subCategoriesArray = Array.isArray(subCategoriesData.data) 
            ? subCategoriesData.data 
            : [];
          setSubCategories(subCategoriesArray);
          // Reset subcategory selection when category changes
          reset({ 
            selectedCategoryId: selectedCategoryId, 
            selectedSubCategoryId: "" 
          });
        } catch (err: any) {
          console.error("Error fetching subcategories:", err);
          showToast("Failed to load subcategories for selected category. Please try again.", "error");
          setSubCategories([]);
        } finally {
          setLoadingSubCategories(false);
        }
      };
      fetchSubCategories();
    } else {
      setSubCategories([]);
    }
  }, [selectedCategoryId, showToast, reset]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      reset();
      setCategories([]);
      setSubCategories([]);
    }
  }, [isOpen, reset]);

  const handleFormSubmit = useCallback(
    async (data: AddCategoryFormData) => {
      try {
        setLoading(true);
        
        const payload: any = {
          category: data.selectedCategoryId,
          sub_category: data.selectedSubCategoryId,
        };
        
        await editProduct(productId, payload);
        showToast("Category and Subcategory added successfully", "success");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        reset();
        onClose();
      } catch (err: any) {
        console.error("Error adding category and subcategory:", err);
        showToast("Failed to add category and subcategory. Please try again.", "error");
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
          <DialogTitle>Add Category & Subcategory</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="space-y-4">
            {/* Category Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Category</label>
              <Controller
                name="selectedCategoryId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={loadingCategories}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Choose a category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories && categories.length > 0 ? (
                        categories.map((category: any) => (
                          <SelectItem key={category?._id || category?.id} value={category?._id || category?.id}>
                            {category?.category_name || category?.name || "Unnamed Category"}
                          </SelectItem>
                        ))
                      ) : null}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.selectedCategoryId && (
                <span className="text-red-500 text-sm">{errors.selectedCategoryId.message}</span>
              )}
            </div>

            {/* Subcategory Selection - only show when category is selected */}
            {selectedCategoryId && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Subcategory</label>
                <Controller
                  name="selectedSubCategoryId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={loadingSubCategories}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={loadingSubCategories ? "Loading subcategories..." : "Choose a subcategory"} />
                      </SelectTrigger>
                      <SelectContent>
                        {subCategories && subCategories.length > 0 ? (
                          subCategories.map((subCategory: any) => (
                            <SelectItem key={subCategory?._id || subCategory?.id} value={subCategory?._id || subCategory?.id}>
                              {subCategory?.subcategory_name || subCategory?.name || "Unnamed Subcategory"}
                            </SelectItem>
                          ))
                        ) : null}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.selectedSubCategoryId && (
                  <span className="text-red-500 text-sm">{errors.selectedSubCategoryId.message}</span>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || loading || !selectedCategoryId || !watch("selectedSubCategoryId")}>
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
