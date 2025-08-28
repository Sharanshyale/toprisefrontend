"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Package,
  Users,
  TrendingUp,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Edit,
  Plus,
  BarChart3,
  Warehouse,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  Phone,
  Mail,
  Building,
  Calendar,
  DollarSign,
  Hash,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/toast";

// Types for inventory data
interface InventoryStats {
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalDealers: number;
  activeDealers: number;
  totalValue: number;
  averageStockLevel: number;
}

interface Product {
  _id: string;
  productName: string;
  sku: string;
  category: string;
  brand: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  unitPrice: number;
  totalValue: number;
  lastUpdated: string;
  status: "in_stock" | "low_stock" | "out_of_stock" | "discontinued";
  location: string;
  supplier: string;
}

interface Dealer {
  _id: string;
  dealerName: string;
  tradeName: string;
  email: string;
  phone: string;
  address: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  status: "active" | "inactive" | "suspended";
  totalProducts: number;
  activeProducts: number;
  lastOrderDate: string;
  totalOrders: number;
  rating: number;
  joinedDate: string;
}

export default function InventoryDashboard() {
  const router = useRouter();
  const { showToast } = useToast();
  
  // State management
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Product filters
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [productStatusFilter, setProductStatusFilter] = useState<string>("all");
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>("all");
  
  // Dealer filters
  const [dealerSearchTerm, setDealerSearchTerm] = useState("");
  const [dealerStatusFilter, setDealerStatusFilter] = useState<string>("all");
  
  // Dialog states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);
  const [isDealerDetailOpen, setIsDealerDetailOpen] = useState(false);

  // Fetch inventory data
  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API calls with fallback to mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock inventory statistics
      const mockStats: InventoryStats = {
        totalProducts: 1250,
        lowStockProducts: 45,
        outOfStockProducts: 12,
        totalDealers: 89,
        activeDealers: 76,
        totalValue: 2450000,
        averageStockLevel: 78,
      };

      // Mock products data
      const mockProducts: Product[] = [
        {
          _id: "1",
          productName: "Brake Pads - Front",
          sku: "BP-FRONT-001",
          category: "Brake System",
          brand: "Bosch",
          currentStock: 15,
          minStockLevel: 20,
          maxStockLevel: 100,
          unitPrice: 450,
          totalValue: 6750,
          lastUpdated: "2025-01-19T10:30:00Z",
          status: "low_stock",
          location: "Warehouse A - Section 3",
          supplier: "Bosch India",
        },
        {
          _id: "2",
          productName: "Oil Filter",
          sku: "OF-001",
          category: "Engine",
          brand: "Mahle",
          currentStock: 0,
          minStockLevel: 10,
          maxStockLevel: 50,
          unitPrice: 120,
          totalValue: 0,
          lastUpdated: "2025-01-18T15:45:00Z",
          status: "out_of_stock",
          location: "Warehouse B - Section 1",
          supplier: "Mahle Filters",
        },
        {
          _id: "3",
          productName: "Air Filter",
          sku: "AF-001",
          category: "Engine",
          brand: "K&N",
          currentStock: 85,
          minStockLevel: 15,
          maxStockLevel: 80,
          unitPrice: 350,
          totalValue: 29750,
          lastUpdated: "2025-01-19T09:15:00Z",
          status: "in_stock",
          location: "Warehouse A - Section 2",
          supplier: "K&N Engineering",
        },
      ];

      // Mock dealers data
      const mockDealers: Dealer[] = [
        {
          _id: "1",
          dealerName: "Auto Parts Plus",
          tradeName: "APP Motors",
          email: "contact@autopartsplus.com",
          phone: "+91-9876543210",
          address: {
            address: "123 Main Street",
            city: "Mumbai",
            state: "Maharashtra",
            pincode: "400001"
          },
          status: "active",
          totalProducts: 45,
          activeProducts: 42,
          lastOrderDate: "2025-01-19T14:30:00Z",
          totalOrders: 156,
          rating: 4.5,
          joinedDate: "2024-03-15T00:00:00Z",
        },
        {
          _id: "2",
          dealerName: "Car Care Center",
          tradeName: "CCC Auto",
          email: "info@carcarecenter.com",
          phone: "+91-9876543211",
          address: {
            address: "456 Park Avenue",
            city: "Delhi",
            state: "NCR",
            pincode: "110001"
          },
          status: "active",
          totalProducts: 38,
          activeProducts: 35,
          lastOrderDate: "2025-01-18T16:45:00Z",
          totalOrders: 89,
          rating: 4.2,
          joinedDate: "2024-05-20T00:00:00Z",
        },
      ];

      setStats(mockStats);
      setProducts(mockProducts);
      setDealers(mockDealers);
    } catch (error) {
      console.error("Error fetching inventory data:", error);
      setError("Failed to load inventory data");
      showToast("Failed to load inventory data", "error");
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchInventoryData();
  }, []);

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.productName.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(productSearchTerm.toLowerCase());
    
    const matchesStatus = productStatusFilter === "all" || product.status === productStatusFilter;
    const matchesCategory = productCategoryFilter === "all" || product.category === productCategoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Filter dealers
  const filteredDealers = dealers.filter(dealer => {
    const matchesSearch = 
      dealer.dealerName.toLowerCase().includes(dealerSearchTerm.toLowerCase()) ||
      dealer.tradeName.toLowerCase().includes(dealerSearchTerm.toLowerCase()) ||
      dealer.email.toLowerCase().includes(dealerSearchTerm.toLowerCase());
    
    const matchesStatus = dealerStatusFilter === "all" || dealer.status === dealerStatusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Utility functions
  const getProductStatusBadge = (status: string) => {
    switch (status) {
      case "in_stock":
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />In Stock</Badge>;
      case "low_stock":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" />Low Stock</Badge>;
      case "out_of_stock":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Out of Stock</Badge>;
      case "discontinued":
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800"><XCircle className="w-3 h-3 mr-1" />Discontinued</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDealerStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case "inactive":
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800"><Clock className="w-3 h-3 mr-1" />Inactive</Badge>;
      case "suspended":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy HH:mm");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatAddress = (address: any) => {
    return `${address.address}, ${address.city}, ${address.state} - ${address.pincode}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading inventory data...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchInventoryData}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage inventory, products, and dealer relationships
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={fetchInventoryData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Across all categories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.lowStockProducts}</div>
              <p className="text-xs text-muted-foreground">
                Need restocking
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Dealers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeDealers}</div>
              <p className="text-xs text-muted-foreground">
                Out of {stats.totalDealers} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
              <p className="text-xs text-muted-foreground">
                Current market value
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Products Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Products ({filteredProducts.length})
              </CardTitle>
              <CardDescription>
                Manage product inventory and stock levels
              </CardDescription>
            </div>
            <Button onClick={() => router.push('/user/dashboard/product')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Product Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <Label htmlFor="product-search">Search Products</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="product-search"
                  placeholder="Search products..."
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="product-status">Status</Label>
              <Select value={productStatusFilter} onValueChange={setProductStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="product-category">Category</Label>
              <Select value={productCategoryFilter} onValueChange={setProductCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Brake System">Brake System</SelectItem>
                  <SelectItem value="Engine">Engine</SelectItem>
                  <SelectItem value="Ignition">Ignition</SelectItem>
                  <SelectItem value="Suspension">Suspension</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setProductSearchTerm("");
                  setProductStatusFilter("all");
                  setProductCategoryFilter("all");
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Products Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{product.productName}</div>
                      <div className="text-sm text-gray-500">{product.brand}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{product.sku}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{product.currentStock}</div>
                      <div className="text-sm text-gray-500">
                        Min: {product.minStockLevel} | Max: {product.maxStockLevel}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getProductStatusBadge(product.status)}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{formatCurrency(product.totalValue)}</div>
                      <div className="text-sm text-gray-500">
                        @ {formatCurrency(product.unitPrice)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(product.lastUpdated)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Dialog open={isProductDetailOpen} onOpenChange={setIsProductDetailOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedProduct(product)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Product Details - {product.productName}</DialogTitle>
                            <DialogDescription>
                              Detailed information about the product
                            </DialogDescription>
                          </DialogHeader>
                          {selectedProduct && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Product Name</Label>
                                  <p className="text-sm font-medium">{selectedProduct.productName}</p>
                                </div>
                                <div>
                                  <Label>SKU</Label>
                                  <p className="text-sm font-mono">{selectedProduct.sku}</p>
                                </div>
                                <div>
                                  <Label>Brand</Label>
                                  <p className="text-sm">{selectedProduct.brand}</p>
                                </div>
                                <div>
                                  <Label>Category</Label>
                                  <p className="text-sm">{selectedProduct.category}</p>
                                </div>
                                <div>
                                  <Label>Current Stock</Label>
                                  <p className="text-sm font-medium">{selectedProduct.currentStock}</p>
                                </div>
                                <div>
                                  <Label>Status</Label>
                                  <div className="mt-1">{getProductStatusBadge(selectedProduct.status)}</div>
                                </div>
                                <div>
                                  <Label>Unit Price</Label>
                                  <p className="text-sm font-medium">{formatCurrency(selectedProduct.unitPrice)}</p>
                                </div>
                                <div>
                                  <Label>Total Value</Label>
                                  <p className="text-sm font-medium">{formatCurrency(selectedProduct.totalValue)}</p>
                                </div>
                                <div>
                                  <Label>Location</Label>
                                  <p className="text-sm">{selectedProduct.location}</p>
                                </div>
                                <div>
                                  <Label>Supplier</Label>
                                  <p className="text-sm">{selectedProduct.supplier}</p>
                                </div>
                              </div>
                              <div>
                                <Label>Stock Levels</Label>
                                <div className="grid grid-cols-3 gap-4 mt-2">
                                  <div className="text-center p-2 bg-blue-50 rounded">
                                    <div className="text-sm text-blue-600">Min</div>
                                    <div className="font-medium">{selectedProduct.minStockLevel}</div>
                                  </div>
                                  <div className="text-center p-2 bg-green-50 rounded">
                                    <div className="text-sm text-green-600">Current</div>
                                    <div className="font-medium">{selectedProduct.currentStock}</div>
                                  </div>
                                  <div className="text-center p-2 bg-purple-50 rounded">
                                    <div className="text-sm text-purple-600">Max</div>
                                    <div className="font-medium">{selectedProduct.maxStockLevel}</div>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <Label>Last Updated</Label>
                                <p className="text-sm">{formatDate(selectedProduct.lastUpdated)}</p>
                              </div>
                            </div>
                          )}
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsProductDetailOpen(false)}>
                              Close
                            </Button>
                            <Button onClick={() => {
                              setIsProductDetailOpen(false);
                              router.push(`/user/dashboard/product/edit/${selectedProduct?._id}`);
                            }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Product
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dealers Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Dealers ({filteredDealers.length})
              </CardTitle>
              <CardDescription>
                Manage dealer relationships and performance
              </CardDescription>
            </div>
            <Button onClick={() => router.push('/user/dashboard/user')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Dealer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Dealer Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label htmlFor="dealer-search">Search Dealers</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="dealer-search"
                  placeholder="Search dealers..."
                  value={dealerSearchTerm}
                  onChange={(e) => setDealerSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="dealer-status">Status</Label>
              <Select value={dealerStatusFilter} onValueChange={setDealerStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setDealerSearchTerm("");
                  setDealerStatusFilter("all");
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Dealers Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dealer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Last Order</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDealers.map((dealer) => (
                <TableRow key={dealer._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{dealer.dealerName}</div>
                      <div className="text-sm text-gray-500">{dealer.tradeName}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">{dealer.email}</div>
                      <div className="text-sm text-gray-500">{dealer.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <MapPin className="inline h-3 w-3 mr-1" />
                      {dealer.address.city}, {dealer.address.state}
                    </div>
                  </TableCell>
                  <TableCell>{getDealerStatusBadge(dealer.status)}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{dealer.activeProducts}</div>
                      <div className="text-sm text-gray-500">of {dealer.totalProducts}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{dealer.totalOrders}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className="font-medium">{dealer.rating}</span>
                      <span className="text-yellow-500 ml-1">★</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(dealer.lastOrderDate)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Dialog open={isDealerDetailOpen} onOpenChange={setIsDealerDetailOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedDealer(dealer)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Dealer Details - {dealer.dealerName}</DialogTitle>
                            <DialogDescription>
                              Detailed information about the dealer
                            </DialogDescription>
                          </DialogHeader>
                          {selectedDealer && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Dealer Name</Label>
                                  <p className="text-sm font-medium">{selectedDealer.dealerName}</p>
                                </div>
                                <div>
                                  <Label>Trade Name</Label>
                                  <p className="text-sm">{selectedDealer.tradeName}</p>
                                </div>
                                <div>
                                  <Label>Email</Label>
                                  <p className="text-sm">{selectedDealer.email}</p>
                                </div>
                                <div>
                                  <Label>Phone</Label>
                                  <p className="text-sm">{selectedDealer.phone}</p>
                                </div>
                                <div>
                                  <Label>Status</Label>
                                  <div className="mt-1">{getDealerStatusBadge(selectedDealer.status)}</div>
                                </div>
                                <div>
                                  <Label>Rating</Label>
                                  <div className="flex items-center">
                                    <span className="font-medium">{selectedDealer.rating}</span>
                                    <span className="text-yellow-500 ml-1">★</span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <Label>Address</Label>
                                <p className="text-sm">{formatAddress(selectedDealer.address)}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Products</Label>
                                  <div className="text-sm">
                                    <div>Active: {selectedDealer.activeProducts}</div>
                                    <div>Total: {selectedDealer.totalProducts}</div>
                                  </div>
                                </div>
                                <div>
                                  <Label>Orders</Label>
                                  <div className="text-sm">
                                    <div>Total: {selectedDealer.totalOrders}</div>
                                    <div>Last: {formatDate(selectedDealer.lastOrderDate)}</div>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <Label>Joined Date</Label>
                                <p className="text-sm">{formatDate(selectedDealer.joinedDate)}</p>
                              </div>
                            </div>
                          )}
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDealerDetailOpen(false)}>
                              Close
                            </Button>
                            <Button onClick={() => {
                              setIsDealerDetailOpen(false);
                              router.push(`/user/dashboard/user/edit/${selectedDealer?._id}`);
                            }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Dealer
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
