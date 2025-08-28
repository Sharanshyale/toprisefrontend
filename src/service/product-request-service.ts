import apiClient from "@/apiClient";
import {
  ProductRequestResponse,
  ProductRequestStatsResponse,
  CreateProductRequestRequest,
  UpdateProductRequestRequest,
  ProductRequestFilters,
  ProductRequest,
} from "@/types/product-request-Types";

// Get all product requests with pagination and filters
export async function getProductRequests(
  page: number = 1,
  limit: number = 10,
  filters?: ProductRequestFilters
): Promise<ProductRequestResponse> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters &&
        Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined)
        )),
    });

    const response = await apiClient.get(`/category/products/v1/pending`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch product requests:", error);
    throw error;
  }
}

// // Get product request statistics
// export async function getProductRequestStats(): Promise<ProductRequestStatsResponse> {
//   try {
//     const response = await apiClient.get(
//       `/category/products/v1/requests/stats`
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Failed to fetch product request stats:", error);
//     throw error;
//   }
// }

// // Get a single product request by ID
// export async function getProductRequestById(
//   id: string
// ): Promise<{ success: boolean; message: string; data: ProductRequest }> {
//   try {
//     const response = await apiClient.get(
//       `/category/products/v1/requests/${id}`
//     );
//     return response.data;
//   } catch (error) {
//     console.error(`Failed to fetch product request ${id}:`, error);
//     throw error;
//   }
// }

// Create a new product request
export async function createProductRequest(
  data: CreateProductRequestRequest
): Promise<{ success: boolean; message: string; data: ProductRequest }> {
  try {
    const response = await apiClient.post(
      `/category/products/v1/requests`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Failed to create product request:", error);
    throw error;
  }
}

// Update a product request
export async function updateProductRequest(
  id: string,
  data: UpdateProductRequestRequest
): Promise<{ success: boolean; message: string; data: ProductRequest }> {
  try {
    const response = await apiClient.patch(
      `/category/products/v1/requests/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to update product request ${id}:`, error);
    throw error;
  }
}

// Delete a product request
export async function deleteProductRequest(
  id: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiClient.delete(
      `/category/products/v1/requests/${id}`
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to delete product request ${id}:`, error);
    throw error;
  }
}

// Approve a product request
export async function approveProductRequest(
  id: string,
  reviewNotes?: string
): Promise<{ success: boolean; message: string; data: ProductRequest }> {
  try {
    const response = await apiClient.patch(
      `/category/products/v1/requests/${id}/approve`,
      {
        reviewNotes,
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to approve product request ${id}:`, error);
    throw error;
  }
}

// Reject a product request
export async function rejectProductRequest(
  id: string,
  reviewNotes: string
): Promise<{ success: boolean; message: string; data: ProductRequest }> {
  try {
    const response = await apiClient.patch(
      `/category/products/v1/requests/${id}/reject`,
      {
        reviewNotes,
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to reject product request ${id}:`, error);
    throw error;
  }
}

// Put request in review
export async function putRequestInReview(
  id: string,
  reviewNotes?: string
): Promise<{ success: boolean; message: string; data: ProductRequest }> {
  try {
    const response = await apiClient.patch(
      `/category/products/v1/requests/${id}/review`,
      {
        reviewNotes,
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to put product request ${id} in review:`, error);
    throw error;
  }
}

// Bulk approve product requests
export async function bulkApproveProductRequests(
  requestIds: string[]
): Promise<{ success: boolean; message: string; data: ProductRequest[] }> {
  try {
    const response = await apiClient.patch(
      `/category/products/v1/requests/bulk/approve`,
      {
        requestIds,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to bulk approve product requests:", error);
    throw error;
  }
}

// Bulk reject product requests
export async function bulkRejectProductRequests(
  requestIds: string[],
  reviewNotes: string
): Promise<{ success: boolean; message: string; data: ProductRequest[] }> {
  try {
    const response = await apiClient.patch(
      `/category/products/v1/requests/bulk/reject`,
      {
        requestIds,
        reviewNotes,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to bulk reject product requests:", error);
    throw error;
  }
}

// Export product requests to CSV
export async function exportProductRequests(
  filters?: ProductRequestFilters
): Promise<Blob> {
  try {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get(
      `/category/products/v1/requests/export?${params}`,
      {
        responseType: "blob",
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to export product requests:", error);
    throw error;
  }
}

// Get requests by user
export async function getProductRequestsByUser(
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<ProductRequestResponse> {
  try {
    const response = await apiClient.get(
      `/category/products/v1/requests/user/${userId}?page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Failed to fetch product requests for user ${userId}:`,
      error
    );
    throw error;
  }
}

// Get requests by product
export async function getProductRequestsByProduct(
  productId: string,
  page: number = 1,
  limit: number = 10
): Promise<ProductRequestResponse> {
  try {
    const response = await apiClient.get(
      `/category/products/v1/requests/product/${productId}?page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Failed to fetch product requests for product ${productId}:`,
      error
    );
    throw error;
  }
}
