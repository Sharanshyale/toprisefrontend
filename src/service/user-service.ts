import apiClient from "@/apiClient";
import { ApiListResponse, AppUser } from "@/types/user-types";

export async function getAllAppUsers(): Promise<ApiListResponse<AppUser[]>> {
	const response = await apiClient.get("/users/api/users/all/users");
	return response.data;
}


// get user by id
export async function getEmployeeById(id: string): Promise<any> {
    try {
        const response = await apiClient.get(`/users/api/users/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch employee with id ${id}:`, error);
        throw error;
    }
}

// get app user by id
export async function getAppUserById(id: string): Promise<ApiListResponse<AppUser>> {
	const response = await apiClient.get(`/users/api/users/${id}`);
	return response.data;
}
// // get all users
// export async function getAllEmployees(): Promise<any> {
//     try {
//         const response = await apiClient.get("/users/api/users");
//         return response.data;
//     } catch (error) {
//         console.error("Failed to fetch employees:", error);
//         throw error;
//     }
// }

// // get user by id
// export async function getEmployeeById(id: string): Promise<any> {
//     try {
//         const response = await apiClient.get(`/users/api/users/${id}`);
//         return response.data;
//     } catch (error) {
//         console.error(`Failed to fetch employee with id ${id}:`, error);
//         throw error;
//     }
// }

// // role revoke 
// export async function revokeRole(id: string, data: any): Promise<any> {
//     try {
//         const response = await apiClient.put(`/users/api/users/revoke-role/${id}`, data);
//         return response.data;
//     } catch (error) {
//         console.error(`Failed to revoke role for employee with id ${id}:`, error);
//         throw error;
//     }
// }

// // // update user by id
// // export async function updateEmployeeById(id: string, data: any): Promise<any> {
// //     try {
// //         const response = await apiClient.put(`/users/api/users/${id}`, data);
// //         return response.data;
// //     } catch (error) {
// //         console.error(`Failed to update employee with id ${id}:`, error);
// //         throw error;
// //     }
// // }