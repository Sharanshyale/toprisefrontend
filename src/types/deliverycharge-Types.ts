export interface SMTPAuth {
  user: string
  pass: string
}

export interface SMTPConfig {
  fromName: string
  fromEmail: string
  host: string
  port: number
  secure: boolean
  auth: SMTPAuth
}

export interface Versioning {
  web: string
  android: string
  ios: string
  _id?: string
}

export interface ServiceableArea {
  lat: number
  long: number
  _id?: string
}

export interface AppSettings {
  _id?: string
  deliveryCharge: number
  minimumOrderValue: number
  smtp: SMTPConfig
  versioning: Versioning
  servicableAreas: ServiceableArea[]
  supportEmail: string
  supportPhone: string
  tnc: string
  privacyPolicy: string
  createdAt?: string
  updatedAt?: string
  __v?: number
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface AppSettingsResponse extends ApiResponse<AppSettings> {}

export interface UpdateAppSettingsRequest {
  deliveryCharge?: number
  minimumOrderValue?: number
  smtp?: Partial<SMTPConfig>
  versioning?: Partial<Versioning>
  servicableAreas?: ServiceableArea[]
  supportEmail?: string
  supportPhone?: string
  tnc?: string
  privacyPolicy?: string
}
