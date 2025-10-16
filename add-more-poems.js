// 添加更多诗词数据
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://iolkcrlsqemuauaopepc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvbGtjcmxzcWVtdWF1YW9wZXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzODYzMTgsImV4cCI6MjA3NTk2MjMxOH0.PQlHOiGeILRossmJQX0CtLLYH5v6kLz9cWzadlE-_H4'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function addMorePoems() {
  console.log('添加更多诗词数据...')
  
  try {
    // 获取现有作者
    const { data: authors, error: authorsError } = await supabase
      .from('authors')
      .select('*')
    
    if (authorsError) {
      console.error('获取作者数据错误:', authorsError)
      return
    }
    
    console.log('现有作者:', authors.map(a => a.name))
    
    // 添加更多诗词
    const newPoems = [
      {
        title: '春晓',
        author: '孟浩然',
        dynasty: '唐',
        content: '春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。',
        tags: ['春天', '田园', '自然'],
        popularity: 85
      },
      {
        title: '登鹳雀楼',
        author: '王之涣',
        dynasty: '唐',
        content: '白日依山尽，黄河入海流。欲穷千里目，更上一层楼。',
        tags: ['登高', '哲理', '壮阔'],
        popularity: 90
      },
      {
        title: '水调歌头',
        author: '苏轼',
        dynasty: '宋',
        content: '明月几时有？把酒问青天。不知天上宫阙，今夕是何年。',
        tags: ['中秋', '怀人', '哲理'],
        popularity: 95
      },
      {
        title: '相思',
        author: '王维',
        dynasty: '唐',
        content: '红豆生南国，春来发几枝。愿君多采撷，此物最相思。',
        tags: ['爱情', '思念', '红豆'],
        popularity: 80
      },
      {
        title: '江雪',
        author: '柳宗元',
        dynasty: '唐',
        content: '千山鸟飞绝，万径人踪灭。孤舟蓑笠翁，独钓寒江雪。',
        tags: ['冬天', '孤独', '山水'],
        popularity: 75
      }
    ]
    
    // 为每首诗词查找或创建作者
    for (const poemData of newPoems) {
      let authorId = null
      
      // 查找作者
      const { data: existingAuthor } = await supabase
        .from('authors')
        .select('id')
        .eq('name', poemData.author)
        .single()
      
      if (existingAuthor) {
        authorId = existingAuthor.id
      } else {
        // 创建新作者
        const { data: newAuthor, error: createError } = await supabase
          .from('authors')
          .insert({
            name: poemData.author,
            dynasty: poemData.dynasty
          })
          .select()
          .single()
        
        if (createError) {
          console.error(`创建作者 ${poemData.author} 失败:`, createError)
          continue
        }
        authorId = newAuthor.id
        console.log(`创建新作者: ${poemData.author}`)
      }
      
      // 检查诗词是否已存在
      const { data: existingPoem } = await supabase
        .from('poems')
        .select('id')
        .eq('title', poemData.title)
        .eq('author_id', authorId)
        .single()
      
      if (existingPoem) {
        console.log(`诗词 "${poemData.title}" 已存在，跳过`)
        continue
      }
      
      // 插入诗词
      const { error: poemError } = await supabase
        .from('poems')
        .insert({
          title: poemData.title,
          author_id: authorId,
          dynasty: poemData.dynasty,
          content: poemData.content,
          tags: poemData.tags,
          popularity: poemData.popularity,
          difficulty_level: 1
        })
      
      if (poemError) {
        console.error(`插入诗词 "${poemData.title}" 失败:`, poemError)
      } else {
        console.log(`成功添加诗词: ${poemData.title} - ${poemData.author}`)
      }
    }
    
    // 更新现有诗词的热度
    const updateResult = await supabase
      .from('poems')
      .update({ popularity: 100 })
      .eq('title', '静夜思')
    
    console.log('更新静夜思热度结果:', updateResult)
    
    // 验证数据
    const { data: allPoems, error: finalError } = await supabase
      .from('poems')
      .select('*, authors(name)')
      .order('popularity', { ascending: false })
    
    if (finalError) {
      console.error('获取最终数据错误:', finalError)
      return
    }
    
    console.log('最终诗词数据 (按热度排序):')
    allPoems.forEach(poem => {
      console.log(`- ${poem.title} (${poem.authors.name}): 热度 ${poem.popularity}`)
    })
    
    console.log(`总共 ${allPoems.length} 首诗词`)
    
  } catch (err) {
    console.error('添加诗词过程中出错:', err)
  }
}

addMorePoems()