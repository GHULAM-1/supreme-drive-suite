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
          affected_entity_id: string | null
          affected_entity_type: string | null
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          affected_entity_id?: string | null
          affected_entity_type?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          affected_entity_id?: string | null
          affected_entity_type?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          additional_requirements: string | null
          assigned_at: string | null
          assigned_by: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          completed_at: string | null
          confirmed_at: string | null
          created_at: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          distance_miles: number | null
          driver_id: string | null
          dropoff_location: string
          duration_minutes: number | null
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
          assigned_at?: string | null
          assigned_by?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          distance_miles?: number | null
          driver_id?: string | null
          dropoff_location: string
          duration_minutes?: number | null
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
          assigned_at?: string | null
          assigned_by?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          distance_miles?: number | null
          driver_id?: string | null
          dropoff_location?: string
          duration_minutes?: number | null
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
            foreignKeyName: "bookings_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
      documents: {
        Row: {
          document_type: string
          entity_id: string
          entity_type: string
          expiry_date: string | null
          file_name: string
          file_url: string
          id: string
          is_verified: boolean | null
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          document_type: string
          entity_id: string
          entity_type: string
          expiry_date?: string | null
          file_name: string
          file_url: string
          id?: string
          is_verified?: boolean | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          document_type?: string
          entity_id?: string
          entity_type?: string
          expiry_date?: string | null
          file_name?: string
          file_url?: string
          id?: string
          is_verified?: boolean | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_availability: {
        Row: {
          created_at: string | null
          date: string
          driver_id: string
          end_time: string | null
          id: string
          is_available: boolean | null
          notes: string | null
          start_time: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          driver_id: string
          end_time?: string | null
          id?: string
          is_available?: boolean | null
          notes?: string | null
          start_time?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          driver_id?: string
          end_time?: string | null
          id?: string
          is_available?: boolean | null
          notes?: string | null
          start_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_availability_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          average_rating: number | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          is_available: boolean | null
          last_active_date: string | null
          license_number: string | null
          name: string
          phone: string | null
          specializations: string[] | null
          total_jobs_completed: number | null
        }
        Insert: {
          average_rating?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_available?: boolean | null
          last_active_date?: string | null
          license_number?: string | null
          name: string
          phone?: string | null
          specializations?: string[] | null
          total_jobs_completed?: number | null
        }
        Update: {
          average_rating?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_available?: boolean | null
          last_active_date?: string | null
          license_number?: string | null
          name?: string
          phone?: string | null
          specializations?: string[] | null
          total_jobs_completed?: number | null
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
      job_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          booking_id: string
          driver_id: string | null
          id: string
          notes: string | null
          unassigned_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          booking_id: string
          driver_id?: string | null
          id?: string
          notes?: string | null
          unassigned_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          booking_id?: string
          driver_id?: string | null
          id?: string
          notes?: string | null
          unassigned_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_assignments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_assignments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "job_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_assignments_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_assignments_vehicle_id_fkey"
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
      user_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          permission?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_service_history: {
        Row: {
          cost: number | null
          created_at: string | null
          id: string
          mileage: number | null
          next_service_date: string | null
          notes: string | null
          service_date: string
          service_type: string
          vehicle_id: string
        }
        Insert: {
          cost?: number | null
          created_at?: string | null
          id?: string
          mileage?: number | null
          next_service_date?: string | null
          notes?: string | null
          service_date: string
          service_type: string
          vehicle_id: string
        }
        Update: {
          cost?: number | null
          created_at?: string | null
          id?: string
          mileage?: number | null
          next_service_date?: string | null
          notes?: string | null
          service_date?: string
          service_type?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_service_history_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          base_price_per_mile: number
          capacity: number
          category: string
          created_at: string | null
          current_mileage: number | null
          description: string | null
          features: string[] | null
          id: string
          image_url: string | null
          is_active: boolean | null
          last_service_date: string | null
          luggage_capacity: number
          name: string
          next_service_date: string | null
          overnight_surcharge: number | null
          service_status: string | null
        }
        Insert: {
          base_price_per_mile: number
          capacity: number
          category: string
          created_at?: string | null
          current_mileage?: number | null
          description?: string | null
          features?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          last_service_date?: string | null
          luggage_capacity: number
          name: string
          next_service_date?: string | null
          overnight_surcharge?: number | null
          service_status?: string | null
        }
        Update: {
          base_price_per_mile?: number
          capacity?: number
          category?: string
          created_at?: string | null
          current_mileage?: number | null
          description?: string | null
          features?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          last_service_date?: string | null
          luggage_capacity?: number
          name?: string
          next_service_date?: string | null
          overnight_surcharge?: number | null
          service_status?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      job_details: {
        Row: {
          additional_requirements: string | null
          assigned_at: string | null
          assigned_by: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          completed_at: string | null
          confirmed_at: string | null
          created_at: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          distance_miles: number | null
          driver_email: string | null
          driver_id: string | null
          driver_name: string | null
          driver_phone: string | null
          dropoff_location: string | null
          duration_minutes: number | null
          estimated_miles: number | null
          has_overnight_stop: boolean | null
          id: string | null
          internal_notes: string | null
          is_long_drive: boolean | null
          luggage: number | null
          passengers: number | null
          pickup_date: string | null
          pickup_location: string | null
          pickup_time: string | null
          route_notes: string | null
          status: string | null
          total_price: number | null
          vehicle_capacity: number | null
          vehicle_category: string | null
          vehicle_id: string | null
          vehicle_image: string | null
          vehicle_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
    }
    Functions: {
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
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
