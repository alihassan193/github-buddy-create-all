
import { User, UserPermissions } from '../types';
import { apiClient } from './apiClient';

// Login user - updated to match backend signin endpoint (using username)
export const login = async (email: string, password: string): Promise<any> => {
  try {
    // Your API uses username for login, but we'll treat email as username for now
    const result = await apiClient.post('/api/auth/signin', { username: email, password });
    
    if (result.success && result.data) {
      const responseData = result.data;
      
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
    }
    
    throw new Error(result.message || 'Login failed');
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
    
    if (result.success) {
      return result;
    }
    
    throw new Error(result.message || 'Registration failed');
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
    
    if (response.success && response.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      return response.data.accessToken;
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
    // Your API doesn't have a logout endpoint, so we'll just clear local storage
    console.log('Logging out user');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
  }
};

// Get current user profile - matches backend endpoint
export const getUserProfile = async (): Promise<any> => {
  try {
    const response = await apiClient.get('/api/auth/me');
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to get user profile');
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Change password - placeholder (not in your API docs)
export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  try {
    // This endpoint is not in your API docs, so it's a placeholder
    throw new Error('Change password functionality not implemented in backend');
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

// Map database user to app user - updated to handle new backend structure
export const mapDatabaseUserToAppUser = (userData: any, permissions?: UserPermissions | null): User | null => {
  if (!userData) return null;

  // Handle permissions from the backend structure
  let mappedPermissions: UserPermissions;
  
  // Handle different permission structures from different API responses
  if (userData.permissions) {
    // If permissions come from the API response (login/me endpoints)
    mappedPermissions = {
      can_manage_tables: userData.permissions.can_manage_tables === 1 || userData.permissions.can_manage_tables === true,
      can_manage_canteen: userData.permissions.can_manage_canteen === 1 || userData.permissions.can_manage_canteen === true,
      can_view_reports: userData.permissions.can_view_reports === 1 || userData.permissions.can_view_reports === true,
    };
  } else if (userData.Permission) {
    // Handle uppercase Permission (from some API responses)
    mappedPermissions = {
      can_manage_tables: userData.Permission.can_manage_tables === 1 || userData.Permission.can_manage_tables === true,
      can_manage_canteen: userData.Permission.can_manage_canteen === 1 || userData.Permission.can_manage_canteen === true,
      can_view_reports: userData.Permission.can_view_reports === 1 || userData.Permission.can_view_reports === true,
    };
  } else if (userData.permission) {
    // Handle lowercase permission (from some API responses)
    mappedPermissions = {
      can_manage_tables: userData.permission.can_manage_tables === 1 || userData.permission.can_manage_tables === true,
      can_manage_canteen: userData.permission.can_manage_canteen === 1 || userData.permission.can_manage_canteen === true,
      can_view_reports: userData.permission.can_view_reports === 1 || userData.permission.can_view_reports === true,
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

  // Handle club_id from different possible locations
  let clubId = userData.club_id || userData.clubId || (userData.club ? userData.club.id : null);

  return {
    id: userData.id,
    username: userData.username,
    email: userData.email,
    role: userData.role,
    is_active: userData.is_active === 1 || userData.is_active === true,
    sub_admin_id: userData.sub_admin_id,
    club_id: clubId,
    permissions: mappedPermissions
  };
};
