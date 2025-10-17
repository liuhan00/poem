<template>
  <div class="home">
    <!-- 导航栏 -->
    <el-header class="header">
      <div class="nav-container">
        <div class="logo">
          <h1>诗词鉴赏平台</h1>
          <span class="subtitle">智慧传承古韵之美</span>
        </div>
        <nav class="nav-menu">
          <el-menu mode="horizontal" :default-active="activeIndex" @select="handleSelect">
            <el-menu-item index="/">首页</el-menu-item>
            <el-menu-item index="/appreciation">智能鉴赏</el-menu-item>
            <el-menu-item index="/creation">创作辅导</el-menu-item>
            <el-menu-item index="/knowledge">知识探索</el-menu-item>
          </el-menu>
        </nav>
      </div>
    </el-header>

    <!-- 主要内容区域 -->
    <el-main class="main-content">
      <!-- 欢迎区域 -->
      <section class="hero-section">
        <div class="hero-content">
          <h2 class="hero-title">与AI一起探索诗词之美</h2>
          <p class="hero-description">
            基于先进AI技术的智能诗词鉴赏平台，为您提供个性化的诗词学习体验
          </p>
          <div class="hero-actions">
            <el-button type="primary" size="large" @click="startExploring">
              <el-icon><Search /></el-icon>
              开始探索
            </el-button>
            <el-button size="large" @click="viewRandomPoem">
              <el-icon><Refresh /></el-icon>
              随机诗词
            </el-button>
          </div>
        </div>
      </section>

      <!-- 功能特色区域 -->
      <section class="features-section">
        <h3 class="section-title">平台特色</h3>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-card class="feature-card chinese-style" shadow="hover">
              <div class="feature-icon">
                <el-icon size="48"><Cpu /></el-icon>
              </div>
              <h4>AI智能鉴赏</h4>
              <p>三级AI智能体为您提供深度诗词解析和个性化学习体验</p>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-card class="feature-card chinese-style" shadow="hover" @click="viewKnowledgeGraph">
              <div class="feature-icon">
                <el-icon size="48"><Connection /></el-icon>
              </div>
              <h4>知识图谱</h4>
              <p>构建诗词、作者、典故的关联网络，发现文化内在联系</p>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-card class="feature-card chinese-style" shadow="hover">
              <div class="feature-icon">
                <el-icon size="48"><EditPen /></el-icon>
              </div>
              <h4>创作辅导</h4>
              <p>AI为您的诗词创作提供格律检查、意境建议和修改指导</p>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-card class="feature-card chinese-style" shadow="hover">
              <div class="feature-icon">
                <el-icon size="48"><ChatDotRound /></el-icon>
              </div>
              <h4>互动学习</h4>
              <p>与AI进行自然语言对话，获得即时的文化知识问答</p>
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
import { ref, onMounted } from 'vue'
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
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0;
  height: auto;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
}

.logo h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: bold;
}

.logo .subtitle {
  font-size: 0.9rem;
  opacity: 0.8;
}

.nav-menu {
  background: transparent;
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
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 16px;
  margin-bottom: 3rem;
}

.hero-title {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
  font-weight: 600;
}

.hero-description {
  font-size: 1.2rem;
  color: #7f8c8d;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.features-section, .popular-poems {
  margin-bottom: 3rem;
}

.section-title {
  text-align: center;
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 2rem;
  font-weight: 600;
}

.feature-card {
  text-align: center;
  padding: 2rem 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  color: #667eea;
  margin-bottom: 1rem;
}

.feature-card h4 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.feature-card p {
  color: #7f8c8d;
  line-height: 1.6;
}

.poem-card {
  cursor: pointer;
  transition: transform 0.3s ease;
  margin-bottom: 1rem;
}

.poem-card:hover {
  transform: translateY(-3px);
}

.poem-content {
  padding: 1rem;
}

.poem-title {
  font-size: 1.3rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-family: 'KaiTi', '楷体', serif;
}

.poem-author {
  color: #7f8c8d;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.poem-preview {
  font-family: 'KaiTi', '楷体', serif;
  color: #2c3e50;
  margin-bottom: 1rem;
  line-height: 1.8;
}

.poem-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.empty-section {
  text-align: center;
  padding: 2rem 0;
}

.footer {
  background: #2c3e50;
  color: white;
  text-align: center;
  padding: 2rem;
}

.footer-content p {
  margin: 0.5rem 0;
}

.footer-content p:first-child {
  font-weight: 600;
}

.footer-content p:last-child {
  opacity: 0.8;
  font-size: 0.9rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .main-content {
    padding: 1rem;
  }
}
</style>