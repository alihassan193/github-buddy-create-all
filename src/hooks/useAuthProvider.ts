
import { useState, useEffect } from 'react';
import { User } from "../types";
import { 
  getUserProfile, 
  login as loginService, 
  logout as logoutService, 
  register as registerService, 
  mapDatabaseUserToAppUser, 
  refreshToken as refreshTokenService,
  changePassword as changePasswordService
} from "../services/authService";
import { 
  getAllUsers as getAllUsersService, 
  createUser as createUserService, 
  setUserStatus as setUserStatusService, 
  getUserById as getUserByIdService,
  getAllAdmins as getAllAdminsService,
  updateAdmin as updateAdminService,
  deleteAdmin as deleteAdminService
} from "../services/userService";
import { useToast } from "@/hooks/use-toast";

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  
  // Check for existing session (JWT token)
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Try to get current user from backend
        const userData = await getUserProfile();
        const appUser = mapDatabaseUserToAppUser(userData, userData.Permission || userData.permission);
        if (appUser) {
          setUser(appUser);
        }
      } catch (error) {
        console.error("Failed to verify session:", error);
        // Try to refresh token
        try {
          const newToken = await refreshTokenService();
          if (newToken) {
            // Try again with new token
            const userData = await getUserProfile();
            const appUser = mapDatabaseUserToAppUser(userData, userData.Permission || userData.permission);
            if (appUser) {
              setUser(appUser);
            }
          } else {
            // Refresh failed, clear tokens
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userData');
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userData');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);
  
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const response = await loginService(email, password);
      
      // Map the user data to our app format - the response now contains user data correctly
      const appUser = mapDatabaseUserToAppUser(response.user, response.user.permission || response.user.Permission);
      if (appUser) {
        setUser(appUser);
      }
      
      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string, role?: string, permissions?: any) => {
    setIsLoading(true);
    
    try {
      return await registerService(username, email, password, role, permissions);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await changePasswordService(currentPassword, newPassword);
      toast({
        title: "Success",
        description: "Password changed successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive"
      });
      throw error;
    }
  };

  const createUser = async (
    username: string, 
    email: string, 
    password: string, 
    role: 'super_admin' | 'sub_admin' | 'manager', 
    subAdminId?: number
  ) => {
    try {
      const newUser = await createUserService(username, email, password, role, subAdminId);
      return newUser;
    } catch (error) {
      throw error;
    }
  };

  const getAllUsers = async (): Promise<User[]> => {
    try {
      const response = await getAllUsersService();
      return response.users || [];
    } catch (error) {
      console.error("Failed to fetch users:", error);
      return [];
    }
  };

  const getAllAdmins = async (): Promise<User[]> => {
    try {
      const fetchedAdmins = await getAllAdminsService();
      return fetchedAdmins;
    } catch (error) {
      console.error("Failed to fetch admins:", error);
      return [];
    }
  };
  
  const getUserById = async (userId: number, role: string): Promise<User | null> => {
    try {
      return await getUserByIdService(userId);
    } catch (error) {
      console.error("Failed to fetch user details:", error);
      return null;
    }
  };
  
  const setUserStatus = async (userId: number, isActive: boolean): Promise<void> => {
    try {
      await setUserStatusService(userId, isActive);
      
      // If the current user is being deactivated, log them out
      if (user?.id === userId && !isActive) {
        logout();
      }
    } catch (error) {
      throw error;
    }
  };

  const updateAdmin = async (
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
      await updateAdminService(adminId, adminData);
    } catch (error) {
      throw error;
    }
  };

  const deleteAdmin = async (adminId: number): Promise<void> => {
    try {
      await deleteAdminService(adminId);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutService();
      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully"
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    changePassword,
    getAllUsers,
    getAllAdmins,
    createUser,
    setUserStatus,
    getUserById,
    updateAdmin,
    deleteAdmin
  };
};
