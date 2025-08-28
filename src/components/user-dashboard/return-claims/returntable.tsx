"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Edit,
  Eye,
  MoreHorizontal,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import SearchFiltersModal from "./modules/modalpopus/searchfilters";
import SearchInput from "@/components/common/search/SearchInput";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getReturnRequests } from "@/service/return-service";
import { ReturnRequest, ReturnRequestsResponse } from "@/types/return-Types";
import ValidateReturnRequest from "./modules/modalpopus/Validate";

import SchedulePickupDialog from "./modules/modalpopus/SchedulePickupDialog";
import CompletePickupDialog from "./modules/modalpopus/CompletePickupDialog";
import InspectDialog from "./modules/modalpopus/inspectDialog";
import InitiateRefundForm from "./modules/modalpopus/InitiateReturn";

export default function ReturnClaims() {
  const router = useRouter();
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  const [selectedClaims, setSelectedClaims] = useState<string[]>([]);

  // Validation dialog state
  const [validationDialog, setValidationDialog] = useState<{
    open: boolean;
    returnId: string | null;
  }>({
    open: false,
    returnId: null,
  });



  // Schedule pickup dialog state
  const [schedulePickupDialog, setSchedulePickupDialog] = useState<{
    open: boolean;
    returnId: string | null;
    returnRequest: ReturnRequest | null;
  }>({
    open: false,
    returnId: null,
    returnRequest: null,
  });

  // Complete pickup dialog state
  const [completePickupDialog, setCompletePickupDialog] = useState<{
    open: boolean;
    returnId: string | null;
    returnRequest: ReturnRequest | null;
  }>({
    open: false,
    returnId: null,
    returnRequest: null,
  });

  // Inspect dialog state
  const [inspectDialog, setInspectDialog] = useState<{
    open: boolean;
    returnId: string | null;
    returnRequest: ReturnRequest | null;
  }>({
    open: false,
    returnId: null,
    returnRequest: null,
  });

  // Initiate refund dialog state
  const [initiateRefundDialog, setInitiateRefundDialog] = useState<{
    open: boolean;
    returnId: string | null;
  }>({
    open: false,
    returnId: null,
  });

  // Fetch return requests from API
  const fetchReturnRequests = async () => {
    try {
      setLoading(true);
      const response: ReturnRequestsResponse = await getReturnRequests();
      if (response.success && response.data) {
        setReturnRequests(response.data.returnRequests);
        setTotalPages(response.data.pagination.pages);
        setTotalItems(response.data.pagination.total);
      }
    } catch (error) {
      console.error("Failed to fetch return requests:", error);
      setReturnRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturnRequests();
  }, []);

  // Handle validation dialog open
  const handleOpenValidation = (returnId: string) => {
    setValidationDialog({
      open: true,
      returnId,
    });
  };

  // Handle details dialog open
  const handleOpenDetails = (returnId: string) => {
    router.push(`/user/dashboard/returnclaims/${returnId}`);
  };

  // Handle schedule pickup dialog open
  const handleOpenSchedulePickup = (returnId: string) => {
    const returnRequest = returnRequests.find((req) => req._id === returnId);
    setSchedulePickupDialog({
      open: true,
      returnId,
      returnRequest: returnRequest || null,
    });
  };

  // Handle complete pickup dialog open
  const handleOpenCompletePickup = (returnId: string) => {
    const returnRequest = returnRequests.find((req) => req._id === returnId);
    setCompletePickupDialog({
      open: true,
      returnId,
      returnRequest: returnRequest || null,
    });
  };

  // Handle inspect dialog open
  const handleOpenInspect = (returnId: string) => {
    const returnRequest = returnRequests.find((req) => req._id === returnId);
    setInspectDialog({
      open: true,
      returnId,
      returnRequest: returnRequest || null,
    });
  };

  // Handle initiate refund dialog open
  const handleOpenInitiateRefund = (returnId: string) => {
    setInitiateRefundDialog({
      open: true,
      returnId,
    });
  };

  // Handle validation dialog close
  const handleCloseValidation = () => {
    setValidationDialog({
      open: false,
      returnId: null,
    });
  };



  // Handle schedule pickup dialog close
  const handleCloseSchedulePickup = () => {
    setSchedulePickupDialog({
      open: false,
      returnId: null,
      returnRequest: null,
    });
  };

  // Handle complete pickup dialog close
  const handleCloseCompletePickup = () => {
    setCompletePickupDialog({
      open: false,
      returnId: null,
      returnRequest: null,
    });
  };

  // Handle inspect dialog close
  const handleCloseInspect = () => {
    setInspectDialog({
      open: false,
      returnId: null,
      returnRequest: null,
    });
  };

  // Handle initiate refund dialog close
  const handleCloseInitiateRefund = () => {
    setInitiateRefundDialog({
      open: false,
      returnId: null,
    });
  };

  // Handle schedule pickup completion
  const handleSchedulePickupComplete = (success: boolean) => {
    if (success) {
      // Refresh the return requests to get updated data
      fetchReturnRequests();
    }
  };

  // Handle complete pickup completion
  const handleCompletePickupComplete = (success: boolean) => {
    if (success) {
      // Refresh the return requests to get updated data
      fetchReturnRequests();
    }
  };

  // Handle validation completion
  const handleValidationComplete = (success: boolean) => {
    if (success) {
      // Refresh the return requests to get updated status
      fetchReturnRequests();
    }
  };

  // Handle inspect completion
  const handleInspectComplete = (success: boolean) => {
    if (success) {
      // Refresh the return requests to get updated status
      fetchReturnRequests();
    }
  };

  // Handle initiate refund completion
  const handleInitiateRefundComplete = (success: boolean) => {
    if (success) {
      // Refresh the return requests to get updated status
      fetchReturnRequests();
    }
  };

  const filteredReturnRequests = useMemo(() => {
    return returnRequests
      .filter((request) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          request._id.toLowerCase().includes(searchLower) ||
          request.sku.toLowerCase().includes(searchLower) ||
          (request.orderId?.orderId || "")
            .toLowerCase()
            .includes(searchLower) ||
          (request.orderId?.customerDetails?.name || "")
            .toLowerCase()
            .includes(searchLower) ||
          request.returnReason.toLowerCase().includes(searchLower)
        );
      })
      .filter(
        (request) =>
          filterStatus === "All" || request.returnStatus === filterStatus
      );
  }, [returnRequests, searchTerm, filterStatus]);

  const paginatedReturnRequests = filteredReturnRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset selection when page or filters change
  useEffect(() => {
    setSelectedClaims([]);
  }, [currentPage, searchTerm, filterStatus]);

 const getStatusBadge = (status: string) => {
  const baseClasses =
    "px-3 py-1 rounded-full text-xs font-medium border font-[Poppins]";

  switch (status) {
    case "Requested":
      return `${baseClasses} text-yellow-600 bg-yellow-50 border-yellow-200`;

    case "Validated":
      return `${baseClasses} text-blue-600 bg-blue-50 border-blue-200`;

    case "Approved":
      return `${baseClasses} text-green-600 bg-green-50 border-green-200`;

    case "Rejected":
      return `${baseClasses} text-red-600 bg-red-50 border-red-200`;

    case "Pickup_Scheduled":
      return `${baseClasses} text-indigo-600 bg-indigo-50 border-indigo-200`;

    case "Pickup_Completed":
      return `${baseClasses} text-purple-600 bg-purple-50 border-purple-200`;

    case "Under_Inspection":
      return `${baseClasses} text-orange-600 bg-orange-50 border-orange-200`;

    case "Refund_Processed":
      return `${baseClasses} text-pink-600 bg-pink-50 border-pink-200`;

    case "Completed":
      return `${baseClasses} text-emerald-600 bg-emerald-50 border-emerald-200`;

    default:
      return `${baseClasses} text-gray-600 bg-gray-50 border-gray-200`;
  }
};

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRowId = (request: ReturnRequest, index: number) =>
    `${request._id}-${index}`;

  const allSelected =
    paginatedReturnRequests.length > 0 &&
    paginatedReturnRequests.every((r, idx) =>
      selectedClaims.includes(getRowId(r, idx))
    );

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedClaims([]);
    } else {
      const ids = paginatedReturnRequests.map((r, idx) => getRowId(r, idx));
      setSelectedClaims(ids);
    }
  };

  const handleSelectOne = (request: ReturnRequest, index: number) => {
    const id = getRowId(request, index);
    setSelectedClaims((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="w-full ">
      <Card className="shadow-sm rounded-none">
        {/* Header: Search and Filters */}
        <CardHeader className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-1">
              <div className="relative flex-1 w-full sm:max-w-md">
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  onClear={() => setSearchTerm("")}
                  placeholder="Search returns..."
                />
              </div>
              <SearchFiltersModal
                trigger={
                  <Button
                    variant="outline"
                    className="h-10 px-4 bg-white border-gray-200 w-full sm:w-auto"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                }
              />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-40 h-10 bg-white border-gray-200">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Requested">Requested</SelectItem>
                  <SelectItem value="Validated">Validated</SelectItem>
                  <SelectItem value="In_Progress">In Progress</SelectItem>
                  <SelectItem value="Pickup_Scheduled">
                    Pickup Scheduled
                  </SelectItem>
                  <SelectItem value="Pickup_Completed">
                    Pickup Completed
                  </SelectItem>
                  <SelectItem value="Under_Inspection">
                    Under Inspection
                  </SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Refund_Processed">
                    Refund_Processed
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-full sm:w-auto justify-end gap-3">
              {selectedClaims.length > 0 &&
                selectedClaims.some((id) => {
                  const returnId = id.split("-")[0];
                  const request = returnRequests.find(
                    (r) => r._id === returnId
                  );
                  return request?.returnStatus === "Requested";
                }) && (
                  <Button
                    onClick={() => {
                      // For now, validate the first selected claim
                      // In the future, you could implement bulk validation
                      const firstSelectedId = selectedClaims[0].split("-")[0];
                      handleOpenValidation(firstSelectedId);
                    }}
                    className="flex items-center gap-2 border-blue-400 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:border-blue-500 px-6 py-2 rounded-lg font-medium text-base h-10 shadow-none focus:ring-2 focus:ring-blue-100"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Validate Selected ({selectedClaims.length})
                  </Button>
                )}
              <Button className="flex items-center gap-2 border-red-400 text-red-600 bg-red-50 hover:bg-red-100 hover:border-red-500 px-6 py-2 rounded-lg font-medium text-base h-10 shadow-none focus:ring-2 focus:ring-red-100">
                Review Return
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Table */}
        <CardContent className="p-0">
          <div className="hidden sm:block overflow-x-auto">
            <Table className="min-w-full table-fixed">
              <TableHeader>
                <TableRow className="border-b border-[#E5E5E5] bg-gray-50/50">
                  <TableHead className="px-4 py-4 w-8 font-[Red Hat Display]">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] w-[120px]">
                    Return ID
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] w-[140px] cursor-pointer select-none">
                    Order ID
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] w-[140px] whitespace-nowrap">
                    SKU
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] w-[200px] whitespace-nowrap">
                    Customer
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] w-[140px] whitespace-nowrap overflow-hidden text-ellipsis">
                    Request Date
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] w-[90px] whitespace-nowrap">
                    Quantity
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] w-[220px] whitespace-nowrap overflow-hidden text-ellipsis">
                    Return Reason
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] w-[170px] whitespace-nowrap">
                    Status
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-right pr-8 font-[Red Hat Display] w-[120px] whitespace-nowrap">
                    Refund Amount
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-center font-[Red Hat Display] w-[80px] whitespace-nowrap">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
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
                          <Skeleton className="h-4 w-[100px]" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-4 w-[100px]" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-4 w-[160px]" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-4 w-[140px]" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-4 w-[120px]" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-4 w-[140px]" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-4 w-[80px]" />
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center">
                          <Skeleton className="h-8 w-8 rounded-full mx-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  : paginatedReturnRequests.map((request, index) => {
                      const rowId = getRowId(request, index);
                      const zebra =
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/30";
                      return (
                        <TableRow
                          key={`${rowId}`}
                          className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${zebra} cursor-pointer`}
                          onClick={() => handleOpenDetails(request._id)}
                        >
                          <TableCell className="px-4 py-4 w-8 font-[Poppins]" onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedClaims.includes(rowId)}
                              onCheckedChange={() =>
                                handleSelectOne(request, index)
                              }
                              aria-label="Select row"
                            />
                          </TableCell>
                          <TableCell className="px-6 py-4 font-[Poppins] whitespace-nowrap">
                            <span className="text-gray-900 b2 font-mono text-sm">
                              {request._id.slice(-8)}
                            </span>
                          </TableCell>
                          <TableCell
                            className="px-6 py-4 font-[Poppins] whitespace-nowrap max-w-[160px] truncate"
                            title={request.orderId?.orderId || "N/A"}
                          >
                            <span className="text-gray-700 b2">
                              {request.orderId?.orderId
                                ? request.orderId.orderId.length > 8
                                  ? request.orderId.orderId.slice(0, 8) + "..."
                                  : request.orderId.orderId
                                : "N/A"}
                            </span>
                          </TableCell>
                          <TableCell
                            className="px-6 py-4 font-[Poppins] whitespace-nowrap max-w-[140px] truncate"
                            title={request.sku}
                          >
                            <span className="text-gray-900 b2 font-mono">
                              {request.sku}
                            </span>
                          </TableCell>
                          <TableCell className="px-6 py-4 font-[Poppins] max-w-[200px]">
                            <div className="flex flex-col truncate">
                              <span className="text-gray-900 b2">
                                {request.orderId?.customerDetails?.name ||
                                  "N/A"}
                              </span>
                              <span className="text-gray-500 text-xs">
                                {request.orderId?.customerDetails?.email || ""}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4 font-[Poppins] whitespace-nowrap font-semibold text-[#000000]">
                            <span className="text-gray-700 b2">
                              {formatDate(request.createdAt)}
                            </span>
                          </TableCell>
                          <TableCell className="px-6 py-4 font-[Poppins] whitespace-nowrap font-semibold text-[#000000]">
                            <span className="text-gray-900 b2">
                              {request.quantity}
                            </span>
                          </TableCell>
                          <TableCell className="px-6 py-4 font-[Poppins]">
                            <div className="max-w-[220px] pr-4">
                              <span
                                className="text-gray-700 b2 truncate block"
                                title={request.returnReason}
                              >
                                {request.returnReason}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4 font-[Poppins]">
                            <span
                              className={getStatusBadge(request.returnStatus)}
                            >
                              {request.returnStatus}
                            </span>
                          </TableCell>
                          <TableCell className="px-6 py-4 font-[Poppins] whitespace-nowrap text-right">
                            <span className="text-gray-900 b2 font-semibold">
                              ₹{request.refund.refundAmount.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell className="px-6 py-4 text-center font-[Poppins]" onClick={(e) => e.stopPropagation()}>
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
                                {/* Always show details */}
                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  onClick={() => handleOpenDetails(request._id)}
                                >
                                  <Eye className="h-4 w-4 mr-2" /> View Details
                                </DropdownMenuItem>

                                {/* Validate → only when Requested */}
                                {request.returnStatus === "Requested" && (
                                  <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() =>
                                      handleOpenValidation(request._id)
                                    }
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />{" "}
                                    Validate
                                  </DropdownMenuItem>
                                )}

                                {/* Schedule Pickup → only when Validated */}
                                {request.returnStatus === "Validated" && (
                                  <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() =>
                                      handleOpenSchedulePickup(request._id)
                                    }
                                  >
                                    <Edit className="h-4 w-4 mr-2" /> Schedule
                                    Pickup
                                  </DropdownMenuItem>
                                )}

                                {/* Complete Pickup → only when Pickup_Scheduled */}
                                {request.returnStatus ===
                                  "Pickup_Scheduled" && (
                                  <>
                                    <div className="h-px bg-gray-200 mx-2" />
                                    <DropdownMenuItem
                                      className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                                      onClick={() =>
                                        handleOpenCompletePickup(request._id)
                                      }
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />{" "}
                                      Complete Pickup
                                    </DropdownMenuItem>
                                  </>
                                )}

                                {/* Inspect → when Pickup_Completed OR Under_Inspection */}
                                {(request.returnStatus === "Pickup_Completed" ||
                                  request.returnStatus ===
                                    "Under_Inspection") && (
                                  <>
                                    <div className="h-px bg-gray-200 mx-2" />
                                    <DropdownMenuItem
                                      className="cursor-pointer text-[#C72920] hover:text-[#c72820c0] font-medium"
                                      onClick={() =>
                                        handleOpenInspect(request._id)
                                      }
                                    >
                                      <Eye className="h-4 w-4 mr-2" /> Inspect
                                    </DropdownMenuItem>
                                  </>
                                )}

                                {/* Initiate Refund → only when Approved */}
                                {request.returnStatus === "Approved" && (
                                  <>
                                    <div className="h-px bg-gray-200 mx-2" />
                                    <DropdownMenuItem
                                      className="cursor-pointer text-green-600 hover:text-green-700 font-medium"
                                      onClick={() =>
                                        handleOpenInitiateRefund(request._id)
                                      }
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />{" "}
                                      Initiate Refund
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        {/* Pagination - consistent with CreatedProduct */}
        {filteredReturnRequests.length > 0 &&
          Math.ceil(filteredReturnRequests.length / itemsPerPage) > 1 && (
            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mt-8">
              <div className="text-sm text-gray-600 text-center sm:text-left">
                {`Showing ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(
                  currentPage * itemsPerPage,
                  filteredReturnRequests.length
                )} of ${filteredReturnRequests.length} returns`}
              </div>
              <div className="flex justify-center sm:justify-end">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                    {(() => {
                      const calculatedTotalPages = Math.ceil(
                        filteredReturnRequests.length / itemsPerPage
                      );
                      let pages: number[] = [];
                      if (calculatedTotalPages <= 3) {
                        pages = Array.from(
                          { length: calculatedTotalPages },
                          (_, i) => i + 1
                        );
                      } else if (currentPage <= 2) {
                        pages = [1, 2, 3];
                      } else if (currentPage >= calculatedTotalPages - 1) {
                        pages = [
                          calculatedTotalPages - 2,
                          calculatedTotalPages - 1,
                          calculatedTotalPages,
                        ];
                      } else {
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
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage((p) =>
                            Math.min(
                              Math.ceil(
                                filteredReturnRequests.length / itemsPerPage
                              ),
                              p + 1
                            )
                          )
                        }
                        className={
                          currentPage ===
                          Math.ceil(
                            filteredReturnRequests.length / itemsPerPage
                          )
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

        {/* Empty State */}
        {filteredReturnRequests.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center mt-6">
            <p className="text-gray-500 text-lg mb-2">
              No return requests found
            </p>
            <p className="text-gray-400 text-sm">
              Try adjusting your search terms or filters
            </p>
          </div>
        )}
        <ValidateReturnRequest
          open={validationDialog.open}
          onClose={handleCloseValidation}
          onValidationComplete={handleValidationComplete}
          returnId={validationDialog.returnId}
        />

        <SchedulePickupDialog
          open={schedulePickupDialog.open}
          onClose={handleCloseSchedulePickup}
          onScheduleComplete={handleSchedulePickupComplete}
          returnId={schedulePickupDialog.returnId}
          initialPickupAddress={
            schedulePickupDialog.returnRequest?.pickupRequest?.pickupAddress
          }
        />
        <CompletePickupDialog
          open={completePickupDialog.open}
          onClose={handleCloseCompletePickup}
          onComplete={handleCompletePickupComplete}
          returnId={completePickupDialog.returnId}
          returnRequest={completePickupDialog.returnRequest}
        />
        <InspectDialog
          open={inspectDialog.open}
          onClose={handleCloseInspect}
          onInspectComplete={handleInspectComplete}
          returnId={inspectDialog.returnId}
          returnStatus={inspectDialog.returnRequest?.returnStatus}
        />
        <InitiateRefundForm
          open={initiateRefundDialog.open}
          onClose={handleCloseInitiateRefund}
          returnId={initiateRefundDialog.returnId}
          onSubmit={() => handleInitiateRefundComplete(true)}
        />
      </Card>
    </div>
  );
}
