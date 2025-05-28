
import { User } from "../types";

// Mock users for demo - will replace these with database calls in production
export const mockUsers: User[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    role: 'super_admin',
    is_active: true,
    permissions: {
      can_manage_tables: true,
      can_manage_canteen: true,
      can_view_reports: true
    }
  },
  {
    id: 2,
    username: 'clubowner',
    email: 'club@example.com',
    role: 'sub_admin',
    is_active: true,
    permissions: {
      can_manage_tables: true,
      can_manage_canteen: true,
      can_view_reports: false
    }
  },
  {
    id: 3,
    username: 'manager',
    email: 'manager@example.com',
    role: 'manager',
    sub_admin_id: 2, // Works under club owner (id: 2)
    is_active: true,
    permissions: {
      can_manage_tables: false,
      can_manage_canteen: true,
      can_view_reports: false
    }
  }
];
