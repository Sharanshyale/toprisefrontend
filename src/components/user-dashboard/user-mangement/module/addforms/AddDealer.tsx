"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { dealerSchema, type DealerFormValues } from "@/lib/schemas/dealer-schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"
import { Plus, X } from "lucide-react"
import { createDealer, getAllUsers, getAllCategories } from "@/service/dealerServices"
import { useToast as useGlobalToast } from "@/components/ui/toast";
import { useState, useEffect, Fragment, useRef } from "react"
import type { User, Category } from "@/types/dealer-types"
import { useRouter } from "next/navigation"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { useAppSelector } from "@/store/hooks"

export default function AddDealer() {
  const { showToast } = useGlobalToast();
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [submitLoading, setSubmitLoading] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [formData, setFormData] = useState<DealerFormValues | null>(null)
  const allowedRoles = ["Super-admin", "Inventory-Admin", "Fulfillment-Admin"];
  const auth = useAppSelector((state) => state.auth.user);

  const form = useForm<DealerFormValues>({
    resolver: zodResolver(dealerSchema) as any, 
    defaultValues: {
      email: "",
      password: "",
      phone_Number: "",
      legal_name: "",
      trade_name: "",
      GSTIN: "",
      Pan: "",
      Address: {
        street: "",
        city: "",
        pincode: "",
        state: "",
      },
      contact_person: {
        name: "",
        email: "",
        phone_number: "",
      },
      categories_allowed: [],
      upload_access_enabled: true,
      default_margin: 15,
      last_fulfillment_date: new Date().toISOString(),
      assigned_Toprise_employee: [],
      SLA_type: "Standard",
      dealer_dispatch_time: 72,
      onboarding_date: new Date().toISOString().split("T")[0], // Format as YYYY-MM-DD
      remarks: "",
    },
  })

  useEffect(() => {
    fetchUsers()
    fetchCategories()
  }, [])

  const fetchUsers = async () => {
    setIsLoadingData(true)
    try {
      const usersResponse = await getAllUsers()
      if (usersResponse.success) {
        setUsers(usersResponse.data)
      }
    } catch (error) {
      showToast("Failed to load users. Please refresh the page.", "error");
    } finally {
      setIsLoadingData(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const categoriesResponse = await getAllCategories()
      if (categoriesResponse.success) {
        setAllCategories(categoriesResponse.data)
      }
    } catch (error) {
      showToast("Failed to load categories. Please refresh the page.", "error");
    }
  }

  const onSubmit = async (data: DealerFormValues) => {
    setFormData(data)
    setShowConfirmDialog(true)
  }

  const handleConfirmSubmit = async () => {
    if (!formData) return
    
    setSubmitLoading(true)
    try {
      // Ensure remarks is always a string
      const safeData = { ...formData, password: formData.password ?? "", remarks: formData.remarks ?? "" };
      const response = await createDealer(safeData)
      if (response.success) {
        showToast("Dealer created successfully", "success");
        setTimeout(() => {
          router.push("/user/dashboard/user");
        }, 2000);
      }
    } catch (error) {
      showToast("Failed to create dealer. Please try again.", "error");
    } finally {
      setSubmitLoading(false)
    }
  }

  // Role-based access control
  if (!auth || !allowedRoles.includes(auth.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600 font-bold">
          You do not have permission to access this page.
        </div>
      </div>
    );
  }

  if (isLoadingData) {
    return (
      <div className="flex-1 p-4 md:p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading form data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-4 md:p-6 bg-(neutral-100)-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Add Dealer</h1>
        <p className="text-sm text-gray-500">Add your dealer details</p>
      </div>

      <Form {...form}>
        <form id="add-dealer-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 relative pb-20">
          {/* Account Information */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-red-600 font-semibold text-lg">Account Information</CardTitle>
              <p className="text-sm text-gray-500">Login credentials and basic account details.</p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email" {...field} className="bg-gray-50 border-gray-200" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter password"
                        {...field}
                        className="bg-gray-50 border-gray-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone_Number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="phone_Number" {...field} className="bg-gray-50 border-gray-200" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-red-600 font-semibold text-lg">Business Information</CardTitle>
              <p className="text-sm text-gray-500">Legal business details and tax information.</p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="legal_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Legal Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ABC Enterprises Pvt. Ltd."
                        {...field}
                        className="bg-gray-50 border-gray-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="trade_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trade Name</FormLabel>
                    <FormControl>
                      <Input placeholder="ABC Traders" {...field} className="bg-gray-50 border-gray-200" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="GSTIN"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GSTIN</FormLabel>
                    <FormControl>
                      <Input placeholder="GSTIN" {...field} className="bg-gray-50 border-gray-200" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="Pan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PAN</FormLabel>
                    <FormControl>
                      <Input placeholder="Pan" {...field} className="bg-gray-50 border-gray-200" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-red-600 font-semibold text-lg">Address Information</CardTitle>
              <p className="text-sm text-gray-500">Business address details.</p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="Address.street"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder="MG Road" {...field} className="bg-gray-50 border-gray-200" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="Address.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Bangalore" {...field} className="bg-gray-50 border-gray-200" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="Address.state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="Karnataka" {...field} className="bg-gray-50 border-gray-200" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="Address.pincode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pincode</FormLabel>
                    <FormControl>
                      <Input placeholder="pincode" {...field} className="bg-gray-50 border-gray-200" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Contact Person */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-red-600 font-semibold text-lg">Contact Person</CardTitle>
              <p className="text-sm text-gray-500">Primary contact person details.</p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="contact_person.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Name" {...field} className="bg-gray-50 border-gray-200" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact_person.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email" {...field} className="bg-gray-50 border-gray-200" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact_person.phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="phone_number" {...field} className="bg-gray-50 border-gray-200" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Categories & Access */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-red-600 font-semibold text-lg">Categories & Access</CardTitle>
              <p className="text-sm text-gray-500">Product categories and access permissions.</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categories Allowed *</label>
                {/* Multi-select Dropdown */}
                <MultiSelectDropdown
                  options={allCategories}
                  selected={form.watch("categories_allowed")}
                  onChange={(selected) => form.setValue("categories_allowed", selected)}
                />
                {form.formState.errors.categories_allowed && (
                  <p className="text-red-500 text-xs mt-1">{form.formState.errors.categories_allowed.message}</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="upload_access_enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="font-normal">Upload Access Enabled</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="default_margin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Margin (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="15"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="bg-gray-50 border-gray-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* SLA & Operations */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-red-600 font-semibold text-lg">SLA & Operations</CardTitle>
              <p className="text-sm text-gray-500">Service level agreements and operational settings.</p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="SLA_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SLA Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-gray-50 border-gray-200">
                          <SelectValue placeholder="Select SLA Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Standard">Standard</SelectItem>
                        <SelectItem value="Priority">Priority</SelectItem>
                        <SelectItem value="Limited">Limited</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dealer_dispatch_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dealer Dispatch Time (hours)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="72"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="bg-gray-50 border-gray-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_fulfillment_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Fulfillment Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value ? field.value.split("T")[0] : ""}
                        onChange={e => field.onChange(new Date(e.target.value).toISOString())}
                        className="bg-gray-50 border-gray-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Employee Assignment */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-red-600 font-semibold text-lg">Assignment & Additional Info</CardTitle>
              <p className="text-sm text-gray-500">Employee assignment and additional details.</p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="assigned_Toprise_employee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Toprise Employee</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange([{ assigned_user: value, status: "Active" }])
                      }}
                      value={field.value?.[0]?.assigned_user || ""} 
                    >
                      <FormControl>
                        <SelectTrigger className="bg-gray-50 border-gray-200">
                          <SelectValue placeholder="Select an employee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user._id} value={user._id}>
                            {user.email} ({user.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="onboarding_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Onboarding Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="bg-gray-50 border-gray-200" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remarks</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Additional notes about the dealer"
                          {...field}
                          className="bg-gray-50 border-gray-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              form="add-dealer-form"
              disabled={isLoading || submitLoading}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg shadow-sm"
            >
              {(isLoading || submitLoading) ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                  Adding Dealer...
                </span>
              ) : "Add Dealer"}
            </Button>
          </div>
        </form>
      </Form>

              <ConfirmationDialog
          isOpen={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          onConfirm={handleConfirmSubmit}
          title="Add Dealer"
          description="Are you sure you want to add this dealer?"
          confirmText="Yes, Add Dealer"
          cancelText="No, Cancel"
        />
    </div>
  )
}

function MultiSelectDropdown({ options, selected, onChange }: {
  options: Category[];
  selected: string[];
  onChange: (selected: string[]) => void;
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  const filtered = options.filter(cat => cat.category_name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="relative" ref={ref}>
      <div
        className="flex flex-wrap gap-2 border border-gray-200 rounded px-2 py-1 bg-white min-h-[42px] cursor-pointer"
        onClick={() => setOpen(v => !v)}
      >
        {selected.length === 0 && <span className="text-gray-400">Select categories...</span>}
        {selected.map(id => {
          const cat = options.find(c => c._id === id)
          return cat ? (
            <span key={id} className="flex items-center bg-red-600 text-white rounded px-2 py-0.5 text-xs">
              {cat.category_name}
              <button
                type="button"
                className="ml-1 text-white hover:text-gray-200"
                onClick={e => {
                  e.stopPropagation()
                  onChange(selected.filter(sid => sid !== id))
                }}
              >
                ×
              </button>
            </span>
          ) : null
        })}
      </div>
      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-auto">
          <input
            className="w-full px-2 py-1 border-b border-gray-100 focus:outline-none"
            placeholder="Search categories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
          {filtered.length === 0 && <div className="p-2 text-gray-400">No categories found</div>}
          {filtered.map(cat => (
            <div
              key={cat._id}
              className={`px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center ${selected.includes(cat._id) ? "bg-gray-100" : ""}`}
              onClick={e => {
                e.stopPropagation()
                if (selected.includes(cat._id)) {
                  onChange(selected.filter(id => id !== cat._id))
                } else {
                  onChange([...selected, cat._id])
                }
              }}
            >
              <input
                type="checkbox"
                checked={selected.includes(cat._id)}
                readOnly
                className="mr-2"
              />
              {cat.category_name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
