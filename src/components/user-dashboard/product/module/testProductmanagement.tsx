"use client";
import Image from "next/image";
import { useState, useMemo, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import useDebounce from "@/utils/useDebounce";
import { useAppSelector } from "@/store/hooks";
import DynamicButton from "@/components/common/button/button";
import SearchInput from "@/components/common/search/SearchInput";
import { Plus, Pencil } from "lucide-react";
import uploadFile from "../../../../../public/assets/uploadFile.svg";
import CreatedProduct from "./tabs/Super-Admin/CreatedProduct";
import ApprovedProduct from "./tabs/Super-Admin/ApprovedProduct";
import RejectedProduct from "./tabs/Super-Admin/RejectedProduct";
import PendingProduct from "./tabs/Super-Admin/PendingProduct";
import UploadBulkCard from "./uploadBulk";
import { useRouter } from "next/navigation";

import { set } from "zod";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { aproveProduct, deactivateProduct, rejectProduct } from "@/service/product-Service";
import { updateProductLiveStatus } from "@/store/slice/product/productLiveStatusSlice";
import { useToast as useGlobalToast } from "@/components/ui/toast";
import { useAppDispatch } from "@/store/hooks";
import RejectReason from "./tabs/Super-Admin/dialogue/RejectReason";


type TabType = "Created" | "Approved" | "Pending" | "Rejected";
interface TabConfig {
  id: TabType;
  label: string;
  component?: React.ComponentType<any>;
  buttonConfig?: {
    text: string;
    action: () => void;
    variant?:
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost"
      | "link";
    disabled?: boolean;
  };
}
export default function TestProductmanagement() {
  // Log selectedProducts whenever it changes

  const [activeTab, setActiveTab] = useState<TabType>("Created");
  
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTab, setSelectedTab] = useState("Created");
const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [bulkMode, setBulkMode] = useState<"upload" | "edit" | "uploadDealer">(
    "upload"
  );
  const {showToast} = useGlobalToast();
   const [isModalOpen, setIsModalOpen] = useState(false);
  const auth = useAppSelector((state) => state.auth.user);
  const [uploadBulkLoading, setUploadBulkLoading] = useState(false);
  const [addProductLoading, setAddProductLoading] = useState(false);
  const [editBulkLoading, setEditBulkLoading] = useState(false);
  const [uploadDealerBulkLoading, setUploadDealerBulkLoading] = useState(false);
  const route = useRouter();
  const dispatch = useAppDispatch();
const selectedProducts = useAppSelector(
  (state) => state.productIdForBulkAction.products || []
);

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

useEffect(() => {
  console.log("Selected Products updated:", selectedProducts);
}, [selectedProducts]);

  const performSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setIsSearching(false);
  }, []);
   const handleCloseModal = () => {
    setIsModalOpen(false);
   setUploadBulkLoading(false);
   setEditBulkLoading(false);
   setUploadDealerBulkLoading(false);
  };
  const { debouncedCallback: debouncedSearch, cleanup: cleanupDebounce } =
    useDebounce(performSearch, 500);
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setIsSearching(value.trim() !== "");
    debouncedSearch(value);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setIsSearching(false);
  };
  const handleUploadBulk = () => {
    setBulkMode("upload");
    setUploadBulkLoading(true);
    setIsModalOpen(true);
    setTimeout(() => setUploadBulkLoading(false), 1000); 
  };
    const handleAddProduct = () => {
    setAddProductLoading(true);
    route.push(`/user/dashboard/product/Addproduct`);
    setTimeout(() => setAddProductLoading(false), 1000); // Simulate loading
  };
    const handleBulkEdit = () => {
    setBulkMode("edit");
    setIsModalOpen(true);
    setEditBulkLoading(true);
  };
    const handleBulkUploadDealer = () => {
    setBulkMode("uploadDealer");
    setIsModalOpen(true);
    setUploadDealerBulkLoading(true);
  };

  // Bulk operation handlers for Select component
  const handleBulkApprove = async () => {
    if (selectedProducts.length === 0) return;
    try {
      const updatedProducts: any[] = [];
      await Promise.all(
        selectedProducts.map(async (id) => {
          
             await aproveProduct(id);
             updatedProducts.push(id);
           })
         );
         // Update Redux for all approved products
         updatedProducts.forEach((id) => {
           dispatch(updateProductLiveStatus({ id, liveStatus: "Approved" }));
         });
          showToast("Approved successfully", "success");
     
    } catch (error) {
      console.error("Bulk approve failed:", error);
      showToast("Approved failed", "error");
    }
  };
const handleBulkReject = useCallback(() => {
  if (!selectedProducts || selectedProducts.length === 0) {
    showToast("Please select products to reject", "error");
    return;
  }
  setIsRejectDialogOpen(true);
}, [selectedProducts, showToast]);

  const handleBulkDeactivate = async () => {
    if (selectedProducts.length === 0) return;
    try {
            const updatedProducts: any[] = [];
      await Promise.all(
        selectedProducts.map(async (id) => {
             await deactivateProduct(id);
             console.log("ID:", id);
             updatedProducts.push(id);
           })
         );
         // Update Redux for all deactivated products
         updatedProducts.forEach((id) => {
           dispatch(updateProductLiveStatus({ id, liveStatus: "Pending" }));
         });
          showToast("Deactivated successfully", "success");
    
    } catch (error) {
      console.error("Bulk deactivate failed:", error);
    }
  };

  const tabConfigs: TabConfig[] = useMemo(
    () => [
      {
        id: "Created",
        label: "Created",
        component: CreatedProduct,
        // component: ShowCreated,
        // buttonConfig: {
        //   text: "Add Created",
        //   action: handleCreatedAction,
        // },
      },
      {
        id: "Approved",
        label: "Approved",
        component: ApprovedProduct,
        // buttonConfig: {
        //   text: "Add Approved",
        //   action: handleApprovedAction,
        // },
      },
      {
        id: "Pending",
        label: "Pending",
        component: PendingProduct, // Assuming you have a PendingProduct component
        // component: ShowPending,
        // buttonConfig: {
        //   text: "Add Pending",
        //   action: handlePendingAction,
        // },
      },
      {
        id: "Rejected",
        label: "Rejected",
        component: RejectedProduct,
        // component: ShowRejected,
        // buttonConfig: {
        //   text: "Add Rejected",
        //   action: handleRejectedAction,
        // },
      },
    ],
    []
  );
  // Get current tab configuration
  const currentTabConfig = useMemo(
    () => tabConfigs.find((tab) => tab.id === activeTab) || tabConfigs[0],
    [tabConfigs, activeTab]
  );
  const renderTabContent = useCallback(() => {
    const TabComponent = currentTabConfig.component;
    if (TabComponent) {
      return <TabComponent searchQuery={searchQuery} selectedTab={selectedTab} />;
    }
    return null; // or you can return a message: <div>No component for this tab.</div>
  }, [currentTabConfig, searchQuery, selectedTab]);

  return (
    <div className="w-full ">
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
                placeholder="Search Spare parts..."
              />
              {/* Filter Buttons */}
              <div className="flex gap-2 sm:gap-3">
                <DynamicButton
                  variant="outline"
                  customClassName="bg-transparent border-gray-300 hover:bg-gray-50 min-w-[100px]"
                  text="Filters"
                />
                <DynamicButton
                  variant="outline"
                  customClassName="border-[#C72920] text-[#C72920] bg-white hover:bg-[#c728203a] min-w-[100px]"
                  text="Requests"
                />
              </div>
            </div>
            {/* Right: Upload, Add Product */}
            <div className="flex items-center gap-3 w-full lg:w-auto justify-start grid-ro-2 sm:justify-end">
              {(auth?.role === "Super-admin" ||
                auth?.role === "Inventory-Admin") && (
                <>
                  <DynamicButton
                    variant="default"
                    customClassName="flex items-center text-[#408EFD] border-[#408EFD] gap-3 bg-[#408EFD1A] border-[#408EFD] hover:bg-[#408ffd3a] rounded-[8px] px-4 py-2 min-w-[120px] justify-center font-[Poppins]"
                    onClick={handleUploadBulk}
                    disabled={uploadBulkLoading}
                    loading={uploadBulkLoading}
                    loadingText="Uploading..."
                    icon={
                      <Image src={uploadFile} alt="Add" className="h-4 w-4" />
                    }
                    text="Upload"
                  />
                  <DynamicButton
                    variant="default"
                    customClassName="flex items-center gap-3 bg-[#C729201A] border border-[#C72920] hover:bg-[#c728203a] text-[#C72920] rounded-[8px] px-4 py-2 min-w-[140px] justify-center font-[Poppins]  font-regular   "
                    onClick={handleAddProduct}
                    disabled={addProductLoading}
                    loading={addProductLoading}
                    loadingText="Adding..."
                    icon={<Plus />}
                    text="Add Product"
                  />
                  <DynamicButton
                    variant="default"
                    customClassName="bg-gray-200 text-black hover:bg-gray-300 flex items-center gap-2"
                    onClick={handleBulkEdit}
                    disabled={editBulkLoading}
                    loading={editBulkLoading}
                    loadingText="Editing..."
                    icon={<Pencil />}
                    text="Bulk Edit"
                  />
                  <DynamicButton
                    variant="default"
                    customClassName="flex items-center text-[#408EFD] border-[#408EFD] gap-3 bg-[#408EFD1A] border-[#408EFD] hover:bg-[#408ffd3a] rounded-[8px] px-4 py-2 min-w-[120px] justify-center font-[Poppins]"
                    onClick={handleBulkUploadDealer}
                    disabled={uploadDealerBulkLoading}
                    loadingText="Opening..."
                    icon={<Pencil />}
                    text="Assign Dealer"
                  />
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 w-full"></div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Tab Bar */}
          <div
            className="flex w-full items-center justify-between border-b border-gray-200 overflow-x-auto"
            aria-label="Product status tabs"
          >
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabConfigs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm font-mono transition-colors
                    ${
                      activeTab === tab.id
                        ? "text-[#C72920] border-b-2 border-[#C72920]"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                  `}
                >
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
            {selectedProducts.length > 0 && (
    <div className="px-6 flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="min-w-[140px]">Bulk Actions</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem className="cursor-pointer" onClick={handleBulkApprove}>
            Approve Selected
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={handleBulkDeactivate}>
            Deactivate Selected
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={handleBulkReject}>
            Reject Selected
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )}
          </div>
          {/* Tab Content */}
          <div className="min-h-[400px]">{renderTabContent()}</div>
        </CardContent>
      </Card>
          <UploadBulkCard
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              
              mode={bulkMode}
            />
            <RejectReason
              isOpen={isRejectDialogOpen}
              onClose={() => setIsRejectDialogOpen(false)}
              onSubmit={(data) => {
             
                setIsRejectDialogOpen(false);
           
              }}
            />
            
    </div>
  );
}
