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
  try {
    // 本地实现知识图谱逻辑
    const graphData = await buildKnowledgeGraphLocally(params)
    return { success: true, data: graphData }
  } catch (error) {
    console.error('知识图谱查询失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '查询失败'
    }
  }
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
  try {
    // 本地实现智能搜索逻辑
    const searchResults = await performIntelligentSearchLocally(params)
    return { success: true, data: searchResults }
  } catch (error) {
    console.error('智能搜索失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '搜索失败'
    }
  }
}

// AI诗词分析API
export async function analyzePoemAI(params: {
  poem_id: string;
  analysis_type?: 'quick' | 'deep' | 'comparative';
}): Promise<ApiResponse<AIAnalysisResult>> {
  try {
    // 直接使用数据库查询，避免Edge Function调用
    const { data: poem, error } = await supabase
      .from('poems')
      .select('*, authors!inner(*)')
      .eq('id', params.poem_id)
      .single()

    if (error) throw error
    if (!poem) throw new Error('诗词不存在')

    // 本地执行AI分析逻辑
    const analysisResult = await analyzePoemLocally(poem, params.analysis_type || 'quick')
    
    return { success: true, data: analysisResult }
  } catch (error) {
    console.error('AI诗词分析失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '分析失败'
    }
  }
}

// 本地诗词分析函数
async function analyzePoemLocally(poem: any, analysisType: string) {
  const content = poem.content
  
  // 主题分析
  const theme = analyzeTheme(content, poem.tags)
  
  // 意境分析
  const mood = analyzeMood(content)
  
  // 修辞手法分析
  const rhetoricalDevices = analyzeRhetoricalDevices(content)
  
  // 文化背景分析
  const culturalContext = analyzeCulturalContext(poem.authors.dynasty, poem.authors.literary_style)
  
  // 现代解读
  const modernInterpretation = generateModernInterpretation(content, theme, mood)
  
  // 难度评估
  const difficultyLevel = assessDifficultyLevel(content, rhetoricalDevices.length)
  
  // 推荐阅读
  const recommendedReading = generateRecommendedReading(theme, mood)

  return {
    theme,
    mood,
    rhetorical_devices: rhetoricalDevices,
    cultural_context: culturalContext,
    modern_interpretation: modernInterpretation,
    difficulty_level: difficultyLevel,
    recommended_reading: recommendedReading
  }
}

function analyzeTheme(content: string, tags: string[]): string {
  const themeKeywords = {
    '思乡': ['故乡', '家乡', '归乡', '思乡', '离愁'],
    '爱情': ['相思', '爱情', '恋人', '思念', '情愫'],
    '自然': ['山水', '自然', '风景', '季节', '花鸟'],
    '人生': ['人生', '时光', '岁月', '感慨', '命运'],
    '豪放': ['豪放', '壮阔', '雄浑', '激昂', '奔放'],
    '婉约': ['婉约', '细腻', '柔情', '含蓄', '缠绵']
  }

  // 从标签中提取主题
  if (tags && Array.isArray(tags)) {
    for (const tag of tags) {
      for (const [theme, keywords] of Object.entries(themeKeywords)) {
        if (keywords.some(keyword => tag.includes(keyword))) {
          return theme
        }
      }
    }
  }

  // 从内容中分析主题
  let maxScore = 0
  let detectedTheme = '其他'

  for (const [theme, keywords] of Object.entries(themeKeywords)) {
    let score = 0
    keywords.forEach(keyword => {
      if (content.includes(keyword)) score++
    })
    
    if (score > maxScore) {
      maxScore = score
      detectedTheme = theme
    }
  }

  return detectedTheme
}

function analyzeMood(content: string): string {
  const moodPatterns = [
    { pattern: /(豪放|壮阔|雄浑|激昂)/, mood: '豪放激昂' },
    { pattern: /(婉约|细腻|柔情|含蓄)/, mood: '婉约含蓄' },
    { pattern: /(忧伤|悲凉|哀愁|惆怅)/, mood: '忧伤悲凉' },
    { pattern: /(闲适|悠然|恬淡|宁静)/, mood: '闲适宁静' },
    { pattern: /(欢快|喜悦|欢乐|愉快)/, mood: '欢快喜悦' },
    { pattern: /(孤独|寂寞|寂寥)/, mood: '孤独寂寞' }
  ]

  for (const pattern of moodPatterns) {
    if (pattern.pattern.test(content)) {
      return pattern.mood
    }
  }

  return '中性平和'
}

function analyzeRhetoricalDevices(content: string): string[] {
  const devices = []
  
  // 比喻
  if (content.includes('如') || content.includes('似') || content.includes('若')) {
    devices.push('比喻')
  }
  
  // 对偶
  const lines = content.split(/[，。；！？]/).filter(line => line.trim())
  if (lines.length >= 2) {
    const hasAntithesis = lines.some((line, index) => {
      if (index < lines.length - 1) {
        const nextLine = lines[index + 1]
        return line.length === nextLine.length && 
               line.split('').every((char, charIndex) => 
                 !isChineseChar(char) || !isChineseChar(nextLine[charIndex]) ||
                 char !== nextLine[charIndex]
               )
      }
      return false
    })
    if (hasAntithesis) devices.push('对偶')
  }
  
  // 夸张
  if (content.match(/千|万|九霄|万丈|无边/)) {
    devices.push('夸张')
  }
  
  // 拟人
  if (content.match(/笑|哭|愁|喜|怒|哀|乐/)) {
    devices.push('拟人')
  }
  
  // 借代
  if (content.match(/玉壶|金樽|琼楼|瑶台/)) {
    devices.push('借代')
  }
  
  return devices.length > 0 ? devices : ['直抒胸臆']
}

function isChineseChar(char: string): boolean {
  return /[\u4e00-\u9fff]/.test(char)
}

function analyzeCulturalContext(dynasty: string, literaryStyle: string): string {
  const contextMap: Record<string, string> = {
    '唐': '唐代是中国诗歌的黄金时代，以格律诗和绝句为代表，注重意境和韵律',
    '宋': '宋代词作繁荣，注重婉约细腻的情感表达，反映市民生活',
    '元': '元代戏曲文学发展，诗词带有民间色彩和现实主义倾向',
    '明': '明代诗词继承传统，同时出现复古和创新并存的局面',
    '清': '清代诗词注重学问和技巧，出现多种风格流派'
  }
  
  let context = contextMap[dynasty] || '该时期诗词具有独特的时代特征和文化背景'
  
  if (literaryStyle) {
    context += `。作者风格：${literaryStyle}`
  }
  
  return context
}

function generateModernInterpretation(content: string, theme: string, mood: string): string {
  const interpretations: Record<string, Record<string, string>> = {
    '思乡': {
      '忧伤悲凉': '这首诗表达了游子对故乡的深切思念，在现代社会中同样能引起异地工作求学者的共鸣',
      '闲适宁静': '通过宁静的笔触描绘故乡美景，提醒现代人关注家乡的文化价值'
    },
    '爱情': {
      '婉约含蓄': '含蓄的情感表达方式，在现代快节奏生活中显得尤为珍贵',
      '豪放激昂': '热烈奔放的爱情宣言，展现了古人真挚的情感世界'
    },
    '自然': {
      '闲适宁静': '对自然景物的细腻描写，启发现代人重新发现身边的美景',
      '豪放激昂': '壮丽的自然景观描写，激发人们对祖国山河的热爱'
    }
  }
  
  const defaultInterpretation = '这首诗的深刻内涵在现代社会依然具有重要的启示意义，值得我们细细品味和学习'
  
  return interpretations[theme]?.[mood] || defaultInterpretation
}

function assessDifficultyLevel(content: string, rhetoricalCount: number): number {
  let difficulty = 1
  
  // 根据字数评估
  const charCount = content.replace(/[^\u4e00-\u9fff]/g, '').length
  if (charCount > 40) difficulty += 1
  if (charCount > 80) difficulty += 1
  
  // 根据修辞手法数量评估
  if (rhetoricalCount > 2) difficulty += 1
  if (rhetoricalCount > 4) difficulty += 1
  
  return Math.min(difficulty, 5)
}

function generateRecommendedReading(theme: string, mood: string): string[] {
  const recommendations: Record<string, Record<string, string[]>> = {
    '思乡': {
      '忧伤悲凉': ['《静夜思》- 李白', '《九月九日忆山东兄弟》- 王维', '《乡愁》- 余光中'],
      '闲适宁静': ['《归园田居》- 陶渊明', '《山居秋暝》- 王维']
    },
    '爱情': {
      '婉约含蓄': ['《相思》- 王维', '《鹊桥仙》- 秦观', '《一剪梅》- 李清照'],
      '豪放激昂': ['《长恨歌》- 白居易', '《离思》- 元稹']
    },
    '自然': {
      '闲适宁静': ['《春晓》- 孟浩然', '《江雪》- 柳宗元', '《山行》- 杜牧'],
      '豪放激昂': ['《望庐山瀑布》- 李白', '《登高》- 杜甫']
    }
  }
  
  const defaultRecommendations = [
    '《唐诗三百首》精选',
    '《宋词精选》作品',
    '相关主题的经典诗词赏析'
  ]
  
  return recommendations[theme]?.[mood] || defaultRecommendations
}

// 本地知识图谱构建函数
async function buildKnowledgeGraphLocally(params: any): Promise<any> {
  const { center_node_id, center_node_type = 'poem', depth = 2, limit = 20 } = params
  
  // 基础图谱数据
  const graphData = {
    nodes: [],
    links: []
  }
  
  if (center_node_id && center_node_type === 'poem') {
    // 查询诗词信息
    const { data: poem, error } = await supabase
      .from('poems')
      .select('*, authors!inner(*)')
      .eq('id', center_node_id)
      .single()
    
    if (error) throw error
    
    // 添加诗词节点
    graphData.nodes.push({
      id: poem.id,
      type: 'poem',
      label: poem.title,
      properties: {
        dynasty: poem.authors.dynasty,
        author: poem.authors.name,
        theme: poem.tags?.[0] || '未知'
      }
    })
    
    // 添加作者节点
    graphData.nodes.push({
      id: poem.authors.id,
      type: 'author',
      label: poem.authors.name,
      properties: {
        dynasty: poem.authors.dynasty,
        literary_style: poem.authors.literary_style
      }
    })
    
    // 添加朝代节点
    graphData.nodes.push({
      id: poem.authors.dynasty,
      type: 'dynasty',
      label: poem.authors.dynasty,
      properties: {}
    })
    
    // 添加关系链接
    graphData.links.push({
      source: poem.id,
      target: poem.authors.id,
      type: 'authored_by'
    })
    
    graphData.links.push({
      source: poem.authors.id,
      target: poem.authors.dynasty,
      type: 'belongs_to'
    })
    
    // 查找相关诗词（基于相同作者或主题）
    const { data: relatedPoems } = await supabase
      .from('poems')
      .select('*, authors!inner(*)')
      .or(`author_id.eq.${poem.author_id},tags.ov.{${poem.tags?.[0] || ''}}`)
      .limit(limit - 3)
    
    if (relatedPoems) {
      relatedPoems.forEach(relatedPoem => {
        if (relatedPoem.id !== poem.id) {
          graphData.nodes.push({
            id: relatedPoem.id,
            type: 'poem',
            label: relatedPoem.title,
            properties: {
              dynasty: relatedPoem.authors.dynasty,
              author: relatedPoem.authors.name,
              theme: relatedPoem.tags?.[0] || '未知'
            }
          })
          
          graphData.links.push({
            source: poem.id,
            target: relatedPoem.id,
            type: 'related_to'
          })
        }
      })
    }
  }
  
  return graphData
}

// 本地智能搜索函数
async function performIntelligentSearchLocally(params: any): Promise<any> {
  const { query, search_type = 'hybrid', filters = {}, limit = 10 } = params
  
  let searchQuery = supabase
    .from('poems')
    .select('*, authors!inner(*)')
  
  // 关键词搜索
  if (search_type === 'keyword' || search_type === 'hybrid') {
    searchQuery = searchQuery.or(`title.ilike.%${query}%,content.ilike.%${query}%,authors.name.ilike.%${query}%`)
  }
  
  // 应用过滤器
  if (filters.dynasty && filters.dynasty.length > 0) {
    searchQuery = searchQuery.in('authors.dynasty', filters.dynasty)
  }
  
  if (filters.author && filters.author.length > 0) {
    searchQuery = searchQuery.in('authors.name', filters.author)
  }
  
  if (filters.theme && filters.theme.length > 0) {
    searchQuery = searchQuery.overlaps('tags', filters.theme)
  }
  
  if (filters.difficulty_level && filters.difficulty_level.length > 0) {
    searchQuery = searchQuery.in('difficulty_level', filters.difficulty_level)
  }
  
  const { data: poems, error } = await searchQuery.limit(limit)
  
  if (error) throw error
  
  // 简单的语义匹配评分（基于关键词出现频率）
  const scoredResults = poems.map(poem => {
    let score = 0
    
    // 标题匹配
    if (poem.title.includes(query)) score += 3
    // 内容匹配
    const contentMatches = (poem.content.match(new RegExp(query, 'g')) || []).length
    score += contentMatches * 2
    // 作者匹配
    if (poem.authors.name.includes(query)) score += 2
    // 标签匹配
    if (poem.tags && poem.tags.some(tag => tag.includes(query))) score += 1
    
    return {
      ...poem,
      relevance_score: score,
      match_type: score > 0 ? 'direct' : 'semantic'
    }
  })
  
  // 按相关性排序
  scoredResults.sort((a, b) => b.relevance_score - a.relevance_score)
  
  return {
    results: scoredResults,
    total_count: scoredResults.length,
    search_metadata: {
      query,
      search_type,
      filters_applied: Object.keys(filters).length > 0
    }
  }
}

// 本地相关概念查找函数
function findRelatedConceptsLocally(concept: string, relationship_type: string, limit: number): string[] {
  const conceptMap: Record<string, Record<string, string[]>> = {
    '思乡': {
      'thematic': ['故乡', '游子', '离愁', '归乡', '乡愁', '故土'],
      'temporal': ['秋思', '夜思', '月夜', '佳节'],
      'stylistic': ['抒情', '写景', '感怀']
    },
    '爱情': {
      'thematic': ['相思', '恋人', '情愫', '离别', '重逢', '誓言'],
      'temporal': ['春思', '秋思', '夜思'],
      'stylistic': ['婉约', '豪放', '抒情']
    },
    '自然': {
      'thematic': ['山水', '风景', '季节', '花鸟', '田园', '江河'],
      'temporal': ['春景', '秋色', '夏日', '冬雪'],
      'stylistic': ['写景', '抒情', '咏物']
    },
    '豪放': {
      'thematic': ['壮志', '边塞', '战争', '英雄', '豪情'],
      'temporal': ['盛世', '乱世', '古代'],
      'stylistic': ['激昂', '雄浑', '奔放']
    },
    '婉约': {
      'thematic': ['柔情', '细腻', '含蓄', '缠绵', '闺怨'],
      'temporal': ['春思', '秋愁', '夜思'],
      'stylistic': ['细腻', '含蓄', '柔美']
    }
  }
  
  const defaultConcepts = ['唐诗', '宋词', '古诗词', '文学', '文化']
  
  return conceptMap[concept]?.[relationship_type]?.slice(0, limit) || 
         defaultConcepts.slice(0, limit)
}

// 本地主题分布查询函数
async function getThemeDistributionLocally(params: any): Promise<Record<string, number>> {
  const { dynasty, author, time_period } = params
  
  let query = supabase
    .from('poems')
    .select('tags, authors!inner(*)')
  
  if (dynasty) {
    query = query.eq('authors.dynasty', dynasty)
  }
  
  if (author) {
    query = query.eq('authors.name', author)
  }
  
  const { data: poems, error } = await query
  
  if (error) throw error
  
  // 统计主题分布
  const themeDistribution: Record<string, number> = {}
  
  poems.forEach(poem => {
    if (poem.tags && Array.isArray(poem.tags)) {
      poem.tags.forEach(tag => {
        themeDistribution[tag] = (themeDistribution[tag] || 0) + 1
      })
    }
  })
  
  return themeDistribution
}

// 获取相关概念API
export async function getRelatedConcepts(params: {
  concept: string;
  relationship_type?: 'thematic' | 'temporal' | 'stylistic';
  limit?: number;
}): Promise<ApiResponse<string[]>> {
  try {
    // 本地实现相关概念查询
    const relatedConcepts = findRelatedConceptsLocally(params.concept, params.relationship_type || 'thematic', params.limit || 10)
    return { success: true, data: relatedConcepts }
  } catch (error) {
    console.error('相关概念查询失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '查询失败'
    }
  }
}

// 获取诗词主题分布API
export async function getThemeDistribution(params: {
  dynasty?: string;
  author?: string;
  time_period?: string;
}): Promise<ApiResponse<Record<string, number>>> {
  try {
    // 本地实现主题分布查询
    const themeDistribution = await getThemeDistributionLocally(params)
    return { success: true, data: themeDistribution }
  } catch (error) {
    console.error('主题分布查询失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '查询失败'
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