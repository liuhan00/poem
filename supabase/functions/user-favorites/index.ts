// 用户收藏管理API - Edge Function
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

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
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // 验证用户身份
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('未授权访问')
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      throw new Error('用户认证失败')
    }

    if (req.method === 'GET') {
      // 获取用户收藏列表
      const { page = 1, limit = 10 } = await req.json()

      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data, error, count } = await supabaseClient
        .from('favorites')
        .select(`
          id,
          created_at,
          poems!inner(
            id,
            title,
            content,
            dynasty,
            tags,
            authors!inner(name)
          )
        `, { count: 'exact' })
        .eq('user_id', user.id)
        .range(from, to)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      // 格式化返回数据
      const favorites = data?.map(fav => ({
        id: fav.id,
        poem: fav.poems,
        created_at: fav.created_at
      })) || []

      return new Response(
        JSON.stringify({
          success: true,
          data: favorites,
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
    } else if (req.method === 'POST') {
      // 添加收藏
      const { poem_id } = await req.json()

      if (!poem_id) {
        throw new Error('诗词ID不能为空')
      }

      const { data, error } = await supabaseClient
        .from('favorites')
        .insert({
          user_id: user.id,
          poem_id: poem_id
        })
        .select()

      if (error) {
        throw error
      }

      return new Response(
        JSON.stringify({
          success: true,
          data: data[0]
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201,
        }
      )
    } else if (req.method === 'DELETE') {
      // 删除收藏
      const { favorite_id } = await req.json()

      if (!favorite_id) {
        throw new Error('收藏ID不能为空')
      }

      const { error } = await supabaseClient
        .from('favorites')
        .delete()
        .eq('id', favorite_id)
        .eq('user_id', user.id)

      if (error) {
        throw error
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: '收藏已删除'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    } else {
      throw new Error('不支持的HTTP方法')
    }
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