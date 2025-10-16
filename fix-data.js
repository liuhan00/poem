// 修复诗词数据问题
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://iolkcrlsqemuauaopepc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvbGtjcmxzcWVtdWF1YW9wZXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzODYzMTgsImV4cCI6MjA3NTk2MjMxOH0.PQlHOiGeILRossmJQX0CtLLYH5v6kLz9cWzadlE-_H4'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function fixData() {
  console.log('检查并修复诗词数据...')
  
  try {
    // 检查作者表
    const { data: authors, error: authorsError } = await supabase
      .from('authors')
      .select('*')
    
    if (authorsError) {
      console.error('获取作者数据错误:', authorsError)
      return
    }
    
    console.log('作者数量:', authors.length)
    console.log('作者数据:', authors)
    
    // 检查诗词表
    const { data: poems, error: poemsError } = await supabase
      .from('poems')
      .select('*, authors(name)')
    
    if (poemsError) {
      console.error('获取诗词数据错误:', poemsError)
      return
    }
    
    console.log('诗词数量:', poems.length)
    console.log('诗词数据（含作者）:', poems)
    
    // 更新诗词的热度值，让热门诗词能正常显示
    const updatePromises = poems.map((poem, index) => {
      return supabase
        .from('poems')
        .update({ popularity: (poems.length - index) * 10 })
        .eq('id', poem.id)
    })
    
    const results = await Promise.all(updatePromises)
    console.log('更新热度结果:', results)
    
    // 验证更新后的数据
    const { data: updatedPoems, error: updatedError } = await supabase
      .from('poems')
      .select('*, authors(name)')
      .order('popularity', { ascending: false })
    
    if (updatedError) {
      console.error('获取更新后数据错误:', updatedError)
      return
    }
    
    console.log('更新后的热门诗词:')
    updatedPoems.forEach(poem => {
      console.log(`- ${poem.title} (${poem.authors.name}): 热度 ${poem.popularity}`)
    })
    
  } catch (err) {
    console.error('修复数据过程中出错:', err)
  }
}

fixData()