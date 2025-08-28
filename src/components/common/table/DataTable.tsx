import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { DynamicPagination } from "@/components/common/pagination";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DataTableProps<T> {
  data: T[];
  loading: boolean;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  selectedItems: string[];
  onSelectItem: (id: string) => void;
  onSelectAll: () => void;
  allSelected: boolean;
  columns: {
    key: string;
    header: React.ReactNode;
    render?: (item: T) => React.ReactNode;
    className?: string;
    hideOnMobile?: boolean;
  }[];
  actions?: {
    label: string;
    onClick: (item: T) => void;
    icon?: React.ReactNode;
  }[];
  mobileCard?: (item: T) => React.ReactNode;
  emptyState?: React.ReactNode;
}

export default function DataTable<T extends { id: string }>({
  data,
  loading,
  currentPage,
  itemsPerPage,
  onPageChange,
  selectedItems,
  onSelectItem,
  onSelectAll,
  allSelected,
  columns,
  actions,
  mobileCard,
  emptyState,
}: DataTableProps<T>) {
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Mobile Loading */}
        <div className="block sm:hidden">
          <div className="space-y-4 p-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Card key={idx} className="p-4">
                <div className="flex items-start space-x-4">
                  <Skeleton className="w-5 h-5 rounded" />
                  <Skeleton className="w-16 h-12 rounded-md" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  <Skeleton className="w-8 h-8 rounded" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Desktop Loading */}
        <div className="hidden sm:block overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="border-b border-[#E5E5E5] bg-gray-50/50">
                <TableHead className="px-4 py-4 w-8">
                  <Skeleton className="w-5 h-5 rounded" />
                </TableHead>
                {columns.map((column, idx) => (
                  <TableHead
                    key={column.key}
                    className={`px-6 py-4 text-left ${
                      column.hideOnMobile ? "hidden md:table-cell" : ""
                    }`}
                  >
                    <Skeleton className="h-4 w-24" />
                  </TableHead>
                ))}
                {actions && (
                  <TableHead className="px-6 py-4 text-center min-w-[80px]">
                    <Skeleton className="h-4 w-16" />
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 10 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell className="px-4 py-4 w-8">
                    <Skeleton className="w-5 h-5 rounded" />
                  </TableCell>
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={`px-6 py-4 ${
                        column.hideOnMobile ? "hidden md:table-cell" : ""
                      }`}
                    >
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell className="px-6 py-4 text-center">
                      <Skeleton className="h-8 w-8 rounded" />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return emptyState || (
      <div className="flex justify-center items-center h-64 text-gray-500">
        No data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile Card View */}
      <div className="block sm:hidden">
        <div className="space-y-4 p-4">
          {mobileCard
            ? paginatedData.map((item) => (
                <div key={item.id}>
                  {mobileCard(item)}
                </div>
              ))
            : paginatedData.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-start space-x-4">
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={() => onSelectItem(item.id)}
                      aria-label="Select row"
                    />
                    <div className="flex-1 min-w-0">
                      {columns.slice(0, 2).map((column) => (
                        <div key={column.key} className="mb-2">
                          {column.render ? (
                            column.render(item)
                          ) : (
                            <span className="text-sm text-gray-900">
                              {(item as any)[column.key]}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    {actions && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {actions.map((action, idx) => (
                            <DropdownMenuItem
                              key={`${item.id}-${action.label}-${idx}`}
                              onClick={() => action.onClick(item)}
                              className="cursor-pointer"
                            >
                              {action.icon && <span className="mr-2">{action.icon}</span>}
                              {action.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </Card>
              ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="border-b border-[#E5E5E5] bg-gray-50/50">
              <TableHead className="px-4 py-4 w-8">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={onSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={`px-6 py-4 text-left font-[Red Hat Display] ${
                    column.hideOnMobile ? "hidden md:table-cell" : ""
                  } ${column.className || ""}`}
                >
                  {column.header}
                </TableHead>
              ))}
              {actions && (
                <TableHead className="px-6 py-4 text-center min-w-[80px] font-[Red Hat Display]">
                  Action
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((item, index) => (
              <TableRow
                key={item.id}
                className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                }`}
              >
                <TableCell className="px-4 py-4 w-8 font-[Poppins]">
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={() => onSelectItem(item.id)}
                    aria-label="Select row"
                  />
                </TableCell>
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={`px-6 py-4 font-[Red Hat Display] ${
                      column.hideOnMobile ? "hidden md:table-cell" : ""
                    } ${column.className || ""}`}
                  >
                    {column.render ? (
                      column.render(item)
                    ) : (
                      <span className="text-gray-700">
                        {(item as any)[column.key]}
                      </span>
                    )}
                  </TableCell>
                ))}
                {actions && (
                  <TableCell className="px-6 py-4 text-center font-[Red Hat Display]">
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
                        {actions.map((action, idx) => (
                          <DropdownMenuItem
                            key={`${item.id}-${action.label}-${idx}`}
                            className="cursor-pointer"
                            onClick={() => action.onClick(item)}
                          >
                            {action.icon && <span className="mr-2">{action.icon}</span>}
                            {action.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data.length > 0 && (
        <div className="mt-8 px-4 sm:px-6 pb-6">
          <DynamicPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            totalItems={data.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}
    </div>
  );
} 