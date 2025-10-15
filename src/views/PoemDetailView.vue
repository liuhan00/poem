<template>
  <div class="poem-detail-view">
    <div class="poem-container">
      <div class="poem-header">
        <el-button @click="goBack" type="text" class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
      </div>
      
      <div class="poem-content chinese-style" v-if="poem">
        <h1 class="poem-title">{{ poem.title }}</h1>
        <p class="poem-author">{{ poem.dynasty }} · {{ poem.author }}</p>
        <div class="poem-text">
          {{ poem.content }}
        </div>
        
        <div class="poem-actions">
          <el-button type="primary">
            <el-icon><Star /></el-icon>
            收藏
          </el-button>
          <el-button>
            <el-icon><Share /></el-icon>
            分享
          </el-button>
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
import { ArrowLeft, Star, Share } from '@element-plus/icons-vue'
import { getPoemDetail, recordUserActivity } from '../utils/api'
import type { Poem } from '../types/poem'

const route = useRoute()
const router = useRouter()
const poem = ref<Poem | null>(null)
const loading = ref(true)

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
      
      // 记录用户阅读行为
      await recordUserActivity({
        activity_type: 'read',
        target_type: 'poem',
        target_id: poemId,
        duration: 30, // 假设阅读时长为30秒
        engagement_score: 80
      })
    }
  } catch (error) {
    console.error('加载诗词详情失败:', error)
  } finally {
    loading.value = false
  }
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
  max-width: 800px;
  margin: 0 auto;
}

.back-btn {
  margin-bottom: 2rem;
  color: #667eea;
}

.poem-content {
  background: white;
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  text-align: center;
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
}

.poem-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.loading {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}
</style>