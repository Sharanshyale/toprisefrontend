"use client"
import React from "react"
import { Heart, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react"
import { getProductsByPage } from "@/service/product-Service"
import type { Product as ProductType } from "@/types/product-Types"
import { DynamicButton } from "@/components/common/button"
import { useCart } from "@/hooks/use-cart"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/toast"

export default function FeaturedProducts() {
  const [products, setProducts] = React.useState<ProductType[]>([])
  const [loading, setLoading] = React.useState<boolean>(false)
  const [currentPage, setCurrentPage] = React.useState<number>(1)
  const [totalPages, setTotalPages] = React.useState<number>(1)
  const pageSize = 8
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ""
  const filesOrigin = React.useMemo(() => apiBase.replace(/\/api$/, ""), [apiBase])
  const buildImageUrl = React.useCallback((path?: string) => {
    if (!path) return "/placeholder.svg"
    if (/^https?:\/\//i.test(path)) return path
    return `${filesOrigin}${path.startsWith("/") ? "" : "/"}${path}`
  }, [filesOrigin])
  
  const router = useRouter()
  const { showToast } = useToast()
  const { addItemToCart } = useCart()
  const handleProductClick = (productId: string) => {
    router.push(`/shop/product/${productId}`)
  }
  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await getProductsByPage(currentPage, pageSize, "Approved")
        console.log("productid ", res?.data?.products?.[0]?._id)
        const items = (res?.data?.products ?? []) as ProductType[]
        setProducts(items)
        const tp = res?.data?.pagination?.totalPages
        if (tp) setTotalPages(tp)
      } catch (e) {
        setProducts([])
        setTotalPages(1)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [currentPage])

  const handleSubmit = async (productId: string) => {
    if (!productId) return
    
    try {
      await addItemToCart(productId, 1)
      showToast("Product added to cart successfully", "success")
      console.log("Product added to cart:", productId)
    } catch (error: any) {
      if (error.message === 'User not authenticated') {
        showToast("Please login to add items to cart", "error")
        router.push("/login")
      } else {
        showToast("Failed to add product to cart", "error")
        console.error("Error adding to cart:", error)
      }
    }
  }

  const computeDiscount = (mrp?: number, price?: number) => {
    if (!mrp || !price || mrp <= 0) return 0
    return Math.max(0, Math.round((1 - price / mrp) * 100))
  }

  return (
    <section className="py-12 px-4 max-w-screen-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Featured Product List</h2>
        <div className="flex items-center gap-2 text-sm">
          <button
            aria-label="Previous page"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-2 rounded-md bg-red-600 text-white disabled:opacity-50 disabled:bg-red-400 hover:bg-red-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-gray-600 select-none">
            {currentPage} / {totalPages}
          </span>
          <button
            aria-label="Next page"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-2 rounded-md bg-red-600 text-white disabled:opacity-50 disabled:bg-red-400 hover:bg-red-700 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {(loading ? Array.from({ length: pageSize }) : products).map((product: any, idx: number) => {
          const imageSrc = buildImageUrl(product?.images?.[0])
          const name = product?.product_name || "Product"
          const vehicle = product?.brand?.brand_name || ""
          const price = product?.selling_price ?? 0
          const originalPrice = product?.mrp_with_gst ?? price
          const discount = computeDiscount(originalPrice, price)
          const key = product?._id ?? idx

          return (
            <div
              key={key}
              className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${product?._id ? 'cursor-pointer' : ''}`}
              onClick={product?._id ? () => handleProductClick(product._id) : undefined}
              role={product?._id ? "button" : undefined}
              tabIndex={product?._id ? 0 : -1}
            >
              <div className="relative p-4 bg-gray-50">
                <button
                  className="absolute top-2 right-2 p-2 rounded-full bg-white shadow-sm hover:bg-gray-50 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    // TODO: wishlist logic
                  }}
                >
                  <Heart className="w-5 h-5 text-gray-400 hover:text-red-500" />
                </button>
                <img
                  src={imageSrc}
                  alt={name}
                  className="w-full h-48 object-contain"
                  onClick={product?._id ? (e) => {
                    e.stopPropagation()
                    handleProductClick(product._id)
                  } : undefined}
                />
                {discount > 0 && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-sm font-medium">
                    {discount}%
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3
                  className="font-semibold text-gray-900 mb-1"
                  onClick={product?._id ? (e) => {
                    e.stopPropagation()
                    handleProductClick(product._id)
                  } : undefined}
                >{name}</h3>
                {vehicle ? (
                  <p className="text-sm text-gray-600 mb-3">{vehicle}</p>
                ) : (
                  <div className="h-5 mb-3" />
                )}

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg font-bold text-gray-900">₹{Number(price).toFixed(2)}</span>
                  {originalPrice && originalPrice !== price && (
                    <span className="text-sm text-gray-500 line-through">₹{Number(originalPrice).toFixed(2)}</span>
                  )}
                </div>

                <DynamicButton className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded font-medium transition-colors flex items-center justify-center gap-2"
                text="Add"
                icon={<ShoppingCart className="w-4 h-4" />}
                onClick={(e) => {
                  e.stopPropagation()
                  if (product?._id) handleSubmit(product._id)
                }}
                />
             
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
