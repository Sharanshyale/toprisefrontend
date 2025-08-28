"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { employeeSchema, type EmployeeFormValues } from "@/lib/schemas/employee-schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { UploadCloud } from "lucide-react"

export default function EditEmployee() {
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      // Pre-fill with example data for editing
      employeeId: "EMP203",
      fullName: "Victoria",
      department: "Fulfillment",
      designation: "Sr. Fulfillment Agent",
      mobileNumber: "+91 98765 43210",
      email: "mahesh@toprise.in",
      role: "manager", // Example existing role
      roleDescription: "Manages fulfillment operations",
      accessLevel: "full",
      assignedDealer: "dealer1",
      assignedRegion: ["north"],
      remarks: "Temporarily suspended due to leave",
      auditTrail: "Role changed on 2025-06-01 by USR019",
      sendLoginInvite: true,
      temporaryPassword: "password123", // Pre-filled if invite was sent
      currentStatus: "active",
      lastLogin: "2025-06-25 12:43",
      createdBy: "USR001",
      assignedOrdersPicklists: ["ORD-9032", "ORD-9044"],
      slaType: "type1",
      slaMaxDispatchTime: "24",
    },
  })

  const onSubmit = (data: EmployeeFormValues) => {
    // Handle form submission for update, e.g., send to API
  }

  const sendLoginInvite = form.watch("sendLoginInvite")

  return (
    <div className="flex-1 p-4 md:p-6 bg-(neutral-100)-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Edit Employee</h1>
          <p className="text-sm text-gray-500">Update employee details</p>
        </div>
        <Button
          type="submit"
          form="edit-employee-form"
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg shadow-sm"
        >
          Update
        </Button>
      </div>

      <form id="edit-employee-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal & Contact Information */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-semibold text-lg">Personal & Contact Information</CardTitle>
            <p className="text-sm text-gray-500">Basic information to uniquely identify the employee in the system.</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-1">
                Employee ID
              </label>
              <Input
                id="employeeId"
                placeholder="Enter Employee ID"
                {...form.register("employeeId")}
                className="bg-gray-50 border-gray-200"
              />
              {form.formState.errors.employeeId && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.employeeId.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <Input
                id="fullName"
                placeholder="Full Name"
                {...form.register("fullName")}
                className="bg-gray-50 border-gray-200"
              />
              {form.formState.errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.fullName.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <Select
                onValueChange={(value) => form.setValue("department", value)}
                value={form.watch("department")} // Make it a controlled component
              >
                <SelectTrigger className="w-full bg-gray-50 border-gray-200">
                  <SelectValue placeholder="Department name" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="tech">Tech</SelectItem>
                  <SelectItem value="logistics">Logistics</SelectItem>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                  <SelectItem value="fulfillment">Fulfillment</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.department && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.department.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-1">
                Designation
              </label>
              <Input
                id="designation"
                placeholder="Enter Designation"
                {...form.register("designation")}
                className="bg-gray-50 border-gray-200"
              />
              {form.formState.errors.designation && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.designation.message}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label htmlFor="uploadImage" className="block text-sm font-medium text-gray-700 mb-1">
                Upload Image
              </label>
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 py-6 bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
              >
                <UploadCloud className="w-5 h-5" />
                Upload Image
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-semibold text-lg">Contact Information</CardTitle>
            <p className="text-sm text-gray-500">Primary contact and communication details.</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </label>
              <Input
                id="mobileNumber"
                placeholder="Official contact (can be WhatsApp)"
                {...form.register("mobileNumber")}
                className="bg-gray-50 border-gray-200"
              />
              {form.formState.errors.mobileNumber && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.mobileNumber.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                id="email"
                placeholder="Registered email ID"
                {...form.register("email")}
                className="bg-gray-50 border-gray-200"
              />
              {form.formState.errors.email && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Role & Access Permissions */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-semibold text-lg">Role & Access Permissions</CardTitle>
            <p className="text-sm text-gray-500">Primary contact and communication details.</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <Select
                onValueChange={(value) => form.setValue("role", value)}
                value={form.watch("role")} // Make it a controlled component
              >
                <SelectTrigger className="w-full bg-gray-50 border-gray-200">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="fulfillment">Fulfillment Staff</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.role && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.role.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="roleDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Role Description
              </label>
              <Input
                id="roleDescription"
                placeholder="Role description"
                {...form.register("roleDescription")}
                className="bg-gray-50 border-gray-200"
              />
            </div>
            <div>
              <label htmlFor="accessLevel" className="block text-sm font-medium text-gray-700 mb-1">
                Access Level
              </label>
              <Select
                onValueChange={(value) => form.setValue("accessLevel", value)}
                value={form.watch("accessLevel")} // Make it a controlled component
              >
                <SelectTrigger className="w-full bg-gray-50 border-gray-200">
                  <SelectValue placeholder="Select Access Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Access</SelectItem>
                  <SelectItem value="limited">Limited Access</SelectItem>
                  <SelectItem value="read-only">Read Only</SelectItem>
                  <SelectItem value="view-orders">View Orders</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.accessLevel && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.accessLevel.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Operational Scope Mapping */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-semibold text-lg">Operational Scope Mapping</CardTitle>
            <p className="text-sm text-gray-500">Primary contact and communication details.</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="assignedDealer" className="block text-sm font-medium text-gray-700 mb-1">
                Assigned Dealer
              </label>
              <Select
                onValueChange={(value) => form.setValue("assignedDealer", value)}
                value={form.watch("assignedDealer")} // Make it a controlled component
              >
                <SelectTrigger className="w-full bg-gray-50 border-gray-200">
                  <SelectValue placeholder="Select Assigned Dealer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dealer1">Dealer 1</SelectItem>
                  <SelectItem value="dealer2">Dealer 2</SelectItem>
                  <SelectItem value="DLR102">DLR102</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="assignedRegion" className="block text-sm font-medium text-gray-700 mb-1">
                Assigned Region
              </label>
              <Select
                onValueChange={(value) => form.setValue("assignedRegion", [value])}
                value={form.watch("assignedRegion")?.[0] || ""} // Make it a controlled component
              >
                <SelectTrigger className="w-full bg-gray-50 border-gray-200">
                  <SelectValue placeholder="Select Assigned Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="north">North</SelectItem>
                  <SelectItem value="south">South</SelectItem>
                  <SelectItem value="maharashtra">Maharashtra</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notes & Admin Controls */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-semibold text-lg">Notes & Admin Controls</CardTitle>
            <p className="text-sm text-gray-500">Primary contact and communication details.</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">
                Remarks
              </label>
              <Input
                id="remarks"
                placeholder="Enter Remarks"
                {...form.register("remarks")}
                className="bg-gray-50 border-gray-200"
              />
            </div>
            <div>
              <label htmlFor="auditTrail" className="block text-sm font-medium text-gray-700 mb-1">
                Audit Trail
              </label>
              <Input
                id="auditTrail"
                value={form.getValues("auditTrail")}
                disabled
                className="bg-gray-50 border-gray-200 text-gray-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Login & Status */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-semibold text-lg">Login & Status</CardTitle>
            <p className="text-sm text-gray-500">Primary contact and communication details.</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-2 md:col-span-2">
              <Checkbox
                id="sendLoginInvite"
                checked={sendLoginInvite}
                onCheckedChange={(checked) => form.setValue("sendLoginInvite", checked as boolean)}
              />
              <label htmlFor="sendLoginInvite" className="text-sm font-medium text-gray-700">
                Send Login Invite
              </label>
            </div>
            {sendLoginInvite && (
              <div>
                <label htmlFor="temporaryPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Set Temporary Password
                </label>
                <Input
                  id="temporaryPassword"
                  type="password"
                  placeholder="Enter Password"
                  {...form.register("temporaryPassword")}
                  className="bg-gray-50 border-gray-200"
                />
                {form.formState.errors.temporaryPassword && (
                  <p className="text-red-500 text-xs mt-1">{form.formState.errors.temporaryPassword.message}</p>
                )}
              </div>
            )}
            <div>
              <label htmlFor="currentStatus" className="block text-sm font-medium text-gray-700 mb-1">
                Current Status
              </label>
              <Select
                onValueChange={(value) => form.setValue("currentStatus", value)}
                value={form.watch("currentStatus")} // Make it a controlled component
              >
                <SelectTrigger className="w-full bg-gray-50 border-gray-200">
                  <SelectValue placeholder="Select Current Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.currentStatus && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.currentStatus.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="lastLogin" className="block text-sm font-medium text-gray-700 mb-1">
                Last Login
              </label>
              <Input
                id="lastLogin"
                value={form.getValues("lastLogin")}
                disabled
                className="bg-gray-50 border-gray-200 text-gray-500"
              />
            </div>
            <div>
              <label htmlFor="createdBy" className="block text-sm font-medium text-gray-700 mb-1">
                Created By
              </label>
              <Input
                id="createdBy"
                value={form.getValues("createdBy")}
                disabled
                className="bg-gray-50 border-gray-200 text-gray-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Assignment & Task Visibility */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-semibold text-lg">Assignment & Task Visibility</CardTitle>
            <p className="text-sm text-gray-500">Primary contact and communication details.</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="assignedOrdersPicklists" className="block text-sm font-medium text-gray-700 mb-1">
                Assigned Orders / Picklists
              </label>
              <Input
                id="assignedOrdersPicklists"
                value={form.getValues("assignedOrdersPicklists")}
                disabled
                className="bg-gray-50 border-gray-200 text-gray-500"
              />
            </div>
            <div>
              <label htmlFor="slaType" className="block text-sm font-medium text-gray-700 mb-1">
                SLA Type
              </label>
              <Select
                onValueChange={(value) => form.setValue("slaType", value)}
                value={form.watch("slaType")} // Make it a controlled component
              >
                <SelectTrigger className="w-full bg-gray-50 border-gray-200">
                  <SelectValue placeholder="Select SLA Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="type1">Type 1</SelectItem>
                  <SelectItem value="type2">Type 2</SelectItem>
                  <SelectItem value="Standard / Priority">Standard / Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="slaMaxDispatchTime" className="block text-sm font-medium text-gray-700 mb-1">
                SLA Max Dispatch Time
              </label>
              <Input
                id="slaMaxDispatchTime"
                placeholder="Enter Time"
                {...form.register("slaMaxDispatchTime")}
                className="bg-gray-50 border-gray-200"
              />
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
