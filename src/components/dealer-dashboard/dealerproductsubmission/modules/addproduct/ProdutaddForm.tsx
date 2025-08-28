"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { TagsInput } from "react-tag-input-component";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addProductByDealer,
  getBrandByType,
  getCategories,
  getModelByBrand,
  getModels,
  getSubCategories,
  getTypes,
  getvarientByModel,
  getYearRange,
} from "@/service/product-Service";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks";
// Helper to decode JWT and extract user id
import { useToast as useGlobalToast } from "@/components/ui/toast";
import DynamicButton from "@/components/common/button/button";
import { dealerProductSchema } from "@/lib/schemas/product-schema";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

type FormValues = z.infer<typeof dealerProductSchema>;

export default function DealerAddProducts() {
  const [categoryOptions, setCategoryOptions] = useState<any[]>([]);
  const auth = useAppSelector((state) => state.auth);
  const [subCategoryOptions, setSubCategoryOptions] = useState<any[]>([]);
  const [modelOptions, setModelOptions] = useState<any[]>([]);
  const [typeOptions, setTypeOptions] = useState<any[]>([]);

  const [filteredBrandOptions, setFilteredBrandOptions] = useState<any[]>([]);
  const [selectedProductTypeId, setSelectedProductTypeId] =
    useState<string>("");
  const { showToast } = useGlobalToast();
  const [selectedbrandId, setSelectedBrandId] = useState<string>("");
  const [yearRangeOptions, setYearRangeOptions] = useState<any[]>([]);
  const [varientOptions, setVarientOptions] = useState<any[]>([]);
  const [modelId, setModelId] = useState<string>("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [formData, setFormData] = useState<FormValues | null>(null);
  const allowedRoles = ["Super-admin", "Inventory-admin", "Dealer"];

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(dealerProductSchema) as any,
    defaultValues: {
      is_universal: false,
      is_consumable: false,
      brochure_available: "no",
      active: "yes",
      is_returnable: false,
    },
  });

  // Set dealer ID when component mounts
  useEffect(() => {
    if (auth.user && auth.user._id) {
      setValue("addedByDealerId", auth.user._id);
    }
  }, [auth.user, setValue]);

  // Parallel fetch for categories, subcategories, types, and year ranges
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [categories, subCategories, types, yearRanges] =
          await Promise.all([
            getCategories(),
            getSubCategories(),
            getTypes(),
            getYearRange(),
          ]);
        setCategoryOptions(categories.data?.map((category: any) => category) || []);
        setSubCategoryOptions(
          subCategories.data?.map((category: any) => category) || []
        );
        setTypeOptions(types.data?.map((type: any) => type) || []);
        setYearRangeOptions(yearRanges.data?.map((year: any) => year) || []);
        console.log("Fetched all initial data in parallel");
      } catch (error) {
        console.error("Failed to fetch initial data in parallel:", error);
      }
    };
    fetchInitialData();
  }, []);

  // Model options (fetch brands by type)
  useEffect(() => {
    if (!selectedProductTypeId) {
      setFilteredBrandOptions([]);
      return;
    }
    const fetchBrandsByType = async () => {
      try {
        const response = await getBrandByType(selectedProductTypeId);
        setFilteredBrandOptions(response.data?.map((brand: any) => brand) || []);
      } catch (error) {
        setFilteredBrandOptions([]);
        console.error("Failed to fetch brands by type:", error);
      }
    };
    fetchBrandsByType();
  }, [selectedProductTypeId]);

  // Fetch models when brand changes
  useEffect(() => {
    if (!selectedbrandId) {
      setModelOptions([]);
      return;
    }
    const fetchModelsByBrand = async () => {
      try {
        const response = await getModelByBrand(selectedbrandId);
        setModelOptions(response.data?.map((model: any) => model) || []);
      } catch (error) {
        console.error("Failed to fetch models by brand:", error);
      }
    };
    fetchModelsByBrand();
  }, [selectedbrandId]);

  // Fetch variants by model
  useEffect(() => {
    if (!modelId) {
      setVarientOptions([]);
      return;
    }
    const fetchVarientByModel = async () => {
      try {
        const response = await getvarientByModel(modelId);
        setVarientOptions(response.data?.map((varient: any) => varient) || []);
        console.log("Varient Options:", response.data);
      } catch (error) {
        console.error("Failed to fetch varient options:", error);
      }
    };
    fetchVarientByModel();
  }, [modelId]);

  // Handle search tags input and Submit
  const onSubmit = async (data: FormValues) => {
    setFormData(data)
    setShowConfirmDialog(true)
  }

  const handleConfirmSubmit = async () => {
    if (!formData) return
    
    setSubmitLoading(true);
    try {
      const userId = auth.user && auth.user._id;
      if (!userId) {
        showToast("User ID not found in token", "error");
        setSubmitLoading(false);
        return;
      }
      // Add created_by and dealer ID to data
      const dataWithCreatedBy = { 
        ...formData, 
        created_by: userId,
        addedByDealerId: userId // Use the same user ID as dealer ID
      };
      const formDataObj = new FormData();
      Object.entries(dataWithCreatedBy).forEach(([key, value]) => {
        if (key !== "images" && key !== "searchTagsArray") {
          if (Array.isArray(value)) {
            // For arrays, append as comma-separated string (FormData does not support arrays natively)
            formDataObj.append(key, value.join(","));
          } else if (typeof value === "number") {
            formDataObj.append(key, value.toString());
          } else {
            formDataObj.append(
              key,
              typeof value === "boolean" ? String(value) : value ?? ""
            );
          }
        }
      });
      if (imageFiles.length > 0) {
        imageFiles.forEach((file) => {
          formDataObj.append("images", file);
        });
      }
      await addProductByDealer(formDataObj);
      console.log("Product submitted:", dataWithCreatedBy);
      showToast("Product created successfully ", "success");
      setImageFiles([]);
      setImagePreviews([]);
      reset(); // Reset the form after successful submission
    } catch (error) {
      console.error("Failed to submit product:", error);
      showToast("Failed to create product", "error");
    } finally {
      setSubmitLoading(false);
    }
  }

  // Prevent form submission on Enter key in any input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter") {
      // Only allow Enter to submit if the target is a textarea or the submit button
      const target = e.target as HTMLElement;
      if (
        target.tagName !== "TEXTAREA" &&
        target.getAttribute("type") !== "submit"
      ) {
        e.preventDefault();
      }
    }
  };
    if (!auth || !allowedRoles.includes(auth.user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600 font-bold">
          You do not have permission to access this page.
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-6 bg-(neutral-100)-50 min-h-screen ">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 font-sans">
            Add Product
          </h1>
          <p className="text-base font-medium font-sans text-gray-500">Add your product description</p>
        </div>
        {/* Save button removed from here */}
      </div>
      <form
        id="add-product-form"
        onSubmit={handleSubmit(onSubmit, (errors) => {
          console.log("Form validation failed", errors);
        })}
        onKeyDown={handleKeyDown}
        className="space-y-6"
      >
        {/* Hidden input for created_by (snake_case) */}
        <input type="hidden" {...register("created_by")} />
        {/* Core Product Identity */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-bold text-lg font-sans">
              Core Product Identity
            </CardTitle>
            <p className="text-sm text-[#737373] font-medium font-sans">
              Classify the product for catalog structure, filterability, and
              business logic.
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sku Code */}
            <div className="space-y-2">
              <Label
                htmlFor="skuCode"
                className="text-base font-medium font-sans">
              
                Sku Code
              </Label>
              <Input
                id="skuCode"
                placeholder="Enter Sku Code"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("sku_code")}
              />
              {errors.sku_code && (
                <span className="text-red-500 text-sm">
                  {errors.sku_code.message}
                </span>
              )}
            </div>
            {/* No. of Stock */}
            <div className="space-y-2">
              <Label htmlFor="noOfStock" className="text-base font-medium font-sans">
                No. of Stock
              </Label>
              <Input
                id="noOfStock"
                type="number"
                step="1"
                min="0"
                placeholder="Enter No. of Stock"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("no_of_stock", { valueAsNumber: true })}
              />
              {errors.no_of_stock && (
                <span className="text-red-500 text-sm">
                  {errors.no_of_stock.message}
                </span>
              )}
            </div>
            {/* Manufacturer Part Number */}
            <div className="space-y-2">
              <Label
                htmlFor="manufacturerPartNumber"
                className="text-base font-medium font-sans"
              >
                Manufacturer Part Number (MPN)
              </Label>
              <Input
                id="manufacturerPartNumber"
                placeholder="Part Number"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("manufacturer_part_name")}
              />
              {errors.manufacturer_part_name && (
                <span className="text-red-500 text-sm">
                  {errors.manufacturer_part_name.message}
                </span>
              )}
            </div>
            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="productName" className="text-base font-medium font-sans">
                Product Name
              </Label>
              <Input
                id="productName"
                placeholder="Enter Product Name"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("product_name")}
              />
              {errors.product_name && (
                <span className="text-red-500 text-sm">
                  {errors.product_name.message}
                </span>
              )}
            </div>

            {/* HSN Code */}
            <div className="space-y-2">
              <Label htmlFor="hsnCode" className="text-base font-medium font-sans">
                HSN Code
              </Label>
              <Input
                id="hsnCode"
                placeholder="Enter HSN Code"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                type="number"
                {...register("hsn_code", {
                  valueAsNumber: true,
                  required: "HSN Code is required",
                  validate: (value) =>
                    value === undefined || isNaN(value)
                      ? "Invalid input: expected number"
                      : true,
                })}
              />
              {errors.hsn_code && (
                <span className="text-red-500 text-sm">
                  {errors.hsn_code.message}
                </span>
              )}
            </div>
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-base font-medium font-sans">
                Category
              </Label>
              <Select
                onValueChange={(value) => setValue("category", value)}
                value={undefined} // Let react-hook-form control value if needed
              >
                <SelectTrigger
                  id="category"
                  className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full"
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.length === 0 ? (
                    <SelectItem value="loading" disabled>
                      Loading...
                    </SelectItem>
                  ) : (
                    categoryOptions.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.category_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.category && (
                <span className="text-red-500 text-sm">
                  {errors.category.message}
                </span>
              )}
            </div>
            {/* Sub-category */}
            <div className="space-y-2">
              <Label htmlFor="subCategory" className="text-base font-medium font-sans">
                Sub-category
              </Label>
              <Select
                onValueChange={(value) => setValue("sub_category", value)}
              >
                <SelectTrigger
                  id="subCategory"
                  className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full"
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {subCategoryOptions.length === 0 ? (
                    <SelectItem value="loading" disabled>
                      Loading...
                    </SelectItem>
                  ) : (
                    subCategoryOptions.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.subcategory_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.sub_category && (
                <span className="text-red-500 text-sm">
                  {errors.sub_category.message}
                </span>
              )}
            </div>
            {/* Product Type (OE, OEM, Aftermarket) */}
            <div className="space-y-2">
              <Label htmlFor="productType" className="text-base font-medium font-sans">
                Product Type
              </Label>
              <Select
                onValueChange={(value) => setValue("product_type", value)}
                defaultValue={watch("product_type")}
              >
                <SelectTrigger
                  id="productType"
                  className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full"
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OE">OE</SelectItem>
                  <SelectItem value="OEM">OEM</SelectItem>
                  <SelectItem value="AfterMarket">Aftermarket</SelectItem>
                </SelectContent>
              </Select>
              {errors.product_type && (
                <span className="text-red-500 text-sm">
                  {errors.product_type.message}
                </span>
              )}
            </div>
            {/* Vehicle Type (keep as is) */}
            <div className="space-y-2">
              <Label htmlFor="vehicleType" className="text-base font-medium font-sans">
                Vehicle Type
              </Label>
              <Select
                onValueChange={(value) => {
                  setValue("vehicle_type", value);
                  setSelectedProductTypeId(value);
                }}
                defaultValue={watch("vehicle_type")}
              >
                <SelectTrigger
                  id="vehicleType"
                  className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full"
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.length === 0 ? (
                    <SelectItem value="loading" disabled>
                      Loading...
                    </SelectItem>
                  ) : (
                    typeOptions.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.type_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.vehicle_type && (
                <span className="text-red-500 text-sm">
                  {errors.vehicle_type.message}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Compatibility */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-bold text-lg font-sans">
              Vehicle Compatibility
            </CardTitle>
            <p className="text-sm text-[#737373] font-medium font-sans">
              Specify which vehicle make, model, and variant the product is
              compatible with.
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Make */}
            <div className="space-y-2">
              <Label htmlFor="brand" className="text-base font-medium font-sans">
                Brand
              </Label>
              <Select
                onValueChange={(value) => {
                  setSelectedBrandId(value);
                  setValue("brand", value);
                }}
              >
                <SelectTrigger
                  id="brand"
                  className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full"
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {filteredBrandOptions.length === 0 ? (
                    <SelectItem value="loading" disabled>
                      Please select Product Type first
                    </SelectItem>
                  ) : (
                    filteredBrandOptions.map((option) => (
                      <SelectItem key={option._id} value={option._id}>
                        {option.brand_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.brand && (
                <span className="text-red-500 text-sm">
                  {errors.brand.message}
                </span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="make" className="text-base font-medium font-sans">
                Make
              </Label>
              <Input
                id="make"
                placeholder="Enter Make"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("make")}
              />
              {errors.make && (
                <span className="text-red-500 text-sm">
                  {errors.make.message}
                </span>
              )}
            </div>

            {/* Model */}
            <div className="space-y-2">
              <Label htmlFor="model" className="text-base font-medium font-sans">
                Model
              </Label>
              <Select
                onValueChange={(value) => {
                  setValue("model", value);
                  setModelId(value);
                }}
              >
                <SelectTrigger
                  id="model"
                  className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full"
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {selectedbrandId && modelOptions.length === 0 ? (
                    <SelectItem value="no-models" disabled>
                      No models found
                    </SelectItem>
                  ) : modelOptions.length === 0 ? (
                    <SelectItem value="loading" disabled>
                      Please select Make first
                    </SelectItem>
                  ) : (
                    modelOptions.map((option) => (
                      <SelectItem key={option._id} value={option._id}>
                        {option.model_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.model && (
                <span className="text-red-500 text-sm">
                  {errors.model.message}
                </span>
              )}
            </div>
            {/* Year Range */}
            <div className="space-y-2">
              <Label htmlFor="yearRange" className="text-base font-medium font-sans">
                Year Range
              </Label>
              <Select onValueChange={(value) => setValue("year_range", value)}>
                <SelectTrigger
                  id="yearRange"
                  className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full"
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {yearRangeOptions.length === 0 ? (
                    <SelectItem value="loading" disabled>
                      Loading...
                    </SelectItem>
                  ) : (
                    yearRangeOptions.map((option) => (
                      <SelectItem key={option._id} value={option._id}>
                        {option.year_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.year_range && (
                <span className="text-red-500 text-sm">
                  {errors.year_range.message}
                </span>
              )}
            </div>
            {/* Variant */}
            <div className="space-y-2">
              <Label htmlFor="variant" className="text-base font-medium font-sans">
                Variant
              </Label>
              <Select onValueChange={(value) => setValue("variant", value)}>
                <SelectTrigger
                  id="variant"
                  className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full"
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {varientOptions.length === 0 && modelId.length === 0 ? (
                    <SelectItem value="no-varient" disabled>
                      {" "}
                      Vairent not found{" "}
                    </SelectItem>
                  ) : varientOptions.length === 0 ? (
                    <SelectItem value="loading" disabled>
                      please select model first
                    </SelectItem>
                  ) : (
                    varientOptions.map((option) => (
                      <SelectItem key={option._id} value={option._id}>
                        {option.variant_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.variant && (
                <span className="text-red-500 text-sm">
                  {errors.variant.message}
                </span>
              )}
            </div>
            {/* Fitment Notes */}
            <div className="space-y-2">
              <Label htmlFor="fitmentNotes" className="text-base font-medium font-sans">
                Fitment Notes
              </Label>
              <Input
                id="fitmentNotes"
                placeholder="Enter Fitment Notes"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("fitment_notes")}
              />
              {errors.fitment_notes && (
                <span className="text-red-500 text-sm">
                  {errors.fitment_notes.message}
                </span>
              )}
            </div>
            {/* Fulfillment Priority */}
            <div className="space-y-2">
              <Label
                htmlFor="fulfillmentPriority"
                className="text-base font-medium font-sans"
              >
                Fulfillment Priority
              </Label>
              <Input
                id="fulfillmentPriority"
                type="number"
                step="1"
                min="0"
                placeholder="Enter Fulfillment Priority"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("fulfillment_priority", { valueAsNumber: true })}
              />
              {errors.fulfillment_priority && (
                <span className="text-red-500 text-sm">
                  {errors.fulfillment_priority.message}
                </span>
              )}
            </div>
            {/* Is Universal */}
            <div className="space-y-2">
              <Label htmlFor="isUniversal" className="text-base font-medium font-sans">
                Is Universal
              </Label>
              <Select
                onValueChange={(value) =>
                  setValue("is_universal", value === "yes")
                }
                defaultValue="no"
              >
                <SelectTrigger
                  id="isUniversal"
                  className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full"
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
              {errors.is_universal && (
                <span className="text-red-500 text-sm">
                  {errors.is_universal.message}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Technical Specifications */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-bold text-lg font-sans">
              Technical Specifications
            </CardTitle>
            <p className="text-sm text-[#737373] font-medium font-sans">
              Add all relevant technical details to help users understand the
              product quality and features.
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Specifications */}
            <div className="space-y-2">
              <Label
                htmlFor="keySpecifications"
                className="text-base font-medium font-sans"
              >
                Key Specifications
              </Label>
              <Input
                id="keySpecifications"
                placeholder="Enter Key Specifications"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("keySpecifications")}
              />
              {errors.keySpecifications && (
                <span className="text-red-500 text-sm">
                  {errors.keySpecifications.message}
                </span>
              )}
            </div>
            {/* Dimensions */}
            <div className="space-y-2">
              <Label htmlFor="dimensions" className="text-base font-medium font-sans">
                Dimensions
              </Label>
              <Input
                id="dimensions"
                placeholder="Enter Dimensions"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("dimensions")}
              />
              {errors.dimensions && (
                <span className="text-red-500 text-sm">
                  {errors.dimensions.message}
                </span>
              )}
            </div>
            {/* Weight */}
            <div className="space-y-2">
              <Label htmlFor="weight" className="text-base font-medium font-sans">
                Weight
              </Label>
              <Input
                id="weight"
                placeholder="Enter Weight"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("weight")}
              />
              {errors.weight && (
                <span className="text-red-500 text-sm">
                  {errors.weight.message}
                </span>
              )}
            </div>
            {/* Certifications */}
            <div className="space-y-2">
              <Label htmlFor="certifications" className="text-base font-medium font-sans">
                Certifications
              </Label>
              <Input
                id="certifications"
                placeholder="Enter Certifications"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("certifications")}
              />
              {errors.certifications && (
                <span className="text-red-500 text-sm">
                  {errors.certifications.message}
                </span>
              )}
            </div>
            {/* Warranty */}
            <div className="space-y-2">
              <Label htmlFor="warranty" className="text-base font-medium font-sans">
                Warranty
              </Label>
              <Input
                id="warranty"
                type="number"
                step="1"
                min="0"
                placeholder="Enter Warranty"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("warranty", {
                  setValueAs: (v) => (v === "" ? undefined : Number(v)),
                })}
              />
              {errors.warranty && (
                <span className="text-red-500 text-sm">
                  {errors.warranty.message}
                </span>
              )}
            </div>
            {/* Is Consumable */}
            <div className="space-y-2">
              <Label htmlFor="isConsumable" className="text-base font-medium font-sans">
                Is Consumable
              </Label>
              <Select
                onValueChange={(value) =>
                  setValue("is_consumable", value === "yes")
                }
                defaultValue="no"
              >
                <SelectTrigger
                  id="isConsumable"
                  className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full"
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
              {errors.is_consumable && (
                <span className="text-red-500 text-sm">
                  {errors.is_consumable.message}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Media & Documentation */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-bold text-lg font-sanss">
              Media & Documentation
            </CardTitle>
            <p className="text-sm text-[#737373] font-medium font-sans">
              Upload product images, videos, and brochures to enhance product
              representation and credibility.
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Images */}
            <div className="space-y-2">
              <Label htmlFor="images" className="text-base font-medium font-sans">
                Images
              </Label>
              <input
                id="images"
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setImageFiles((prev) => [...prev, ...files]);
                  // Generate previews for new files
                  files.forEach((file) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setImagePreviews((prev) => [...prev, reader.result as string]);
                    };
                    reader.readAsDataURL(file);
                  });
                  setValue("images", files.length > 0 ? files.map(f => f.name).join(",") : ""); // for validation
                }}
              />
              <Button
                type="button"
                className="bg-gray-50 border border-gray-200 rounded-[8px] p-4 w-full text-left text-gray-700 hover:bg-gray-100"
                onClick={() => document.getElementById("images")?.click()}
              >
                {imageFiles.length > 0 ? `${imageFiles.length} image(s) selected` : "Choose Images"}
              </Button>
              {imagePreviews.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {imagePreviews.map((preview, idx) => (
                    <div key={idx} className="relative inline-block">
                      <img
                        src={preview}
                        alt={`Preview ${idx + 1}`}
                        className="max-h-24 rounded border"
                      />
                      <button
                        type="button"
                        className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        onClick={() => {
                          setImageFiles((prev) => prev.filter((_, i) => i !== idx));
                          setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
                        }}
                        title="Remove"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {errors.images && (
                <span className="text-red-500 text-sm">
                  {errors.images.message}
                </span>
              )}
            </div>
            {/* Video URL */}
            <div className="space-y-2">
              <Label htmlFor="videoUrl" className="text-base font-medium font-sans">
                Video URL
              </Label>
              <Input
                id="videoUrl"
                placeholder="Past Link"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("videoUrl")}
              />
              {errors.videoUrl && (
                <span className="text-red-500 text-sm">
                  {errors.videoUrl.message}
                </span>
              )}
            </div>
            {/* Brochure Available */}
            <div className="space-y-2">
              <Label
                htmlFor="brouchureAvailable"
                className="text-base font-medium font-sans"
              >
                Brochure Available
              </Label>
              <Select
                onValueChange={(value) => setValue("brochure_available", value)}
                defaultValue="no"
              >
                <SelectTrigger
                  id="brouchureAvailable"
                  className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full"
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
              {errors.brochure_available && (
                <span className="text-red-500 text-sm">
                  {errors.brochure_available.message}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pricing details */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-bold text-lg font-sans">
              Pricing & Tax
            </CardTitle>
            <p className="text-sm text-[#737373] font-medium font-sans">
              Provide the pricing and tax information required for listing and
              billing.
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* MRP (with GST) */}
            <div className="space-y-2">
              <Label htmlFor="mrp" className="text-base font-medium font-sans">
                MRP (with GST)
              </Label>
              <Input
                id="mrp"
                type="number"
                placeholder="Enter MRP"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("mrp_with_gst", { valueAsNumber: true })}
              />
              {errors.mrp_with_gst && (
                <span className="text-red-500 text-sm">
                  {errors.mrp_with_gst.message}
                </span>
              )}
            </div>
            {/* Selling Price (Required) */}
            <div className="space-y-2">
              <Label htmlFor="selling_price" className="text-base font-medium font-sans">
                Selling Price <span className="text-red-500">*</span>
              </Label>
              <Input
                id="selling_price"
                type="number"
                step="1"
                min="0"
                placeholder="Enter Selling Price"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("selling_price", {
                  valueAsNumber: true,
                  required: true,
                })}
              />
              {errors.selling_price && (
                <span className="text-red-500 text-sm">
                  {errors.selling_price.message}
                </span>
              )}
            </div>
            {/* GST % */}
            <div className="space-y-2">
              <Label htmlFor="gst" className="text-base font-medium font-sans">
                GST %
              </Label>
              <Input
                id="gst_percentage"
                type="number"
                placeholder="Enter GST"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("gst_percentage", {
                  valueAsNumber: true,
                })}
              />
              {errors.gst_percentage && (
                <span className="text-red-500 text-sm">
                  {errors.gst_percentage.message}
                </span>
              )}
            </div>
            {/* Returnable */}
            <div className="space-y-2">
              <Label htmlFor="returnable" className="text-base font-medium font-sans">
                Returnable
              </Label>
              <Select
                onValueChange={(value) =>
                  setValue("is_returnable", value === "yes")
                }
                value={watch("is_returnable") ? "yes" : "no"}
              >
                <SelectTrigger
                  id="returnable"
                  className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full"
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
              {errors.is_returnable && (
                <span className="text-red-500 text-sm">
                  {errors.is_returnable.message}
                </span>
              )}
            </div>
            {/* Return Policy */}
            <div className="space-y-2">
              <Label htmlFor="returnPolicy" className="text-base font-medium font-sans">
                Return Policy
              </Label>
              <Input
                id="returnPolicy"
                placeholder="Enter Return Policy"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("return_policy")}
              />
              {errors.return_policy && (
                <span className="text-red-500 text-sm">
                  {errors.return_policy.message}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dealer-Level Mapping & Routing */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-bold text-lg font-sans">
              Dealer-Level Mapping & Routing
            </CardTitle>
            <p className="text-sm text-[#737373] font-medium font-sans">
              Dealer product quantity and quality
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dealer ID */}
            <div className="space-y-2">
              <Label
                htmlFor="addedByDealerId"
                className="text-base font-medium font-sans"
              >
                Dealer ID
              </Label>
              <Input
                id="addedByDealerId"
                placeholder="Enter Dealer ID"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("addedByDealerId")}
                readOnly
                value={auth.user?._id || ""}
              />
              {errors.addedByDealerId && (
                <span className="text-red-500 text-sm">
                  {errors.addedByDealerId.message}
                </span>
              )}
            </div>
            {/* Quantity per Dealer */}
            <div className="space-y-2">
              <Label
                htmlFor="quantityPerDealer"
                className="text-base font-medium font-sans"
              >
                Quantity per Dealer
              </Label>
              <Input
                id="quantityPerDealer"
                placeholder="Enter Quantity"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("quantityPerDealer")}
              />
              {errors.quantityPerDealer && (
                <span className="text-red-500 text-sm">
                  {errors.quantityPerDealer.message}
                </span>
              )}
            </div>
            {/* Dealer Margin % */}
          </CardContent>
        </Card>

        {/* SEO & Search Optimization */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-bold text-lg font-sans">
              SEO & Search Optimization
            </CardTitle>
            <p className="text-sm text-[#737373] font-medium font-sans">
              Provide the pricing and tax information required for listing and
              billing.
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SEO Title */}
            <div className="space-y-2">
              <Label htmlFor="seoTitle" className="text-base font-medium font-sans">
                SEO Title
              </Label>
              <Input
                id="seoTitle"
                placeholder="Enter SEO Title"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("seo_title")}
              />
              {errors.seo_title && (
                <span className="text-red-500 text-sm">
                  {errors.seo_title.message}
                </span>
              )}
            </div>
            {/* Search Tags (chip input) */}
            <div className="space-y-2">
              <Label htmlFor="searchTagsArray" className="text-base font-medium font-sans">
                Search Tags
              </Label>
              <TagsInput
                value={
                  Array.isArray(watch("search_tags"))
                    ? watch("search_tags")
                    : []
                }
                onChange={(tags: string[]) => setValue("search_tags", tags)}
                name="searchTagsArray"
                placeHolder="Add tag and press enter"
              />
              {errors.search_tags && (
                <span className="text-red-500 text-sm">
                  {errors.search_tags.message}
                </span>
              )}
            </div>
            {/* SEO Description */}
            <div className="space-y-2">
              <Label htmlFor="seoDescription" className="text-base font-medium font-sans">
                SEO Description
              </Label>
              <Input
                id="seoDescription"
                placeholder="Enter SEO Description"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("seo_description")}
              />
              {errors.seo_description && (
                <span className="text-red-500 text-sm">
                  {errors.seo_description.message}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end pt-4">

          <DynamicButton
          variant="default"
          type="submit"
          customClassName="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg shadow-sm"
          disabled={submitLoading}
          loading={submitLoading}
          loadingText="Adding..."
          text="Add Product"
          />
        </div>
        <ConfirmationDialog
          isOpen={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          onConfirm={handleConfirmSubmit}
          title="Add Product"
          description="Are you sure you want to add this product?"
          confirmText="Yes, Add Product"
          cancelText="No, Cancel"
        />
      </form>
    </div>
  );
}
