// 智能搜索Edge Function
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { query, search_type = 'hybrid', filters = {}, limit = 20 } = await req.json()

    // 分析搜索意图
    const intentAnalysis = await analyzeSearchIntent(query)
    
    // 执行搜索
    const searchResults = await performIntelligentSearch(supabaseClient, {
      query,
      search_type,
      filters,
      limit,
      intent: intentAnalysis
    })

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          ...searchResults,
          search_intent: intentAnalysis.intent,
          confidence_score: intentAnalysis.confidence
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('智能搜索错误:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

async function analyzeSearchIntent(query: string) {
  // 简单的意图分析规则（实际应用中可以使用更复杂的NLP模型）
  const intentPatterns = [
    {
      pattern: /(月亮|明月|月光).*(思乡|故乡|家乡)/,
      intent: '寻找描写月亮的思乡诗',
      confidence: 0.9
    },
    {
      pattern: /(李白|杜甫|苏轼).*(豪放|奔放|雄浑)/,
      intent: '搜索特定作者的风格作品',
      confidence: 0.85
    },
    {
      pattern: /(宋代|宋朝).*(婉约|细腻|柔情)/,
      intent: '搜索特定朝代的风格作品',
      confidence: 0.8
    },
    {
      pattern: /(山水|田园|自然).*(诗|词)/,
      intent: '搜索山水田园题材的诗词',
      confidence: 0.75
    },
    {
      pattern: /(爱情|相思|恋人)/,
      intent: '搜索爱情主题的诗词',
      confidence: 0.8
    },
    {
      pattern: /(人生|时光|岁月).*(感慨|感悟)/,
      intent: '搜索人生感慨主题的诗词',
      confidence: 0.7
    }
  ]

  for (const pattern of intentPatterns) {
    if (pattern.pattern.test(query)) {
      return {
        intent: pattern.intent,
        confidence: pattern.confidence,
        related_concepts: extractRelatedConcepts(query)
      }
    }
  }

  // 默认意图分析
  return {
    intent: `搜索"${query}"相关的诗词`,
    confidence: 0.5,
    related_concepts: extractRelatedConcepts(query)
  }
}

function extractRelatedConcepts(query: string): string[] {
  const concepts = new Set<string>()
  
  // 提取朝代
  const dynasties = ['唐', '宋', '元', '明', '清', '现代']
  dynasties.forEach(dynasty => {
    if (query.includes(dynasty)) concepts.add(dynasty)
  })

  // 提取常见主题
  const themes = ['思乡', '爱情', '自然', '人生', '豪放', '婉约', '山水', '田园', '战争', '离别']
  themes.forEach(theme => {
    if (query.includes(theme)) concepts.add(theme)
  })

  // 提取常见意象
  const images = ['月亮', '山水', '花鸟', '春风', '秋雨', '长江', '黄河']
  images.forEach(image => {
    if (query.includes(image)) concepts.add(image)
  })

  return Array.from(concepts)
}

async function performIntelligentSearch(supabase: any, params: any) {
  const { query, search_type, filters, limit, intent } = params
  
  let poems: any[] = []
  let authors: any[] = []

  // 根据搜索类型执行不同的搜索策略
  switch (search_type) {
    case 'semantic':
      poems = await semanticSearch(supabase, query, filters, limit)
      break
    case 'keyword':
      poems = await keywordSearch(supabase, query, filters, limit)
      break
    case 'hybrid':
    default:
      const semanticResults = await semanticSearch(supabase, query, filters, Math.ceil(limit * 0.7))
      const keywordResults = await keywordSearch(supabase, query, filters, Math.ceil(limit * 0.3))
      poems = [...semanticResults, ...keywordResults]
      // 去重
      poems = poems.filter((poem, index, self) => 
        index === self.findIndex(p => p.id === poem.id)
      ).slice(0, limit)
      break
  }

  // 获取相关作者信息
  if (poems.length > 0) {
    const authorIds = [...new Set(poems.map(p => p.author_id))]
    authors = await getAuthorsByIds(supabase, authorIds)
  }

  // 提取主题分布
  const themes = extractThemesFromResults(poems)

  return {
    poems,
    authors,
    themes,
    related_concepts: intent.related_concepts
  }
}

async function semanticSearch(supabase: any, query: string, filters: any, limit: number) {
  // 简单的语义搜索实现（实际可以使用向量搜索）
  const { data: allPoems } = await supabase
    .from('poems')
    .select('*, authors!inner(name, dynasty)')
    .limit(100) // 先获取较多数据用于语义匹配

  if (!allPoems) return []

  // 简单的语义匹配算法
  const scoredPoems = allPoems.map(poem => {
    let score = 0
    
    // 标题匹配
    if (poem.title.includes(query)) score += 3
    
    // 内容匹配
    const contentMatch = poem.content.includes(query) ? 2 : 0
    score += contentMatch
    
    // 作者匹配
    if (poem.authors.name.includes(query)) score += 2
    
    // 标签匹配
    if (poem.tags && Array.isArray(poem.tags)) {
      const tagMatch = poem.tags.some(tag => tag.includes(query)) ? 1 : 0
      score += tagMatch
    }
    
    // 应用筛选条件
    if (filters.dynasty && filters.dynasty.length > 0) {
      if (!filters.dynasty.includes(poem.authors.dynasty)) score = -1
    }
    
    if (filters.author && filters.author.length > 0) {
      if (!filters.author.includes(poem.authors.name)) score = -1
    }
    
    if (filters.theme && filters.theme.length > 0) {
      if (!poem.tags || !poem.tags.some(tag => filters.theme.includes(tag))) {
        score = -1
      }
    }
    
    if (filters.difficulty_level) {
      const [min, max] = filters.difficulty_level
      if (poem.difficulty_level < min || poem.difficulty_level > max) {
        score = -1
      }
    }
    
    return { ...poem, score }
  })
  
  // 过滤并排序
  return scoredPoems
    .filter(poem => poem.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(poem => ({
      ...poem,
      author: poem.authors.name,
      dynasty: poem.authors.dynasty
    }))
}

async function keywordSearch(supabase: any, query: string, filters: any, limit: number) {
  let queryBuilder = supabase
    .from('poems')
    .select('*, authors!inner(name, dynasty)')
    .or(`title.ilike.%${query}%,content.ilike.%${query}%,authors.name.ilike.%${query}%`)

  // 应用筛选条件
  if (filters.dynasty && filters.dynasty.length > 0) {
    queryBuilder = queryBuilder.in('authors.dynasty', filters.dynasty)
  }
  
  if (filters.author && filters.author.length > 0) {
    queryBuilder = queryBuilder.in('authors.name', filters.author)
  }
  
  if (filters.theme && filters.theme.length > 0) {
    queryBuilder = queryBuilder.overlaps('tags', filters.theme)
  }
  
  if (filters.difficulty_level) {
    const [min, max] = filters.difficulty_level
    queryBuilder = queryBuilder.gte('difficulty_level', min).lte('difficulty_level', max)
  }

  const { data: poems } = await queryBuilder.limit(limit)

  return poems ? poems.map(poem => ({
    ...poem,
    author: poem.authors.name,
    dynasty: poem.authors.dynasty
  })) : []
}

async function getAuthorsByIds(supabase: any, authorIds: string[]) {
  if (authorIds.length === 0) return []
  
  const { data: authors } = await supabase
    .from('authors')
    .select('*')
    .in('id', authorIds)

  return authors || []
}

function extractThemesFromResults(poems: any[]): string[] {
  const themeCounts: Record<string, number> = {}
  
  poems.forEach(poem => {
    if (poem.tags && Array.isArray(poem.tags)) {
      poem.tags.forEach((tag: string) => {
        themeCounts[tag] = (themeCounts[tag] || 0) + 1
      })
    }
  })
  
  // 返回出现次数最多的前5个主题
  return Object.entries(themeCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([theme]) => theme)
}