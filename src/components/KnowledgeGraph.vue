<template>
  <div class="knowledge-graph-container">
    <div class="graph-controls">
      <div class="control-group">
        <el-button-group>
          <el-button 
            :type="graphType === 'force' ? 'primary' : ''"
            @click="graphType = 'force'"
          >
            力导向图
          </el-button>
          <el-button 
            :type="graphType === 'tree' ? 'primary' : ''"
            @click="graphType = 'tree'"
          >
            树状图
          </el-button>
          <el-button 
            :type="graphType === 'circular' ? 'primary' : ''"
            @click="graphType = 'circular'"
          >
            环形图
          </el-button>
        </el-button-group>
      </div>

      <div class="control-group">
        <el-select v-model="selectedCategory" placeholder="选择分类" @change="updateGraph">
          <el-option label="全部" value="all" />
          <el-option label="诗词" value="poems" />
          <el-option label="作者" value="authors" />
          <el-option label="朝代" value="dynasties" />
          <el-option label="主题" value="themes" />
        </el-select>
      </div>

      <div class="control-group">
        <el-input
          v-model="searchNode"
          placeholder="搜索节点..."
          clearable
          @input="highlightNode"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>

    <div class="graph-canvas" ref="graphCanvas">
      <div v-if="loading" class="loading-state">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <p>正在加载知识图谱数据...</p>
      </div>
      
      <div v-else-if="graphData.nodes.length === 0" class="empty-state">
        <el-icon class="empty-icon"><DataBoard /></el-icon>
        <p>暂无数据</p>
      </div>
      
      <div v-else class="graph-visualization">
        <!-- 这里将使用D3.js或ECharts渲染图谱 -->
        <div class="graph-placeholder">
          <h3>知识图谱可视化区域</h3>
          <p>节点数量: {{ graphData.nodes.length }}</p>
          <p>关系数量: {{ graphData.links.length }}</p>
          <div class="graph-stats">
            <el-tag v-for="stat in graphStats" :key="stat.label" :type="stat.type">
              {{ stat.label }}: {{ stat.value }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>

    <div class="graph-sidebar">
      <div class="sidebar-section">
        <h4>节点信息</h4>
        <div v-if="selectedNode" class="node-info">
          <h5>{{ selectedNode.name }}</h5>
          <p class="node-type">{{ selectedNode.type }}</p>
          <div class="node-properties">
            <div v-for="(value, key) in selectedNode.properties" :key="key" class="property">
              <span class="property-key">{{ key }}:</span>
              <span class="property-value">{{ value }}</span>
            </div>
          </div>
        </div>
        <div v-else class="no-selection">
          <p>点击节点查看详情</p>
        </div>
      </div>

      <div class="sidebar-section">
        <h4>图例</h4>
        <div class="legend">
          <div v-for="item in legendItems" :key="item.type" class="legend-item">
            <div class="legend-color" :style="{ backgroundColor: item.color }"></div>
            <span class="legend-label">{{ item.label }}</span>
          </div>
        </div>
      </div>

      <div class="sidebar-section">
        <h4>统计信息</h4>
        <div class="stats">
          <div v-for="stat in graphStats" :key="stat.label" class="stat-item">
            <span class="stat-label">{{ stat.label }}</span>
            <span class="stat-value">{{ stat.value }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Loading, DataBoard } from '@element-plus/icons-vue'
import { getKnowledgeGraph } from '../utils/api'

// 图数据接口
interface GraphNode {
  id: string
  name: string
  type: 'poem' | 'author' | 'dynasty' | 'theme'
  properties: Record<string, any>
  size?: number
  color?: string
}

interface GraphLink {
  source: string
  target: string
  type: string
  strength?: number
}

interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

// 响应式数据
const graphCanvas = ref<HTMLElement>()
const loading = ref(true)
const graphType = ref<'force' | 'tree' | 'circular'>('force')
const selectedCategory = ref('all')
const searchNode = ref('')
const selectedNode = ref<GraphNode | null>(null)

// 图数据
const graphData = reactive<GraphData>({
  nodes: [],
  links: []
})

// 图例配置
const legendItems = [
  { type: 'poem', label: '诗词', color: '#409eff' },
  { type: 'author', label: '作者', color: '#67c23a' },
  { type: 'dynasty', label: '朝代', color: '#e6a23c' },
  { type: 'theme', label: '主题', color: '#f56c6c' }
]

// 统计信息
const graphStats = computed(() => [
  { label: '诗词节点', value: graphData.nodes.filter(n => n.type === 'poem').length, type: 'primary' },
  { label: '作者节点', value: graphData.nodes.filter(n => n.type === 'author').length, type: 'success' },
  { label: '朝代节点', value: graphData.nodes.filter(n => n.type === 'dynasty').length, type: 'warning' },
  { label: '主题节点', value: graphData.nodes.filter(n => n.type === 'theme').length, type: 'danger' },
  { label: '关系数量', value: graphData.links.length, type: 'info' }
])

// 方法
const loadGraphData = async () => {
  try {
    loading.value = true
    const result = await getKnowledgeGraph({
      category: selectedCategory.value,
      depth: 2,
      limit: 100
    })

    if (result.success && result.data) {
      graphData.nodes = result.data.nodes || []
      graphData.links = result.data.links || []
    } else {
      ElMessage.error('加载知识图谱数据失败')
    }
  } catch (error) {
    console.error('加载知识图谱失败:', error)
    ElMessage.error('网络错误，请重试')
  } finally {
    loading.value = false
  }
}

const updateGraph = () => {
  loadGraphData()
}

const highlightNode = () => {
  // 高亮搜索匹配的节点
  console.log('搜索节点:', searchNode.value)
}

const selectNode = (node: GraphNode) => {
  selectedNode.value = node
}

// 初始化
onMounted(() => {
  loadGraphData()
})
</script>

<style scoped>
.knowledge-graph-container {
  display: grid;
  grid-template-columns: 1fr 300px;
  grid-template-rows: auto 1fr;
  gap: 1rem;
  height: 600px;
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.graph-controls {
  grid-column: 1 / -1;
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  background: #f5f7fa;
  border-radius: 4px;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.graph-canvas {
  grid-column: 1;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.graph-sidebar {
  grid-column: 2;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sidebar-section {
  background: #f8f9fa;
  border-radius: 4px;
  padding: 1rem;
}

.sidebar-section h4 {
  margin: 0 0 1rem 0;
  color: #303133;
  font-size: 1rem;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}

.loading-icon, .empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.graph-placeholder {
  padding: 2rem;
  text-align: center;
  color: #606266;
}

.graph-stats {
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.node-info h5 {
  margin: 0 0 0.5rem 0;
  color: #303133;
}

.node-type {
  margin: 0 0 1rem 0;
  color: #909399;
  font-size: 0.9rem;
}

.property {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.3rem;
  font-size: 0.9rem;
}

.property-key {
  color: #606266;
  font-weight: 500;
}

.property-value {
  color: #909399;
}

.legend {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
}

.legend-label {
  font-size: 0.9rem;
  color: #606266;
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.stat-label {
  color: #606266;
}

.stat-value {
  color: #303133;
  font-weight: 500;
}

.no-selection {
  text-align: center;
  color: #909399;
  font-style: italic;
}
</style>