import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getSubCategories } from "@/service/product-Service";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export default function SubCategory({ searchQuery }: { searchQuery: string }) {
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemPerPage = 10;

  // Filter subcategories by searchQuery with safe array operations
  const filteredSubCategories = React.useMemo(() => {
    if (!subCategories || !Array.isArray(subCategories)) return [];
    if (!searchQuery || !searchQuery.trim()) return subCategories;
    
    const q = searchQuery.trim().toLowerCase();
    return subCategories.filter((item) =>
      (item?.subcategory_name?.toLowerCase().includes(q) ||
        item?.subcategory_status?.toLowerCase().includes(q) ||
        item?.category_ref?.category_name?.toLowerCase().includes(q))
    );
  }, [subCategories, searchQuery]);

  const totalPages = Math.ceil(filteredSubCategories.length / itemPerPage);
  const paginatedData = filteredSubCategories.slice(
    (currentPage - 1) * itemPerPage,
    currentPage * itemPerPage
  );
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getSubCategories();
        if (!response || !response.data) {
          console.error("No data found in response");
          setSubCategories([]);
          return;
        }
        const Items = response.data;
        setSubCategories(Array.isArray(Items) ? Items : []);
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setSubCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">SubCategory</h2>
        <div className="flex justify-center items-center h-32">
          <div className="text-gray-500">Loading subcategories...</div>
        </div>
      </div>
    );
  }

  // Safe check for data existence
  const hasData = paginatedData && Array.isArray(paginatedData) && paginatedData.length > 0;
  const totalItems = subCategories && Array.isArray(subCategories) ? subCategories.length : 0;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">SubCategory</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {hasData ? (
            paginatedData.map((item) => (
              <TableRow key={item?._id || Math.random()}>
                <TableCell>{item?.subcategory_name || "No Title"}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      item?.subcategory_status === "Created"
                        ? "bg-green-100 text-green-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {item?.subcategory_status || "Draft"}
                  </span>
                </TableCell>
                <TableCell>
                  {item?.category_ref?.category_name || "No Category"}
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                No subcategories found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination - moved outside of table */}
      {subCategories.length > 0 && totalPages > 1 && (
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mt-8">
          {/* Left: Showing X-Y of Z subcategories */}
          <div className="text-sm text-gray-600 text-center sm:text-left">
            {`Showing ${(currentPage - 1) * itemPerPage + 1}-${Math.min(
              currentPage * itemPerPage,
              subCategories.length
            )} of ${subCategories.length} subcategories`}
          </div>
          {/* Pagination Controls */}
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
                {Array.from({ length: Math.min(totalPages, 3) }).map(
                  (_, idx) => {
                    let pageNum;
                    if (totalPages <= 3) {
                      pageNum = idx + 1;
                    } else if (currentPage <= 2) {
                      pageNum = idx + 1;
                    } else if (currentPage >= totalPages - 1) {
                      pageNum = totalPages - 2 + idx;
                    } else {
                      pageNum = currentPage - 1 + idx;
                    }

                    // Prevent out-of-bounds pageNum
                    if (pageNum < 1 || pageNum > totalPages) return null;

                    return (
                      <PaginationItem
                        key={pageNum}
                        className="hidden sm:block"
                      >
                        <PaginationLink
                          isActive={currentPage === pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                )}
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    className={
                      currentPage === totalPages
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
    </div>
  );
}
