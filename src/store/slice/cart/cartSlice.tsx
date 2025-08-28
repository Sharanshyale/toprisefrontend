import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Cart, CartItem } from '@/types/User/cart-Types';

interface CartState {
  cartData: Cart | null;
  loading: boolean;
  error: string | null;
  itemCount: number;
}

const initialState: CartState = {
  cartData: null,
  loading: false,
  error: null,
  itemCount: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCartRequest(state) {
      state.loading = true;
      state.error = null;
    },
    addToCartSuccess(state, action: PayloadAction<Cart>) {
      state.cartData = action.payload;
      state.loading = false;
      state.error = null;
      state.itemCount = action.payload.items?.length || 0;
    },
    addToCartFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    setCartData(state, action: PayloadAction<Cart>) {
      state.cartData = action.payload;
      state.itemCount = action.payload.items?.length || 0;
      state.error = null;
    },
    updateCartItemQuantity(state, action: PayloadAction<{ itemId: string; quantity: number }>) {
      if (state.cartData) {
        const { itemId, quantity } = action.payload;
        const itemIndex = state.cartData.items.findIndex(item => item._id === itemId);
        if (itemIndex !== -1) {
          state.cartData.items[itemIndex].quantity = quantity;
          // Recalculate totals
          state.cartData.itemTotal = state.cartData.items.reduce((total, item) => total + item.quantity, 0);
          state.cartData.totalPrice = state.cartData.items.reduce((total, item) => total + item.product_total, 0);
        }
      }
    },
    removeFromCart(state, action: PayloadAction<string>) {
      if (state.cartData) {
        state.cartData.items = state.cartData.items.filter(item => item._id !== action.payload);
        state.itemCount = state.cartData.items.length;
        // Recalculate totals
        state.cartData.itemTotal = state.cartData.items.reduce((total, item) => total + item.quantity, 0);
        state.cartData.totalPrice = state.cartData.items.reduce((total, item) => total + item.product_total, 0);
      }
    },
    clearCart(state) {
      state.cartData = null;
      state.loading = false;
      state.error = null;
      state.itemCount = 0;
    },
    setCartLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const { 
  addToCartRequest, 
  addToCartSuccess, 
  addToCartFailure,
  setCartData,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  setCartLoading
} = cartSlice.actions;

export default cartSlice.reducer;
