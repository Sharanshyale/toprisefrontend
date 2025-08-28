import apiClient from "@/apiClient"
import type {
  AddModuleRequest,
  AddModuleResponse,
  AddPermissionsRequest,
  AddPermissionsResponse,
  AddRolesToModuleRequest,
  AddRolesToModuleResponse,
  CheckPermissionResponse,
  RemoveRoleFromModuleRequest,
  RemoveRoleFromModuleResponse,
  UpdateModuleRequest,
  UpdateModuleResponse,
  UpdateUserPermissionsRequest,
  UpdateUserPermissionsResponse,
  RemoveUserPermissionsRequest,
  RemoveUserPermissionsResponse,
  GetAllModulesResponse,
  GetModuleRolesResponse,
  GetPermissionsByModuleResponse,
  GetPermissionsByModuleAndRoleResponse,
  GetPermissionsByModuleUserAndRoleResponse, 
} from "@/types/setting-Types"

const BASE_PATH = "/users/api/permissionMatrix"

/**
 * Checks if a user has permission for a specific module.
 * @param module The name of the module (e.g., "products").
 * @param userId The ID of the user.
 * @returns A promise that resolves to the CheckPermissionResponse.
 */
export const checkPermission = async (module: string, userId: string): Promise<CheckPermissionResponse> => {
  const response = await apiClient.get<CheckPermissionResponse>(
    `${BASE_PATH}/check-permission?module=${module}&userId=${userId}`,
  )
  return response.data
}

/**
 * Creates a new permission module with initial roles.
 * This corresponds to the POST /api/users/api/permissionMatrix/modules endpoint.
 * @param data The request body containing the module name and initial roles.
 * @returns A promise that resolves to the AddModuleResponse.
 */
export const createModuleWithRoles = async (data: AddModuleRequest): Promise<AddModuleResponse> => {
  const response = await apiClient.post<AddModuleResponse>(`${BASE_PATH}/modules`, data)
  return response.data
}

/**
 * Adds specific user permissions to a role within a module.
 * This corresponds to the POST /api/users/api/permissionMatrix/permissions endpoint.
 * @param data The request body containing module, role, user IDs, and permission details.
 * @returns A promise that resolves to the AddPermissionsResponse.
 */
export const addPermissionsToModule = async (data: AddPermissionsRequest): Promise<AddPermissionsResponse> => {
  const response = await apiClient.post<AddPermissionsResponse>(`${BASE_PATH}/permissions`, data)
  return response.data
}

/**
 * Adds new roles to an existing permission module.
 * This corresponds to the POST /api/users/api/permissionMatrix/modules/add-roles endpoint.
 * @param data The request body containing the module name, roles to add, and updater's user ID.
 * @returns A promise that resolves to the AddRolesToModuleResponse.
 */
export const addRolesToModule = async (data: AddRolesToModuleRequest): Promise<AddRolesToModuleResponse> => {
  const response = await apiClient.post<AddRolesToModuleResponse>(`${BASE_PATH}/modules/add-roles`, data)
  return response.data
}

/**
 * Removes a role from a permission module.
 * This corresponds to the PUT /api/users/api/permissionMatrix/modules/remove-role endpoint.
 * @param data The request body containing the module name, role to remove, and updater's user ID.
 * @returns A promise that resolves to the RemoveRoleFromModuleResponse.
 */
export const removeRoleFromModule = async (
  data: RemoveRoleFromModuleRequest,
): Promise<RemoveRoleFromModuleResponse> => {
  const response = await apiClient.put<RemoveRoleFromModuleResponse>(`${BASE_PATH}/modules/remove-role`, data)
  return response.data
}

/**
 * Updates the name of an existing permission module.
 * This corresponds to the PUT /api/users/api/permissionMatrix/modules/update endpoint.
 * @param data The request body containing the current module name, new module name, and updater's user ID.
 * @returns A promise that resolves to the UpdateModuleResponse.
 */
export const updateModule = async (data: UpdateModuleRequest): Promise<UpdateModuleResponse> => {
  const response = await apiClient.put<UpdateModuleResponse>(`${BASE_PATH}/modules/update`, data)
  return response.data
}

/**
 * Updates a user's permissions within a specific module and role.
 * This corresponds to the PUT /api/users/api/permissionMatrix/permissions/update endpoint.
 * @param data The request body containing module, role, user ID, new permission details, and updater's user ID.
 * @returns A promise that resolves to the UpdateUserPermissionsResponse.
 */
export const updateUserPermissions = async (
  data: UpdateUserPermissionsRequest,
): Promise<UpdateUserPermissionsResponse> => {
  const response = await apiClient.put<UpdateUserPermissionsResponse>(`${BASE_PATH}/permissions/update`, data)
  return response.data
}

/**
 * Removes a user's specific permissions from a role within a module.
 * This corresponds to the DELETE /api/users/api/permissionMatrix/permissions/remove endpoint.
 * @param data The request body containing module, role, user ID to remove permissions for, and updater's user ID.
 * @returns A promise that resolves to the RemoveUserPermissionsResponse.
 */
export const removeUserPermissions = async (
  data: RemoveUserPermissionsRequest,
): Promise<RemoveUserPermissionsResponse> => {
  const response = await apiClient.delete<RemoveUserPermissionsResponse>(`${BASE_PATH}/permissions/remove`, { data })
  return response.data
}

/**
 * Fetches all permission modules.
 * This corresponds to the GET /api/users/api/permissionMatrix/modules endpoint.
 * @returns A promise that resolves to the GetAllModulesResponse.
 */
export const getAllModules = async (): Promise<GetAllModulesResponse> => {
  const response = await apiClient.get<GetAllModulesResponse>(`${BASE_PATH}/modules`)
  return response.data
}

/**
 * Fetches roles for a specific module.
 * This corresponds to the GET /api/users/api/permissionMatrix/modulesRoles/:module endpoint.
 * @param module The name of the module.
 * @returns A promise that resolves to the GetModuleRolesResponse.
 */
export const getModuleRoles = async (module: string): Promise<GetModuleRolesResponse> => {
  const response = await apiClient.get<GetModuleRolesResponse>(`${BASE_PATH}/modulesRoles/${module}`)
  return response.data
}

/**
 * Fetches permissions for a specific module.
 * This corresponds to the GET /api/users/api/permissionMatrix/permissions?module=Products endpoint.
 * @param module The name of the module.
 * @returns A promise that resolves to the GetPermissionsByModuleResponse.
 */
export const getPermissionsByModule = async (module: string): Promise<GetPermissionsByModuleResponse> => {
  const response = await apiClient.get<GetPermissionsByModuleResponse>(`${BASE_PATH}/permissions?module=${module}`)
  return response.data
}

/**
 * Fetches permissions for a specific module and role.
 * This corresponds to the GET /api/users/api/permissionMatrix/permissions?module=Products&role=Super-admin endpoint.
 * @param module The name of the module.
 * @param role The name of the role.
 * @returns A promise that resolves to the GetPermissionsByModuleAndRoleResponse.
 */
export const getPermissionsByModuleAndRole = async (
  module: string,
  role: string,
): Promise<GetPermissionsByModuleAndRoleResponse> => {
  const response = await apiClient.get<GetPermissionsByModuleAndRoleResponse>(
    `${BASE_PATH}/permissions?module=${module}&role=${role}`,
  )
  return response.data
}

/**
 * Fetches permissions for a specific module, user, and role.
 * This corresponds to the GET /api/users/api/permissionMatrix/permissions?module=Products&userId=...&role=... endpoint.
 * @param module The name of the module.
 * @param userId The ID of the user.
 * @param role The name of the role.
 * @returns A promise that resolves to the GetPermissionsByModuleUserAndRoleResponse.
 */
export const getPermissionsByModuleUserAndRole = async (
  module: string,
  userId: string,
  role: string,
): Promise<GetPermissionsByModuleUserAndRoleResponse> => {
  const response = await apiClient.get<GetPermissionsByModuleUserAndRoleResponse>(
    `${BASE_PATH}/permissions?module=${module}&userId=${userId}&role=${role}`,
  )
  return response.data
}
