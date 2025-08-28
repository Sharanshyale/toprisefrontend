"use client"

import { MoreHorizontal, ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useState, useEffect } from "react" 
import { useRouter } from "next/navigation"
import { 
  getAllEmployees, 
  revokeRole, 
  getEmployeesByRegion, 
  getEmployeesByDealer, 
  getEmployeesByRegionAndDealer,
  getFulfillmentStaffByRegion 
} from "@/service/employeeServices"
import type { Employee } from "@/types/employee-types"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppSelector } from "@/store/hooks"
import { useToast } from "@/components/ui/toast"
import DynamicPagination from "@/components/common/pagination/DynamicPagination"

interface EmployeeTableProps {
  search?: string;
  role?: string;
  status?: string;
  region?: string;
  dealer?: string;
  sortField?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (field: string) => void;
  onRolesUpdate?: (roles: string[]) => void;
}

export default function EmployeeTable({ 
  search = "",
  role = "",
  status = "",
  region = "",
  dealer = "",
  sortField = "", 
  sortDirection = "asc", 
  onSort,
  onRolesUpdate
}: EmployeeTableProps) {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const allowedRoles = ["Super-admin", "Inventory-Admin", "Fulfillment-Admin"];
  const auth = useAppSelector((state) => state.auth.user);
  const { showToast } = useToast();

  // Helper function to check if user can perform admin actions
  const canPerformAdminActions = () => {
    return auth && allowedRoles.includes(auth.role);
  };

  // Helper function to check if user can view details
  const canViewDetails = () => {
    return auth; 
  };

  // Helper function to check if user can access the table
  const canAccessTable = () => {
    return auth; // Allow all authenticated users to see the table
  };

  // Handle role revocation
  const handleRevokeRole = async (employeeId: string, employeeName: string) => {
    try {
      setIsLoading(true);
      await revokeRole(employeeId, {});
      
      // Update the local state to reflect the role change
      setEmployees(prevEmployees => 
        prevEmployees.map(emp => 
          emp._id === employeeId 
            ? { ...emp, role: "User" }
            : emp
        )
      );
      
      // showToast(`Role revoked successfully for ${employeeName}`, "success");
    } catch (error: any) {
      showToast(`Failed to revoke role: ${error.message || "Unknown error"}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced fetch function that uses different API endpoints based on filters
  const fetchEmployees = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let response;
      
      // Determine which API endpoint to use based on filters
      if (region && dealer && region !== "all" && dealer !== "all") {
        // Both region and dealer filters are active
        response = await getEmployeesByRegionAndDealer(region, dealer, {
          role: role || undefined,
          page: currentPage,
          limit: itemsPerPage
        });
      } else if (region && region !== "all") {
        // Only region filter is active
        if (auth?.role === "Fulfillment-Admin" && role === "Fulfillment-Staff") {
          // Use specialized fulfillment staff endpoint
          response = await getFulfillmentStaffByRegion(region, {
            page: currentPage,
            limit: itemsPerPage
          });
        } else {
          response = await getEmployeesByRegion(region, {
            role: role || undefined,
            page: currentPage,
            limit: itemsPerPage
          });
        }
      } else if (dealer && dealer !== "all") {
        // Only dealer filter is active
        response = await getEmployeesByDealer(dealer, {
          role: role || undefined,
          page: currentPage,
          limit: itemsPerPage
        });
      } else {
        // No specific filters, use the general endpoint
        response = await getAllEmployees();
      }
      
      // Handle different response structures
      if (response.data?.employees) {
        // New API endpoints return data in { employees: [], pagination: {} } format
        setEmployees(response.data.employees || []);
      } else {
        // Legacy endpoint returns data directly as array
        setEmployees(response.data || []);
      }
    } catch (err: any) {
      setError(err);
      showToast(`Failed to fetch employees: ${err.message || "Unknown error"}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search, role, status, region, dealer, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, role, status, region, dealer]);

  // Sort employees based on sortField and sortDirection
  const sortedEmployees = [...employees].sort((a, b) => {
    if (!sortField) return 0;
    
    let aValue: any;
    let bValue: any;
    
    switch (sortField) {
      case "name":
        aValue = a.First_name?.toLowerCase() || "";
        bValue = b.First_name?.toLowerCase() || "";
        break;
      case "id":
        aValue = a.employee_id?.toLowerCase() || "";
        bValue = b.employee_id?.toLowerCase() || "";
        break;
      case "email":
        aValue = a.email?.toLowerCase() || "";
        bValue = b.email?.toLowerCase() || "";
        break;
      case "phone":
        aValue = a.mobile_number?.toLowerCase() || "";
        bValue = b.mobile_number?.toLowerCase() || "";
        break;
      case "role":
        aValue = a.role?.toLowerCase() || "";
        bValue = b.role?.toLowerCase() || "";
        break;
      case "department":
        aValue = a.role?.toLowerCase() || "";
        bValue = b.role?.toLowerCase() || "";
        break;
      case "status":
        aValue = a.status?.toLowerCase() || "";
        bValue = b.status?.toLowerCase() || "";
        break;
      default:
        return 0;
    }
    
    if (sortDirection === "asc") {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  // Filter employees by search, role, and status
  const filteredEmployees = sortedEmployees.filter((employee) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      employee.First_name?.toLowerCase().includes(searchLower) ||
      employee.employee_id?.toLowerCase().includes(searchLower) ||
      employee.email?.toLowerCase().includes(searchLower) ||
      employee.mobile_number?.toLowerCase().includes(searchLower);
    
    // Handle role filtering - only filter if role is provided and not empty
    let matchesRole = true;
    if (role && role.trim() !== "") {
      const employeeRole = employee.role || "User";
      matchesRole = employeeRole.toLowerCase() === role.toLowerCase();
    }
    
    // Handle status filtering - only filter if status is provided and not empty
    let matchesStatus = true;
    if (status && status.trim() !== "") {
      const employeeStatus = employee.status || "Active";
      matchesStatus = employeeStatus.toLowerCase() === status.toLowerCase();
    }
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalItems = filteredEmployees.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  
  

  // Update available roles when employee data changes
  useEffect(() => {
    if (onRolesUpdate && employees.length > 0) {
      const roles = [...new Set(employees.map(emp => emp.role).filter(Boolean))];
      onRolesUpdate(roles);
    }
  }, [employees, onRolesUpdate]);
  
  // Reset to page 1 when filters change and current page is out of bounds
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);
  
  const paginatedData = filteredEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page)
  }

  const handleSort = (field: string) => {
    if (onSort) {
      onSort(field);
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

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        Failed to load employees: {error.message}
      </div>
    )
  }

  // Role-based access control
  if (!auth || !canAccessTable()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600 font-bold">
          You do not have permission to access this page.
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {/* Filter Summary */}
      {(role || status || region || dealer) && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">
            <strong>Active Filters:</strong>
            {role && <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Role: {role}</span>}
            {status && <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Status: {status}</span>}
            {region && <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Region: {region}</span>}
            {dealer && <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">Dealer: {dealer}</span>}
            <span className="ml-2 text-gray-500">({filteredEmployees.length} of {employees.length} employees)</span>
          </div>
        </div>
      )}
      
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">
              <Checkbox />
            </th>
            <th 
              className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm cursor-pointer hover:text-[#C72920] transition-colors"
              onClick={() => handleSort("name")}
            >
              <div className="flex items-center gap-1">
                Name
                {getSortIcon("name")}
              </div>
            </th>
            <th 
              className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm cursor-pointer hover:text-[#C72920] transition-colors"
              onClick={() => handleSort("id")}
            >
              <div className="flex items-center gap-1">
                ID
                {getSortIcon("id")}
              </div>
            </th>
            <th 
              className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm cursor-pointer hover:text-[#C72920] transition-colors"
              onClick={() => handleSort("email")}
            >
              <div className="flex items-center gap-1">
                Email
                {getSortIcon("email")}
              </div>
            </th>
            <th 
              className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm cursor-pointer hover:text-[#C72920] transition-colors"
              onClick={() => handleSort("phone")}
            >
              <div className="flex items-center gap-1">
                Phone
                {getSortIcon("phone")}
              </div>
            </th>
            <th 
              className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm cursor-pointer hover:text-[#C72920] transition-colors"
              onClick={() => handleSort("role")}
            >
              <div className="flex items-center gap-1">
                Role
                {getSortIcon("role")}
              </div>
            </th>
            {/* Removed Department column as it's not in API response */}
            <th 
              className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm cursor-pointer hover:text-[#C72920] transition-colors"
              onClick={() => handleSort("status")}
            >
              <div className="flex items-center gap-1">
                Status
                {getSortIcon("status")}
              </div>
            </th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            // Skeleton loader rows
            Array.from({ length: itemsPerPage }).map((_, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-3 md:p-4">
                  <Skeleton className="h-4 w-4" />
                </td>
                <td className="p-3 md:p-4">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="p-3 md:p-4">
                  <Skeleton className="h-4 w-16" />
                </td>
                <td className="p-3 md:p-4">
                  <Skeleton className="h-4 w-32" />
                </td>
                <td className="p-3 md:p-4">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="p-3 md:p-4">
                  <Skeleton className="h-4 w-16" />
                </td>
                <td className="p-3 md:p-4">
                  <Skeleton className="h-6 w-16 rounded-full" />
                </td>
                <td className="p-3 md:p-4">
                  <Skeleton className="h-8 w-8 rounded-md" />
                </td>
              </tr>
            ))
          ) : (
            // Actual data rows
            paginatedData.map((employee) => (
              <tr key={employee._id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-3 md:p-4">
                  <Checkbox />
                </td>
                <td className="p-3 md:p-4 font-medium text-gray-900 text-sm">{employee.First_name}</td>
                <td className="p-3 md:p-4 text-gray-600 text-sm">{employee.employee_id}</td>
                <td className="p-3 md:p-4 text-gray-600 text-sm">{employee.email}</td>
                <td className="p-3 md:p-4 text-gray-600 text-sm">{employee.mobile_number}</td>
                {/* Removed Department cell to match updated columns */}
                <td className="p-3 md:p-4 text-gray-600 text-sm">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {employee.role || "User"}
                  </span>
                </td>
                 <td className="p-3 md:p-4 text-gray-600 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      employee.status === "Active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {employee.status || "Active"}
                  </span>
                </td>
                <td className="p-3 md:p-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {/* {canPerformAdminActions() && (
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/employees/edit-employee/${employee._id}`)}>
                          Edit
                        </DropdownMenuItem>
                      )} */}
                      {/* {canPerformAdminActions() && (
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                      )} */}
                      {canViewDetails() && (
                        <DropdownMenuItem onClick={() => router.push(`/user/dashboard/user/employeeview/${employee._id}`)}>
                          View Details
                        </DropdownMenuItem>
                      )}
                      {canPerformAdminActions() && employee.role !== "User" && (
                        <DropdownMenuItem 
                          onClick={() => handleRevokeRole(employee._id, employee.First_name)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Revoke Role
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      {/* Pagination - Show skeleton if loading */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center p-3 md:p-4 border-t border-gray-200 gap-2">
        {isLoading ? (
          <Skeleton className="h-4 w-48" />
        ) : (
          <span className="text-sm text-gray-500 md:text-left text-center w-full md:w-auto">
            Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} employees
          </span>
        )}
        <div className="flex justify-center md:justify-end w-full md:w-auto">
          {isLoading ? (
            <div className="flex gap-2">
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-9" />
            </div>
          ) : (
            <DynamicPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
            />
          )}
        </div>
      </div>
    </div>
  )
}