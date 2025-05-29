
import { User, UserPermissions } from "../types";
import { apiClient } from "./apiClient";
import { mapDatabaseUserToAppUser } from "./authService";

// Get all users - matches /api/admin/users endpoint with pagination
export const getAllUsers = async (page: number = 1, limit: number = 10): Promise<{ users: User[], total: number, page: number, totalPages: number }> => {
  try {
    const response = await apiClient.get(`/api/admin/users?page=${page}&limit=${limit}`);
    
    console.log("API Response - All Users:", response);
    
    // The API returns users with permission objects included
    const allUsers = Array.isArray(response.users) 
      ? response.users.map((user: any) => {
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
    return {
      users: allUsers.filter(Boolean) as User[],
      total: response.total || 0,
      page: response.page || 1,
      totalPages: response.totalPages || 1
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

// Create sub-admin - matches /api/admin/create-admin endpoint
export const createSubAdmin = async (
  username: string, 
  email: string, 
  password: string,
  club_ids?: number[],
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
      role: 'sub_admin',
      club_ids: club_ids || [],
      ...permissions
    });
    
    return userData;
  } catch (error) {
    console.error('Error creating sub-admin:', error);
    throw error;
  }
};

// Create manager - matches /api/admin/create-manager endpoint
export const createManager = async (
  username: string, 
  email: string, 
  password: string,
  club_id: number,
  permissions?: {
    can_manage_tables?: boolean;
    can_manage_canteen?: boolean;
    can_view_reports?: boolean;
  }
) => {
  try {
    const userData = await apiClient.post('/api/admin/create-manager', {
      username,
      email,
      password,
      club_id,
      can_manage_tables: permissions?.can_manage_tables ?? true,
      can_manage_canteen: permissions?.can_manage_canteen ?? true,
      can_view_reports: permissions?.can_view_reports ?? true
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
  club_id?: number,
  club_ids?: number[]
) => {
  try {
    if (role === 'sub_admin') {
      return await createSubAdmin(username, email, password, club_ids);
    } else if (role === 'manager') {
      if (!club_id) {
        throw new Error("Club ID is required for managers");
      }
      return await createManager(username, email, password, club_id);
    } else {
      throw new Error("Super admin creation not supported through this endpoint");
    }
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Get managed clubs - matches /api/admin/managed-clubs endpoint
export const getManagedClubs = async (): Promise<any[]> => {
  try {
    const response = await apiClient.get("/api/admin/managed-clubs");
    return response.clubs || response;
  } catch (error) {
    console.error("Error fetching managed clubs:", error);
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

// Legacy function for backward compatibility
export const getAllAdmins = async (): Promise<User[]> => {
  try {
    const response = await getAllUsers(1, 100); // Get first 100 users
    return response.users.filter(user => user.role === 'sub_admin' || user.role === 'super_admin');
  } catch (error) {
    console.error("Error fetching admins:", error);
    return [];
  }
};

// Get user by ID
export const getUserById = async (userId: number): Promise<User | null> => {
  try {
    const response = await getAllUsers(1, 1000); // Get all users and find the one
    return response.users.find(user => user.id === userId) || null;
  } catch (error) {
    console.error('Error fetching user details:', error);
    return null;
  }
};

// Update admin/manager
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
    await apiClient.put(`/api/admin/users/${adminId}`, adminData);
  } catch (error) {
    console.error('Error updating admin:', error);
    throw error;
  }
};

// Delete admin/manager
export const deleteAdmin = async (adminId: number): Promise<void> => {
  try {
    await apiClient.delete(`/api/admin/users/${adminId}`);
  } catch (error) {
    console.error('Error deleting admin:', error);
    throw error;
  }
};
