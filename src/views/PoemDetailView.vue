<template>
  <div class="poem-detail-view">
    <div class="poem-container">
      <div class="poem-header">
        <el-button @click="goBack" type="text" class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
      </div>
      
      <div class="poem-content" v-if="poem">
        <!-- 诗词基本信息 -->
        <div class="poem-basic chinese-style">
          <h1 class="poem-title">{{ poem.title }}</h1>
          <p class="poem-author">{{ poem.dynasty }} · {{ poem.author }}</p>
          <div class="poem-text">
            {{ poem.content }}
          </div>
          
          <div class="poem-tags">
            <el-tag v-for="tag in poem.tags" :key="tag" type="info" size="large">{{ tag }}</el-tag>
          </div>
          
          <div class="poem-actions">
            <el-button 
              @click="toggleFavorite" 
              :type="isFavorite ? 'danger' : 'primary'"
              :icon="Star"
            >
              {{ isFavorite ? '取消收藏' : '收藏' }}
            </el-button>
            <el-button :icon="Share">
              分享
            </el-button>
            <el-button :icon="Download">
              下载
            </el-button>
          </div>
        </div>

        <!-- 诗词详情标签页 -->
        <div class="poem-details">
          <el-tabs v-model="activeTab" type="border-card">
            <el-tab-pane label="注释" name="annotation">
              <div class="tab-content">
                <h3>诗词注释</h3>
                <div class="content-text" v-if="poem.annotation">
                  {{ poem.annotation }}
                </div>
                <div v-else class="no-content">
                  <el-empty description="暂无注释信息" />
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="译文" name="translation">
              <div class="tab-content">
                <h3>现代译文</h3>
                <div class="content-text" v-if="poem.translation">
                  {{ poem.translation }}
                </div>
                <div v-else class="no-content">
                  <el-empty description="暂无译文信息" />
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="赏析" name="appreciation">
              <div class="tab-content">
                <h3>诗词赏析</h3>
                <div class="content-text" v-if="poem.appreciation">
                  {{ poem.appreciation }}
                </div>
                <div v-else class="no-content">
                  <el-empty description="AI正在为您生成赏析内容..." />
                  <el-button type="primary" @click="generateAppreciation" :loading="generating">
                    生成AI赏析
                  </el-button>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="背景" name="background">
              <div class="tab-content">
                <h3>创作背景</h3>
                <div class="content-text" v-if="poem.background">
                  {{ poem.background }}
                </div>
                <div v-else class="no-content">
                  <el-empty description="暂无背景信息" />
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="关联" name="related">
              <div class="tab-content">
                <h3>相关诗词</h3>
                <div class="related-poems">
                  <div 
                    v-for="relatedPoem in relatedPoems" 
                    :key="relatedPoem.id"
                    class="related-poem-item"
                    @click="viewRelatedPoem(relatedPoem.id)"
                  >
                    <h4>{{ relatedPoem.title }}</h4>
                    <p>{{ relatedPoem.dynasty }} · {{ relatedPoem.author }}</p>
                    <div class="poem-preview">{{ relatedPoem.content.split('。')[0] }}。</div>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
      
      <div v-else class="loading">
        <el-skeleton :rows="5" animated />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Star, Share, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getPoemDetail, recordUserActivity, addFavorite, removeFavorite, getPopularPoems } from '../utils/api'
import type { Poem } from '../types/poem'

const route = useRoute()
const router = useRouter()
const poem = ref<Poem | null>(null)
const loading = ref(true)
const activeTab = ref('annotation')
const isFavorite = ref(false)
const generating = ref(false)
const relatedPoems = ref<Poem[]>([])

const goBack = () => {
  router.go(-1)
}

const loadPoemDetail = async () => {
  try {
    loading.value = true
    const poemId = route.params.id as string
    const result = await getPoemDetail(poemId)
    
    if (result.success && result.data) {
      poem.value = result.data
      loadRelatedPoems()
      checkFavoriteStatus(poemId)
      
      // 记录用户阅读行为
      await recordUserActivity({
        activity_type: 'read',
        target_type: 'poem',
        target_id: poemId,
        duration: 30,
        engagement_score: 80
      })
    }
  } catch (error) {
    console.error('加载诗词详情失败:', error)
  } finally {
    loading.value = false
  }
}

const checkFavoriteStatus = async (poemId: string) => {
  try {
    // 从本地存储获取收藏列表
    const favorites = JSON.parse(localStorage.getItem('poem_favorites') || '[]')
    isFavorite.value = favorites.includes(poemId)
  } catch (error) {
    console.error('检查收藏状态失败:', error)
  }
}

const loadRelatedPoems = async () => {
  try {
    const result = await getPopularPoems(4)
    if (result.success && result.data) {
      relatedPoems.value = result.data.filter(p => p.id !== poem.value?.id).slice(0, 3)
    }
  } catch (error) {
    console.error('加载相关诗词失败:', error)
  }
}

const toggleFavorite = async () => {
  if (!poem.value) return
  
  try {
    let favorites = JSON.parse(localStorage.getItem('poem_favorites') || '[]')
    
    if (isFavorite.value) {
      // 取消收藏
      favorites = favorites.filter((id: string) => id !== poem.value!.id)
      localStorage.setItem('poem_favorites', JSON.stringify(favorites))
      isFavorite.value = false
      ElMessage.success('已取消收藏')
    } else {
      // 添加收藏
      if (!favorites.includes(poem.value.id)) {
        favorites.push(poem.value.id)
        localStorage.setItem('poem_favorites', JSON.stringify(favorites))
      }
      isFavorite.value = true
      ElMessage.success('收藏成功')
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
    ElMessage.error('操作失败，请重试')
  }
}

const generateAppreciation = async () => {
  generating.value = true
  try {
    // 模拟AI生成赏析内容
    await new Promise(resolve => setTimeout(resolve, 2000))
    if (poem.value) {
      poem.value.appreciation = `这首《${poem.value.title}》是${poem.value.dynasty}诗人${poem.value.author}的经典作品。诗词通过精妙的意象和深刻的情感表达，展现了${poem.value.author}独特的艺术风格。作品在${poem.value.tags.join('、')}等方面具有很高的艺术价值。`
      ElMessage.success('AI赏析生成成功')
    }
  } catch (error) {
    ElMessage.error('生成失败，请重试')
  } finally {
    generating.value = false
  }
}

const viewRelatedPoem = (poemId: string) => {
  router.push(`/poem/${poemId}`)
}

onMounted(() => {
  loadPoemDetail()
})
</script>

<style scoped>
.poem-detail-view {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem;
}

.poem-container {
  max-width: 1000px;
  margin: 0 auto;
}

.back-btn {
  margin-bottom: 2rem;
  color: #667eea;
}

.poem-basic {
  background: white;
  padding: 3rem;
  border-radius: 12px 12px 0 0;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  text-align: center;
  margin-bottom: 1px;
}

.poem-title {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
  font-family: 'KaiTi', '楷体', serif;
}

.poem-author {
  color: #7f8c8d;
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.poem-text {
  font-family: 'KaiTi', '楷体', serif;
  font-size: 1.5rem;
  line-height: 2;
  color: #2c3e50;
  margin-bottom: 2rem;
  white-space: pre-line;
}

.poem-tags {
  margin-bottom: 2rem;
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.poem-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.poem-details {
  background: white;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.tab-content {
  padding: 2rem;
  min-height: 300px;
}

.tab-content h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
}

.content-text {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #2c3e50;
  white-space: pre-line;
}

.no-content {
  text-align: center;
  padding: 2rem;
}

.related-poems {
  display: grid;
  gap: 1rem;
}

.related-poem-item {
  padding: 1.5rem;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.related-poem-item:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.related-poem-item h4 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-family: 'KaiTi', '楷体', serif;
}

.related-poem-item p {
  color: #7f8c8d;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.poem-preview {
  font-family: 'KaiTi', '楷体', serif;
  color: #2c3e50;
  line-height: 1.6;
}

.loading {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .poem-detail-view {
    padding: 1rem;
  }
  
  .poem-basic {
    padding: 2rem 1rem;
  }
  
  .poem-title {
    font-size: 2rem;
  }
  
  .poem-text {
    font-size: 1.2rem;
  }
  
  .poem-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .tab-content {
    padding: 1rem;
  }
}
</style>