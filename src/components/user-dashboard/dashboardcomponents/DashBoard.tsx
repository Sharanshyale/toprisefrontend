"use client"

import { useEffect, useMemo, useState } from "react"
import SearchInput from "@/components/common/search/SearchInput"
import StatCard from "./modules/stat-card"
import ManagementCard from "./modules/management-card"
import ChartCard from "./modules/chart-card"
import DonutChart from "./modules/donut-chart"
import CustomLineChart from "./modules/line-chart"
import UserCountsRadial from "./modules/user-counts-radial"
import UserCountsBar from "./modules/user-counts-bar"
import { fetchOrderStats, fetchProductStats, fetchEmployeeStats, fetchDealerStats, fetchOrderSummary, fetchUserCounts } from "@/service/dashboardServices"
import { ProductStatsResponse, EmployeeStatsResponse, DealerStatsResponse, UserCountsResponse } from "@/types/dashboard-Types"
import { OrderStatsResponse, OrderSummaryResponse, OrderSummaryPeriod } from "@/types/dashboard-Types"
import { Button } from "@/components/ui/button"
import DashboardShimmer from "./modules/DashboardShimmer"
import { Calendar } from "lucide-react"

export default function Dashboard() {
  const [searchValue, setSearchValue] = useState("")
  const [startDate, setStartDate] = useState<string>("2025-08-20")
  const [endDate, setEndDate] = useState<string>("2025-08-25")
  const [stats, setStats] = useState<OrderStatsResponse["data"] | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [productStats, setProductStats] = useState<ProductStatsResponse["data"] | null>(null)
  const [employeeSummary, setEmployeeSummary] = useState<EmployeeStatsResponse["data"]["summary"] | null>(null)
  const [dealerSummary, setDealerSummary] = useState<DealerStatsResponse["data"]["summary"] | null>(null)
  const [orderSummary, setOrderSummary] = useState<OrderSummaryResponse["data"] | null>(null)
  const [summaryPeriod, setSummaryPeriod] = useState<OrderSummaryPeriod>("week")
  const [userCounts, setUserCounts] = useState<UserCountsResponse["data"] | null>(null)

  useEffect(() => {
    let isMounted = true
    async function load() {
      try {
        setLoading(true)
        const [orderRes, productRes, employeeRes, dealerRes, summaryRes, userCountsRes] = await Promise.all([
          fetchOrderStats({ startDate, endDate }),
          fetchProductStats(),
          fetchEmployeeStats(),
          fetchDealerStats(),
          fetchOrderSummary(summaryPeriod),
          fetchUserCounts(),
        ])
        if (isMounted) {
          setStats(orderRes.data)
          setProductStats(productRes.data)
          setEmployeeSummary(employeeRes.data.summary)
          setDealerSummary(dealerRes.data.summary)
          setOrderSummary(summaryRes.data)
          setUserCounts(userCountsRes.data)
        }
      } catch (e) {
        // fail silently for now; could add toast
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    load()
    return () => {
      isMounted = false
    }
  }, [startDate, endDate, summaryPeriod])

  const orderStats = useMemo(() => {
    if (!stats) {
      return [
        { title: "Total Orders Today", value: "-", color: "#84ebb4" },
        { title: "Orders In Fulfillment", value: "-", color: "#ff5c02" },
        { title: "Orders Picked", value: "-", color: "#ffdb43" },
        { title: "Total Orders", value: "-", color: "#3B82F6" },
        { title: "Orders Delivered", value: "-", color: "#1fc16b" },
        { title: "Orders Cancelled", value: "-", color: "#fb3748" },
      ]
    }
    return [
      { title: "Total Orders", value: stats.totalOrders, color: "#3B82F6" },
      { title: "Total Orders Today", value: stats.todaysOrders, color: "#84ebb4" },
      { title: "Orders In Fulfillment", value: stats.statusCounts.Assigned, color: "#ff5c02" },
      { title: "Orders Picked", value: stats.statusCounts.Confirmed, color: "#ffdb43" },
      { title: "Orders Delivered", value: stats.statusCounts.Delivered, color: "#1fc16b" },
      { title: "Orders Cancelled", value: stats.statusCounts.Cancelled, color: "#fb3748" },
    ]
  }, [stats])

  const employeeStats = useMemo(() => {
    if (!employeeSummary) {
      return [
        { label: "Total Employees", value: "-", color: "#3B82F6" },
        { label: "Recently Active", value: "-", color: "#10B981" },
        { label: "With Dealers", value: "-", color: "#F59E0B" },
        { label: "With Regions", value: "-", color: "#EF4444" },
      ]
    }
    return [
      { label: "Total Employees", value: String(employeeSummary.totalEmployees), color: "#3B82F6" },
      { label: "Recently Active", value: String(employeeSummary.recentlyActiveEmployees), color: "#10B981" },
      { label: "With Dealers", value: String(employeeSummary.employeesWithDealers), color: "#F59E0B" },
      { label: "With Regions", value: String(employeeSummary.employeesWithRegions), color: "#EF4444" },
    ]
  }, [employeeSummary])

  const dealerStats = useMemo(() => {
    if (!dealerSummary) {
      return [
        { label: "Total Dealers", value: "-", color: "#3B82F6" },
        { label: "Active", value: "-", color: "#10B981" },
        { label: "Upload Access", value: "-", color: "#F59E0B" },
        { label: "Deactivated", value: "-", color: "#EF4444" },
      ]
    }
    return [
      { label: "Total Dealers", value: String(dealerSummary.totalDealers), color: "#3B82F6" },
      { label: "Active", value: String(dealerSummary.activeDealers), color: "#10B981" },
      { label: "Upload Access", value: String(dealerSummary.dealersWithUploadAccess), color: "#F59E0B" },
      { label: "Deactivated", value: String(dealerSummary.deactivatedDealers), color: "#EF4444" },
    ]
  }, [dealerSummary])

  const productData = useMemo(() => {
    if (!productStats) {
      return [
        { name: "APPROVED", value: 0, color: "#6366f1" },
        { name: "PENDING", value: 0, color: "#f97316" },
        { name: "CREATED", value: 0, color: "#10b981" },
        { name: "REJECTED", value: 0, color: "#ef4444" },
      ]
    }
    return [
      { name: "APPROVED", value: productStats.approved, color: "#6366f1" },
      { name: "PENDING", value: productStats.pending, color: "#f97316" },
      { name: "CREATED", value: productStats.created, color: "#10b981" },
      { name: "REJECTED", value: productStats.rejected, color: "#ef4444" },
    ]
  }, [productStats])

  // Map API timeSeriesData to chart lines: value1 = currentOrders, value2 = previousOrders
  const chartData = useMemo(() => {
    if (!orderSummary) {
      return [] as Array<{ name: string; value1: number; value2: number; amount1?: number; amount2?: number }>
    }
    return orderSummary.timeSeriesData.map((p) => ({
      name: p.label,
      value1: p.currentOrders,
      value2: p.previousOrders,
      amount1: p.currentAmount,
      amount2: p.previousAmount,
    }))
  }, [orderSummary])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-8xl mx-auto space-y-6">
        {loading ? (
          <DashboardShimmer />
        ) : (
          <>
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <SearchInput
            value={searchValue}
            onChange={setSearchValue}
            onClear={() => setSearchValue("")}
            placeholder="Search Spare parts"
            className="w-full sm:max-w-md"
          />

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <div className="flex items-center gap-2 h-10 rounded-lg bg-white border border-neutral-200 px-4 py-0 shadow-sm">
                <Calendar className="h-4 w-4 text-neutral-500 flex-shrink-0" />
                <input
                  type="date"
                  className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-neutral-700 placeholder:text-neutral-500 h-10 p-0 flex-1 outline-none text-sm"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>
            <div className="relative w-full sm:w-auto">
              <div className="flex items-center gap-2 h-10 rounded-lg bg-white border border-neutral-200 px-4 py-0 shadow-sm">
                <Calendar className="h-4 w-4 text-neutral-500 flex-shrink-0" />
                <input
                  type="date"
                  className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-neutral-700 placeholder:text-neutral-500 h-10 p-0 flex-1 outline-none text-sm"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Order Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {orderStats.map((stat, index) => (
            <StatCard key={index} className="p-3" title={stat.title} value={stat.value} color={stat.color} />
          ))}
        </div>

        {/* Management + Product Grid: Responsive layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[50%_20%_28%] gap-4">
          {/* Row 1, Col 1 */}
          <div className="space-y-4">
            <ManagementCard title="Employee Management" stats={employeeStats} className="p-4 rounded-[15px]" />
            <ManagementCard title="Dealer Management" stats={dealerStats} className="p-4 rounded-[15px]" />
          </div>
          
          {/* Middle Column - Customer Management and Return Rate */}
          <div className="space-y-4">
            <ChartCard
              title="User Counts"
              value={userCounts ? userCounts.total.toLocaleString() : undefined}
              className="rounded-[15px]"
              contentClassName="h-64 sm:h-60"
              hideActions
            >
              <UserCountsBar
                data={[
                  { name: "Users", value: userCounts?.Users ?? 0 },
                  { name: "Dealers", value: userCounts?.Dealers ?? 0 },
                  { name: "SuperAdmins", value: userCounts?.SuperAdmins ?? 0 },
                  { name: "Fulfillment Admins", value: userCounts?.FulfillmentAdmins ?? 0 },
                  { name: "Fulfillment Staffs", value: userCounts?.FulfillmentStaffs ?? 0 },
                  { name: "Inventory Admins", value: userCounts?.InventoryAdmins ?? 0 },
                  { name: "Inventory Staffs", value: userCounts?.InventoryStaffs ?? 0 },
                  { name: "Support", value: userCounts?.Customer_Support ?? 0 },
                ]}
              />
            </ChartCard>
          </div>
          
          {/* Col 3 spans both rows */}
          <ChartCard 
            title="Product Management" 
            className="lg:row-span-2 w-full" 
            contentClassName="h-50"
          >
            <DonutChart
              data={productData}
              centerValue={(productStats?.total ?? 0).toString()}
              centerLabel="PRODUCTS"
            />
          </ChartCard>
        </div>

        {/* Bottom Row - Order Summary Widget */}
        <div className="grid grid-cols-1 gap-4">
          <ChartCard
            title="Order Summary"
            value={orderSummary ? orderSummary.summary.currentTotalAmount.toLocaleString() : undefined}
            change={orderSummary ? orderSummary.summary.comparisonText : undefined}
            changeType={orderSummary && orderSummary.summary.amountPercentageChange < 0 ? "negative" : "positive"}
            className="w-full lg:w-[72%] rounded-[15px] p-2"
            contentClassName="h-56"
            compactHeader
            rightNode={
              <div className="flex flex-wrap gap-1">
                {orderSummary && (
                  <div className="hidden sm:flex items-center text-xs text-neutral-600 mr-2">
                    <span className="font-medium mr-1">Orders:</span>
                    <span className="font-semibold text-neutral-900">{orderSummary.summary.currentTotalOrders}</span>
                  </div>
                )}
                <Button
                  size="sm"
                  variant={summaryPeriod === "week" ? "default" : "outline"}
                  onClick={() => setSummaryPeriod("week")}
                  className="h-7 px-2"
                >
                  Week
                </Button>
                <Button
                  size="sm"
                  variant={summaryPeriod === "month" ? "default" : "outline"}
                  onClick={() => setSummaryPeriod("month")}
                  className="h-7 px-2"
                >
                  Month
                </Button>
              </div>
            }
          >
            <CustomLineChart data={chartData} />
          </ChartCard>
        </div>
          </>
        )}
      </div>
    </div>
  )
}
