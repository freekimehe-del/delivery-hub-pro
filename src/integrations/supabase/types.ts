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
      customers: {
        Row: {
          address: string | null
          billing_email: string | null
          city: string | null
          company_name: string
          country: string | null
          created_at: string
          email: string
          id: string
          payment_terms: number | null
          phone: string | null
          postal_code: string | null
          profile_id: string | null
          state: string | null
          status: string | null
          total_orders: number | null
          total_spent: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          billing_email?: string | null
          city?: string | null
          company_name: string
          country?: string | null
          created_at?: string
          email: string
          id?: string
          payment_terms?: number | null
          phone?: string | null
          postal_code?: string | null
          profile_id?: string | null
          state?: string | null
          status?: string | null
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          billing_email?: string | null
          city?: string | null
          company_name?: string
          country?: string | null
          created_at?: string
          email?: string
          id?: string
          payment_terms?: number | null
          phone?: string | null
          postal_code?: string | null
          profile_id?: string | null
          state?: string | null
          status?: string | null
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          created_at: string
          current_location: Json | null
          employee_id: string | null
          id: string
          is_online: boolean | null
          last_location_update: string | null
          license_expiry: string | null
          license_number: string | null
          on_time_rate: number | null
          profile_id: string | null
          rating: number | null
          shift_end: string | null
          shift_start: string | null
          status: Database["public"]["Enums"]["driver_status"]
          total_deliveries: number | null
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string
          current_location?: Json | null
          employee_id?: string | null
          id?: string
          is_online?: boolean | null
          last_location_update?: string | null
          license_expiry?: string | null
          license_number?: string | null
          on_time_rate?: number | null
          profile_id?: string | null
          rating?: number | null
          shift_end?: string | null
          shift_start?: string | null
          status?: Database["public"]["Enums"]["driver_status"]
          total_deliveries?: number | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string
          current_location?: Json | null
          employee_id?: string | null
          id?: string
          is_online?: boolean | null
          last_location_update?: string | null
          license_expiry?: string | null
          license_number?: string | null
          on_time_rate?: number | null
          profile_id?: string | null
          rating?: number | null
          shift_end?: string | null
          shift_start?: string | null
          status?: Database["public"]["Enums"]["driver_status"]
          total_deliveries?: number | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drivers_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          location: Json | null
          notes: string | null
          order_id: string
          previous_status: Database["public"]["Enums"]["order_status"] | null
          status: Database["public"]["Enums"]["order_status"]
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          location?: Json | null
          notes?: string | null
          order_id: string
          previous_status?: Database["public"]["Enums"]["order_status"] | null
          status: Database["public"]["Enums"]["order_status"]
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          location?: Json | null
          notes?: string | null
          order_id?: string
          previous_status?: Database["public"]["Enums"]["order_status"] | null
          status?: Database["public"]["Enums"]["order_status"]
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          actual_delivery_time: string | null
          actual_distance: number | null
          actual_pickup_time: string | null
          base_rate: number | null
          cancellation_reason: string | null
          created_at: string
          created_by: string | null
          currency: string | null
          customer_id: string | null
          customer_reference: string | null
          delivery_window_end: string | null
          delivery_window_start: string | null
          distance_charge: number | null
          driver_id: string | null
          dropoff_address: string
          dropoff_city: string | null
          dropoff_contact_name: string | null
          dropoff_contact_phone: string | null
          dropoff_coordinates: Json | null
          dropoff_instructions: string | null
          dropoff_postal_code: string | null
          dropoff_state: string | null
          estimated_delivery_time: string | null
          estimated_distance: number | null
          estimated_pickup_time: string | null
          external_id: string | null
          failure_reason: string | null
          id: string
          is_fragile: boolean | null
          notes: string | null
          package_count: number | null
          package_dimensions: Json | null
          package_type: string | null
          package_weight: number | null
          pickup_address: string
          pickup_city: string | null
          pickup_contact_name: string | null
          pickup_contact_phone: string | null
          pickup_coordinates: Json | null
          pickup_instructions: string | null
          pickup_postal_code: string | null
          pickup_state: string | null
          pickup_window_end: string | null
          pickup_window_start: string | null
          pod_captured_at: string | null
          pod_notes: string | null
          pod_photo_urls: Json | null
          pod_recipient_name: string | null
          pod_signature_url: string | null
          pod_type: string | null
          priority: number | null
          requires_signature: boolean | null
          service_type: Database["public"]["Enums"]["service_type"]
          status: Database["public"]["Enums"]["order_status"]
          surcharges: number | null
          total_amount: number | null
          tracking_number: string
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          actual_delivery_time?: string | null
          actual_distance?: number | null
          actual_pickup_time?: string | null
          base_rate?: number | null
          cancellation_reason?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          customer_id?: string | null
          customer_reference?: string | null
          delivery_window_end?: string | null
          delivery_window_start?: string | null
          distance_charge?: number | null
          driver_id?: string | null
          dropoff_address: string
          dropoff_city?: string | null
          dropoff_contact_name?: string | null
          dropoff_contact_phone?: string | null
          dropoff_coordinates?: Json | null
          dropoff_instructions?: string | null
          dropoff_postal_code?: string | null
          dropoff_state?: string | null
          estimated_delivery_time?: string | null
          estimated_distance?: number | null
          estimated_pickup_time?: string | null
          external_id?: string | null
          failure_reason?: string | null
          id?: string
          is_fragile?: boolean | null
          notes?: string | null
          package_count?: number | null
          package_dimensions?: Json | null
          package_type?: string | null
          package_weight?: number | null
          pickup_address: string
          pickup_city?: string | null
          pickup_contact_name?: string | null
          pickup_contact_phone?: string | null
          pickup_coordinates?: Json | null
          pickup_instructions?: string | null
          pickup_postal_code?: string | null
          pickup_state?: string | null
          pickup_window_end?: string | null
          pickup_window_start?: string | null
          pod_captured_at?: string | null
          pod_notes?: string | null
          pod_photo_urls?: Json | null
          pod_recipient_name?: string | null
          pod_signature_url?: string | null
          pod_type?: string | null
          priority?: number | null
          requires_signature?: boolean | null
          service_type?: Database["public"]["Enums"]["service_type"]
          status?: Database["public"]["Enums"]["order_status"]
          surcharges?: number | null
          total_amount?: number | null
          tracking_number: string
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          actual_delivery_time?: string | null
          actual_distance?: number | null
          actual_pickup_time?: string | null
          base_rate?: number | null
          cancellation_reason?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          customer_id?: string | null
          customer_reference?: string | null
          delivery_window_end?: string | null
          delivery_window_start?: string | null
          distance_charge?: number | null
          driver_id?: string | null
          dropoff_address?: string
          dropoff_city?: string | null
          dropoff_contact_name?: string | null
          dropoff_contact_phone?: string | null
          dropoff_coordinates?: Json | null
          dropoff_instructions?: string | null
          dropoff_postal_code?: string | null
          dropoff_state?: string | null
          estimated_delivery_time?: string | null
          estimated_distance?: number | null
          estimated_pickup_time?: string | null
          external_id?: string | null
          failure_reason?: string | null
          id?: string
          is_fragile?: boolean | null
          notes?: string | null
          package_count?: number | null
          package_dimensions?: Json | null
          package_type?: string | null
          package_weight?: number | null
          pickup_address?: string
          pickup_city?: string | null
          pickup_contact_name?: string | null
          pickup_contact_phone?: string | null
          pickup_coordinates?: Json | null
          pickup_instructions?: string | null
          pickup_postal_code?: string | null
          pickup_state?: string | null
          pickup_window_end?: string | null
          pickup_window_start?: string | null
          pod_captured_at?: string | null
          pod_notes?: string | null
          pod_photo_urls?: Json | null
          pod_recipient_name?: string | null
          pod_signature_url?: string | null
          pod_type?: string | null
          priority?: number | null
          requires_signature?: boolean | null
          service_type?: Database["public"]["Enums"]["service_type"]
          status?: Database["public"]["Enums"]["order_status"]
          surcharges?: number | null
          total_amount?: number | null
          tracking_number?: string
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      service_zones: {
        Row: {
          base_rate: number
          boundaries: Json | null
          created_at: string
          id: string
          is_active: boolean | null
          minimum_charge: number | null
          name: string
          operating_hours: Json | null
          per_mile_rate: number
          per_minute_wait_rate: number | null
          surge_multiplier: number | null
          updated_at: string
        }
        Insert: {
          base_rate: number
          boundaries?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          minimum_charge?: number | null
          name: string
          operating_hours?: Json | null
          per_mile_rate: number
          per_minute_wait_rate?: number | null
          surge_multiplier?: number | null
          updated_at?: string
        }
        Update: {
          base_rate?: number
          boundaries?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          minimum_charge?: number | null
          name?: string
          operating_hours?: Json | null
          per_mile_rate?: number
          per_minute_wait_rate?: number | null
          surge_multiplier?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          acquisition_cost: number | null
          acquisition_date: string | null
          acquisition_type: string | null
          asset_code: string | null
          capacity_volume: number | null
          capacity_weight: number | null
          color: string | null
          condition: string | null
          created_at: string
          current_location: Json | null
          fuel_card_number: string | null
          fuel_type: string | null
          id: string
          insurance_expiry: string | null
          insurance_policy_number: string | null
          insurance_provider: string | null
          last_location_update: string | null
          last_service_date: string | null
          lease_end_date: string | null
          license_plate: string
          make: string | null
          mileage: number | null
          model: string | null
          monthly_lease_cost: number | null
          name: string
          next_service_due: string | null
          notes: string | null
          purchase_vendor: string | null
          registration_expiry: string | null
          status: Database["public"]["Enums"]["vehicle_status"]
          telematics_device_id: string | null
          updated_at: string
          vehicle_type: string
          vin: string | null
          warranty_expiry: string | null
          year: number | null
        }
        Insert: {
          acquisition_cost?: number | null
          acquisition_date?: string | null
          acquisition_type?: string | null
          asset_code?: string | null
          capacity_volume?: number | null
          capacity_weight?: number | null
          color?: string | null
          condition?: string | null
          created_at?: string
          current_location?: Json | null
          fuel_card_number?: string | null
          fuel_type?: string | null
          id?: string
          insurance_expiry?: string | null
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          last_location_update?: string | null
          last_service_date?: string | null
          lease_end_date?: string | null
          license_plate: string
          make?: string | null
          mileage?: number | null
          model?: string | null
          monthly_lease_cost?: number | null
          name: string
          next_service_due?: string | null
          notes?: string | null
          purchase_vendor?: string | null
          registration_expiry?: string | null
          status?: Database["public"]["Enums"]["vehicle_status"]
          telematics_device_id?: string | null
          updated_at?: string
          vehicle_type?: string
          vin?: string | null
          warranty_expiry?: string | null
          year?: number | null
        }
        Update: {
          acquisition_cost?: number | null
          acquisition_date?: string | null
          acquisition_type?: string | null
          asset_code?: string | null
          capacity_volume?: number | null
          capacity_weight?: number | null
          color?: string | null
          condition?: string | null
          created_at?: string
          current_location?: Json | null
          fuel_card_number?: string | null
          fuel_type?: string | null
          id?: string
          insurance_expiry?: string | null
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          last_location_update?: string | null
          last_service_date?: string | null
          lease_end_date?: string | null
          license_plate?: string
          make?: string | null
          mileage?: number | null
          model?: string | null
          monthly_lease_cost?: number | null
          name?: string
          next_service_due?: string | null
          notes?: string | null
          purchase_vendor?: string | null
          registration_expiry?: string | null
          status?: Database["public"]["Enums"]["vehicle_status"]
          telematics_device_id?: string | null
          updated_at?: string
          vehicle_type?: string
          vin?: string | null
          warranty_expiry?: string | null
          year?: number | null
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          attempt_number: number | null
          created_at: string
          delivered_at: string | null
          event_type: string
          id: string
          payload: Json
          response_body: string | null
          response_status: number | null
          webhook_id: string
        }
        Insert: {
          attempt_number?: number | null
          created_at?: string
          delivered_at?: string | null
          event_type: string
          id?: string
          payload: Json
          response_body?: string | null
          response_status?: number | null
          webhook_id: string
        }
        Update: {
          attempt_number?: number | null
          created_at?: string
          delivered_at?: string | null
          event_type?: string
          id?: string
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          created_at: string
          customer_id: string | null
          events: string[]
          id: string
          is_active: boolean | null
          last_status_code: number | null
          last_triggered_at: string | null
          retry_count: number | null
          secret: string | null
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          events: string[]
          id?: string
          is_active?: boolean | null
          last_status_code?: number | null
          last_triggered_at?: string | null
          retry_count?: number | null
          secret?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          events?: string[]
          id?: string
          is_active?: boolean | null
          last_status_code?: number | null
          last_triggered_at?: string | null
          retry_count?: number | null
          secret?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_or_dispatcher: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "admin"
        | "dispatcher"
        | "fleet_manager"
        | "driver"
        | "customer"
      driver_status: "pending" | "active" | "suspended" | "inactive"
      order_status:
        | "pending"
        | "confirmed"
        | "dispatched"
        | "driver_accepted"
        | "en_route_pickup"
        | "arrived_pickup"
        | "picked_up"
        | "en_route_delivery"
        | "arrived_delivery"
        | "delivered"
        | "failed"
        | "cancelled"
        | "rescheduled"
      service_type: "express" | "same_day" | "standard" | "economy"
      vehicle_status: "active" | "idle" | "maintenance" | "offline"
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
    Enums: {
      app_role: [
        "super_admin",
        "admin",
        "dispatcher",
        "fleet_manager",
        "driver",
        "customer",
      ],
      driver_status: ["pending", "active", "suspended", "inactive"],
      order_status: [
        "pending",
        "confirmed",
        "dispatched",
        "driver_accepted",
        "en_route_pickup",
        "arrived_pickup",
        "picked_up",
        "en_route_delivery",
        "arrived_delivery",
        "delivered",
        "failed",
        "cancelled",
        "rescheduled",
      ],
      service_type: ["express", "same_day", "standard", "economy"],
      vehicle_status: ["active", "idle", "maintenance", "offline"],
    },
  },
} as const
