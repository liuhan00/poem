<template>
  <div class="intelligent-search-container">
    <div class="search-header">
      <h2>智能诗词搜索</h2>
      <p>基于AI的自然语言搜索，理解您的搜索意图</p>
    </div>

    <div class="search-input-section">
      <el-input
        v-model="searchQuery"
        placeholder="例如：描写月亮的思乡诗、李白豪放风格的作品、宋代婉约词..."
        @keyup.enter="handleSearch"
        size="large"
        clearable
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
        <template #append>
          <el-button @click="handleSearch" type="primary" :loading="searching">
            智能搜索
          </el-button>
        </template>
      </el-input>

      <div class="search-options">
        <el-radio-group v-model="searchType" @change="handleSearch">
          <el-radio label="semantic">语义搜索</el-radio>
          <el-radio label="keyword">关键词搜索</el-radio>
          <el-radio label="hybrid">混合搜索</el-radio>
        </el-radio-group>

        <el-button @click="showAdvancedFilters = !showAdvancedFilters" type="text">
          <el-icon><Filter /></el-icon>
          高级筛选
        </el-button>
      </div>

      <div v-if="showAdvancedFilters" class="advanced-filters">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-select v-model="filters.dynasty" multiple placeholder="选择朝代" @change="handleSearch">
              <el-option label="唐" value="唐" />
              <el-option label="宋" value="宋" />
              <el-option label="元" value="元" />
              <el-option label="明" value="明" />
              <el-option label="清" value="清" />
              <el-option label="现代" value="现代" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="filters.author" multiple filterable placeholder="选择作者" @change="handleSearch">
              <el-option v-for="author in availableAuthors" :key="author" :label="author" :value="author" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="filters.theme" multiple placeholder="选择主题" @change="handleSearch">
              <el-option v-for="theme in availableThemes" :key="theme" :label="theme" :value="theme" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-slider v-model="filters.difficulty_level" range :min="1" :max="5" :marks="difficultyMarks" @change="handleSearch" />
          </el-col>
        </el-row>
      </div>
    </div>

    <div v-if="searchResult" class="search-results">
      <!-- 搜索意图分析 -->
      <div class="intent-analysis">
        <el-card>
          <template #header>
            <div class="intent-header">
              <span>搜索意图分析</span>
              <el-tag :type="getConfidenceTag(searchResult.confidence_score)">
                置信度: {{ (searchResult.confidence_score * 100).toFixed(1) }}%
              </el-tag>
            </div>
          </template>
          <p>{{ searchResult.search_intent }}</p>
          <div class="related-concepts">
            <span class="concepts-label">相关概念:</span>
            <el-tag 
              v-for="concept in searchResult.related_concepts" 
              :key="concept"
              size="small"
              type="info"
            >
              {{ concept }}
            </el-tag>
          </div>
        </el-card>
      </div>

      <!-- 搜索结果 -->
      <div class="results-section">
        <div class="results-tabs">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="诗词作品" name="poems">
              <div class="poems-grid">
                <div 
                  v-for="poem in searchResult.poems" 
                  :key="poem.id"
                  class="poem-card"
                  @click="selectPoem(poem)"
                >
                  <div class="poem-header">
                    <h4 class="poem-title">{{ poem.title }}</h4>
                    <span class="poem-author">{{ poem.dynasty }} · {{ poem.author }}</span>
                  </div>
                  <div class="poem-preview">
                    {{ getPoemPreview(poem.content) }}
                  </div>
                  <div class="poem-meta">
                    <el-rate v-model="poem.difficulty_level" disabled size="small" />
                    <el-tag v-for="tag in poem.tags" :key="tag" size="small">{{ tag }}</el-tag>
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="相关作者" name="authors" v-if="searchResult.authors.length > 0">
              <div class="authors-list">
                <div 
                  v-for="author in searchResult.authors" 
                  :key="author.id"
                  class="author-card"
                >
                  <div class="author-avatar">
                    <el-avatar :size="50" :src="author.portrait_url">
                      {{ author.name.charAt(0) }}
                    </el-avatar>
                  </div>
                  <div class="author-info">
                    <h5>{{ author.name }}</h5>
                    <p class="author-dynasty">{{ author.dynasty }}</p>
                    <p class="author-style" v-if="author.literary_style">
                      {{ author.literary_style }}
                    </p>
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="主题分析" name="themes" v-if="searchResult.themes.length > 0">
              <div class="themes-analysis">
                <div class="theme-cloud">
                  <span 
                    v-for="theme in searchResult.themes" 
                    :key="theme"
                    class="theme-tag"
                    :style="{ fontSize: getThemeFontSize(theme) }"
                  >
                    {{ theme }}
                  </span>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>

    <div v-else-if="searching" class="searching-state">
      <el-icon class="searching-icon"><Loading /></el-icon>
      <p>AI正在分析您的搜索意图...</p>
    </div>

    <div v-else class="welcome-state">
      <div class="welcome-content">
        <el-icon class="welcome-icon"><Search /></el-icon>
        <h3>开始智能搜索</h3>
        <p>尝试输入自然语言描述，AI将理解您的搜索意图</p>
        
        <div class="example-queries">
          <h4>搜索示例:</h4>
          <div class="examples">
            <el-tag 
              v-for="example in exampleQueries" 
              :key="example"
              class="example-tag"
              @click="searchQuery = example; handleSearch()"
            >
              {{ example }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Filter, Loading } from '@element-plus/icons-vue'
import { intelligentSearch, getAllPoems } from '../utils/api'
import type { IntelligentSearchResult, Poem, Author } from '../types/poem'

// 响应式数据
const searchQuery = ref('')
const searching = ref(false)
const searchType = ref('semantic')
const showAdvancedFilters = ref(false)
const activeTab = ref('poems')
const searchResult = ref<IntelligentSearchResult | null>(null)

// 筛选条件
const filters = reactive({
  dynasty: [] as string[],
  author: [] as string[],
  theme: [] as string[],
  difficulty_level: [1, 5] as number[]
})

// 示例数据
const availableAuthors = ref<string[]>([])
const availableThemes = ref<string[]>(['思乡', '爱情', '自然', '人生', '豪放', '婉约', '山水', '田园'])
const difficultyMarks = {
  1: '简单',
  3: '中等',
  5: '困难'
}

const exampleQueries = [
  '描写月亮的思乡诗',
  '李白豪放风格的作品',
  '宋代婉约词代表作',
  '表达人生感慨的唐诗',
  '山水田园诗精选'
]

// 方法
const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    ElMessage.warning('请输入搜索内容')
    return
  }

  try {
    searching.value = true
    const params = {
      query: searchQuery.value,
      search_type: searchType.value as any,
      filters: {
        dynasty: filters.dynasty,
        author: filters.author,
        theme: filters.theme,
        difficulty_level: filters.difficulty_level
      },
      limit: 20
    }

    const result = await intelligentSearch(params)
    
    if (result.success && result.data) {
      searchResult.value = result.data
      ElMessage.success(`找到 ${result.data.poems.length} 首相关诗词`)
    } else {
      ElMessage.error('搜索失败，请重试')
    }
  } catch (error) {
    console.error('智能搜索失败:', error)
    ElMessage.error('搜索失败')
  } finally {
    searching.value = false
  }
}

const getConfidenceTag = (confidence: number) => {
  if (confidence > 0.8) return 'success'
  if (confidence > 0.6) return 'warning'
  return 'danger'
}

const getPoemPreview = (content: string) => {
  return content.split('。')[0] + '。'
}

const getThemeFontSize = (theme: string) => {
  const lengths = searchResult.value?.themes.map(t => t.length) || []
  const maxLength = Math.max(...lengths)
  const minLength = Math.min(...lengths)
  const lengthRange = maxLength - minLength
  const themeLength = theme.length
    
  if (lengthRange === 0) return '1rem'
    
  const ratio = (themeLength - minLength) / lengthRange
  return `${0.8 + ratio * 0.8}rem`
}

const selectPoem = (poem: Poem) => {
  // 这里可以触发路由跳转到诗词详情页
  console.log('选择诗词:', poem)
  ElMessage.info(`查看《${poem.title}》详情`)
}

const loadAvailableData = async () => {
  try {
    const poems = await getAllPoems()
    const authors = [...new Set(poems.map(p => p.author))]
    availableAuthors.value = authors
  } catch (error) {
    console.error('加载可用数据失败:', error)
  }
}

onMounted(() => {
  loadAvailableData()
})
</script>

<style scoped>
.intelligent-search-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.search-header {
  text-align: center;
  margin-bottom: 2rem;
}

.search-header h2 {
  color: #303133;
  margin-bottom: 0.5rem;
}

.search-header p {
  color: #909399;
}

.search-input-section {
  margin-bottom: 2rem;
}

.search-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.advanced-filters {
  margin-top: 1rem;
  padding: 1rem;
  background: #f5f7fa;
  border-radius: 4px;
}

.intent-analysis {
  margin-bottom: 2rem;
}

.intent-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.related-concepts {
  margin-top: 1rem;
}

.concepts-label {
  margin-right: 0.5rem;
  color: #606266;
}

.poems-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.poem-card {
  padding: 1rem;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.poem-card:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.1);
}

.poem-header {
  margin-bottom: 0.8rem;
}

.poem-title {
  margin: 0 0 0.3rem 0;
  color: #303133;
  font-family: 'KaiTi', '楷体', serif;
}

.poem-author {
  color: #909399;
  font-size: 0.9rem;
}

.poem-preview {
  font-family: 'KaiTi', '楷体', serif;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 0.8rem;
}

.poem-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.authors-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.author-card {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}

.author-avatar {
  margin-right: 1rem;
}

.author-info h5 {
  margin: 0 0 0.3rem 0;
  color: #303133;
}

.author-dynasty {
  margin: 0;
  color: #909399;
  font-size: 0.9rem;
}

.author-style {
  margin: 0.3rem 0 0 0;
  color: #606266;
  font-size: 0.8rem;
}

.theme-cloud {
  text-align: center;
  line-height: 2.5;
}

.theme-tag {
  margin: 0 0.5rem;
  cursor: pointer;
  transition: all 0.3s;
}

.theme-tag:hover {
  color: #409eff;
}

.searching-state, .welcome-state {
  text-align: center;
  padding: 4rem 2rem;
}

.searching-icon, .welcome-icon {
  font-size: 3rem;
  color: #409eff;
  margin-bottom: 1rem;
}

.welcome-content h3 {
  color: #303133;
  margin-bottom: 0.5rem;
}

.welcome-content p {
  color: #909399;
  margin-bottom: 2rem;
}

.example-queries h4 {
  color: #606266;
  margin-bottom: 1rem;
}

.examples {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.example-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.example-tag:hover {
  background: #409eff;
  color: white;
}
</style>