import apiClient from "@/apiClient";
import { CartResponse } from "@/types/User/cart-Types";

export async function addToCart(data: any): Promise<CartResponse> {
  try {
    const response = await apiClient.post(`/orders/api/carts/addProduct`, data);
    return response.data;
  } catch (error) {
    console.error("Failed to add product to cart:", error);
    throw error;
  }
}

export async function getCart(id: string): Promise<CartResponse> {
  try {
    const response = await apiClient.get(`orders/api/carts/getCart/${id}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch cart:", error);
    throw error;
  }
}

export async function addAddress(id: string, data: any): Promise<any> {
  try {
    const response = await apiClient.put(`/users/api/users/updateAddress/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Failed to update address:", error);
    throw error;
  }
}

export async function createOrders(data: any): Promise<any> {
  try {
    const response = await apiClient.post(`/orders/api/orders/create`, data);
    return response.data;
  } catch (error) {
    console.error("Failed to create order:", error);
    throw error;
  }
}

export async function removeProductFromCart(itemId: string): Promise<any> {
  try {
    const response = await apiClient.post(`/orders/api/carts/removeProduct`, { itemId });
    return response.data;
  } catch (err: any) {
    console.error("Failed to remove product from cart:", err);
    throw err;
  }
}