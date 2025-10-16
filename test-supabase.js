// 测试Supabase连接和诗词数据
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://iolkcrlsqemuauaopepc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvbGtjcmxzcWVtdWF1YW9wZXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzODYzMTgsImV4cCI6MjA3NTk2MjMxOH0.PQlHOiGeILRossmJQX0CtLLYH5v6kLz9cWzadlE-_H4'

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

async function testSupabaseConnection() {
  console.log('测试Supabase连接...')
  
  try {
    // 测试连接
    const { data, error } = await supabase
      .from('poems')
      .select('*')
      .limit(5)
    
    if (error) {
      console.error('Supabase连接错误:', error)
      return
    }
    
    console.log('连接成功! 找到诗词数量:', data.length)
    console.log('诗词数据:', data)
    
    // 检查是否有热门诗词数据
    const { data: popularData, error: popularError } = await supabase
      .from('poems')
      .select('*')
      .order('popularity', { ascending: false })
      .limit(6)
    
    if (popularError) {
      console.error('获取热门诗词错误:', popularError)
      return
    }
    
    console.log('热门诗词数量:', popularData.length)
    console.log('热门诗词:', popularData)
    
  } catch (err) {
    console.error('测试过程中出错:', err)
  }
}

testSupabaseConnection()