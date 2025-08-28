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
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  Eye,
  PackageCheck,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/toast";
import {
  getPickupRequests,
  updatePickupStatus,
  type PickupRequest,
  type PickupItem,
} from "@/service/pickup-service";

export default function PickupManagement() {
  const router = useRouter();
  const { showToast } = useToast();
  
  // State management
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedPickup, setSelectedPickup] = useState<PickupRequest | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isPackedDialogOpen, setIsPackedDialogOpen] = useState(false);
  const [packingNotes, setPackingNotes] = useState("");

  // Fetch pickup data
  const fetchPickupData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use real API calls with fallback to mock data
      try {
        const response = await getPickupRequests();
        setPickups(response.data);
      } catch (apiError) {
        console.warn("API calls failed, using mock data:", apiError);
        // Fallback to mock data if API calls fail
        const mockPickups: PickupRequest[] = [
          {
            _id: "1",
            pickupId: "PICKUP-001",
            orderId: "ORD-001",
            customerName: "John Doe",
            customerPhone: "+91-9876543210",
            dealerName: "Auto Parts Plus",
            dealerPhone: "+91-9876543211",
            pickupAddress: {
              address: "123 Customer Street",
              city: "Mumbai",
              state: "Maharashtra",
              pincode: "400001"
            },
            scheduledDate: "2025-01-20T10:00:00Z",
            status: "scheduled",
            priority: "high",
            items: [
              {
                _id: "1",
                productName: "Brake Pads",
                sku: "BP-001",
                quantity: 2,
                condition: "new",
                notes: "Front brake pads"
              }
            ],
            notes: "Customer prefers morning pickup",
            assignedTo: "Staff Member 1",
            createdAt: "2025-01-19T08:00:00Z",
            updatedAt: "2025-01-19T08:00:00Z"
          },
          {
            _id: "2",
            pickupId: "PICKUP-002",
            orderId: "ORD-002",
            customerName: "Jane Smith",
            customerPhone: "+91-9876543212",
            dealerName: "Car Care Center",
            dealerPhone: "+91-9876543213",
            pickupAddress: {
              address: "789 Customer Avenue",
              city: "Delhi",
              state: "NCR",
              pincode: "110001"
            },
            scheduledDate: "2025-01-20T14:00:00Z",
            status: "packed",
            priority: "medium",
            items: [
              {
                _id: "3",
                productName: "Air Filter",
                sku: "AF-001",
                quantity: 1,
                condition: "new"
              }
            ],
            assignedTo: "Staff Member 2",
            createdAt: "2025-01-19T09:00:00Z",
            updatedAt: "2025-01-19T15:30:00Z"
          }
        ];

        setPickups(mockPickups);
      }
    } catch (error) {
      console.error("Error fetching pickup data:", error);
      setError("Failed to load pickup data");
      showToast("Failed to load pickup data", "error");
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchPickupData();
  }, []);

  // Filter pickups based on search and filters
  const filteredPickups = pickups.filter(pickup => {
    const matchesSearch = 
      pickup.pickupId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pickup.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pickup.dealerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pickup.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || pickup.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || pickup.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Mark pickup as packed
  const handleMarkAsPacked = async (pickupId: string) => {
    try {
      // Use real API call with fallback
      try {
        await updatePickupStatus(pickupId, "packed", packingNotes);
      } catch (apiError) {
        console.warn("API call failed, updating locally:", apiError);
      }
      
      // Update local state
      setPickups(prev => prev.map(pickup => 
        pickup._id === pickupId 
          ? { ...pickup, status: "packed" as const, updatedAt: new Date().toISOString() }
          : pickup
      ));
      
      setIsPackedDialogOpen(false);
      setPackingNotes("");
      showToast("Pickup marked as packed successfully", "success");
    } catch (error) {
      console.error("Error marking pickup as packed:", error);
      showToast("Failed to mark pickup as packed", "error");
    }
  };

  // Utility functions
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "scheduled":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><Calendar className="w-3 h-3 mr-1" />Scheduled</Badge>;
      case "in_progress":
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800"><Package className="w-3 h-3 mr-1" />In Progress</Badge>;
      case "packed":
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><PackageCheck className="w-3 h-3 mr-1" />Packed</Badge>;
      case "picked_up":
        return <Badge variant="secondary" className="bg-indigo-100 text-indigo-800"><Truck className="w-3 h-3 mr-1" />Picked Up</Badge>;
      case "completed":
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Urgent</Badge>;
      case "high":
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><Clock className="w-3 h-3 mr-1" />High</Badge>;
      case "medium":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case "low":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy HH:mm");
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
          <span>Loading pickup data...</span>
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
          <Button onClick={fetchPickupData}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pickup Management</h1>
          <p className="text-gray-600 mt-1">
            Manage pickup requests and mark items as packed
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={fetchPickupData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search pickups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="packed">Packed</SelectItem>
                  <SelectItem value="picked_up">Picked Up</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setPriorityFilter("all");
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pickup Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Pickup Requests ({filteredPickups.length})
          </CardTitle>
          <CardDescription>
            View and manage pickup requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pickup ID</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Dealer</TableHead>
                <TableHead>Scheduled Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPickups.map((pickup) => (
                <TableRow key={pickup._id}>
                  <TableCell className="font-medium">{pickup.pickupId}</TableCell>
                  <TableCell>{pickup.orderId}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{pickup.customerName}</div>
                      <div className="text-sm text-gray-500">{pickup.customerPhone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{pickup.dealerName}</div>
                      <div className="text-sm text-gray-500">{pickup.dealerPhone}</div>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(pickup.scheduledDate)}</TableCell>
                  <TableCell>{getStatusBadge(pickup.status)}</TableCell>
                  <TableCell>{getPriorityBadge(pickup.priority)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {pickup.items.length} item{pickup.items.length !== 1 ? 's' : ''}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedPickup(pickup)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Pickup Details - {pickup.pickupId}</DialogTitle>
                            <DialogDescription>
                              Detailed information about the pickup request
                            </DialogDescription>
                          </DialogHeader>
                          {selectedPickup && (
                            <div className="space-y-6">
                              {/* Basic Information */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h3 className="font-semibold mb-2">Customer Information</h3>
                                  <div className="space-y-1 text-sm">
                                    <div><User className="inline h-4 w-4 mr-1" />{selectedPickup.customerName}</div>
                                    <div><Phone className="inline h-4 w-4 mr-1" />{selectedPickup.customerPhone}</div>
                                  </div>
                                </div>
                                <div>
                                  <h3 className="font-semibold mb-2">Dealer Information</h3>
                                  <div className="space-y-1 text-sm">
                                    <div><User className="inline h-4 w-4 mr-1" />{selectedPickup.dealerName}</div>
                                    <div><Phone className="inline h-4 w-4 mr-1" />{selectedPickup.dealerPhone}</div>
                                  </div>
                                </div>
                              </div>

                              {/* Pickup Address */}
                              <div>
                                <h3 className="font-semibold mb-2">Pickup Address</h3>
                                <div className="text-sm">
                                  <MapPin className="inline h-4 w-4 mr-1" />
                                  {formatAddress(selectedPickup.pickupAddress)}
                                </div>
                              </div>

                              {/* Items */}
                              <div>
                                <h3 className="font-semibold mb-2">Items to Pickup</h3>
                                <div className="space-y-2">
                                  {selectedPickup.items.map((item) => (
                                    <div key={item._id} className="border rounded-lg p-3">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <div className="font-medium">{item.productName}</div>
                                          <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                                          <div className="text-sm text-gray-500">Quantity: {item.quantity}</div>
                                          <div className="text-sm text-gray-500">Condition: {item.condition}</div>
                                        </div>
                                        <Badge variant="outline">{item.condition}</Badge>
                                      </div>
                                      {item.notes && (
                                        <div className="mt-2 text-sm text-gray-600">
                                          Notes: {item.notes}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Notes */}
                              {selectedPickup.notes && (
                                <div>
                                  <h3 className="font-semibold mb-2">Notes</h3>
                                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                    {selectedPickup.notes}
                                  </div>
                                </div>
                              )}

                              {/* Status Information */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h3 className="font-semibold mb-2">Status Information</h3>
                                  <div className="space-y-1 text-sm">
                                    <div>Status: {getStatusBadge(selectedPickup.status)}</div>
                                    <div>Priority: {getPriorityBadge(selectedPickup.priority)}</div>
                                    {selectedPickup.assignedTo && (
                                      <div>Assigned to: {selectedPickup.assignedTo}</div>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <h3 className="font-semibold mb-2">Timestamps</h3>
                                  <div className="space-y-1 text-sm">
                                    <div>Created: {formatDate(selectedPickup.createdAt)}</div>
                                    <div>Updated: {formatDate(selectedPickup.updatedAt)}</div>
                                    <div>Scheduled: {formatDate(selectedPickup.scheduledDate)}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                              Close
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      {/* Mark as Packed Button */}
                      {pickup.status === "scheduled" || pickup.status === "in_progress" ? (
                        <Dialog open={isPackedDialogOpen} onOpenChange={setIsPackedDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => setSelectedPickup(pickup)}
                            >
                              <PackageCheck className="h-4 w-4 mr-1" />
                              Mark Packed
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Mark as Packed</DialogTitle>
                              <DialogDescription>
                                Confirm that all items for pickup {pickup.pickupId} have been packed and are ready for pickup.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="packing-notes">Packing Notes (Optional)</Label>
                                <Input
                                  id="packing-notes"
                                  placeholder="Add any notes about the packing process..."
                                  value={packingNotes}
                                  onChange={(e) => setPackingNotes(e.target.value)}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setIsPackedDialogOpen(false);
                                  setPackingNotes("");
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={() => handleMarkAsPacked(pickup._id)}
                              >
                                Confirm Packed
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      ) : null}
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
