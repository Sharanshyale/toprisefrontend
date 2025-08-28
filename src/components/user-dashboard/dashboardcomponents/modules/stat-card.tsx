import type React from "react"
import { Card } from "@/components/ui/card"

interface StatCardProps {
  title: string
  value: string | number
  color: string
  className?: string
  size?: "default" | "sm"
}

const StatCard: React.FC<StatCardProps> = ({ title, value, color, className = "", size = "default" }) => {
  const paddingClass = size === "sm" ? "p-3" : "p-4"
  const titleClass = size === "sm" ? "text-xs" : "b4"
  const valueClass = size === "sm" ? "text-base" : "h6"
  const iconSizeClass = size === "sm" ? "w-6 h-6" : "w-8 h-8"

  return (
    <Card className={`${paddingClass} bg-white border border-neutral-200 rounded-lg ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`${titleClass} text-neutral-600 mb-1`}>{title}</p>
          <p className={`${valueClass} text-neutral-1000 font-bold`}>{value}</p>
        </div>
        <div className={`${iconSizeClass} rounded-md flex-shrink-0`} style={{ backgroundColor: color }} />
      </div>
    </Card>
  )
}

export default StatCard
