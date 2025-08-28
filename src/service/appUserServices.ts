// import apiClient from "@/apiClient";

// export interface AppUser {
// 	_id: string;
// 	email?: string;
// 	username?: string;
// 	phone_Number?: string;
// 	role?: string;
// 	last_login?: string;
// 	cartId?: string | null;
// 	wishlistId?: string | null;
// 	fcmToken?: string | null;
// 	address?: any[];
// 	vehicle_details?: any[];
// }

// export interface ApiListResponse<T> {
// 	success: boolean;
// 	message: string;
// 	data: T;
// }

// // Fetch all application users (customers)
// export async function getAllAppUsers(): Promise<ApiListResponse<AppUser[]>> {
// 	const response = await apiClient.get("/users/api/users/all/users");
// 	return response.data;
// }


