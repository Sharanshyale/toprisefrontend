import React, { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { updateProductLiveStatus } from "@/store/slice/product/productLiveStatusSlice";
import { getPendingProducts, approveSingleProduct, rejectSingleProduct } from "@/service/product-Service";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ChevronUp, Loader2, MoreHorizontal, CheckCircle, XCircle, Eye, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast as useGlobalToast } from "@/components/ui/toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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

export default function PendingProductsRequests({
  searchQuery,
}: {
  searchQuery: string;
}) {
  const { showToast } = useGlobalToast();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedProductForRejection, setSelectedProductForRejection] = useState<string>("");
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const itemsPerPage = 10;
  const route = useRouter();
  const dispatch = useAppDispatch();

  // Fetch pending products when component mounts or page changes
  useEffect(() => {
    const fetchPendingProducts = async () => {
      setLoadingProducts(true);
      try {
        const response = await getPendingProducts(currentPage, itemsPerPage);
        if (response.success && response.data) {
          setPendingProducts(response.data.products || response.data || []);
          setTotalProducts(response.data.pagination?.totalItems || response.data.length || 0);
          setTotalPages(response.data.pagination?.totalPages || 1);
        } else {
          console.error("Unexpected API response structure:", response);
          showToast("Unexpected API response structure", "error");
        }
      } catch (error) {
        console.error("Failed to fetch pending products:", error);
        showToast("Failed to fetch pending products", "error");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchPendingProducts();
  }, [searchQuery, currentPage]);

  // Filter and sort products
  const filteredProducts = React.useMemo(() => {
    let filtered = pendingProducts.filter((product: any) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        product.product_name?.toLowerCase().includes(searchLower) ||
        product.sku_code?.toLowerCase().includes(searchLower) ||
        product.brand?.brand_name?.toLowerCase().includes(searchLower) ||
        product.category?.category_name?.toLowerCase().includes(searchLower)
      );
    });

    if (sortField) {
      filtered.sort((a: any, b: any) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [pendingProducts, searchQuery, sortField, sortDirection]);

  const handleSelectOne = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleApproveProduct = async (productId: string) => {
    try {
      await approveSingleProduct(productId);
      dispatch(updateProductLiveStatus({ id: productId, liveStatus: "Approved" }));
      showToast("Product approved successfully", "success");
      
      // Remove from pending list
      setPendingProducts((prev) => prev.filter((product) => product._id !== productId));
      setSelectedProducts((prev) => prev.filter((id) => id !== productId));
    } catch (error) {
      console.error("Failed to approve product:", error);
      showToast("Failed to approve product", "error");
    }
  };

  const handleRejectProduct = async (productId: string) => {
    setSelectedProductForRejection(productId);
    setIsRejectDialogOpen(true);
  };

  const confirmRejectProduct = async () => {
    if (!selectedProductForRejection) return;
    
    setBulkActionLoading(true);
    try {
      if (selectedProductForRejection === "bulk") {
        // Handle bulk rejection
        const promises = selectedProducts.map(productId => rejectSingleProduct(productId, rejectionReason));
        await Promise.all(promises);
        
        // Update state for all selected products
        selectedProducts.forEach(productId => {
          dispatch(updateProductLiveStatus({ id: productId, liveStatus: "Rejected" }));
        });
        
        showToast(`${selectedProducts.length} products rejected successfully`, "success");
        
        // Remove rejected products from pending list
        setPendingProducts(prev => prev.filter(product => !selectedProducts.includes(product._id)));
        setSelectedProducts([]);
      } else {
        // Handle single product rejection
        await rejectSingleProduct(selectedProductForRejection, rejectionReason);
        dispatch(updateProductLiveStatus({ id: selectedProductForRejection, liveStatus: "Rejected" }));
        showToast("Product rejected successfully", "success");
        
        // Remove from pending list
        setPendingProducts((prev) => prev.filter((product) => product._id !== selectedProductForRejection));
        setSelectedProducts((prev) => prev.filter((id) => id !== selectedProductForRejection));
      }
      
      // Reset dialog
      setIsRejectDialogOpen(false);
      setRejectionReason("");
      setSelectedProductForRejection("");
    } catch (error) {
      console.error("Failed to reject product:", error);
      showToast("Failed to reject product(s)", "error");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleViewProduct = (productId: string) => {
    route.push(`/user/dashboard/product/productdetails/${productId}`);
  };

  const handleBulkApprove = async () => {
    if (selectedProducts.length === 0) return;
    
    setBulkActionLoading(true);
    try {
      const promises = selectedProducts.map(productId => approveSingleProduct(productId));
      await Promise.all(promises);
      
      // Update state
      selectedProducts.forEach(productId => {
        dispatch(updateProductLiveStatus({ id: productId, liveStatus: "Approved" }));
      });
      
      showToast(`${selectedProducts.length} products approved successfully`, "success");
      
      // Remove approved products from pending list
      setPendingProducts(prev => prev.filter(product => !selectedProducts.includes(product._id)));
      setSelectedProducts([]);
    } catch (error) {
      console.error("Failed to approve products:", error);
      showToast("Failed to approve some products", "error");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedProducts.length === 0) return;
    
    setSelectedProductForRejection("bulk");
    setIsRejectDialogOpen(true);
  };

  const allSelected = filteredProducts.length > 0 && filteredProducts.every((product: any) => selectedProducts.includes(product._id));

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map((product: any) => product._id));
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  if (loadingProducts) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {selectedProducts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-blue-900">
                {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleBulkApprove}
                disabled={bulkActionLoading}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                {bulkActionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Approve All
              </Button>
              <Button
                onClick={handleBulkReject}
                disabled={bulkActionLoading}
                variant="destructive"
                size="sm"
              >
                <X className="h-4 w-4 mr-2" />
                Reject All
              </Button>
              <Button
                onClick={() => setSelectedProducts([])}
                variant="outline"
                size="sm"
              >
                Clear Selection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedProductForRejection === "bulk" 
                ? `Reject ${selectedProducts.length} Products` 
                : "Reject Product"}
            </DialogTitle>
            <DialogDescription>
              {selectedProductForRejection === "bulk"
                ? `Please provide a reason for rejecting these ${selectedProducts.length} products.`
                : "Please provide a reason for rejecting this product."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="mt-2"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={confirmRejectProduct} 
                disabled={!rejectionReason.trim() || bulkActionLoading}
                variant="destructive"
              >
                {bulkActionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {selectedProductForRejection === "bulk" 
                  ? `Reject ${selectedProducts.length} Products` 
                  : "Reject Product"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Products Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="w-16">Image</TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort("product_name")}
              >
                <div className="flex items-center space-x-1">
                  <span>Product Name</span>
                  {sortField === "product_name" && (
                    sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort("sku_code")}
              >
                <div className="flex items-center space-x-1">
                  <span>SKU</span>
                  {sortField === "sku_code" && (
                    sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                  No pending products found
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product: any) => (
                <TableRow key={product._id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedProducts.includes(product._id)}
                      onCheckedChange={() => handleSelectOne(product._id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                      <Image
                        src={product.images?.[0] || "/placeholder-product.png"}
                        alt={product.product_name}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder-product.png";
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {product.product_name}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {product.sku_code}
                  </TableCell>
                  <TableCell>{product.brand?.brand_name || 'N/A'}</TableCell>
                  <TableCell>{product.category?.category_name || 'N/A'}</TableCell>
                  <TableCell>{product.model?.model_name || 'N/A'}</TableCell>
                  <TableCell>
                    <span className={product.out_of_stock ? "text-red-600" : "text-green-600"}>
                      {product.out_of_stock ? "Out of Stock" : product.no_of_stock || 0}
                    </span>
                  </TableCell>
                  <TableCell>₹{product.selling_price?.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={getStatusColor(product.live_status || product.Qc_status || "Pending")}>
                      {product.live_status || product.Qc_status || "Pending"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewProduct(product._id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleApproveProduct(product._id)}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRejectProduct(product._id)}>
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i + 1}>
                <PaginationLink
                  onClick={() => setCurrentPage(i + 1)}
                  className={currentPage === i + 1 ? "bg-primary text-primary-foreground" : "cursor-pointer"}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Summary */}
      <div className="text-sm text-gray-500">
        Showing {filteredProducts.length} of {totalProducts} pending products
      </div>
    </div>
  );
}
