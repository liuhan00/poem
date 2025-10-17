<template>
  <div class="knowledge-view">
    <div class="view-header">
      <h1>诗词知识图谱</h1>
      <p class="subtitle">探索诗词之间的关联关系和知识网络</p>
    </div>

    <div class="view-content">
      <div class="feature-tabs">
        <el-tabs v-model="activeTab" type="card" @tab-click="handleTabChange">
          <el-tab-pane label="知识图谱" name="graph">
            <KnowledgeGraph />
          </el-tab-pane>
          <el-tab-pane label="智能搜索" name="search">
            <IntelligentSearch />
          </el-tab-pane>
          <el-tab-pane label="主题分析" name="analysis">
            <div class="analysis-content">
              <h3>诗词主题分布分析</h3>
              <p>功能开发中...</p>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import KnowledgeGraph from '../components/KnowledgeGraph.vue'
import IntelligentSearch from '../components/IntelligentSearch.vue'

const activeTab = ref('graph')

const handleTabChange = (tab: any) => {
  console.log('切换到标签:', tab.props.name)
  // 这里可以添加标签切换时的逻辑
}
</script>

<style scoped>
.knowledge-view {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.view-header {
  text-align: center;
  margin-bottom: 2rem;
}

.view-header h1 {
  color: #303133;
  margin-bottom: 0.5rem;
  font-size: 2.5rem;
  font-weight: 600;
}

.subtitle {
  color: #909399;
  font-size: 1.1rem;
}

.feature-tabs {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  overflow: hidden;
}

:deep(.el-tabs__header) {
  margin: 0;
}

:deep(.el-tabs__content) {
  padding: 0;
}

.analysis-content {
  padding: 2rem;
  text-align: center;
  color: #909399;
}

.analysis-content h3 {
  margin-bottom: 1rem;
  color: #303133;
}
</style>