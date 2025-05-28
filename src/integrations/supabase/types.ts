export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      canteen_categories: {
        Row: {
          id: number | null
          name: string | null
        }
        Insert: {
          id?: number | null
          name?: string | null
        }
        Update: {
          id?: number | null
          name?: string | null
        }
        Relationships: []
      }
      canteen_items: {
        Row: {
          category_id: number | null
          created_at: string | null
          created_by: number | null
          id: number | null
          name: string | null
          price: number | null
          stock_quantity: number | null
        }
        Insert: {
          category_id?: number | null
          created_at?: string | null
          created_by?: number | null
          id?: number | null
          name?: string | null
          price?: number | null
          stock_quantity?: number | null
        }
        Update: {
          category_id?: number | null
          created_at?: string | null
          created_by?: number | null
          id?: number | null
          name?: string | null
          price?: number | null
          stock_quantity?: number | null
        }
        Relationships: []
      }
      canteen_orders: {
        Row: {
          id: number | null
          item_id: number | null
          order_time: string | null
          quantity: number | null
          served_by: number | null
          session_id: number | null
          total_price: number | null
        }
        Insert: {
          id?: number | null
          item_id?: number | null
          order_time?: string | null
          quantity?: number | null
          served_by?: number | null
          session_id?: number | null
          total_price?: number | null
        }
        Update: {
          id?: number | null
          item_id?: number | null
          order_time?: string | null
          quantity?: number | null
          served_by?: number | null
          session_id?: number | null
          total_price?: number | null
        }
        Relationships: []
      }
      game_pricing: {
        Row: {
          created_at: string | null
          created_by: number | null
          game_type_id: number | null
          id: number | null
          is_unlimited: string | null
          price: number | null
          table_id: number | null
          time_limit_minutes: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: number | null
          game_type_id?: number | null
          id?: number | null
          is_unlimited?: string | null
          price?: number | null
          table_id?: number | null
          time_limit_minutes?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: number | null
          game_type_id?: number | null
          id?: number | null
          is_unlimited?: string | null
          price?: number | null
          table_id?: number | null
          time_limit_minutes?: number | null
        }
        Relationships: []
      }
      game_types: {
        Row: {
          id: number | null
          name: string | null
        }
        Insert: {
          id?: number | null
          name?: string | null
        }
        Update: {
          id?: number | null
          name?: string | null
        }
        Relationships: []
      }
      permissions: {
        Row: {
          can_manage_canteen: number | null
          can_manage_tables: number | null
          can_view_reports: number | null
          id: number | null
          user_id: number | null
        }
        Insert: {
          can_manage_canteen?: number | null
          can_manage_tables?: number | null
          can_view_reports?: number | null
          id?: number | null
          user_id?: number | null
        }
        Update: {
          can_manage_canteen?: number | null
          can_manage_tables?: number | null
          can_view_reports?: number | null
          id?: number | null
          user_id?: number | null
        }
        Relationships: []
      }
      snooker_tables: {
        Row: {
          created_at: string | null
          created_by: number | null
          id: number | null
          status: string | null
          table_number: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: number | null
          id?: number | null
          status?: string | null
          table_number?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: number | null
          id?: number | null
          status?: string | null
          table_number?: string | null
        }
        Relationships: []
      }
      table_sessions: {
        Row: {
          end_time: string | null
          game_type_id: number | null
          id: number | null
          is_guest: string | null
          player_name: string | null
          start_time: string | null
          status: string | null
          table_id: number | null
          total_amount: string | null
        }
        Insert: {
          end_time?: string | null
          game_type_id?: number | null
          id?: number | null
          is_guest?: string | null
          player_name?: string | null
          start_time?: string | null
          status?: string | null
          table_id?: number | null
          total_amount?: string | null
        }
        Update: {
          end_time?: string | null
          game_type_id?: number | null
          id?: number | null
          is_guest?: string | null
          player_name?: string | null
          start_time?: string | null
          status?: string | null
          table_id?: number | null
          total_amount?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string | null
          id: number | null
          is_active: number | null
          password: string | null
          role: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: number | null
          is_active?: number | null
          password?: string | null
          role?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: number | null
          is_active?: number | null
          password?: string | null
          role?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
