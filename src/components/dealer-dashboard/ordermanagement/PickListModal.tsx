"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, CheckCircle, Package } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DealerPickList } from "@/types/dealerOrder-types";

interface PickListModalProps {
  isOpen: boolean;
  onClose: () => void;
  pickLists: DealerPickList[];
  orderId: string;
  orderStatus: string; // Add order status prop
  onMarkAsPacked: (totalWeightKg: number) => void;
}

export default function PickListModal({
  isOpen,
  onClose,
  pickLists,
  orderId,
  orderStatus, // Add order status parameter
  onMarkAsPacked,
}: PickListModalProps) {
  const [totalWeight, setTotalWeight] = useState<number>(0);
  const [isPacking, setIsPacking] = useState(false);

  // Check if order is already packed
  const isOrderPacked = orderStatus === "Packed" || orderStatus === "packed";
  const isOrderShipped = orderStatus === "Shipped" || orderStatus === "shipped";
  const isOrderDelivered = orderStatus === "Delivered" || orderStatus === "delivered";

  // Reset weight when modal opens
  useEffect(() => {
    if (isOpen) {
      setTotalWeight(0);
      setIsPacking(false);
    }
  }, [isOpen]);

  const handleMarkAsPacked = async () => {
    if (totalWeight <= 0) {
      alert("Please enter a valid total weight");
      return;
    }
    
    setIsPacking(true);
    try {
      await onMarkAsPacked(totalWeight);
      // Modal will be closed by parent component after successful API call
    } catch (error) {
      console.error("Failed to mark as packed:", error);
      // Don't close modal on error - let parent handle it
    } finally {
      setIsPacking(false);
    }
  };

  const getStatusDisplay = () => {
    if (isOrderPacked) {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">Order Already Packed</span>
        </div>
      );
    }
    if (isOrderShipped) {
      return (
        <div className="flex items-center gap-2 text-blue-600">
          <Package className="h-5 w-5" />
          <span className="font-medium">Order Shipped</span>
        </div>
      );
    }
    if (isOrderDelivered) {
      return (
        <div className="flex items-center gap-2 text-green-700">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">Order Delivered</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 text-gray-600">
        <Package className="h-5 w-5" />
        <span className="font-medium">Ready to Pack</span>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold text-red-600">
            Pick List - Order {orderId}
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </DialogHeader>

        {/* Order Status Display */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
          {getStatusDisplay()}
        </div>

        <div className="mt-4">
          {pickLists.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No pick list found for this order</p>
            </div>
          ) : (
            pickLists.map((pickList) => (
              <div key={pickList._id} className="mb-8 border border-red-200 rounded-lg p-4">
                <div className="mb-2 text-sm text-gray-700">
                  <span className="font-semibold">Pick List ID:</span> {pickList._id} <br />
                  <span className="font-semibold">Scan Status:</span> {pickList.scanStatus} <br />
                  <span className="font-semibold">Invoice Generated:</span> {pickList.invoiceGenerated ? "Yes" : "No"}
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-200 bg-gray-50/50">
                      <TableHead className="text-gray-700 font-medium px-4 py-3 text-left">SKU</TableHead>
                      <TableHead className="text-gray-700 font-medium px-4 py-3 text-left">Quantity</TableHead>
                      <TableHead className="text-gray-700 font-medium px-4 py-3 text-left">Barcode</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pickList.skuList.map((item) => (
                      <TableRow key={item._id} className="border-b border-gray-100">
                        <TableCell className="px-4 py-3 font-medium text-gray-900">{item.sku}</TableCell>
                        <TableCell className="px-6 py-3 text-gray-900">{item.quantity}</TableCell>
                        <TableCell className="px-4 py-3 text-gray-600 font-mono text-sm">{item.barcode}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
                         ))
           )}
         </div>
         
         {/* Bottom Section - Total Weight Input and Packed Button */}
         <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
           {/* Total Weight Input - Left Side */}
           <div className="flex items-center gap-2">
             <Label htmlFor="totalWeight" className="text-sm font-medium text-gray-700">
               Total Weight (kg):
             </Label>
             <Input
               id="totalWeight"
               type="number"
               min="0"
               step="0.1"
               value={totalWeight}
               onChange={(e) => setTotalWeight(parseFloat(e.target.value) || 0)}
               className="w-24 h-9"
               placeholder="0.0"
               disabled={isOrderPacked || isOrderShipped || isOrderDelivered}
             />
           </div>
           
           {/* Packed Button - Right Side */}
           <Button
             onClick={handleMarkAsPacked}
             disabled={isOrderPacked || isOrderShipped || isOrderDelivered || isPacking}
             className={`px-6 py-2 rounded-lg ${
               isOrderPacked || isOrderShipped || isOrderDelivered
                 ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                 : "bg-green-600 hover:bg-green-700 text-white"
             }`}
           >
             {isPacking ? "Packing..." : 
              isOrderPacked ? "Already Packed" :
              isOrderShipped ? "Order Shipped" :
              isOrderDelivered ? "Order Delivered" : "Packed"
             }
           </Button>
         </div>
       </DialogContent>
     </Dialog>
  );
}