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
      jobs: {
        Row: {
          id: string
          client_name: string
          date: string
          type: 'ironing' | 'cleaning' | 'both'
          total: number
          status: 'completed' | 'pending' | 'invoiced'
          notes: string | null
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          client_name: string
          date: string
          type: 'ironing' | 'cleaning' | 'both'
          total?: number
          status?: 'completed' | 'pending' | 'invoiced'
          notes?: string | null
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          client_name?: string
          date?: string
          type?: 'ironing' | 'cleaning' | 'both'
          total?: number
          status?: 'completed' | 'pending' | 'invoiced'
          notes?: string | null
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      job_items: {
        Row: {
          id: string
          job_id: string
          description: string
          quantity: number
          price: number
          total: number
          created_at: string
        }
        Insert: {
          id?: string
          job_id: string
          description: string
          quantity: number
          price: number
          total?: number
          created_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          description?: string
          quantity?: number
          price?: number
          total?: number
          created_at?: string
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
      job_status: 'completed' | 'pending' | 'invoiced'
      job_type: 'ironing' | 'cleaning' | 'both'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}