<template>
  <div class="knowledge-view">
    <div class="knowledge-container">
      <h2>诗词知识库管理</h2>
      <p>管理所有诗词作品，支持查看、编辑和删除操作</p>
      
      <div class="knowledge-stats">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number">{{ poemCount }}</div>
                <div class="stat-label">收录诗词</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number">{{ authorCount }}</div>
                <div class="stat-label">著名诗人</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number">{{ dynastyCount }}</div>
                <div class="stat-label">历史朝代</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number">{{ favoriteCount }}</div>
                <div class="stat-label">用户收藏</div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <div class="poem-management">
        <div class="management-header">
          <el-input
            v-model="searchQuery"
            placeholder="搜索诗词标题、作者或内容"
            style="width: 300px"
            @input="handleSearch"
          >
            <template #append>
              <el-button :icon="Search" />
            </template>
          </el-input>
          
          <el-button type="primary" @click="refreshPoems">
            <el-icon><Refresh /></el-icon>
            刷新列表
          </el-button>
        </div>

        <el-table :data="filteredPoems" style="width: 100%" v-loading="loading">
          <el-table-column prop="title" label="诗词标题" width="200" />
          <el-table-column prop="author" label="作者" width="120" />
          <el-table-column prop="dynasty" label="朝代" width="80" />
          <el-table-column prop="content" label="内容" :show-overflow-tooltip="true" />
          <el-table-column prop="tags" label="标签" width="120">
            <template #default="scope">
              <el-tag
                v-for="tag in scope.row.tags"
                :key="tag"
                size="small"
                style="margin-right: 4px"
              >
                {{ tag }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="scope">
              <el-button size="small" @click="editPoem(scope.row)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button size="small" type="danger" @click="deletePoemHandler(scope.row.id)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 编辑诗词对话框 -->
      <el-dialog v-model="editDialogVisible" title="编辑诗词" width="600px">
        <el-form :model="editForm" label-width="80px">
          <el-form-item label="诗词标题">
            <el-input v-model="editForm.title" />
          </el-form-item>
          <el-form-item label="作者">
            <el-input v-model="editForm.author" />
          </el-form-item>
          <el-form-item label="朝代">
            <el-select v-model="editForm.dynasty">
              <el-option label="唐" value="唐" />
              <el-option label="宋" value="宋" />
              <el-option label="元" value="元" />
              <el-option label="明" value="明" />
              <el-option label="清" value="清" />
              <el-option label="现代" value="现代" />
            </el-select>
          </el-form-item>
          <el-form-item label="诗词内容">
            <el-input v-model="editForm.content" type="textarea" :rows="4" />
          </el-form-item>
          <el-form-item label="标签">
            <div class="tags-input">
              <el-input
                v-model="editTagInput"
                placeholder="输入标签"
                @keyup.enter="addEditTag"
              />
              <el-button @click="addEditTag" type="primary">
                <el-icon><Plus /></el-icon>
              </el-button>
            </div>
            <div class="tags-list">
              <el-tag
                v-for="(tag, index) in editForm.tags"
                :key="index"
                closable
                @close="removeEditTag(index)"
              >
                {{ tag }}
              </el-tag>
            </div>
          </el-form-item>
          <el-form-item label="注释">
            <el-input v-model="editForm.annotation" type="textarea" :rows="2" />
          </el-form-item>
          <el-form-item label="译文">
            <el-input v-model="editForm.translation" type="textarea" :rows="2" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveEdit">保存</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Edit, Delete, Plus } from '@element-plus/icons-vue'
import { getAllPoems, updatePoem, deletePoem } from '@/utils/api'
import type { Poem } from '@/types/poem'

const loading = ref(false)
const searchQuery = ref('')
const editDialogVisible = ref(false)
const editTagInput = ref('')

const poemCount = ref(0)
const authorCount = ref(0)
const dynastyCount = ref(0)
const favoriteCount = ref(0)

const poems = ref<Poem[]>([])
const editForm = reactive({
  id: '',
  title: '',
  author: '',
  dynasty: '',
  content: '',
  tags: [] as string[],
  annotation: '',
  translation: ''
})

// 过滤后的诗词列表
const filteredPoems = computed(() => {
  if (!searchQuery.value) return poems.value
  
  const query = searchQuery.value.toLowerCase()
  return poems.value.filter(poem => 
    poem.title.toLowerCase().includes(query) ||
    poem.author.toLowerCase().includes(query) ||
    poem.content.toLowerCase().includes(query) ||
    poem.tags.some(tag => tag.toLowerCase().includes(query))
  )
})

// 加载诗词数据
const loadPoems = async () => {
  try {
    loading.value = true
    const data = await getAllPoems()
    poems.value = data
    poemCount.value = data.length
    authorCount.value = new Set(data.map(p => p.author)).size
    dynastyCount.value = new Set(data.map(p => p.dynasty)).size
    favoriteCount.value = data.filter(p => (p as any).is_favorite).length
  } catch (error) {
    ElMessage.error('加载诗词数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  // 搜索逻辑已通过computed属性实现
}

// 刷新列表
const refreshPoems = () => {
  loadPoems()
}

// 编辑诗词
const editPoem = (poem: Poem) => {
  Object.assign(editForm, {
    id: poem.id,
    title: poem.title,
    author: poem.author,
    dynasty: poem.dynasty,
    content: poem.content,
    tags: [...poem.tags],
    annotation: poem.annotation || '',
    translation: poem.translation || ''
  })
  editDialogVisible.value = true
}

// 添加编辑标签
const addEditTag = () => {
  if (editTagInput.value && !editForm.tags.includes(editTagInput.value)) {
    editForm.tags.push(editTagInput.value)
    editTagInput.value = ''
  }
}

// 删除编辑标签
const removeEditTag = (index: number) => {
  editForm.tags.splice(index, 1)
}

// 保存编辑
const saveEdit = async () => {
  try {
    if (!editForm.title || !editForm.content) {
      ElMessage.error('请填写标题和内容')
      return
    }

    await updatePoem(editForm.id, editForm)
    ElMessage.success('诗词更新成功')
    editDialogVisible.value = false
    loadPoems()
  } catch (error) {
    ElMessage.error('更新失败')
  }
}

// 删除诗词
const deletePoemHandler = async (poemId: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这首诗词吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const result = await deletePoem(poemId)
    if (!result.success) throw new Error(result.error)

    ElMessage.success('诗词删除成功')
    loadPoems()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadPoems()
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

.poem-management {
  margin-top: 2rem;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.tags-input {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>