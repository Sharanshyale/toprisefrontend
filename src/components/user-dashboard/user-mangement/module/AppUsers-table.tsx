"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronDown, ChevronUp, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppSelector } from "@/store/hooks"
import { getAllAppUsers,  } from "@/service/user-service"
import formatDate from "@/utils/formateDate"
import { AppUser } from "@/types/user-types"
import UserDetailsDialog from "./UserDetailsDialog"
import DynamicPagination from "@/components/common/pagination/DynamicPagination"

interface AppUsersTableProps {
	search?: string
	role?: string
	status?: string
	sortField?: string
	sortDirection?: "asc" | "desc"
	onSort?: (field: string) => void
}

export default function AppUsersTable({
	search = "",
	role = "",
	status = "",
	sortField = "",
	sortDirection = "asc",
	onSort,
}: AppUsersTableProps) {
	const [users, setUsers] = useState<AppUser[]>([])
	const [loading, setLoading] = useState(true)
	const [currentPage, setCurrentPage] = useState(1)
	const itemsPerPage = 10
	const auth = useAppSelector((state) => state.auth.user)
    const [detailsOpen, setDetailsOpen] = useState(false)
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

	useEffect(() => {
		const fetchUsers = async () => {
			setLoading(true)
			try {
				const res = await getAllAppUsers()
				setUsers(res.data || [])
			} finally {
				setLoading(false)
			}
		}
		fetchUsers()
	}, [])

	useEffect(() => {
		setCurrentPage(1)
	}, [search, role, status])

	const sorted = useMemo(() => {
		const arr = [...users]
		if (!sortField) return arr
		const getVal = (u: AppUser) => {
			switch (sortField) {
				case "email":
					return (u.email || "").toLowerCase()
				case "phone":
					return (u.phone_Number || "").toLowerCase()
				case "role":
					return (u.role || "").toLowerCase()
				case "last_login":
					return u.last_login || ""
				default:
					return ""
			}
		}
		return arr.sort((a, b) => {
			const av = getVal(a)
			const bv = getVal(b)
			return sortDirection === "asc"
				? String(av).localeCompare(String(bv))
				: String(bv).localeCompare(String(av))
		})
	}, [users, sortField, sortDirection])

	const filtered = useMemo(() => {
		const q = search.toLowerCase()
		return sorted.filter((u) => {
			const matchesSearch =
				(u.email || "").toLowerCase().includes(q) ||
				(u.username || "").toLowerCase().includes(q) ||
				(u.phone_Number || "").toLowerCase().includes(q)
			const matchesRole = !role || (u.role || "").toLowerCase() === role.toLowerCase()
			return matchesSearch && matchesRole
		})
	}, [sorted, search, role])

	const totalItems = filtered.length
	const totalPages = Math.ceil(totalItems / itemsPerPage)
	const pageData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

	const getSortIcon = (field: string) => {
		if (sortField !== field) return <ChevronUp className="w-4 h-4 text-gray-400" />
		return sortDirection === "asc" ? (
			<ChevronUp className="w-4 h-4 text-[#C72920]" />
		) : (
			<ChevronDown className="w-4 h-4 text-[#C72920]" />
		)
	}

	const handlePageChange = (page: number) => {
		if (page >= 1 && page <= totalPages) setCurrentPage(page)
	}

	if (!auth) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-xl text-red-600 font-bold">You do not have permission to access this page.</div>
			</div>
		)
	}

	return (
		<div className="overflow-x-auto">
			<table className="w-full min-w-[900px]">
				<thead>
					<tr className="border-b border-gray-200 bg-gray-50">
						<th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm w-12">#</th>
						<th
							className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm cursor-pointer hover:text-[#C72920] transition-colors"
							onClick={() => onSort && onSort("email")}
						>
							<div className="flex items-center gap-1">
								Email
								{getSortIcon("email")}
							</div>
						</th>
						<th
							className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm cursor-pointer hover:text-[#C72920] transition-colors"
							onClick={() => onSort && onSort("phone")}
						>
							<div className="flex items-center gap-1">
								Phone
								{getSortIcon("phone")}
							</div>
						</th>
						<th
							className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm cursor-pointer hover:text-[#C72920] transition-colors"
							onClick={() => onSort && onSort("role")}
						>
							<div className="flex items-center gap-1">
								Role
								{getSortIcon("role")}
							</div>
						</th>
						<th
							className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm cursor-pointer hover:text-[#C72920] transition-colors"
							onClick={() => onSort && onSort("last_login")}
						>
							<div className="flex items-center gap-1">
								Last Login
								{getSortIcon("last_login")}
							</div>
						</th>
						<th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">Actions</th>
					</tr>
				</thead>
				<tbody>
					{loading
						? Array.from({ length: itemsPerPage }).map((_, idx) => (
							<tr key={idx} className="border-b border-gray-100">
								<td className="p-3 md:p-4"><Skeleton className="h-4 w-6" /></td>
								<td className="p-3 md:p-4"><Skeleton className="h-4 w-40" /></td>
								<td className="p-3 md:p-4"><Skeleton className="h-4 w-28" /></td>
								<td className="p-3 md:p-4"><Skeleton className="h-4 w-16" /></td>
								<td className="p-3 md:p-4"><Skeleton className="h-6 w-16 rounded" /></td>
							</tr>
						))
						: pageData.map((u, idx) => (
							<tr key={u._id} className="border-b border-gray-100 hover:bg-gray-50">
								<td className="p-3 md:p-4 text-gray-600 text-sm">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
								<td className="p-3 md:p-4 text-gray-700 text-sm">{u.email || "-"}</td>
								<td className="p-3 md:p-4 text-gray-600 text-sm">{u.phone_Number || "-"}</td>
								<td className="p-3 md:p-4 text-gray-600 text-sm"><span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{u.role || "User"}</span></td>
								<td className="p-3 md:p-4 text-gray-600 text-sm">{formatDate(u.last_login, { includeTime: true, timeFormat: "12h" })}</td>
								<td className="p-3 md:p-4">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="sm">
												<MoreHorizontal className="w-4 h-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent>
											<DropdownMenuItem onClick={() => { setSelectedUserId(u._id); setDetailsOpen(true); }}>View Details</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</td>
							</tr>
						))}
				</tbody>
			</table>

			<div className="flex flex-col md:flex-row md:justify-between md:items-center p-3 md:p-4 border-t border-gray-200 gap-2">
				{loading ? (
					<Skeleton className="h-4 w-48" />
				) : (
					<span className="text-sm text-gray-500 md:text-left text-center w-full md:w-auto">
						Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} users
					</span>
				)}
				<div className="flex justify-center md:justify-end w-full md:w-auto">
					{loading ? (
						<div className="flex gap-2">
							<Skeleton className="h-9 w-9" />
							<Skeleton className="h-9 w-9" />
							<Skeleton className="h-9 w-9" />
							<Skeleton className="h-9 w-9" />
						</div>
					) : (
						<DynamicPagination
							currentPage={currentPage}
							totalPages={totalPages}
							onPageChange={handlePageChange}
							totalItems={totalItems}
							itemsPerPage={itemsPerPage}
						/>
					)}
				</div>
			</div>
			<UserDetailsDialog open={detailsOpen} onOpenChange={setDetailsOpen} userId={selectedUserId} />
		</div>
	)
}


