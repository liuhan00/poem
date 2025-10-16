// 检查数据库RLS策略
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://iolkcrlsqemuauaopepc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvbGtjcmxzcWVtdWF1YW9wZXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzODYzMTgsImV4cCI6MjA3NTk2MjMxOH0.PQlHOiGeILRossmJQX0CtLLYH5v6kLz9cWzadlE-_H4'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkRLSPolicies() {
  console.log('检查RLS策略...')
  
  try {
    // 测试匿名用户是否能读取诗词数据
    console.log('1. 测试诗词表读取权限...')
    const { data: poems, error: poemsError } = await supabase
      .from('poems')
      .select('*')
      .limit(1)
    
    if (poemsError) {
      console.log('诗词表读取错误:', poemsError)
    } else {
      console.log('诗词表读取成功，数据量:', poems.length)
    }
    
    // 测试作者表读取权限
    console.log('2. 测试作者表读取权限...')
    const { data: authors, error: authorsError } = await supabase
      .from('authors')
      .select('*')
      .limit(1)
    
    if (authorsError) {
      console.log('作者表读取错误:', authorsError)
    } else {
      console.log('作者表读取成功，数据量:', authors.length)
    }
    
    // 测试联合查询
    console.log('3. 测试联合查询权限...')
    const { data: jointData, error: jointError } = await supabase
      .from('poems')
      .select(`
        *,
        authors!inner(name)
      `)
      .limit(1)
    
    if (jointError) {
      console.log('联合查询错误:', jointError)
    } else {
      console.log('联合查询成功，数据量:', jointData.length)
    }
    
    // 检查前端实际调用的查询
    console.log('4. 模拟前端实际查询...')
    const { data: frontendData, error: frontendError } = await supabase
      .from('poems')
      .select(`
        *,
        authors!inner(name)
      `)
      .order('popularity', { ascending: false })
      .limit(6)
    
    if (frontendError) {
      console.log('前端查询错误:', frontendError)
    } else {
      console.log('前端查询成功，数据量:', frontendData.length)
      if (frontendData.length > 0) {
        console.log('第一首诗词:', {
          title: frontendData[0].title,
          author: frontendData[0].authors.name,
          popularity: frontendData[0].popularity
        })
      }
    }
    
  } catch (err) {
    console.error('检查RLS策略过程中出错:', err)
  }
}

checkRLSPolicies()