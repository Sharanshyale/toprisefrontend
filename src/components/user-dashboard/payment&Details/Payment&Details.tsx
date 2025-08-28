"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SearchInput from "@/components/common/search/SearchInput";
import DynamicButton from "@/components/common/button/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useDebounce from "@/utils/useDebounce";
import DynamicPagination from "@/components/common/pagination/DynamicPagination";
import { getPaymentDetails } from "@/service/payment-service";
import { PaymentDetail, PaymentDetailsResponse, PaymentPagination } from "@/types/paymentDetails-Types";

// Using PaymentDetail interface from types file instead of local interface

export default function PaymentDetails() {
  const router = useRouter();
  const [payments, setPayments] = useState<PaymentDetail[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Sorting state
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  // Pagination state from server
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  // Fetch payments with pagination
  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        setLoading(true);
        const response = await getPaymentDetails(currentPage, itemsPerPage);
        
        if (response.data?.data) {
          setPayments(response.data.data);
          setTotalPages(response.data.pagination.totalPages);
          setTotalItems(response.data.pagination.totalItems);
        } else {
          console.warn("Invalid response structure:", response);
          setPayments([]);
          setTotalPages(0);
          setTotalItems(0);
        }
      } catch (error) {
        console.log("error in payment details", error);
        setPayments([]);
        setTotalPages(0);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    };
    fetchPaymentDetails();
  }, [currentPage]);
  // Removed mock data - now using real API data

  // Filter and sort payments (client-side for current page)
  const filteredAndSortedPayments = useMemo(() => {
    let currentPayments = [...payments];

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      currentPayments = currentPayments.filter(
        (payment) =>
          payment.payment_id?.toLowerCase().includes(q) ||
          payment.razorpay_order_id?.toLowerCase().includes(q) ||
          payment.payment_method?.toLowerCase().includes(q) ||
          payment.payment_status?.toLowerCase().includes(q)
      );
    }

    // Sort payments
    if (sortField) {
      currentPayments.sort((a: any, b: any) => {
        let aValue: any;
        let bValue: any;
        
        switch (sortField) {
          case "payment_id":
            aValue = a.payment_id?.toLowerCase() || "";
            bValue = b.payment_id?.toLowerCase() || "";
            break;
          case "razorpay_order_id":
            aValue = a.razorpay_order_id?.toLowerCase() || "";
            bValue = b.razorpay_order_id?.toLowerCase() || "";
            break;
          case "created_at":
            aValue = new Date(a.created_at).getTime();
            bValue = new Date(b.created_at).getTime();
            break;
          case "amount":
            aValue = a.amount || 0;
            bValue = b.amount || 0;
            break;
          case "payment_status":
            aValue = a.payment_status?.toLowerCase() || "";
            bValue = b.payment_status?.toLowerCase() || "";
            break;
          case "payment_method":
            aValue = a.payment_method?.toLowerCase() || "";
            bValue = b.payment_method?.toLowerCase() || "";
            break;
          case "is_refund":
            aValue = a.is_refund ? 1 : 0;
            bValue = b.is_refund ? 1 : 0;
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
    
    return currentPayments;
  }, [payments, searchQuery, sortField, sortDirection]);

  // Use filtered payments directly (no additional pagination since server handles it)
  const paginatedData = filteredAndSortedPayments;

  // Removed old mock data useEffect

  // Debounced search functionality
  const performSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (currentPage !== 1) {
      setCurrentPage(1); // Reset to first page when searching
    }
    setIsSearching(false);
  }, [currentPage]);

  const { debouncedCallback: debouncedSearch } = useDebounce(performSearch, 500);

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setIsSearching(value.trim() !== "");
    debouncedSearch(value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setIsSearching(false);
    setCurrentPage(1);
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

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ChevronUp className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === "asc" ? 
      <ChevronUp className="w-4 h-4 text-[#C72920]" /> : 
      <ChevronDown className="w-4 h-4 text-[#C72920]" />;
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded text-xs font-medium";
    switch (status.toLowerCase()) {
      case "paid":
        return `${baseClasses} text-green-700 bg-green-100`;
      case "created":
      case "pending":
        return `${baseClasses} text-yellow-700 bg-yellow-100`;
      case "failed":
        return `${baseClasses} text-red-700 bg-red-100`;
      case "refunded":
        return `${baseClasses} text-blue-700 bg-blue-100`;
      default:
        return `${baseClasses} text-gray-700 bg-gray-100`;
    }
  };

  // Handle opening payment details page
  const handleViewPaymentDetails = (paymentId: string) => {
    router.push(`/user/dashboard/paymentDetails/${paymentId}`);
  };

  return (
    <div className="w-full">
      <Card className="shadow-sm rounded-none">
        {/* Header */}
        <CardHeader className="space-y-4 sm:space-y-6">
          <CardTitle className="text-[#000000] font-bold text-lg font-sans">
            <span>Payment & Details</span>
          </CardTitle>

          {/* Search and Filters */}
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 gap-4 w-full">
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:gap-3 w-full lg:w-auto">
              <SearchInput
                placeholder="Search payments"
                value={searchInput}
                onChange={handleSearchChange}
                onClear={handleClearSearch}
                isLoading={isSearching}
              />
              <div className="flex gap-2 sm:gap-3">
                <DynamicButton
                  variant="outline"
                  text="Filters"
                  icon={<Filter className="h-4 w-4 mr-2" />}
                />
              </div>
            </div>
          </div>

          {/* Payments Section Header */}
          <div className="mb-4">
            <CardTitle className="font-sans font-bold text-lg text-[#000000]">
              Payments
            </CardTitle>
            <CardDescription className="text-sm text-[#737373] font-medium font-sans">
              Manage your payment details and transactions
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="hidden sm:block overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="border-b border-[#E5E5E5] bg-gray-50/50">
                  <TableHead className="px-4 py-4 w-8 font-[Red Hat Display]">
                    <Checkbox aria-label="Select all" />
                  </TableHead>
                  <TableHead 
                    className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer hover:text-[#C72920] transition-colors"
                    onClick={() => handleSort("payment_id")}
                  >
                    <div className="flex items-center gap-1">
                      Payment ID
                      {getSortIcon("payment_id")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer hover:text-[#C72920] transition-colors"
                    onClick={() => handleSort("razorpay_order_id")}
                  >
                    <div className="flex items-center gap-1">
                      Razorpay Order ID
                      {getSortIcon("razorpay_order_id")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer hover:text-[#C72920] transition-colors"
                    onClick={() => handleSort("created_at")}
                  >
                    <div className="flex items-center gap-1">
                      Date
                      {getSortIcon("created_at")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer hover:text-[#C72920] transition-colors"
                    onClick={() => handleSort("amount")}
                  >
                    <div className="flex items-center gap-1">
                      Amount
                      {getSortIcon("amount")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer hover:text-[#C72920] transition-colors"
                    onClick={() => handleSort("payment_method")}
                  >
                    <div className="flex items-center gap-1">
                      Payment Method
                      {getSortIcon("payment_method")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer hover:text-[#C72920] transition-colors"
                    onClick={() => handleSort("is_refund")}
                  >
                    <div className="flex items-center gap-1">
                      Refund Status
                      {getSortIcon("is_refund")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer hover:text-[#C72920] transition-colors"
                    onClick={() => handleSort("payment_status")}
                  >
                    <div className="flex items-center gap-1">
                      Payment Status
                      {getSortIcon("payment_status")}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: itemsPerPage }).map((_, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="px-4 py-4 w-8">
                          <Skeleton className="w-5 h-5 rounded" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-4 w-3/4" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-4 w-1/2" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-4 w-3/4" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-4 w-1/2" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-4 w-1/2" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-4 w-1/2" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-6 w-16 rounded" />
                        </TableCell>
                      </TableRow>
                    ))
                                      : paginatedData.map((payment) => (
                      <TableRow 
                        key={payment._id}
                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handleViewPaymentDetails(payment._id)}
                      >
                        <TableCell 
                          className="px-4 py-4 w-8"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox />
                        </TableCell>
                        <TableCell className="px-6 py-4 font-medium">
                          {payment.payment_id || 'N/A'}
                        </TableCell>
                        <TableCell className="px-6 py-4 font-medium">
                          {payment.razorpay_order_id}
                        </TableCell>
                        <TableCell className="px-6 py-4 font-semibold text-[#000000] font-sans">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="px-6 py-4 font-semibold text-[#000000]">
                          ₹{payment.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="px-6 py-4 font-semibold text-[#000000]">
                          {payment.payment_method}
                        </TableCell>
                        <TableCell className="px-6 py-4 font-semibold text-[#000000]">
                          {payment.is_refund ? 'Yes' : 'No'}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <span className={getStatusBadge(payment.payment_status)}>
                            {payment.payment_status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {totalItems > 0 && totalPages > 1 && (
            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mt-8 px-6 pb-6">
              {/* Left: Showing X-Y of Z payments */}
              <div className="text-sm text-gray-600 text-center sm:text-left">
                {`Showing ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(
                  currentPage * itemsPerPage,
                  totalItems
                )} of ${totalItems} payments`}
              </div>
                             {/* Right: Pagination Controls */}
               <DynamicPagination
                 currentPage={currentPage}
                 totalPages={totalPages}
                 onPageChange={setCurrentPage}
                 totalItems={totalItems}
                 itemsPerPage={itemsPerPage}
                 showItemsInfo={false}
               />
            </div>
          )}
        </CardContent>
        
        {/* Empty State */}
        {paginatedData.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-500 text-lg mb-2">No payments found</p>
            <p className="text-gray-400 text-sm">
              Try adjusting your search terms
            </p>
          </div>
        )}
      </Card>
      

    </div>
  );
}
