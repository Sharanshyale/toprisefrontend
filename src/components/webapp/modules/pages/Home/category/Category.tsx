"use client"
import { Button } from "@/components/ui/button"
import React from "react"
import { getCategories } from "@/service/product-Service"
import type { Category as ProductCategory } from "@/types/product-Types"

export default function CategorySection() {
  const [categories, setCategories] = React.useState<ProductCategory[]>([])
  const [loading, setLoading] = React.useState<boolean>(false)
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ""
  const filesOrigin = React.useMemo(() => apiBase.replace(/\/api$/, ""), [apiBase])
  const buildImageUrl = React.useCallback((path?: string) => {
    if (!path) return "/placeholder.svg"
    if (/^https?:\/\//i.test(path)) return path
    return `${filesOrigin}${path.startsWith("/") ? "" : "/"}${path}`
  }, [filesOrigin])

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await getCategories()
        // ApiResponse<{Category[]}> -> use data fallback
        const items = (res?.data ?? []) as ProductCategory[]
        setCategories(items)
      } catch (e) {
        setCategories([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-screen-2xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Shop by Categories</h2>

        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
          {(loading ? Array.from({ length: 5 }) : categories).map((category: any, idx: number) => (
            <div
              key={category?._id ?? idx}
              className="flex-shrink-0 bg-white rounded-lg border border-gray-200 p-8 hover:shadow-lg transition-shadow cursor-pointer min-w-[240px] min-h-[240px] text-center flex flex-col items-center justify-center"
            >
              <div className="mb-4 flex justify-center">
                <img
                  src={buildImageUrl(category?.category_image)}
                  alt={category?.category_name || "Category"}
                  className="w-24 h-24 object-contain"
                />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                {category?.category_name || "\u00A0"}
              </h3>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}
