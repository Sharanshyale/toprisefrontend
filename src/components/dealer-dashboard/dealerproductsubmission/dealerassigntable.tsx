"use client"
import { useState, useCallback, useEffect, useMemo } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Plus, Loader2, Send, ChevronUp, ChevronDown } from 'lucide-react'
import { useToast } from "@/components/ui/toast"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { IoMdArrowDropdown } from "react-icons/io"
import { Skeleton } from "@/components/ui/skeleton"

// Custom components and hooks
import useDebounce from "@/utils/useDebounce"
import SearchInput from "@/components/common/search/SearchInput"
import DynamicButton from "@/components/common/button/button"
import DataTable from "@/components/common/table/DataTable"
import DynamicPagination from "@/components/common/pagination/DynamicPagination"
import UpdateStockModal from "./modules/UpdateStockModal";
import ProductFilters from "./ProductFilters"
import ProductBulkupload from "./modules/productbulkupload/productBulkupload"

// API and Types
import { getProductsByDealerId, checkDealerProductPermission, updateStockByDealer } from "@/service/dealer-product";
import { Product, PermissionCheckResponse, UpdateStockByDealerRequest } from "@/types/dealer-productTypes";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Active":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{status}</Badge>
    case "Disable":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{status}</Badge>
    case "Pending":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{status}</Badge>
    case "Approved":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{status}</Badge>
    case "Rejected":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{status}</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

// Shimmer Loader Component
const ShimmerLoader = () => {
  return (
    <div className="w-full">
      <Card className="shadow-sm rounded-none">
        {/* Header Shimmer */}
        <CardHeader className="space-y-4 sm:space-y-6">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 gap-4 w-full">
            {/* Left: Search, Filters */}
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:gap-3 w-full lg:w-auto">
              <Skeleton className="h-10 w-full sm:w-80 lg:w-96" />
              <Skeleton className="h-10 w-20" />
            </div>
            {/* Right: Add Product, Send Approval */}
            <div className="flex items-center gap-3 w-full lg:w-auto justify-start sm:justify-end">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </CardHeader>
        
        {/* Table Shimmer */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {/* Desktop Table Shimmer */}
            <div className="hidden lg:block">
              <div className="bg-white border-b border-gray-200">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left">
                          <Skeleton className="h-4 w-4" />
                        </th>
                        <th className="px-6 py-4 text-left">
                          <Skeleton className="h-4 w-16" />
                        </th>
                        <th className="px-6 py-4 text-left">
                          <Skeleton className="h-4 w-20" />
                        </th>
                        <th className="px-6 py-4 text-left">
                          <Skeleton className="h-4 w-24" />
                        </th>
                        <th className="px-6 py-4 text-left">
                          <Skeleton className="h-4 w-20" />
                        </th>
                        <th className="px-6 py-4 text-left">
                          <Skeleton className="h-4 w-16" />
                        </th>
                        <th className="px-6 py-4 text-left">
                          <Skeleton className="h-4 w-20" />
                        </th>
                        <th className="px-6 py-4 text-left">
                          <Skeleton className="h-4 w-16" />
                        </th>
                        <th className="px-6 py-4 text-left">
                          <Skeleton className="h-4 w-20" />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 10 }).map((_, idx) => (
                        <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <Skeleton className="w-5 h-5 rounded" />
                          </td>
                          <td className="px-6 py-4">
                            <Skeleton className="w-12 h-10 sm:w-16 sm:h-12 lg:w-20 lg:h-16 rounded-md" />
                          </td>
                          <td className="px-6 py-4">
                            <Skeleton className="h-4 w-32 mb-2" />
                            <Skeleton className="h-3 w-24" />
                          </td>
                          <td className="px-6 py-4">
                            <Skeleton className="h-4 w-20" />
                          </td>
                          <td className="px-6 py-4">
                            <Skeleton className="h-4 w-24" />
                          </td>
                          <td className="px-6 py-4">
                            <Skeleton className="h-4 w-16" />
                          </td>
                          <td className="px-6 py-4">
                            <Skeleton className="h-4 w-20" />
                          </td>
                          <td className="px-6 py-4">
                            <Skeleton className="h-6 w-16 rounded-full" />
                          </td>
                          <td className="px-6 py-4">
                            <Skeleton className="h-8 w-8 rounded" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            {/* Mobile Card Shimmer */}
            <div className="block lg:hidden">
              <div className="space-y-4 p-4">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Card key={idx} className="p-4">
                    <div className="flex items-start space-x-4">
                      <Skeleton className="w-5 h-5 rounded" />
                      <Skeleton className="w-16 h-12 rounded-md" />
                      <div className="flex-1 min-w-0 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                      <Skeleton className="w-8 h-8 rounded" />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
          
          {/* Pagination Shimmer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <Skeleton className="h-4 w-32" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function DealerAssignTable() {
  const router = useRouter()
  const { showToast } = useToast()

  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [searchInput, setSearchInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [selectedTab, setSelectedTab] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)
  const [addProductLoading, setAddProductLoading] = useState(false)
  const [sendApprovalLoading, setSendApprovalLoading] = useState(false)
  const [viewProductLoading, setViewProductLoading] = useState<string | null>(null)
  const [permission, setPermission] = useState<PermissionCheckResponse | null>(null);
  const [loadingPermission, setLoadingPermission] = useState(true);
  const [showUpdateStockModal, setShowUpdateStockModal] = useState(false);
  const [updateStockProduct, setUpdateStockProduct] = useState<Product | null>(null);
  const [updateStockLoading, setUpdateStockLoading] = useState(false);
  const [updateStockQuantity, setUpdateStockQuantity] = useState<number>(0);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  
  // Filter state
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterBrand, setFilterBrand] = useState("all");
  
  // Sorting state
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const cardsPerPage = 10

  // Permission-based controls
  const canAddProduct = permission?.data?.userPermissions?.write || false;
  const canEditProduct = permission?.data?.userPermissions?.update || false;
  const canViewProduct = permission?.data?.userPermissions?.read || false;
  const canDeleteProduct = permission?.data?.userPermissions?.delete || false;
  const canUpdateStock = permission?.data?.userPermissions?.update || false; // Allow stock updates if user can edit
  const hasAnyPermission = canAddProduct || canEditProduct || canViewProduct || canDeleteProduct || canUpdateStock;



  // Debounced search functionality
  const performSearch = useCallback(
    (query: string) => {
      setSearchQuery(query)
      setCurrentPage(1)
      setIsSearching(false)
    },
    [],
  )
  const { debouncedCallback: debouncedSearch, cleanup: cleanupDebounce } = useDebounce(performSearch, 500)

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    setIsSearching(value.trim() !== "")
    debouncedSearch(value)
  }

  // Clear search
  const handleClearSearch = () => {
    setSearchInput("")
    setSearchQuery("")
    setIsSearching(false)
    setCurrentPage(1)
  }

  // Reset all filters
  const handleResetFilters = () => {
    setFilterStatus("all")
    setFilterCategory("all")
    setFilterBrand("all")
    setCurrentPage(1)
  }

  // Fetch products and permissions from API
  useEffect(() => {
    const fetchProductsAndPermissions = async () => {
      setLoadingProducts(true);
      setLoadingPermission(true);
      try {
        // Get dealerId using the same logic as getProductsByDealerId
        let dealerId = undefined;
        try {
          const { getCookie, getAuthToken } = await import("@/utils/auth");
          dealerId = getCookie("dealerId");
          if (!dealerId) {
            const token = getAuthToken();
            if (token) {
              const payloadBase64 = token.split(".")[1];
              if (payloadBase64) {
                const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
                const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
                const payloadJson = atob(paddedBase64);
                const payload = JSON.parse(payloadJson);
                dealerId = payload.dealerId || payload.id;
              }
            }
          }
        } catch (err) {
          console.error("Failed to get dealerId for permission check:", err);
        }
        if (!dealerId) {
          throw new Error("Dealer ID not found in cookie, argument, or token");
        }
        // Fetch permissions
        const permissionRes = await checkDealerProductPermission(dealerId);
        setPermission(permissionRes);
        // Fetch products
        const fetchedProducts = await getProductsByDealerId(dealerId);
        setProducts(fetchedProducts);
      } catch (error: any) {
        console.error("Failed to fetch products or permissions:", error);
        if (typeof error?.message === 'string' && error.message.includes('Dealer ID not found')) {
          showToast("Dealer ID missing. Please log out and log in again to refresh your session.", "error");
        } else {
          showToast("Failed to load products or permissions.", "error");
        }
        setProducts([]);
        setPermission(null);
      } finally {
        setLoadingProducts(false);
        setLoadingPermission(false);
      }
    };
    fetchProductsAndPermissions();
  }, [showToast]);

  const filteredProducts = useMemo(() => {
    let currentProducts = products

    // Filter by tab
    if (selectedTab === "Active") {
      currentProducts = currentProducts.filter((product) => product.live_status === "Active")
    } else if (selectedTab === "Disable") {
      currentProducts = currentProducts.filter((product) => product.live_status === "Disable")
    } else if (selectedTab === "Pending") {
      currentProducts = currentProducts.filter((product) => product.live_status === "Pending")
    } else if (selectedTab === "Approved") {
      currentProducts = currentProducts.filter((product) => product.live_status === "Approved")
    } else if (selectedTab === "Rejected") {
      currentProducts = currentProducts.filter((product) => product.live_status === "Rejected")
    }

    // Filter by status
    if (filterStatus !== "all") {
      currentProducts = currentProducts.filter((product) => product.live_status === filterStatus)
    }

    // Filter by category
    if (filterCategory !== "all") {
      currentProducts = currentProducts.filter((product) => product.category?.category_name === filterCategory)
    }

    // Filter by brand
    if (filterBrand !== "all") {
      currentProducts = currentProducts.filter((product) => product.brand?.brand_name === filterBrand)
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.trim().toLowerCase()
      currentProducts = currentProducts.filter(
        (product) =>
          product.product_name?.toLowerCase().includes(q) ||
          product.category?.category_name?.toLowerCase().includes(q) ||
          product.sub_category?.subcategory_name?.toLowerCase().includes(q) ||
          product.brand?.brand_name?.toLowerCase().includes(q) ||
          product.product_type?.toLowerCase().includes(q),
      )
    }

    // Sort products
    if (sortField) {
      currentProducts.sort((a, b) => {
        let aValue: any;
        let bValue: any;
        
        switch (sortField) {
          case "name":
            aValue = a.product_name?.toLowerCase() || "";
            bValue = b.product_name?.toLowerCase() || "";
            break;
          case "category":
            aValue = a.category?.category_name?.toLowerCase() || "";
            bValue = b.category?.category_name?.toLowerCase() || "";
            break;
          case "subCategory":
            aValue = a.sub_category?.subcategory_name?.toLowerCase() || "";
            bValue = b.sub_category?.subcategory_name?.toLowerCase() || "";
            break;
          case "brand":
            aValue = a.brand?.brand_name?.toLowerCase() || "";
            bValue = b.brand?.brand_name?.toLowerCase() || "";
            break;
          case "productType":
            aValue = a.product_type?.toLowerCase() || "";
            bValue = b.product_type?.toLowerCase() || "";
            break;
          case "status":
            aValue = a.live_status?.toLowerCase() || "";
            bValue = b.live_status?.toLowerCase() || "";
            break;
          case "quantity":
            aValue = a.available_dealers?.[0]?.quantity_per_dealer || 0;
            bValue = b.available_dealers?.[0]?.quantity_per_dealer || 0;
            break;
          default:
            return 0;
        }
        
        if (sortDirection === "asc") {
          return aValue.localeCompare ? aValue.localeCompare(bValue) : aValue - bValue;
        } else {
          return bValue.localeCompare ? bValue.localeCompare(aValue) : bValue - aValue;
        }
      });
    }
    
    return currentProducts
  }, [products, searchQuery, selectedTab, filterStatus, filterCategory, filterBrand, sortField, sortDirection])

  const totalPages = Math.ceil(filteredProducts.length / cardsPerPage)
  const paginatedData = filteredProducts.slice((currentPage - 1) * cardsPerPage, currentPage * cardsPerPage)

  // Add id property to each product for DataTable generic constraint
  const paginatedDataWithId = paginatedData.map((p) => ({ ...p, id: p._id as string }))

  // Create actions array
  const tableActions = [
    ...(canViewProduct ? [{
      label: "View Details",
      onClick: (product: Product) => handleViewProduct(product._id),
    }] : []),
    ...(canEditProduct ? [{
      label: "Edit",
      onClick: (product: Product) => handleEditProduct(product._id),
    }] : []),
    // Always show Update Stocks action
    {
      label: "Update Stocks",
      onClick: (product: Product) => handleUpdatedStocks(product._id),
    },
  ];

  // Selection state and handlers
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const allSelected = paginatedData.length > 0 && paginatedData.every((p) => selectedProducts.includes(p._id))

  // Handler for selecting a single product
  const handleSelectOne = (id: string) => {
    setSelectedProducts((prev) => {
      if (prev.includes(id)) {
        return prev.filter((pid) => pid !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  // Handler for selecting all products on the current page
  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(paginatedData.map((p) => p._id))
    }
  }

  // Clear selections when tab or page changes
  useEffect(() => {
    setSelectedProducts([])
  }, [selectedTab, currentPage])

  // Handlers for Add product
  const handleAddProduct = () => {
    setAddProductLoading(true)
    router.push(`/dealer/dashboard/product/addproduct`)
    setTimeout(() => setAddProductLoading(false), 1000)
  }

  const handleViewProduct = (id: string) => {
    setViewProductLoading(id)
    router.push(`/dealer/dashboard/product/productdetails/${id}`)
    setTimeout(() => setViewProductLoading(null), 1000)
  }

  const handleEditProduct = (id: string) => {
    router.push(`/dealer/dashboard/product/productedit/${id}`)
  }

  // Handler for Updated Stocks
  const handleUpdatedStocks = (id: string) => {
    const product = products.find((p) => p._id === id);
    if (!product) {
      showToast("Product not found.", "error");
      return;
    }
    
    // Find dealerId
    let dealerId = undefined;
    try {
      const { getCookie, getAuthToken } = require("@/utils/auth");
      dealerId = getCookie("dealerId");
      if (!dealerId) {
        const token = getAuthToken();
        if (token) {
          const payloadBase64 = token.split(".")[1];
          if (payloadBase64) {
            const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
            const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
            const payloadJson = atob(paddedBase64);
            const payload = JSON.parse(payloadJson);
            dealerId = payload.dealerId || payload.id;
          }
        }
      }
    } catch {}
    
    if (!dealerId) {
      showToast("Dealer ID not found.", "error");
      return;
    }
    
    // Find dealer's stock for this product
    const dealerStock = product.available_dealers?.find((d) => d.dealers_Ref === dealerId);
    
    setUpdateStockProduct(product);
    setUpdateStockQuantity(dealerStock?.quantity_per_dealer || 0);
    setShowUpdateStockModal(true);
  };

  const handleUpdateStockSubmit = async () => {
    if (!updateStockProduct) {
      showToast("No product selected for stock update.", "error");
      return;
    }
    
    if (updateStockQuantity < 0) {
      showToast("Quantity cannot be negative.", "error");
      return;
    }
    
    setUpdateStockLoading(true);
    let dealerId = undefined;
    
    try {
      const { getCookie, getAuthToken } = require("@/utils/auth");
      dealerId = getCookie("dealerId");
      if (!dealerId) {
        const token = getAuthToken();
        if (token) {
          const payloadBase64 = token.split(".")[1];
          if (payloadBase64) {
            const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
            const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
            const payloadJson = atob(paddedBase64);
            const payload = JSON.parse(payloadJson);
            dealerId = payload.dealerId || payload.id;
          }
        }
      }
    } catch (error) {
      console.error("Error getting dealerId:", error);
    }
    
    if (!dealerId) {
      showToast("Dealer ID not found. Please log in again.", "error");
      setUpdateStockLoading(false);
      return;
    }
    
    try {
      await updateStockByDealer(updateStockProduct._id, dealerId, updateStockQuantity);
      showToast("Stock updated successfully!", "success");
      
      // Update local state
      setProducts((prev) => prev.map((p) => {
        if (p._id === updateStockProduct._id) {
          return {
            ...p,
            available_dealers: p.available_dealers?.map((d) =>
              d.dealers_Ref === dealerId ? { ...d, quantity_per_dealer: updateStockQuantity } : d
            ) || [],
          };
        }
        return p;
      }));
      
      setShowUpdateStockModal(false);
    } catch (error: any) {
      console.error("Error updating stock:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to update stock.";
      showToast(errorMessage, "error");
    } finally {
      setUpdateStockLoading(false);
    }
  };

  // Handlers for Bulk upload
  const handleUploadBulk = () => {
    setShowBulkUploadModal(true)
  }

  // Handler for Send Approval
  // const handleSendApproval = () => {
  //   setSendApprovalLoading(true)
  //   // setTimeout(() => {
  //   //   // setSendApprovalLoading(false)
  //   //   // showToast("Approval sent successfully", "success")
  //   // }, 1000)
  // }

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ChevronUp className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === "asc" ? 
      <ChevronUp className="w-4 h-4 text-[#C72920]" /> : 
      <ChevronDown className="w-4 h-4 text-[#C72920]" />;
  };

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      cleanupDebounce()
    }
  }, [cleanupDebounce])

  // Show shimmer loader while loading
  if (loadingProducts || loadingPermission) {
    return <ShimmerLoader />
  }

  return (
    <div className="w-full">
      <Card className="shadow-sm rounded-none">
        {/* Header */}
        <CardHeader className="space-y-4 sm:space-y-6">
          {/* Top Row: Search/Filters/Requests (left), Upload/Add Product (right) */}
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 gap-4 w-full">
            {/* Left: Search, Filters, Requests */}
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:gap-3 w-full lg:w-auto">
              {/* Search Bar */}
              <SearchInput
                value={searchInput}
                onChange={handleSearchChange}
                onClear={handleClearSearch}
                isLoading={isSearching}
                placeholder="Search Spare parts"
              />
              {/* Product Filters */}
              <ProductFilters
                search={searchInput}
                onSearchChange={handleSearchChange}
                currentStatus={filterStatus}
                onStatusChange={setFilterStatus}
                currentCategory={filterCategory}
                onCategoryChange={setFilterCategory}
                currentBrand={filterBrand}
                onBrandChange={setFilterBrand}
                onResetFilters={handleResetFilters}
                products={products}
              />
            </div>
            {/* Right: Add Product, Send Approval */}
            <div className="flex items-center gap-3 w-full lg:w-auto justify-start grid-ro-2 sm:justify-end">
              {canAddProduct && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex items-center gap-2 bg-[#FDEAEA] text-[#C72920] rounded-[8px] px-4 py-2 min-w-[140px] h-[40px] justify-center font-[Poppins] font-medium border border-[#FDEAEA] hover:bg-[#f8d2d2] transition"
                      disabled={addProductLoading}
                    >
                      Add Product
                      <IoMdArrowDropdown style={{ fontSize: "20px" }} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-41 shadow-lg">
                    <DropdownMenuItem className="cursor-pointer flex items-center gap-2" onClick={handleAddProduct}>
                      <div className="w-4 h-4 bg-red-500 rounded flex items-center justify-center">
                        <Plus className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-red-600">Manually</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer flex items-center gap-2" onClick={handleUploadBulk}>
                      <div className="w-4 h-4 rounded flex items-center justify-center">
                        <Image src="/assets/uploadFile.svg" alt="Upload" className="w-5 h-5" width={20} height={20} />
                      </div>
                      <span className="text-blue-600">Upload</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {canEditProduct && (
                <DynamicButton
                  variant="default"
                  customClassName="flex items-center gap-3 bg-green-50 border-green-600 hover:bg-green-50 text-green-600 rounded-[8px] px-4 py-2 min-w-[140px] h-[40px] justify-center font-[Poppins] font-regular"
                  disabled={sendApprovalLoading}
                  loading={sendApprovalLoading}
                  loadingText="Sending..."
                  icon={<Send />}
                  text="Send Approval"
                  // onClick={handleSendApproval}
                />
              )}

            </div>
          </div>
        </CardHeader>
        {/* Product Table */}
        <CardContent className="p-0">
          {!loadingPermission && !hasAnyPermission && (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="text-gray-500 text-lg font-medium mb-2">No Permissions Available</div>
                <div className="text-gray-400 text-sm">You don't have permission to view or manage products.</div>
              </div>
            </div>
          )}
          {!loadingPermission && hasAnyPermission && (
            <div className="overflow-x-auto min-w-full">
              <DataTable<Product>
                data={paginatedDataWithId}
                loading={loadingProducts}
                currentPage={currentPage}
                itemsPerPage={cardsPerPage}
                onPageChange={setCurrentPage}
                selectedItems={selectedProducts}
                onSelectItem={handleSelectOne}
                onSelectAll={handleSelectAll}
                allSelected={allSelected}
                columns={[
                  {
                    key: "image",
                    header: "Image",
                    className: "w-20",
                    render: (product: Product) => (
                      <div className="w-12 h-10 sm:w-16 sm:h-12 lg:w-20 lg:h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={product.images?.[0] || "/placeholder.svg?height=64&width=80"}
                          alt={product.product_name}
                          width={80}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ),
                  },
                  {
                    key: "name",
                    header: (
                      <div 
                        className="flex items-center gap-1 cursor-pointer hover:text-[#C72920] transition-colors"
                        onClick={() => handleSort("name")}
                      >
                        Name
                        {getSortIcon("name")}
                      </div>
                    ),
                    className: "min-w-[180px] max-w-[220px]",
                    render: (product: Product) => (
                      <div 
                        className={`${canViewProduct ? "cursor-pointer" : "cursor-default"}`}
                        onClick={canViewProduct ? () => handleViewProduct(product._id) : undefined}
                      >
                        <div className="font-medium text-gray-900 text-sm font-sans truncate pr-2" title={product.product_name}>
                          {product.product_name}
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: "categories",
                    header: (
                      <div 
                        className="flex items-center gap-1 cursor-pointer hover:text-[#C72920] transition-colors"
                        onClick={() => handleSort("category")}
                      >
                        Categories
                        {getSortIcon("category")}
                      </div>
                    ),
                    className: "min-w-[120px] max-w-[140px]",
                    render: (product: Product) => (
                      <div className="truncate pr-2" title={product.category?.category_name || "N/A"}>
                        <span className="text-sm">{product.category?.category_name || "N/A"}</span>
                      </div>
                    ),
                  },
                  {
                    key: "subCategories",
                    header: (
                      <div 
                        className="flex items-center gap-1 cursor-pointer hover:text-[#C72920] transition-colors"
                        onClick={() => handleSort("subCategory")}
                      >
                        Sub Categories
                        {getSortIcon("subCategory")}
                      </div>
                    ),
                    className: "min-w-[140px] max-w-[160px]",
                    render: (product: Product) => (
                      <div className="truncate pr-2" title={product.sub_category?.subcategory_name || "N/A"}>
                        <span className="text-sm">{product.sub_category?.subcategory_name || "N/A"}</span>
                      </div>
                    ),
                  },
                  {
                    key: "brand",
                    header: (
                      <div 
                        className="flex items-center gap-1 cursor-pointer hover:text-[#C72920] transition-colors"
                        onClick={() => handleSort("brand")}
                      >
                        Brand
                        {getSortIcon("brand")}
                      </div>
                    ),
                    className: "min-w-[100px] max-w-[120px]",
                    render: (product: Product) => (
                      <div className="truncate pr-2" title={product.brand?.brand_name || "N/A"}>
                        <span className="text-sm">{product.brand?.brand_name || "N/A"}</span>
                      </div>
                    ),
                  },
                  {
                    key: "productType",
                    header: (
                      <div 
                        className="flex items-center gap-1 cursor-pointer hover:text-[#C72920] transition-colors"
                        onClick={() => handleSort("productType")}
                      >
                        Product type
                        {getSortIcon("productType")}
                      </div>
                    ),
                    className: "min-w-[100px] max-w-[120px]",
                    render: (product: Product) => (
                      <div className="truncate pr-2" title={product.product_type || "N/A"}>
                        <span className="text-sm">{product.product_type || "N/A"}</span>
                      </div>
                    ),
                  },
                  {
                    key: "status",
                    header: (
                      <div 
                        className="flex items-center gap-1 cursor-pointer hover:text-[#C72920] transition-colors"
                        onClick={() => handleSort("status")}
                      >
                        Status
                        {getSortIcon("status")}
                      </div>
                    ),
                    className: "min-w-[100px] max-w-[120px]",
                    render: (product: Product) => getStatusBadge(product.live_status),
                  },
                  {
                    key: "quantity_per_dealer",
                    header: (
                      <div 
                        className="flex items-center gap-1 cursor-pointer hover:text-[#C72920] transition-colors"
                        onClick={() => handleSort("quantity")}
                      >
                        Quantity
                        {getSortIcon("quantity")}
                      </div>
                    ),
                    className: "min-w-[80px] max-w-[100px]",
                    render: (product: Product) => {
                      // Find dealerId
                      let dealerId = undefined;
                      try {
                        const { getCookie, getAuthToken } = require("@/utils/auth");
                        dealerId = getCookie("dealerId");
                        if (!dealerId) {
                          const token = getAuthToken();
                          if (token) {
                            const payloadBase64 = token.split(".")[1];
                            if (payloadBase64) {
                              const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
                              const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
                              const payloadJson = atob(paddedBase64);
                              const payload = JSON.parse(payloadJson);
                              dealerId = payload.dealerId || payload.id;
                            }
                          }
                        }
                      } catch {}
                      const dealerStock = product.available_dealers?.find((d) => d.dealers_Ref === dealerId);
                      return (
                        <div className="text-center font-medium">
                          {dealerStock?.quantity_per_dealer ?? "-"}
                        </div>
                      );
                    },
                  },
                ]}
                actions={tableActions}
                mobileCard={(product: Product) => (
                  <div className="flex items-start space-x-4 p-4">
                    <div className="w-16 h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={product.images?.[0] || "/placeholder.svg?height=64&width=80"}
                        alt={product.product_name}
                        width={64}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="font-medium text-gray-900 text-sm truncate pr-2" title={product.product_name}>
                        {product.product_name}
                      </div>
                      <div className="text-xs text-gray-500 truncate pr-2" title={`${product.category?.category_name} • ${product.sub_category?.subcategory_name}`}>
                        {product.category?.category_name} • {product.sub_category?.subcategory_name}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 truncate max-w-[120px] pr-1" title={product.brand?.brand_name}>
                          {product.brand?.brand_name}
                        </span>
                        <span className="text-xs text-gray-500 flex-shrink-0">{product.live_status}</span>
                      </div>
                      <div className="text-xs text-gray-500 truncate pr-2" title={`Type: ${product.product_type || "N/A"}`}>
                        Type: {product.product_type || "N/A"}
                      </div>
                    </div>
                  </div>
                )} 
              />
              <DynamicPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredProducts.length}
                itemsPerPage={cardsPerPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
      {/* Update Stock Modal */}
      <UpdateStockModal
        open={showUpdateStockModal}
        onClose={() => setShowUpdateStockModal(false)}
        onSubmit={handleUpdateStockSubmit}
        loading={updateStockLoading}
        product={updateStockProduct}
        quantity={updateStockQuantity}
        setQuantity={setUpdateStockQuantity}
      />
      <ProductBulkupload
        isOpen={showBulkUploadModal}
        onClose={() => setShowBulkUploadModal(false)}
        mode="upload"
      />
    </div>
  )
}

