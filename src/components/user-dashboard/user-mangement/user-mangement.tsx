"use client"

import { useState, useEffect } from "react"
import Employeetable from "./module/Employee-table"
import Dealertable from "./module/Dealer-table"
import AppUsersTable from "./module/AppUsers-table"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import addSquare from "../../../../public/assets/addSquare.svg";
import { useRouter } from "next/navigation";
import DynamicButton from "@/components/common/button/button";
import uploadFile from "../../../../public/assets/uploadFile.svg";
import FileUploadModal from "./module/Employee-upload"
import { useAppSelector } from "@/store/hooks"
import GlobalFilters from "./module/global-filters"
import { getAllDealers } from "@/service/dealerServices"
import { getAvailableRegions } from "@/service/employeeServices"


export default function Usermangement() {
  const [activeTab, setActiveTab] = useState("employee")
  const [addLoading, setAddLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [region, setRegion] = useState("");
  const [dealer, setDealer] = useState("");
  
  // Available roles state
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);
  const [availableDealers, setAvailableDealers] = useState<Array<{ _id: string; legal_name: string; trade_name: string }>>([]);
  
  // Sorting state
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  const router = useRouter();
  const allowedRoles = ["Super-admin", "Inventory-Admin", "Fulfillment-Admin"];
  const auth = useAppSelector((state) => state.auth.user);

  // Set default tab based on user role - hide dealer tab for fulfillment staff only
  useEffect(() => {
    if (["Fulfillment-Staff"].includes(auth?.role)) {
      setActiveTab("employee");
    }
  }, [auth?.role]);

  // Fetch dealers and regions for employee filtering
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        // Fetch dealers
        const dealersResponse = await getAllDealers();
        setAvailableDealers(dealersResponse.data || []);
        
        // Fetch available regions
        const regions = await getAvailableRegions();
        setAvailableRegions(regions);
      } catch (error) {
        console.error("Failed to fetch filter data:", error);
        setAvailableDealers([]);
        setAvailableRegions([]);
      }
    };

    if (activeTab === "employee") {
      fetchFilterData();
    }
  }, [activeTab]);

  // Helper function to check if user can perform admin actions
  const canPerformAdminActions = () => {
    return auth && allowedRoles.includes(auth.role);
  };

  // Helper function to check if user can access the page
  const canAccessPage = () => {
    return auth; // Allow all authenticated users to access the page
  };

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Handle filter changes from GlobalFilters
  const handleSearchChange = (search: string) => setSearch(search);
  const handleRoleChange = (role: string) => setRole(role);
  const handleStatusChange = (status: string) => setStatus(status);
  const handleRegionChange = (region: string) => setRegion(region);
  const handleDealerChange = (dealer: string) => setDealer(dealer);
  const handleResetFilters = () => {
    setSearch("");
    setRole("");
    setStatus("");
    setRegion("");
    setDealer("");
  };


  // Role-based access control - only check if user is authenticated
  if (!auth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600 font-bold">
          You do not have permission to access this page.
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-6 bg-white">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4 md:mb-6">User Management</h1>

        {/* Tabs - Connected design */}
        <div className="inline-flex mb-4 md:mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("employee")}
            className={`px-6 py-2 -mb-px font-medium text-lg transition-colors duration-200 border-b-2 focus:outline-none ${
              activeTab === "employee"
                ? "border-[#C72920] text-[#C72920]"
                : "border-transparent text-gray-500 hover:text-[#C72920]"
            }`}
          >
            Employee
          </button>
          {/* Hide Dealer tab for Fulfillment-Staff only */}
          {!["Fulfillment-Staff"].includes(auth.role) && (
            <button
              onClick={() => setActiveTab("dealer")}
              className={`px-6 py-2 -mb-px font-medium text-lg transition-colors duration-200 border-b-2 focus:outline-none ${
                activeTab === "dealer"
                  ? "border-[#C72920] text-[#C72920]"
                  : "border-transparent text-gray-500 hover:text-[#C72920]"
              }`}
            >
              Dealer
            </button>
          )}
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-2 -mb-px font-medium text-lg transition-colors duration-200 border-b-2 focus:outline-none ${
              activeTab === "users"
                ? "border-[#C72920] text-[#C72920]"
                : "border-transparent text-gray-500 hover:text-[#C72920]"
            }`}
          >
            Users
          </button>
        </div>

        {/* Search and Actions Bar - Mobile responsive */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-4 md:mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            <GlobalFilters 
              type={activeTab as "employee" | "dealer" | "users"}
              search={search}
              onSearchChange={handleSearchChange}
              currentRole={role || "all"}
              onRoleChange={handleRoleChange}
              currentStatus={status || "all"}
              onStatusChange={handleStatusChange}
              currentRegion={region || "all"}
              onRegionChange={handleRegionChange}
              currentDealer={dealer || "all"}
              onDealerChange={handleDealerChange}
              onResetFilters={handleResetFilters}
              availableRoles={activeTab === "employee" ? availableRoles : activeTab === "users" ? ["User"] : []}
              availableRegions={availableRegions}
              availableDealers={availableDealers}
            />
          </div>

          <div className="flex items-center gap-3 justify-end">
            {activeTab === "dealer" && canPerformAdminActions() && (
              <DynamicButton
                variant="default"
                customClassName="flex items-center text-[#408EFD] border-[#408EFD] gap-3 bg-[#408EFD1A] border-[#408EFD] hover:bg-[#408ffd3a] rounded-[8px] px-4 py-2 min-w-[140px] justify-center"
                onClick={() => {
                  setUploadLoading(true);
                  setUploadOpen(true);
                  setTimeout(() => setUploadLoading(false), 800);
                }}
                disabled={uploadLoading}
                loading={uploadLoading}
                loadingText="Opening..."
                icon={<Image src={uploadFile} alt="Upload" className="h-4 w-4" />}
                text="Upload"
              />
            )}
            {canPerformAdminActions() && activeTab !== "users" && (
              <Button
                className="flex items-center gap-3 bg-[#C729201A] border border-[#C72920] hover:bg-[#c728203a] text-[#C72920] rounded-[8px] px-4 py-2 min-w-[140px] justify-center"
                variant="default"
                onClick={async () => {
                  setAddLoading(true);
                  if (activeTab === "employee") {
                    router.push("/user/dashboard/user/addemployee");
                  } else {
                    router.push("/user/dashboard/user/adddealer");
                  }
                  setTimeout(() => setAddLoading(false), 1000); // Simulate loading
                }}
                disabled={addLoading}
              >
                {addLoading ? (
                  <svg className="animate-spin h-5 w-5 text-[#C72920]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                ) : (
                  <Image src={addSquare} alt="Add" className="h-4 w-4" />
                )}
                <span className="b3 font-RedHat">{activeTab === "employee" ? "Add Employee" : "Add Dealer"}</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Table Content - Mobile responsive */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {activeTab === "employee"
          ? <Employeetable 
              search={search}
              role={role === "all" ? "" : role}
              status={status === "all" ? "" : status}
              region={region === "all" ? "" : region}
              dealer={dealer === "all" ? "" : dealer}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              onRolesUpdate={setAvailableRoles}
            />
          : activeTab === "dealer" ? (
            <Dealertable 
              search={search} 
              role={role === "all" ? "" : role}
              status={status === "all" ? "" : status}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
          ) : (
            <AppUsersTable
              search={search}
              role={role === "all" ? "" : role}
              status={status === "all" ? "" : status}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
          )}
      </div>
      <FileUploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
      />
    
    </div>
  )
}
