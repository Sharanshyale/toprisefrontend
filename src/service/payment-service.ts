import { PaymentDetailsResponse, PaymentDetailByIdResponse } from "@/types/paymentDetails-Types";
import apiClient from "@/apiClient";




export async function getPaymentDetails(page: number, limit: number): Promise<PaymentDetailsResponse> {
    try {
      const response = await apiClient.get(`orders/api/payments/all?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.log("error in payment service",error)
      throw error;
    }
  }
export async function getPaymentDetailsById(id: string): Promise<PaymentDetailByIdResponse> {
    try {
      const response = await apiClient.get(`orders/api/payments/by-id/${id}`);
      return response.data;
    } catch (error) {
      console.log("error in payment service",error)
      throw error;
    }
  }