// AI服务配置和工具函数

export interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: Date
}

export interface AIResponse {
  content: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  model?: string
}

// AI服务基类
export abstract class AIService {
  protected apiKey: string
  protected baseURL: string

  constructor(apiKey: string, baseURL: string) {
    this.apiKey = apiKey
    this.baseURL = baseURL
  }

  abstract chat(messages: AIMessage[]): Promise<AIResponse>
  abstract generateEmbedding(text: string): Promise<number[]>
}

// OpenAI服务实现
export class OpenAIService extends AIService {
  constructor(apiKey: string) {
    super(apiKey, 'https://api.openai.com/v1')
  }

  async chat(messages: AIMessage[]): Promise<AIResponse> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          temperature: 0.7,
          max_tokens: 1000
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      return {
        content: data.choices[0].message.content,
        usage: data.usage,
        model: data.model
      }
    } catch (error) {
      console.error('OpenAI chat error:', error)
      throw error
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch(`${this.baseURL}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'text-embedding-ada-002',
          input: text
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI Embedding API error: ${response.status}`)
      }

      const data = await response.json()
      return data.data[0].embedding
    } catch (error) {
      console.error('OpenAI embedding error:', error)
      throw error
    }
  }
}

// 文心一言服务实现
export class WenxinService extends AIService {
  constructor(apiKey: string) {
    super(apiKey, 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop')
  }

  async chat(messages: AIMessage[]): Promise<AIResponse> {
    // 文心一言API实现
    // 这里需要根据百度文心一言的实际API格式来实现
    throw new Error('Wenxin service not implemented yet')
  }

  async generateEmbedding(text: string): Promise<number[]> {
    // 文心一言嵌入API实现
    throw new Error('Wenxin embedding service not implemented yet')
  }
}

// AI服务管理器
export class AIServiceManager {
  private services: Map<string, AIService> = new Map()
  private defaultService: string = 'openai'

  constructor() {
    // 初始化AI服务
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY
    if (openaiKey) {
      this.services.set('openai', new OpenAIService(openaiKey))
    }

    const wenxinKey = import.meta.env.VITE_WENXIN_API_KEY
    if (wenxinKey) {
      this.services.set('wenxin', new WenxinService(wenxinKey))
    }
  }

  getService(name?: string): AIService {
    const serviceName = name || this.defaultService
    const service = this.services.get(serviceName)
    
    if (!service) {
      throw new Error(`AI service '${serviceName}' not found or not configured`)
    }
    
    return service
  }

  async chat(messages: AIMessage[], serviceName?: string): Promise<AIResponse> {
    const service = this.getService(serviceName)
    return await service.chat(messages)
  }

  async generateEmbedding(text: string, serviceName?: string): Promise<number[]> {
    const service = this.getService(serviceName)
    return await service.generateEmbedding(text)
  }

  // 智能路由：根据任务类型选择最合适的AI服务
  async smartChat(messages: AIMessage[], taskType: 'simple' | 'complex' | 'creative' = 'simple'): Promise<AIResponse> {
    let serviceName = this.defaultService

    // 根据任务类型选择服务
    switch (taskType) {
      case 'simple':
        serviceName = 'openai' // 简单任务使用GPT-3.5
        break
      case 'complex':
        serviceName = 'openai' // 复杂任务使用GPT-4
        break
      case 'creative':
        serviceName = 'wenxin' // 创作任务使用文心一言
        break
    }

    return await this.chat(messages, serviceName)
  }
}

// 导出单例实例
export const aiManager = new AIServiceManager()

// 诗词相关的AI提示词模板
export const PoemPrompts = {
  // 诗词鉴赏提示词
  appreciation: (poem: string, author: string, dynasty: string) => `
请作为一位资深的诗词专家，对以下诗词进行深度鉴赏分析：

诗词：${poem}
作者：${author}
朝代：${dynasty}

请从以下几个方面进行分析：
1. 意境分析：诗词营造的意境和情感氛围
2. 艺术手法：运用的修辞手法、表现技巧
3. 语言特色：用词特点、音韵美感
4. 思想内容：表达的思想情感、人生感悟
5. 历史背景：创作背景和时代特色

请用优美的语言进行分析，让读者能够深入理解这首诗词的魅力。
`,

  // 诗词创作指导提示词
  creation: (theme: string, style: string) => `
请作为一位诗词创作导师，为用户提供诗词创作指导：

创作主题：${theme}
创作风格：${style}

请提供以下指导：
1. 主题构思建议
2. 意象选择推荐
3. 格律要求说明
4. 用词技巧提示
5. 创作示例参考

请用通俗易懂的语言进行指导，帮助用户创作出优秀的诗词作品。
`,

  // 诗词问答提示词
  qa: (question: string, context?: string) => `
请作为一位博学的诗词学者，回答用户关于诗词的问题：

用户问题：${question}
${context ? `相关背景：${context}` : ''}

请提供准确、详细的回答，如果涉及具体诗词，请引用原文进行说明。
回答要有学术性但不失通俗性，让用户能够轻松理解。
`
}