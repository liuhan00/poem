// API工具函数
import { supabase } from './supabase'
import type { Poem, SearchResult, AIResponse, Favorite, ApiResponse } from '../types/poem'

const API_BASE_URL = import.meta.env.VITE_SUPABASE_URL?.replace('/rest/v1', '') || ''

// 通用API请求函数
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const token = (await supabase.auth.getSession()).data.session?.access_token
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API请求失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }
  }
}

// 诗词搜索API
export async function searchPoems(params: {
  query?: string
  dynasty?: string
  author?: string
  tags?: string[]
  page?: number
  limit?: number
}): Promise<ApiResponse<SearchResult>> {
  return apiRequest<SearchResult>('/poem-search', {
    method: 'POST',
    body: JSON.stringify(params)
  })
}

// AI对话API
export async function sendAIMessage(params: {
  message: string
  session_id?: string
}): Promise<ApiResponse<AIResponse>> {
  return apiRequest<AIResponse>('/ai-conversation', {
    method: 'POST',
    body: JSON.stringify(params)
  })
}

// 获取诗词推荐
export async function getPoemRecommendations(params: {
  limit?: number
  based_on?: 'popular' | 'user_preferences'
}): Promise<ApiResponse<Poem[]>> {
  return apiRequest<Poem[]>('/poem-recommendations', {
    method: 'POST',
    body: JSON.stringify(params)
  })
}

// 获取用户收藏
export async function getUserFavorites(params: {
  page?: number
  limit?: number
}): Promise<ApiResponse<{ data: Favorite[]; pagination: any }>> {
  return apiRequest<{ data: Favorite[]; pagination: any }>('/user-favorites', {
    method: 'POST',
    body: JSON.stringify(params)
  })
}

// 添加收藏
export async function addFavorite(poem_id: string): Promise<ApiResponse<Favorite>> {
  return apiRequest<Favorite>('/user-favorites', {
    method: 'POST',
    body: JSON.stringify({ poem_id })
  })
}

// 删除收藏
export async function removeFavorite(favorite_id: string): Promise<ApiResponse<void>> {
  return apiRequest<void>('/user-favorites', {
    method: 'POST',
    body: JSON.stringify({ favorite_id, action: 'delete' })
  })
}

// 记录用户行为
export async function recordUserActivity(params: {
  activity_type: 'read' | 'search' | 'share' | 'collect' | 'create'
  target_type: 'poem' | 'author'
  target_id: string
  duration?: number
  engagement_score?: number
  metadata?: any
}): Promise<ApiResponse<void>> {
  // 直接使用Supabase客户端记录行为
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: true }

    const { error } = await supabase
      .from('user_activities')
      .insert({
        user_id: user.id,
        ...params
      })

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('记录用户行为失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }
  }
}

// 获取诗词详情
export async function getPoemDetail(poem_id: string): Promise<ApiResponse<Poem>> {
  try {
    const { data, error } = await supabase
      .from('poems')
      .select(`
        *,
        authors!inner(name)
      `)
      .eq('id', poem_id)
      .single()

    if (error) throw error

    return {
      success: true,
      data: {
        ...data,
        author: data.authors.name
      }
    }
  } catch (error) {
    console.error('获取诗词详情失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }
  }
}

// 获取热门诗词
export async function getPopularPoems(limit: number = 10): Promise<ApiResponse<Poem[]>> {
  try {
    const { data, error } = await supabase
      .from('poems')
      .select(`
        *,
        authors!inner(name)
      `)
      .order('popularity', { ascending: false })
      .limit(limit)

    if (error) throw error

    const poems = data.map(poem => ({
      ...poem,
      author: poem.authors.name
    }))

    return { success: true, data: poems }
  } catch (error) {
    console.error('获取热门诗词失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }
  }
}

export default {
  searchPoems,
  sendAIMessage,
  getPoemRecommendations,
  getUserFavorites,
  addFavorite,
  removeFavorite,
  recordUserActivity,
  getPoemDetail,
  getPopularPoems
}