<template>
  <div class="appreciation-workspace">
    <!-- 智能鉴赏工作台 - 三栏布局 -->
    <div class="workspace-container">
      <!-- 左侧导航栏 -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <h3>智能鉴赏</h3>
        </div>
        
        <!-- 搜索区域 -->
        <div class="search-section">
          <el-input
            v-model="searchQuery"
            placeholder="自然语言搜索诗词..."
            @keyup.enter="handleSearch"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" @click="handleSearch" class="search-btn">
            搜索
          </el-button>
        </div>

        <!-- 学习进度 -->
        <div class="progress-section">
          <h4>学习进度</h4>
          <div class="progress-stats">
            <div class="stat-item">
              <span class="label">已学习</span>
              <span class="value">{{ learnedCount }}首</span>
            </div>
            <div class="stat-item">
              <span class="label">收藏</span>
              <span class="value">{{ favoriteCount }}首</span>
            </div>
          </div>
          <el-progress :percentage="learningProgress" />
        </div>
      </aside>

      <!-- 中间内容区域 -->
      <main class="main-content">
        <!-- AI个性化推荐 -->
        <div class="recommendation-section" v-if="!selectedPoem">
          <h3>AI为您推荐</h3>
          <div class="poem-list">
            <div 
              v-for="poem in recommendedPoems" 
              :key="poem.id"
              class="poem-item chinese-style"
              @click="selectPoem(poem)"
            >
              <div class="poem-header">
                <h4 class="poem-title">{{ poem.title }}</h4>
                <span class="poem-author">{{ poem.dynasty }} · {{ poem.author }}</span>
              </div>
              <div class="poem-preview">{{ poem.content.split('。')[0] }}。</div>
              <div class="poem-meta">
                <el-tag v-for="tag in poem.tags" :key="tag" size="small">{{ tag }}</el-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- 诗词详情展示 -->
        <div class="poem-detail" v-if="selectedPoem">
          <div class="poem-header">
            <el-button @click="backToList" type="text" class="back-btn">
              <el-icon><ArrowLeft /></el-icon>
              返回列表
            </el-button>
          </div>
          
          <div class="poem-original chinese-style">
            <h2 class="poem-title">{{ selectedPoem.title }}</h2>
            <p class="poem-author">{{ selectedPoem.dynasty }} · {{ selectedPoem.author }}</p>
            <div class="poem-content poem-text">
              {{ selectedPoem.content }}
            </div>
            <div class="poem-actions">
              <el-button @click="toggleFavorite" :type="isFavorite ? 'danger' : 'primary'">
                <el-icon><Star /></el-icon>
                {{ isFavorite ? '取消收藏' : '收藏' }}
              </el-button>
            </div>
          </div>
        </div>
      </main>

      <!-- 右侧AI助手 -->
      <aside class="ai-assistant">
        <div class="assistant-header">
          <h3>AI诗词助手</h3>
        </div>

        <!-- 对话区域 -->
        <div class="chat-container">
          <div class="chat-messages">
            <div 
              v-for="message in chatMessages" 
              :key="message.id"
              :class="['message', message.type]"
            >
              <div class="message-content">
                <div class="message-text">{{ message.content }}</div>
              </div>
            </div>
          </div>
          
          <div class="chat-input">
            <el-input
              v-model="userMessage"
              placeholder="向AI提问关于诗词的任何问题..."
              @keyup.enter="sendMessage"
              type="textarea"
              :rows="2"
            />
            <el-button @click="sendMessage" type="primary" size="small">
              发送
            </el-button>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Search, ArrowLeft, Star } from '@element-plus/icons-vue'

// 响应式数据
const searchQuery = ref('')
const selectedPoem = ref(null)
const userMessage = ref('')
const isFavorite = ref(false)

// 学习进度数据
const learnedCount = ref(15)
const favoriteCount = ref(8)
const learningProgress = ref(30)

const chatMessages = ref([
  {
    id: 1,
    type: 'ai',
    content: '您好！我是您的专属诗词AI助手，有什么关于诗词的问题都可以问我哦～'
  }
])

// 示例推荐诗词数据
const recommendedPoems = ref([
  {
    id: 1,
    title: '静夜思',
    author: '李白',
    dynasty: '唐',
    content: '床前明月光，疑是地上霜。举头望明月，低头思故乡。',
    tags: ['思乡', '月夜']
  },
  {
    id: 2,
    title: '春晓',
    author: '孟浩然',
    dynasty: '唐',
    content: '春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。',
    tags: ['春天', '田园']
  }
])

// 方法
const handleSearch = () => {
  console.log('搜索:', searchQuery.value)
}

const selectPoem = (poem: any) => {
  selectedPoem.value = poem
}

const backToList = () => {
  selectedPoem.value = null
}

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
  if (isFavorite.value) {
    favoriteCount.value++
  } else {
    favoriteCount.value--
  }
}

const sendMessage = async () => {
  if (!userMessage.value.trim()) return
  
  chatMessages.value.push({
    id: Date.now(),
    type: 'user',
    content: userMessage.value
  })
  
  const question = userMessage.value
  userMessage.value = ''
  
  // 模拟AI回复
  setTimeout(() => {
    chatMessages.value.push({
      id: Date.now(),
      type: 'ai',
      content: `关于"${question}"，这是一个很不错的问题！`
    })
  }, 1000)
}

onMounted(() => {
  console.log('智能鉴赏页面已加载')
})
</script>

<style scoped>
.appreciation-workspace {
  min-height: 100vh;
  background: #f8f9fa;
}

.workspace-container {
  display: grid;
  grid-template-columns: 280px 1fr 320px;
  gap: 1rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
  min-height: 100vh;
}

.sidebar, .ai-assistant {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  height: fit-content;
}

.sidebar-header h3, .assistant-header h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
}

.search-section {
  margin-bottom: 2rem;
}

.search-btn {
  width: 100%;
  margin-top: 0.5rem;
}

.progress-section {
  margin-top: 2rem;
}

.progress-section h4 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.progress-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.stat-item {
  text-align: center;
}

.stat-item .label {
  display: block;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.stat-item .value {
  display: block;
  color: #2c3e50;
  font-weight: bold;
  font-size: 1.1rem;
}

.main-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.recommendation-section h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.poem-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.poem-item {
  padding: 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.poem-item:hover {
  transform: translateY(-2px);
}

.poem-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.poem-title {
  color: #2c3e50;
  font-size: 1.2rem;
  font-family: 'KaiTi', '楷体', serif;
}

.poem-author {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.poem-preview {
  font-family: 'KaiTi', '楷体', serif;
  color: #2c3e50;
  margin-bottom: 1rem;
  line-height: 1.8;
}

.poem-meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.poem-detail .back-btn {
  margin-bottom: 1rem;
  color: #667eea;
}

.poem-original {
  padding: 2rem;
  text-align: center;
}

.poem-original .poem-title {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.poem-original .poem-author {
  font-size: 1rem;
  margin-bottom: 2rem;
}

.poem-actions {
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 400px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 1rem;
}

.message {
  margin-bottom: 1rem;
}

.message.user .message-content {
  background: #667eea;
  color: white;
  margin-left: 2rem;
}

.message.ai .message-content {
  background: #f1f3f4;
  color: #2c3e50;
  margin-right: 2rem;
}

.message-content {
  padding: 0.8rem 1rem;
  border-radius: 12px;
  max-width: 80%;
}

.message-text {
  line-height: 1.5;
}

.chat-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .workspace-container {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
  }
  
  .sidebar, .ai-assistant {
    order: 2;
  }
  
  .main-content {
    order: 1;
  }
}
</style>