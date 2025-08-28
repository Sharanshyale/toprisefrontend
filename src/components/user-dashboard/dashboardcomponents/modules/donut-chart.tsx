"use client"

import type React from "react"
import { useMemo, useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface DonutChartProps {
  data: Array<{
    name: string
    value: number
    color: string
  }>
  centerValue?: string
  centerLabel?: string
}

const CustomTooltip = ({ active, payload, total, data, activeIndex }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0]
    const name: string = item?.name ?? item?.payload?.name
    const value: number = item?.value ?? item?.payload?.value
    const percent = total > 0 ? Math.round((value / total) * 1000) / 10 : 0
    return (
      <div className="rounded-md border bg-white/95 px-3 py-2 text-xs shadow-md">
        <div className="font-medium mb-1">{name}</div>
        <div className="text-neutral-700 mb-2">{value} ({percent}%)</div>
        <div className="grid grid-cols-1 gap-1">
          {Array.isArray(data) && data.map((d: any, idx: number) => {
            const pct = total > 0 ? Math.round((d.value / total) * 1000) / 10 : 0
            const isActive = idx === activeIndex
            return (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className={isActive ? "font-semibold" : ""}>{d.name}</span>
                </div>
                <span className={isActive ? "font-semibold" : "text-neutral-700"}>{d.value} ({pct}%)</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
  return null
}

const DonutChart: React.FC<DonutChartProps> = ({ data, centerValue, centerLabel }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data])
  const activeItem = activeIndex !== null ? data[activeIndex] : null
  return (
    <div className="relative w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip total={total} data={data} activeIndex={activeIndex} />} />
        </PieChart>
      </ResponsiveContainer>

      {centerValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="h5 text-neutral-1000 font-bold">{activeItem ? activeItem.value : centerValue}</p>
            <p className="b4 text-neutral-600 uppercase tracking-wide">{activeItem ? activeItem.name : (centerLabel ?? "")}</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {data.map((item, index) => (
          <div
            key={index}
            className="px-2 py-1 rounded text-white text-xs font-medium"
            style={{ backgroundColor: item.color }}
          >
            {item.name}: {item.value}
          </div>
        ))}
      </div>
    </div>
  )
}

export default DonutChart
