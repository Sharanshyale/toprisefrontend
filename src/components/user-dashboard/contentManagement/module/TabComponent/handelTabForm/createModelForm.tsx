import React, { use, useCallback, useEffect, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast as useGlobalToast } from "@/components/ui/toast"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import { X, Image as ImageIcon, Car } from 'lucide-react'
import { createModel, getBrand, getBrandByType, getTypes } from '@/service/product-Service'
import { useAppSelector } from '@/store/hooks'

// Sample subcategories for dropdown (replace with actual API data)


// Validation schema for model creation
const modelSchema = z.object({
  model_name: z
    .string()
    .min(1, "Model name is required")
    .min(2, "Model name must be at least 2 characters")
    .max(100, "Model name must not exceed 100 characters")
    .regex(/^[a-zA-Z0-9\s-_]+$/, "Model name can only contain letters, numbers, spaces, hyphens, and underscores"),

  model_code: z
    .string()
    .min(1, "Model code is required")
    .min(1, "Model code must be at least 1 character")
    .max(20, "Model code must not exceed 20 characters")
    .regex(/^[A-Z0-9-_]+$/, "Model code must be uppercase letters, numbers, hyphens, or underscores only"),

  brand_ref: z
    .string()
    .min(1, "Please select a brand"),

  model_image: z
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

type ModelFormValues = z.infer<typeof modelSchema>

interface CreateModelFormProps {
  open: boolean
  onClose: () => void
  onSuccess?: (model: any) => void
}

export default function CreateModelForm({ open, onClose, onSuccess }: CreateModelFormProps) {
  const { showToast } = useGlobalToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [brandOptions, setBrandOptions] = useState<any[]>([])
  const [brandLoading, setBrandLoading] = useState(false)

  const auth = useAppSelector((state) => state.auth)

  const { 
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ModelFormValues>({
    resolver: zodResolver(modelSchema),
    defaultValues: {
      model_name: '',
      model_code: '',
      brand_ref: '',
      model_image: undefined,
    }
  })

  const watchedImage = watch('model_image')

  // Fetch types on mount


  // Fetch brands when selectedTypeId changes
  useEffect(() => {

    const fetchBrands = async () => {
      setBrandLoading(true);
      try {
        const response = await getBrand();
        setBrandOptions(response.data);
     
      } catch (err) {
        console.error("Error fetching brands:", err);
      } finally {
        setBrandLoading(false);
      }
    };
    fetchBrands();
  }, []);

  // Handle form submission
  const handleFormSubmit = useCallback(async (data: ModelFormValues) => {
    try {
      console.log("Model form data:", data)
      
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('model_name', data.model_name)
      formData.append('model_code', data.model_code)
      formData.append('brand_ref', data.brand_ref)
        formData.append("created_by", auth.user._id); // Fixed to match Redux structure
        formData.append("updated_by", auth.user._id); 
      // Status will be set to "Created" by default on the backend

      if (data.model_image) {
        formData.append('model_image', data.model_image)
      }

      await createModel(formData)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      showToast("Model created successfully!", "success")
      
      // Reset form and close dialog
      reset()
      setImagePreview(null)
      onClose()
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(data)
      }
      
    } catch (err: any) {
      console.error("Error creating model:", err)
      showToast("Failed to create model. Please try again.", "error")
    }
  }, [showToast, reset, onClose, onSuccess])

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    setValue('model_image', file, { shouldValidate: true })
    
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
    setValue('model_image', undefined, { shouldValidate: true })
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [setValue])

  // Auto-generate model code from name
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    const code = name
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 20)

    setValue('model_code', code, { shouldValidate: true })
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
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            {/* <Car className="h-5 w-5 text-[#C72920]" /> */}
            Create New Model
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      

          {/* Brand Dropdown */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Brand <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="brand_ref"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}
                  disabled={brandLoading}>
                  <SelectTrigger className="bg-gray-50 border-gray-200 rounded-lg">
                    <SelectValue placeholder={brandLoading ? "Loading brands..." : "Select a brand"} />
                  </SelectTrigger>
                  <SelectContent>
                    {brandOptions && Array.isArray(brandOptions) && brandOptions.length > 0 ? (
                      brandOptions.map((option: any) => (
                        <SelectItem key={option?._id || Math.random()} value={option?._id || ""}>
                          {option?.brand_name || "Unknown Brand"}
                        </SelectItem>
                      ))
                    ) : (
                      !brandLoading && (
                        <SelectItem value="no-data" disabled>
                          No brands available
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.brand_ref && (
              <span className="text-red-500 text-sm">
                {errors.brand_ref.message}
              </span>
            )}
          </div>
          {/* Model Name */}
          <div className="space-y-2">
            <Label htmlFor="model_name" className="text-sm font-medium">
              Model Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="model_name"
              placeholder="Enter model name (e.g., APACHE RTR 160 BS4)"
              className="bg-gray-50 border-gray-200 rounded-lg"
              {...register("model_name")}
            />
            {errors.model_name && (
              <span className="text-red-500 text-sm">
                {errors.model_name.message}
              </span>
            )}
          </div>

          {/* Model Code */}
          <div className="space-y-2">
            <Label htmlFor="model_code" className="text-sm font-medium">
              Model Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="model_code"
              placeholder="AUTO_GENERATED (e.g., 90)"
              className="bg-gray-50 border-gray-200 rounded-lg"
              {...register("model_code")}
            />
            {errors.model_code && (
              <span className="text-red-500 text-sm">
                {errors.model_code.message}
              </span>
            )}
            <p className="text-xs text-gray-500">
              Code is auto-generated from the model name but can be edited
            </p>
          </div>

    

          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Model Image
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
                  alt="Model preview"
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
            
            {errors.model_image && (
              <span className="text-red-500 text-sm">
                {errors.model_image.message}
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
                'Create Model'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
