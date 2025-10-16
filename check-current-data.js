// 检查当前数据状态
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://iolkcrlsqemuauaopepc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvbGtjcmxzcWVtdWF1YW9wZXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzODYzMTgsImV4cCI6MjA3NTk2MjMxOH0.PQlHOiGeILRossmJQX0CtLLYH5v6kLz9cWzadlE-_H4'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkData() {
  console.log('检查当前数据状态...')
  
  try {
    // 检查诗词数据（包含作者信息）
    const { data: poems, error } = await supabase
      .from('poems')
      .select(`
        *,
        authors!inner(name)
      `)
      .order('popularity', { ascending: false })
    
    if (error) {
      console.error('获取诗词数据错误:', error)
      return
    }
    
    console.log(`找到 ${poems.length} 首诗词:`)
    poems.forEach((poem, index) => {
      console.log(`${index + 1}. ${poem.title} - ${poem.authors.name} (热度: ${poem.popularity})`)
    })
    
    // 检查前端API调用是否能正常工作
    console.log('\n测试前端API调用...')
    
    // 模拟前端调用getPopularPoems函数
    const popularResult = await getPopularPoems(6)
    console.log('热门诗词API调用结果:', popularResult)
    
  } catch (err) {
    console.error('检查数据过程中出错:', err)
  }
}

// 模拟前端的getPopularPoems函数
async function getPopularPoems(limit = 10) {
  try {
    const { data, error } = await supabase
      .from('poems')
      .select(`
        *,
        authors!inner(name)
      `)
      .order('popularity', { ascending: false })
      .limit(limit)

    if (error) throw error

    const poems = data.map(poem => ({
      ...poem,
      author: poem.authors.name
    }))

    return { success: true, data: poems }
  } catch (error) {
    console.error('获取热门诗词失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }
  }
}

checkData()