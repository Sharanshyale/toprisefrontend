import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast as useGlobalToast } from "@/components/ui/toast"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { X, Image as ImageIcon } from 'lucide-react'
import { createSubCategory, getCategories } from '@/service/product-Service'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { type } from 'os'
import { useAppSelector } from '@/store/hooks'

// Validation schema for subcategory creation
const subCategorySchema = z.object({
  subcategory_name: z
    .string()
    .min(1, "Subcategory name is required")
    .min(2, "Subcategory name must be at least 2 characters")
    .max(100, "Subcategory name must not exceed 100 characters")
    .regex(/^[a-zA-Z0-9\s-_]+$/, "Subcategory name can only contain letters, numbers, spaces, hyphens, and underscores"),

  subcategory_code: z
    .string()
    .min(1, "Subcategory code is required")
    .min(1, "Subcategory code must be at least 1 character")
    .max(20, "Subcategory code must not exceed 20 characters")
    .regex(/^[A-Z0-9-_]+$/, "Subcategory code must be uppercase letters, numbers, hyphens, or underscores only"),

  subcategory_description: z
    .string()
    .min(1, "Subcategory description is required")
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must not exceed 500 characters"),

    category_ref: z.string().min(1, "Please select a category"),

  subcategory_image: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size <= 5 * 1024 * 1024, // 5MB limit
      "Image size must be less than 5MB"
    )
    .refine(
      (file) => !file || ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type),
      "Only JPEG, PNG, WebP, and GIF images are allowed"
    ),
})

type SubCategoryFormValues = z.infer<typeof subCategorySchema>

interface CreateSubCategoryProps {
  open: boolean
  onClose: () => void
  onSuccess?: (subcategory: any) => void
}

export default function CreateSubCategory({ open, onClose, onSuccess }: CreateSubCategoryProps) {
  const { showToast } = useGlobalToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [category, setCategory] = useState<any[]>([])
  const [categoryLoading, setCategoryLoading] = useState(false)
  const auth = useAppSelector((state) => state.auth)

  const { 
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SubCategoryFormValues>({
    resolver: zodResolver(subCategorySchema),
    defaultValues: {
      subcategory_name: '',
      subcategory_code: '',
      subcategory_description: '',
        category_ref: '',
      subcategory_image: undefined,
    }
  })

  const watchedImage = watch('subcategory_image')
    useEffect(() => {
      const fetchCategory = async () => {
        setCategoryLoading(true);
        try {
          const response = await getCategories();
          const items = response.data;
          setCategory(items);
        } catch (err: any) {
          console.error("Failed to fetch vehicle types:", err);
          showToast("Failed to fetch vehicle types. Please try again.", "error");
        } finally {
          setCategoryLoading(false);
        }
      };
      
      fetchCategory();
    }, [])

  // Handle form submission
  const handleFormSubmit = useCallback(async (data: SubCategoryFormValues) => {
    try {
      console.log("Subcategory form data:", data)
      
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('subcategory_name', data.subcategory_name)
      formData.append('subcategory_code', data.subcategory_code)
      formData.append('subcategory_description', data.subcategory_description)
        formData.append('category_ref', data.category_ref)
            formData.append("created_by", auth.user._id); // Fixed to match Redux structure
        formData.append("updated_by", auth.user._id); 
      // Status will be set to "Created" by default on the backend

      if (data.subcategory_image) {
        formData.append('file', data.subcategory_image)
      }

      // TODO: Replace with actual API call
      // const response = await createSubCategory(formData)
      
      // Simulate API call
      await createSubCategory(formData)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      showToast("Subcategory created successfully!", "success")
      
      // Reset form and close dialog
      reset()
      setImagePreview(null)
      onClose()
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(data)
      }
      
    } catch (err: any) {
      console.error("Error creating subcategory:", err)
      showToast("Failed to create subcategory. Please try again.", "error")
    }
  }, [showToast, reset, onClose, onSuccess])

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    setValue('subcategory_image', file, { shouldValidate: true })
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [setValue])

  // Handle file input change
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])

  // Remove selected image
  const removeImage = useCallback(() => {
    setValue('subcategory_image', undefined, { shouldValidate: true })
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [setValue])

  // Auto-generate subcategory code from name
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    const code = name
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 20)

    setValue('subcategory_code', code, { shouldValidate: true })
  }, [setValue])

  // Handle dialog close
  const handleClose = useCallback(() => {
    reset()
    setImagePreview(null)
    onClose()
  }, [reset, onClose])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Create New Subcategory</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
               <div className="space-y-2">
            <Label className="text-sm font-medium">
              Category <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="category_ref"
              control={control}
              render={({ field }) => (
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  disabled={categoryLoading}
                >
                  <SelectTrigger className="bg-gray-50 border-gray-200 rounded-lg">
                    <SelectValue 
                      placeholder={
                        categoryLoading
                          ? "Loading categories..."
                          : (!category || !Array.isArray(category) || category.length === 0)
                            ? "No categories available"
                            : "Select a category"
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {category && Array.isArray(category) && category.length > 0 ? (
                      category.map((option) => (
                        <SelectItem key={option?._id || Math.random()} value={option?._id || ""}>
                          {option?.category_name || "Unknown Category"}
                        </SelectItem>
                      ))
                    ) : (
                      !categoryLoading && (
                        <SelectItem value="no-data" disabled>
                          No categories available
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category_ref && (
              <span className="text-red-500 text-sm">
                {errors.category_ref.message}
              </span>
            )}
          </div>
          {/* Subcategory Name */}
          <div className="space-y-2">
            <Label htmlFor="subcategory_name" className="text-sm font-medium">
              Subcategory Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="subcategory_name"
              placeholder="Enter subcategory name (e.g., Autoparts2)"
              className="bg-gray-50 border-gray-200 rounded-lg"
              {...register("subcategory_name")}
            />
            {errors.subcategory_name && (
              <span className="text-red-500 text-sm">
                {errors.subcategory_name.message}
              </span>
            )}
          </div>

          {/* Subcategory Code */}
          <div className="space-y-2">
            <Label htmlFor="subcategory_code" className="text-sm font-medium">
              Subcategory Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="subcategory_code"
              placeholder="Enter subcategory code (e.g., PARTS_2)"
              className="bg-gray-50 border-gray-200 rounded-lg"
              {...register("subcategory_code")}
            />
            {errors.subcategory_code && (
              <span className="text-red-500 text-sm">
                {errors.subcategory_code.message}
              </span>
            )}
            <p className="text-xs text-gray-500">
              Code is independent and can be set manually. Use uppercase letters, numbers, hyphens, or underscores.
            </p>
          </div>

          {/* Subcategory Description */}
          <div className="space-y-2">
            <Label htmlFor="subcategory_description" className="text-sm font-medium">
              Subcategory Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="subcategory_description"
              placeholder="Enter detailed description (e.g., hello test subcategory)"
              className="bg-gray-50 border-gray-200 rounded-lg min-h-[100px] resize-none"
              {...register("subcategory_description")}
            />
            {errors.subcategory_description && (
              <span className="text-red-500 text-sm">
                {errors.subcategory_description.message}
              </span>
            )}
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Subcategory Image
            </Label>
            
            {!imagePreview ? (
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  dragActive 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, WebP or GIF (max. 5MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Subcategory preview"
                  className="w-full h-48 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            
            {errors.subcategory_image && (
              <span className="text-red-500 text-sm">
                {errors.subcategory_image.message}
              </span>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
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
                'Create Subcategory'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
