// 主题分布Edge Function
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { dynasty, author, time_period } = await req.json()

    // 获取主题分布数据
    const themeDistribution = await getThemeDistribution(supabaseClient, {
      dynasty,
      author,
      time_period
    })

    return new Response(
      JSON.stringify({
        success: true,
        data: themeDistribution
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('主题分布查询错误:', error)
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

async function getThemeDistribution(supabase: any, params: any): Promise<Record<string, number>> {
  const { dynasty, author, time_period } = params
  
  let query = supabase
    .from('poems')
    .select('tags')

  // 应用筛选条件
  if (dynasty) {
    query = query.eq('dynasty', dynasty)
  }
  
  if (author) {
    const { data: authorData } = await supabase
      .from('authors')
      .select('id')
      .eq('name', author)
      .single()
    
    if (authorData) {
      query = query.eq('author_id', authorData.id)
    }
  }

  const { data: poems } = await query

  if (!poems || poems.length === 0) {
    return {}
  }

  // 统计主题分布
  const themeCounts: Record<string, number> = {}
  let totalThemes = 0

  poems.forEach((poem: any) => {
    if (poem.tags && Array.isArray(poem.tags)) {
      poem.tags.forEach((tag: string) => {
        themeCounts[tag] = (themeCounts[tag] || 0) + 1
        totalThemes++
      })
    }
  })

  // 计算百分比
  const themeDistribution: Record<string, number> = {}
  Object.entries(themeCounts).forEach(([theme, count]) => {
    themeDistribution[theme] = (count / totalThemes) * 100
  })

  return themeDistribution
}