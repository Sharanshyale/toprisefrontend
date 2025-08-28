import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  addToCartRequest, 
  addToCartSuccess, 
  addToCartFailure,
  setCartData,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  setCartLoading
} from '@/store/slice/cart/cartSlice';
import { addToCart, getCart, removeProductFromCart } from '@/service/user/cartService';
import { Cart } from '@/types/User/cart-Types';

export const useCart = () => {
  const dispatch = useAppDispatch();
  const { cartData, loading, error, itemCount } = useAppSelector((state) => state.cart);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !user?._id) {
      dispatch(clearCart());
      return;
    }

    try {
      dispatch(setCartLoading(true));
      const response = await getCart(user._id);
      if (response.success && response.data) {
        dispatch(setCartData(response.data));
      }
    } catch (err: any) {
      console.error('Failed to fetch cart:', err);
     
    } finally {
      dispatch(setCartLoading(false));
    }
  }, [dispatch, isAuthenticated, user?._id]);

  const addItemToCart = useCallback(async (productId: string, quantity: number = 1) => {
    if (!isAuthenticated || !user?._id) {
      throw new Error('User not authenticated');
    }

    try {
      dispatch(addToCartRequest());
      const response = await addToCart({ userId: user._id, productId, quantity });
      
      if (response.success && response.data) {
        dispatch(addToCartSuccess(response.data));
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to add item to cart');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to add item to cart';
      dispatch(addToCartFailure(errorMessage));
      throw err;
    }
  }, [dispatch, isAuthenticated, user?._id]);

  const updateItemQuantity = useCallback(async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    // Optimistically update the UI
    dispatch(updateCartItemQuantity({ itemId, quantity: newQuantity }));

    // TODO: Add API call to update quantity on server
    // For now, we'll just update the local state
  }, [dispatch]);

  const removeItemFromCart = useCallback(async (itemId: string) => {
    if (!isAuthenticated || !user?._id) {
      return;
    }

    try {
      // Optimistically remove from UI
      dispatch(removeFromCart(itemId));
      
      // Call API to remove from server
      await removeProductFromCart(itemId);
    } catch (err: any) {
      console.error('Failed to remove item from cart:', err);
      // Revert the optimistic update by refetching cart
      await fetchCart();
    }
  }, [dispatch, isAuthenticated, user?._id, fetchCart]);

  const clearCartData = useCallback(() => {
    dispatch(clearCart());
  }, [dispatch]);

  return {
    cartData,
    loading,
    error,
    itemCount,
    fetchCart,
    addItemToCart,
    updateItemQuantity,
    removeItemFromCart,
    clearCartData,
  };
};
