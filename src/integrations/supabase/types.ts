export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          additional_requirements: string | null
          completed_at: string | null
          confirmed_at: string | null
          created_at: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          driver_id: string | null
          dropoff_location: string
          estimated_miles: number | null
          has_overnight_stop: boolean | null
          id: string
          internal_notes: string | null
          is_long_drive: boolean | null
          luggage: number
          passengers: number
          pickup_date: string
          pickup_location: string
          pickup_time: string
          route_notes: string | null
          status: string | null
          total_price: number | null
          vehicle_id: string | null
        }
        Insert: {
          additional_requirements?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          driver_id?: string | null
          dropoff_location: string
          estimated_miles?: number | null
          has_overnight_stop?: boolean | null
          id?: string
          internal_notes?: string | null
          is_long_drive?: boolean | null
          luggage: number
          passengers: number
          pickup_date: string
          pickup_location: string
          pickup_time: string
          route_notes?: string | null
          status?: string | null
          total_price?: number | null
          vehicle_id?: string | null
        }
        Update: {
          additional_requirements?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          driver_id?: string | null
          dropoff_location?: string
          estimated_miles?: number | null
          has_overnight_stop?: boolean | null
          id?: string
          internal_notes?: string | null
          is_long_drive?: boolean | null
          luggage?: number
          passengers?: number
          pickup_date?: string
          pickup_location?: string
          pickup_time?: string
          route_notes?: string | null
          status?: string | null
          total_price?: number | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          is_available: boolean | null
          license_number: string | null
          name: string
          phone: string | null
          specializations: string[] | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_available?: boolean | null
          license_number?: string | null
          name: string
          phone?: string | null
          specializations?: string[] | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_available?: boolean | null
          license_number?: string | null
          name?: string
          phone?: string | null
          specializations?: string[] | null
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          category: string
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          question: string
        }
        Insert: {
          answer: string
          category: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          question: string
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          question?: string
        }
        Relationships: []
      }
      fixed_routes: {
        Row: {
          created_at: string | null
          dropoff_location: string
          fixed_price: number
          id: string
          is_active: boolean | null
          pickup_location: string
          route_name: string
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string | null
          dropoff_location: string
          fixed_price: number
          id?: string
          is_active?: boolean | null
          pickup_location: string
          route_name: string
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string | null
          dropoff_location?: string
          fixed_price?: number
          id?: string
          is_active?: boolean | null
          pickup_location?: string
          route_name?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fixed_routes_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_extras: {
        Row: {
          created_at: string | null
          description: string | null
          extra_name: string
          id: string
          is_active: boolean | null
          price: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          extra_name: string
          id?: string
          is_active?: boolean | null
          price: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          extra_name?: string
          id?: string
          is_active?: boolean | null
          price?: number
        }
        Relationships: []
      }
      pricing_rules: {
        Row: {
          base_fee: number | null
          created_at: string | null
          fixed_amount: number | null
          id: string
          is_active: boolean | null
          minimum_fare: number | null
          multiplier: number | null
          rule_name: string
          rule_type: string
          vehicle_category: string | null
          wait_time_per_hour: number | null
        }
        Insert: {
          base_fee?: number | null
          created_at?: string | null
          fixed_amount?: number | null
          id?: string
          is_active?: boolean | null
          minimum_fare?: number | null
          multiplier?: number | null
          rule_name: string
          rule_type: string
          vehicle_category?: string | null
          wait_time_per_hour?: number | null
        }
        Update: {
          base_fee?: number | null
          created_at?: string | null
          fixed_amount?: number | null
          id?: string
          is_active?: boolean | null
          minimum_fare?: number | null
          multiplier?: number | null
          rule_name?: string
          rule_type?: string
          vehicle_category?: string | null
          wait_time_per_hour?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          role: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          role?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          content: string
          created_at: string | null
          customer_name: string
          customer_title: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          rating: number | null
        }
        Insert: {
          content: string
          created_at?: string | null
          customer_name: string
          customer_title?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          rating?: number | null
        }
        Update: {
          content?: string
          created_at?: string | null
          customer_name?: string
          customer_title?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          rating?: number | null
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          base_price_per_mile: number
          capacity: number
          category: string
          created_at: string | null
          description: string | null
          features: string[] | null
          id: string
          image_url: string | null
          is_active: boolean | null
          luggage_capacity: number
          name: string
          overnight_surcharge: number | null
        }
        Insert: {
          base_price_per_mile: number
          capacity: number
          category: string
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          luggage_capacity: number
          name: string
          overnight_surcharge?: number | null
        }
        Update: {
          base_price_per_mile?: number
          capacity?: number
          category?: string
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          luggage_capacity?: number
          name?: string
          overnight_surcharge?: number | null
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
