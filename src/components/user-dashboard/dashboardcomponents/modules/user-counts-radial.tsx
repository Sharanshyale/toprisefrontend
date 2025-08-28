"use client"

import type React from "react"
import { ResponsiveContainer, RadialBarChart, RadialBar, Tooltip, PolarGrid, PolarAngleAxis } from "recharts"

interface UserCountsRadialProps {
  data: Array<{ name: string; value: number; color?: string }>
}

const RadialTooltip = ({ active, payload }: any) => {
  if (!active || !payload || payload.length === 0) return null

  const first = payload[0]
  const datum = first?.payload ?? {}
  const name: string = datum.name ?? ""
  const value: number = (first?.value as number) ?? (datum?.value as number)

  return (
    <div className="rounded-md border bg-white/95 px-3 py-2 text-xs shadow-md">
      <div className="font-medium">{name}</div>
      <div className="text-neutral-700">{value}</div>
    </div>
  )
}

const UserCountsRadial: React.FC<UserCountsRadialProps> = ({ data }) => {
  // Ensure each item has a color; fall back to a palette
  const palette = [
    "#6366F1",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#3B82F6",
    "#A855F7",
    "#F97316",
    "#22C55E",
  ]

  const chartData = data.map((d, i) => ({ ...d, fill: d.color ?? palette[i % palette.length] }))
  const maxValue = Math.max(1, ...chartData.map((d) => d.value))

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart data={chartData} innerRadius={30} outerRadius={110} startAngle={90} endAngle={-270}>
          <PolarGrid gridType="circle" />
          <PolarAngleAxis type="number" domain={[0, maxValue]} tick={false} />
          <Tooltip cursor={false} content={<RadialTooltip />} />
          <RadialBar dataKey="value" background barSize={10} cornerRadius={8} />
        </RadialBarChart>
      </ResponsiveContainer>

      <div className="flex flex-wrap justify-center gap-2 mt-3">
        {chartData.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1 text-xs">
            {/* <span className="text-neutral-700">{item.name}</span> */}
          </div>
        ))}
      </div>
    </div>
  )
}

export default UserCountsRadial

