// 相关概念Edge Function
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { concept, relationship_type = 'thematic', limit = 10 } = await req.json()

    // 基于概念的关系网络分析
    const relatedConcepts = await findRelatedConcepts(concept, relationship_type, limit)

    return new Response(
      JSON.stringify({
        success: true,
        data: relatedConcepts
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('相关概念查询错误:', error)
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

async function findRelatedConcepts(concept: string, relationshipType: string, limit: number): Promise<string[]> {
  // 概念关系数据库（实际应用中可以从数据库或知识图谱中查询）
  const conceptRelations: Record<string, Record<string, string[]>> = {
    thematic: {
      '月亮': ['思乡', '团圆', '夜晚', '孤独', '浪漫'],
      '思乡': ['故乡', '游子', '离别', '月亮', '秋天'],
      '爱情': ['相思', '恋人', '离别', '忠诚', '浪漫'],
      '自然': ['山水', '花鸟', '季节', '田园', '风景'],
      '人生': ['时光', '命运', '感慨', '哲理', '成长'],
      '豪放': ['奔放', '雄浑', '壮阔', '激昂', '大气'],
      '婉约': ['细腻', '柔情', '含蓄', '缠绵', '柔美']
    },
    temporal: {
      '唐': ['盛唐', '中唐', '晚唐', '李白', '杜甫', '王维'],
      '宋': ['北宋', '南宋', '苏轼', '李清照', '辛弃疾', '陆游'],
      '元': ['元曲', '杂剧', '关汉卿', '马致远', '白朴'],
      '明': ['明代', '唐诗', '宋词', '文学复古', '小说'],
      '清': ['清代', '诗词', '文学', '文化', '传统']
    },
    stylistic: {
      '李白': ['豪放', '浪漫', '诗歌', '唐代', '诗仙'],
      '杜甫': ['现实', '沉郁', '诗歌', '唐代', '诗圣'],
      '苏轼': ['豪放', '词人', '宋代', '文学', '书法'],
      '李清照': ['婉约', '词人', '宋代', '女性', '才女'],
      '王维': ['山水', '田园', '诗歌', '唐代', '诗佛']
    }
  }

  const relations = conceptRelations[relationshipType]
  if (!relations) return []

  // 查找直接相关概念
  const directRelated = relations[concept] || []
  
  // 查找间接相关概念（通过共同关系）
  const indirectRelated: string[] = []
  for (const [relatedConcept, relatedList] of Object.entries(relations)) {
    if (relatedConcept !== concept && relatedList.includes(concept)) {
      indirectRelated.push(relatedConcept)
    }
  }

  // 合并并去重
  const allRelated = [...new Set([...directRelated, ...indirectRelated])]
  
  return allRelated.slice(0, limit)
}