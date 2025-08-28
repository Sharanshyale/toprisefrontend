
"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { selectProductById } from "@/store/slice/product/productSlice";
import { useAppSelector } from "@/store/hooks";
import { DynamicBreadcrumb } from "@/components/user-dashboard/DynamicBreadcrumb";

// @ts-ignore
import { TagsInput } from "react-tag-input-component";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getCategories,
  getSubCategories,
  getTypes,
  getBrandByType,
  getModelByBrand,
  getYearRange,
  getvarientByModel,
  editProduct,
  getProductById,
} from "@/service/product-Service";
import { useParams } from "next/navigation";
import { Product } from "@/types/product-Types";
import { useToast as useGlobalToast } from "@/components/ui/toast";
import { dealerProductSchema } from "@/lib/schemas/product-schema";
import { checkDealerProductPermission } from "@/service/dealer-product";

type FormValues = z.infer<typeof dealerProductSchema>;

export default function DealerProductEdit() {
  // State for dropdown options
    const auth = useAppSelector((state) => state.auth.user);
  const [categoryOptions, setCategoryOptions] = useState<any[]>([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState<any[]>([]);
  const [typeOptions, setTypeOptions] = useState<any[]>([]);
  const [modelOptions, setModelOptions] = useState<any[]>([]);
  const [yearRangeOptions, setYearRangeOptions] = useState<any[]>([]);
  const [varientOptions, setVarientOptions] = useState<any[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  // State for dependent dropdowns
  const [selectedProductTypeId, setSelectedProductTypeId] =
    useState<string>("");
  const [selectedbrandId, setSelectedBrandId] = useState<string>("");
  const [modelId, setModelId] = useState<string>("");
  const id = useParams();
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  const [brandOptions, setBrandOptions] = useState<any[]>([]);

  // State for image uploads and previews
  const [selectedImages, setSelectedImages] = useState<File[]>([]); // new uploads
  const [selectedImagePreviews, setSelectedImagePreviews] = useState<string[]>([]); // new upload previews
  const [existingImages, setExistingImages] = useState<string[]>([]); // URLs of images from backend
  const [removedExistingIndexes, setRemovedExistingIndexes] = useState<number[]>([]); // indexes of removed existing images
  const [apiError, setApiError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const { showToast } = useGlobalToast();
  const allowedRoles = ["Super-admin", "Inventory-admin", "Dealer"];
  const [allowedFields, setAllowedFields] = useState<string[] | null>(null);
  const [permissionLoading, setPermissionLoading] = useState(false);
  const [permissionError, setPermissionError] = useState<string>("");


  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(dealerProductSchema) as any,
  });
  // Handle image file input change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedImages((prev) => [...prev, ...filesArray]);
      filesArray.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setSelectedImagePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
      setValue("images", ""); // not used for validation here
    }
  };
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
        const categoriesArr: any[] = Array.isArray((categories as any).data)
          ? (categories as any).data
          : Array.isArray((categories as any)?.data?.products)
          ? (categories as any).data.products
          : [];
        const subCategoriesArr: any[] = Array.isArray((subCategories as any).data)
          ? (subCategories as any).data
          : Array.isArray((subCategories as any)?.data?.products)
          ? (subCategories as any).data.products
          : [];
        const typesArr: any[] = Array.isArray((types as any).data)
          ? (types as any).data
          : Array.isArray((types as any)?.data?.products)
          ? (types as any).data.products
          : [];
        const yearsArr: any[] = Array.isArray((yearRanges as any).data)
          ? (yearRanges as any).data
          : Array.isArray((yearRanges as any)?.data?.products)
          ? (yearRanges as any).data.products
          : [];
        setCategoryOptions(categoriesArr);
        setSubCategoryOptions(subCategoriesArr);
        setTypeOptions(typesArr);
        setYearRangeOptions(yearsArr);
        console.log("Fetched all initial data in parallel");
      } catch (error) {
        console.error("Failed to fetch initial data in parallel:", error);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch brands when product type changes
  useEffect(() => {
    if (!selectedProductTypeId) {
      setBrandOptions([]);
      return;
    }

    let isMounted = true;
    const fetchBrandsByType = async () => {
      setIsLoadingBrands(true);
      try {
        const response = await getBrandByType(selectedProductTypeId);
        console.log("Brand Options:", (response as any).data);
        if (isMounted) {
          const arr: any[] = Array.isArray((response as any).data)
            ? (response as any).data
            : Array.isArray((response as any)?.data?.products)
            ? (response as any).data.products
            : [];
          setBrandOptions(arr);
        }
      } catch (error) {
        if (isMounted) setBrandOptions([]);
        console.error("Failed to fetch brands by type:", error);
      } finally {
        if (isMounted) setIsLoadingBrands(false);
      }
    };

    fetchBrandsByType();
    return () => {
      isMounted = false;
    };
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
        const arr: any[] = Array.isArray((response as any).data)
          ? (response as any).data
          : Array.isArray((response as any)?.data?.products)
          ? (response as any).data.products
          : [];
        setModelOptions(arr);
        console.log("Model Options:", (response as any).data);
      } catch (error) {
        setModelOptions([]);
        console.error("Failed to fetch models by brand:", error);
      }
    };
    fetchModelsByBrand();
  }, [selectedbrandId]);

  // Fetch variants when model changes
  useEffect(() => {
    if (!modelId) {
      setVarientOptions([]);
      return;
    }
    const fetchVarientByModel = async () => {
      try {
        const response = await getvarientByModel(modelId);
        const arr: any[] = Array.isArray((response as any).data)
          ? (response as any).data
          : Array.isArray((response as any)?.data?.products)
          ? (response as any).data.products
          : [];
        setVarientOptions(arr);
        console.log("Varient Options:", (response as any).data);
      } catch (error) {
        console.error("Failed to fetch varient options:", error);
      }
    };
    fetchVarientByModel();
  }, [modelId]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!id.id || typeof id.id !== "string") {
        setApiError("Product ID is missing or invalid.");
        return;
      }

      setIsLoadingProduct(true);
      setApiError("");
      
      try {
        const response = await getProductById(id.id);
        const rawData: any = (response as any).data;
        if (Array.isArray(rawData?.products) && rawData.products.length > 0) {
          setProduct(rawData.products[0] as Product);
        } else if (Array.isArray(rawData) && rawData.length > 0) {
          setProduct(rawData[0] as Product);
        } else if (rawData && typeof rawData === "object" && rawData._id) {
          setProduct(rawData as Product);
        } else {
          setProduct(null);
          setApiError("Product not found.");
        }
        console.log("getProducts API response:", response);
      } catch (error: any) {
        console.error("getProducts API error:", error);
        setApiError(
          error.response?.data?.message || 
          error.message || 
          "Failed to fetch product details."
        );
        setProduct(null);
      } finally {
        setIsLoadingProduct(false);
      }
    };
    
    fetchProducts();
  }, [id.id]);

  // Populate form with fetched product data
  useEffect(() => {
    if (product) {
      console.log("Setting form values for product:", product);
      reset({
        sku_code: product.sku_code || "",
        manufacturer_part_name: product.manufacturer_part_name || "",
        product_name: product.product_name || "",
        brand: product.brand?._id || "",
        hsn_code: product.hsn_code ? Number(product.hsn_code) : undefined,
        category: product.category?._id || "",
        sub_category: product.sub_category?._id || "",
        product_type: product.product_type || "",
        no_of_stock: product.no_of_stock,
        selling_price: product.selling_price,
        updatedBy: product.updated_at || "",
        fulfillment_priority: product.fulfillment_priority,
        admin_notes: product.admin_notes || "",
        make: product.make && product.make.length > 0 ? product.make[0] : "",
        vehicle_type: "", // Will be set in separate useEffect
        model: product.model?._id || "",
        year_range:
          product.year_range && product.year_range.length > 0
            ? product.year_range[0]._id
            : "",
        variant:
          product.variant && product.variant.length > 0
            ? product.variant[0]._id
            : "",
        fitment_notes: product.fitment_notes || "",
        is_universal: typeof product.is_universal === "boolean" ? product.is_universal : false,
        is_consumable: typeof product.is_consumable === "boolean" ? product.is_consumable : false,
        keySpecifications: product.key_specifications || "",
        dimensions: "",
        weight: product.weight?.toString() || "",
        certifications: product.certifications || "",
        warranty: product.warranty ? Number(product.warranty) : undefined,
        images: product.images?.join(",") || "",
        videoUrl: "",
        brochure_available: product.brochure_available ? "yes" : "no",
        mrp_with_gst: product.mrp_with_gst ? Number(product.mrp_with_gst) : undefined,
        gst_percentage: product.gst_percentage ? Number(product.gst_percentage) : undefined,
        is_returnable: typeof product.is_returnable === "boolean" ? product.is_returnable : product.is_returnable === "yes",
        return_policy: product.return_policy || "",
        availableDealers: "",
        quantityPerDealer: "",
        dealerMargin: "",
        dealerPriorityOverride: "",
        stockExpiryRule: "",
        lastStockUpdate:
          Array.isArray(product.available_dealers) &&
          product.available_dealers.length > 0
            ? product.available_dealers[0]?.last_stock_update || ""
            : "",
        LastinquiredAt: product.last_stock_inquired || "",
        seo_title: product.seo_title || "",
        searchTags: product.search_tags?.join(",") || "",
        search_tags: product.search_tags || [],
        seo_description: product.seo_description || "",
      });
      
      // Initialize image previews for existing images
      if (product.images && Array.isArray(product.images)) {
        setExistingImages(product.images);
      } else {
        setExistingImages([]);
      }
      setSelectedImages([]);
      setSelectedImagePreviews([]);
      setRemovedExistingIndexes([]);
    }
  }, [product, reset]);

  // Force update all form fields after reset to ensure proper population
  useEffect(() => {
    if (product) {
      // Set vehicle_type immediately if typeOptions are available
      if (typeOptions.length > 0) {
        const selectedTypeObj = typeOptions.find(
          (t) => t.type_name === product.product_type || t._id === product.product_type
        );
        if (selectedTypeObj) {
          setValue("vehicle_type", selectedTypeObj._id);
          setSelectedProductTypeId(selectedTypeObj._id);
        }
      }
      
      // Set brand immediately if brandOptions are available
      if (brandOptions.length > 0 && product.brand?._id) {
        const selectedBrandObj = brandOptions.find(
          (b) => b._id === product.brand?._id
        );
        if (selectedBrandObj) {
          setValue("brand", selectedBrandObj._id);
          setSelectedBrandId(selectedBrandObj._id);
        }
      }
    }
  }, [product, typeOptions, brandOptions, setValue]);

  // Initialize dependent state variables when product loads
  useEffect(() => {
    if (!product) return;

    // Set product type ID for brand dependency
    if (typeOptions.length > 0) {
      const selectedTypeObj = typeOptions.find(
        (t) => t.type_name === product.product_type || t._id === product.product_type
      );
      if (selectedTypeObj) {
        setSelectedProductTypeId(selectedTypeObj._id);
      }
    }

    // Set brand ID for model dependency
    if (product.brand?._id) {
      setSelectedBrandId(product.brand._id);
    }

    // Set model ID for variant dependency
    if (product.model?._id) {
      setModelId(product.model._id);
    }
  }, [product, typeOptions]);

  // Prepopulate dependent dropdowns in correct order after product data loads
  useEffect(() => {
    if (!product || !typeOptions.length) return;

    // Product Type - Find and set the vehicle type ID
    const selectedTypeObj = typeOptions.find(
      (t) => t.type_name === product.product_type || t._id === product.product_type
    );
    if (selectedTypeObj) {
      setValue("vehicle_type", selectedTypeObj._id);
      setSelectedProductTypeId(selectedTypeObj._id);
    }
  }, [product, typeOptions, setValue]);

  // Force update vehicle_type when product loads
  useEffect(() => {
    if (product && typeOptions.length > 0) {
      const selectedTypeObj = typeOptions.find(
        (t) => t.type_name === product.product_type || t._id === product.product_type
      );
      if (selectedTypeObj) {
        setValue("vehicle_type", selectedTypeObj._id);
      }
    }
  }, [product, typeOptions, setValue]);

  useEffect(() => {
    // Brand - Wait for brandOptions to be populated
    if (product && brandOptions.length > 0 && product.brand) {
      const selectedBrandObj = brandOptions.find(
        (b) => b._id === product.brand?._id
      );
      if (selectedBrandObj) {
        setSelectedBrandId(selectedBrandObj._id);
        setValue("brand", selectedBrandObj._id);
      }
    }
  }, [product, brandOptions, setValue]);

  useEffect(() => {
    // Model - Wait for modelOptions to be populated
    if (product && modelOptions.length > 0 && product.model) {
      const selectedModelObj = modelOptions.find(
        (m) => m._id === product.model?._id
      );
      if (selectedModelObj) {
        setModelId(selectedModelObj._id);
        setValue("model", selectedModelObj._id);
      }
    }
  }, [product, modelOptions, setValue]);

  useEffect(() => {
    // Variant - Wait for varientOptions to be populated
    if (
      product &&
      varientOptions.length > 0 &&
      product.variant &&
      product.variant.length > 0
    ) {
      const selectedVariantObj = varientOptions.find(
        (v) => v._id === product.variant?.[0]?._id
      );
      if (selectedVariantObj) {
        setValue("variant", selectedVariantObj._id);
      }
    }
  }, [product, varientOptions, setValue]);

  useEffect(() => {
    // Year Range - Wait for yearRangeOptions to be populated
    if (
      product &&
      yearRangeOptions.length > 0 &&
      product.year_range &&
      product.year_range.length > 0
    ) {
      const selectedYearObj = yearRangeOptions.find(
        (y) => y._id === product.year_range?.[0]?._id
      );
      if (selectedYearObj) {
        setValue("year_range", selectedYearObj._id);
      }
    }
  }, [product, yearRangeOptions, setValue]);

  // Force form update when options are loaded
  useEffect(() => {
    if (product && categoryOptions.length > 0) {
      setValue("category", product.category?._id || "");
    }
  }, [product, categoryOptions, setValue]);

  useEffect(() => {
    if (product && subCategoryOptions.length > 0) {
      setValue("sub_category", product.sub_category?._id || "");
    }
  }, [product, subCategoryOptions, setValue]);

  // Ensure product type is set when product loads
  useEffect(() => {
    if (product) {
      setValue("product_type", product.product_type || "");
    }
  }, [product, setValue]);

  // Ensure vehicle_type is set when both product and typeOptions are available
  useEffect(() => {
    if (product && typeOptions.length > 0) {
      console.log("Setting vehicle_type for product:", product.product_type);
      console.log("Available typeOptions:", typeOptions);
      
      // First try to find by type_name (string match)
      let selectedTypeObj = typeOptions.find(
        (t) => t.type_name === product.product_type
      );
      
      // If not found, try to find by _id
      if (!selectedTypeObj) {
        selectedTypeObj = typeOptions.find(
          (t) => t._id === product.product_type
        );
      }
      
      if (selectedTypeObj) {
        console.log("Found matching type:", selectedTypeObj);
        setValue("vehicle_type", selectedTypeObj._id);
        setSelectedProductTypeId(selectedTypeObj._id);
      } else {
        console.log("No matching type found for:", product.product_type);
        // Set a default value if no match found
        if (typeOptions.length > 0) {
          setValue("vehicle_type", typeOptions[0]._id);
          setSelectedProductTypeId(typeOptions[0]._id);
        }
      }
    }
  }, [product, typeOptions, setValue]);

  // Ensure brand is set when both product and brandOptions are available
  useEffect(() => {
    if (product && brandOptions.length > 0) {
      console.log("Setting brand for product:", product.brand);
      console.log("Available brandOptions:", brandOptions);
      
      const selectedBrandObj = brandOptions.find(
        (b) => b._id === product.brand?._id
      );
      
      if (selectedBrandObj) {
        console.log("Found matching brand:", selectedBrandObj);
        setValue("brand", selectedBrandObj._id);
        setSelectedBrandId(selectedBrandObj._id);
      } else {
        console.log("No matching brand found for:", product.brand?._id);
      }
    }
  }, [product, brandOptions, setValue]);

  const onSubmit = async (data: FormValues) => {
    setApiError("");
    setIsSubmitting(true);

    if (typeof id.id === "string") {
      const preparedData = {
        ...data,
        hsn_code: data.hsn_code ? Number(data.hsn_code) : undefined,
        is_universal:
          typeof data.is_universal === "boolean"
            ? data.is_universal
            : data.is_universal === "yes",
        is_consumable:
          typeof data.is_consumable === "boolean"
            ? data.is_consumable
            : data.is_consumable === "yes",
      } as any;

      // Ensure required relational fields are not sent as empty strings.
      const normalizedData = {
        ...preparedData,
        brand: preparedData.brand || product?.brand?._id || undefined,
        category: preparedData.category || product?.category?._id || undefined,
        sub_category:
          preparedData.sub_category || product?.sub_category?._id || undefined,
        model: preparedData.model || product?.model?._id || undefined,
        variant:
          preparedData.variant || product?.variant?.[0]?._id || undefined,
        year_range:
          preparedData.year_range || product?.year_range?.[0]?._id || undefined,
      };

      // Always use FormData for images update
      const formData = new FormData();
      // Append all prepared fields except images
      Object.entries(normalizedData).forEach(([key, value]) => {
        if (key === "images") return;
        if (value === undefined || value === null) return;
        if (typeof value === "string" && value.trim() === "") return;
        if (Array.isArray(value)) {
          value
            .filter((v) => v !== undefined && v !== null && `${v}`.trim() !== "")
            .forEach((v) => formData.append(`${key}[]`, v as any));
        } else {
          formData.append(key, value.toString());
        }
      });
      // Append new image files
      selectedImages.forEach((file) => {
        formData.append("images", file);
      });
      // Append remaining existing images (not removed)
      existingImages.forEach((url, idx) => {
        if (!removedExistingIndexes.includes(idx)) {
          formData.append("existingImages", url);
        }
      });
      // Debug: Log FormData contents
      console.log("FormData contents:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }
      try {
        const response = await editProduct(id.id, formData);
        showToast("Product updated successfully", "success");
        setApiError("");
      } catch (error: any) {
        console.error("Failed to edit product (FormData):", error);
        showToast("Failed to update product", "error");
        console.error(
          "Error details:",
          error.response?.data || error.message
        );
        setApiError(
          error.response?.data?.message ||
            error.message ||
            "Failed to update product"
        );
      } finally {
        setIsSubmitting(false);
      }
    } else {
      console.error("Product ID is missing or invalid.");
      showToast("Invalid product ID", "error");
      setApiError("Product ID is missing or invalid.");
      setIsSubmitting(false);
    }
  };
  useEffect(() => {
    // Only check permission for Dealer role
    if (auth && auth.role === "Dealer" && auth._id) {
      setPermissionLoading(true);
      setPermissionError("");
      checkDealerProductPermission(auth._id)
        .then((res) => {
          if (res?.hasPermission && res.data?.userPermissions?.allowedFields) {
            setAllowedFields(res.data.userPermissions.allowedFields);
          } else {
            setAllowedFields([]);
          }
        })
        .catch((err) => {
          setPermissionError("Failed to fetch field permissions");
          setAllowedFields([]);
        })
        .finally(() => setPermissionLoading(false));
    } else {
      setAllowedFields(null); // null means unrestricted (admin etc)
    }
  }, [auth]);
    if (!auth || !allowedRoles.includes(auth.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600 font-bold">
          You do not have permission to access this page.
        </div>
      </div>
    );
  }

  if (permissionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600 font-bold">Checking permissions...</div>
      </div>
    );
  }
  if (permissionError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600 font-bold">{permissionError}</div>
      </div>
    );
  }

  return (
    
    <div className="flex-1 p-4 md:p-6 bg-(neutral-100)-50 min-h-screen">
      {apiError && (
        <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">
          {apiError}
        </div>
      )}
      
      {isLoadingProduct ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <p className="mt-2 text-gray-600">Loading product details...</p>
          </div>
        </div>
      ) : !product ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-gray-600">Product not found or failed to load.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
                Edit Product
              </h1>
              <p className="text-sm text-gray-500">
                Edit your product details below
              </p>
            </div>
          </div>
      <form
        id="edit-product-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* Core Product Identity */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-semibold text-lg">
              Core Product Identity
            </CardTitle>
            <p className="text-sm text-gray-500">
              Classify the product for catalog structure, filterability, and
              business logic.
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sku Code */}
            <div className="space-y-2">
              <Label htmlFor="skuCode" className="text-sm font-medium">
                Sku Code
              </Label>
              <Input
                id="sku_code"
                placeholder="Enter Sku Code"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("sku_code")}
                disabled={Boolean(allowedFields && !allowedFields.includes("sku_code"))}
              />
              {errors.sku_code && (
                <span className="text-red-500 text-sm">
                  {errors.sku_code.message}
                </span>
              )}
            </div>
            {/* No. of Stock */}
            <div className="space-y-2">
              <Label htmlFor="noOfStock" className="text-sm font-medium">
                No. of Stock
              </Label>
              <Input
                id="no_of_stock"
                type="number"
                step="1"
                min="0"
                placeholder="Enter No. of Stock"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("no_of_stock", { valueAsNumber: true })}
                disabled={Boolean(allowedFields && !allowedFields.includes("no_of_stock"))}
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
                className="text-sm font-medium"
              >
                Manufacturer Part Number (MPN)
              </Label>
              <Input
                id="manufacturer_part_name"
                placeholder="Part Number"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("manufacturer_part_name")}
                disabled={Boolean(allowedFields && !allowedFields.includes("manufacturer_part_name"))}
              />
              {errors.manufacturer_part_name && (
                <span className="text-red-500 text-sm">
                  {errors.manufacturer_part_name.message}
                </span>
              )}
            </div>
            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="productName" className="text-sm font-medium">
                Product Name
              </Label>
              <Input
                id="product_name"
                placeholder="Enter Product Name"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("product_name")}
                disabled={Boolean(allowedFields && !allowedFields.includes("product_name"))}
              />
              {errors.product_name && (
                <span className="text-red-500 text-sm">
                  {errors.product_name.message}
                </span>
              )}
            </div>
            {/* Brand */}

            {/* HSN Code */}
            <div className="space-y-2">
              <Label htmlFor="hsnCode" className="text-sm font-medium">
                HSN Code
              </Label>
              <Input
                id="hsn_code"
                placeholder="Enter HSN Code"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("hsn_code")}
                disabled={Boolean(allowedFields && !allowedFields.includes("hsn_code"))}
              />
              {errors.hsn_code && (
                <span className="text-red-500 text-sm">
                  {errors.hsn_code.message}
                </span>
              )}
            </div>
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">
                Category
              </Label>
              <Select
                value={watch("category") || ""}
                onValueChange={(value) => setValue("category", value)}
                disabled={Boolean(allowedFields && !allowedFields.includes("category"))}
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
              <Label htmlFor="subCategory" className="text-sm font-medium">
                Sub-category
              </Label>
              <Select
                value={watch("sub_category") || ""}
                onValueChange={(value) => setValue("sub_category", value)}
                disabled={Boolean(allowedFields && !allowedFields.includes("sub_category"))}
              >
                <SelectTrigger
                  id="sub_category"
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
              <Label htmlFor="productType" className="text-sm font-medium">
                Product Type
              </Label>
              <Select
                value={watch("product_type") || ""}
                onValueChange={(value) => setValue("product_type", value)}
                disabled={Boolean(allowedFields && !allowedFields.includes("product_type"))}
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
            {/* Vehicle Type */}
            <div className="space-y-2">
              <Label htmlFor="vehicle_type" className="text-sm font-medium">
                Vehicle Type
              </Label>
              <Select
                value={watch("vehicle_type") || ""}
                onValueChange={(value) => {
                  setValue("vehicle_type", value);
                  setSelectedProductTypeId(value);
                }}
                disabled={Boolean(allowedFields && !allowedFields.includes("vehicle_type"))}
              >
                <SelectTrigger
                  id="vehicle_type"
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
                    typeOptions.map((type) => (
                      <SelectItem key={type._id} value={type._id}>
                        {type.type_name}
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
            <CardTitle className="text-red-600 font-semibold text-lg">
              Vehicle Compatibility
            </CardTitle>
            <p className="text-sm text-gray-500">
              Specify which vehicle make, model, and variant the product is
              compatible with.
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Brand */}
            <div className="space-y-2">
              <Label htmlFor="brand" className="text-sm font-medium">
                Brand
              </Label>
              <Select
                value={watch("brand") || ""}
                onValueChange={(value) => {
                  setValue("brand", value);

                  setSelectedBrandId(value);
                }}
                disabled={Boolean(allowedFields && !allowedFields.includes("brand"))}
              >
                <SelectTrigger
                  id="brand"
                  className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full"
                >
                  <SelectValue placeholder="Select Product Type first" />
                </SelectTrigger>
                <SelectContent>
                  {!selectedProductTypeId ? (
                    <SelectItem value="no-type" disabled>
                      Please select product type first
                    </SelectItem>
                  ) : isLoadingBrands ? (
                    <SelectItem value="loading" disabled>
                      Loading brands...
                    </SelectItem>
                  ) : brandOptions.length === 0 ? (
                    <SelectItem value="no-brands" disabled>
                      No brands found
                    </SelectItem>
                  ) : (
                    brandOptions.map((brand) => (
                      <SelectItem key={brand._id} value={brand._id}>
                        {brand.brand_name}
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
              <Label htmlFor="make" className="text-sm font-medium">
                Make
              </Label>
              <Input
                id="make"
                placeholder="Enter Make"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("make")}
                disabled={Boolean(allowedFields && !allowedFields.includes("make"))}
              />
              {errors.make && (
                <span className="text-red-500 text-sm">
                  {errors.make.message}
                </span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="model" className="text-sm font-medium">
                Model
              </Label>
              <Select
                value={watch("model") || ""}
                onValueChange={(value) => {
                  setValue("model", value);

                  setModelId(value);
                }}
                disabled={Boolean(allowedFields && !allowedFields.includes("model"))}
              >
                <SelectTrigger
                  id="model"
                  className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full"
                >
                  <SelectValue placeholder="Select Brand first" />
                </SelectTrigger>
                <SelectContent>
                  {modelOptions.length === 0 ? (
                    <SelectItem value="loading" disabled>
                      {selectedbrandId ? "Loading..." : "Select Brand first"}
                    </SelectItem>
                  ) : (
                    modelOptions.map((model) => (
                      <SelectItem key={model._id} value={model._id}>
                        {model.model_name}
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
                 {/* Variant */}
            <div className="space-y-2">
              <Label htmlFor="variant" className="text-sm font-medium">
                Variant
              </Label>
              <Select
                value={watch("variant") || ""}
                onValueChange={(value) => setValue("variant", value)}
                disabled={Boolean(allowedFields && !allowedFields.includes("variant"))}
              >
                <SelectTrigger
                  id="variant"
                  className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full"
                >
                  <SelectValue placeholder="Select Model first" />
                </SelectTrigger>
                <SelectContent>
                  {varientOptions.length === 0 ? (
                    <SelectItem value="loading" disabled>
                      {modelId ? "Loading..." : "Select Model first"}
                    </SelectItem>
                  ) : (
                    varientOptions.map((variant) => (
                      <SelectItem key={variant._id} value={variant._id}>
                        {variant.variant_name}
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
            {/* Year Range */}
            <div className="space-y-2">
              <Label htmlFor="yearRange" className="text-sm font-medium">
                Year Range
              </Label>
              <Select
                value={watch("year_range") || ""}
                onValueChange={(value) => setValue("year_range", value)}
                disabled={Boolean(allowedFields && !allowedFields.includes("year_range"))}
              >
                <SelectTrigger
                  id="year_range"
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
                    yearRangeOptions.map((year) => (
                      <SelectItem key={year._id} value={year._id}>
                        {year.year_name}
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
       
            {/* Fitment Notes */}
            <div className="space-y-2">
              <Label htmlFor="fitmentNotes" className="text-sm font-medium">
                Fitment Notes
              </Label>
              <Input
                id="fitment_notes"
                placeholder="Enter Fitment Notes"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("fitment_notes")}
                disabled={Boolean(allowedFields && !allowedFields.includes("fitment_notes"))}
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
                className="text-sm font-medium"
              >
                Fulfillment Priority
              </Label>
              <Input
                id="fulfillment_priority"
                type="number"
                step="1"
                min="0"
                placeholder="Enter Fulfillment Priority"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("fulfillment_priority", { valueAsNumber: true })}
                disabled={Boolean(allowedFields && !allowedFields.includes("fulfillment_priority"))}
              />
              {errors.fulfillment_priority && (
                <span className="text-red-500 text-sm">
                  {errors.fulfillment_priority.message}
                </span>
              )}
            </div>
            {/* Is Universal */}
            <div className="space-y-2">
              <Label htmlFor="isUniversal" className="text-sm font-medium">
                Is Universal
              </Label>
              <Select
                value={typeof watch("is_universal") === "boolean" ? (watch("is_universal") ? "yes" : "no") : ""}
                onValueChange={(value) => setValue("is_universal", value === "yes")}
                disabled={Boolean(allowedFields && !allowedFields.includes("is_universal"))}
              >
                <SelectTrigger
                  id="is_universal"
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
            <CardTitle className="text-red-600 font-semibold text-lg">
              Technical Specifications
            </CardTitle>
            <p className="text-sm text-gray-500">
              Add all relevant technical details to help users understand the
              product quality and features.
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Specifications */}
            <div className="space-y-2">
              <Label
                htmlFor="keySpecifications"
                className="text-sm font-medium"
              >
                Key Specifications
              </Label>
              <Input
                id="keySpecifications"
                placeholder="Enter Key Specifications"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("keySpecifications")}
                disabled={Boolean(allowedFields && !allowedFields.includes("keySpecifications"))}
              />
              {errors.keySpecifications && (
                <span className="text-red-500 text-sm">
                  {errors.keySpecifications.message}
                </span>
              )}
            </div>
            {/* Dimensions */}
            <div className="space-y-2">
              <Label htmlFor="dimensions" className="text-sm font-medium">
                Dimensions
              </Label>
              <Input
                id="dimensions"
                placeholder="Enter Dimensions"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("dimensions")}
                disabled={Boolean(allowedFields && !allowedFields.includes("dimensions"))}
              />
              {errors.dimensions && (
                <span className="text-red-500 text-sm">
                  {errors.dimensions.message}
                </span>
              )}
            </div>
            {/* Weight */}
            <div className="space-y-2">
              <Label htmlFor="weight" className="text-sm font-medium">
                Weight
              </Label>
              <Input
                id="weight"
                placeholder="Enter Weight"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("weight")}
                disabled={Boolean(allowedFields && !allowedFields.includes("weight"))}
              />
              {errors.weight && (
                <span className="text-red-500 text-sm">
                  {errors.weight.message}
                </span>
              )}
            </div>
            {/* Certifications */}
            <div className="space-y-2">
              <Label htmlFor="certifications" className="text-sm font-medium">
                Certifications
              </Label>
              <Input
                id="certifications"
                placeholder="Enter Certifications"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("certifications")}
                disabled={Boolean(allowedFields && !allowedFields.includes("certifications"))}
              />
              {errors.certifications && (
                <span className="text-red-500 text-sm">
                  {errors.certifications.message}
                </span>
              )}
            </div>
            {/* Warranty */}
            <div className="space-y-2">
              <Label htmlFor="warranty" className="text-sm font-medium">
                Warranty
              </Label>
              <Input
                id="warranty"
                placeholder="Enter Warranty"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("warranty")}
                disabled={Boolean(allowedFields && !allowedFields.includes("warranty"))}
              />
              {errors.warranty && (
                <span className="text-red-500 text-sm">
                  {errors.warranty.message}
                </span>
              )}
            </div>
            {/* Is Consumable */}
            <div className="space-y-2">
              <Label htmlFor="isConsumable" className="text-sm font-medium">
                Is Consumable
              </Label>
              <Select
                value={typeof watch("is_consumable") === "boolean" ? (watch("is_consumable") ? "yes" : "no") : ""}
                onValueChange={(value) => setValue("is_consumable", value === "yes")}
                disabled={Boolean(allowedFields && !allowedFields.includes("is_consumable"))}
              >
                <SelectTrigger
                  id="is_consumable"
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
            <CardTitle className="text-red-600 font-semibold text-lg">
              Media & Documentation
            </CardTitle>
            <p className="text-sm text-gray-500">
              Upload product images, videos, and brochures to enhance product
              representation and credibility.
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Images Upload with Preview */}
            <div className="space-y-2">
              <Label htmlFor="images" className="text-sm font-medium">
                Images
              </Label>
              <input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {/* Existing images from backend, not removed */}
                {existingImages.map((src, idx) =>
                  removedExistingIndexes.includes(idx) ? null : (
                    <div key={"existing-" + idx} className="relative inline-block">
                      <img
                        src={src}
                        alt={`Existing ${idx + 1}`}
                        className="h-20 w-20 object-cover rounded"
                      />
                      <button
                        type="button"
                        className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        onClick={() => setRemovedExistingIndexes((prev) => [...prev, idx])}
                        title="Remove"
                      >
                        ×
                      </button>
                    </div>
                  )
                )}
                {/* New uploads */}
                {selectedImagePreviews.map((src, idx) => (
                  <div key={"new-" + idx} className="relative inline-block">
                    <img
                      src={src}
                      alt={`Preview ${idx + 1}`}
                      className="h-20 w-20 object-cover rounded"
                    />
                    <button
                      type="button"
                      className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      onClick={() => {
                        setSelectedImages((prev) => prev.filter((_, i) => i !== idx));
                        setSelectedImagePreviews((prev) => prev.filter((_, i) => i !== idx));
                      }}
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              {errors.images && (
                <span className="text-red-500 text-sm">
                  {errors.images.message}
                </span>
              )}
            </div>
            {/* Video URL */}
            <div className="space-y-2">
              <Label htmlFor="videoUrl" className="text-sm font-medium">
                Video URL
              </Label>
              <Input
                id="videoUrl"
                placeholder="Paste Link"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("videoUrl")}
                disabled={Boolean(allowedFields && !allowedFields.includes("videoUrl"))}
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
                className="text-sm font-medium"
              >
                Brochure Available
              </Label>
              <Select
                value={watch("brochure_available") || ""}
                onValueChange={(value) => setValue("brochure_available", value)}
                disabled={Boolean(allowedFields && !allowedFields.includes("brochure_available"))}
              >
                <SelectTrigger
                  id="brochure_available"
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
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg shadow-sm"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update Product"}
          </Button>
        </div>
      </form>
        </>
      )}
      
    </div>
  );
}
