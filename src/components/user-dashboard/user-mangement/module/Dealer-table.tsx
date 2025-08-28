"use client"
import { MoreHorizontal, ChevronUp, ChevronDown, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getAllDealers, disableDealer, enableDealer } from "@/service/dealerServices"
import { getAllCategories } from "@/service/dealerServices"
import type { Dealer, Category } from "@/types/dealer-types"
import { useToast as useToastMessage } from "@/components/ui/toast"
import { Skeleton } from "@/components/ui/skeleton"
import DynamicPagination from "@/components/common/pagination/DynamicPagination"
import AssignSLAForm from "../../dealer-management/module/popups/assignSLA"
import AssignCategoriesModal from "./addforms/AssignCategoriesModal"
import RemoveCategoriesModal from "./addforms/RemoveCategoriesModal"
import { useAppSelector } from "@/store/hooks"
import AssignStaffPopup from "./assignpop/AssignStaff"
import RemoveStaffPopup from "./assignpop/RemoveStaff"

interface DealertableProps {
  search?: string
  role?: string
  status?: string
  sortField?: string
  sortDirection?: "asc" | "desc"
  onSort?: (field: string) => void
}

export default function Dealertable({
  search = "",
  role = "",
  status = "",
  sortField = "",
  sortDirection = "asc",
  onSort,
}: DealertableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [dealers, setDealers] = useState<Dealer[]>([])
  const [loading, setLoading] = useState(true)
  const { showToast } = useToastMessage()
  const itemsPerPage = 10
  const allowedRoles = ["Super-admin", "Inventory-Admin", "Fulfillment-Admin"]
  const auth = useAppSelector((state) => state.auth.user)

  // Helper function to check if user can perform admin actions
  const canPerformAdminActions = () => {
    return auth && allowedRoles.includes(auth.role)
  }

  // Helper function to check if user can view details
  const canViewDetails = () => {
    return auth // Allow all authenticated users to view details
  }

  // Helper function to check if user can access the table
  const canAccessTable = () => {
    return auth // Allow all authenticated users to see the table
  }

  // Sort dealers based on sortField and sortDirection
  const sortedDealers = [...dealers].sort((a, b) => {
    if (!sortField) return 0

    let aValue: any
    let bValue: any

    switch (sortField) {
      case "legalName":
        aValue = a.legal_name?.toLowerCase() || ""
        bValue = b.legal_name?.toLowerCase() || ""
        break
      case "tradeName":
        aValue = a.trade_name?.toLowerCase() || ""
        bValue = b.trade_name?.toLowerCase() || ""
        break
      case "email":
        aValue = a.user_id.email?.toLowerCase() || ""
        bValue = b.user_id.email?.toLowerCase() || ""
        break
      case "phone":
        aValue = a.user_id.phone_Number?.toLowerCase() || ""
        bValue = b.user_id.phone_Number?.toLowerCase() || ""
        break
      case "contactPerson":
        aValue = a.contact_person.name?.toLowerCase() || ""
        bValue = b.contact_person.name?.toLowerCase() || ""
        break
      case "role":
        aValue = a.user_id.role?.toLowerCase() || ""
        bValue = b.user_id.role?.toLowerCase() || ""
        break
      case "status":
        aValue = a.is_active ? "active" : "inactive"
        bValue = b.is_active ? "active" : "inactive"
        break
      case "category":
        aValue = a.categories_allowed?.join(", ")?.toLowerCase() || ""
        bValue = b.categories_allowed?.join(", ")?.toLowerCase() || ""
        break
      default:
        return 0
    }

    if (sortDirection === "asc") {
      return aValue.localeCompare(bValue)
    } else {
      return bValue.localeCompare(aValue)
    }
  })

  // Filter dealers by search, role, and status
  const filteredDealers = sortedDealers.filter((dealer) => {
    const searchLower = search.toLowerCase()
    const matchesSearch =
      dealer.legal_name.toLowerCase().includes(searchLower) ||
      dealer.trade_name.toLowerCase().includes(searchLower) ||
      dealer.user_id.email.toLowerCase().includes(searchLower) ||
      dealer.user_id.phone_Number.toLowerCase().includes(searchLower) ||
      dealer.contact_person.name.toLowerCase().includes(searchLower) ||
      dealer.contact_person.email.toLowerCase().includes(searchLower)

    const matchesRole = !role || dealer.user_id.role?.toLowerCase() === role.toLowerCase()
    const matchesStatus = !status || (status === "active" ? dealer.is_active : !dealer.is_active)

    return matchesSearch && matchesRole && matchesStatus
  })
  const totalItems = filteredDealers.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const paginatedData = filteredDealers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [slaFormOpen, setSlaFormOpen] = useState(false)
  const [selectedDealerId, setSelectedDealerId] = useState<string | null>(null)
  const [viewDealerLoading, setViewDealerLoading] = useState(false)
  const [editDealerLoading, setEditDealerLoading] = useState(false)
  const [addDealerLoading, setAddDealerLoading] = useState(false)
  const [disablingId, setDisablingId] = useState<string | null>(null)
  const [enablingId, setEnablingId] = useState<string | null>(null)
  const [assignCategoriesModalOpen, setAssignCategoriesModalOpen] = useState(false)
  const [removeCategoriesModalOpen, setRemoveCategoriesModalOpen] = useState(false)
  const [selectedDealerForCategories, setSelectedDealerForCategories] = useState<Dealer | null>(null)
  const [assignStaffModalOpen, setAssignStaffModalOpen] = useState(false)
  const [selectedDealerForStaff, setSelectedDealerForStaff] = useState<Dealer | null>(null)
  const [removeStaffModalOpen, setRemoveStaffModalOpen] = useState(false)
  const [selectedDealerForRemoveStaff, setSelectedDealerForRemoveStaff] = useState<Dealer | null>(null)

  useEffect(() => {
    fetchDealers()
    fetchCategories()
  }, [])

  const handleSLAFormSubmit = (data: any) => {
    setSlaFormOpen(false)
    setSelectedDealerId(null)
    showToast("SLA has been assigned successfully.", "success")
    // Optionally, refresh dealers or perform other actions here
  }

  const handleAssignCategories = (dealer: Dealer) => {
    setSelectedDealerForCategories(dealer)
    setAssignCategoriesModalOpen(true)
  }

  const handleRemoveCategories = (dealer: Dealer) => {
    setSelectedDealerForCategories(dealer)
    setRemoveCategoriesModalOpen(true)
  }

  const handleCategoriesSuccess = () => {
    // Refresh the dealers list to show updated categories
    fetchDealers()
  }

  const handleStaffSuccess = () => {
    // Refresh the dealers list to show updated staff assignments
    fetchDealers()
  }

  const fetchDealers = async () => {
    try {
      setLoading(true)
      const response = await getAllDealers()
      if (response.success) {
        setDealers(response.data)
      }
    } catch (error) {
      showToast("Failed to fetch dealers", "error")
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await getAllCategories()
      if (response.success) {
        setCategories(response.data)
      }
    } catch (error) {
      showToast("Failed to fetch categories", "error")
    }
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page)
  }

  const handleSort = (field: string) => {
    if (onSort) {
      onSort(field)
    }
  }

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ChevronUp className="w-4 h-4 text-gray-400" />
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="w-4 h-4 text-[#C72920]" />
    ) : (
      <ChevronDown className="w-4 h-4 text-[#C72920]" />
    )
  }

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}
      >
        {isActive ? "Active" : "Inactive"}
      </span>
    )
  }

  const handleDisableDealer = async (dealerId: string) => {
    try {
      setDisablingId(dealerId)
      await disableDealer(dealerId)
      setDealers((prev) => prev.map((d) => (d._id === dealerId ? { ...d, is_active: false } : d)))
      showToast("Dealer Disabled Successfully", "success")
    } catch (error) {
      showToast("Failed to disable dealer. Please try again.", "error")
    } finally {
      setDisablingId(null)
    }
  }

  const handleEnableDealer = async (dealerId: string) => {
    try {
      setEnablingId(dealerId)
      await enableDealer(dealerId)
      setDealers((prev) => prev.map((d) => (d._id === dealerId ? { ...d, is_active: true } : d)))
      showToast("Dealer Enabled Successfully", "success")
    } catch (error) {
      showToast("Failed to enable dealer. Please try again.", "error")
    } finally {
      setEnablingId(null)
    }
  }

  const handleAssignStaff = (dealer: Dealer) => {
    setSelectedDealerForStaff(dealer)
    setAssignStaffModalOpen(true)
  }

  const handleRemoveStaff = (dealer: Dealer) => {
    setSelectedDealerForRemoveStaff(dealer)
    setRemoveStaffModalOpen(true)
  }

  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] max-w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">S. No.</th>
              <th
                className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm cursor-pointer hover:text-[#C72920] transition-colors"
                onClick={() => handleSort("legalName")}
              >
                <div className="flex items-center gap-1">
                  Legal Name
                  {getSortIcon("legalName")}
                </div>
              </th>
              <th
                className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm cursor-pointer hover:text-[#C72920] transition-colors"
                onClick={() => handleSort("tradeName")}
              >
                <div className="flex items-center gap-1">
                  Trade Name
                  {getSortIcon("tradeName")}
                </div>
              </th>
              <th
                className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm cursor-pointer hover:text-[#C72920] transition-colors"
                onClick={() => handleSort("email")}
              >
                <div className="flex items-center gap-1">
                  Email/Phone
                  {getSortIcon("email")}
                </div>
              </th>
              <th
                className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm cursor-pointer hover:text-[#C72920] transition-colors"
                onClick={() => handleSort("contactPerson")}
              >
                <div className="flex items-center gap-1">
                  Contact Person
                  {getSortIcon("contactPerson")}
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
              <th
                className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm cursor-pointer hover:text-[#C72920] transition-colors"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center gap-1">
                  Status
                  {getSortIcon("status")}
                </div>
              </th>
              <th
                className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm cursor-pointer hover:text-[#C72920] transition-colors"
                onClick={() => handleSort("category")}
              >
                <div className="flex items-center gap-1">
                  Category
                  {getSortIcon("category")}
                </div>
              </th>
              <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm"></th>
            </tr>
          </thead>
          <tbody>
            {[...Array(10)].map((_, idx) => (
              <tr key={idx} className="border-b border-gray-100">
                <td className="p-3 md:p-4">
                  <Skeleton className="h-4 w-8" />
                </td>
                <td className="p-3 md:p-4">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="p-3 md:p-4">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="p-3 md:p-4">
                  <Skeleton className="h-4 w-28" />
                </td>
                <td className="p-3 md:p-4">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="p-3 md:p-4">
                  <Skeleton className="h-4 w-16" />
                </td>
                <td className="p-3 md:p-4">
                  <Skeleton className="h-4 w-14" />
                </td>
                <td className="p-3 md:p-4">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="p-3 md:p-4">
                  <Skeleton className="h-4 w-8" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  // Role-based access control
  if (!auth || !canAccessTable()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600 font-bold">You do not have permission to access this page.</div>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1000px] max-w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm w-12">S. No.</th>
            <th
              className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm cursor-pointer hover:text-[#C72920] transition-colors w-36"
              onClick={() => handleSort("legalName")}
            >
              <div className="flex items-center gap-1">
                Legal Name
                {getSortIcon("legalName")}
              </div>
            </th>
            <th
              className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm cursor-pointer hover:text-[#C72920] transition-colors w-36"
              onClick={() => handleSort("tradeName")}
            >
              <div className="flex items-center gap-1">
                Trade Name
                {getSortIcon("tradeName")}
              </div>
            </th>
            <th
              className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm cursor-pointer hover:text-[#C72920] transition-colors w-44"
              onClick={() => handleSort("email")}
            >
              <div className="flex items-center gap-1">
                Email/Phone
                {getSortIcon("email")}
              </div>
            </th>
            <th
              className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm cursor-pointer hover:text-[#C72920] transition-colors w-36"
              onClick={() => handleSort("contactPerson")}
            >
              <div className="flex items-center gap-1">
                Contact Person
                {getSortIcon("contactPerson")}
              </div>
            </th>
            <th
              className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm cursor-pointer hover:text-[#C72920] transition-colors w-20"
              onClick={() => handleSort("role")}
            >
              <div className="flex items-center gap-1">
                Role
                {getSortIcon("role")}
              </div>
            </th>
            <th
              className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm cursor-pointer hover:text-[#C72920] transition-colors w-16"
              onClick={() => handleSort("status")}
            >
              <div className="flex items-center gap-1">
                Status
                {getSortIcon("status")}
              </div>
            </th>
            <th
              className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm cursor-pointer hover:text-[#C72920] transition-colors w-32"
              onClick={() => handleSort("category")}
            >
              <div className="flex items-center gap-1">
                Category
                {getSortIcon("category")}
              </div>
            </th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm w-12"></th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((dealer, index) => (
            <tr key={dealer._id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="p-3 md:p-4 text-gray-600 text-sm">{(currentPage - 1) * itemsPerPage + index + 1}</td>
              <td className="p-3 md:p-4 text-gray-600 text-sm">
                <div className="truncate max-w-[140px]" title={dealer.legal_name}>
                  {dealer.legal_name}
                </div>
              </td>
              <td className="p-3 md:p-4 font-medium text-gray-900 text-sm">
                <div className="truncate max-w-[140px]" title={dealer.trade_name}>
                  {dealer.trade_name}
                </div>
              </td>
              <td className="p-3 md:p-4 text-gray-600 text-sm">
                <div className="max-w-[170px]">
                  <div className="truncate" title={dealer.user_id.email}>
                    {dealer.user_id.email}
                  </div>
                  <div className="text-xs text-gray-500 truncate" title={dealer.user_id.phone_Number}>
                    {dealer.user_id.phone_Number}
                  </div>
                </div>
              </td>
              <td className="p-3 md:p-4 text-gray-600 text-sm">
                <div className="max-w-[140px]">
                  <div className="truncate" title={dealer.contact_person.name}>
                    {dealer.contact_person.name}
                  </div>
                  <div className="text-xs text-gray-500 truncate" title={dealer.contact_person.email}>
                    {dealer.contact_person.email}
                  </div>
                </div>
              </td>
              <td className="p-3 md:p-4 text-gray-600 text-sm">
                <div className="truncate max-w-[60px]" title={dealer.user_id.role}>
                  {dealer.user_id.role}
                </div>
              </td>
              <td className="p-3 md:p-4">{getStatusBadge(dealer.is_active)}</td>
              <td className="p-3 md:p-4 text-gray-600 text-sm">
                <div className="flex flex-wrap gap-1 max-w-[120px]">
                  {dealer.categories_allowed.map((categoryId, idx) => {
                    const category = categories.find((cat) => cat._id === categoryId)
                    return (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded truncate max-w-[100px]"
                        title={category ? category.category_name : categoryId}
                      >
                        {category ? category.category_name : categoryId}
                      </span>
                    )
                  })}
                </div>
              </td>
              <td className="p-3 md:p-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {canPerformAdminActions() && (
                      <DropdownMenuItem
                        onClick={() => {
                          setEditDealerLoading(true)
                          router.push(`/user/dashboard/user/edit-dealer/${dealer._id}`)
                        }}
                      >
                        Edit
                      </DropdownMenuItem>
                    )}
                    {canPerformAdminActions() && (
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedDealerId(dealer._id)
                          setSlaFormOpen(true)
                        }}
                      >
                        Assign SLA
                      </DropdownMenuItem>
                    )}
                    {canPerformAdminActions() && (
                      <DropdownMenuItem onClick={() => handleAssignCategories(dealer)}>
                        Assign Categories
                      </DropdownMenuItem>
                    )}
                    {canPerformAdminActions() && dealer.categories_allowed.length > 0 && (
                      <DropdownMenuItem onClick={() => handleRemoveCategories(dealer)}>
                        Remove Categories
                      </DropdownMenuItem>
                    )}
                    {canPerformAdminActions() && (
                      <DropdownMenuItem onClick={() => handleAssignStaff(dealer)}>Assign Staff</DropdownMenuItem>
                    )}
                    {canPerformAdminActions() && (dealer.assigned_Toprise_employee || []).length > 0 && (
                      <DropdownMenuItem onClick={() => handleRemoveStaff(dealer)}>Remove Staff</DropdownMenuItem>
                    )}
                    {canPerformAdminActions() && dealer.is_active && (
                      <DropdownMenuItem
                        onClick={() => {
                          if (disablingId) return
                          handleDisableDealer(dealer._id)
                        }}
                      >
                        {disablingId === dealer._id ? (
                          <span className="flex items-center">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Disabling...
                          </span>
                        ) : (
                          "Disable Dealer"
                        )}
                      </DropdownMenuItem>
                    )}
                    {canPerformAdminActions() && !dealer.is_active && (
                      <DropdownMenuItem
                        onClick={() => {
                          if (enablingId) return
                          handleEnableDealer(dealer._id)
                        }}
                      >
                        {enablingId === dealer._id ? (
                          <span className="flex items-center">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enabling...
                          </span>
                        ) : (
                          "Enable Dealer"
                        )}
                      </DropdownMenuItem>
                    )}
                    {canViewDetails() && (
                      <DropdownMenuItem
                        onClick={() => {
                          setViewDealerLoading(true)
                          router.push(`/user/dashboard/user/dealerview/${dealer._id}`)
                        }}
                      >
                        View Details
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Dynamic Pagination */}
      <DynamicPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
      />
      <AssignSLAForm
        open={slaFormOpen}
        onClose={() => setSlaFormOpen(false)}
        dealerId={selectedDealerId}
        onSubmit={handleSLAFormSubmit}
      />

      {/* Category Management Modals */}
      <AssignCategoriesModal
        open={assignCategoriesModalOpen}
        onClose={() => setAssignCategoriesModalOpen(false)}
        dealerId={selectedDealerForCategories?._id || null}
        dealerName={selectedDealerForCategories?.legal_name || "Dealer"}
        currentCategories={selectedDealerForCategories?.categories_allowed || []}
        onSuccess={handleCategoriesSuccess}
      />

      <RemoveCategoriesModal
        open={removeCategoriesModalOpen}
        onClose={() => setRemoveCategoriesModalOpen(false)}
        dealerId={selectedDealerForCategories?._id || null}
        dealerName={selectedDealerForCategories?.legal_name || "Dealer"}
        currentCategories={selectedDealerForCategories?.categories_allowed || []}
        onSuccess={handleCategoriesSuccess}
      />

      {/* Staff Management Modal */}
      <AssignStaffPopup
        open={assignStaffModalOpen}
        onClose={() => setAssignStaffModalOpen(false)}
        dealerId={selectedDealerForStaff?._id || null}
        dealerName={selectedDealerForStaff?.legal_name || "Dealer"}
        currentStaff={(selectedDealerForStaff?.assigned_Toprise_employee || [])
          .map((a) => {
            const u: any = a?.assigned_user as any
            if (!u) return ""
            return typeof u === "string" ? u : u._id
          })
          .filter(Boolean) as string[]}
        onSuccess={handleStaffSuccess}
      />

      <RemoveStaffPopup
        open={removeStaffModalOpen}
        onClose={() => setRemoveStaffModalOpen(false)}
        dealerId={selectedDealerForRemoveStaff?._id || null}
        dealerName={selectedDealerForRemoveStaff?.legal_name || "Dealer"}
        currentStaff={(selectedDealerForRemoveStaff?.assigned_Toprise_employee || [])
          .map((a) => {
            const u: any = a?.assigned_user as any
            if (!u) return ""
            return typeof u === "string" ? u : u._id
          })
          .filter(Boolean) as string[]}
        onSuccess={handleStaffSuccess}
      />

      {/* Loader for dealers */}
      {viewDealerLoading && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center justify-center shadow-xl">
            <Loader2 className="h-16 w-16 animate-spin text-[#C72920] mb-4" />
            <p className="text-lg font-medium text-gray-700">Loading Dealer details...</p>
          </div>
        </div>
      )}
      {editDealerLoading && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center justify-center shadow-xl">
            <Loader2 className="h-16 w-16 animate-spin text-[#C72920] mb-4" />
            <p className="text-lg font-medium text-gray-700">Loading Dealer details...</p>
          </div>
        </div>
      )}
      {addDealerLoading && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center justify-center shadow-xl">
            <Loader2 className="h-16 w-16 animate-spin text-[#C72920] mb-4" />
            <p className="text-lg font-medium text-gray-700">Loading Dealer details...</p>
          </div>
        </div>
      )}
    </div>
  )
}
