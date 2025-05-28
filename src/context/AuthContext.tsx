
import React, { createContext, useContext } from 'react';
import { User, UserPermissions } from '../types';
import { useAuthProvider } from '../hooks/useAuthProvider';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, role: 'super_admin' | 'sub_admin' | 'manager', subAdminId?: number) => Promise<any>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  getAllUsers: () => Promise<User[]>;
  getAllAdmins: () => Promise<User[]>;
  createUser: (username: string, email: string, password: string, role: 'super_admin' | 'sub_admin' | 'manager', subAdminId?: number) => Promise<any>;
  setUserStatus: (userId: number, isActive: boolean) => Promise<void>;
  updateAdmin: (adminId: number, adminData: {
    username?: string;
    email?: string;
    password?: string;
    can_manage_tables?: boolean;
    can_manage_canteen?: boolean;
    can_view_reports?: boolean;
  }) => Promise<void>;
  deleteAdmin: (adminId: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuthProvider();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
