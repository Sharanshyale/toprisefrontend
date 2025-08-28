import { ProductResponse } from "@/types/product-Types";
import { ApiResponse } from "@/types/apiReponses-Types";
import type { Category as ProductCategory } from "@/types/product-Types";
import apiClient from "@/apiClient";

export async function getProducts(): Promise<ProductResponse> {
  try {
    const response = await apiClient.get(`/category/products/v1`);
    return response.data;
  } catch (error) {
    console.error(" Failed to fetch products:", error);
    throw error;
  }
}
export async function getProductsByPage(page: number, limit: number,status?:string): Promise<ProductResponse> {
  try {
       let url = `/category/products/v1/get-all-products/pagination?page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error(" Failed to fetch products:", error);
    throw error;
  }
}
//get products by dealer added
export async function getDealerProductsByPage(page: number, limit: number,status?:string): Promise<ProductResponse> {
  try {
       let url = `/category/products/v1/getProducts/byDealer?pageNumber=${page}&limitNumber=${limit}`;
    if (status) {
      url += `&status=${status}`;
    
    }
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error(" Failed to fetch products:", error);
    throw error;
  }
}

export async function uploadBulkProducts(
  formData: FormData
): Promise<ProductResponse> {
  try {
    const response = await apiClient.post(`/category/products/v1/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to upload bulk products:", error);
    throw error;
  }
}
export async function exportCSV(
): Promise<any> {
  try {
    const response = await apiClient.get(`/category/products/v1/export`);
    return response.data;
  } catch (error) {
    console.error("Failed to export CSV:", error);
    throw error;
  }
}
export async function aproveProduct(
  productId: string
): Promise<ProductResponse> {
  try {
    const response = await apiClient.patch(
      `/category/products/v1/approve/${productId}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to approve product:", error);
    throw error;
  }
}
/**
 * Rejects a product by sending a PATCH request with rejection details
 * @param data - FormData containing rejection information
 * @param productId - Unique identifier of the product to reject
 * @returns Promise resolving to the product rejection response
 * @throws Re-throws any API errors after logging
 */
export async function rejectProduct(
  data: FormData,
  productId: string
): Promise<ProductResponse> {
  try {
    const { data: responseData } = await apiClient.patch(
      `/category/products/v1/reject/${productId}`,
      data
    );
    return responseData;
  } catch (error) {
    console.error(`Failed to reject product ${productId}:`, error);
    throw error;
  }
}

export async function deactivateProduct(
  productId: string
): Promise<ProductResponse> {
  try {
    const response = await apiClient.patch(
      `/category/products/v1/deactivate/${productId}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to approve product:", error);
    throw error;
  }
}
export async function approveBulkProducts
(
  data: string | any
): Promise<ProductResponse> {
  try {
    const response = await apiClient.patch(
      `/category/products/v1/bulk/approve`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Failed to approve product:", error);
    throw error;
  }
}
export async function deactivateBulkProducts
(
  data: string | any
): Promise<ProductResponse> {
  try {
    const response = await apiClient.patch(
      `/category/products/v1/deactivateProduct/bulk`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Failed to  deactivate product:", error);
    throw error;
  }
}
export async function rejectBulkProducts
(
  data: string | any
): Promise<ProductResponse> {
  try {
    const response = await apiClient.patch(
      `/category/products/v1/bulk/reject`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Failed to reject product:", error);
    throw error;
  }
}

// New endpoints for product approval requests
export async function getPendingProducts(page?: number, limit?: number): Promise<ProductResponse> {
  try {
    let url = `/category/products/v1/pending`;
    if (page && limit) {
      url += `?page=${page}&limit=${limit}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch pending products:", error);
    throw error;
  }
}

export async function approveSingleProduct(productId: string): Promise<ProductResponse> {
  try {
    const response = await apiClient.patch(`/category/products/v1/approve/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to approve product:", error);
    throw error;
  }
}

export async function rejectSingleProduct(productId: string, rejectionReason?: string): Promise<ProductResponse> {
  try {
    const data = rejectionReason ? { rejectionReason } : {};
    const response = await apiClient.patch(`/category/products/v1/reject/${productId}`, data);
    return response.data;
  } catch (error) {
    console.error("Failed to reject product:", error);
    throw error;
  }
}

// Categories API returns an array of categories
export async function getCategories(): Promise<ApiResponse<ProductCategory[]>> {
  try {
    const response = await apiClient.get(`/category/api/category`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    throw error;
  }
}

export async function getBrand(): Promise<ProductResponse> {
  try {
    const response = await apiClient.get(`/category/api/brands`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch brands:", error);
    throw error;
  }
}
export async function createCategory(data:FormData):Promise<any>{
  try{
    const response = await apiClient.post(`/category/api/category`,data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  }
  catch(err:any){
    console.error("Failed to create category:", err);
    throw err
  }
}
export async function createSubCategory(data:FormData):Promise<any>{
  try{
    const response = await apiClient.post(`/subCategory/api/subCategory`,data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  }
  catch(err:any){
    console.error("Failed to create category:", err);
    throw err
  }
}

export async function createModel(data:FormData):Promise<any>{
  try{
    const response = await apiClient.post(`/category/api/model`,data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  }
  catch(err:any){
    console.error("Failed to create category:", err);
    throw err
  }
}
export async function createBrand(data:FormData):Promise<any>{
  try{
    const response = await apiClient.post(`/category/api/brands`,data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  }
  catch(err:any){
    console.error("Failed to create category:", err);
    throw err
  }
}
export async function createVariant(data:FormData):Promise<any>{
  try{
    const response = await apiClient.post(`/subCategory/variants/`,data, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response.data
  }
  catch(err:any){
    console.error("Failed to create category:", err);
    throw err
  }
}

export async function createVariants(data:FormData):Promise<ProductResponse>{
  try{
     const response = await apiClient.post(`/subCategory/variants/`,data,{
       headers: {
         'Content-Type': 'application/json',
       },
     })
     return response.data
  }
  catch(err:any){
    console.error("Failed to create category:", err);
    throw err
  }
}

export async function getSubCategories(): Promise<ProductResponse> {
  try {
    const response = await apiClient.get(`/subCategory/api/subCategory`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    throw error;
  }
}
export async function getModels(): Promise<ProductResponse> {
  try {
    const response = await apiClient.get(`/category/api/model`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    throw error;
  }
}

export async function getvarient(): Promise<ProductResponse> {
  try {
    const response = await apiClient.get(`/subCategory/variants/`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    throw error;
  }
}
export async function getTypes(): Promise<ProductResponse> {
  try {
    const response = await apiClient.get(`/category/api/types`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    throw error;
  }
}

export async function getProductById(
  productId: string
): Promise<ProductResponse> {
  try {
    const response = await apiClient.get(
      `/category/products/v1/get-ProductById/${productId}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch product by ID:", error);
    throw error;
  }
}


export async function getBrandByType(id: string): Promise<ProductResponse> {
  try {
    const response = await apiClient.get(
      `/category/api/brands/brandByType/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    throw error;
  }
}

export async function getModelByBrand(id: string): Promise<ProductResponse> {
  try {
    const response = await apiClient.get(`/category/api/model/brand/${id}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    throw error;
  }
}
export async function getYearRange(): Promise<ProductResponse> {
  try {
    const response = await apiClient.get(`/category/api/year`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch year range:", error);
    throw error;
  }
}

export async function getvarientByModel(id: string): Promise<ProductResponse> {
  try {
    const response = await apiClient.get(`/category/variants/model/${id}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch varients:", error);
    throw error;
  }
}

export async function editProduct(
  productId: string,
  data: FormData | any
): Promise<ProductResponse> {
  try {
    const response = await apiClient.put(
      `/category/products/v1/updateProduct/${productId}`,
      data
      
    );
    return response.data;
  } catch (error) {
    console.error("Failed to edit product:", error);
    throw error;
  }
}

export async function addProduct(productData:FormData | any): Promise<ProductResponse> {
  try {
    const response = await apiClient.post(
      `/category/products/v1/createProduct`,
      productData
    );
    return response.data;
  } catch (error) {
    console.error("Failed to add product:", error);
    throw error;
  }
}

// dealer dashboard product add
// api/category/products/v1/createProductByDealer

export async function addProductByDealer(
  productData: FormData | any
): Promise<ProductResponse> {
  try {
    const response = await apiClient.post(
      `/category/products/v1/createProductByDealer`,
      productData
    );
    return response.data;
  } catch (error) {
    console.error("Failed to add product by dealer:", error);
    throw error;
  }
}

export async function editBulkProducts(
  formData: FormData
): Promise<ProductResponse> {
  try {
    const response = await apiClient.put(`/category/products/v1/bulk-edit`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to upload bulk products:", error);
    throw error;
  }
}


export async function uploadLogs(
): Promise<ProductResponse> {
  try {
    const response = await apiClient.get(`/category/products/v1/get-all-productLogs`);
    return response.data;
  } catch (error) {
    console.error("Failed to upload logs:", error);
    throw error;
  }
}

// Content Management Bulk Upload APIs
export async function uploadBulkCategories(
  formData: FormData
): Promise<ProductResponse> {
  try {
    const response = await apiClient.post(`/category/api/category/bulk-upload/categories`, formData);
    return response.data;
  } catch (error) {
    console.error("Failed to upload bulk categories:", error);
    throw error;
  }
}

export async function uploadBulkSubCategories(
  formData: FormData
): Promise<ProductResponse> {
  try {
    const response = await apiClient.post(`/category/api/subCategory/bulk-upload/subcategories`, formData);
    return response.data;
  } catch (error) {
    console.error("Failed to upload bulk subcategories:", error);
    throw error;
  }
}

export async function uploadBulkBrands(
  formData: FormData
): Promise<ProductResponse> {
  try {
    const response = await apiClient.post(`/category/api/brands/bulk-upload/brands`, formData);
    return response.data;
  } catch (error) {
    console.error("Failed to upload bulk brands:", error);
    throw error;
  }
}

export async function uploadBulkModels(
  formData: FormData
): Promise<ProductResponse> {
  try {
    const response = await apiClient.post(`/category/api/model/bulk-upload/models`, formData);
    return response.data;
  } catch (error) {
    console.error("Failed to upload bulk models:", error);
    throw error;
  }
}

export async function uploadBulkVariants(
  formData: FormData
): Promise<ProductResponse> {
  try {
    const response = await apiClient.post(`/category/variants/bulk-upload/varients`, formData);
    return response.data;
  } catch (error) {
    console.error("Failed to upload bulk variants:", error);
    throw error;
  }
}



