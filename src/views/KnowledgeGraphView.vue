<template>
  <div class="knowledge-graph-view">
    <div class="view-container">
      <h1>诗词知识图谱</h1>
      <p class="subtitle">探索诗词世界的关联网络，发现文化传承的内在联系</p>
      
      <div class="graph-section">
        <KnowledgeGraph />
      </div>
      
      <div class="insights-section">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card class="insight-card">
              <template #header>
                <div class="card-header">
                  <span>热门主题分析</span>
                </div>
              </template>
              <div class="theme-analysis">
                <div 
                  v-for="theme in popularThemes" 
                  :key="theme.name"
                  class="theme-item"
                >
                  <span class="theme-name">{{ theme.name }}</span>
                  <el-progress 
                    :percentage="theme.percentage" 
                    :show-text="false"
                    :color="getThemeColor(theme.name)"
                  />
                  <span class="theme-percentage">{{ theme.percentage }}%</span>
                </div>
              </div>
            </el-card>
          </el-col>
          
          <el-col :span="12">
            <el-card class="insight-card">
              <template #header>
                <div class="card-header">
                  <span>朝代分布</span>
                </div>
              </template>
              <div class="dynasty-distribution">
                <div 
                  v-for="dynasty in dynastyDistribution" 
                  :key="dynasty.name"
                  class="dynasty-item"
                >
                  <span class="dynasty-name">{{ dynasty.name }}</span>
                  <span class="dynasty-count">{{ dynasty.count }}首</span>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import KnowledgeGraph from '@/components/KnowledgeGraph.vue'

// 示例数据
const popularThemes = ref([
  { name: '思乡', percentage: 25 },
  { name: '爱情', percentage: 20 },
  { name: '自然', percentage: 18 },
  { name: '人生', percentage: 15 },
  { name: '豪放', percentage: 12 },
  { name: '婉约', percentage: 10 }
])

const dynastyDistribution = ref([
  { name: '唐', count: 156 },
  { name: '宋', count: 89 },
  { name: '元', count: 34 },
  { name: '明', count: 45 },
  { name: '清', count: 67 },
  { name: '现代', count: 23 }
])

const getThemeColor = (theme: string) => {
  const colorMap: Record<string, string> = {
    '思乡': '#ff6b6b',
    '爱情': '#f368e0',
    '自然': '#1dd1a1',
    '人生': '#54a0ff',
    '豪放': '#ff9f43',
    '婉约': '#a29bfe'
  }
  return colorMap[theme] || '#74b9ff'
}

onMounted(() => {
  console.log('知识图谱页面加载完成')
})
</script>

<style scoped>
.knowledge-graph-view {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem;
}

.view-container {
  max-width: 1400px;
  margin: 0 auto;
}

h1 {
  color: #303133;
  text-align: center;
  margin-bottom: 0.5rem;
  font-size: 2.5rem;
}

.subtitle {
  color: #909399;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.graph-section {
  margin-bottom: 2rem;
}

.insights-section {
  margin-top: 2rem;
}

.insight-card {
  height: 300px;
}

.card-header {
  font-weight: 600;
  color: #303133;
}

.theme-analysis {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.theme-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.theme-name {
  width: 60px;
  font-weight: 500;
  color: #606266;
}

.theme-percentage {
  width: 40px;
  text-align: right;
  color: #909399;
  font-size: 0.9rem;
}

.dynasty-distribution {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dynasty-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.dynasty-name {
  font-weight: 500;
  color: #606266;
}

.dynasty-count {
  color: #909399;
  font-size: 0.9rem;
}
</style>