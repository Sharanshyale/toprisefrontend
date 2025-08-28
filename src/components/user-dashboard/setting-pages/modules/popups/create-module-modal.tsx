"use client"

import type React from "react"
import { useState } from "react"
import { X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { createModuleWithRoles } from "@/service/settingServices"
import type { AddModuleRequest } from "@/types/setting-Types"
import { useToast } from "@/components/ui/toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CreateModuleModalProps {
  children: React.ReactNode
  onModuleCreated?: () => void
}

export function CreateModuleModal({ children, onModuleCreated }: CreateModuleModalProps) {
  const [open, setOpen] = useState(false)
  const [moduleName, setModuleName] = useState("")
  const [roles, setRoles] = useState<string[]>([])
  const [selectedRole, setSelectedRole] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()

  const ALL_ROLES: string[] = [
    "Super-admin",
    "Fulfillment-Admin",
    "Fulfillment-Staff",
    "Inventory-Admin",
    "Inventory-Staff",
    "Dealer",
    "User"
  ]

  const availableRoles = ALL_ROLES.filter((role) => !roles.includes(role))

  const handleAddRole = () => {
    if (!selectedRole) return
    if (!roles.includes(selectedRole)) {
      setRoles([...roles, selectedRole])
    }
    setSelectedRole(undefined)
  }

  const handleRemoveRole = (roleToRemove: string) => {
    setRoles(roles.filter((role) => role !== roleToRemove))
  }

  const handleSave = async () => {
    if (!moduleName.trim()) {
      showToast("Module name is required", "error")
      return
    }

    if (roles.length === 0) {
      showToast("At least one role is required", "error")
      return
    }

    try {
      setLoading(true)
      const requestData: AddModuleRequest = {
        module: moduleName.trim(),
        roles: roles
        // Removed updatedBy field to fix 500 error
      }

      await createModuleWithRoles(requestData)
      showToast("Module created successfully", "success")
      
      // Reset form and close modal
      setModuleName("")
      setRoles([])
      setSelectedRole(undefined)
      setOpen(false)
      
      // Call callback to refresh modules list
      onModuleCreated?.()
    } catch (error) {
      console.error("Error creating module:", error)
      showToast("Failed to create module", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md p-4 md:p-6 rounded-lg shadow-lg">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-3 md:pb-4">
          <DialogTitle className="text-xl md:text-2xl font-bold">Create Module</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 md:gap-6 py-3 md:py-4">
          <div className="grid gap-2">
            <Label htmlFor="module-name" className="text-sm md:text-base font-medium">
              Module Name
            </Label>
            <Input
              id="module-name"
              placeholder="e.g., Products"
              value={moduleName}
              onChange={(e) => setModuleName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-sm md:text-base font-medium">Roles</Label>
            <div className="flex gap-2 flex-col sm:flex-row">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-full sm:min-w-[220px]">
                  <SelectValue placeholder={availableRoles.length ? "Select a role" : "All roles added"} />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={handleAddRole}
                disabled={!selectedRole}
                className="border-[var(--new-300)] text-[var(--new-300)] hover:bg-[var(--new-50)] hover:text-[var(--new-400)] bg-transparent self-start"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {roles.map((role) => (
                <Badge key={role} variant="secondary" className="pr-1">
                  {role}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1 text-muted-foreground hover:text-foreground"
                    onClick={() => handleRemoveRole(role)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <Button
          type="submit"
          className="w-full bg-[var(--new-300)] hover:bg-[var(--new-400)] text-white py-2 text-base md:text-lg font-semibold"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Creating..." : "Save"}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
