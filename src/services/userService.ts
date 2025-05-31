
import { User, UserPermissions } from "../types";
import { apiClient } from "./apiClient";
import { mapDatabaseUserToAppUser } from "./authService";

// Get all users - matches /api/admin/users endpoint
export const getAllUsers = async (page: number = 1, limit: number = 10): Promise<{ users: User[], total: number, page: number, totalPages: number }> => {
  try {
    const response = await apiClient.get(`/api/admin/users?page=${page}&limit=${limit}`);
    
    console.log("API Response - All Users:", response);
    
    if (response.success && response.data) {
      const users = Array.isArray(response.data) ? response.data : [];
      
      const mappedUsers = users.map((user: any) => {
        const permissions = user.permissions || {
          can_manage_tables: user.role === 'super_admin' || user.role === 'sub_admin',
          can_manage_canteen: true,
          can_view_reports: user.role === 'super_admin' || user.role === 'sub_admin' || user.role === 'manager'
        };
        
        return mapDatabaseUserToAppUser(user, permissions);
      }).filter(Boolean) as User[];
      
      console.log("Mapped Users:", mappedUsers);
      return {
        users: mappedUsers,
        total: response.pagination?.total || mappedUsers.length,
        page: response.pagination?.page || page,
        totalPages: response.pagination?.totalPages || Math.ceil(mappedUsers.length / limit)
      };
    }
    
    throw new Error(response.message || 'Failed to fetch users');
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
    
    if (userData.success) {
      return userData;
    }
    
    throw new Error(userData.message || 'Failed to create sub-admin');
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
    
    if (userData.success) {
      return userData;
    }
    
    throw new Error(userData.message || 'Failed to create manager');
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
    
    if (response.success) {
      return response.data || [];
    }
    
    throw new Error(response.message || 'Failed to fetch managed clubs');
  } catch (error) {
    console.error("Error fetching managed clubs:", error);
    throw error;
  }
};

// Set user active status - matches /api/admin/users/:id endpoint
export const setUserStatus = async (userId: number, isActive: boolean): Promise<void> => {
  try {
    const response = await apiClient.put(`/api/admin/users/${userId}`, { 
      is_active: isActive 
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to update user status');
    }
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

// Get all admins - matches /api/admin/admins endpoint
export const getAllAdmins = async (): Promise<User[]> => {
  try {
    const response = await apiClient.get('/api/admin/admins');
    
    if (response.success && response.data) {
      const admins = Array.isArray(response.data) ? response.data : [];
      
      return admins.map((admin: any) => {
        const permissions = admin.permissions || {
          can_manage_tables: admin.role === 'super_admin' || admin.role === 'sub_admin',
          can_manage_canteen: true,
          can_view_reports: true
        };
        
        return mapDatabaseUserToAppUser(admin, permissions);
      }).filter(Boolean) as User[];
    }
    
    throw new Error(response.message || 'Failed to fetch admins');
  } catch (error) {
    console.error("Error fetching admins:", error);
    return [];
  }
};

// Get user by ID - matches /api/admin/admins/:id endpoint
export const getUserById = async (userId: number): Promise<User | null> => {
  try {
    const response = await apiClient.get(`/api/admin/admins/${userId}`);
    
    if (response.success && response.data) {
      const permissions = response.data.permissions || {
        can_manage_tables: response.data.role === 'super_admin' || response.data.role === 'sub_admin',
        can_manage_canteen: true,
        can_view_reports: true
      };
      
      return mapDatabaseUserToAppUser(response.data, permissions);
    }
    
    throw new Error(response.message || 'User not found');
  } catch (error) {
    console.error('Error fetching user details:', error);
    return null;
  }
};

// Update admin/manager - matches /api/admin/admins/:id endpoint
export const updateAdmin = async (
  adminId: number, 
  adminData: {
    username?: string;
    email?: string;
    password?: string;
    can_manage_tables?: boolean;
    can_manage_canteen?: boolean;
    can_view_reports?: boolean;
    club_ids?: number[];
  }
): Promise<void> => {
  try {
    const response = await apiClient.put(`/api/admin/admins/${adminId}`, adminData);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to update admin');
    }
  } catch (error) {
    console.error('Error updating admin:', error);
    throw error;
  }
};

// Delete admin/manager - matches /api/admin/admins/:id endpoint
export const deleteAdmin = async (adminId: number): Promise<void> => {
  try {
    const response = await apiClient.delete(`/api/admin/admins/${adminId}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete admin');
    }
  } catch (error) {
    console.error('Error deleting admin:', error);
    throw error;
  }
};
