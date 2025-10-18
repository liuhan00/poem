<template>
  <div class="favorites-view">
    <!-- 页面头部 -->
    <el-header class="header">
      <div class="header-content">
        <el-button @click="$router.back()" type="text" class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h1>我的收藏</h1>
        <div class="header-actions">
          <el-button @click="clearAllFavorites" type="danger" size="small" :disabled="favoritePoems.length === 0">
            清空收藏
          </el-button>
        </div>
      </div>
    </el-header>

    <!-- 收藏内容区域 -->
    <el-main class="main-content">
      <div v-if="loading" class="loading-section">
        <el-skeleton :rows="6" animated />
      </div>

      <div v-else-if="favoritePoems.length > 0" class="favorites-container">
        <div class="favorites-stats">
          <el-statistic title="收藏数量" :value="favoritePoems.length" />
          <el-statistic title="诗词朝代" :value="dynastyCount" />
          <el-statistic title="诗人数量" :value="authorCount" />
        </div>

        <div class="favorites-grid">
          <el-row :gutter="16">
            <el-col 
              :xs="24" :sm="12" :md="8" :lg="6" 
              v-for="poem in favoritePoems" 
              :key="poem.id"
            >
              <el-card class="poem-card" shadow="hover">
                <div class="poem-content">
                  <h3 class="poem-title">{{ poem.title }}</h3>
                  <p class="poem-author">{{ poem.dynasty }} · {{ poem.author }}</p>
                  <div class="poem-preview">
                    {{ getPoemPreview(poem.content) }}
                  </div>
                  <div class="poem-tags">
                    <el-tag 
                      v-for="tag in poem.tags.slice(0, 3)" 
                      :key="tag" 
                      size="small"
                      :type="getTagType(tag)"
                    >
                      {{ tag }}
                    </el-tag>
                  </div>
                  <div class="poem-actions">
                    <el-button 
                      @click="viewPoem(poem.id)" 
                      type="primary" 
                      size="small"
                    >
                      查看详情
                    </el-button>
                    <el-button 
                      @click="removeFromFavorites(poem.id)" 
                      type="danger" 
                      size="small"
                    >
                      取消收藏
                    </el-button>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </div>

      <div v-else class="empty-section">
        <el-empty description="您还没有收藏任何诗词" :image-size="200">
          <p class="empty-tip">去探索精彩的诗词世界吧！</p>
          <el-button type="primary" @click="$router.push('/')">
            返回首页
          </el-button>
        </el-empty>
      </div>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '../stores'
import { getPoemDetail, searchPoems } from '../utils/api'
import type { Poem } from '../types/poem'

const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const favoritePoems = ref<Poem[]>([])
const loading = ref(true)

// 计算属性
const dynastyCount = computed(() => {
  const dynasties = new Set(favoritePoems.value.map(poem => poem.dynasty))
  return dynasties.size
})

const authorCount = computed(() => {
  const authors = new Set(favoritePoems.value.map(poem => poem.author))
  return authors.size
})

// 方法
const loadFavorites = async () => {
  try {
    loading.value = true
    // 从本地存储获取收藏的诗词ID列表
    const favoriteIds = JSON.parse(localStorage.getItem('poem_favorites') || '[]')
    
    if (favoriteIds.length === 0) {
      favoritePoems.value = []
      return
    }

    // 批量获取收藏的诗词详情
    const poems: Poem[] = []
    for (const poemId of favoriteIds) {
      try {
        const result = await getPoemDetail(poemId)
        if (result.success && result.data) {
          poems.push(result.data)
        }
      } catch (error) {
        console.warn(`获取诗词 ${poemId} 详情失败:`, error)
      }
    }
    
    favoritePoems.value = poems
  } catch (error) {
    console.error('加载收藏列表失败:', error)
    ElMessage.error('加载收藏列表失败')
  } finally {
    loading.value = false
  }
}

const removeFromFavorites = async (poemId: string) => {
  try {
    await ElMessageBox.confirm(
      '确定要取消收藏这首诗词吗？',
      '取消收藏',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 从本地存储移除收藏
    let favorites = JSON.parse(localStorage.getItem('poem_favorites') || '[]')
    favorites = favorites.filter((id: string) => id !== poemId)
    localStorage.setItem('poem_favorites', JSON.stringify(favorites))
    
    favoritePoems.value = favoritePoems.value.filter(poem => poem.id !== poemId)
    ElMessage.success('已取消收藏')
  } catch (error) {
    // 用户取消操作
  }
}

const clearAllFavorites = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有收藏吗？此操作不可撤销。',
      '清空收藏',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 清空本地存储的收藏
    localStorage.setItem('poem_favorites', '[]')
    favoritePoems.value = []
    ElMessage.success('已清空所有收藏')
  } catch (error) {
    // 用户取消操作
  }
}

const viewPoem = (poemId: string) => {
  router.push(`/poem/${poemId}`)
}

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
    '自然': 'success',
    '爱情': 'danger',
    '友情': 'info',
    '山水': 'success',
    '感慨': 'warning'
  }
  return typeMap[tag] || 'primary'
}

onMounted(() => {
  loadFavorites()
})
</script>

<style scoped>
.favorites-view {
  min-height: 100vh;
  background: #f5f7fa;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
}

.header-content h1 {
  margin: 0;
  font-size: 1.8rem;
}

.back-btn {
  color: white !important;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.favorites-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.favorites-grid {
  margin-top: 2rem;
}

.poem-card {
  height: 100%;
  transition: transform 0.3s ease;
}

.poem-card:hover {
  transform: translateY(-3px);
}

.poem-content {
  padding: 1rem;
}

.poem-title {
  font-size: 1.2rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-family: 'KaiTi', '楷体', serif;
  font-weight: 600;
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
  line-height: 1.6;
  min-height: 3em;
}

.poem-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.poem-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: space-between;
}

.loading-section {
  padding: 2rem 0;
}

.empty-section {
  text-align: center;
  padding: 4rem 0;
}

.empty-tip {
  color: #7f8c8d;
  margin-top: 1rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .favorites-stats {
    grid-template-columns: 1fr;
  }
  
  .poem-actions {
    flex-direction: column;
  }
}
</style>