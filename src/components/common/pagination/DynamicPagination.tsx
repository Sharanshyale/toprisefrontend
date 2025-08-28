import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface DynamicPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
  className?: string;
  showItemsInfo?: boolean;
}

export default function DynamicPagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  className = "",
  showItemsInfo = true,
}: DynamicPaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getVisiblePages = () => {
    const pages: number[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages if total is 5 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else if (currentPage <= 3) {
      // Show first 5 pages
      for (let i = 1; i <= Math.min(maxVisible, totalPages); i++) {
        pages.push(i);
      }
    } else if (currentPage >= totalPages - 2) {
      // Show last 5 pages
      for (let i = Math.max(1, totalPages - 4); i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show current page and neighbors
      for (let i = currentPage - 2; i <= currentPage + 2; i++) {
        if (i >= 1 && i <= totalPages) {
          pages.push(i);
        }
      }
    }

    return pages;
  };

  return (
    <div className={`flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 px-6 py-4 ${className}`}>
      {/* Items info - Left side */}
      {showItemsInfo && (
        <div className="text-sm text-gray-600 text-center sm:text-left">
          {`Showing ${startItem}-${endItem} of ${totalItems} items`}
        </div>
      )}

      {/* Pagination Controls - Right side */}
      <div className={`flex ${showItemsInfo ? 'justify-center sm:justify-end' : 'justify-center'}`}>
        <Pagination>
          <PaginationContent className="gap-1">
            <PaginationItem>
              <PaginationPrevious
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer hover:bg-gray-100"
                }
              />
            </PaginationItem>

            {getVisiblePages().map((pageNum) => (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  isActive={currentPage === pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`cursor-pointer min-w-[40px] h-[40px] flex items-center justify-center ${
                    currentPage === pageNum
                      ? "bg-white border-2 border-gray-900 text-gray-900 font-medium"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer hover:bg-gray-100"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
} 