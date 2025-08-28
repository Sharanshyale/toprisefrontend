import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Product } from "@/types/dealer-productTypes";

interface UpdateStockModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  loading: boolean;
  product: Product | null;
  quantity: number;
  setQuantity: (q: number) => void;
}

const UpdateStockModal: React.FC<UpdateStockModalProps> = ({
  open,
  onClose,
  onSubmit,
  loading,
  product,
  quantity,
  setQuantity,
}) => {
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setQuantity(value);
    } else if (e.target.value === '') {
      setQuantity(0);
    }
  };

  const handleSubmit = () => {
    if (quantity < 0) {
      return;
    }
    onSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="text-lg font-semibold">Update Stock</DialogTitle>
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Product:</div>
            <div className="font-medium text-gray-900">{product?.product_name || "Unknown Product"}</div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Quantity</label>
            <Input
              type="number"
              min={0}
              value={quantity}
              onChange={handleQuantityChange}
              disabled={loading}
              placeholder="Enter quantity"
              className="w-full"
            />
            <p className="text-xs text-gray-500">Enter the new stock quantity for this product</p>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              onClick={handleSubmit}
              disabled={loading || quantity < 0}
            >
              {loading ? "Updating..." : "Update Stock"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateStockModal;