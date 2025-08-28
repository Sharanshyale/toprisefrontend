"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import DynamicButton from "@/components/common/button/button";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/types/User/cart-Types";

interface CartSidebarProps {
  cart: any;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  handleQuantityChange: (itemId: string, newQuantity: number) => void;
  removeFromCart: (itemId: string) => void;
  calculateTotal: () => number;
}

export const CartSidebar = ({
  cart,
  cartOpen,
  setCartOpen,
  handleQuantityChange,
  removeFromCart,
  calculateTotal,
}: CartSidebarProps) => {
  const router = useRouter();

  const handleCheckout = () => {
    setCartOpen(false);
    router.push('/shop/checkout');
  };

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetTrigger asChild>
        <DynamicButton
          variant="ghost"
          className="text-gray-600 hover:text-red-600 relative"
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {cart?.items?.length ?? 0}
          </span>
        </DynamicButton>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="text-xl font-semibold">Shopping Cart</SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col h-full max-h-[calc(100vh-120px)]">
          {cart?.items && cart.items.length > 0 ? (
            <>
              <div className="flex-1 overflow-y-auto py-4 min-h-0">
                {cart.items.map((item: CartItem) => (
                  <div key={item._id} className="flex items-center gap-3 p-3 border-b border-gray-200">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0">
                      {item.product_image && item.product_image[0] && (
                        <img
                          src={item.product_image[0]}
                          alt={item.product_name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{item.product_name}</h4>
                      <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                      <p className="text-sm font-medium text-gray-900">₹{item.selling_price}</p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        onClick={() => removeFromCart(item._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex-shrink-0 border-t border-gray-200 pt-4 pb-4 px-1 bg-white">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>₹{cart.total_mrp?.toFixed(2)}</span>
                  </div>
                   <div className="flex justify-between text-sm">
                    <span>GST+Tax:</span>
                    <span>+ ₹{cart.total_mrp_gst_amount?.toFixed(2)}</span>
                  </div>
                  {cart.deliveryCharge > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Delivery:</span>
                      <span>₹{cart.deliveryCharge.toFixed(2)}</span>
                    </div>
                  )}
                  {cart.handlingCharge > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Handling:</span>
                      <span>₹{cart.handlingCharge.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-lg border-t border-gray-200 pt-2">
                    <span>Total:</span>
                    <span>₹{cart.total_mrp_with_gst?.toFixed(2) || calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
                
                <DynamicButton 
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg shadow-sm"
                  text="Proceed to Checkout"
                  onClick={handleCheckout}
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-4">Add some items to get started</p>
              <Button onClick={() => setCartOpen(false)}>
                Continue Shopping
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};