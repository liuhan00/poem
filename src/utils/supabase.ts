import { createClient } from '@supabase/supabase-js'

// Supabase配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// 数据库表类型定义
export interface Database {
  public: {
    Tables: {
      poems: {
        Row: {
          id: string
          title: string
          author_id: string
          dynasty: string
          content: string
          rhythmic_pattern?: string
          annotation?: string
          translation?: string
          appreciation?: string
          background?: string
          tags: string[]
          difficulty_level: number
          popularity: number
          embedding?: number[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          author_id: string
          dynasty: string
          content: string
          rhythmic_pattern?: string
          annotation?: string
          translation?: string
          appreciation?: string
          background?: string
          tags?: string[]
          difficulty_level?: number
          popularity?: number
          embedding?: number[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          author_id?: string
          dynasty?: string
          content?: string
          rhythmic_pattern?: string
          annotation?: string
          translation?: string
          appreciation?: string
          background?: string
          tags?: string[]
          difficulty_level?: number
          popularity?: number
          embedding?: number[]
          created_at?: string
          updated_at?: string
        }
      }
      authors: {
        Row: {
          id: string
          name: string
          dynasty: string
          biography?: string
          literary_style?: string
          achievements?: string
          life_period?: string
          portrait_url?: string
          embedding?: number[]
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          dynasty: string
          biography?: string
          literary_style?: string
          achievements?: string
          life_period?: string
          portrait_url?: string
          embedding?: number[]
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          dynasty?: string
          biography?: string
          literary_style?: string
          achievements?: string
          life_period?: string
          portrait_url?: string
          embedding?: number[]
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          username: string
          email: string
          avatar_url?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          email: string
          avatar_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          avatar_url?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// 导出类型化的Supabase客户端
export type SupabaseClient = typeof supabase