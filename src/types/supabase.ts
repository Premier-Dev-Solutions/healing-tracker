// TypeScript types for Supabase schema
// Generated to match the Heal From It database schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      herbs: {
        Row: {
          id: string
          user_id: string
          name: string
          supplier: string | null
          ingredients: string | null
          serving: string | null
          daily_amount: string | null
          benefits: string
          category: string
          secondary_category: string | null
          supplement_type: string
          description: string | null
          preparation_instructions: string | null
          stock_level: string | null
          notes: string | null
          created_at: string
          updated_at: string
          synced_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          supplier?: string | null
          ingredients?: string | null
          serving?: string | null
          daily_amount?: string | null
          benefits: string
          category: string
          secondary_category?: string | null
          supplement_type: string
          description?: string | null
          preparation_instructions?: string | null
          stock_level?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          synced_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          supplier?: string | null
          ingredients?: string | null
          serving?: string | null
          daily_amount?: string | null
          benefits?: string
          category?: string
          secondary_category?: string | null
          supplement_type?: string
          description?: string | null
          preparation_instructions?: string | null
          stock_level?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          synced_at?: string | null
        }
      }
      foods: {
        Row: {
          id: string
          user_id: string
          name: string
          supplier: string | null
          category: string | null
          lysine: number
          arginine: number
          serving_size: string | null
          benefits: string | null
          notes: string | null
          created_at: string
          updated_at: string
          synced_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          supplier?: string | null
          category?: string | null
          lysine: number
          arginine: number
          serving_size?: string | null
          benefits?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          synced_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          supplier?: string | null
          category?: string | null
          lysine?: number
          arginine?: number
          serving_size?: string | null
          benefits?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          synced_at?: string | null
        }
      }
      suppliers: {
        Row: {
          id: string
          user_id: string
          name: string
          contact_person: string | null
          email: string | null
          phone: string | null
          website: string | null
          address: string | null
          is_active: boolean
          notes: string | null
          created_at: string
          updated_at: string
          synced_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          contact_person?: string | null
          email?: string | null
          phone?: string | null
          website?: string | null
          address?: string | null
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
          synced_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          contact_person?: string | null
          email?: string | null
          phone?: string | null
          website?: string | null
          address?: string | null
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
          synced_at?: string | null
        }
      }
      daily_routines: {
        Row: {
          id: string
          user_id: string
          date: string
          fasting: boolean
          fasting_hours: number | null
          pills: Json
          herbs: Json
          foods: Json
          notes: string | null
          created_at: string
          updated_at: string
          synced_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          fasting?: boolean
          fasting_hours?: number | null
          pills?: Json
          herbs?: Json
          foods?: Json
          notes?: string | null
          created_at?: string
          updated_at?: string
          synced_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          fasting?: boolean
          fasting_hours?: number | null
          pills?: Json
          herbs?: Json
          foods?: Json
          notes?: string | null
          created_at?: string
          updated_at?: string
          synced_at?: string | null
        }
      }
      journal_entries: {
        Row: {
          id: string
          user_id: string
          date: string
          sleep_hours: number
          sleep_quality: number
          workout: boolean
          workout_type: string | null
          workout_duration: number | null
          stress_level: number
          notes: string | null
          created_at: string
          updated_at: string
          synced_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          sleep_hours: number
          sleep_quality: number
          workout?: boolean
          workout_type?: string | null
          workout_duration?: number | null
          stress_level: number
          notes?: string | null
          created_at?: string
          updated_at?: string
          synced_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          sleep_hours?: number
          sleep_quality?: number
          workout?: boolean
          workout_type?: string | null
          workout_duration?: number | null
          stress_level?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
          synced_at?: string | null
        }
      }
      outbreaks: {
        Row: {
          id: string
          user_id: string
          date: string
          severity: number
          duration_days: number | null
          is_ongoing: boolean
          symptoms: string | null
          triggers: string | null
          notes: string | null
          created_at: string
          updated_at: string
          synced_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          severity: number
          duration_days?: number | null
          is_ongoing?: boolean
          symptoms?: string | null
          triggers?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          synced_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          severity?: number
          duration_days?: number | null
          is_ongoing?: boolean
          symptoms?: string | null
          triggers?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          synced_at?: string | null
        }
      }
      testing_reminders: {
        Row: {
          id: string
          user_id: string
          test_type: string
          frequency_days: number
          last_completed: string | null
          next_due: string
          notes: string | null
          created_at: string
          updated_at: string
          synced_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          test_type: string
          frequency_days: number
          last_completed?: string | null
          next_due: string
          notes?: string | null
          created_at?: string
          updated_at?: string
          synced_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          test_type?: string
          frequency_days?: number
          last_completed?: string | null
          next_due?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
          synced_at?: string | null
        }
      }
      purchase_history: {
        Row: {
          id: string
          user_id: string
          item_id: string
          item_type: string
          supplier: string | null
          cost: number | null
          quantity: string
          quantity_unit: string | null
          purchase_date: string
          notes: string | null
          created_at: string
          synced_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          item_id: string
          item_type: string
          supplier?: string | null
          cost?: number | null
          quantity: string
          quantity_unit?: string | null
          purchase_date: string
          notes?: string | null
          created_at?: string
          synced_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          item_id?: string
          item_type?: string
          supplier?: string | null
          cost?: number | null
          quantity?: string
          quantity_unit?: string | null
          purchase_date?: string
          notes?: string | null
          created_at?: string
          synced_at?: string | null
        }
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
  }
}
