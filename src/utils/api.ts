// API工具函数
import { supabase } from './supabase'
import type { 
  Poem, 
  SearchResult, 
  AIResponse, 
  Favorite, 
  ApiResponse,
  KnowledgeGraphData,
  IntelligentSearchResult,
  AIAnalysisResult
} from '../types/poem'

const API_BASE_URL = import.meta.env.VITE_SUPABASE_URL?.replace('/rest/v1', '') || 'https://iolkcrlsqemuauaopepc.supabase.co'

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
    console.log('获取诗词详情，ID:', poem_id)
    
    const { data, error } = await supabase
      .from('poems')
      .select(`
        *,
        authors!inner(name)
      `)
      .eq('id', poem_id)
      .single()

    console.log('诗词详情查询结果:', { data, error })

    if (error) {
      console.error('诗词详情查询错误:', error)
      throw error
    }

    if (!data) {
      console.log('诗词不存在，ID:', poem_id)
      return { success: false, error: '诗词不存在' }
    }

    const poem = {
      ...data,
      author: data.authors.name
    }

    console.log('诗词详情获取成功:', poem.title)
    return { success: true, data: poem }
  } catch (error) {
    console.error('获取诗词详情失败:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '获取诗词详情失败' 
    }
  }
}

// 获取热门诗词
export async function getPopularPoems(limit: number = 10): Promise<ApiResponse<Poem[]>> {
  try {
    console.log('开始获取热门诗词，limit:', limit)
    
    // 首先尝试按热度排序获取
    const { data: popularData, error: popularError } = await supabase
      .from('poems')
      .select(`
        *,
        authors!inner(name)
      `)
      .order('popularity', { ascending: false })
      .limit(limit)

    console.log('按热度排序查询结果:', { data: popularData, error: popularError })

    if (popularError) {
      console.error('按热度排序查询错误:', popularError)
      throw popularError
    }

    // 如果按热度排序没有数据或数据不足，则按创建时间获取
    let finalData = popularData
    if (!popularData || popularData.length === 0) {
      console.log('按热度排序无数据，尝试按创建时间获取...')
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('poems')
        .select(`
          *,
          authors!inner(name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      console.log('按创建时间查询结果:', { data: fallbackData, error: fallbackError })

      if (fallbackError) {
        console.error('按创建时间查询错误:', fallbackError)
        throw fallbackError
      }
      finalData = fallbackData
    }

    // 如果仍然没有数据，返回空数组而不是错误
    if (!finalData) {
      console.log('最终数据为空')
      return { success: true, data: [] }
    }

    console.log(`获取到 ${finalData.length} 首诗词`)
    
    const poems = finalData.map(poem => ({
      ...poem,
      author: poem.authors.name
    }))

    return { success: true, data: poems }
  } catch (error) {
    console.error('获取热门诗词失败:', error)
    // 发生错误时返回空数组而不是失败状态
    return {
      success: true,
      data: []
    }
  }
}

// 获取所有诗词
export async function getAllPoems(): Promise<Poem[]> {
  try {
    const { data, error } = await supabase
      .from('poems')
      .select(`
        *,
        authors!inner(name)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data.map(poem => ({
      ...poem,
      author: poem.authors.name
    }))
  } catch (error) {
    console.error('获取所有诗词失败:', error)
    return []
  }
}

// 创建诗词
export async function createPoem(poemData: Omit<Poem, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Poem>> {
  try {
    // 首先检查作者是否存在，不存在则创建
    let authorId: string
    const { data: existingAuthor, error: authorError } = await supabase
      .from('authors')
      .select('id')
      .eq('name', poemData.author)
      .single()

    if (authorError || !existingAuthor) {
      // 创建新作者
      const { data: newAuthor, error: createAuthorError } = await supabase
        .from('authors')
        .insert({ name: poemData.author })
        .select()
        .single()

      if (createAuthorError) throw createAuthorError
      authorId = newAuthor.id
    } else {
      authorId = existingAuthor.id
    }

    // 创建诗词
    const { data, error } = await supabase
      .from('poems')
      .insert({
        title: poemData.title,
        author_id: authorId,
        dynasty: poemData.dynasty,
        content: poemData.content,
        tags: poemData.tags,
        annotation: poemData.annotation,
        translation: poemData.translation
      })
      .select(`
        *,
        authors!inner(name)
      `)
      .single()

    if (error) throw error

    const poem = {
      ...data,
      author: data.authors.name
    }

    return { success: true, data: poem }
  } catch (error) {
    console.error('创建诗词失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }
  }
}

// 更新诗词
export async function updatePoem(poemId: string, poemData: Partial<Poem>): Promise<ApiResponse<Poem>> {
  try {
    // 如果更新了作者，需要处理作者信息
    let updateData: any = {
      title: poemData.title,
      dynasty: poemData.dynasty,
      content: poemData.content,
      tags: poemData.tags,
      annotation: poemData.annotation,
      translation: poemData.translation
    }

    if (poemData.author) {
      // 检查作者是否存在
      const { data: existingAuthor, error: authorError } = await supabase
        .from('authors')
        .select('id')
        .eq('name', poemData.author)
        .single()

      if (authorError || !existingAuthor) {
        // 创建新作者
        const { data: newAuthor, error: createAuthorError } = await supabase
          .from('authors')
          .insert({ name: poemData.author })
          .select()
          .single()

        if (createAuthorError) throw createAuthorError
        updateData.author_id = newAuthor.id
      } else {
        updateData.author_id = existingAuthor.id
      }
    }

    const { data, error } = await supabase
      .from('poems')
      .update(updateData)
      .eq('id', poemId)
      .select(`
        *,
        authors!inner(name)
      `)
      .single()

    if (error) throw error

    const poem = {
      ...data,
      author: data.authors.name
    }

    return { success: true, data: poem }
  } catch (error) {
    console.error('更新诗词失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }
  }
}

// 删除诗词
export async function deletePoem(poemId: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('poems')
      .delete()
      .eq('id', poemId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('删除诗词失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }
  }
}

// 知识图谱相关API
export async function getKnowledgeGraph(params: {
  center_node_id?: string;
  center_node_type?: 'poem' | 'author' | 'dynasty';
  depth?: number;
  limit?: number;
}): Promise<ApiResponse<KnowledgeGraphData>> {
  return apiRequest<KnowledgeGraphData>('/knowledge-graph', {
    method: 'POST',
    body: JSON.stringify(params)
  })
}

// 智能搜索API
export async function intelligentSearch(params: {
  query: string;
  search_type?: 'semantic' | 'keyword' | 'hybrid';
  filters?: {
    dynasty?: string[];
    author?: string[];
    theme?: string[];
    difficulty_level?: number[];
  };
  limit?: number;
}): Promise<ApiResponse<IntelligentSearchResult>> {
  return apiRequest<IntelligentSearchResult>('/intelligent-search', {
    method: 'POST',
    body: JSON.stringify(params)
  })
}

// AI诗词分析API
export async function analyzePoemAI(params: {
  poem_id: string;
  analysis_type?: 'quick' | 'deep' | 'comparative';
}): Promise<ApiResponse<AIAnalysisResult>> {
  return apiRequest<AIAnalysisResult>('/poem-analysis', {
    method: 'POST',
    body: JSON.stringify(params)
  })
}

// 获取相关概念API
export async function getRelatedConcepts(params: {
  concept: string;
  relationship_type?: 'thematic' | 'temporal' | 'stylistic';
  limit?: number;
}): Promise<ApiResponse<string[]>> {
  return apiRequest<string[]>('/related-concepts', {
    method: 'POST',
    body: JSON.stringify(params)
  })
}

// 获取诗词主题分布API
export async function getThemeDistribution(params: {
  dynasty?: string;
  author?: string;
  time_period?: string;
}): Promise<ApiResponse<Record<string, number>>> {
  return apiRequest<Record<string, number>>('/theme-distribution', {
    method: 'POST',
    body: JSON.stringify(params)
  })
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