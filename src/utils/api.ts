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

// 获取热门诗词（包含本地存储的用户创作诗词）
export async function getPopularPoems(limit: number = 10): Promise<ApiResponse<Poem[]>> {
  try {
    console.log('开始获取热门诗词，limit:', limit)
    
    // 获取本地存储的用户创作诗词
    const userPoems: Poem[] = JSON.parse(localStorage.getItem('user_poems') || '[]')
    
    let supabasePoems: Poem[] = []
    
    try {
      // 首先尝试按热度排序获取Supabase数据
      const { data: popularData, error: popularError } = await supabase
        .from('poems')
        .select(`
          *,
          authors!inner(name)
        `)
        .order('popularity', { ascending: false })
        .limit(limit)

      console.log('按热度排序查询结果:', { data: popularData, error: popularError })

      if (!popularError && popularData) {
        supabasePoems = popularData.map(item => ({
          ...item,
          author: item.authors.name
        }))
      }

      // 如果Supabase数据不足，尝试按创建时间获取
      if (supabasePoems.length < limit) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('poems')
          .select(`
            *,
            authors!inner(name)
          `)
          .order('created_at', { ascending: false })
          .limit(limit - supabasePoems.length)

        if (!fallbackError && fallbackData) {
          const additionalPoems = fallbackData.map(item => ({
            ...item,
            author: item.authors.name
          }))
          supabasePoems = [...supabasePoems, ...additionalPoems]
        }
      }
    } catch (supabaseError) {
      console.warn('Supabase查询失败，使用本地数据:', supabaseError)
    }

    // 合并数据：用户创作的诗词在前，然后按热度排序
    const allPoems = [...userPoems, ...supabasePoems]
      .sort((a, b) => {
        // 用户创作的诗词优先显示
        const isUserPoemA = userPoems.some(p => p.id === a.id)
        const isUserPoemB = userPoems.some(p => p.id === b.id)
        
        if (isUserPoemA && !isUserPoemB) return -1
        if (!isUserPoemA && isUserPoemB) return 1
        
        // 然后按热度排序
        return (b.popularity || 0) - (a.popularity || 0)
      })
      .slice(0, limit)

    console.log('获取到', allPoems.length, '首诗词（包含', userPoems.length, '首用户创作）')
    return { success: true, data: allPoems }
  } catch (error) {
    console.error('获取热门诗词失败:', error)
    // 发生错误时返回空数组而不是失败状态
    return {
      success: true,
      data: []
    }
  }
}

// 获取所有诗词（包含本地存储的用户创作诗词）
export async function getAllPoems(): Promise<Poem[]> {
  try {
    // 获取本地存储的用户创作诗词
    const userPoems: Poem[] = JSON.parse(localStorage.getItem('user_poems') || '[]')
    
    let supabasePoems: Poem[] = []
    
    try {
      // 获取Supabase数据库中的诗词
      const { data, error } = await supabase
        .from('poems')
        .select(`
          *,
          authors!inner(name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      supabasePoems = data.map(poem => ({
        ...poem,
        author: poem.authors.name
      }))
    } catch (supabaseError) {
      console.warn('Supabase查询失败，使用本地数据:', supabaseError)
    }

    // 合并数据：用户创作的诗词在前，然后按创建时间排序
    const allPoems = [...userPoems, ...supabasePoems]
      .sort((a, b) => {
        // 用户创作的诗词优先显示
        const isUserPoemA = userPoems.some(p => p.id === a.id)
        const isUserPoemB = userPoems.some(p => p.id === b.id)
        
        if (isUserPoemA && !isUserPoemB) return -1
        if (!isUserPoemA && isUserPoemB) return 1
        
        // 然后按创建时间排序（新的在前）
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })

    console.log('获取到', allPoems.length, '首诗词（包含', userPoems.length, '首用户创作）')
    return allPoems
  } catch (error) {
    console.error('获取所有诗词失败:', error)
    return []
  }
}

// 创建诗词（使用本地存储模拟）
export async function createPoem(poemData: Omit<Poem, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Poem>> {
  try {
    // 模拟创建诗词，保存到本地存储
    const newPoem: Poem = {
      id: Date.now().toString(),
      title: poemData.title,
      author: poemData.author,
      dynasty: poemData.dynasty,
      content: poemData.content,
      tags: poemData.tags || [],
      annotation: poemData.annotation || '',
      translation: poemData.translation || '',
      difficulty_level: poemData.difficulty_level || 3,
      popularity: poemData.popularity || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // 保存到本地存储
    const userPoems = JSON.parse(localStorage.getItem('user_poems') || '[]')
    userPoems.push(newPoem)
    localStorage.setItem('user_poems', JSON.stringify(userPoems))

    return { success: true, data: newPoem }
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
  
  // 根据分析类型调整分析深度
  const isDeepAnalysis = analysisType === 'deep'
  const isComparativeAnalysis = analysisType === 'comparative'
  
  // 主题分析（增强版）
  const theme = analyzeThemeEnhanced(content, poem.tags, isDeepAnalysis)
  
  // 意境分析（增强版）
  const mood = analyzeMoodEnhanced(content, isDeepAnalysis)
  
  // 修辞手法分析（增强版）
  const rhetoricalDevices = analyzeRhetoricalDevicesEnhanced(content, isDeepAnalysis)
  
  // 文化背景分析（增强版）
  const culturalContext = analyzeCulturalContextEnhanced(poem.authors.dynasty, poem.authors.literary_style, isDeepAnalysis)
  
  // 现代解读（增强版）
  const modernInterpretation = generateModernInterpretationEnhanced(content, theme, mood, isDeepAnalysis)
  
  // 难度评估（增强版）
  const difficultyLevel = assessDifficultyLevelEnhanced(content, rhetoricalDevices.length, isDeepAnalysis)
  
  // 推荐阅读（增强版）
  const recommendedReading = generateRecommendedReadingEnhanced(theme, mood, isDeepAnalysis)
  
  // 艺术特色总结
  const artisticFeatures = generateArtisticFeaturesSummary(theme, mood, rhetoricalDevices)
  
  // 学习建议（增强版）
  const learningSuggestions = generateLearningSuggestions(difficultyLevel, theme, mood)

  return {
    theme,
    mood,
    rhetorical_devices: rhetoricalDevices,
    cultural_context: culturalContext,
    modern_interpretation: modernInterpretation,
    difficulty_level: difficultyLevel,
    recommended_reading: recommendedReading,
    artistic_features: artisticFeatures,
    learning_suggestions: learningSuggestions,
    analysis_depth: analysisType,
    analysis_timestamp: new Date().toISOString()
  }
}

// 主题分析函数（增强版）
function analyzeThemeEnhanced(content: string, tags: string[], isDeepAnalysis: boolean): string {
  // 主题关键词库（扩展版）
  const themeKeywords = {
    '思乡': ['故乡', '家乡', '归乡', '乡愁', '故园', '故土', '离愁', '游子', '归心'],
    '爱国': ['国家', '山河', '社稷', '忠诚', '报国', '民族', '江山', '天下', '兴亡'],
    '爱情': ['相思', '情爱', '恋人', '缠绵', '思念', '爱慕', '情愫', '眷恋', '痴情'],
    '友情': ['知己', '朋友', '离别', '重逢', '情谊', '兄弟', '知音', '故人', '交情'],
    '自然': ['山水', '花鸟', '风景', '季节', '天地', '自然', '江河', '山川', '风云'],
    '人生': ['命运', '时光', '青春', '衰老', '得失', '感悟', '岁月', '浮生', '沧桑'],
    '哲理': ['道理', '智慧', '思考', '领悟', '真理', '哲学', '禅意', '觉悟', '境界'],
    '战争': ['战场', '将士', '征伐', '和平', '战乱', '边塞', '烽火', '沙场', '戍边'],
    '离别': ['送别', '分手', '远行', '思念', '不舍', '告别', '离情', '分袂', '辞行'],
    '怀古': ['历史', '古人', '遗迹', '朝代', '兴衰', '怀旧', '古迹', '前朝', '往事'],
    '隐逸': ['隐居', '山林', '田园', '闲适', '超脱', '淡泊', '清静', '逍遥', '避世'],
    '咏物': ['描写', '赞美', '物品', '特征', '象征', '比喻', '托物', '言志', '寄情']
  }
  
  // 检测诗词中的主题关键词
  const detectedThemes: string[] = []
  
  for (const [theme, keywords] of Object.entries(themeKeywords)) {
    const matchCount = keywords.filter(keyword => content.includes(keyword)).length
    if (matchCount > 0) {
      detectedThemes.push(theme)
    }
  }
  
  // 深度分析：结合诗词内容和标签进行综合判断
  if (isDeepAnalysis) {
    // 分析诗词的情感基调
    const emotionalTone = analyzeEmotionalTone(content)
    
    // 分析诗词的意象特征
    const imageryFeatures = analyzeImageryFeatures(content)
    
    // 综合判断主题
    if (emotionalTone === '豪迈' && imageryFeatures.includes('壮阔')) {
      detectedThemes.push('豪情壮志')
    } else if (emotionalTone === '婉约' && imageryFeatures.includes('细腻')) {
      detectedThemes.push('婉约抒情')
    } else if (emotionalTone === '悲凉' && imageryFeatures.includes('萧瑟')) {
      detectedThemes.push('悲秋伤怀')
    } else if (emotionalTone === '闲适' && imageryFeatures.includes('田园')) {
      detectedThemes.push('田园隐逸')
    }
  }
  
  // 去重并排序
  const uniqueThemes = [...new Set(detectedThemes)]
  
  if (uniqueThemes.length > 0) {
    return uniqueThemes.slice(0, isDeepAnalysis ? 5 : 3).join('、')
  }
  
  // 使用标签作为备选
  if (tags && tags.length > 0) {
    return tags.slice(0, isDeepAnalysis ? 4 : 2).join('、')
  }
  
  return isDeepAnalysis ? '情感抒发与人生感悟' : '情感抒发'
}

// 情感基调分析函数
function analyzeEmotionalTone(content: string): string {
  const tonePatterns = [
    { pattern: /(豪放|壮阔|雄浑|激昂|奔放|慷慨)/, tone: '豪迈' },
    { pattern: /(婉约|细腻|柔情|含蓄|缠绵|柔美)/, tone: '婉约' },
    { pattern: /(忧伤|悲凉|哀愁|惆怅|凄凉|萧瑟)/, tone: '悲凉' },
    { pattern: /(闲适|悠然|恬淡|宁静|清静|逍遥)/, tone: '闲适' },
    { pattern: /(欢快|喜悦|欢乐|愉快|欣喜|畅快)/, tone: '欢快' },
    { pattern: /(孤独|寂寞|寂寥|孤寂|清冷)/, tone: '孤独' },
    { pattern: /(深沉|凝重|肃穆|庄严|厚重)/, tone: '深沉' },
    { pattern: /(清新|明快|活泼|轻快|灵动)/, tone: '清新' }
  ]
  
  for (const pattern of tonePatterns) {
    if (pattern.pattern.test(content)) {
      return pattern.tone
    }
  }
  
  return '平和'
}

// 意象特征分析函数
function analyzeImageryFeatures(content: string): string[] {
  const features = []
  
  // 自然意象
  if (content.match(/山|水|风|云|月|花|鸟|树|草/)) features.push('自然')
  if (content.match(/江|河|湖|海|波涛|浪花/)) features.push('水域')
  if (content.match(/春|夏|秋|冬|季节|时节/)) features.push('季节')
  
  // 人文意象
  if (content.match(/楼|台|亭|阁|宫殿|城郭/)) features.push('建筑')
  if (content.match(/酒|茶|琴|棋|书|画/)) features.push('雅趣')
  if (content.match(/马|车|船|舟|行旅/)) features.push('行旅')
  
  // 情感意象
  if (content.match(/泪|愁|思|念|梦|魂/)) features.push('情感')
  if (content.match(/壮阔|辽阔|浩瀚|无边/)) features.push('壮阔')
  if (content.match(/细腻|微妙|精巧|细致/)) features.push('细腻')
  if (content.match(/萧瑟|凄凉|荒凉|寂寥/)) features.push('萧瑟')
  if (content.match(/田园|农家|村舍|田野/)) features.push('田园')
  
  return features.length > 0 ? features : ['直抒胸臆']
}

function analyzeTheme(content: string, tags: string[]): string {
  return analyzeThemeEnhanced(content, tags, false)
}

// 意境分析函数（增强版）
function analyzeMoodEnhanced(content: string, isDeepAnalysis: boolean): string {
  const moodPatterns = [
    { pattern: /(豪放|壮阔|雄浑|激昂|奔放|慷慨|壮志)/, mood: '豪放激昂' },
    { pattern: /(婉约|细腻|柔情|含蓄|缠绵|柔美|温婉)/, mood: '婉约含蓄' },
    { pattern: /(忧伤|悲凉|哀愁|惆怅|凄凉|萧瑟|哀怨)/, mood: '忧伤悲凉' },
    { pattern: /(闲适|悠然|恬淡|宁静|清静|逍遥|淡泊)/, mood: '闲适宁静' },
    { pattern: /(欢快|喜悦|欢乐|愉快|欣喜|畅快|愉悦)/, mood: '欢快喜悦' },
    { pattern: /(孤独|寂寞|寂寥|孤寂|清冷|孤单)/, mood: '孤独寂寞' },
    { pattern: /(深沉|凝重|肃穆|庄严|厚重|沉郁)/, mood: '深沉凝重' },
    { pattern: /(清新|明快|活泼|轻快|灵动|生机)/, mood: '清新明快' },
    { pattern: /(苍凉|荒凉|寂寥|萧瑟|落寞)/, mood: '苍凉落寞' },
    { pattern: /(豪迈|雄壮|威武|霸气|英武)/, mood: '豪迈雄壮' }
  ]
  
  // 深度分析：多重意境判断
  if (isDeepAnalysis) {
    const detectedMoods: string[] = []
    
    for (const pattern of moodPatterns) {
      if (pattern.pattern.test(content)) {
        detectedMoods.push(pattern.mood)
      }
    }
    
    if (detectedMoods.length > 0) {
      // 返回主要意境，如果有多重意境则组合
      if (detectedMoods.length === 1) {
        return detectedMoods[0]
      } else {
        return `${detectedMoods[0]}为主，兼有${detectedMoods.slice(1).join('、')}`
      }
    }
  } else {
    // 快速分析：只返回第一个匹配的意境
    for (const pattern of moodPatterns) {
      if (pattern.pattern.test(content)) {
        return pattern.mood
      }
    }
  }
  
  return isDeepAnalysis ? '意境深远，耐人寻味' : '意境优美'
}

function analyzeMood(content: string): string {
  return analyzeMoodEnhanced(content, false)
}

// 修辞手法分析函数（增强版）
function analyzeRhetoricalDevicesEnhanced(content: string, isDeepAnalysis: boolean): string[] {
  const devices = []
  
  // 比喻（增强检测）
  if (content.match(/如|似|若|犹|好比|仿佛|宛如|恰似/)) {
    devices.push('比喻')
  }
  
  // 对偶（增强检测）
  const lines = content.split(/[，。；！？]/).filter(line => line.trim())
  if (lines.length >= 2) {
    const hasAntithesis = lines.some((line, index) => {
      if (index < lines.length - 1) {
        const nextLine = lines[index + 1]
        const lineChars = line.replace(/[^\u4e00-\u9fff]/g, '')
        const nextLineChars = nextLine.replace(/[^\u4e00-\u9fff]/g, '')
        
        return lineChars.length === nextLineChars.length && 
               lineChars.length >= 3 && // 至少3个字才认为是对偶
               lineChars.split('').every((char, charIndex) => 
                 char !== nextLineChars[charIndex]
               )
      }
      return false
    })
    if (hasAntithesis) devices.push('对偶')
  }
  
  // 夸张（增强检测）
  if (content.match(/千|万|九霄|万丈|无边|无穷|极致|至极/)) {
    devices.push('夸张')
  }
  
  // 拟人（增强检测）
  if (content.match(/笑|哭|愁|喜|怒|哀|乐|言|语|思|想/)) {
    const personificationWords = content.match(/(山|水|风|月|花|鸟|树).*?(笑|哭|愁|喜|怒|哀|乐|言|语)/)
    if (personificationWords) {
      devices.push('拟人')
    }
  }
  
  // 借代（增强检测）
  if (content.match(/玉壶|金樽|琼楼|瑶台|朱门|蓬门|青丝|白发/)) {
    devices.push('借代')
  }
  
  // 排比（深度分析）
  if (isDeepAnalysis && content.match(/(.*?[，。；]).*?\1.*?\1/)) {
    devices.push('排比')
  }
  
  // 反问（深度分析）
  if (isDeepAnalysis && content.match(/何|岂|安|焉|怎|如何|岂非/)) {
    devices.push('反问')
  }
  
  // 对比（深度分析）
  if (isDeepAnalysis && content.match(/(大|小|长|短|高|低|明|暗|动|静).*?\1/)) {
    devices.push('对比')
  }
  
  return devices.length > 0 ? devices : ['直抒胸臆']
}

function analyzeRhetoricalDevices(content: string): string[] {
  return analyzeRhetoricalDevicesEnhanced(content, false)
}

function isChineseChar(char: string): boolean {
  return /[\u4e00-\u9fff]/.test(char)
}

// 文化背景分析函数（增强版）
function analyzeCulturalContextEnhanced(dynasty: string, literaryStyle: string, isDeepAnalysis: boolean): string {
  const contextMap: Record<string, string> = {
    '唐': '唐代是中国诗歌的黄金时代，以格律诗和绝句为代表，注重意境和韵律，诗歌创作达到巅峰',
    '宋': '宋代词作繁荣，注重婉约细腻的情感表达，反映市民生活，词牌形式丰富多样',
    '元': '元代戏曲文学发展，诗词带有民间色彩和现实主义倾向，散曲创作兴盛',
    '明': '明代诗词继承传统，同时出现复古和创新并存的局面，文人结社风气盛行',
    '清': '清代诗词注重学问和技巧，出现多种风格流派，诗词理论研究深入'
  }
  
  const styleMap: Record<string, string> = {
    '豪放派': '风格豪迈奔放，气势磅礴，多表现壮志豪情和爱国情怀',
    '婉约派': '风格婉约细腻，情感含蓄，多表现个人情感和细腻感受',
    '山水田园': '注重自然景物描写，意境清新，表现隐逸思想和闲适情怀',
    '边塞诗': '描写边塞风光和军旅生活，气势雄浑，表现爱国精神和英雄气概',
    '现实主义': '关注社会现实，反映民生疾苦，具有强烈的批判意识'
  }
  
  let context = contextMap[dynasty] || '该时期诗词具有独特的时代特征和文化背景'
  
  if (literaryStyle && styleMap[literaryStyle]) {
    context += `。${styleMap[literaryStyle]}`
  }
  
  // 深度分析：添加历史背景信息
  if (isDeepAnalysis) {
    const historicalContext: Record<string, string> = {
      '唐': '唐代国力强盛，文化开放，诗歌创作受到社会各阶层的重视',
      '宋': '宋代商品经济发达，市民文化兴起，词作成为重要的文学形式',
      '元': '元代民族融合，文化多元，文学创作呈现新的特点',
      '明': '明代科举制度完善，文人地位提高，文学创作更加规范化',
      '清': '清代文字狱盛行，文人创作更加谨慎，考据学兴起'
    }
    
    if (historicalContext[dynasty]) {
      context += ` ${historicalContext[dynasty]}`
    }
  }
  
  return context
}

function analyzeCulturalContext(dynasty: string, literaryStyle: string): string {
  return analyzeCulturalContextEnhanced(dynasty, literaryStyle, false)
}

// 现代解读函数（增强版）
function generateModernInterpretationEnhanced(content: string, theme: string, mood: string, isDeepAnalysis: boolean): string {
  const interpretations: Record<string, Record<string, string>> = {
    '思乡': {
      '忧伤悲凉': '这首诗表达了游子对故乡的深切思念，在现代社会中同样能引起异地工作求学者的共鸣，提醒我们珍惜亲情和家乡文化',
      '闲适宁静': '通过宁静的笔触描绘故乡美景，提醒现代人关注家乡的文化价值，在快节奏生活中寻找心灵的栖息地',
      '豪放激昂': '豪迈的思乡情怀展现了古人对家乡的深厚感情，激励现代人不忘根本，勇于追求梦想'
    },
    '爱情': {
      '婉约含蓄': '含蓄的情感表达方式，在现代快节奏生活中显得尤为珍贵，教会我们用心感受真挚的情感',
      '豪放激昂': '热烈奔放的爱情宣言，展现了古人真挚的情感世界，启示现代人勇敢追求真爱',
      '忧伤悲凉': '深沉的爱情悲剧，反映了人性的复杂和情感的珍贵，具有永恒的艺术价值'
    },
    '自然': {
      '闲适宁静': '对自然景物的细腻描写，启发现代人重新发现身边的美景，培养审美情趣',
      '豪放激昂': '壮丽的自然景观描写，激发人们对祖国山河的热爱，增强环保意识',
      '清新明快': '清新的自然意象，带给现代人精神上的愉悦和心灵上的净化'
    },
    '人生': {
      '深沉凝重': '对人生的深刻思考，帮助现代人面对生活中的困惑和挑战',
      '闲适宁静': '淡泊的人生态度，为现代人提供了一种精神上的解脱和智慧',
      '豪放激昂': '积极的人生态度，激励现代人勇敢面对困难，追求理想'
    }
  }
  
  const defaultInterpretation = isDeepAnalysis 
    ? '这首诗的深刻内涵在现代社会依然具有重要的启示意义，其艺术价值和思想深度值得我们细细品味和学习，体现了中华文化的博大精深'
    : '这首诗在现代社会依然具有重要的启示意义，值得我们细细品味和学习'
  
  return interpretations[theme]?.[mood] || defaultInterpretation
}

function generateModernInterpretation(content: string, theme: string, mood: string): string {
  return generateModernInterpretationEnhanced(content, theme, mood, false)
}

// 难度评估函数（增强版）
function assessDifficultyLevelEnhanced(content: string, rhetoricalCount: number, isDeepAnalysis: boolean): number {
  let difficulty = 1
  
  // 根据字数评估
  const charCount = content.replace(/[^\u4e00-\u9fff]/g, '').length
  if (charCount > 30) difficulty += 1
  if (charCount > 60) difficulty += 1
  if (charCount > 100) difficulty += 1
  
  // 根据修辞手法数量评估
  if (rhetoricalCount > 2) difficulty += 1
  if (rhetoricalCount > 4) difficulty += 1
  if (rhetoricalCount > 6) difficulty += 1
  
  // 深度分析：考虑典故和历史文化背景
  if (isDeepAnalysis) {
    const hasAllusions = content.match(/典故|古籍|历史|传说|神话/)
    if (hasAllusions) difficulty += 1
    
    const hasComplexImagery = content.match(/隐喻|象征|暗示|双关/)
    if (hasComplexImagery) difficulty += 1
  }
  
  return Math.min(difficulty, 5)
}

function assessDifficultyLevel(content: string, rhetoricalCount: number): number {
  return assessDifficultyLevelEnhanced(content, rhetoricalCount, false)
}

// 推荐阅读函数（增强版）
function generateRecommendedReadingEnhanced(theme: string, mood: string, isDeepAnalysis: boolean): string[] {
  const recommendations: Record<string, Record<string, string[]>> = {
    '思乡': {
      '忧伤悲凉': [
        '《静夜思》- 李白', 
        '《九月九日忆山东兄弟》- 王维', 
        '《乡愁》- 余光中',
        '《天净沙·秋思》- 马致远',
        '《登高》- 杜甫'
      ],
      '闲适宁静': [
        '《归园田居》- 陶渊明', 
        '《山居秋暝》- 王维',
        '《江村》- 杜甫',
        '《过故人庄》- 孟浩然'
      ]
    },
    '爱情': {
      '婉约含蓄': [
        '《相思》- 王维', 
        '《鹊桥仙》- 秦观', 
        '《一剪梅》- 李清照',
        '《长恨歌》- 白居易',
        '《离思》- 元稹'
      ],
      '豪放激昂': [
        '《上邪》- 佚名',
        '《白头吟》- 卓文君',
        '《诗经·关雎》'
      ]
    },
    '自然': {
      '闲适宁静': [
        '《春晓》- 孟浩然', 
        '《江雪》- 柳宗元', 
        '《山行》- 杜牧',
        '《滁州西涧》- 韦应物'
      ],
      '豪放激昂': [
        '《望庐山瀑布》- 李白', 
        '《登高》- 杜甫',
        '《观沧海》- 曹操',
        '《沁园春·雪》- 毛泽东'
      ]
    }
  }
  
  const defaultRecommendations = isDeepAnalysis 
    ? [
        '《唐诗三百首》精选作品',
        '《宋词三百首》经典词作',
        '相关主题的诗词鉴赏专著',
        '古代文学史相关章节',
        '诗词格律与创作技巧'
      ]
    : [
        '《唐诗三百首》精选',
        '《宋词精选》作品',
        '相关主题的经典诗词赏析'
      ]
  
  return recommendations[theme]?.[mood] || defaultRecommendations
}

function generateRecommendedReading(theme: string, mood: string): string[] {
  return generateRecommendedReadingEnhanced(theme, mood, false)
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

// 艺术特色总结函数
function generateArtisticFeaturesSummary(theme: string, mood: string, rhetoricalDevices: string[]): string {
  const featureTemplates = [
    `本诗以${theme}为主题，意境${mood}`,
    `运用了${rhetoricalDevices.join('、')}等修辞手法`,
    `语言精炼，意象生动，情感真挚`,
    `体现了作者高超的艺术造诣和独特的创作风格`
  ]
  
  return featureTemplates.join('，')
}

// 学习建议函数
function generateLearningSuggestions(difficultyLevel: number, theme: string, mood: string): string[] {
  const suggestions = []
  
  if (difficultyLevel <= 2) {
    suggestions.push('适合初学者阅读，可以先从理解字面意思开始')
    suggestions.push('多朗读几遍，感受诗歌的韵律美')
  } else if (difficultyLevel <= 4) {
    suggestions.push('建议结合注释和译文进行理解')
    suggestions.push('可以查阅相关历史背景和作者生平')
    suggestions.push('尝试分析诗歌的结构和修辞手法')
  } else {
    suggestions.push('建议在老师指导下进行深入学习')
    suggestions.push('需要具备一定的文学理论基础')
    suggestions.push('可以对比阅读同类主题的其他作品')
  }
  
  suggestions.push(`重点关注${theme}主题的表达方式`)
  suggestions.push(`体会${mood}意境的营造手法`)
  suggestions.push('多做笔记，记录自己的理解和感悟')
  
  return suggestions
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