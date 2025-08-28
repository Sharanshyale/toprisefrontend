'use client'
import { Search, ShoppingCart, Star, Heart, Share2, Minus, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import React, { useState, useEffect } from 'react';
import { getProductById, getProductsByPage } from "@/service/product-Service"
import { useParams, useRouter } from "next/navigation"
import type { Product as ProductType, Product } from "@/types/product-Types"
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/components/ui/toast"
import { getUserById } from "@/service/user/userService"
import { useAppSelector } from "@/store/hooks"
import type { AppUser } from "@/types/user-types"

export default function ProductPage() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AppUser | null>(null);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [currentPage, setCurrentPage] = React.useState<number>(1)
  const [totalPages, setTotalPages] = React.useState<number>(1)
  const pageSize = 8
  // Featured products state (separate from main product)
  const [featuredProducts, setFeaturedProducts] = useState<ProductType[]>([]);
  const [featuredCurrentPage, setFeaturedCurrentPage] = useState<number>(1);
  const [featuredLoading, setFeaturedLoading] = useState(false);
  const featuredPageSize = 8
  const userId = useAppSelector((state) => state.auth.user?._id);
  const id = useParams<{ id: string }>();
  const { addItemToCart } = useCart();
  const { showToast } = useToast();
  const router = useRouter()
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ""
  const filesOrigin = React.useMemo(() => apiBase.replace(/\/api$/, ""), [apiBase])
  const buildImageUrl = React.useCallback((path?: string) => {
    if (!path) return "/placeholder.svg"
    if (/^https?:\/\//i.test(path)) return path
    return `${filesOrigin}${path.startsWith("/") ? "" : "/"}${path}`
  }, [filesOrigin])

  useEffect(() => {
    const fetchUserById = async () => {
      if (!userId) return;
      try {
        const response = await getUserById(userId);
        console.log("user", response);
        setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };
    fetchUserById();
  }, [userId]);
useEffect(() => {
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
  const handleProductClick = (productId: string) => {
    router.push(`/shop/product/${productId}`)
  }

  // Separate useEffect for featured products
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setFeaturedLoading(true)
      try {
        const res = await getProductsByPage(featuredCurrentPage, featuredPageSize, "Approved")
        const items = (res?.data?.products ?? []) as ProductType[]
        setFeaturedProducts(items)
      } catch (e) {
        setFeaturedProducts([])
      } finally {
        setFeaturedLoading(false)
      }
    }
    fetchFeaturedProducts()
  }, [featuredCurrentPage])
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await getProductById(id.id);

        const data = response.data;
        console.log("getProducts API response:", response);
        console.log("data", data);
        
        // Handle different response structures like other components
        let prod: Product | null = null;
        
        // Check if data has products array (ProductResponse structure)
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          prod = data.products[0];
        }
        // Check if data is directly an array
        else if (Array.isArray(data) && data.length > 0) {
          prod = data[0];
        }

        // Check if data is directly a product object
        else if (data && typeof data === "object" && (data as any)._id) {
          prod = data as unknown as Product;
        }

        // Last fallback - treat data as product if it's an object
        else if (
          typeof data === "object" &&
          data !== null &&
          !Array.isArray(data)
        ) {
          prod = data as unknown as Product;
        }
        
        setProduct(prod);
        console.log("Parsed product:", prod);
      } catch (error) {
        console.error("getProducts API error:", error);
      }
       finally {
        setLoading(false);
      }

    };
    
    if (id.id) {
      fetchProducts();
    }
  }, [id.id]);

  const handleAddToCart = async () => {
    if (!product?._id) return;
    
    try {
      await addItemToCart(product._id, quantity);
      showToast("Product added to cart successfully", "success");
    } catch (error: any) {
      if (error.message === 'User not authenticated') {
        showToast("Please login to add items to cart", "error");
      } else {
        showToast("Failed to add product to cart", "error");
        console.error("Error adding to cart:", error);
      }
    }
  };

  const computeDiscount = (mrp?: number, price?: number) => {
    if (!mrp || !price || mrp <= 0) return 0
    return Math.max(0, Math.round((1 - price / mrp) * 100))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h1>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const images = product.images || ["/placeholder.svg"];
  const mainImage = buildImageUrl(images[selectedImage]);
  const discount = computeDiscount(product.mrp_with_gst, product.selling_price);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Product Images Section */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              <img 
                src={mainImage} 
                alt={product.product_name} 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {images.slice(0, 4).map((image, i) => (
                <div 
                  key={i} 
                  className={`aspect-square bg-muted rounded-md overflow-hidden cursor-pointer hover:opacity-80 transition-opacity ${selectedImage === i ? 'ring-2 ring-red-600' : ''}`}
                  onClick={() => setSelectedImage(i)}
                >
                  <img 
                    src={buildImageUrl(image)} 
                    alt={`${product.product_name} ${i + 1}`} 
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details Section */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">{product.brand?.brand_name || 'Brand'}</p>
              <h1 className="text-3xl font-bold mb-2">{product.product_name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">(4.5) Reviews</span>
              </div>
            </div>

            <div className="border-b pb-6">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-bold">₹{Number(product.selling_price).toFixed(2)}</span>
                {product.mrp_with_gst && product.mrp_with_gst !== product.selling_price && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">₹{Number(product.mrp_with_gst).toFixed(2)}</span>
                    {discount > 0 && <Badge variant="destructive">{discount}% OFF</Badge>}
                  </>
                )}
              </div>
              <p className="text-sm text-green-600">Inclusive of all taxes</p>
              {product.out_of_stock ? (
                <p className="text-sm text-red-600">Out of Stock</p>
              ) : (
                <p className="text-sm text-green-600">In Stock ({product.no_of_stock} available)</p>
              )}
            </div>

            <div className="space-y-4">
              {product.category && (
                <div>
                  <p className="font-semibold mb-2">Category</p>
                  <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm">
                    {product.category.category_name}
                  </span>
                </div>
              )}

              {product.make && product.make.length > 0 && (
                <div>
                  <p className="font-semibold mb-3">Compatible Makes</p>
                  <div className="flex flex-wrap gap-2">
                    {product.make.map((make, index) => (
                      <span key={index} className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {make}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="font-semibold mb-3">Quantity</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-md">
                    <button 
                      className="p-2 hover:bg-muted transition-colors disabled:opacity-50"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 min-w-[50px] text-center">{quantity}</span>
                    <button 
                      className="p-2 hover:bg-muted transition-colors disabled:opacity-50"
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={product.out_of_stock || quantity >= product.no_of_stock}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                className="flex-1 bg-red-600 hover:bg-red-700" 
                size="lg"
                onClick={handleAddToCart}
                disabled={product.out_of_stock}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
              <Button variant="secondary" size="lg" className="flex-1" disabled={product.out_of_stock}>
                Buy Now
              </Button>
              <Button variant="outline" size="lg" className="px-4">
                <Heart className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4 pt-6 border-t">
              {product.key_specifications && (
                <div>
                  <h3 className="font-semibold mb-2">Product Details</h3>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {product.key_specifications}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                {product.sku_code && (
                  <div>
                    <span className="font-medium">SKU:</span>
                    <span className="ml-2 text-muted-foreground">{product.sku_code}</span>
                  </div>
                )}
                {product.weight && (
                  <div>
                    <span className="font-medium">Weight:</span>
                    <span className="ml-2 text-muted-foreground">{product.weight}kg</span>
                  </div>
                )}
                {product.warranty && (
                  <div>
                    <span className="font-medium">Warranty:</span>
                    <span className="ml-2 text-muted-foreground">{product.warranty} months</span>
                  </div>
                )}
                {product.hsn_code && (
                  <div>
                    <span className="font-medium">HSN Code:</span>
                    <span className="ml-2 text-muted-foreground">{product.hsn_code}</span>
                  </div>
                )}
              </div>

              {product.is_returnable && (
                <div>
                  <h3 className="font-semibold mb-2">Return Policy</h3>
                  <div className="text-sm">
                    <p className="text-green-600">✓ This product is returnable</p>
                    {product.return_policy && (
                      <p className="text-muted-foreground mt-1">{product.return_policy}</p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">Delivery Options</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">Enter pincode to check delivery date</p>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Enter Pincode" 
                      className="px-3 py-2 border rounded-md flex-1 max-w-xs"
                    />
                    <Button variant="outline">Check</Button>
                  </div>
                  <p className="text-green-600">✓ Free Delivery on orders above ₹500</p>
                  <p className="text-muted-foreground">✓ Easy 30 days return & exchange</p>
                </div>
              </div>
            </div>

            {/* Delivery Details Section */}
            <div className="bg-muted/30 rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">📍</span>
                <span className="text-sm font-medium">Deliver to</span>
              </div>
                             <div className="flex gap-4">
                 <div className="flex-1">
                   <label className="text-xs text-muted-foreground block">Address</label>
                   <div className="mt-1 p-2 bg-background rounded border text-sm">
                     {user?.address?.[0]?.street || "No address found"}
                   </div>
                 </div>
                 <div className="flex-1">
                   <label className="text-xs text-muted-foreground block">City</label>
                   <div className="mt-1 p-2 bg-background rounded border text-sm">
                     {user?.address?.[0]?.city || "No city found"}
                   </div>
                 </div>
                 <div className="flex-1">
                   <label className="text-xs text-muted-foreground block">State</label>
                   <div className="mt-1 p-2 bg-background rounded border text-sm">
                     {user?.address?.[0]?.state || "No state found"}
                   </div>
                 </div>
                 <div className="flex-1">
                   <label className="text-xs text-muted-foreground block">Pin Code</label>
                   <div className="mt-1 p-2 bg-background rounded border text-sm">
                     {user?.address?.[0]?.pincode || "No pincode found"}
                   </div>
                 </div>
               </div>
                              <div className="flex gap-2">
                  <input type="checkbox" className="mt-0.5" />
                  <label className="text-xs text-muted-foreground">
                    {user?.address?.[0] ? `${user.address[0].addressLine1}, ${user.address[0].city}, ${user.address[0].state} - ${user.address[0].pinCode}` : "No address found"}
                  </label>
                </div>
            </div>

            {/* Features and Specification */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Features and Specification</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Dimensions</p>
                  <p className="text-sm font-medium">10 x 30 x 30 cm; 3 kg</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Manufacturer</p>
                  <p className="text-sm font-medium">Storef Private Limited</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground mb-1">Manufacturer</p>
                  <p className="text-sm">Jai Mata Complex Building, Basement khata no. 521/545, Godown area, Hodbast no. 234, Zirakpura, Punjab - 140603</p>
                </div>
              </div>
            </div>
          </div>
        </div>

                 {/* Featured Product List */}
         <div className="mt-16 space-y-6">
           <div className="flex items-center justify-between">
             <h2 className="text-2xl font-bold">Featured Product List</h2>
             <div className="flex items-center gap-2">
               <button
                 onClick={() => setFeaturedCurrentPage((p) => Math.max(1, p - 1))}
                 disabled={featuredCurrentPage <= 1}
                 className="p-2 rounded-md bg-red-600 text-white disabled:opacity-50 disabled:bg-red-400 hover:bg-red-700 transition-colors"
                 aria-label="Previous products"
               >
                 <ChevronLeft className="w-4 h-4" />
               </button>
               <span className="text-sm text-gray-600">
                 {featuredCurrentPage} / {Math.ceil(featuredProducts.length / 4) || 1}
               </span>
               <button
                 onClick={() => setFeaturedCurrentPage((p) => Math.min(Math.ceil(featuredProducts.length / 4), p + 1))}
                 disabled={featuredCurrentPage >= Math.ceil(featuredProducts.length / 4)}
                 className="p-2 rounded-md bg-red-600 text-white disabled:opacity-50 disabled:bg-red-400 hover:bg-red-700 transition-colors"
                 aria-label="Next products"
               >
                 <ChevronRight className="w-4 h-4" />
               </button>
             </div>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
             {featuredProducts.slice((featuredCurrentPage - 1) * 4, featuredCurrentPage * 4).map((product) => {
               const imageSrc = buildImageUrl(product?.images?.[0])
               const name = product?.product_name || "Product"
               const brand = product?.brand?.brand_name || ""
               const price = product?.selling_price ?? 0
               const originalPrice = product?.mrp_with_gst ?? price
               const discount = computeDiscount(originalPrice, price)
               const inStock = !product?.out_of_stock && product?.no_of_stock > 0
               
               return (
                 <div key={product._id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                   <div className="relative">
                     <div className="aspect-square bg-muted rounded-md mb-4 overflow-hidden">
                       <img 
                         src={imageSrc} 
                         alt={name}
                         className="w-full h-full object-contain"
                       />
                     </div>
                     {inStock ? (
                       <Badge className="absolute top-2 left-2 bg-green-600">In Stock</Badge>
                     ) : (
                       <Badge className="absolute top-2 left-2" variant="secondary">Out of Stock</Badge>
                     )}
                     <button className="absolute top-2 right-2 p-1.5 bg-background rounded-full border hover:bg-muted">
                       <Heart className="w-4 h-4" />
                     </button>
                     {discount > 0 && (
                       <div className="absolute top-2 right-12 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                         {discount}%
                       </div>
                     )}
                   </div>
                   <div className="space-y-2">
                     <h3 className="font-medium text-sm">{name}</h3>
                     <p className="text-xs text-muted-foreground">{brand}</p>
                     <div className="flex items-baseline gap-2">
                       <span className="font-bold text-lg">₹{Number(price).toFixed(2)}</span>
                       {originalPrice && originalPrice !== price && (
                         <span className="text-sm text-muted-foreground line-through">₹{Number(originalPrice).toFixed(2)}</span>
                       )}
                     </div>
                     <div className="flex gap-2">
                       <Button 
                         className="flex-1" 
                         variant="outline"
                         disabled={!inStock}
                         onClick={async () => {
                           try {
                             await addItemToCart(product._id, 1);
                             showToast("Product added to cart successfully", "success");
                           } catch (error: any) {
                             if (error.message === 'User not authenticated') {
                               showToast("Please login to add items to cart", "error");
                               router.push("/login");
                             } else {
                               showToast("Failed to add product to cart", "error");
                             }
                           }
                         }}
                       >
                         <ShoppingCart className="w-4 h-4 mr-2" />
                         Add
                       </Button>
                       <Button 
                         className="flex-1" 
                         variant={inStock ? "destructive" : "secondary"} 
                         disabled={!inStock}
                         onClick={() => handleProductClick(product._id)}
                       >
                         View
                       </Button>
                     </div>
                   </div>
                 </div>
               )
             })}
           </div>
             
       
         </div>
       </div>
     </div>
  )
}
