import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getvarient } from "@/service/product-Service";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export default function ShowVarient({ searchQuery }: { searchQuery: string }) {
    const [variants, setVariants] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const itemPerPage = 10;

    // Filter variants by searchQuery with safe array operations
    const filteredVariants = React.useMemo(() => {
        if (!variants || !Array.isArray(variants)) return [];
        if (!searchQuery || !searchQuery.trim()) return variants;
        
        const q = searchQuery.trim().toLowerCase();
        return variants.filter((item) =>
            (item?.variant_name?.toLowerCase().includes(q) ||
                item?.model?.model_name?.toLowerCase().includes(q) ||
                item?.variant_status?.toLowerCase().includes(q))
        );
    }, [variants, searchQuery]);

    // Safe pagination calculations
    const totalPages = Math.ceil((filteredVariants?.length || 0) / itemPerPage);
    const paginatedData = React.useMemo(() => {
        if (!filteredVariants || !Array.isArray(filteredVariants)) return [];
        return filteredVariants.slice(
            (currentPage - 1) * itemPerPage,
            currentPage * itemPerPage
        );
    }, [filteredVariants, currentPage, itemPerPage]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await getvarient();
                if (!response || !response.data) {
                    console.error("No data found in response");
                    setVariants([]);
                    return;
                }
                setVariants(Array.isArray(response.data) ? response.data : []);
            } catch (err: any) {
                console.error("Error fetching data:", err);
                setVariants([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Variants</h2>
                <div className="flex justify-center items-center h-32">
                    <div className="text-gray-500">Loading Variants...</div>
                </div>
            </div>
        );
    }

    // Safe check for data existence
    const hasData = paginatedData && Array.isArray(paginatedData) && paginatedData.length > 0;
    const totalItems = variants && Array.isArray(variants) ? variants.length : 0;

    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Variants</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Variant Name</TableHead>
                        <TableHead>Model Name</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {hasData ? (
                        paginatedData.map((item) => (
                            <TableRow key={item?._id || Math.random()}>
                                <TableCell>{item?.variant_name || "No Name"}</TableCell>
                                <TableCell>{item?.model?.model_name || "No Model"}</TableCell>
                                <TableCell>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                            item?.variant_status === "active"
                                                ? "bg-green-100 text-green-800"
                                                : item?.variant_status === "inactive"
                                                    ? "bg-orange-100 text-orange-800"
                                                    : "bg-gray-200 text-gray-700"
                                        }`}
                                    >
                                        {item?.variant_status || "No Status"}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                                No variants found
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Pagination - with safe checks */}
            {totalItems > 0 && totalPages > 1 && (
                <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mt-8">
                    {/* Left: Showing X-Y of Z variants */}
                    <div className="text-sm text-gray-600 text-center sm:text-left">
                        {`Showing ${(currentPage - 1) * itemPerPage + 1}-${Math.min(
                            currentPage * itemPerPage,
                            totalItems
                        )} of ${totalItems} variants`}
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
