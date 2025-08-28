export interface TicketResponse {
  success: boolean;
  message: string;
  data: Ticket[];
}

export interface Ticket {
  _id: string;
  userRef: string;
  order_id: string | null;
  updated_by: string | null;
  status: TicketStatus;
  description: string;
  attachments: string[];
  ticketType: TicketType;
  assigned: boolean;
  assigned_to: string;
  involved_users: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  admin_notes?: string;
}

export type TicketStatus = 
  | "Open" 
  | "In Progress" 
  | "Closed" 
  | "Pending" 
  | "Resolved";

export type TicketType = 
  | "General" 
  | "Order" 
  | "Technical" 
  | "Billing" 
  | "Support";

export interface CreateTicketPayload {
  userRef: string;
  order_id?: string | null;
  description: string;
  attachments?: string[];
  ticketType: TicketType;
}

export interface UpdateTicketPayload {
  status?: TicketStatus;
  description?: string;
  assigned_to?: string;
  admin_notes?: string;
  involved_users?: string[];
}
