import React, { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchProductsWithLiveStatus,
  updateProductLiveStatus,
} from "@/store/slice/product/productLiveStatusSlice";
import {
  aproveProduct,
  deactivateProduct,
  getProducts,
  getProductsByPage,
} from "@/service/product-Service";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getCategories, getBrand } from "@/service/product-Service";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ChevronUp, Loader2, MoreHorizontal } from "lucide-react";
import { fetchProductsSuccess } from "@/store/slice/product/productSlice";
import { fetchProductIdForBulkActionSuccess } from "@/store/slice/product/productIdForBulkAction";
import { useRouter } from "next/navigation";
import { useToast as useGlobalToast } from "@/components/ui/toast";

// Helper function to get status color classes
const getStatusColor = (status: string) => {
  switch (status) {
    case "Approved":
      return "text-green-600 font-medium";
    case "Rejected":
      return "text-red-600 font-medium";
    case "Pending":
      return "text-yellow-600 font-medium";
    default:
      return "text-gray-700";
  }
};

export default function PendingProduct({
  searchQuery,
}: {
  searchQuery: string;
}) {
  const dispatch = useAppDispatch();
  const { showToast } = useGlobalToast();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [paginatedProducts, setPaginatedProducts] = useState<any[]>([]);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewProductLoading, setViewProductLoading] = useState(false);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const itemsPerPage = 10;
  const route = useRouter();

  // Fetch products when component mounts or when pagination changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const response = await getProductsByPage(
          currentPage,
          itemsPerPage,
          "Pending"
        );
        if (response.data) {
          setPaginatedProducts(response.data.products || []);
          setTotalProducts(response.data.pagination?.totalItems || 0);
          setTotalPages(response.data.pagination?.totalPages || 0);
        } else {
          console.error("Unexpected API response structure:", response.data);
          showToast("Unexpected API response structure", "error");
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
        showToast("Failed to fetch products", "error");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [currentPage, itemsPerPage, searchQuery]);

  // Filter and sort products
  const filteredProducts = React.useMemo(() => {
    if (!paginatedProducts) return [];

    let filtered = [...paginatedProducts];

    // Filter by search query if provided
    if (searchQuery?.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.manufacturer_part_name?.toLowerCase().includes(q) ||
          product.category?.category_name?.toLowerCase().includes(q) ||
          product.brand?.brand_name?.toLowerCase().includes(q) ||
          product.sub_category?.subcategory_name?.toLowerCase().includes(q) ||
          product.product_type?.toLowerCase().includes(q)
      );
    }

    // Sort if sort field is specified
    if (sortField) {
      filtered.sort((a, b) => {
        // Handle sorting for product name
        if (sortField === "manufacturer_part_name") {
          const nameA = a.manufacturer_part_name?.toLowerCase() || "";
          const nameB = b.manufacturer_part_name?.toLowerCase() || "";
          if (nameA < nameB) return sortDirection === "asc" ? -1 : 1;
          if (nameA > nameB) return sortDirection === "asc" ? 1 : -1;
          return 0;
        }
        // Handle sorting for price (assuming there's a price field)
        if (sortField === "price") {
          const priceA = Number(a.price) || 0;
          const priceB = Number(b.price) || 0;
          if (priceA < priceB) return sortDirection === "asc" ? -1 : 1;
          if (priceA > priceB) return sortDirection === "asc" ? 1 : -1;
          return 0;
        }
        return 0;
      });
    }

    return filtered;
  }, [paginatedProducts, searchQuery, sortField, sortDirection]);

  const handleSortByName = () => {
    if (sortField === "manufacturer_part_name") {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField("manufacturer_part_name");
      setSortDirection("asc");
    }
  };

  const handleSortByPrice = () => {
    if (sortField === "price") {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField("price");
      setSortDirection("asc");
    }
  };

  // Selection handlers
  const handleSelectOne = (id: string) => {
    const newSelectedProducts = selectedProducts.includes(id)
      ? selectedProducts.filter((pid) => pid !== id)
      : [...selectedProducts, id];
    setSelectedProducts(newSelectedProducts);
    dispatch(fetchProductIdForBulkActionSuccess([...newSelectedProducts]));
  };

  const handleStatusChange = async (productId: string, newStatus: string) => {
    try {
      if (newStatus === "Active") {
        await aproveProduct(productId);
        dispatch(
          updateProductLiveStatus({ id: productId, liveStatus: "Approved" })
        );
        showToast("Product activated successfully", "success");
        // Update local state
        setPaginatedProducts((prev) =>
          prev.map((product) =>
            product._id === productId
              ? { ...product, live_status: "Approved" }
              : product
          )
        );
      } else if (newStatus === "Inactive") {
        await deactivateProduct(productId);
        dispatch(
          updateProductLiveStatus({ id: productId, liveStatus: "Pending" })
        );
        showToast("Product deactivated successfully", "success");
        // Update local state
        setPaginatedProducts((prev) =>
          prev.map((product) =>
            product._id === productId
              ? { ...product, live_status: "Pending" }
              : product
          )
        );
      }
    } catch (error) {
      console.error("Failed to update product status:", error);
      showToast("Failed to update product status", "error");
    }
  };

  const allSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((product: any) =>
      selectedProducts.includes(product._id)
    );

  const handleSelectAll = () => {
    if (allSelected) {
      const newSelectedProducts = selectedProducts.filter(
        (id) => !filteredProducts.some((product: any) => product._id === id)
      );
      setSelectedProducts(newSelectedProducts);
      dispatch(fetchProductIdForBulkActionSuccess([...newSelectedProducts]));
    } else {
      const filteredProductIds = filteredProducts.map(
        (product: any) => product._id
      );
      const newSelectedProducts = Array.from(
        new Set([...selectedProducts, ...filteredProductIds])
      );
      setSelectedProducts(newSelectedProducts);
      dispatch(fetchProductIdForBulkActionSuccess([...newSelectedProducts]));
    }
  };

  // Navigation handlers
  const handleEditProduct = (id: string) => {
    route.push(`/user/dashboard/product/productedit/${id}`);
  };

  const handleViewProduct = (id: string) => {
    setViewProductLoading(true);
    try {
      route.push(`/user/dashboard/product/product-details/${id}`);
    } catch (e) {
      console.log(e);
    } finally {
      setViewProductLoading(false);
    }
  };

  return (
    <div className="px-4">
      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#E5E5E5] bg-gray-50/50">
              <TableHead className="px-4 py-4 w-8 font-[Red Hat Display]">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display]">
                Image
              </TableHead>
              <TableHead
                className="text-gray-700 font-medium px-6 py-4 text-left min-w-[200px] font-[Red Hat Display] cursor-pointer select-none"
                onClick={handleSortByName}
              >
                <div className="flex items-center">
                  Name
                  {sortField === "product_name" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? (
                        <ChevronUp className="w-4 h-4 text-[#C72920]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#C72920]" />
                      )}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[120px] hidden md:table-cell font-[Red Hat Display]">
                Category
              </TableHead>
              <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[120px] hidden lg:table-cell font-[Red Hat Display]">
                Sub Category
              </TableHead>
              <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[100px] hidden md:table-cell font-[Red Hat Display]">
                Brand
              </TableHead>
              <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[100px] hidden lg:table-cell font-[Red Hat Display]">
                Type
              </TableHead>
              <TableHead
                className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[100px] hidden lg:table-cell font-[Red Hat Display] cursor-pointer select-none"
                onClick={handleSortByPrice}
              >
                Price
                {sortField === "price" && (
                  <span className="ml-1">
                    {sortDirection === "asc" ? (
                      <ChevronUp className="w-4 h-4 text-[#C72920]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#C72920]" />
                    )}
                  </span>
                )}
              </TableHead>
              <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[100px] font-[Red Hat Display]">
                QC Status
              </TableHead>
              <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[100px] font-[Red Hat Display]">
                Product status
              </TableHead>
              <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-center min-w-[80px] font-[Red Hat Display]">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingProducts
              ? Array.from({ length: 5 }).map((_, index) => (
                  <TableRow
                    key={`skeleton-${index}`}
                    className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                    }`}
                  >
                    <TableCell className="px-4 py-4 w-8">
                      <Skeleton className="h-4 w-4 rounded" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Skeleton className="w-12 h-10 sm:w-16 sm:h-12 lg:w-20 lg:h-16 rounded-md" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[150px]" />
                        <Skeleton className="h-3 w-[100px] md:hidden" />
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 hidden md:table-cell">
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell className="px-6 py-4 hidden lg:table-cell">
                      <Skeleton className="h-4 w-[120px]" />
                    </TableCell>
                    <TableCell className="px-6 py-4 hidden md:table-cell">
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell className="px-6 py-4 hidden lg:table-cell">
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell className="px-6 py-4 hidden lg:table-cell">
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Skeleton className="h-4 w-[60px]" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Skeleton className="h-8 w-[120px]" />
                    </TableCell>
                    <TableCell className="px-6 py-4 text-center">
                      <Skeleton className="h-8 w-8 rounded-full mx-auto" />
                    </TableCell>
                  </TableRow>
                ))
              : filteredProducts.map((product: any, index: number) => (
                  <TableRow
                    key={product._id}
                    className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                    }`}
                  >
                    <TableCell className="px-4 py-4 w-8 font-[Poppins]">
                      <Checkbox
                        checked={selectedProducts.includes(product._id)}
                        onCheckedChange={() => handleSelectOne(product._id)}
                        aria-label="Select row"
                      />
                    </TableCell>
                    <TableCell className="px-6 py-4 font-[Poppins]">
                      <div className="w-12 h-10 sm:w-16 sm:h-12 lg:w-20 lg:h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={product.images[0] || "/placeholder.svg"}
                          alt={product.manufacturer_part_name}
                          width={80}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell
                      className="px-6 py-4 cursor-pointer font-sans"
                      onClick={() => handleViewProduct(product._id)}
                    >
                      <div className="font-medium text-gray-900 b2 font-sans">
                        {product.manufacturer_part_name?.length > 8
                          ? `${product.manufacturer_part_name.substring(
                              0,
                              8
                            )}...`
                          : product.manufacturer_part_name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 md:hidden">
                        {product.category?.category_name} •{" "}
                        {product.brand?.brand_name}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 hidden md:table-cell font-sans">
                      <span className="text-gray-700 b2 font-sans">
                        {product.category?.category_name?.length > 8
                          ? `${product.category.category_name.substring(
                              0,
                              8
                            )}...`
                          : product.category?.category_name}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 hidden lg:table-cell font-sans">
                      <span className="text-gray-700 b2 font-sans">
                        {product.sub_category?.subcategory_name?.length > 8
                          ? `${product.sub_category.subcategory_name.substring(
                              0,
                              8
                            )}...`
                          : product.sub_category?.subcategory_name}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 hidden md:table-cell font-sans">
                      <span className="text-gray-700 b2 font-sans">
                        {product.brand?.brand_name}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 hidden lg:table-cell font-sans">
                      <span className="text-gray-700 b2 font-sans">
                        {product.product_type}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 hidden lg:table-cell font-[Red Hat Display]">
                      <span className="text-gray-700 b2 font-[Red Hat Display]">
                        {product.price || "N/A"}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 font-[Red Hat Display]">
                      <span
                        className={`b2 ${getStatusColor(product.Qc_status)}`}
                      >
                        {product.Qc_status}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 font-sans">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className={`h-auto p-2 justify-between min-w-[120px] ${getStatusColor(
                              product.live_status
                            )}`}
                          >
                            <span className="b2">{product.live_status}</span>
                            <ChevronDown className="h-4 w-4 ml-2" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="start"
                          className="min-w-[120px]"
                        >
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(product._id, "Active")
                            }
                            className="text-green-600 focus:text-green-600"
                          >
                            Activate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(product._id, "Inactive")
                            }
                            className="text-red-600 focus:text-red-600"
                          >
                            Deactivate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-center font-sans">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-gray-100"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => handleEditProduct(product._id)}
                          >
                            Edit Product
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => handleViewProduct(product._id)}
                          >
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalProducts > 0 && totalPages > 1 && (
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mt-8">
          {/* Left: Showing X-Y of Z products */}
          <div className="text-sm text-gray-600 text-center sm:text-left">
            {`Showing ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(
              currentPage * itemsPerPage,
              totalProducts
            )} of ${totalProducts} products`}
          </div>
          {/* Pagination Controls */}
          <div className="flex justify-center sm:justify-end">
            <Pagination>
              <PaginationContent>
                {/* Previous Button */}
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {/* Numbered Page Buttons (max 3) */}
                {(() => {
                  let pages = [];
                  if (totalPages <= 3) {
                    // Case 1: Few pages, just show all
                    pages = Array.from({ length: totalPages }, (_, i) => i + 1);
                  } else if (currentPage <= 2) {
                    // Case 2: Near the start
                    pages = [1, 2, 3];
                  } else if (currentPage >= totalPages - 1) {
                    // Case 3: Near the end
                    pages = [totalPages - 2, totalPages - 1, totalPages];
                  } else {
                    // Case 4: Middle pages
                    pages = [currentPage - 1, currentPage, currentPage + 1];
                  }

                  return pages.map((pageNum) => (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        isActive={currentPage === pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  ));
                })()}

                {/* Next Button */}
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}

      {/* Loading spinner for product view */}
      {viewProductLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center justify-center shadow-xl">
            <Loader2 className="h-16 w-16 animate-spin text-[#C72920] mb-4" />
            <p className="text-lg font-medium text-gray-700">
              Loading product details...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
