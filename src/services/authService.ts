import { User, UserPermissions } from '../types';
import { apiClient } from './apiClient';

// Login user - updated to match backend signin endpoint
export const login = async (username: string, password: string): Promise<any> => {
  try {
    const result = await apiClient.post('/api/auth/signin', { username, password });
    
    // The backend returns { success: true, message: "...", data: { user, accessToken, refreshToken } }
    const responseData = result.data || result;
    
    if (responseData.accessToken) {
      localStorage.setItem('accessToken', responseData.accessToken);
    }
    
    if (responseData.refreshToken) {
      localStorage.setItem('refreshToken', responseData.refreshToken);
    }
    
    // Store the complete user data from backend response
    if (responseData.user) {
      localStorage.setItem('userData', JSON.stringify(responseData.user));
    }
    
    return responseData;
  } catch (error: any) {
    console.error('Login error:', error);
    throw new Error(error.message || 'Invalid credentials');
  }
};

// Register new user - updated to match backend signup endpoint
export const register = async (
  username: string, 
  email: string, 
  password: string, 
  role?: string, 
  permissions?: UserPermissions
): Promise<any> => {
  try {
    const userData = {
      username,
      email,
      password,
      role: role || 'sub_admin',
      ...(permissions && { permissions })
    };
    
    const result = await apiClient.post('/api/auth/signup', userData);
    return result;
  } catch (error: any) {
    console.error('Registration error:', error);
    throw new Error(error.message || 'Registration failed');
  }
};

// Refresh token - matches backend endpoint
export const refreshToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!refreshToken) {
    return null;
  }
  
  try {
    const response = await apiClient.post('/api/auth/refresh-token', { refreshToken });
    
    if (response.accessToken) {
      localStorage.setItem('accessToken', response.accessToken);
      return response.accessToken;
    }
    
    return null;
  } catch (error) {
    console.error('Token refresh error:', error);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return null;
  }
};

// Logout user - matches backend endpoint
export const logout = async (): Promise<void> => {
  try {
    // Call backend logout endpoint
    await apiClient.post('/api/auth/logout', {});
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
  }
};

// Get current user profile - new endpoint from backend
export const getUserProfile = async (): Promise<any> => {
  try {
    const userData = await apiClient.get('/api/auth/me');
    return userData;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Change password - new endpoint from backend
export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  try {
    await apiClient.put('/api/auth/change-password', {
      currentPassword,
      newPassword
    });
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

// Map database user to app user - updated to handle new backend structure
export const mapDatabaseUserToAppUser = (userData: any, permissions: UserPermissions | null): User | null => {
  if (!userData) return null;

  // Handle permissions from the backend structure
  let mappedPermissions: UserPermissions;
  
  if (userData.permission) {
    // If permissions come from the Permission association
    mappedPermissions = {
      can_manage_tables: userData.permission.can_manage_tables === 1 || userData.permission.can_manage_tables === true,
      can_manage_canteen: userData.permission.can_manage_canteen === 1 || userData.permission.can_manage_canteen === true,
      can_view_reports: userData.permission.can_view_reports === 1 || userData.permission.can_view_reports === true,
    };
  } else if (userData.Permission) {
    // Alternative permission structure
    mappedPermissions = {
      can_manage_tables: userData.Permission.can_manage_tables === 1 || userData.Permission.can_manage_tables === true,
      can_manage_canteen: userData.Permission.can_manage_canteen === 1 || userData.Permission.can_manage_canteen === true,
      can_view_reports: userData.Permission.can_view_reports === 1 || userData.Permission.can_view_reports === true,
    };
  } else if (permissions) {
    // Use provided permissions
    mappedPermissions = {
      can_manage_tables: permissions.can_manage_tables === true,
      can_manage_canteen: permissions.can_manage_canteen === true,
      can_view_reports: permissions.can_view_reports === true,
    };
  } else {
    // Default permissions based on role
    mappedPermissions = {
      can_manage_tables: userData.role === 'super_admin' || userData.role === 'sub_admin',
      can_manage_canteen: true,
      can_view_reports: userData.role === 'super_admin' || userData.role === 'sub_admin' || userData.role === 'manager'
    };
  }

  return {
    id: userData.id,
    username: userData.username,
    email: userData.email,
    role: userData.role,
    is_active: userData.is_active === 1 || userData.is_active === true,
    sub_admin_id: userData.sub_admin_id,
    club_id: userData.club_id, // Added club_id support
    permissions: mappedPermissions
  };
};
