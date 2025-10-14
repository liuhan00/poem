<template>
  <div class="knowledge-view">
    <div class="knowledge-container">
      <h2>知识探索大屏</h2>
      <p>知识图谱可视化功能正在开发中...</p>
      
      <div class="knowledge-stats">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number">1,247</div>
                <div class="stat-label">收录诗词</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number">156</div>
                <div class="stat-label">著名诗人</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number">12</div>
                <div class="stat-label">历史朝代</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number">3,892</div>
                <div class="stat-label">知识关联</div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  console.log('知识探索页面已加载')
})
</script>

<style scoped>
.knowledge-view {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem;
}

.knowledge-container {
  max-width: 1200px;
  margin: 0 auto;
}

.knowledge-stats {
  margin-top: 2rem;
}

.stat-card {
  text-align: center;
}

.stat-content {
  padding: 1rem;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #7f8c8d;
  font-size: 0.9rem;
}
</style>