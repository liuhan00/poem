// 测试随机诗词功能
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function testRandomPoem() {
  console.log('测试随机诗词功能...')
  
  // 1. 测试获取诗词数据
  try {
    const { data: poems, error } = await supabase
      .from('poems')
      .select(`
        *,
        authors!inner(name)
      `)
      .limit(10)

    if (error) {
      console.error('获取诗词数据失败:', error)
      return
    }

    console.log(`获取到 ${poems.length} 首诗词:`)
    poems.forEach((poem, index) => {
      console.log(`${index + 1}. ${poem.title} - ${poem.authors.name} (ID: ${poem.id})`)
    })

    // 2. 测试随机选择
    if (poems.length > 0) {
      const randomIndex = Math.floor(Math.random() * poems.length)
      const randomPoem = poems[randomIndex]
      console.log(`\n随机选择的诗词: ${randomPoem.title} (ID: ${randomPoem.id})`)
      
      // 3. 测试诗词详情获取
      const { data: poemDetail, error: detailError } = await supabase
        .from('poems')
        .select(`
          *,
          authors!inner(name)
        `)
        .eq('id', randomPoem.id)
        .single()

      if (detailError) {
        console.error('获取诗词详情失败:', detailError)
      } else {
        console.log('诗词详情获取成功:', poemDetail.title)
      }
    }
  } catch (error) {
    console.error('测试失败:', error)
  }
}

testRandomPoem()