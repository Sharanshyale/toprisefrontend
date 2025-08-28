"use client";
import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast as useGlobalToast } from "@/components/ui/toast";
import ShowCategory from "./TabComponent/showCategory";
import SubCategory from "./TabComponent/showSubCategory";
import ShowModel from "./TabComponent/showModel";
import DynamicButton from "@/components/common/button/button";
import CreateCategory from "./TabComponent/handelTabForm/CreateCategory";
import CreateSubCategory from "./TabComponent/handelTabForm/CreateSubCatefory";
import CreateModelForm from "./TabComponent/handelTabForm/createModelForm";
import ShowBrand from "./TabComponent/showBrand";
import CreateBrand from "./TabComponent/handelTabForm/CreateBrand";
import ShowVariant from "./TabComponent/showVarient";
import CreateVarient from "./TabComponent/handelTabForm/createVarient";
import SearchInput from "@/components/common/search/SearchInput";
import useDebounce from "@/utils/useDebounce";
import ContentMangementBulk from "./uploadbulkpopup/contentMangementBulk";
import Image from "next/image";

// Tab types
type TabType = "Model" | "Brand" | "Variant" | "Category" | "Subcategory";

// Tab configuration interface for scalability
interface TabConfig {
  id: TabType;
  label: string;
  component: React.ComponentType<any>;
  buttonConfig: {
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

export default function ShowContent() {
  const [activeTab, setActiveTab] = useState<TabType>("Category");
  const [openCategory, setOpenCategory] = useState(false);
  const [openSubCategory, setOpenSubCategory] = useState(false);
  const [openModel, setOpenModel] = useState(false);
  const [openBrand, setOpenBrand] = useState(false);
  const [openVariant, setOpenVariant] = useState(false);
  const [openBulkUpload, setOpenBulkUpload] = useState(false);
  const [uploadBulkLoading, setUploadBulkLoading] = useState(false);
  const { showToast } = useGlobalToast();
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Tab-specific action handlers
  const handleCategoryAction = useCallback(() => {
    setOpenCategory(true);
  }, []);

  const handleSubcategoryAction = useCallback(() => {
    setOpenSubCategory(true);
  }, []);
  const performSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setIsSearching(false);
  }, []);
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
    const searchPlaceholders: Record<TabType, string> = {
    Model: "Search Models...",
    Brand: "Search Brands...",
    Variant: "Search Variants...",
    Category: "Search Categories...",
    Subcategory: "Search Subcategories...",
  };

  // Add your subcategory-specific logic here

  const handleModelAction = useCallback(() => {
    setOpenModel(true);
  }, []);
  const handleBrandAction = useCallback(() => {
    setOpenBrand(true);
  }, []);
  const handleVariantAction = useCallback(() => {
    setOpenVariant(true);
  }, []);

  const handleUploadBulk = useCallback(() => {
    setOpenBulkUpload(true);
  }, []);

  // Get content type for bulk upload based on active tab
  const getContentTypeForBulkUpload = useCallback((tabType: TabType) => {
    switch (tabType) {
      case 'Category':
        return 'Category';
      case 'Subcategory':
        return 'Subcategory';
      case 'Brand':
        return 'Brand';
      case 'Model':
        return 'Model';
      case 'Variant':
        return 'Variant';
      default:
        return 'Product';
    }
  }, []);

  // Scalable tab configuration - easy to extend
  const tabConfigs: TabConfig[] = useMemo(
    () => [
      {
        id: "Model",
        label: "Model",
        component: ShowModel,
        buttonConfig: {
          text: "Add Model",
          action: handleModelAction,
        },
      },
      {
        id: "Brand",
        label: "Brand",
        component: ShowBrand,
        buttonConfig: {
          text: "Add Brand",
          action: handleBrandAction,
        },
      },
      {
        id: "Variant",
        label: "Variant",
        component: ShowVariant,
        buttonConfig: {
          text: "Add Variant",
          action: handleVariantAction,
        },
      },
      {
        id: "Category",
        label: "Category",
        component: ShowCategory,
        buttonConfig: {
          text: "Add Category",
          action: handleCategoryAction,
        },
      },
      {
        id: "Subcategory",
        label: "Subcategory",
        component: SubCategory,
        buttonConfig: {
          text: "Add Subcategory",
          action: handleSubcategoryAction,
        },
      },
    ],
    [
      handleCategoryAction,
      handleSubcategoryAction,
      handleModelAction,
      handleBrandAction,
    ]
  );

  // Get current tab configuration
  const currentTabConfig = useMemo(
    () => tabConfigs.find((tab) => tab.id === activeTab) || tabConfigs[0],
    [tabConfigs, activeTab]
  );

  // Render tab content dynamically
  const renderTabContent = useCallback(() => {
    const TabComponent = currentTabConfig.component;
    return <TabComponent searchQuery={searchQuery} />;
  }, [currentTabConfig, searchQuery]);

  return (
    <div className="w-full">
      <Card className="shadow-sm rounded-none">
        <CardHeader className="space-y-4 sm:space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex flex-col ">
            <CardTitle className="mb-4">Content Management</CardTitle>
            <SearchInput 
               value={searchInput}
    onChange={handleSearchChange}
    onClear={handleClearSearch}
    isLoading={isSearching}
    placeholder={searchPlaceholders[activeTab]}

            />
            </div>
            <div className="flex gap-3">
              {/* Dynamic button that changes based on active tab */}
              <DynamicButton
                text={currentTabConfig.buttonConfig.text}
                onClick={currentTabConfig.buttonConfig.action}
                className="bg-[#C72920] text-white hover:bg-[#C72920]/90"
                disabled={currentTabConfig.buttonConfig.disabled}
              />
                             {/* Bulk Upload Button */}
               <DynamicButton
                 variant="default"
                 customClassName="flex items-center text-[#408EFD] border-[#408EFD] gap-3 bg-[#408EFD1A] border-[#408EFD] hover:bg-[#408ffd3a] rounded-[8px] px-4 py-2 min-w-[120px] justify-center font-[Poppins]"
                 onClick={handleUploadBulk}
                 disabled={uploadBulkLoading}
                 loading={uploadBulkLoading}
                 loadingText={`Uploading ${activeTab}...`}
                 icon={
                   <Image src="/assets/uploadFile.svg" alt="Upload" width={16} height={16} className="h-4 w-4" />
                 }
                 text={`Upload ${activeTab}`}
               />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
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
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">{renderTabContent()}</div>
        </CardContent>
      </Card>
      <CreateCategory
        open={openCategory}
        onClose={() => setOpenCategory(false)}
      />
      <CreateSubCategory
        open={openSubCategory}
        onClose={() => setOpenSubCategory(false)}
      />
      <CreateModelForm open={openModel} onClose={() => setOpenModel(false)} />
      <CreateBrand open={openBrand} onClose={() => setOpenBrand(false)} />
      <CreateVarient open={openVariant} onClose={() => setOpenVariant(false)} />
      <ContentMangementBulk
        isOpen={openBulkUpload}
        onClose={() => setOpenBulkUpload(false)}
        mode="upload"
        contentType={getContentTypeForBulkUpload(activeTab)}
      />
    </div>
  );
}
