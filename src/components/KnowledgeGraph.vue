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
        <!-- 交互式SVG图谱 -->
        <svg :width="svgWidth" :height="svgHeight" class="graph-svg">
          <!-- 连接线 -->
          <g class="links">
            <line
              v-for="link in visibleLinks"
              :key="link.id"
              :x1="getNodeX(link.source)"
              :y1="getNodeY(link.source)"
              :x2="getNodeX(link.target)"
              :y2="getNodeY(link.target)"
              class="link"
              :class="{ highlighted: isLinkHighlighted(link) }"
            />
          </g>
          
          <!-- 节点 -->
          <g class="nodes">
            <circle
              v-for="node in visibleNodes"
              :key="node.id"
              :cx="getNodeX(node.id)"
              :cy="getNodeY(node.id)"
              :r="getNodeSize(node)"
              :class="[
                'node',
                `node-${node.type}`,
                { 
                  selected: selectedNode?.id === node.id,
                  highlighted: isNodeHighlighted(node),
                  hovered: hoveredNode?.id === node.id
                }
              ]"
              @click="selectNode(node)"
              @mouseenter="hoverNode(node)"
              @mouseleave="unhoverNode"
            />
            
            <!-- 节点标签 -->
            <text
              v-for="node in visibleNodes"
              :key="`label-${node.id}`"
              :x="getNodeX(node.id) + getNodeSize(node) + 5"
              :y="getNodeY(node.id)"
              class="node-label"
              :class="{ 
                selected: selectedNode?.id === node.id,
                highlighted: isNodeHighlighted(node)
              }"
            >
              {{ getNodeLabel(node) }}
            </text>
          </g>
        </svg>
      </div>
    </div>

    <div class="graph-sidebar">
      <div class="sidebar-section">
        <h4>节点信息</h4>
        <div v-if="selectedNode" class="node-info">
          <h5>{{ selectedNode.name }}</h5>
          <p class="node-type">{{ getNodeTypeLabel(selectedNode.type) }}</p>
          <div class="node-properties">
            <div v-for="(value, key) in selectedNode.properties" :key="key" class="property">
              <span class="property-key">{{ key }}:</span>
              <span class="property-value">{{ value }}</span>
            </div>
          </div>
          <div class="node-actions">
            <el-button type="primary" size="small" @click="expandNode(selectedNode)">
              展开关联
            </el-button>
            <el-button size="small" @click="centerOnNode(selectedNode)">
              居中显示
            </el-button>
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
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
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
  id: string
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
const hoveredNode = ref<GraphNode | null>(null)
const svgWidth = ref(800)
const svgHeight = ref(500)

// 图数据
const graphData = reactive<GraphData>({
  nodes: [],
  links: []
})

// 节点位置数据
const nodePositions = reactive<Record<string, { x: number; y: number }>>({})

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

// 可见节点和连接
const visibleNodes = computed(() => graphData.nodes)
const visibleLinks = computed(() => graphData.links)

// 方法
const loadGraphData = async () => {
  try {
    loading.value = true
    const result = await getKnowledgeGraph({
      depth: 2,
      limit: 50
    })

    if (result.success && result.data) {
      graphData.nodes = result.data.nodes || []
      graphData.links = result.data.links || []
      await nextTick()
      initializeNodePositions()
    } else {
      // API调用失败时使用示例数据
      ElMessage.warning('使用示例数据展示')
      loadSampleData()
    }
  } catch (error) {
    console.error('加载知识图谱失败:', error)
    // 网络错误时使用示例数据
    ElMessage.warning('网络错误，使用示例数据展示')
    loadSampleData()
  } finally {
    loading.value = false
  }
}

const loadSampleData = () => {
  // 示例知识图谱数据
  graphData.nodes = [
    {
      id: 'poem_1',
      name: '静夜思',
      type: 'poem',
      properties: {
        author: '李白',
        dynasty: '唐',
        content: '床前明月光，疑是地上霜。举头望明月，低头思故乡。',
        tags: ['思乡', '月亮']
      },
      size: 8,
      color: '#409eff'
    },
    {
      id: 'author_1',
      name: '李白',
      type: 'author',
      properties: {
        dynasty: '唐',
        biography: '唐代著名浪漫主义诗人'
      },
      size: 6,
      color: '#67c23a'
    },
    {
      id: 'dynasty_唐',
      name: '唐',
      type: 'dynasty',
      properties: {
        period: '618-907年'
      },
      size: 5,
      color: '#e6a23c'
    },
    {
      id: 'theme_思乡',
      name: '思乡',
      type: 'theme',
      properties: {},
      size: 4,
      color: '#f56c6c'
    },
    {
      id: 'poem_2',
      name: '春晓',
      type: 'poem',
      properties: {
        author: '孟浩然',
        dynasty: '唐',
        content: '春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。',
        tags: ['春天', '自然']
      },
      size: 7,
      color: '#409eff'
    },
    {
      id: 'author_2',
      name: '孟浩然',
      type: 'author',
      properties: {
        dynasty: '唐',
        biography: '唐代山水田园诗人'
      },
      size: 6,
      color: '#67c23a'
    }
  ]

  graphData.links = [
    { id: 'link1', source: 'poem_1', target: 'author_1', type: '作者' },
    { id: 'link2', source: 'poem_1', target: 'dynasty_唐', type: '朝代' },
    { id: 'link3', source: 'poem_1', target: 'theme_思乡', type: '主题' },
    { id: 'link4', source: 'author_1', target: 'dynasty_唐', type: '所属朝代' },
    { id: 'link5', source: 'poem_2', target: 'author_2', type: '作者' },
    { id: 'link6', source: 'poem_2', target: 'dynasty_唐', type: '朝代' },
    { id: 'link7', source: 'author_2', target: 'dynasty_唐', type: '所属朝代' }
  ]

  nextTick(() => {
    initializeNodePositions()
  })
}

const initializeNodePositions = () => {
  // 简单的力导向布局算法
  const centerX = svgWidth.value / 2
  const centerY = svgHeight.value / 2
  const radius = Math.min(svgWidth.value, svgHeight.value) / 3
  
  graphData.nodes.forEach((node, index) => {
    const angle = (index / graphData.nodes.length) * 2 * Math.PI
    const distance = radius * (0.5 + Math.random() * 0.5)
    
    nodePositions[node.id] = {
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance
    }
  })
}

const getNodeX = (nodeId: string) => {
  return nodePositions[nodeId]?.x || svgWidth.value / 2
}

const getNodeY = (nodeId: string) => {
  return nodePositions[nodeId]?.y || svgHeight.value / 2
}

const getNodeSize = (node: GraphNode) => {
  return node.size || 8
}

const getNodeLabel = (node: GraphNode) => {
  return node.name.length > 8 ? node.name.substring(0, 8) + '...' : node.name
}

const getNodeTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    poem: '诗词',
    author: '作者',
    dynasty: '朝代',
    theme: '主题'
  }
  return labels[type] || type
}

const isNodeHighlighted = (node: GraphNode) => {
  if (!searchNode.value) return false
  return node.name.toLowerCase().includes(searchNode.value.toLowerCase())
}

const isLinkHighlighted = (link: GraphLink) => {
  if (!selectedNode.value) return false
  return link.source === selectedNode.value.id || link.target === selectedNode.value.id
}

const selectNode = (node: GraphNode) => {
  selectedNode.value = node
  ElMessage.success(`已选择: ${node.name} (${getNodeTypeLabel(node.type)})`)
}

const hoverNode = (node: GraphNode) => {
  hoveredNode.value = node
}

const unhoverNode = () => {
  hoveredNode.value = null
}

const expandNode = (node: GraphNode) => {
  ElMessage.info(`展开 ${node.name} 的关联节点`)
  // 这里可以添加展开关联节点的逻辑
}

const centerOnNode = (node: GraphNode) => {
  ElMessage.info(`将 ${node.name} 居中显示`)
  // 这里可以添加居中显示节点的逻辑
}

const updateGraph = () => {
  loadGraphData()
}

const highlightNode = () => {
  // 搜索高亮逻辑已经在computed属性中实现
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
  background: #fafafa;
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

.graph-visualization {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.graph-svg {
  width: 100%;
  height: 100%;
}

/* 连接线样式 */
.link {
  stroke: #ccc;
  stroke-width: 1;
  transition: all 0.3s ease;
}

.link.highlighted {
  stroke: #409eff;
  stroke-width: 3;
}

/* 节点样式 */
.node {
  fill: #409eff;
  stroke: #fff;
  stroke-width: 2;
  cursor: pointer;
  transition: all 0.3s ease;
}

.node-poem {
  fill: #409eff;
}

.node-author {
  fill: #67c23a;
}

.node-dynasty {
  fill: #e6a23c;
}

.node-theme {
  fill: #f56c6c;
}

.node:hover {
  stroke-width: 3;
  r: 10;
}

.node.highlighted {
  stroke: #ff6b6b;
  stroke-width: 3;
  r: 12;
  filter: drop-shadow(0 0 8px rgba(255, 107, 107, 0.6));
}

.node.selected {
  stroke: #409eff;
  stroke-width: 4;
  r: 14;
  filter: drop-shadow(0 0 12px rgba(64, 158, 255, 0.8));
}

.node.hovered {
  r: 11;
}

/* 节点标签样式 */
.node-label {
  font-size: 12px;
  fill: #606266;
  font-weight: 500;
  pointer-events: none;
  transition: all 0.3s ease;
}

.node-label.highlighted {
  fill: #ff6b6b;
  font-weight: 600;
}

.node-label.selected {
  fill: #409eff;
  font-weight: 600;
  font-size: 14px;
}

.node-info h5 {
  margin: 0 0 0.5rem 0;
  color: #303133;
  font-size: 1.1rem;
}

.node-type {
  margin: 0 0 1rem 0;
  color: #909399;
  font-size: 0.9rem;
  font-weight: 500;
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
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-actions {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
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
  padding: 2rem 0;
}
</style>