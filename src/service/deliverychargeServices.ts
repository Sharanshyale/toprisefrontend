import apiClient from "@/apiClient"
import type { AppSettingsResponse, UpdateAppSettingsRequest } from "../types/deliverycharge-Types"

export async function getAppSettings(): Promise<AppSettingsResponse> {
  const response = await apiClient.get("/users/api/appSetting")
  return response.data
}

export async function updateAppSettings(updateData: UpdateAppSettingsRequest): Promise<AppSettingsResponse> {
  const response = await apiClient.patch("/users/api/appSetting", updateData)
  return response.data
}
