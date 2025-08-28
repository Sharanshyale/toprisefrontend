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
import { getCategories } from "@/service/product-Service";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";


export default function ShowCategory({ searchQuery }: { searchQuery: string }) {
    const [Categories, setCategories] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const itemPerPage = 10;

    // Filter categories by searchQuery with safe array operations
    const filteredCategories = React.useMemo(() => {
      if (!Categories || !Array.isArray(Categories)) return [];
      if (!searchQuery || !searchQuery.trim()) return Categories;
      
      const q = searchQuery.trim().toLowerCase();
      return Categories.filter((item) =>
        (item?.category_name?.toLowerCase().includes(q) ||
          item?.category_code?.toLowerCase().includes(q) ||
          item?.category_Status?.toLowerCase().includes(q))
      );
    }, [Categories, searchQuery]);

    const totalPages = Math.ceil(filteredCategories.length / itemPerPage);
    const paginatedData = filteredCategories.slice(
      (currentPage - 1) * itemPerPage,
      currentPage * itemPerPage
    );
   useEffect(() => {
      const fetchData = async () => {
          setLoading(true);
        try {
          const response = await getCategories();
          if (!response || !response.data) {
            console.error("No data found in response");
            setCategories([]);
            return;
          }
          const Items = response.data;
          setCategories(Array.isArray(Items) ? Items : []);
        } catch (err: any) {
          console.error("Error fetching data:", err);
          setCategories([]);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, []);

      if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Category</h2>
        <div className="flex justify-center items-center h-32">
          <div className="text-gray-500">Loading Categories...</div>
        </div>
      </div>
    );
  }

  // Safe check for data existence
  const hasData = paginatedData && Array.isArray(paginatedData) && paginatedData.length > 0;
  const totalItems = Categories && Array.isArray(Categories) ? Categories.length : 0;
   
  return (
     <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Category</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {hasData ? (
            paginatedData.map((item) => (
              <TableRow key={item?._id || Math.random()}>
                <TableCell>{item?.category_name || "No Title"}</TableCell>
                <TableCell>
                  {item?.category_code || "No Code"}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      item?.category_Status === "Created"
                        ? "bg-green-100 text-green-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {item?.category_Status || "Draft"}
                  </span>
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
                No categories found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination - moved outside of table */}
      {Categories.length > 0 && totalPages > 1 && (
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mt-8">
          {/* Left: Showing X-Y of Z categories */}
          <div className="text-sm text-gray-600 text-center sm:text-left">
            {`Showing ${(currentPage - 1) * itemPerPage + 1}-${Math.min(
              currentPage * itemPerPage,
              Categories.length
            )} of ${Categories.length} categories`}
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
  )
}
