// 知识图谱Edge Function
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { center_node_id, center_node_type, depth = 2, limit = 50 } = await req.json()

    // 构建知识图谱数据
    const graphData = await buildKnowledgeGraph(supabaseClient, {
      center_node_id,
      center_node_type,
      depth,
      limit
    })

    return new Response(
      JSON.stringify({
        success: true,
        data: graphData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('知识图谱生成错误:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

async function buildKnowledgeGraph(supabase: any, params: any) {
  const { center_node_id, center_node_type, depth, limit } = params
  const nodes = new Map()
  const edges = new Set()

  // 如果指定了中心节点，从该节点开始构建
  if (center_node_id && center_node_type) {
    await expandFromCenterNode(supabase, nodes, edges, center_node_id, center_node_type, depth, limit)
  } else {
    // 否则构建全局知识图谱
    await buildGlobalGraph(supabase, nodes, edges, limit)
  }

  return {
    nodes: Array.from(nodes.values()),
    edges: Array.from(edges)
  }
}

async function expandFromCenterNode(supabase: any, nodes: Map<string, any>, edges: Set<any>, 
                                  nodeId: string, nodeType: string, depth: number, limit: number) {
  if (depth <= 0) return

  // 获取中心节点信息
  let centerNode
  switch (nodeType) {
    case 'poem':
      centerNode = await getPoemNode(supabase, nodeId)
      break
    case 'author':
      centerNode = await getAuthorNode(supabase, nodeId)
      break
    case 'dynasty':
      centerNode = await getDynastyNode(nodeId)
      break
    case 'theme':
      centerNode = await getThemeNode(nodeId)
      break
  }

  if (!centerNode) return

  nodes.set(centerNode.id, centerNode)

  // 获取相关节点
  const relatedNodes = await getRelatedNodes(supabase, nodeType, nodeId, limit)

  for (const relatedNode of relatedNodes) {
    if (nodes.size >= limit) break

    const relationType = determineRelationType(nodeType, relatedNode.type)
    const edge = createEdge(centerNode.id, relatedNode.id, relationType)

    edges.add(edge)
    nodes.set(relatedNode.id, relatedNode)

    // 递归扩展
    await expandFromCenterNode(supabase, nodes, edges, relatedNode.id, relatedNode.type, depth - 1, limit)
  }
}

async function buildGlobalGraph(supabase: any, nodes: Map<string, any>, edges: Set<any>, limit: number) {
  // 获取热门诗词作为种子节点
  const { data: popularPoems } = await supabase
    .from('poems')
    .select('id, title, author_id, dynasty, popularity')
    .order('popularity', { ascending: false })
    .limit(Math.min(10, limit / 4))

  if (!popularPoems) return

  for (const poem of popularPoems) {
    if (nodes.size >= limit) break

    const poemNode = await getPoemNode(supabase, poem.id)
    if (poemNode) {
      nodes.set(poemNode.id, poemNode)

      // 获取作者节点
      const authorNode = await getAuthorNode(supabase, poem.author_id)
      if (authorNode && nodes.size < limit) {
        nodes.set(authorNode.id, authorNode)
        edges.add(createEdge(poemNode.id, authorNode.id, '作者'))
      }

      // 获取朝代节点
      const dynastyNode = getDynastyNode(poem.dynasty)
      if (dynastyNode && nodes.size < limit) {
        nodes.set(dynastyNode.id, dynastyNode)
        edges.add(createEdge(poemNode.id, dynastyNode.id, '朝代'))
      }

      // 获取主题节点（从标签中提取）
      if (poem.tags && Array.isArray(poem.tags)) {
        for (const tag of poem.tags) {
          if (nodes.size >= limit) break
          const themeNode = getThemeNode(tag)
          if (themeNode) {
            nodes.set(themeNode.id, themeNode)
            edges.add(createEdge(poemNode.id, themeNode.id, '主题'))
          }
        }
      }
    }
  }
}

async function getPoemNode(supabase: any, poemId: string) {
  const { data: poem } = await supabase
    .from('poems')
    .select('*')
    .eq('id', poemId)
    .single()

  if (!poem) return null

  return {
    id: poem.id,
    type: 'poem',
    label: poem.title,
    properties: {
      author: poem.author_id,
      dynasty: poem.dynasty,
      content: poem.content.substring(0, 50) + '...',
      tags: poem.tags,
      difficulty: poem.difficulty_level,
      popularity: poem.popularity
    },
    size: Math.max(poem.popularity / 10, 5),
    color: '#ff6b6b'
  }
}

async function getAuthorNode(supabase: any, authorId: string) {
  const { data: author } = await supabase
    .from('authors')
    .select('*')
    .eq('id', authorId)
    .single()

  if (!author) return null

  return {
    id: author.id,
    type: 'author',
    label: author.name,
    properties: {
      dynasty: author.dynasty,
      biography: author.biography?.substring(0, 100) + '...',
      literary_style: author.literary_style,
      achievements: author.achievements
    },
    size: 8,
    color: '#4ecdc4'
  }
}

function getDynastyNode(dynasty: string) {
  return {
    id: `dynasty_${dynasty}`,
    type: 'dynasty',
    label: dynasty,
    properties: {
      period: getDynastyPeriod(dynasty)
    },
    size: 6,
    color: '#45b7d1'
  }
}

function getThemeNode(theme: string) {
  return {
    id: `theme_${theme}`,
    type: 'theme',
    label: theme,
    properties: {},
    size: 4,
    color: '#96ceb4'
  }
}

function getDynastyPeriod(dynasty: string): string {
  const periods: Record<string, string> = {
    '唐': '618-907年',
    '宋': '960-1279年',
    '元': '1271-1368年',
    '明': '1368-1644年',
    '清': '1644-1912年',
    '现代': '1912年至今'
  }
  return periods[dynasty] || '未知'
}

async function getRelatedNodes(supabase: any, sourceType: string, sourceId: string, limit: number) {
  const relatedNodes = []

  switch (sourceType) {
    case 'poem':
      // 获取同作者的其他诗词
      const { data: sameAuthorPoems } = await supabase
        .from('poems')
        .select('id, title, author_id')
        .eq('author_id', sourceId)
        .limit(limit)
        .neq('id', sourceId)

      if (sameAuthorPoems) {
        for (const poem of sameAuthorPoems) {
          relatedNodes.push(await getPoemNode(supabase, poem.id))
        }
      }
      break

    case 'author':
      // 获取该作者的诗词
      const { data: authorPoems } = await supabase
        .from('poems')
        .select('id')
        .eq('author_id', sourceId)
        .limit(limit)

      if (authorPoems) {
        for (const poem of authorPoems) {
          relatedNodes.push(await getPoemNode(supabase, poem.id))
        }
      }

      // 获取同时代的其他作者
      const { data: authorInfo } = await supabase
        .from('authors')
        .select('dynasty')
        .eq('id', sourceId)
        .single()

      if (authorInfo) {
        const { data: sameDynastyAuthors } = await supabase
          .from('authors')
          .select('id, name')
          .eq('dynasty', authorInfo.dynasty)
          .limit(limit)
          .neq('id', sourceId)

        if (sameDynastyAuthors) {
          for (const author of sameDynastyAuthors) {
            relatedNodes.push(await getAuthorNode(supabase, author.id))
          }
        }
      }
      break

    case 'dynasty':
      // 获取该朝代的作者
      const dynasty = sourceId.replace('dynasty_', '')
      const { data: dynastyAuthors } = await supabase
        .from('authors')
        .select('id')
        .eq('dynasty', dynasty)
        .limit(limit)

      if (dynastyAuthors) {
        for (const author of dynastyAuthors) {
          relatedNodes.push(await getAuthorNode(supabase, author.id))
        }
      }
      break
  }

  return relatedNodes.filter(node => node !== null)
}

function determineRelationType(sourceType: string, targetType: string): string {
  const relations: Record<string, Record<string, string>> = {
    poem: {
      author: '作者',
      dynasty: '朝代',
      theme: '主题'
    },
    author: {
      poem: '作品',
      dynasty: '所属朝代'
    },
    dynasty: {
      author: '包含作者'
    },
    theme: {
      poem: '相关诗词'
    }
  }
  return relations[sourceType]?.[targetType] || '相关'
}

function createEdge(source: string, target: string, type: string) {
  return {
    id: `${source}_${target}_${type}`,
    source,
    target,
    type,
    label: type,
    weight: 1
  }
}