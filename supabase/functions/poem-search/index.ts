// 诗词搜索API - Edge Function
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 处理CORS预检请求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { query, dynasty, author, tags, page = 1, limit = 10 } = await req.json()

    // 构建查询条件
    let supabaseQuery = supabaseClient
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
      `, { count: 'exact' })

    // 添加搜索条件
    if (query) {
      supabaseQuery = supabaseQuery.ilike('title', `%${query}%`)
    }

    if (dynasty) {
      supabaseQuery = supabaseQuery.eq('dynasty', dynasty)
    }

    if (author) {
      supabaseQuery = supabaseQuery.ilike('authors.name', `%${author}%`)
    }

    if (tags && tags.length > 0) {
      supabaseQuery = supabaseQuery.overlaps('tags', tags)
    }

    // 执行分页查询
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await supabaseQuery
      .range(from, to)
      .order('popularity', { ascending: false })

    if (error) {
      throw error
    }

    // 记录搜索行为（如果用户已登录）
    const authHeader = req.headers.get('Authorization')
    if (authHeader) {
      const { data: { user } } = await supabaseClient.auth.getUser()
      if (user) {
        await supabaseClient
          .from('search_history')
          .insert({
            user_id: user.id,
            query: query || '',
            result_count: count || 0
          })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / limit)
        }
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