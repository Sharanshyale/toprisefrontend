"use client"

import { Check, Pencil, Plus, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DynamicButton } from "@/components/common/button"
import { CreateModuleModal } from "./popups/create-module-modal"
import { AddRoleModal } from "./popups/add-role-modal"
import { EditPermissionModal } from "./popups/edit-permission-modal"
import {
  getAllModules,
  getModuleRoles,
  removeRoleFromModule,
  getPermissionsByModuleAndRole,
  removeUserPermissions,
} from "@/service/settingServices"
import type { PermissionModule, AccessPermissionRole, UserPermissionDetails } from "@/types/setting-Types"
import { useToast } from "@/components/ui/toast"
import { Skeleton } from "@/components/ui/skeleton"

export default function PermissionAccess() {
  const [activeModule, setActiveModule] = useState("")
  const [activeRole, setActiveRole] = useState("")
  const [modules, setModules] = useState<PermissionModule[]>([])
  const [moduleRoles, setModuleRoles] = useState<AccessPermissionRole[]>([])
  const [userPermissions, setUserPermissions] = useState<UserPermissionDetails[]>([])
  const [loading, setLoading] = useState(false)
  const [permissionsLoading, setPermissionsLoading] = useState(false)
  const { showToast } = useToast()

  // Fetch all modules on component mount
  useEffect(() => {
    fetchModules()
  }, [])

  // Fetch roles for active module when it changes
  useEffect(() => {
    if (activeModule) {
      fetchModuleRoles(activeModule)
      setActiveRole("") 
      setUserPermissions([]) 
    }
  }, [activeModule])

  // Fetch user permissions when active role changes
  useEffect(() => {
    if (activeModule && activeRole) {
      fetchUserPermissions(activeModule, activeRole)
    }
  }, [activeModule, activeRole])

  const fetchModules = async () => {
    try {
      setLoading(true)
      const response = await getAllModules()
      setModules(response.data)
      if (response.data.length > 0 && !activeModule) {
        setActiveModule(response.data[0].module)
      }
    } catch (error) {
      console.error("Error fetching modules:", error)
      showToast("Failed to fetch modules", "error")
    } finally {
      setLoading(false)
    }
  }

  const fetchModuleRoles = async (moduleName: string) => {
    try {
      setLoading(true)
      const response = await getModuleRoles(moduleName)
      setModuleRoles(response.data)
    } catch (error) {
      console.error("Error fetching module roles:", error)
      showToast("Failed to fetch module roles", "error")
    } finally {
      setLoading(false)
    }
  }

  const fetchUserPermissions = async (moduleName: string, roleName: string) => {
    try {
      setPermissionsLoading(true)
      const response = await getPermissionsByModuleAndRole(moduleName, roleName)

      // Extract user permissions from the response
      if (response.data && response.data.AccessPermissions) {
        const rolePermissions = response.data.AccessPermissions.find((accessRole) => accessRole.role === roleName)
        if (rolePermissions) {
          setUserPermissions(rolePermissions.permissions)
        } else {
          setUserPermissions([])
        }
      } else {
        setUserPermissions([])
      }
    } catch (error) {
      console.error("Error fetching user permissions:", error)
      showToast("Failed to fetch user permissions", "error")
      setUserPermissions([])
    } finally {
      setPermissionsLoading(false)
    }
  }

  const handleRemoveRole = async (roleName: string) => {
    try {
      await removeRoleFromModule({
        module: activeModule,
        role: roleName,
        // Removed updatedBy field to fix 500 error
      })
      showToast("Role removed successfully", "success")
      fetchModuleRoles(activeModule) 
    } catch (error) {
      console.error("Error removing role:", error)
      showToast("Failed to remove role", "error")
    }
  }

  const handleRemoveUserPermission = async (userId: string) => {
    try {
      await removeUserPermissions({
        module: activeModule,
        role: activeRole,
        userId: userId,
        // Removed updatedBy field to fix 500 error
      })
      showToast("User permission removed successfully", "success")
      fetchUserPermissions(activeModule, activeRole) // Refresh the permissions list
    } catch (error) {
      console.error("Error removing user permission:", error)
      showToast("Failed to remove user permission", "error")
    }
  }

  const handleModuleCreated = () => {
    fetchModules() 
  }

  const handleRoleAdded = () => {
    fetchModuleRoles(activeModule) // Refresh roles list
  }

  const handleRoleClick = (roleName: string) => {
    setActiveRole(roleName)
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Header with Create Module button */}
      <div className="flex items-center justify-between mb-4 md:mb-9 gap-3 flex-wrap">
        <h2 className="text-lg md:text-xl font-bold">Permission Access</h2>
        <CreateModuleModal onModuleCreated={handleModuleCreated}>
          <DynamicButton
            text="Create Module"
            customClassName="h-9 px-3 md:px-4 bg-[var(--new-300)] hover:bg-[var(--new-400)] text-white rounded-md shadow-sm w-full md:w-auto"
          />
        </CreateModuleModal>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-3">
        {/* Left Column: Module and Roles Permission Access */}
        <div className="flex flex-col gap-3">
          {/* Headers */}
          <div className="grid grid-cols-2 gap-2 text-sm md:text-base">
            <div className="font-semibold text-black">Module</div>
            <div className="font-semibold text-black">Roles Permission Access</div>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Module List */}
            <div className="flex flex-col gap-1.5">
              {loading ? (
                <>
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </>
              ) : (
                modules.map((moduleItem) => (
                  <div
                    key={moduleItem._id}
                    className={`py-1 px-2 cursor-pointer transition-colors ${
                      activeModule === moduleItem.module
                        ? "text-red-600 font-medium"
                        : "text-black hover:text-gray-700"
                    }`}
                    onClick={() => setActiveModule(moduleItem.module)}
                  >
                    {moduleItem.module}
                  </div>
                ))
              )}
            </div>

            {/* Roles List for Active Module */}
            <div className="flex flex-col gap-1.5">
              {loading ? (
                <>
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </>
              ) : (
                <>
                  {moduleRoles.map((roleItem) => (
                    <div
                      key={roleItem._id}
                      className={`flex items-center justify-between py-1 px-2 cursor-pointer transition-colors ${
                        activeRole === roleItem.role
                          ? "text-red-600 font-medium bg-gray-50"
                          : "text-black hover:text-gray-700"
                      }`}
                      onClick={() => handleRoleClick(roleItem.role)}
                    >
                      <span>{roleItem.role}</span>
                      <Trash2
                        className="w-4 h-4 text-gray-600 cursor-pointer hover:text-red-500 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation() // Prevent role selection when clicking delete
                          handleRemoveRole(roleItem.role)
                        }}
                      />
                    </div>
                  ))}
                  <AddRoleModal moduleName={activeModule} onRoleAdded={handleRoleAdded}>
                    <DynamicButton
                      variant="outline"
                      icon={<Plus className="w-4 h-4" />}
                      text="Add Role"
                      customClassName="w-full sm:w-fit bg-red-50 border border-red-200 text-red-600 rounded-lg px-2.5 py-1 hover:bg-red-100 transition-colors duration-200"
                    />
                  </AddRoleModal>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Role Details Cards - Show for selected role */}
        {activeModule && activeRole && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between font-semibold text-xs sm:text-sm text-gray-600 mb-1 gap-2 flex-wrap">
              {/* <div className="text-sm md:text-base">{activeRole} Details</div>
              <DynamicButton
                variant="outline"
                icon={<Plus className="w-4 h-4" />}
                text="Add Dealer"
                customClassName="w-full sm:w-fit border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 bg-white"
              /> */}
            </div>

            {permissionsLoading ? (
              <div className="text-gray-500 text-center py-4">Loading user permissions...</div>
            ) : userPermissions.length > 0 ? (
              userPermissions.map((permission, index) => (
                <UserPermissionCard
                  key={permission._id || index}
                  permission={permission}
                  moduleName={activeModule}
                  roleName={activeRole}
                  onRemovePermission={handleRemoveUserPermission}
                />
              ))
            ) : (
              <div className="text-gray-500 text-center py-4">No users found for this role</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

interface UserPermissionCardProps {
  permission: UserPermissionDetails
  moduleName: string
  roleName: string
  onRemovePermission: (userId: string) => Promise<void>
}

function UserPermissionCard({ permission, moduleName, roleName, onRemovePermission }: UserPermissionCardProps) {
  // Extract user data - userId can be either string or User object
  const user = typeof permission.userId === "string" ? null : permission.userId
  const userId = typeof permission.userId === "string" ? permission.userId : permission.userId._id

  // Format permissions for display
  const permissionsList = []
  if (permission.read) permissionsList.push("Read")
  if (permission.write) permissionsList.push("Write")
  if (permission.update) permissionsList.push("Update")
  if (permission.delete) permissionsList.push("Delete")
  const permissionsText = permissionsList.length > 0 ? permissionsList.join("/") : "None"

  return (
    <Card className="p-3 md:p-4 border border-gray-200 rounded-lg shadow-sm">
      <CardContent className="p-0 flex flex-col gap-3 md:gap-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <Checkbox
            id={`permission-${permission._id}`}
            className="data-[state=checked]:bg-[var(--new-300)] data-[state=checked]:border-[var(--new-300)]"
            defaultChecked
          >
            <Check className="h-4 w-4 text-white" />
          </Checkbox>
          <div className="flex gap-1 md:gap-2 shrink-0">
            <EditPermissionModal
              moduleName={moduleName}
              roleName={roleName}
              userId={userId}
              currentPermissions={{
                allowedFields: permission.allowedFields,
                read: permission.read,
                write: permission.write,
                update: permission.update,
                delete: permission.delete,
              }}
            >
              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                <Pencil className="w-4 h-4" />
              </Button>
            </EditPermissionModal>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-500 hover:text-red-500"
              onClick={() => onRemovePermission(userId)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs sm:text-sm w-full">
          <div>
            <div className="text-gray-500">User ID</div>
            <div className="font-medium break-all">{userId}</div>
          </div>
          <div>
            <div className="text-gray-500">Email</div>
            <div className="font-medium break-all">{user?.email || "N/A"}</div>
          </div>
          <div>
            <div className="text-gray-500">Phone</div>
            <div className="font-medium break-all">{user?.phone_Number || "N/A"}</div>
          </div>
          <div>
            <div className="text-gray-500">Role</div>
            <div className="font-medium break-all">{user?.role || "N/A"}</div>
          </div>
          <div>
            <div className="text-gray-500">Allowed Fields</div>
            <div className="font-medium break-words">{permission.allowedFields?.join(", ") || "None"}</div>
          </div>
          <div>
            <div className="text-gray-500">Permissions</div>
            <div className="font-medium break-all">{permissionsText}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
