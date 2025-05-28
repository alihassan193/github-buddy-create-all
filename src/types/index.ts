
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'super_admin' | 'sub_admin' | 'manager';
  sub_admin_id?: number; // Reference to the sub_admin that created this manager (if role is manager)
  club_id?: number; // Club association for the user
  is_active: boolean;
  permissions?: UserPermissions;
}

export interface UserPermissions {
  can_manage_tables: boolean;
  can_manage_canteen: boolean;
  can_view_reports: boolean;
}

export interface SnookerTable {
  id: number;
  table_number: string;
  status: 'available' | 'occupied' | 'maintenance';
  created_by: number;
  created_at: string;
  name?: string; // Added for display purposes
  table_type?: string;
  hourly_rate?: number;
  club_id?: number;
}

export interface GameType {
  id: number;
  name: string;
  pricing_type?: string; // 'fixed' | 'per_minute'
}

export interface GamePricing {
  id: number;
  table_id: number;
  game_type_id: number;
  price: number;
  time_limit_minutes: number | null;
  is_unlimited: boolean;
  created_by: number;
  created_at: string;
  price_per_hour?: number;
  price_per_game?: number;
  effective_from?: string;
  club_id?: number;
}

export interface CanteenCategory {
  id: number;
  name: string;
}

export interface CanteenItem {
  id: number;
  name: string;
  category_id: number;
  category_name?: string; // For display purposes
  description?: string;
  price: number;
  stock_quantity: number;
  created_by: number;
  created_at: string;
  is_available?: boolean;
  club_id?: number;
}

export interface TableSession {
  id: number;
  table_id: number;
  game_type_id: number;
  start_time: string;
  end_time?: string;
  player_name: string;
  is_guest: boolean;
  total_amount?: number;
  status: 'active' | 'completed' | 'cancelled';
  player_id?: number;
  duration_minutes?: number;
  total_cost?: number;
  club_id?: number;
}

export interface CanteenOrder {
  id: number;
  session_id: number | null; // Can be null for guest orders
  item_id: number;
  item_name?: string; // For display purposes
  quantity: number;
  total_price: number;
  order_time: string;
  served_by: number;
}

export interface CartItem {
  item: CanteenItem;
  quantity: number;
}

export interface InvoiceItem {
  id: string;
  type: 'game' | 'canteen';
  name: string;
  quantity: number;
  price: number;
  total: number;
  item_name?: string;
  unit_price?: number;
  total_price?: number;
}

export interface Invoice {
  id: string;
  session_id?: number;
  tableId?: number; // Added to reference the table
  date: string;
  items: InvoiceItem[];
  total: number;
  isPaid: boolean;
  player_id?: number;
  subtotal?: number;
  tax_rate?: number;
  tax_amount?: number;
  discount?: number;
  total_amount?: number;
  status?: 'pending' | 'paid' | 'cancelled';
  payment_method?: string;
  paid_at?: string;
  club_id?: number;
}

// Game interface for ActiveGame component
export interface Game {
  id: string;
  tableId: number;
  type: 'frame' | 'century';
  startTime: Date;
  player1: string;
  player2: string;
  frames?: {
    id: string;
    winner: string;
    loser: string;
  }[];
}

// Player interface
export interface Player {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  date_of_birth?: string;
  membership_type?: string;
  club_id?: number;
  is_active?: boolean;
  total_spent?: number;
  total_visits?: number;
  first_name?: string;
  last_name?: string;
}

// Club interface
export interface Club {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  status?: string;
  created_at?: string;
}
