// AI对话API - Edge Function
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

    const { message, session_id } = await req.json()
    
    // 验证用户身份
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('未授权访问')
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      throw new Error('用户认证失败')
    }

    // 保存用户消息
    await supabaseClient
      .from('ai_conversations')
      .insert({
        user_id: user.id,
        session_id: session_id || crypto.randomUUID(),
        message_type: 'user',
        content: message,
        metadata: {
          timestamp: new Date().toISOString()
        }
      })

    // 模拟AI回复（实际项目中这里会调用真实的AI服务）
    const aiResponse = await generateAIResponse(message, user.id)

    // 保存AI回复
    await supabaseClient
      .from('ai_conversations')
      .insert({
        user_id: user.id,
        session_id: session_id,
        message_type: 'ai',
        content: aiResponse,
        metadata: {
          timestamp: new Date().toISOString(),
          response_time: '1.2s'
        }
      })

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          response: aiResponse,
          session_id: session_id
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

// 模拟AI回复生成函数
async function generateAIResponse(userMessage: string, userId: string): Promise<string> {
  // 这里应该是调用真实AI服务的逻辑
  // 目前使用简单的规则匹配
  
  const lowerMessage = userMessage.toLowerCase()
  
  if (lowerMessage.includes('静夜思') || lowerMessage.includes('李白')) {
    return `《静夜思》是唐代诗人李白的代表作之一，通过描绘月夜思乡的场景，表达了游子对故乡的深切思念。诗中"床前明月光，疑是地上霜"运用了比喻手法，将月光比作寒霜，营造出清冷孤寂的意境。`
  }
  
  if (lowerMessage.includes('唐诗') || lowerMessage.includes('唐代')) {
    return `唐诗是中国古典诗歌的黄金时代，分为初唐、盛唐、中唐、晚唐四个时期。代表诗人有李白（诗仙）、杜甫（诗圣）、王维（诗佛）等。唐诗题材广泛，格律严谨，对后世影响深远。`
  }
  
  if (lowerMessage.includes('格律') || lowerMessage.includes('押韵')) {
    return `诗词格律主要包括平仄、对仗、押韵等规则。唐诗以五言、七言为主，宋词则有固定的词牌格式。学习格律有助于更好地欣赏和创作诗词作品。`
  }
  
  return `感谢您的提问！关于"${userMessage}"，这是一个很有深度的问题。作为诗词AI助手，我可以为您提供详细的解析、创作背景、艺术特色等方面的信息。您是否希望我针对某个具体方面进行更深入的讲解？`
}