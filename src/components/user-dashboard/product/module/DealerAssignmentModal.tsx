"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/toast";
import { Search, Users, Package, Building, CheckCircle } from "lucide-react";

interface Dealer {
  _id: string;
  trade_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isActive: boolean;
  assignedProducts?: string[];
}

interface Product {
  _id: string;
  product_name: string;
  sku_code: string;
  no_of_stock: number;
  selling_price: number;
  brand?: string;
  category?: string;
  sub_category?: string;
}

interface DealerAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  dealers: Dealer[];
  onDealerAssignment: (productId: string, dealerIds: string[], action: 'assign' | 'unassign') => Promise<void>;
}

export default function DealerAssignmentModal({
  isOpen,
  onClose,
  product,
  dealers,
  onDealerAssignment,
}: DealerAssignmentModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDealers, setSelectedDealers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [assignmentAction, setAssignmentAction] = useState<'assign' | 'unassign'>('assign');
  const { showToast } = useToast();

  useEffect(() => {
    if (product && dealers) {
      // Pre-select dealers who already have this product assigned
      const assignedDealerIds = dealers
        .filter(dealer => dealer.assignedProducts?.includes(product._id))
        .map(dealer => dealer._id);
      setSelectedDealers(assignedDealerIds);
    }
  }, [product, dealers]);

  const filteredDealers = dealers.filter(dealer =>
    dealer.trade_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dealer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dealer.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDealerToggle = (dealerId: string) => {
    setSelectedDealers(prev => 
      prev.includes(dealerId)
        ? prev.filter(id => id !== dealerId)
        : [...prev, dealerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDealers.length === filteredDealers.length) {
      setSelectedDealers([]);
    } else {
      setSelectedDealers(filteredDealers.map(dealer => dealer._id));
    }
  };

  const handleSubmit = async () => {
    if (!product || selectedDealers.length === 0) {
      showToast("Please select at least one dealer", "error");
      return;
    }

    setIsLoading(true);
    try {
      await onDealerAssignment(product._id, selectedDealers, assignmentAction);
      showToast(`Dealers ${assignmentAction === 'assign' ? 'assigned' : 'unassigned'} successfully`, "success");
      onClose();
    } catch (error) {
      console.error("Failed to update dealer assignment:", error);
      showToast("Failed to update dealer assignment", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const getAssignmentStatus = (dealer: Dealer) => {
    const isAssigned = dealer.assignedProducts?.includes(product?._id || '');
    return {
      isAssigned,
      status: isAssigned ? "Assigned" : "Not Assigned",
      color: isAssigned ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
    };
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Dealer Assignment
          </DialogTitle>
          <DialogDescription>
            Assign or unassign {product.product_name} to dealers
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Information */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Product Name</Label>
                  <p className="font-medium">{product.product_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">SKU Code</Label>
                  <p className="font-mono text-sm">{product.sku_code}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Stock</Label>
                  <p className="font-medium">{product.no_of_stock || 0} units</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Assignment Action Selection */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Assignment Action</Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="assign"
                    checked={assignmentAction === 'assign'}
                    onChange={(e) => setAssignmentAction(e.target.value as 'assign' | 'unassign')}
                    className="text-blue-600"
                  />
                  <span className="text-sm">Assign to Dealers</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="unassign"
                    checked={assignmentAction === 'unassign'}
                    onChange={(e) => setAssignmentAction(e.target.value as 'assign' | 'unassign')}
                    className="text-blue-600"
                  />
                  <span className="text-sm">Unassign from Dealers</span>
                </label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Dealer Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Select Dealers</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-xs"
                >
                  {selectedDealers.length === filteredDealers.length ? "Deselect All" : "Select All"}
                </Button>
                <Badge variant="secondary">
                  {selectedDealers.length} selected
                </Badge>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search dealers by name, email, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Dealers List */}
            <div className="max-h-96 overflow-y-auto border rounded-lg">
              {filteredDealers.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No dealers found
                </div>
              ) : (
                <div className="divide-y">
                  {filteredDealers.map((dealer) => {
                    const assignmentStatus = getAssignmentStatus(dealer);
                    return (
                      <div key={dealer._id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={selectedDealers.includes(dealer._id)}
                            onCheckedChange={() => handleDealerToggle(dealer._id)}
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{dealer.trade_name}</h4>
                                <p className="text-sm text-gray-600">{dealer.email}</p>
                                <p className="text-sm text-gray-500">
                                  {dealer.city}, {dealer.state} - {dealer.pincode}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={assignmentStatus.color}>
                                  {assignmentStatus.status}
                                </Badge>
                                {dealer.isActive ? (
                                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                                ) : (
                                  <Badge className="bg-red-100 text-red-800">Inactive</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || selectedDealers.length === 0}
              className={`${
                assignmentAction === 'assign' 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isLoading ? "Processing..." : `${assignmentAction === 'assign' ? 'Assign' : 'Unassign'} to ${selectedDealers.length} Dealer${selectedDealers.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
