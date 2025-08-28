"use client"

import type React from "react"
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, LabelList, Tooltip } from "recharts"

interface UserCountsBarProps {
	data: Array<{ name: string; value: number }>
}

const BarTooltip = ({ active, payload }: any) => {
	if (!active || !payload || payload.length === 0) return null
	const item = payload[0]
	const name: string = item?.payload?.name ?? ""
	const value: number = item?.value ?? 0
	return (
		<div className="rounded-md border bg-white/95 px-3 py-2 text-xs shadow-md">
			<div className="font-medium">{name}</div>
			<div className="text-neutral-700">{value}</div>
		</div>
	)
}

const UserCountsBar: React.FC<UserCountsBarProps> = ({ data }) => {
	return (
		<div className="w-full h-full">
			<ResponsiveContainer width="100%" height="100%">
				<BarChart data={data} margin={{ top: 12, right: 8, left: 8, bottom: 0 }}>
					<CartesianGrid vertical={false} stroke="#E5E7EB" />
					<XAxis dataKey="name" tick={false} tickLine={false} axisLine={false} />
					<Tooltip cursor={{ fill: "rgba(0,0,0,0.03)" }} content={<BarTooltip />} />
					<Bar dataKey="value" fill="#3B82F6" radius={6}>
						<LabelList position="top" offset={8} className="fill-foreground" fontSize={12} />
					</Bar>
				</BarChart>
			</ResponsiveContainer>
		</div>
	)
}

export default UserCountsBar

