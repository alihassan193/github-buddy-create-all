
import { User, UserPermissions } from "../types";
import { apiClient } from "./apiClient";
import { mapDatabaseUserToAppUser } from "./authService";

// Get all users - matches /api/admin/users endpoint
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const response = await apiClient.get("/api/admin/users");
    
    console.log("API Response - All Users:", response);
    
    // The API returns users with permission objects included
    const allUsers = Array.isArray(response) 
      ? response.map((user: any) => {
          // Extract permissions from the included Permission object
          const permissions = user.Permission ? {
            can_manage_tables: user.Permission.can_manage_tables === 1,
            can_manage_canteen: user.Permission.can_manage_canteen === 1,
            can_view_reports: user.Permission.can_view_reports === 1
          } : {
            // Fallback permissions based on role if Permission object is missing
            can_manage_tables: user.role === 'super_admin' || user.role === 'sub_admin',
            can_manage_canteen: true,
            can_view_reports: user.role === 'super_admin' || user.role === 'sub_admin' || user.role === 'manager'
          };
          
          return mapDatabaseUserToAppUser(user, permissions);
        })
      : [];
      
    console.log("Mapped Users:", allUsers);
    return allUsers.filter(Boolean) as User[];
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

// Create admin (sub_admin) - matches /api/admin/create-admin endpoint
export const createAdmin = async (
  username: string, 
  email: string, 
  password: string, 
  role: 'sub_admin',
  permissions?: {
    can_manage_tables?: boolean;
    can_manage_canteen?: boolean;
    can_view_reports?: boolean;
  }
) => {
  try {
    const userData = await apiClient.post('/api/admin/create-admin', {
      username,
      email,
      password,
      role,
      can_manage_tables: permissions?.can_manage_tables ?? true,
      can_manage_canteen: permissions?.can_manage_canteen ?? true,
      can_view_reports: permissions?.can_view_reports ?? true
    });
    
    return userData;
  } catch (error) {
    console.error('Error creating admin:', error);
    throw error;
  }
};

// Create manager - matches /api/admin/create-manager endpoint
export const createManager = async (
  username: string, 
  email: string, 
  password: string
) => {
  try {
    const userData = await apiClient.post('/api/admin/create-manager', {
      username,
      email,
      password
    });
    
    return userData;
  } catch (error) {
    console.error('Error creating manager:', error);
    throw error;
  }
};

// Combined create user function that routes to appropriate endpoint
export const createUser = async (
  username: string, 
  email: string, 
  password: string, 
  role: 'super_admin' | 'sub_admin' | 'manager',
  subAdminId?: number
) => {
  try {
    if (role === 'sub_admin') {
      return await createAdmin(username, email, password, role);
    } else if (role === 'manager') {
      return await createManager(username, email, password);
    } else {
      throw new Error("Super admin creation not supported through this endpoint");
    }
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Set user active status - matches /api/admin/users/:id endpoint
export const setUserStatus = async (userId: number, isActive: boolean): Promise<void> => {
  try {
    await apiClient.put(`/api/admin/users/${userId}`, { 
      is_active: isActive 
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

// Get all admins - matches /api/admin/admins endpoint
export const getAllAdmins = async (): Promise<User[]> => {
  try {
    const response = await apiClient.get("/api/admin/admins");
    
    console.log("API Response - All Admins:", response);
    
    const allAdmins = Array.isArray(response) 
      ? response.map((admin: any) => {
          const permissions = admin.Permission ? {
            can_manage_tables: admin.Permission.can_manage_tables === 1,
            can_manage_canteen: admin.Permission.can_manage_canteen === 1,
            can_view_reports: admin.Permission.can_view_reports === 1
          } : {
            can_manage_tables: true,
            can_manage_canteen: true,
            can_view_reports: true
          };
          
          return mapDatabaseUserToAppUser(admin, permissions);
        })
      : [];
      
    console.log("Mapped Admins:", allAdmins);
    return allAdmins.filter(Boolean) as User[];
  } catch (error) {
    console.error("Error fetching admins:", error);
    throw error;
  }
};

// Get admin by ID - matches /api/admin/admins/:id endpoint
export const getAdminById = async (adminId: number): Promise<User | null> => {
  try {
    const adminData = await apiClient.get(`/api/admin/admins/${adminId}`);
    
    const permissions = adminData.Permission ? {
      can_manage_tables: adminData.Permission.can_manage_tables === 1,
      can_manage_canteen: adminData.Permission.can_manage_canteen === 1,
      can_view_reports: adminData.Permission.can_view_reports === 1
    } : {
      can_manage_tables: true,
      can_manage_canteen: true,
      can_view_reports: true
    };
    
    return mapDatabaseUserToAppUser(adminData, permissions);
  } catch (error) {
    console.error('Error fetching admin details:', error);
    return null;
  }
};

// Update admin - matches /api/admin/admins/:id endpoint
export const updateAdmin = async (
  adminId: number, 
  adminData: {
    username?: string;
    email?: string;
    password?: string;
    can_manage_tables?: boolean;
    can_manage_canteen?: boolean;
    can_view_reports?: boolean;
  }
): Promise<void> => {
  try {
    await apiClient.put(`/api/admin/admins/${adminId}`, adminData);
  } catch (error) {
    console.error('Error updating admin:', error);
    throw error;
  }
};

// Delete admin - matches /api/admin/admins/:id endpoint
export const deleteAdmin = async (adminId: number): Promise<void> => {
  try {
    await apiClient.delete(`/api/admin/admins/${adminId}`);
  } catch (error) {
    console.error('Error deleting admin:', error);
    throw error;
  }
};

// Generic user functions that route to appropriate endpoints
export const getUserById = async (userId: number, role: string): Promise<User | null> => {
  try {
    if (role === 'sub_admin') {
      return await getAdminById(userId);
    } else {
      // For managers, we don't have a specific endpoint, so we'll get them from the users list
      const users = await getAllUsers();
      return users.find(user => user.id === userId) || null;
    }
  } catch (error) {
    console.error('Error fetching user details:', error);
    return null;
  }
};

export const updateUser = async (
  userId: number, 
  userData: {
    username?: string;
    email?: string;
    password?: string;
    role?: string;
    permissions?: {
      can_manage_tables?: boolean;
      can_manage_canteen?: boolean;
      can_view_reports?: boolean;
    };
  }
): Promise<void> => {
  try {
    if (userData.role === 'sub_admin') {
      // Update admin using admin endpoint
      const adminUpdateData: any = {};
      if (userData.username) adminUpdateData.username = userData.username;
      if (userData.email) adminUpdateData.email = userData.email;
      if (userData.password) adminUpdateData.password = userData.password;
      if (userData.permissions?.can_manage_tables !== undefined) {
        adminUpdateData.can_manage_tables = userData.permissions.can_manage_tables;
      }
      if (userData.permissions?.can_manage_canteen !== undefined) {
        adminUpdateData.can_manage_canteen = userData.permissions.can_manage_canteen;
      }
      if (userData.permissions?.can_view_reports !== undefined) {
        adminUpdateData.can_view_reports = userData.permissions.can_view_reports;
      }
      
      await updateAdmin(userId, adminUpdateData);
    } else {
      // For managers, only status updates are supported via the users endpoint
      if (userData.permissions || userData.username || userData.email || userData.password) {
        throw new Error("Manager profile updates not supported through this endpoint");
      }
    }
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (userId: number, role: string): Promise<void> => {
  try {
    if (role === 'sub_admin') {
      await deleteAdmin(userId);
    } else {
      throw new Error("Manager deletion not supported through current endpoints");
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};
