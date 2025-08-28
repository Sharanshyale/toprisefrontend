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
import { createBrand, createSubCategory, getCategories, getTypes } from '@/service/product-Service'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { type } from 'os'
import { useAppSelector } from '@/store/hooks'

// Validation schema for brand creation
const brandSchema = z.object({
  brand_name: z
    .string()
    .min(1, "Brand name is required")
    .min(2, "Brand name must be at least 2 characters")
    .max(100, "Brand name must not exceed 100 characters")
    .regex(/^[a-zA-Z0-9\s-_]+$/, "Brand name can only contain letters, numbers, spaces, hyphens, and underscores"),

  brand_code: z
    .string()
    .min(1, "Brand code is required")
    .min(1, "Brand code must be at least 1 character")
    .max(20, "Brand code must not exceed 20 characters")
    .regex(/^[A-Z0-9-_]+$/, "Brand code must be uppercase letters, numbers, hyphens, or underscores only"),

  brand_description: z
    .string()
    .min(1, "Brand description is required")
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must not exceed 500 characters"),

  type_ref: z.string().min(1, "Please select a type"),

  brand_logo: z
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

type BrandFormValues = z.infer<typeof brandSchema>

interface CreateBrandProps {
  open: boolean
  onClose: () => void
  onSuccess?: (brand: any) => void
}

export default function CreateBrand({ open, onClose, onSuccess }: CreateBrandProps) {
  const { showToast } = useGlobalToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [types, setTypes] = useState<any[]>([])
  const [typeLoading, setTypeLoading] = useState(false)
  const auth = useAppSelector((state) => state.auth)

  const { 
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      brand_name: '',
      brand_code: '',
      brand_description: '',
      type_ref: '',
      brand_logo: undefined,
    }
  })

  const watchedImage = watch('brand_logo')
    useEffect(() => {
      const fetchTypes = async () => {
        setTypeLoading(true);
        try {
          const response = await getTypes();
          const items = response.data;
          setTypes(items);
        } catch (err: any) {
          console.error("Failed to fetch vehicle types:", err);
          showToast("Failed to fetch vehicle types. Please try again.", "error");
        } finally {
          setTypeLoading(false);
        }
      };
      
      fetchTypes();
    }, [])

  // Handle form submission
  const handleFormSubmit = useCallback(async (data: BrandFormValues) => {
    try {
      console.log("Brand form data:", data)
      
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('brand_name', data.brand_name)
      formData.append('brand_code', data.brand_code)
      formData.append('brand_description', data.brand_description)
      formData.append('type', data.type_ref)
      formData.append("created_by", auth.user._id); 
      formData.append("updated_by", auth.user._id); 
      // Status will be set to "Created" by default on the backend

      if (data.brand_logo) {
        formData.append('file', data.brand_logo)
      }

     await createBrand(formData)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      showToast("Brand created successfully!", "success")
      
      // Reset form and close dialog
      reset()
      setImagePreview(null)
      onClose()
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(data)
      }
      
    } catch (err: any) {
      console.error("Error creating brand:", err)
      showToast("Failed to create brand. Please try again.", "error")
    }
  }, [showToast, reset, onClose, onSuccess])

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    setValue('brand_logo', file, { shouldValidate: true })
    
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
    setValue('brand_logo', undefined, { shouldValidate: true })
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [setValue])

  // Auto-generate brand code from name
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    const code = name
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 20)

    setValue('brand_code', code, { shouldValidate: true })
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
          <DialogTitle className="text-xl font-semibold">Create New Brand</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
               <div className="space-y-2">
            <Label className="text-sm font-medium">
              Type <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="type_ref"
              control={control}
              render={({ field }) => (
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  disabled={typeLoading}
                >
                  <SelectTrigger className="bg-gray-50 border-gray-200 rounded-lg">
                    <SelectValue 
                      placeholder={
                        typeLoading
                          ? "Loading types..."
                          : (!types || !Array.isArray(types) || types.length === 0)
                            ? "No types available"
                            : "Select a type"
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {types && Array.isArray(types) && types.length > 0 ? (
                      types.map((option: any) => (
                        <SelectItem key={option?._id || Math.random()} value={option?._id || ""}>
                          {option?.type_name || "Unknown Type"}
                        </SelectItem>
                      ))
                    ) : (
                      !typeLoading && (
                        <SelectItem value="no-data" disabled>
                          No types available
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type_ref && (
              <span className="text-red-500 text-sm">
                {errors.type_ref.message}
              </span>
            )}
          </div>
          {/* Brand Name */}
          <div className="space-y-2">
            <Label htmlFor="brand_name" className="text-sm font-medium">
              Brand Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="brand_name"
              placeholder="Enter brand name (e.g., Maruti Suzuki)"
              className="bg-gray-50 border-gray-200 rounded-lg"
              {...register("brand_name")}
            />
            {errors.brand_name && (
              <span className="text-red-500 text-sm">
                {errors.brand_name.message}
              </span>
            )}
          </div>

          {/* Brand Code */}
          <div className="space-y-2">
            <Label htmlFor="brand_code" className="text-sm font-medium">
              Brand Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="brand_code"
              placeholder="Enter brand code (e.g., 1)"
              className="bg-gray-50 border-gray-200 rounded-lg"
              {...register("brand_code")}
            />
            {errors.brand_code && (
              <span className="text-red-500 text-sm">
                {errors.brand_code.message}
              </span>
            )}
            <p className="text-xs text-gray-500">
              Code is independent and can be set manually. Use uppercase letters, numbers, hyphens, or underscores.
            </p>
          </div>

          {/* Brand Description */}
          <div className="space-y-2">
            <Label htmlFor="brand_description" className="text-sm font-medium">
              Brand Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="brand_description"
              placeholder="Enter detailed description (e.g., Best Brand)"
              className="bg-gray-50 border-gray-200 rounded-lg min-h-[100px] resize-none"
              {...register("brand_description")}
            />
            {errors.brand_description && (
              <span className="text-red-500 text-sm">
                {errors.brand_description.message}
              </span>
            )}
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Brand Logo
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
                  alt="Brand logo preview"
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
            
            {errors.brand_logo && (
              <span className="text-red-500 text-sm">
                {errors.brand_logo.message}
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
                'Create Brand'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
