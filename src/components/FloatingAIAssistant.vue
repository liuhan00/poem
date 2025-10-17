<template>
  <!-- 悬浮AI助手按钮 -->
  <div class="floating-assistant">
    <!-- 悬浮按钮 -->
    <div 
      class="assistant-button"
      :class="{ 'button-hidden': isOpen }"
      @click="toggleAssistant"
    >
      <el-icon class="assistant-icon">
        <ChatDotRound />
      </el-icon>
      <span class="assistant-text">AI助手</span>
    </div>

    <!-- 聊天窗口 -->
    <transition name="slide-up">
      <div v-if="isOpen" class="chat-window">
        <!-- 聊天窗口头部 -->
        <div class="chat-header">
          <div class="header-info">
            <el-icon class="header-icon"><ChatDotRound /></el-icon>
            <span class="header-title">AI诗词助手</span>
          </div>
          <div class="header-actions">
            <el-button 
              @click="clearChat" 
              type="text" 
              size="small"
              title="清空对话"
            >
              <el-icon><Refresh /></el-icon>
            </el-button>
            <el-button 
              @click="toggleAssistant" 
              type="text" 
              size="small"
              title="最小化"
            >
              <el-icon><Minus /></el-icon>
            </el-button>
          </div>
        </div>

        <!-- 聊天消息区域 -->
        <div class="chat-messages" ref="messagesContainer">
          <div 
            v-for="message in chatMessages" 
            :key="message.id"
            :class="['message', message.type]"
          >
            <div class="message-avatar">
              <el-icon v-if="message.type === 'ai'">
                <ChatDotRound />
              </el-icon>
              <el-icon v-else>
                <User />
              </el-icon>
            </div>
            <div class="message-content">
              <div class="message-text">{{ message.content }}</div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>
        </div>

        <!-- 聊天输入区域 -->
        <div class="chat-input">
          <el-input
            v-model="userMessage"
            placeholder="问我任何关于诗词的问题..."
            @keyup.enter="sendMessage"
            type="textarea"
            :rows="2"
            resize="none"
            maxlength="500"
            show-word-limit
          />
          <div class="input-actions">
            <el-button 
              @click="suggestQuestion" 
              type="text" 
              size="small"
            >
              问题建议
            </el-button>
            <el-button 
              @click="sendMessage" 
              type="primary" 
              :loading="sending"
              :disabled="!userMessage.trim()"
            >
              {{ sending ? '发送中...' : '发送' }}
            </el-button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { ChatDotRound, User, Minus, Refresh } from '@element-plus/icons-vue'

// 响应式数据
const isOpen = ref(false)
const userMessage = ref('')
const sending = ref(false)
const messagesContainer = ref<HTMLElement>()

// 聊天消息
const chatMessages = ref([
  {
    id: 1,
    type: 'ai',
    content: '您好！我是您的AI诗词助手，可以为您解答关于诗词的各种问题，比如诗词鉴赏、作者介绍、创作背景等。',
    timestamp: new Date()
  }
])

// 方法
const toggleAssistant = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(() => {
      scrollToBottom()
    })
  }
}

const sendMessage = async () => {
  if (!userMessage.value.trim()) {
    ElMessage.warning('请输入问题内容')
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

  scrollToBottom()

  try {
    // 模拟AI回复
    setTimeout(() => {
      const aiResponse = generateAIResponse(message)
      chatMessages.value.push({
        id: Date.now(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      })
      sending.value = false
      scrollToBottom()
    }, 1000)
  } catch (error) {
    console.error('发送消息失败:', error)
    ElMessage.error('发送失败，请重试')
    sending.value = false
  }
}

const suggestQuestion = () => {
  const questions = [
    '推荐一首描写春天的诗词',
    '李白最著名的诗有哪些？',
    '如何欣赏一首古诗的意境？',
    '唐诗和宋词有什么区别？',
    '请解释《静夜思》的创作背景'
  ]

  const randomQuestion = questions[Math.floor(Math.random() * questions.length)]
  userMessage.value = randomQuestion
}

const clearChat = () => {
  chatMessages.value = [{
    id: 1,
    type: 'ai',
    content: '对话已清空，有什么可以帮您的吗？',
    timestamp: new Date()
  }]
  ElMessage.success('对话已清空')
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const formatTime = (timestamp: Date) => {
  return timestamp.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const generateAIResponse = (question: string): string => {
  // 简单的规则匹配生成回复
  const responses: Record<string, string> = {
    '春天': '描写春天的经典诗词有很多，比如杜甫的《春望》、孟浩然的《春晓》、白居易的《钱塘湖春行》等。这些诗词通过细腻的笔触描绘了春天的生机与美好。',
    '李白': '李白是唐代伟大的浪漫主义诗人，代表作有《静夜思》、《望庐山瀑布》、《将进酒》、《蜀道难》等。他的诗风豪放飘逸，想象丰富，语言流转自然。',
    '意境': '欣赏古诗意境可以从以下几个方面入手：1) 感受诗歌的整体氛围；2) 品味意象的组合与象征；3) 体会诗人的情感表达；4) 结合创作背景理解深层含义。',
    '唐诗宋词': '唐诗和宋词的主要区别：唐诗以五言、七言为主，格律严谨；宋词则有固定的词牌，句式灵活。唐诗重意境，宋词重抒情。唐诗多写景抒情，宋词多写情抒怀。',
    '静夜思': '《静夜思》是李白创作的一首五言绝句，写于唐玄宗开元年间。诗中通过明月意象表达了游子思乡之情，语言朴素自然，意境深远，成为千古传诵的名篇。'
  }

  // 关键词匹配
  for (const [keyword, response] of Object.entries(responses)) {
    if (question.includes(keyword)) {
      return response
    }
  }

  // 默认回复
  return `关于"${question}"，这是一个很好的问题！作为AI诗词助手，我可以为您提供专业的诗词解读和分析。如果您有具体的诗词作品想要了解，我可以给出更详细的解答。`
}

onMounted(() => {
  // 组件挂载后的一些初始化操作
})
</script>

<style scoped>
.floating-assistant {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.assistant-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 25px;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
  user-select: none;
}

.assistant-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(102, 126, 234, 0.4);
}

.assistant-button.button-hidden {
  opacity: 0;
  pointer-events: none;
}

.assistant-icon {
  font-size: 18px;
}

.assistant-text {
  font-size: 14px;
  font-weight: 500;
}

.chat-window {
  width: 350px;
  height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  font-size: 16px;
}

.header-title {
  font-size: 14px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 4px;
}

.chat-messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: #f8f9fa;
}

.message {
  display: flex;
  margin-bottom: 16px;
  gap: 8px;
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
  background: white;
  border-radius: 12px;
  padding: 8px 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.message.user .message-content {
  background: #667eea;
  color: white;
}

.message-text {
  line-height: 1.4;
  font-size: 13px;
  margin-bottom: 4px;
}

.message-time {
  font-size: 11px;
  color: #95a5a6;
  text-align: right;
}

.message.user .message-time {
  color: rgba(255, 255, 255, 0.7);
}

.chat-input {
  padding: 12px;
  border-top: 1px solid #e8e8e8;
  background: white;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

/* 动画效果 */
.slide-up-enter-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

/* 滚动条样式 */
.chat-messages::-webkit-scrollbar {
  width: 4px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .floating-assistant {
    bottom: 10px;
    right: 10px;
  }
  
  .chat-window {
    width: calc(100vw - 20px);
    height: 60vh;
  }
}
</style>