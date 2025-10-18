<template>
  <div class="ai-appreciation">
    <!-- 页面标题和简介 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">AI智能诗词鉴赏</h1>
        <p class="page-subtitle">探索古典诗词的意境之美，感受AI带来的深度解读</p>
        <div class="feature-tags">
          <el-tag type="success" size="small">主题分析</el-tag>
          <el-tag type="warning" size="small">艺术特色</el-tag>
          <el-tag type="danger" size="small">文化背景</el-tag>
          <el-tag type="info" size="small">学习建议</el-tag>
        </div>
      </div>
    </div>

    <!-- AI智能鉴赏主界面 -->
    <div class="appreciation-container">
      <!-- 诗词选择区域 -->
      <div class="poem-selection">
        <div class="selection-header">
          <div class="header-left">
            <h3>📚 诗词精选</h3>
            <p class="selection-desc">从经典名篇到用户创作，感受诗词魅力</p>
          </div>
          <el-button @click="refreshPoems" type="primary" size="small" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新诗词库
          </el-button>
        </div>
        
        <div class="poem-list">
          <div 
            v-for="poem in availablePoems" 
            :key="poem.id"
            :class="['poem-card', { active: selectedPoem?.id === poem.id }]"
            @click="selectPoem(poem)"
          >
            <div class="poem-info">
              <h4 class="poem-title">{{ poem.title }}</h4>
              <p class="poem-author">{{ poem.dynasty }} · {{ poem.author }}</p>
              <div class="poem-preview">{{ getPoemPreview(poem.content) }}</div>
            </div>
            <div class="poem-meta">
              <el-tag 
                v-for="tag in poem.tags.slice(0, 2)" 
                :key="tag" 
                size="small"
                :type="getTagType(tag)"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- AI鉴赏分析区域 -->
      <div class="analysis-panel">
        <div class="panel-header">
          <h3>AI智能鉴赏分析</h3>
          <div class="analysis-controls">
            <el-button-group>
              <el-button 
                :type="analysisType === 'quick' ? 'primary' : ''"
                @click="analysisType = 'quick'"
              >
                快速分析
              </el-button>
              <el-button 
                :type="analysisType === 'deep' ? 'primary' : ''"
                @click="analysisType = 'deep'"
              >
                深度解析
              </el-button>
            </el-button-group>
            
            <el-button 
              @click="analyzePoem" 
              type="success" 
              :loading="analyzing"
              :disabled="!selectedPoem"
            >
              {{ analyzing ? '分析中...' : '开始AI鉴赏' }}
            </el-button>
          </div>
        </div>

        <!-- 分析结果展示 -->
        <div class="analysis-results" v-if="analysisResult">
          <!-- 诗词原文展示区 -->
          <div class="poem-original">
            <div class="poem-header">
              <h4>📖 诗词原文</h4>
              <div class="poem-meta-info">
                <span class="meta-item">《{{ selectedPoem?.title }}》</span>
                <span class="meta-item">{{ selectedPoem?.dynasty }} · {{ selectedPoem?.author }}</span>
                <span class="meta-item">难度: {{ analysisResult.difficulty_level }}星</span>
              </div>
            </div>
            <div class="poem-content chinese-style">
              {{ selectedPoem?.content }}
            </div>
            <div class="poem-footer">
              <el-tag 
                v-for="tag in selectedPoem?.tags" 
                :key="tag" 
                size="small"
                :type="getTagType(tag)"
                class="poem-tag"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>

          <!-- AI分析结果 -->
          <div class="ai-analysis">
            <el-collapse v-model="activeAnalysisItems">
              <!-- 主题分析 -->
              <el-collapse-item title="主题分析" name="theme">
                <div class="analysis-section">
                  <div class="analysis-item">
                    <span class="label">主要主题:</span>
                    <span class="value">{{ analysisResult.theme }}</span>
                  </div>
                  <div class="analysis-item">
                    <span class="label">情感基调:</span>
                    <span class="value">{{ analysisResult.mood }}</span>
                  </div>
                  <div class="analysis-item">
                    <span class="label">现代解读:</span>
                    <span class="value">{{ analysisResult.modern_interpretation }}</span>
                  </div>
                </div>
              </el-collapse-item>

              <!-- 艺术特色 -->
              <el-collapse-item title="艺术特色" name="artistic">
                <div class="analysis-section">
                  <div class="analysis-item">
                    <span class="label">修辞手法:</span>
                    <span class="value">{{ analysisResult.rhetorical_devices.join('、') }}</span>
                  </div>
                  <div class="analysis-item">
                    <span class="label">意境营造:</span>
                    <span class="value">{{ analysisResult.mood }}</span>
                  </div>
                  <div class="analysis-item">
                    <span class="label">艺术特色:</span>
                    <span class="value">{{ analysisResult.artistic_features || getArtisticDescription() }}</span>
                  </div>
                  <div class="analysis-item">
                    <span class="label">意象特征:</span>
                    <span class="value">{{ analysisResult.imagery_features?.join('、') || '生动鲜明' }}</span>
                  </div>
                </div>
              </el-collapse-item>

              <!-- 文化背景 -->
              <el-collapse-item title="文化背景" name="cultural">
                <div class="analysis-section">
                  <div class="analysis-item">
                    <span class="label">时代背景:</span>
                    <span class="value">{{ analysisResult.cultural_context }}</span>
                  </div>
                  <div class="analysis-item">
                    <span class="label">文学流派:</span>
                    <span class="value">{{ analysisResult.literary_style || getLiterarySchool() }}</span>
                  </div>
                  <div class="analysis-item" v-if="analysisResult.historical_context">
                    <span class="label">历史背景:</span>
                    <span class="value">{{ analysisResult.historical_context }}</span>
                  </div>
                  <div class="analysis-item" v-if="analysisResult.author_background">
                    <span class="label">作者背景:</span>
                    <span class="value">{{ analysisResult.author_background }}</span>
                  </div>
                </div>
              </el-collapse-item>

              <!-- 学习建议 -->
              <el-collapse-item title="学习建议" name="learning">
                <div class="analysis-section">
                  <div class="analysis-item">
                    <span class="label">难度评估:</span>
                    <div class="difficulty-info">
                      <el-rate 
                        v-model="analysisResult.difficulty_level" 
                        :max="5" 
                        disabled 
                        show-score
                        text-color="#ff9900"
                        score-template="{value} 星"
                      />
                      <span class="difficulty-desc" v-if="analysisResult.difficulty_description">
                        {{ analysisResult.difficulty_description }}
                      </span>
                    </div>
                  </div>
                  <div class="analysis-item">
                    <span class="label">学习建议:</span>
                    <div class="learning-suggestions">
                      <div 
                        v-for="suggestion in analysisResult.learning_suggestions" 
                        :key="suggestion"
                        class="suggestion-item"
                      >
                        <el-icon><Check /></el-icon>
                        {{ suggestion }}
                      </div>
                    </div>
                  </div>
                  <div class="analysis-item">
                    <span class="label">推荐阅读:</span>
                    <div class="recommended-reading">
                      <el-tag 
                        v-for="reading in analysisResult.recommended_reading" 
                        :key="reading"
                        size="small"
                        type="info"
                        class="reading-tag"
                      >
                        {{ reading }}
                      </el-tag>
                    </div>
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>

        <!-- 空状态 -->
        <div class="empty-state" v-else>
          <el-icon class="empty-icon"><DataAnalysis /></el-icon>
          <p>请选择一首诗词开始AI智能鉴赏</p>
          <p class="empty-tip">AI将为您提供专业的诗词分析和解读</p>
        </div>
      </div>

      <!-- AI对话助手 -->
      <div class="ai-assistant">
        <div class="assistant-header">
          <div class="assistant-title">
            <h3>🤖 AI诗词助手</h3>
            <p class="assistant-desc">与AI探讨诗词意境，解答您的疑问</p>
          </div>
          <div class="assistant-actions">
            <el-button @click="suggestQuestion" type="text" size="small">
              💡 问题建议
            </el-button>
            <el-button @click="resetChat" type="text" size="small">
              🗑️ 清空对话
            </el-button>
          </div>
        </div>

        <div class="chat-container">
          <div class="chat-messages">
            <div 
              v-for="message in chatMessages" 
              :key="message.id"
              :class="['message', message.type]"
            >
              <div class="message-avatar">
                <el-icon v-if="message.type === 'ai'"><DataAnalysis /></el-icon>
                <el-icon v-else><User /></el-icon>
              </div>
              <div class="message-content">
                <div class="message-text">{{ message.content }}</div>
                <div class="message-time">{{ formatTime(message.timestamp) }}</div>
              </div>
            </div>
          </div>

          <div class="chat-input">
            <el-input
              v-model="userMessage"
              placeholder="向AI提问关于这首诗词的任何问题..."
              @keyup.enter="sendMessage"
              type="textarea"
              :rows="3"
              resize="none"
            />
            <div class="input-actions">
              <el-button @click="sendMessage" type="primary" :loading="sending">
                {{ sending ? '发送中...' : '发送' }}
              </el-button>
              <el-button @click="suggestQuestion" type="text">
                获取问题建议
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { DataAnalysis, User, Refresh, Check } from '@element-plus/icons-vue'
import { analyzePoemAI, searchPoems, getPopularPoems } from '../utils/api'
import type { Poem } from '../types/poem'

// 响应式数据
const selectedPoem = ref<Poem | null>(null)
const analysisType = ref<'quick' | 'deep'>('quick')
const analyzing = ref(false)
const analysisResult = ref<any>(null)
const activeAnalysisItems = ref(['theme', 'artistic', 'cultural', 'learning'])
const userMessage = ref('')
const sending = ref(false)
const loading = ref(false)

// 诗词数据
const availablePoems = ref<Poem[]>([])

// 聊天消息
const chatMessages = ref([
  {
    id: 1,
    type: 'ai',
    content: '您好！我是您的AI诗词鉴赏助手。选择一首诗词，我可以为您提供专业的分析和解读。',
    timestamp: new Date()
  }
])

// 方法
const refreshPoems = async () => {
  try {
    loading.value = true
    const result = await getPopularPoems(20) // 获取包含用户创作诗词的数据
    
    if (result.success && result.data) {
      availablePoems.value = result.data
      ElMessage.success(`诗词库已刷新，共${result.data.length}首诗词（包含用户创作）`)
    } else {
      ElMessage.warning('获取诗词数据失败，使用示例诗词')
      // 使用示例诗词作为备用
      availablePoems.value = getExamplePoems()
    }
  } catch (error) {
    console.error('刷新诗词库失败:', error)
    ElMessage.error('刷新失败，使用示例诗词')
    availablePoems.value = getExamplePoems()
  } finally {
    loading.value = false
  }
}

// 获取示例诗词数据
const getExamplePoems = (): Poem[] => {
  return [
    {
      id: '4827d233-f9f8-4325-8485-07764efd4aff',
      title: '静夜思',
      author: '李白',
      dynasty: '唐',
      content: '床前明月光，疑是地上霜。举头望明月，低头思故乡。',
      tags: ['思乡', '月夜', '唐诗'],
      difficulty_level: 1,
      popularity: 95,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2b8c9e1a-7f3d-4e5c-9a6b-8d7e6f5a4b3c',
      title: '春晓',
      author: '孟浩然',
      dynasty: '唐',
      content: '春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。',
      tags: ['春天', '田园', '自然'],
      difficulty_level: 1,
      popularity: 88,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3a9b8c7d-6e5f-4a3b-2c1d-0e9f8a7b6c5d',
      title: '登高',
      author: '杜甫',
      dynasty: '唐',
      content: '风急天高猿啸哀，渚清沙白鸟飞回。无边落木萧萧下，不尽长江滚滚来。',
      tags: ['登高', '秋天', '感慨'],
      difficulty_level: 3,
      popularity: 92,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
}

const selectPoem = (poem: Poem) => {
  selectedPoem.value = poem
  analysisResult.value = null
  resetChat()
  
  // 自动发送欢迎消息
  chatMessages.value.push({
    id: Date.now(),
    type: 'ai',
    content: `您选择了《${poem.title}》，这是一首${poem.dynasty}代${poem.author}的作品。我可以为您分析这首诗的主题、艺术特色和文化背景。`,
    timestamp: new Date()
  })
}

const analyzePoem = async () => {
  if (!selectedPoem.value) {
    ElMessage.warning('请先选择一首诗词')
    return
  }

  try {
    analyzing.value = true
    const result = await analyzePoemAI({
      poem_id: selectedPoem.value.id,
      analysis_type: analysisType.value
    })

    if (result.success && result.data) {
      analysisResult.value = result.data
      ElMessage.success(`AI${analysisType.value === 'deep' ? '深度' : '快速'}分析完成`)
      
      // 添加详细的分析结果到聊天
      const analysisSummary = generateAnalysisSummary(result.data, analysisType.value)
      chatMessages.value.push({
        id: Date.now(),
        type: 'ai',
        content: analysisSummary,
        timestamp: new Date()
      })
    } else {
      ElMessage.error('分析失败，请重试')
    }
  } catch (error) {
    console.error('AI分析失败:', error)
    ElMessage.error('网络错误，请检查连接')
  } finally {
    analyzing.value = false
  }
}

// 生成分析结果摘要
const generateAnalysisSummary = (analysisData: any, type: string) => {
  const { theme, mood, rhetorical_devices, difficulty_level, artistic_features } = analysisData
  
  let summary = `已完成${type === 'deep' ? '深度' : '快速'}AI分析。

`
  summary += `📖 **《${selectedPoem.value?.title}》分析摘要：**
`
  summary += `• **主题**：${theme}
`
  summary += `• **意境**：${mood}
`
  summary += `• **修辞手法**：${rhetorical_devices.join('、')}
`
  summary += `• **难度评估**：${difficulty_level}星
`
  
  if (type === 'deep' && artistic_features) {
    summary += `• **艺术特色**：${artistic_features}
`
  }
  
  summary += `
如需了解更多细节，请查看右侧分析面板。`
  
  return summary
}

const sendMessage = async () => {
  if (!userMessage.value.trim()) {
    ElMessage.warning('请输入问题内容')
    return
  }

  if (!selectedPoem.value) {
    ElMessage.warning('请先选择一首诗词')
    return
  }

  const message = userMessage.value
  userMessage.value = ''
  sending.value = true

  // 添加用户消息
  chatMessages.value.push({
    id: Date.now(),
    type: 'user',
    content: message,
    timestamp: new Date()
  })

  try {
    // 模拟AI回复（实际应用中应该调用AI对话API）
    setTimeout(() => {
      const aiResponse = generateAIResponse(message, selectedPoem.value!)
      chatMessages.value.push({
        id: Date.now(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      })
      sending.value = false
    }, 1000)
  } catch (error) {
    console.error('发送消息失败:', error)
    ElMessage.error('发送失败，请重试')
    sending.value = false
  }
}

const suggestQuestion = () => {
  if (!selectedPoem.value) {
    ElMessage.warning('请先选择一首诗词')
    return
  }

  const questions = [
    `请解释《${selectedPoem.value.title}》的主要意象`,
    `这首诗表达了作者怎样的情感？`,
    `分析这首诗的艺术特色`,
    `这首诗在文学史上有何地位？`,
    `请比较这首诗与其他同类作品`
  ]

  const randomQuestion = questions[Math.floor(Math.random() * questions.length)]
  userMessage.value = randomQuestion
}

const resetChat = () => {
  chatMessages.value = [{
    id: 1,
    type: 'ai',
    content: '您好！我是您的AI诗词鉴赏助手。选择一首诗词，我可以为您提供专业的分析和解读。',
    timestamp: new Date()
  }]
}

// 工具函数
const getPoemPreview = (content: string) => {
  return content.split('。')[0] + '。'
}

const getTagType = (tag: string) => {
  const typeMap: Record<string, any> = {
    '思乡': 'warning',
    '春天': 'success',
    '登高': 'danger',
    '月夜': 'info',
    '田园': 'success',
    '自然': 'success'
  }
  return typeMap[tag] || 'primary'
}

const getArtisticDescription = () => {
  if (!analysisResult.value) return ''
  
  const { theme, mood, rhetorical_devices } = analysisResult.value
  return `通过${rhetorical_devices.join('、')}等手法，营造出${mood}的${theme}意境`
}

const getLanguageStyle = () => {
  if (!analysisResult.value) return ''
  
  const { mood } = analysisResult.value
  const styles: Record<string, string> = {
    '豪放激昂': '雄浑豪放，气势磅礴',
    '婉约含蓄': '细腻婉约，含蓄深沉',
    '忧伤悲凉': '沉郁顿挫，情感真挚',
    '闲适宁静': '清新自然，意境悠远'
  }
  return styles[mood] || '语言优美，富有韵律'
}

const getLiterarySchool = () => {
  if (!selectedPoem.value) return ''
  
  const schools: Record<string, string> = {
    '李白': '浪漫主义',
    '杜甫': '现实主义',
    '王维': '山水田园派',
    '李清照': '婉约派',
    '苏轼': '豪放派'
  }
  return schools[selectedPoem.value.author] || '古典诗词'
}

const generateAIResponse = (question: string, poem: Poem): string => {
  // 简单的规则匹配生成回复
  if (question.includes('意象')) {
    return `《${poem.title}》中，${poem.author}运用了丰富的意象手法。比如诗中描绘的景物不仅具有画面感，更承载了深刻的情感内涵。这些意象共同构成了诗歌独特的艺术世界。`
  }
  
  if (question.includes('情感')) {
    return `这首诗表达了${poem.author}${analysisResult.value?.mood || '深沉'}的情感。通过细腻的笔触，诗人将个人情感与自然景物完美融合，展现了高超的艺术造诣。`
  }
  
  if (question.includes('艺术特色')) {
    return `《${poem.title}》的艺术特色主要体现在：1) 语言精炼优美；2) 意象生动鲜明；3) 情感真挚深沉；4) 结构严谨完整。这些特点共同构成了这首诗独特的艺术魅力。`
  }
  
  return `关于"${question}"，这是一个很有深度的问题。《${poem.title}》作为${poem.dynasty}代${poem.author}的代表作，在${analysisResult.value?.theme || '主题表达'}方面具有独特价值。这首诗通过精湛的艺术手法，展现了诗人高超的文学造诣。`
}

const formatTime = (timestamp: Date) => {
  return timestamp.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

onMounted(async () => {
  console.log('AI智能鉴赏组件已加载，正在初始化诗词数据...')
  await refreshPoems()
})
</script>

<style scoped>
.ai-appreciation {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f0e3 0%, #e8d5b7 100%);
  padding: 1rem;
}

/* 页面标题区域 */
.page-header {
  background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
  color: white;
  padding: 2rem 1rem;
  margin: -1rem -1rem 2rem -1rem;
  border-radius: 0 0 20px 20px;
  box-shadow: 0 4px 20px rgba(139, 69, 19, 0.3);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  text-align: center;
}

.page-title {
  font-size: 2.5rem;
  margin: 0 0 1rem 0;
  font-family: 'KaiTi', '楷体', serif;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.page-subtitle {
  font-size: 1.1rem;
  margin: 0 0 1.5rem 0;
  opacity: 0.9;
}

.feature-tags {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.appreciation-container {
  display: grid;
  grid-template-columns: 320px 1fr 380px;
  gap: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  min-height: calc(100vh - 200px);
}

.poem-selection, .analysis-panel, .ai-assistant {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
}

.selection-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.header-left h3 {
  color: #8b4513;
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
  font-family: 'KaiTi', '楷体', serif;
}

.selection-desc {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin: 0;
  font-style: italic;
}

.poem-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.poem-card {
  padding: 1rem;
  border: 2px solid #e8e8e8;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.poem-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
}

.poem-card.active {
  border-color: #667eea;
  background: #f8f9ff;
}

.poem-title {
  color: #2c3e50;
  font-size: 1.1rem;
  margin: 0 0 0.5rem 0;
  font-family: 'KaiTi', '楷体', serif;
}

.poem-author {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin: 0 0 1rem 0;
}

.poem-preview {
  color: #5a6c7d;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.poem-meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.panel-header h3 {
  color: #2c3e50;
  margin: 0;
  font-size: 1.2rem;
}

.analysis-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.analysis-results {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.poem-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.poem-header h4 {
  color: #8b4513;
  margin: 0;
  font-size: 1.3rem;
  font-family: 'KaiTi', '楷体', serif;
}

.poem-meta-info {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.meta-item {
  color: #7f8c8d;
  font-size: 0.9rem;
  padding: 0.3rem 0.8rem;
  background: #f8f9fa;
  border-radius: 15px;
  border: 1px solid #e8e8e8;
}

.poem-content {
  font-family: 'KaiTi', '楷体', serif;
  font-size: 1.2rem;
  line-height: 2.5;
  text-align: center;
  color: #2c3e50;
  padding: 2rem;
  background: linear-gradient(135deg, #f9f5f0 0%, #f0e6d6 100%);
  border-radius: 12px;
  border: 2px solid #d2b48c;
  box-shadow: 0 4px 15px rgba(210, 180, 140, 0.2);
  margin: 1rem 0;
}

.poem-footer {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 1rem;
}

.poem-tag {
  margin: 0.2rem;
}

.analysis-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.analysis-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.analysis-item .label {
  font-weight: 600;
  color: #2c3e50;
  min-width: 80px;
}

.analysis-item .value {
  color: #5a6c7d;
  flex: 1;
}

.difficulty-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.difficulty-desc {
  font-size: 0.9rem;
  color: #7f8c8d;
  font-style: italic;
}

.learning-suggestions {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.suggestion-item .el-icon {
  color: #667eea;
  font-size: 1.1rem;
}

.recommended-reading {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.reading-tag {
  margin: 0.2rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #7f8c8d;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  color: #bdc3c7;
}

.empty-tip {
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.assistant-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.assistant-title h3 {
  color: #8b4513;
  margin: 0 0 0.3rem 0;
  font-size: 1.3rem;
  font-family: 'KaiTi', '楷体', serif;
}

.assistant-desc {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin: 0;
  font-style: italic;
}

.assistant-actions {
  display: flex;
  gap: 0.5rem;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 500px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 1rem;
}

.message {
  display: flex;
  margin-bottom: 1rem;
  gap: 0.8rem;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #667eea;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.message.user .message-avatar {
  background: #e74c3c;
}

.message-content {
  max-width: 70%;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 0.8rem 1rem;
}

.message.user .message-content {
  background: #667eea;
  color: white;
}

.message-text {
  line-height: 1.5;
  margin-bottom: 0.3rem;
}

.message-time {
  font-size: 0.8rem;
  color: #95a5a6;
  text-align: right;
}

.message.user .message-time {
  color: rgba(255,255,255,0.7);
}

.chat-input {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .appreciation-container {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
  }
  
  .poem-selection, .analysis-panel, .ai-assistant {
    min-height: 400px;
  }
}
</style>