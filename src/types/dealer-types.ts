export interface Address {
  street: string
  city: string
  pincode: string
  state: string
}

export interface ContactPerson {
  name: string
  email: string
  phone_number: string
}

// Minimal shape for an assigned employee's embedded user
// API may return either an employee id string or a populated object
export interface AssignedEmployeeUserRef {
  _id: string
  // Additional fields may be present when populated; kept loose intentionally
  [key: string]: any
}

export interface AssignedEmployee {
  assigned_user: string | AssignedEmployeeUserRef | null
  status: "Active" | "Inactive"
  _id?: string
  assigned_at?: string
}

export interface User {
  _id: string
  email: string
  phone_Number: string
  role: string
}

// New interface for Category based on your provided JSON structure
export interface Category {
  main_category: boolean
  _id: string
  category_name: string
  category_code: string
  category_image: string
  category_Status: string
  category_description: string
  created_by: string
  updated_by: string
  created_at: string
  __v: number
  type?: string 
}

export interface Dealer {
  _id: string
  user_id: User
  dealerId: string
  legal_name: string
  trade_name: string
  GSTIN: string
  Pan: string
  Address: Address
  contact_person: ContactPerson
  is_active: boolean
  categories_allowed: string[]
  upload_access_enabled: boolean
  default_margin: number
  last_fulfillment_date: string
  assigned_Toprise_employee: AssignedEmployee[]
  SLA_type: string
  dealer_dispatch_time: number
  onboarding_date: string
  remarks: string
  created_at: string
  updated_at: string
  __v: number
}

export interface CreateDealerRequest {
  email: string
  password: string
  phone_Number: string
  legal_name: string
  trade_name: string
  GSTIN: string
  Pan: string
  Address: Address
  contact_person: ContactPerson
  categories_allowed: string[]
  upload_access_enabled: boolean
  default_margin: number
  last_fulfillment_date: string
  assigned_Toprise_employee: AssignedEmployee[]
  SLA_type: string
  dealer_dispatch_time: number
  onboarding_date: string
  remarks: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}
