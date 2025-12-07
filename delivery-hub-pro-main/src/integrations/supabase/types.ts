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
      auction_bids: {
        Row: {
          auction_id: string | null
          bid_amount: number
          bid_time: string
          bidder_contact: string | null
          bidder_name: string
          bidder_ntn: string | null
          created_at: string
          id: string
          is_winning: boolean | null
        }
        Insert: {
          auction_id?: string | null
          bid_amount: number
          bid_time?: string
          bidder_contact?: string | null
          bidder_name: string
          bidder_ntn?: string | null
          created_at?: string
          id?: string
          is_winning?: boolean | null
        }
        Update: {
          auction_id?: string | null
          bid_amount?: number
          bid_time?: string
          bidder_contact?: string | null
          bidder_name?: string
          bidder_ntn?: string | null
          created_at?: string
          id?: string
          is_winning?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "auction_bids_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
        ]
      }
      auctions: {
        Row: {
          auction_number: string
          auction_type: Database["public"]["Enums"]["auction_type"]
          auctioneer_license: string | null
          auctioneer_name: string | null
          consignment_id: string | null
          created_at: string
          created_by: string | null
          current_bid: number | null
          ended_at: string | null
          id: string
          notes: string | null
          reserve_price: number
          scheduled_date: string
          started_at: string | null
          starting_bid: number | null
          status: Database["public"]["Enums"]["auction_status"]
          updated_at: string
          winner_contact: string | null
          winner_name: string | null
          winner_ntn: string | null
          winning_bid: number | null
        }
        Insert: {
          auction_number: string
          auction_type: Database["public"]["Enums"]["auction_type"]
          auctioneer_license?: string | null
          auctioneer_name?: string | null
          consignment_id?: string | null
          created_at?: string
          created_by?: string | null
          current_bid?: number | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          reserve_price: number
          scheduled_date: string
          started_at?: string | null
          starting_bid?: number | null
          status?: Database["public"]["Enums"]["auction_status"]
          updated_at?: string
          winner_contact?: string | null
          winner_name?: string | null
          winner_ntn?: string | null
          winning_bid?: number | null
        }
        Update: {
          auction_number?: string
          auction_type?: Database["public"]["Enums"]["auction_type"]
          auctioneer_license?: string | null
          auctioneer_name?: string | null
          consignment_id?: string | null
          created_at?: string
          created_by?: string | null
          current_bid?: number | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          reserve_price?: number
          scheduled_date?: string
          started_at?: string | null
          starting_bid?: number | null
          status?: Database["public"]["Enums"]["auction_status"]
          updated_at?: string
          winner_contact?: string | null
          winner_name?: string | null
          winner_ntn?: string | null
          winning_bid?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "auctions_consignment_id_fkey"
            columns: ["consignment_id"]
            isOneToOne: false
            referencedRelation: "consignments"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_alerts: {
        Row: {
          alert_type: string
          created_at: string
          due_date: string | null
          entity_id: string
          entity_type: string
          id: string
          is_resolved: boolean | null
          message: string
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          title: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          due_date?: string | null
          entity_id: string
          entity_type: string
          id?: string
          is_resolved?: boolean | null
          message: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          title: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          due_date?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          is_resolved?: boolean | null
          message?: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          title?: string
        }
        Relationships: []
      }
      consignments: {
        Row: {
          additional_duty_amount: number | null
          arrival_date: string | null
          bank_guarantee_amount: number | null
          bond_expiry_date: string | null
          bond_start_date: string | null
          carnet_number: string | null
          cleared_at: string | null
          cleared_by: string | null
          consignment_type: Database["public"]["Enums"]["consignment_type"]
          country_of_origin: string | null
          created_at: string
          created_by: string | null
          currency: string | null
          customs_duty_amount: number | null
          customs_duty_rate: number | null
          declared_value: number
          goods_description: string
          hs_code_id: string | null
          id: string
          import_license_number: string | null
          importer_exporter_name: string
          importer_exporter_ntn: string | null
          is_life_saving_drug: boolean | null
          is_perishable: boolean | null
          notes: string | null
          port_of_destination: string | null
          port_of_origin: string | null
          quantity: number
          quantity_unit: string | null
          regulatory_duty_amount: number | null
          requires_urgent_release: boolean | null
          sales_tax_amount: number | null
          sales_tax_rate: number | null
          status: Database["public"]["Enums"]["consignment_status"]
          total_duty_amount: number | null
          tracking_number: string
          updated_at: string
          vehicle_registration: string | null
          vessel_flight_number: string | null
          warehouse_id: string | null
        }
        Insert: {
          additional_duty_amount?: number | null
          arrival_date?: string | null
          bank_guarantee_amount?: number | null
          bond_expiry_date?: string | null
          bond_start_date?: string | null
          carnet_number?: string | null
          cleared_at?: string | null
          cleared_by?: string | null
          consignment_type: Database["public"]["Enums"]["consignment_type"]
          country_of_origin?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          customs_duty_amount?: number | null
          customs_duty_rate?: number | null
          declared_value: number
          goods_description: string
          hs_code_id?: string | null
          id?: string
          import_license_number?: string | null
          importer_exporter_name: string
          importer_exporter_ntn?: string | null
          is_life_saving_drug?: boolean | null
          is_perishable?: boolean | null
          notes?: string | null
          port_of_destination?: string | null
          port_of_origin?: string | null
          quantity: number
          quantity_unit?: string | null
          regulatory_duty_amount?: number | null
          requires_urgent_release?: boolean | null
          sales_tax_amount?: number | null
          sales_tax_rate?: number | null
          status?: Database["public"]["Enums"]["consignment_status"]
          total_duty_amount?: number | null
          tracking_number: string
          updated_at?: string
          vehicle_registration?: string | null
          vessel_flight_number?: string | null
          warehouse_id?: string | null
        }
        Update: {
          additional_duty_amount?: number | null
          arrival_date?: string | null
          bank_guarantee_amount?: number | null
          bond_expiry_date?: string | null
          bond_start_date?: string | null
          carnet_number?: string | null
          cleared_at?: string | null
          cleared_by?: string | null
          consignment_type?: Database["public"]["Enums"]["consignment_type"]
          country_of_origin?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          customs_duty_amount?: number | null
          customs_duty_rate?: number | null
          declared_value?: number
          goods_description?: string
          hs_code_id?: string | null
          id?: string
          import_license_number?: string | null
          importer_exporter_name?: string
          importer_exporter_ntn?: string | null
          is_life_saving_drug?: boolean | null
          is_perishable?: boolean | null
          notes?: string | null
          port_of_destination?: string | null
          port_of_origin?: string | null
          quantity?: number
          quantity_unit?: string | null
          regulatory_duty_amount?: number | null
          requires_urgent_release?: boolean | null
          sales_tax_amount?: number | null
          sales_tax_rate?: number | null
          status?: Database["public"]["Enums"]["consignment_status"]
          total_duty_amount?: number | null
          tracking_number?: string
          updated_at?: string
          vehicle_registration?: string | null
          vessel_flight_number?: string | null
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consignments_hs_code_id_fkey"
            columns: ["hs_code_id"]
            isOneToOne: false
            referencedRelation: "hs_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consignments_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
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
      invoices: {
        Row: {
          id: string
          customer_id: string
          invoice_number: string
          issue_date: string
          due_date: string
          status: string
          subtotal: number
          tax_rate: number | null
          tax_amount: number | null
          discount_amount: number | null
          total_amount: number
          notes: string | null
          items: Json | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          customer_id: string
          invoice_number: string
          issue_date?: string
          due_date: string
          status?: string
          subtotal?: number
          tax_rate?: number | null
          tax_amount?: number | null
          discount_amount?: number | null
          total_amount?: number
          notes?: string | null
          items?: Json | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          customer_id?: string
          invoice_number?: string
          issue_date?: string
          due_date?: string
          status?: string
          subtotal?: number
          tax_rate?: number | null
          tax_amount?: number | null
          discount_amount?: number | null
          total_amount?: number
          notes?: string | null
          items?: Json | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customs_documents: {
        Row: {
          consignment_id: string | null
          created_at: string
          document_number: string
          document_type: Database["public"]["Enums"]["document_type"]
          expiry_date: string | null
          file_url: string | null
          id: string
          is_verified: boolean | null
          issue_date: string | null
          notes: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          consignment_id?: string | null
          created_at?: string
          document_number: string
          document_type: Database["public"]["Enums"]["document_type"]
          expiry_date?: string | null
          file_url?: string | null
          id?: string
          is_verified?: boolean | null
          issue_date?: string | null
          notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          consignment_id?: string | null
          created_at?: string
          document_number?: string
          document_type?: Database["public"]["Enums"]["document_type"]
          expiry_date?: string | null
          file_url?: string | null
          id?: string
          is_verified?: boolean | null
          issue_date?: string | null
          notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customs_documents_consignment_id_fkey"
            columns: ["consignment_id"]
            isOneToOne: false
            referencedRelation: "consignments"
            referencedColumns: ["id"]
          },
        ]
      }
      dispatch_batch_orders: {
        Row: {
          created_at: string
          dispatch_batch_id: string
          id: string
          order_id: string
          sequence_number: number | null
        }
        Insert: {
          created_at?: string
          dispatch_batch_id: string
          id?: string
          order_id: string
          sequence_number?: number | null
        }
        Update: {
          created_at?: string
          dispatch_batch_id?: string
          id?: string
          order_id?: string
          sequence_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dispatch_batch_orders_dispatch_batch_id_fkey"
            columns: ["dispatch_batch_id"]
            isOneToOne: false
            referencedRelation: "dispatch_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispatch_batch_orders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      dispatch_batches: {
        Row: {
          batch_number: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          dispatched_at: string | null
          driver_id: string | null
          id: string
          notes: string | null
          priority: string | null
          status: string
          total_orders: number | null
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          batch_number: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          dispatched_at?: string | null
          driver_id?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          status?: string
          total_orders?: number | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          batch_number?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          dispatched_at?: string | null
          driver_id?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          status?: string
          total_orders?: number | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dispatch_batches_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispatch_batches_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
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
      fuel_records: {
        Row: {
          anomaly_flag: boolean | null
          anomaly_reason: string | null
          created_at: string
          driver_id: string | null
          fuel_card_used: boolean | null
          fuel_type: string
          fueled_at: string
          full_tank: boolean | null
          id: string
          miles_driven: number | null
          mpg: number | null
          notes: string | null
          odometer_reading: number
          previous_odometer: number | null
          price_per_gallon: number
          quantity_gallons: number
          receipt_url: string | null
          station_location: string | null
          station_name: string | null
          total_cost: number | null
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          anomaly_flag?: boolean | null
          anomaly_reason?: string | null
          created_at?: string
          driver_id?: string | null
          fuel_card_used?: boolean | null
          fuel_type?: string
          fueled_at?: string
          full_tank?: boolean | null
          id?: string
          miles_driven?: number | null
          mpg?: number | null
          notes?: string | null
          odometer_reading: number
          previous_odometer?: number | null
          price_per_gallon: number
          quantity_gallons: number
          receipt_url?: string | null
          station_location?: string | null
          station_name?: string | null
          total_cost?: number | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          anomaly_flag?: boolean | null
          anomaly_reason?: string | null
          created_at?: string
          driver_id?: string | null
          fuel_card_used?: boolean | null
          fuel_type?: string
          fueled_at?: string
          full_tank?: boolean | null
          id?: string
          miles_driven?: number | null
          mpg?: number | null
          notes?: string | null
          odometer_reading?: number
          previous_odometer?: number | null
          price_per_gallon?: number
          quantity_gallons?: number
          receipt_url?: string | null
          station_location?: string | null
          station_name?: string | null
          total_cost?: number | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fuel_records_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fuel_records_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      hs_codes: {
        Row: {
          additional_duty_rate: number | null
          chapter: string
          code: string
          created_at: string
          description: string
          duty_rate: number
          id: string
          is_restricted: boolean | null
          notes: string | null
          regulatory_duty_rate: number | null
          requires_license: boolean | null
          sales_tax_rate: number
          updated_at: string
        }
        Insert: {
          additional_duty_rate?: number | null
          chapter: string
          code: string
          created_at?: string
          description: string
          duty_rate?: number
          id?: string
          is_restricted?: boolean | null
          notes?: string | null
          regulatory_duty_rate?: number | null
          requires_license?: boolean | null
          sales_tax_rate?: number
          updated_at?: string
        }
        Update: {
          additional_duty_rate?: number | null
          chapter?: string
          code?: string
          created_at?: string
          description?: string
          duty_rate?: number
          id?: string
          is_restricted?: boolean | null
          notes?: string | null
          regulatory_duty_rate?: number | null
          requires_license?: boolean | null
          sales_tax_rate?: number
          updated_at?: string
        }
        Relationships: []
      }
      maintenance_records: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          id: string
          labor_cost: number | null
          maintenance_type: string
          notes: string | null
          odometer_at_service: number | null
          parts_cost: number | null
          parts_used: Json | null
          priority: string
          reported_by_driver_id: string | null
          scheduled_date: string | null
          started_at: string | null
          status: string
          technician_name: string | null
          title: string
          total_cost: number | null
          triggered_by: string | null
          updated_at: string
          vehicle_id: string | null
          vendor_name: string | null
          work_performed: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          labor_cost?: number | null
          maintenance_type: string
          notes?: string | null
          odometer_at_service?: number | null
          parts_cost?: number | null
          parts_used?: Json | null
          priority?: string
          reported_by_driver_id?: string | null
          scheduled_date?: string | null
          started_at?: string | null
          status?: string
          technician_name?: string | null
          title: string
          total_cost?: number | null
          triggered_by?: string | null
          updated_at?: string
          vehicle_id?: string | null
          vendor_name?: string | null
          work_performed?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          labor_cost?: number | null
          maintenance_type?: string
          notes?: string | null
          odometer_at_service?: number | null
          parts_cost?: number | null
          parts_used?: Json | null
          priority?: string
          reported_by_driver_id?: string | null
          scheduled_date?: string | null
          started_at?: string | null
          status?: string
          technician_name?: string | null
          title?: string
          total_cost?: number | null
          triggered_by?: string | null
          updated_at?: string
          vehicle_id?: string | null
          vendor_name?: string | null
          work_performed?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_records_reported_by_driver_id_fkey"
            columns: ["reported_by_driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_records_vehicle_id_fkey"
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
          dispatch_batch_id: string | null
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
          route_id: string | null
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
          dispatch_batch_id?: string | null
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
          route_id?: string | null
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
          dispatch_batch_id?: string | null
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
          route_id?: string | null
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
            foreignKeyName: "orders_dispatch_batch_id_fkey"
            columns: ["dispatch_batch_id"]
            isOneToOne: false
            referencedRelation: "dispatch_batches"
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
            foreignKeyName: "orders_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
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
      route_stops: {
        Row: {
          actual_arrival: string | null
          actual_departure: string | null
          created_at: string
          estimated_arrival: string | null
          estimated_departure: string | null
          id: string
          notes: string | null
          order_id: string
          route_id: string
          status: string
          stop_number: number
          stop_type: string | null
          updated_at: string
          wait_time_minutes: number | null
        }
        Insert: {
          actual_arrival?: string | null
          actual_departure?: string | null
          created_at?: string
          estimated_arrival?: string | null
          estimated_departure?: string | null
          id?: string
          notes?: string | null
          order_id: string
          route_id: string
          status?: string
          stop_number: number
          stop_type?: string | null
          updated_at?: string
          wait_time_minutes?: number | null
        }
        Update: {
          actual_arrival?: string | null
          actual_departure?: string | null
          created_at?: string
          estimated_arrival?: string | null
          estimated_departure?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          route_id?: string
          status?: string
          stop_number?: number
          stop_type?: string | null
          updated_at?: string
          wait_time_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "route_stops_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_stops_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          completed_stops: number | null
          created_at: string
          created_by: string | null
          driver_id: string | null
          id: string
          notes: string | null
          optimization_score: number | null
          planned_end: string | null
          planned_start: string | null
          route_number: string
          status: string
          total_distance: number | null
          total_stops: number | null
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          completed_stops?: number | null
          created_at?: string
          created_by?: string | null
          driver_id?: string | null
          id?: string
          notes?: string | null
          optimization_score?: number | null
          planned_end?: string | null
          planned_start?: string | null
          route_number: string
          status?: string
          total_distance?: number | null
          total_stops?: number | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          completed_stops?: number | null
          created_at?: string
          created_by?: string | null
          driver_id?: string | null
          id?: string
          notes?: string | null
          optimization_score?: number | null
          planned_end?: string | null
          planned_start?: string | null
          route_number?: string
          status?: string
          total_distance?: number | null
          total_stops?: number | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "routes_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
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
      warehouses: {
        Row: {
          address: string
          bank_guarantee_amount: number | null
          bank_guarantee_expiry: string | null
          capacity_sqft: number | null
          capacity_weight_kg: number | null
          city: string
          code: string
          created_at: string
          fire_safety_certificate: string | null
          fire_safety_expiry: string | null
          id: string
          is_active: boolean | null
          license_expiry_date: string | null
          license_issue_date: string | null
          license_number: string | null
          license_status: Database["public"]["Enums"]["warehouse_license_status"]
          name: string
          notes: string | null
          operator_profile_id: string | null
          owner_contact: string | null
          owner_name: string | null
          postal_code: string | null
          site_plan_url: string | null
          updated_at: string
          warehouse_type: Database["public"]["Enums"]["warehouse_type"]
        }
        Insert: {
          address: string
          bank_guarantee_amount?: number | null
          bank_guarantee_expiry?: string | null
          capacity_sqft?: number | null
          capacity_weight_kg?: number | null
          city: string
          code: string
          created_at?: string
          fire_safety_certificate?: string | null
          fire_safety_expiry?: string | null
          id?: string
          is_active?: boolean | null
          license_expiry_date?: string | null
          license_issue_date?: string | null
          license_number?: string | null
          license_status?: Database["public"]["Enums"]["warehouse_license_status"]
          name: string
          notes?: string | null
          operator_profile_id?: string | null
          owner_contact?: string | null
          owner_name?: string | null
          postal_code?: string | null
          site_plan_url?: string | null
          updated_at?: string
          warehouse_type: Database["public"]["Enums"]["warehouse_type"]
        }
        Update: {
          address?: string
          bank_guarantee_amount?: number | null
          bank_guarantee_expiry?: string | null
          capacity_sqft?: number | null
          capacity_weight_kg?: number | null
          city?: string
          code?: string
          created_at?: string
          fire_safety_certificate?: string | null
          fire_safety_expiry?: string | null
          id?: string
          is_active?: boolean | null
          license_expiry_date?: string | null
          license_issue_date?: string | null
          license_number?: string | null
          license_status?: Database["public"]["Enums"]["warehouse_license_status"]
          name?: string
          notes?: string | null
          operator_profile_id?: string | null
          owner_contact?: string | null
          owner_name?: string | null
          postal_code?: string | null
          site_plan_url?: string | null
          updated_at?: string
          warehouse_type?: Database["public"]["Enums"]["warehouse_type"]
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
      carriers: {
        Row: {
          id: string
          name: string
          type: string
          registration_number: string | null
          contact_person: string | null
          phone: string | null
          email: string | null
          address: string | null
          license_number: string | null
          insurance_expiry: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          registration_number?: string | null
          contact_person?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          license_number?: string | null
          insurance_expiry?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          registration_number?: string | null
          contact_person?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          license_number?: string | null
          insurance_expiry?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      routes: {
        Row: {
          id: string
          name: string
          origin_country: string
          origin_city: string
          destination_country: string
          destination_city: string
          transport_mode: string
          distance_km: number | null
          estimated_duration_hours: number | null
          border_crossings: Json | null
          is_active: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          origin_country: string
          origin_city: string
          destination_country: string
          destination_city: string
          transport_mode: string
          distance_km?: number | null
          estimated_duration_hours?: number | null
          border_crossings?: Json | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          origin_country?: string
          origin_city?: string
          destination_country?: string
          destination_city?: string
          transport_mode?: string
          distance_km?: number | null
          estimated_duration_hours?: number | null
          border_crossings?: Json | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      carrier_routes: {
        Row: {
          id: string
          carrier_id: string
          route_id: string
          base_rate: number | null
          currency: string | null
          effective_from: string
          effective_to: string | null
          is_active: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          carrier_id: string
          route_id: string
          base_rate?: number | null
          currency?: string | null
          effective_from: string
          effective_to?: string | null
          is_active?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          carrier_id?: string
          route_id?: string
          base_rate?: number | null
          currency?: string | null
          effective_from?: string
          effective_to?: string | null
          is_active?: boolean | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "carrier_routes_carrier_id_fkey"
            columns: ["carrier_id"]
            isOneToOne: false
            referencedRelation: "carriers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carrier_routes_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          id: string
          shipment_number: string
          customer_id: string | null
          origin_address: string
          origin_city: string
          origin_country: string
          destination_address: string
          destination_city: string
          destination_country: string
          transport_mode: string
          service_type: string
          cargo_description: string | null
          cargo_type: string | null
          weight_kg: number | null
          volume_cbm: number | null
          package_count: number | null
          declared_value: number | null
          currency: string | null
          insurance_required: boolean | null
          insurance_value: number | null
          status: string
          priority: string | null
          special_instructions: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          shipment_number: string
          customer_id?: string | null
          origin_address: string
          origin_city: string
          origin_country: string
          destination_address: string
          destination_city: string
          destination_country: string
          transport_mode: string
          service_type: string
          cargo_description?: string | null
          cargo_type?: string | null
          weight_kg?: number | null
          volume_cbm?: number | null
          package_count?: number | null
          declared_value?: number | null
          currency?: string | null
          insurance_required?: boolean | null
          insurance_value?: number | null
          status?: string
          priority?: string | null
          special_instructions?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          shipment_number?: string
          customer_id?: string | null
          origin_address?: string
          origin_city?: string
          origin_country?: string
          destination_address?: string
          destination_city?: string
          destination_country?: string
          transport_mode?: string
          service_type?: string
          cargo_description?: string | null
          cargo_type?: string | null
          weight_kg?: number | null
          volume_cbm?: number | null
          package_count?: number | null
          declared_value?: number | null
          currency?: string | null
          insurance_required?: boolean | null
          insurance_value?: number | null
          status?: string
          priority?: string | null
          special_instructions?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      shipment_legs: {
        Row: {
          id: string
          shipment_id: string
          leg_number: number
          transport_mode: string
          carrier_id: string | null
          route_id: string | null
          origin_location: string
          destination_location: string
          planned_departure: string | null
          actual_departure: string | null
          planned_arrival: string | null
          actual_arrival: string | null
          vehicle_number: string | null
          driver_name: string | null
          driver_phone: string | null
          tracking_number: string | null
          status: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          shipment_id: string
          leg_number: number
          transport_mode: string
          carrier_id?: string | null
          route_id?: string | null
          origin_location: string
          destination_location: string
          planned_departure?: string | null
          actual_departure?: string | null
          planned_arrival?: string | null
          actual_arrival?: string | null
          vehicle_number?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          tracking_number?: string | null
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          shipment_id?: string
          leg_number?: number
          transport_mode?: string
          carrier_id?: string | null
          route_id?: string | null
          origin_location?: string
          destination_location?: string
          planned_departure?: string | null
          actual_departure?: string | null
          planned_arrival?: string | null
          actual_arrival?: string | null
          vehicle_number?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          tracking_number?: string | null
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipment_legs_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipment_legs_carrier_id_fkey"
            columns: ["carrier_id"]
            isOneToOne: false
            referencedRelation: "carriers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipment_legs_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      transit_bonds: {
        Row: {
          id: string
          bond_number: string
          shipment_id: string | null
          bond_type: string | null
          issuing_authority: string | null
          bond_amount: number
          currency: string | null
          validity_start: string
          validity_end: string
          guarantee_type: string | null
          guarantor_name: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          bond_number: string
          shipment_id?: string | null
          bond_type?: string | null
          issuing_authority?: string | null
          bond_amount: number
          currency?: string | null
          validity_start: string
          validity_end: string
          guarantee_type?: string | null
          guarantor_name?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          bond_number?: string
          shipment_id?: string | null
          bond_type?: string | null
          issuing_authority?: string | null
          bond_amount?: number
          currency?: string | null
          validity_start?: string
          validity_end?: string
          guarantee_type?: string | null
          guarantor_name?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transit_bonds_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          id: string
          entity_type: string
          entity_id: string
          document_type: string
          document_number: string | null
          file_name: string
          file_url: string | null
          file_size_bytes: number | null
          mime_type: string | null
          uploaded_by: string | null
          expiry_date: string | null
          is_verified: boolean | null
          verified_by: string | null
          verified_at: string | null
          ocr_data: Json | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          entity_type: string
          entity_id: string
          document_type: string
          document_number?: string | null
          file_name: string
          file_url?: string | null
          file_size_bytes?: number | null
          mime_type?: string | null
          uploaded_by?: string | null
          expiry_date?: string | null
          is_verified?: boolean | null
          verified_by?: string | null
          verified_at?: string | null
          ocr_data?: Json | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          entity_type?: string
          entity_id?: string
          document_type?: string
          document_number?: string | null
          file_name?: string
          file_url?: string | null
          file_size_bytes?: number | null
          mime_type?: string | null
          uploaded_by?: string | null
          expiry_date?: string | null
          is_verified?: boolean | null
          verified_by?: string | null
          verified_at?: string | null
          ocr_data?: Json | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
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
      auction_status: "scheduled" | "active" | "completed" | "cancelled"
      auction_type: "public" | "private"
      consignment_status:
        | "pending"
        | "cleared"
        | "held"
        | "released"
        | "bonded"
        | "auctioned"
      consignment_type: "import" | "export" | "transit" | "temporary_import"
      document_type:
        | "igm"
        | "egm"
        | "bill_of_lading"
        | "commercial_invoice"
        | "packing_list"
        | "certificate_of_origin"
        | "customs_declaration"
        | "carnet_de_passage"
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
      warehouse_license_status:
        | "active"
        | "pending"
        | "suspended"
        | "expired"
        | "cancelled"
      warehouse_type: "private_bonded" | "public_bonded" | "manufacturing_bond"
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
      auction_status: ["scheduled", "active", "completed", "cancelled"],
      auction_type: ["public", "private"],
      consignment_status: [
        "pending",
        "cleared",
        "held",
        "released",
        "bonded",
        "auctioned",
      ],
      consignment_type: ["import", "export", "transit", "temporary_import"],
      document_type: [
        "igm",
        "egm",
        "bill_of_lading",
        "commercial_invoice",
        "packing_list",
        "certificate_of_origin",
        "customs_declaration",
        "carnet_de_passage",
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
      warehouse_license_status: [
        "active",
        "pending",
        "suspended",
        "expired",
        "cancelled",
      ],
      warehouse_type: ["private_bonded", "public_bonded", "manufacturing_bond"],
    },
  },
} as const
