"use client"

import type React from "react"
import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { updateUserPermissions } from "@/service/settingServices"
import type { UpdateUserPermissionsRequest } from "@/types/setting-Types"
import { useToast } from "@/components/ui/toast"

interface EditPermissionModalProps {
  children: React.ReactNode
  moduleName?: string
  roleName?: string
  userId?: string
  currentPermissions?: {
    allowedFields: string[]
    read: boolean
    write: boolean
    update: boolean
    delete: boolean
  }
  onPermissionUpdated?: () => void
}

export function EditPermissionModal({ 
  children, 
  moduleName = "", 
  roleName = "", 
  userId = "",
  currentPermissions,
  onPermissionUpdated 
}: EditPermissionModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [permissions, setPermissions] = useState({
    allowedFields: currentPermissions?.allowedFields || [],
    read: currentPermissions?.read || false,
    write: currentPermissions?.write || false,
    update: currentPermissions?.update || false,
    delete: currentPermissions?.delete || false
  })
  const [allowedFieldsInput, setAllowedFieldsInput] = useState(
    currentPermissions?.allowedFields.join(", ") || ""
  )
  const { showToast } = useToast()

  const handleSave = async () => {
    if (!moduleName || !roleName || !userId) {
      showToast("Module name, role name, and user ID are required", "error")
      return
    }

    try {
      setLoading(true)
      
      // Parse allowed fields from comma-separated string
      const allowedFields = allowedFieldsInput
        .split(",")
        .map(field => field.trim())
        .filter(field => field.length > 0)

      const requestData: UpdateUserPermissionsRequest = {
        module: moduleName,
        role: roleName,
        userId: userId,
        permissions: {
          allowedFields: allowedFields,
          read: permissions.read,
          write: permissions.write,
          update: permissions.update,
          delete: permissions.delete
        }
        // Removed updatedBy field to fix 500 error
      }

      await updateUserPermissions(requestData)
      showToast("Permissions updated successfully", "success")
      
      setOpen(false)
      onPermissionUpdated?.()
    } catch (error) {
      console.error("Error updating permissions:", error)
      showToast("Failed to update permissions", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md p-4 md:p-6 rounded-lg shadow-lg">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-3 md:pb-4">
          <DialogTitle className="text-xl md:text-2xl font-bold">Edit Permission</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 md:gap-6 py-3 md:py-4">
          <div className="grid gap-2">
            <Label htmlFor="allowed-fields" className="text-sm md:text-base font-medium">
              Allowed Fields
            </Label>
            <Input
              id="allowed-fields"
              placeholder="Enter fields separated by commas (e.g., name, email, phone)"
              value={allowedFieldsInput}
              onChange={(e) => setAllowedFieldsInput(e.target.value)}
            />
          </div>
          
          <div className="grid gap-3 md:gap-4">
            <Label className="text-sm md:text-base font-medium">Permissions</Label>
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="read"
                  checked={permissions.read}
                  onCheckedChange={(checked) => 
                    setPermissions(prev => ({ ...prev, read: checked as boolean }))
                  }
                />
                <Label htmlFor="read">Read</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="write"
                  checked={permissions.write}
                  onCheckedChange={(checked) => 
                    setPermissions(prev => ({ ...prev, write: checked as boolean }))
                  }
                />
                <Label htmlFor="write">Write</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="update"
                  checked={permissions.update}
                  onCheckedChange={(checked) => 
                    setPermissions(prev => ({ ...prev, update: checked as boolean }))
                  }
                />
                <Label htmlFor="update">Update</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="delete"
                  checked={permissions.delete}
                  onCheckedChange={(checked) => 
                    setPermissions(prev => ({ ...prev, delete: checked as boolean }))
                  }
                />
                <Label htmlFor="delete">Delete</Label>
              </div>
            </div>
          </div>
        </div>
        <Button
          type="submit"
          className="w-full bg-[var(--new-300)] hover:bg-[var(--new-400)] text-white py-2 text-base md:text-lg font-semibold"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Updating..." : "Save"}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
