<template>
  <div class="home">
    <!-- 导航栏 -->
    <el-header class="header">
      <div class="nav-container">
        <div class="logo">
          <div class="logo-icon">📜</div>
          <div class="logo-text">
            <h1>诗词鉴赏平台</h1>
            <span class="subtitle">智慧传承古韵之美</span>
          </div>
        </div>
        <nav class="nav-menu">
          <el-menu mode="horizontal" :default-active="activeIndex" @select="handleSelect">
            <el-menu-item index="/">首页</el-menu-item>
            <el-menu-item index="/appreciation">智能鉴赏</el-menu-item>
            <el-menu-item index="/creation">创作辅导</el-menu-item>
            <el-menu-item index="/knowledge">知识探索</el-menu-item>
            <el-menu-item index="/favorites">我的收藏</el-menu-item>
          </el-menu>
        </nav>
        <div class="network-status" :class="{ offline: !isOnline }">
          <el-icon><Connection /></el-icon>
          <span>{{ isOnline ? '在线模式' : '离线模式' }}</span>
        </div>
      </div>
    </el-header>

    <!-- 主要内容区域 -->
    <el-main class="main-content">
      <!-- 欢迎区域 -->
      <section class="hero-section">
        <div class="hero-background">
          <div class="ink-splash"></div>
          <div class="bamboo-pattern"></div>
        </div>
        <div class="hero-content">
          <div class="hero-title-container">
            <h2 class="hero-title">与AI一起探索诗词之美</h2>
            <div class="title-decoration">✨</div>
          </div>
          <p class="hero-description">
            基于先进AI技术的智能诗词鉴赏平台，为您提供个性化的诗词学习体验
          </p>
          <div class="hero-actions">
            <el-button type="primary" size="large" @click="startExploring" class="chinese-button">
              <el-icon><Search /></el-icon>
              开始探索
            </el-button>
            <el-button size="large" @click="viewRandomPoem" class="chinese-button">
              <el-icon><Refresh /></el-icon>
              随机诗词
            </el-button>
          </div>
          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-number">500+</span>
              <span class="stat-label">经典诗词</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">100+</span>
              <span class="stat-label">历代诗人</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">AI</span>
              <span class="stat-label">智能解析</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 功能特色区域 -->
      <section class="features-section">
        <div class="section-header">
          <h3 class="section-title">平台特色</h3>
          <p class="section-subtitle">融合传统诗词文化与现代AI技术，打造沉浸式学习体验</p>
        </div>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-card class="feature-card chinese-style" shadow="hover" @click="startExploring">
              <div class="feature-icon">
                <div class="icon-wrapper">
                  <el-icon size="48"><Cpu /></el-icon>
                </div>
              </div>
              <h4>AI智能鉴赏</h4>
              <p>三级AI智能体为您提供深度诗词解析和个性化学习体验</p>
              <div class="feature-tag">深度解析</div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-card class="feature-card chinese-style" shadow="hover" @click="viewKnowledgeGraph">
              <div class="feature-icon">
                <div class="icon-wrapper">
                  <el-icon size="48"><Connection /></el-icon>
                </div>
              </div>
              <h4>知识图谱</h4>
              <p>构建诗词、作者、典故的关联网络，发现文化内在联系</p>
              <div class="feature-tag">关联探索</div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-card class="feature-card chinese-style" shadow="hover" @click="viewCreation">
              <div class="feature-icon">
                <div class="icon-wrapper">
                  <el-icon size="48"><EditPen /></el-icon>
                </div>
              </div>
              <h4>创作辅导</h4>
              <p>AI为您的诗词创作提供格律检查、意境建议和修改指导</p>
              <div class="feature-tag">创作指导</div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-card class="feature-card chinese-style" shadow="hover" @click="viewInteractiveLearning">
              <div class="feature-icon">
                <div class="icon-wrapper">
                  <el-icon size="48"><ChatDotRound /></el-icon>
                </div>
              </div>
              <h4>互动学习</h4>
              <p>与AI进行自然语言对话，获得即时的文化知识问答</p>
              <div class="feature-tag">智能对话</div>
            </el-card>
          </el-col>
        </el-row>
      </section>

      <!-- 热门诗词推荐 -->
      <section class="popular-poems">
        <h3 class="section-title">热门诗词</h3>
        <div v-if="loading" class="loading-section">
          <el-skeleton :rows="3" animated />
        </div>
        <div v-else-if="popularPoems.length > 0">
          <el-row :gutter="16">
            <el-col :xs="24" :sm="12" :md="8" v-for="poem in popularPoems" :key="poem.id">
              <el-card class="poem-card chinese-style" shadow="hover" @click="viewPoem(poem.id)">
                <div class="poem-content">
                  <h4 class="poem-title">{{ poem.title }}</h4>
                  <p class="poem-author">{{ poem.dynasty }} · {{ poem.author }}</p>
                  <div class="poem-preview">
                    {{ poem.content.split('。')[0] }}。
                  </div>
                  <div class="poem-tags">
                    <el-tag v-for="tag in poem.tags" :key="tag" size="small">{{ tag }}</el-tag>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
        <div v-else class="empty-section">
          <el-empty description="暂无热门诗词数据" :image-size="100">
            <el-button type="primary" @click="loadPopularPoems">重新加载</el-button>
          </el-empty>
        </div>
      </section>
    </el-main>

    <!-- 页脚 -->
    <el-footer class="footer">
      <div class="footer-content">
        <p>&copy; 2025 诗词鉴赏平台. 基于L.I.G.H.T.架构构建</p>
        <p>让AI与传统文化完美融合，传承中华诗词之美</p>
      </div>
    </el-footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Refresh, Cpu, Connection, EditPen, ChatDotRound } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const activeIndex = ref('/')

import { getPopularPoems } from '../utils/api'
import type { Poem } from '../types/poem'

// 响应式数据
const popularPoems = ref<Poem[]>([])
const loading = ref(true)
const isOnline = ref(navigator.onLine)

// 网络状态检测
const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine
  console.log('网络状态变化:', isOnline.value ? '在线' : '离线')
}

onMounted(() => {
  // 添加网络状态监听
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
  
  // 初始检测网络状态
  updateOnlineStatus()
  
  loadPopularPoems()
})

onUnmounted(() => {
  // 移除网络状态监听
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
})

const handleSelect = (key: string) => {
  router.push(key)
}

const startExploring = () => {
  router.push('/appreciation')
}

const viewRandomPoem = async () => {
  try {
    // 首先确保有诗词数据
    if (popularPoems.value.length === 0) {
      await loadPopularPoems()
    }
    
    // 如果热门诗词数据不足，尝试获取更多诗词
    let availablePoems = popularPoems.value
    if (availablePoems.length === 0) {
      console.log('热门诗词数据为空，尝试获取更多诗词...')
      const morePoemsResult = await getPopularPoems(50) // 获取更多诗词作为备用
      if (morePoemsResult.success && morePoemsResult.data && morePoemsResult.data.length > 0) {
        availablePoems = morePoemsResult.data
        console.log(`获取到 ${availablePoems.length} 首诗词`)
      }
    }
    
    // 如果仍然没有数据，提示用户
    if (availablePoems.length === 0) {
      ElMessage.warning('暂无诗词数据，请稍后再试')
      return
    }
    
    // 随机选择一首诗词
    const randomIndex = Math.floor(Math.random() * availablePoems.length)
    const randomPoem = availablePoems[randomIndex]
    
    console.log('随机选择诗词:', randomPoem.title, 'ID:', randomPoem.id)
    
    // 跳转到诗词详情页面
    router.push(`/poem/${randomPoem.id}`)
  } catch (error) {
    console.error('随机诗词跳转失败:', error)
    ElMessage.error('跳转失败，请重试')
  }
}

const viewPoem = (id: string) => {
  router.push(`/poem/${id}`)
}

const viewKnowledgeGraph = () => {
  router.push('/knowledge-graph')
}

const viewCreation = () => {
  router.push('/creation')
}

const viewInteractiveLearning = () => {
  router.push('/appreciation')
}

const loadPopularPoems = async () => {
  try {
    console.log('开始加载热门诗词...')
    loading.value = true
    const result = await getPopularPoems(6)
    console.log('API调用结果:', result)
    
    if (result.success && result.data) {
      console.log(`获取到 ${result.data.length} 首诗词`)
      popularPoems.value = result.data
    } else {
      console.log('API调用成功但无数据')
      popularPoems.value = []
    }
  } catch (error) {
    console.error('加载热门诗词失败:', error)
    popularPoems.value = []
  } finally {
    console.log('加载完成，诗词数量:', popularPoems.value.length)
    loading.value = false
  }
}

onMounted(() => {
  loadPopularPoems()
})
</script>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f8f0e3 0%, #e8d5b7 100%);
}

.header {
  background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
  color: white;
  padding: 0;
  height: auto;
  box-shadow: 0 4px 20px rgba(139, 69, 19, 0.3);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-icon {
  font-size: 2.5rem;
  animation: float 3s ease-in-out infinite;
}

.logo-text h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: bold;
  font-family: 'KaiTi', '楷体', serif;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.logo .subtitle {
  font-size: 0.9rem;
  opacity: 0.9;
  font-family: 'KaiTi', '楷体', serif;
}

.nav-menu {
  background: transparent;
}

.nav-menu .el-menu-item {
  font-family: 'KaiTi', '楷体', serif;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.nav-menu .el-menu-item:hover {
  background: rgba(255,255,255,0.1);
  border-radius: 8px;
}

.network-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 20px;
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid rgba(76, 175, 80, 0.3);
  transition: all 0.3s ease;
  font-family: 'KaiTi', '楷体', serif;
}

.network-status.offline {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
  border-color: rgba(244, 67, 54, 0.3);
}

.network-status .el-icon {
  font-size: 16px;
}

.main-content {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.hero-section {
  text-align: center;
  padding: 4rem 0;
  position: relative;
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.1) 0%, rgba(160, 82, 45, 0.1) 100%);
  border-radius: 20px;
  margin-bottom: 3rem;
  overflow: hidden;
  border: 2px solid #d2b48c;
  box-shadow: 0 8px 32px rgba(139, 69, 19, 0.2);
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.1;
  z-index: 0;
}

.ink-splash {
  position: absolute;
  top: 20%;
  right: 10%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(139,69,19,0.3) 0%, transparent 70%);
  border-radius: 50%;
}

.bamboo-pattern {
  position: absolute;
  bottom: 10%;
  left: 5%;
  width: 150px;
  height: 300px;
  background: linear-gradient(90deg, transparent 45%, rgba(139,69,19,0.2) 45%, rgba(139,69,19,0.2) 55%, transparent 55%);
  background-size: 20px 100%;
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-title-container {
  position: relative;
  margin-bottom: 2rem;
}

.hero-title {
  font-size: 3rem;
  color: #2c3e50;
  margin-bottom: 1rem;
  font-weight: 600;
  font-family: 'KaiTi', '楷体', serif;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

.title-decoration {
  font-size: 2rem;
  animation: sparkle 2s ease-in-out infinite;
  margin-top: 1rem;
}

.hero-description {
  font-size: 1.3rem;
  color: #5d4037;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  font-family: 'KaiTi', '楷体', serif;
  line-height: 1.8;
}

.hero-actions {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 3rem;
}

.chinese-button {
  font-family: 'KaiTi', '楷体', serif;
  font-size: 1.1rem;
  padding: 1rem 2rem;
  border-radius: 25px;
  border: 2px solid #8b4513;
  transition: all 0.3s ease;
}

.chinese-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 69, 19, 0.3);
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
  flex-wrap: wrap;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2.5rem;
  font-weight: bold;
  color: #8b4513;
  font-family: 'KaiTi', '楷体', serif;
}

.stat-label {
  font-size: 1rem;
  color: #5d4037;
  font-family: 'KaiTi', '楷体', serif;
}

.features-section, .popular-poems {
  margin-bottom: 4rem;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
  font-weight: 600;
  font-family: 'KaiTi', '楷体', serif;
}

.section-subtitle {
  font-size: 1.2rem;
  color: #5d4037;
  max-width: 600px;
  margin: 0 auto;
  font-family: 'KaiTi', '楷体', serif;
}

.feature-card {
  text-align: center;
  padding: 2rem 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #fff9f0 0%, #f5f0e6 100%);
  border: 2px solid #d2b48c;
  border-radius: 16px;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(139, 69, 19, 0.2);
}

.icon-wrapper {
  background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: white;
}

.feature-card h4 {
  font-size: 1.4rem;
  margin-bottom: 1rem;
  color: #2c3e50;
  font-family: 'KaiTi', '楷体', serif;
}

.feature-card p {
  color: #5d4037;
  line-height: 1.6;
  margin-bottom: 1rem;
  font-family: 'KaiTi', '楷体', serif;
}

.feature-tag {
  display: inline-block;
  background: #8b4513;
  color: white;
  padding: 0.3rem 1rem;
  border-radius: 15px;
  font-size: 0.9rem;
  font-family: 'KaiTi', '楷体', serif;
}

.poem-card {
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #fff9f0 0%, #f5f0e6 100%);
  border: 2px solid #d2b48c;
  border-radius: 12px;
}

.poem-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(139, 69, 19, 0.2);
}

.poem-content {
  padding: 1.5rem;
}

.poem-title {
  font-size: 1.4rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-family: 'KaiTi', '楷体', serif;
  font-weight: bold;
}

.poem-author {
  color: #5d4037;
  margin-bottom: 1rem;
  font-size: 1rem;
  font-family: 'KaiTi', '楷体', serif;
}

.poem-preview {
  font-family: 'KaiTi', '楷体', serif;
  color: #2c3e50;
  margin-bottom: 1rem;
  line-height: 1.8;
  font-size: 1.1rem;
}

.poem-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.empty-section {
  text-align: center;
  padding: 3rem 0;
}

.footer {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
  text-align: center;
  padding: 2rem;
  margin-top: 3rem;
}

.footer-content p {
  margin: 0.5rem 0;
  font-family: 'KaiTi', '楷体', serif;
}

.footer-content p:first-child {
  font-weight: 600;
  font-size: 1.1rem;
}

.footer-content p:last-child {
  opacity: 0.8;
  font-size: 1rem;
}

/* 动画效果 */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes sparkle {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.1); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .hero-title {
    font-size: 2.2rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .hero-stats {
    gap: 2rem;
  }
  
  .stat-number {
    font-size: 2rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 1.8rem;
  }
  
  .hero-description {
    font-size: 1.1rem;
  }
  
  .section-title {
    font-size: 1.8rem;
  }
}
</style>