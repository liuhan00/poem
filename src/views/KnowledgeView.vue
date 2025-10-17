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
            <transition name="fade-slide" mode="out-in">
              <KnowledgeGraph v-if="activeTab === 'graph'" />
            </transition>
          </el-tab-pane>
          <el-tab-pane label="智能搜索" name="search">
            <transition name="fade-slide" mode="out-in">
              <IntelligentSearch v-if="activeTab === 'search'" />
            </transition>
          </el-tab-pane>
          <el-tab-pane label="主题分析" name="analysis">
            <transition name="fade-slide" mode="out-in">
              <div v-if="activeTab === 'analysis'" class="analysis-content">
                <h3>诗词主题分布分析</h3>
                <p>功能开发中...</p>
                <div class="coming-soon">
                  <el-icon class="coming-soon-icon"><DataBoard /></el-icon>
                  <p>即将推出更强大的主题分析功能</p>
                </div>
              </div>
            </transition>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { DataBoard } from '@element-plus/icons-vue'
import KnowledgeGraph from '../components/KnowledgeGraph.vue'
import IntelligentSearch from '../components/IntelligentSearch.vue'

const activeTab = ref('graph')
const isTabChanging = ref(false)

const handleTabChange = async (tab: any) => {
  const tabName = tab.props.name
  console.log('切换到标签:', tabName)
  
  // 添加切换动画效果
  isTabChanging.value = true
  
  // 模拟加载延迟
  await nextTick()
  
  setTimeout(() => {
    isTabChanging.value = false
    ElMessage.success(`已切换到${getTabLabel(tabName)}功能`)
  }, 300)
}

const getTabLabel = (tabName: string) => {
  const labels: Record<string, string> = {
    graph: '知识图谱',
    search: '智能搜索',
    analysis: '主题分析'
  }
  return labels[tabName] || tabName
}
</script>

<style scoped>
.knowledge-view {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 80vh;
}

.view-header {
  text-align: center;
  margin-bottom: 3rem;
  animation: fadeInUp 0.8s ease-out;
}

.view-header h1 {
  color: #303133;
  margin-bottom: 0.5rem;
  font-size: 2.5rem;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: #909399;
  font-size: 1.1rem;
  font-weight: 300;
}

.feature-tabs {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  overflow: hidden;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

:deep(.el-tabs__header) {
  margin: 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

:deep(.el-tabs__nav) {
  border: none !important;
}

:deep(.el-tabs__item) {
  padding: 1rem 2rem;
  font-weight: 500;
  transition: all 0.3s ease;
  border: none !important;
}

:deep(.el-tabs__item:hover) {
  color: #409eff;
  background: rgba(255, 255, 255, 0.8);
}

:deep(.el-tabs__item.is-active) {
  color: #fff;
  background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
}

:deep(.el-tabs__content) {
  padding: 0;
  min-height: 500px;
}

.analysis-content {
  padding: 3rem 2rem;
  text-align: center;
  color: #909399;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.analysis-content h3 {
  margin-bottom: 1rem;
  color: #303133;
  font-size: 1.5rem;
}

.coming-soon {
  margin-top: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  max-width: 400px;
}

.coming-soon-icon {
  font-size: 3rem;
  color: #409eff;
  margin-bottom: 1rem;
}

.coming-soon p {
  margin: 0;
  font-size: 1rem;
  color: #606266;
}

/* 动画效果 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .knowledge-view {
    padding: 1rem;
  }
  
  .view-header h1 {
    font-size: 2rem;
  }
  
  :deep(.el-tabs__item) {
    padding: 0.8rem 1rem;
    font-size: 0.9rem;
  }
}
</style>