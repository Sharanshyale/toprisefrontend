import apiClient from "@/apiClient"
import type { NotificationResponse, SingleNotificationResponse, MarkAllResponse } from "../types/notification-types"

// Get all notifications for a user
export const getAllNotifications = async (userId: string, markAsRead?: boolean): Promise<NotificationResponse> => {
  const params = markAsRead !== undefined ? { markAsRead } : {}
  const response = await apiClient.get<NotificationResponse>(
    `/notification/api/notification/all_userNotifications/${userId}`,
    { params },
  )
  return response.data
}

// Mark single notification as read
export const markAsRead = async (notificationId: string): Promise<SingleNotificationResponse> => {
  const response = await apiClient.put<SingleNotificationResponse>(
    `/notification/api/notification/markAsRead/${notificationId}`,
  )
  return response.data
}

// Delete single notification
export const deleteNotification = async (notificationId: string): Promise<SingleNotificationResponse> => {
  const response = await apiClient.put<SingleNotificationResponse>(
    `/notification/api/notification/markAsUserDelete/${notificationId}`,
  )
  return response.data
}

// Mark all notifications as read for a user
export const markAllAsRead = async (userId: string): Promise<MarkAllResponse> => {
  const response = await apiClient.put<MarkAllResponse>(`/notification/api/notification/markAsReadAll/${userId}`)
  return response.data
}

// Delete all notifications for a user
export const deleteAllNotifications = async (userId: string): Promise<MarkAllResponse> => {
  const response = await apiClient.put<MarkAllResponse>(`/notification/api/notification/markAsUserDeleteAll/${userId}`)
  return response.data
}
