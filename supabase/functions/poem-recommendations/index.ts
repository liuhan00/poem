// 诗词推荐API - Edge Function
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

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
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { limit = 10, based_on } = await req.json()

    // 验证用户身份
    const authHeader = req.headers.get('Authorization')
    let userId: string | null = null
    
    if (authHeader) {
      const { data: { user } } = await supabaseClient.auth.getUser()
      userId = user?.id || null
    }

    let recommendationsQuery

    if (based_on === 'popular') {
      // 基于热门度推荐
      recommendationsQuery = supabaseClient
        .from('poems')
        .select(`
          id,
          title,
          content,
          dynasty,
          tags,
          difficulty_level,
          popularity,
          authors!inner(name)
        `)
        .order('popularity', { ascending: false })
        .limit(limit)
    } else if (based_on === 'user_preferences' && userId) {
      // 基于用户偏好推荐
      const { data: userProfile } = await supabaseClient
        .from('profiles')
        .select('preferred_dynasties, preferred_themes, learning_level')
        .eq('id', userId)
        .single()

      if (userProfile) {
        recommendationsQuery = supabaseClient
          .from('poems')
          .select(`
            id,
            title,
            content,
            dynasty,
            tags,
            difficulty_level,
            popularity,
            authors!inner(name)
          `)

        // 添加偏好过滤
        if (userProfile.preferred_dynasties && userProfile.preferred_dynasties.length > 0) {
          recommendationsQuery = recommendationsQuery.in('dynasty', userProfile.preferred_dynasties)
        }

        if (userProfile.preferred_themes && userProfile.preferred_themes.length > 0) {
          recommendationsQuery = recommendationsQuery.overlaps('tags', userProfile.preferred_themes)
        }

        // 根据学习水平调整难度
        const targetDifficulty = Math.min(userProfile.learning_level, 5)
        recommendationsQuery = recommendationsQuery
          .lte('difficulty_level', targetDifficulty)
          .order('popularity', { ascending: false })
          .limit(limit)
      } else {
        // 如果没有用户偏好，返回热门推荐
        recommendationsQuery = supabaseClient
          .from('poems')
          .select(`
            id,
            title,
            content,
            dynasty,
            tags,
            difficulty_level,
            popularity,
            authors!inner(name)
          `)
          .order('popularity', { ascending: false })
          .limit(limit)
      }
    } else {
      // 默认推荐逻辑
      recommendationsQuery = supabaseClient
        .from('poems')
        .select(`
          id,
          title,
          content,
          dynasty,
          tags,
          difficulty_level,
          popularity,
          authors!inner(name)
        `)
        .order('popularity', { ascending: false })
        .limit(limit)
    }

    const { data, error } = await recommendationsQuery

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: data || []
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})