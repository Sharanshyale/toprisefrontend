// lib/schemas/employee-schema.ts
import { z } from "zod";

export const employeeSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  mobileNumber: z.string().min(1, "Mobile Number is required"),
  role: z.string().min(1, "Role is required"),
  employeeId: z.string().min(1, "Employee ID is required"),
  fullName: z.string().min(1, "Full Name is required"),
  profile_image: z.instanceof(File).optional(),
  roleDescription: z.string().optional(),
  accessLevel: z.string().optional(),
  assignedDealer: z.string().optional(),
  assignedRegion: z.array(z.string()).optional(),
  remarks: z.string().optional(),
  auditTrail: z.string().optional(),
  sendLoginInvite: z.boolean().optional(),
  temporaryPassword: z.string().optional(),
  currentStatus: z.string().optional(),
  lastLogin: z.string().optional(),
  createdBy: z.string().optional(),
  assignedOrdersPicklists: z.array(z.string()).optional(),
  slaType: z.string().optional(),
  slaMaxDispatchTime: z.string().optional(),

  // Optional file upload for profile image
  // profile_image is handled separately as a File object, not part of the Zod schema for form inputs
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;
