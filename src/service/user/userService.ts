import apiClient from "@/apiClient";

export const getUserById = async (userId: string) => {
  const response = await apiClient.get(`/users/api/users/${userId}`);
  return response.data;
};


