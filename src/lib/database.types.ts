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
      teams: {
        Row: {
          id: string
          name: string
          description: string | null
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          owner_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          owner_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          role: 'owner' | 'admin' | 'editor' | 'viewer'
          joined_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'editor' | 'viewer'
          joined_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'editor' | 'viewer'
          joined_at?: string
        }
      }
      team_invitations: {
        Row: {
          id: string
          team_id: string
          email: string
          role: 'owner' | 'admin' | 'editor' | 'viewer'
          invited_by: string
          expires_at: string
          accepted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          email: string
          role?: 'owner' | 'admin' | 'editor' | 'viewer'
          invited_by: string
          expires_at?: string
          accepted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          email?: string
          role?: 'owner' | 'admin' | 'editor' | 'viewer'
          invited_by?: string
          expires_at?: string
          accepted_at?: string | null
          created_at?: string
        }
      }
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
          team_id: string | null
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
          team_id?: string | null
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
          team_id?: string | null
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
      team_role: 'owner' | 'admin' | 'editor' | 'viewer'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}