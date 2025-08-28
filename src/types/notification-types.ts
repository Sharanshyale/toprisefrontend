export interface NotificationReferences {
  model_id?: string
  product_id?: string
}

export interface Notification {
  _id: string
  userId: string
  templateId: string | null
  actionId: string | null
  notification_type: string
  references: NotificationReferences | null
  deepLink: string
  notification_title: string
  notification_body: string
  webRoute: string
  markAsRead: boolean
  isUserDeleted: boolean
  userDeletedAt: string | null
  createdAt: string
  markAsReadAt: string | null
  updatedAt: string
  __v: number
}

export interface NotificationResponse {
  success: boolean
  message: string
  data: Notification[]
}

export interface SingleNotificationResponse {
  success: boolean
  message: string
  data: Notification
}

export interface MarkAllResponse {
  success: boolean
  message: string
  data: null
}
