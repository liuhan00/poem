// 诗词相关类型定义
export interface Poem {
  id: number
  title: string
  author: string
  dynasty: string
  content: string
  tags?: string[]
  difficulty?: number
  popularity?: number
  annotation?: string
  translation?: string
  appreciation?: string
  background?: string
  embedding?: number[]
  created_at?: string
  updated_at?: string
}

// 作者相关类型
export interface Author {
  id: number
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

// 用户相关类型
export interface User {
  id: string
  username: string
  email: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

// 用户活动类型
export interface UserActivity {
  id: string
  user_id: string
  activity_type: 'read' | 'search' | 'share' | 'collect'
  target_type: 'poem' | 'author'
  target_id: number
  duration?: number
  engagement_score?: number
  created_at: string
}

// AI消息类型
export interface ChatMessage {
  id: number
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

// 知识图谱关系类型
export interface KnowledgeRelation {
  id: string
  source_type: string
  source_id: number
  target_type: string
  target_id: number
  relationship_type: string
  weight: number
  created_at: string
}

// API响应类型
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  error?: string
}

// 搜索结果类型
export interface SearchResult {
  poems: Poem[]
  authors: Author[]
  total: number
  page: number
  limit: number
}