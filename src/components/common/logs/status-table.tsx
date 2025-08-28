"use client";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DynamicButton from "../button/button";
import SearchInput from "../search/SearchInput";
import { useAppSelector } from "@/store/hooks";
import { useCallback, useEffect, useState } from "react";
import useDebounce from "@/utils/useDebounce";
import { uploadLogs } from "@/service/product-Service";
import { useRouter } from "next/navigation";

const tableData = [
  {
    timeDate: "05 Jan 2025 / 11:00PM",
    status: "Reject",
    nameOfProduct: "Braking System",
    productId: "PD2345",
    skuCode: "TOP-BRK-000453",
    hsnCode: "87083000",
  },
  {
    timeDate: "05 Jan 2025 / 11:00PM",
    status: "Reject",
    nameOfProduct: "Braking System",
    productId: "PD2345",
    skuCode: "TOP-BRK-000453",
    hsnCode: "87083000",
  },
  {
    timeDate: "05 Jan 2025 / 11:00PM",
    status: "Reject",
    nameOfProduct: "Braking System",
    productId: "PD2345",
    skuCode: "TOP-BRK-000453",
    hsnCode: "87083000",
  },
  {
    timeDate: "05 Jan 2025 / 11:00PM",
    status: "Created",
    nameOfProduct: "Braking System",
    productId: "PD2345",
    skuCode: "TOP-BRK-000453",
    hsnCode: "87083000",
  },
  {
    timeDate: "05 Jan 2025 / 11:00PM",
    status: "Created",
    nameOfProduct: "Braking System",
    productId: "PD2345",
    skuCode: "TOP-BRK-000453",
    hsnCode: "87083000",
  },
  {
    timeDate: "05 Jan 2025 / 11:00PM",
    status: "Created",
    nameOfProduct: "Braking System",
    productId: "PD2345",
    skuCode: "TOP-BRK-000453",
    hsnCode: "87083000",
  },
  {
    timeDate: "05 Jan 2025 / 11:00PM",
    status: "Created",
    nameOfProduct: "Braking System",
    productId: "PD2345",
    skuCode: "TOP-BRK-000453",
    hsnCode: "87083000",
  },
  {
    timeDate: "05 Jan 2025 / 11:00PM",
    status: "Created",
    nameOfProduct: "Braking System",
    productId: "PD2345",
    skuCode: "TOP-BRK-000453",
    hsnCode: "87083000",
  },
];
// Format date as 'DD MMM YYYY / hh:mmA' (e.g., 05 Jan 2025 / 11:00PM)
import formatDate from "@/utils/formateDate";

export default function statusTable() {
  const [searchInput, setSearchInput] = useState(""); // Input field value
  const [searchQuery, setSearchQuery] = useState(""); // Actual search query for filtering
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<any>(null);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(
    null
  );
  const [logs, setLogs] = useState<any[]>([]);

  const auth = useAppSelector((state) => state.auth.user);
  const router = useRouter();
  const performSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setIsSearching(false);
  }, []);

  const { debouncedCallback: debouncedSearch, cleanup: cleanupDebounce } =
    useDebounce(performSearch, 500);

  useEffect(() => {
    async function handleUploadLogs() {
      try {
        const response = await uploadLogs();
        if (response) {
          console.log("Logs uploaded successfully:", response.data);
          setUploadMessage(response.data);
          setLogs(response.data.products || []);
        } else {
          console.error("Failed to upload logs");
        }
      } catch (error) {
        console.error("Failed to upload logs", error);
      }
    }

    handleUploadLogs();
  }, []);

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
  };
  // Use uploadMessage if it has data, otherwise fallback to tableData
  const rows =
    uploadMessage && uploadMessage.products && uploadMessage.products.length > 0 
      ? uploadMessage.products 
      : tableData;
  const rowToShow = logs ? (Array.isArray(logs) ? logs : []) : rows;

  // Calculate totals
  const uploadedCount = rows.filter(
    (row: any) => row.status === "Created" || row.status === "Completed"
  ).length;
  const rejectedCount = rows.filter((row: any) => row.status === "Reject").length;

  return (
    <div className="w-full">
      <Card className="shadow-sm rounded-none">
        <CardHeader className="space-y-4 sm:space-y-6">
          <div className="flex flex-col   w-full">
            <div className="flex flex-row  w-full border-b border-gray-200  ">
              <CardTitle className="text-[#000000] font-semibold text-lg ">
                Product Logs
              </CardTitle>
            </div>
            <div className="w-full mt-4 flex flex-row  justify-between items-center">
              <div className="flex flex-row gap-6 items-center ">
                <SearchInput
                  value={searchInput}
                  onChange={handleSearchChange}
                  onClear={handleClearSearch}
                  isLoading={isSearching}
                  placeholder="Search Spare parts"
                />
                <span className="text-[#1D1D1B] font-medium font-sans">
                  {` uploaded : ${uploadedCount}`}
                </span>
                <span className="text-[#1D1D1B] font-medium font-sans">
                  {` Rejected : ${rejectedCount}`}
                </span>
              </div>
              <div>
                <DynamicButton variant="default" text="Done" onClick={() => router.push('/user/dashboard/product')} />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-4">
          <div className=" bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-transparent">
                  <TableHead className="font-medium text-gray-700 font-sans">
                    Time Date
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Status
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Total No of Product
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Successful Uploads
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Failed Uploads
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Logs
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row: any, index: number) => (
                  <>
                    <TableRow
                      key={row._id || index}
                      className={
                        row.status === "Reject"
                          ? "bg-red-50 hover:bg-red-100"
                          : "bg-green-50 hover:bg-green-100"
                      }
                    >
                      <TableCell className="font-medium text-gray-900">
                        {formatDate(row.sessionTime, {
                          includeTime: true,
                          timeFormat: "12h",
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            row.status === "Reject"
                              ? "destructive"
                              : row.status === "Completed"
                              ? "default"
                              : "default"
                          }
                          className={
                            row.status === "Reject"
                              ? "bg-red-100 text-red-800 hover:bg-red-200"
                              : row.status === "Completed"
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }
                        >
                          {row.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-900">
                        {row.no_of_products}
                      </TableCell>
                      <TableCell className="text-gray-900">
                        {row.total_products_successful}
                      </TableCell>
                      <TableCell className="text-gray-900">
                        {row.total_products_failed}
                      </TableCell>
                      <TableCell className="text-gray-900">
                        <DynamicButton
                          variant="outline"
                          text={
                            expandedSessionId === (row._id || row.sessionId)
                              ? "Hide Logs"
                              : "View Logs"
                          }
                          onClick={() =>
                            setExpandedSessionId(
                              expandedSessionId === (row._id || row.sessionId)
                                ? null
                                : row._id || row.sessionId
                            )
                          }
                        />
                      </TableCell>
                    </TableRow>
                    {expandedSessionId === (row._id || row.sessionId) && (
                      <TableRow>
                        <TableCell colSpan={6} className="bg-gray-50 p-0">
                          <div className="p-4">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="font-medium text-gray-700">Log ID</TableHead>
                                  <TableHead className="font-medium text-gray-700">Product ID</TableHead>
                                  <TableHead className="font-medium text-gray-700">Message</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {(row.logs && row.logs.length > 0) ? (
                                  row.logs.map((log: any) => (
                                    <TableRow key={log._id}>
                                      <TableCell>{log._id}</TableCell>
                                      <TableCell>{log.productId || '-'}</TableCell>
                                      <TableCell>{log.message}</TableCell>
                                    </TableRow>
                                  ))
                                ) : (
                                  <TableRow>
                                    <TableCell colSpan={3} className="text-center">No logs found.</TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
