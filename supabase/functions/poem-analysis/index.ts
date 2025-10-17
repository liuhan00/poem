// 诗词分析Edge Function
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

    const { poem_id, analysis_type = 'quick' } = await req.json()

    // 获取诗词详情
    const { data: poem } = await supabaseClient
      .from('poems')
      .select('*, authors!inner(*)')
      .eq('id', poem_id)
      .single()

    if (!poem) {
      throw new Error('诗词不存在')
    }

    // 执行AI分析
    const analysisResult = await analyzePoem(poem, analysis_type)

    return new Response(
      JSON.stringify({
        success: true,
        data: analysisResult
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('诗词分析错误:', error)
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

async function analyzePoem(poem: any, analysisType: string) {
  // 基于规则的诗词分析（实际应用中可以使用AI模型）
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