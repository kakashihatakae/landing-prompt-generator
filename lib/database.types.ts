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
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          status: 'draft' | 'ready'
          global_prompt: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name?: string
          status?: 'draft' | 'ready'
          global_prompt?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          status?: 'draft' | 'ready'
          global_prompt?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      sections: {
        Row: {
          id: string
          project_id: string
          name: string
          type: 'hero' | 'features' | 'testimonials' | 'pricing' | 'cta' | 'footer' | 'custom'
          description: string
          image_url: string | null
          image_description: string | null
          style_notes: string | null
          animation_notes: string | null
          order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          type: 'hero' | 'features' | 'testimonials' | 'pricing' | 'cta' | 'footer' | 'custom'
          description?: string
          image_url?: string | null
          image_description?: string | null
          style_notes?: string | null
          animation_notes?: string | null
          order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          type?: 'hero' | 'features' | 'testimonials' | 'pricing' | 'cta' | 'footer' | 'custom'
          description?: string
          image_url?: string | null
          image_description?: string | null
          style_notes?: string | null
          animation_notes?: string | null
          order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
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

export type Project = Database['public']['Tables']['projects']['Row']
export type Section = Database['public']['Tables']['sections']['Row']
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type SectionInsert = Database['public']['Tables']['sections']['Insert']
export type ProjectUpdate = Database['public']['Tables']['projects']['Update']
export type SectionUpdate = Database['public']['Tables']['sections']['Update']
