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
import { useToast } from "@/components/ui/toast";
import { Package, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";

interface Product {
  _id: string;
  product_name: string;
  sku_code: string;
  no_of_stock: number;
  selling_price: number;
  mrp_with_gst: number;
  brand?: string;
  category?: string;
  sub_category?: string;
  product_type?: string;
  is_returnable?: boolean;
  return_policy?: number;
  images?: string[];
}

interface StockManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onStockUpdate: (productId: string, newStock: number, reason: string) => Promise<void>;
}

export default function StockManagementModal({
  isOpen,
  onClose,
  product,
  onStockUpdate,
}: StockManagementModalProps) {
  const [newStock, setNewStock] = useState<number>(0);
  const [reason, setReason] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [stockChange, setStockChange] = useState<number>(0);
  const { showToast } = useToast();

  useEffect(() => {
    if (product) {
      setNewStock(product.no_of_stock || 0);
      setStockChange(0);
      setReason("");
    }
  }, [product]);

  const handleStockChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    setNewStock(numValue);
    if (product) {
      setStockChange(numValue - (product.no_of_stock || 0));
    }
  };

  const handleSubmit = async () => {
    if (!product || !reason.trim()) {
      showToast("Please provide a reason for the stock change", "error");
      return;
    }

    setIsLoading(true);
    try {
      await onStockUpdate(product._id, newStock, reason);
      showToast("Stock updated successfully", "success");
      onClose();
    } catch (error) {
      console.error("Failed to update stock:", error);
      showToast("Failed to update stock", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const getStockChangeColor = () => {
    if (stockChange > 0) return "text-green-600";
    if (stockChange < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getStockChangeIcon = () => {
    if (stockChange > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (stockChange < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return null;
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { status: "Out of Stock", color: "bg-red-100 text-red-800" };
    if (stock <= 10) return { status: "Low Stock", color: "bg-yellow-100 text-yellow-800" };
    return { status: "In Stock", color: "bg-green-100 text-green-800" };
  };

  if (!product) return null;

  const stockStatus = getStockStatus(newStock);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Stock Management
          </DialogTitle>
          <DialogDescription>
            Update stock quantity for {product.product_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Information */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Product Name</Label>
                  <p className="font-medium">{product.product_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">SKU Code</Label>
                  <p className="font-mono text-sm">{product.sku_code}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Current Stock</Label>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{product.no_of_stock || 0}</span>
                    <Badge className={stockStatus.color}>
                      {stockStatus.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Selling Price</Label>
                  <p className="font-medium">₹{product.selling_price || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Stock Update Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="newStock" className="text-sm font-medium">
                New Stock Quantity
              </Label>
              <Input
                id="newStock"
                type="number"
                min={0}
                value={newStock}
                onChange={(e) => handleStockChange(e.target.value)}
                className="mt-1"
                placeholder="Enter new stock quantity"
              />
            </div>

            {/* Stock Change Indicator */}
            {stockChange !== 0 && (
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                stockChange > 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                {getStockChangeIcon()}
                <span className={`font-medium ${getStockChangeColor()}`}>
                  {stockChange > 0 ? '+' : ''}{stockChange} units
                </span>
                <span className="text-sm text-gray-600">
                  {stockChange > 0 ? 'Stock increase' : 'Stock decrease'}
                </span>
              </div>
            )}

            <div>
              <Label htmlFor="reason" className="text-sm font-medium">
                Reason for Stock Change
              </Label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1 w-full p-3 border border-gray-300 rounded-md resize-none"
                rows={3}
                placeholder="Enter reason for stock change (e.g., New shipment received, Damaged items, etc.)"
              />
            </div>

            {/* Stock Alerts */}
            {newStock === 0 && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-700">
                  Warning: Setting stock to 0 will mark this product as out of stock
                </span>
              </div>
            )}

            {newStock > 0 && newStock <= 10 && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-700">
                  Low stock alert: Consider reordering soon
                </span>
              </div>
            )}

            {newStock > (product.no_of_stock || 0) && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">
                  Stock replenishment: Good for inventory management
                </span>
              </div>
            )}
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
              disabled={isLoading || !reason.trim() || newStock < 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Updating..." : "Update Stock"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
