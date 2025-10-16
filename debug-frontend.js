// 调试前端数据加载问题
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://iolkcrlsqemuauaopepc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvbGtjcmxzcWVtdWF1YW9wZXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzODYzMTgsImV4cCI6MjA3NTk2MjMxOH0.PQlHOiGeILRossmJQX0CtLLYH5v6kLz9cWzadlE-_H4'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugFrontend() {
  console.log('调试前端数据加载...')
  
  try {
    // 模拟前端调用getPopularPoems函数
    console.log('1. 模拟前端API调用...')
    
    const result = await getPopularPoems(6)
    console.log('API调用结果:', {
      success: result.success,
      dataLength: result.data ? result.data.length : 0,
      data: result.data
    })
    
    // 检查具体的数据结构
    if (result.data && result.data.length > 0) {
      console.log('2. 检查数据结构:')
      result.data.forEach((poem, index) => {
        console.log(`诗词 ${index + 1}:`, {
          title: poem.title,
          author: poem.author,
          dynasty: poem.dynasty,
          tags: poem.tags,
          popularity: poem.popularity
        })
      })
    }
    
    // 检查是否有错误信息
    if (result.error) {
      console.log('3. 错误信息:', result.error)
    }
    
  } catch (err) {
    console.error('调试过程中出错:', err)
  }
}

// 复制前端的getPopularPoems函数
async function getPopularPoems(limit = 10) {
  try {
    // 首先尝试按热度排序获取
    const { data: popularData, error: popularError } = await supabase
      .from('poems')
      .select(`
        *,
        authors!inner(name)
      `)
      .order('popularity', { ascending: false })
      .limit(limit)

    if (popularError) {
      console.log('按热度排序错误:', popularError)
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

      if (fallbackError) {
        console.log('按创建时间获取错误:', fallbackError)
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

debugFrontend()