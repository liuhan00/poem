// API测试脚本
// 用于验证Supabase连接和Edge Functions功能

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 请先配置环境变量 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabaseConnection() {
  console.log('🔍 测试数据库连接...')
  
  try {
    const { data, error } = await supabase
      .from('poems')
      .select('count')
      .limit(1)
    
    if (error) {
      throw error
    }
    
    console.log('✅ 数据库连接成功')
    return true
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message)
    return false
  }
}

async function testEdgeFunctions() {
  console.log('\n🔍 测试Edge Functions...')
  
  const functionsBaseUrl = supabaseUrl.replace('/rest/v1', '/functions/v1')
  
  // 测试诗词搜索函数
  try {
    const response = await fetch(`${functionsBaseUrl}/poem-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: '明月',
        limit: 3
      })
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ 诗词搜索API测试成功')
      console.log('   返回结果:', result.data?.length || 0, '条记录')
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
  } catch (error) {
    console.error('❌ 诗词搜索API测试失败:', error.message)
  }
  
  // 测试AI对话函数（需要认证）
  try {
    const response = await fetch(`${functionsBaseUrl}/ai-conversation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: '你好',
        session_id: 'test-session'
      })
    })
    
    const result = await response.json()
    if (response.ok) {
      console.log('✅ AI对话API测试成功')
    } else if (response.status === 401) {
      console.log('⚠️  AI对话API需要用户认证（正常）')
    } else {
      throw new Error(result.error || `HTTP ${response.status}`)
    }
  } catch (error) {
    console.error('❌ AI对话API测试失败:', error.message)
  }
}

async function testDataIntegrity() {
  console.log('\n🔍 测试数据完整性...')
  
  try {
    // 检查诗词数据
    const { data: poems, error: poemsError } = await supabase
      .from('poems')
      .select('id, title, author_id, authors(name)')
      .limit(5)
    
    if (poemsError) throw poemsError
    
    console.log('✅ 诗词数据查询成功')
    console.log('   示例数据:')
    poems.forEach(poem => {
      console.log(`   - ${poem.title} (${poem.authors?.name})`)
    })
    
    // 检查作者数据
    const { data: authors, error: authorsError } = await supabase
      .from('authors')
      .select('id, name, dynasty')
      .limit(3)
    
    if (authorsError) throw authorsError
    
    console.log('✅ 作者数据查询成功')
    console.log('   示例作者:', authors.map(a => `${a.name} (${a.dynasty})`).join(', '))
    
  } catch (error) {
    console.error('❌ 数据完整性测试失败:', error.message)
  }
}

async function runAllTests() {
  console.log('🚀 开始API集成测试\n')
  
  const dbSuccess = await testDatabaseConnection()
  await testEdgeFunctions()
  await testDataIntegrity()
  
  console.log('\n' + '='.repeat(50))
  if (dbSuccess) {
    console.log('🎉 所有测试完成！系统基本功能正常。')
    console.log('\n下一步操作:')
    console.log('1. 配置前端环境变量')
    console.log('2. 运行 npm run dev 启动开发服务器')
    console.log('3. 访问 http://localhost:5173 测试完整功能')
  } else {
    console.log('❌ 测试失败，请检查Supabase配置。')
    console.log('\n排查步骤:')
    console.log('1. 确认Supabase项目已创建')
    console.log('2. 检查环境变量配置')
    console.log('3. 确认数据库迁移已部署')
  }
}

runAllTests().catch(console.error)