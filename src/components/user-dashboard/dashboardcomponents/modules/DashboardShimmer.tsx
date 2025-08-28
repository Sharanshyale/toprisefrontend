"use client"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar } from "lucide-react"

interface DashboardShimmerProps {
  className?: string
}

export default function DashboardShimmer({ className = "" }: DashboardShimmerProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-2">
        <div className="w-full sm:max-w-md">
          <div className="flex items-center gap-2 h-10 rounded-lg bg-[#EBEBEB] px-4 py-0 shadow-sm">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <div className="flex items-center gap-2 h-10 rounded-lg bg-white border border-neutral-200 px-4 py-0 shadow-sm">
              <Calendar className="h-4 w-4 text-neutral-300 flex-shrink-0" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="relative w-full sm:w-auto">
            <div className="flex items-center gap-2 h-10 rounded-lg bg-white border border-neutral-200 px-4 py-0 shadow-sm">
              <Calendar className="h-4 w-4 text-neutral-300 flex-shrink-0" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      </div>

      {/* Order Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <Card key={idx} className="p-3 bg-white border border-neutral-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </Card>
        ))}
      </div>

      {/* Management + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[50%_20%_28%] gap-4">
        {/* Col 1 */}
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, idx) => (
            <Card key={idx} className="p-4 rounded-[15px] bg-white border border-neutral-200">
              <div className="mb-3">
                <Skeleton className="h-4 w-40" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((__, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-6 rounded" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-1 w-full" />
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Col 2 */}
        <Card className="p-3 rounded-[15px] bg-white border border-neutral-200">
          <div className="mb-2">
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-56 w-full" />
        </Card>

        {/* Col 3 spans two rows */}
        <Card className="p-3 lg:row-span-2 w-full rounded-[15px] bg-white border border-neutral-200">
          <div className="mb-2">
            <Skeleton className="h-4 w-44" />
          </div>
          <div className="flex items-center justify-center h-[200px]">
            <div className="relative">
              <Skeleton className="h-40 w-40 rounded-full" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Row - Order Summary */}
      <div className="grid grid-cols-1 gap-4">
        <Card className="w-full lg:w-[72%] rounded-[15px] p-2 bg-white border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="flex gap-2 items-center">
              <Skeleton className="h-7 w-16 rounded" />
              <Skeleton className="h-7 w-16 rounded" />
            </div>
          </div>
          <Skeleton className="h-56 w-full" />
        </Card>
      </div>
    </div>
  )
}

