<template>
  <div class="creation-view">
    <div class="creation-container">
      <h2>诗词创作界面</h2>
      <p>创建新的诗词作品</p>
      
      <div class="creation-form">
        <el-form :model="poemForm" label-width="80px">
          <el-form-item label="诗词标题">
            <el-input v-model="poemForm.title" placeholder="请输入诗词标题" />
          </el-form-item>
          
          <el-form-item label="作者">
            <el-input v-model="poemForm.author" placeholder="请输入作者姓名" />
          </el-form-item>
          
          <el-form-item label="朝代">
            <el-select v-model="poemForm.dynasty" placeholder="请选择朝代">
              <el-option label="唐" value="唐" />
              <el-option label="宋" value="宋" />
              <el-option label="元" value="元" />
              <el-option label="明" value="明" />
              <el-option label="清" value="清" />
              <el-option label="现代" value="现代" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="诗词内容">
            <el-input
              v-model="poemForm.content"
              type="textarea"
              :rows="6"
              placeholder="请输入诗词内容"
              class="poem-editor"
            />
          </el-form-item>
          
          <el-form-item label="标签">
            <div class="tags-input">
              <el-input
                v-model="tagInput"
                placeholder="输入标签后按回车添加"
                @keyup.enter="addTag"
              />
              <el-button @click="addTag" type="primary">
                <el-icon><Plus /></el-icon>
              </el-button>
            </div>
            <div class="tags-list">
              <el-tag
                v-for="(tag, index) in poemForm.tags"
                :key="index"
                closable
                @close="removeTag(index)"
              >
                {{ tag }}
              </el-tag>
            </div>
          </el-form-item>
          
          <el-form-item label="注释">
            <el-input
              v-model="poemForm.annotation"
              type="textarea"
              :rows="3"
              placeholder="请输入注释"
            />
          </el-form-item>
          
          <el-form-item label="译文">
            <el-input
              v-model="poemForm.translation"
              type="textarea"
              :rows="3"
              placeholder="请输入译文"
            />
          </el-form-item>
        </el-form>
        
        <div class="creation-actions">
          <el-button type="primary" @click="savePoem">
            <el-icon><EditPen /></el-icon>
            保存诗词
          </el-button>
          <el-button @click="aiAssist">
            <el-icon><Check /></el-icon>
            AI辅助创作
          </el-button>
          <el-button @click="checkRhythm">
            <el-icon><Check /></el-icon>
            格律检查
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { EditPen, Check, Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { createPoem } from '@/utils/api'

// 诗词表单数据
const poemForm = reactive({
  title: '',
  author: '',
  dynasty: '唐',
  content: '',
  tags: [] as string[],
  annotation: '',
  translation: ''
})

const tagInput = ref('')

// 添加标签
const addTag = () => {
  if (tagInput.value && !poemForm.tags.includes(tagInput.value)) {
    poemForm.tags.push(tagInput.value)
    tagInput.value = ''
  }
}

// 删除标签
const removeTag = (index: number) => {
  poemForm.tags.splice(index, 1)
}

// 保存诗词
const savePoem = async () => {
  try {
    if (!poemForm.title || !poemForm.content) {
      ElMessage.error('请填写标题和内容')
      return
    }

    const poemData = {
      title: poemForm.title,
      author: poemForm.author,
      dynasty: poemForm.dynasty,
      content: poemForm.content,
      tags: poemForm.tags,
      annotation: poemForm.annotation,
      translation: poemForm.translation
    }

    await createPoem(poemData)
    ElMessage.success('诗词保存成功')
    
    // 重置表单
    Object.assign(poemForm, {
      title: '',
      author: '',
      dynasty: '唐',
      content: '',
      tags: [],
      annotation: '',
      translation: ''
    })
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

// 格律检查
const checkRhythm = () => {
  ElMessage.info('格律检查功能开发中')
}

// AI辅助创作
const aiAssist = () => {
  ElMessage.info('AI辅助创作功能开发中')
}
</script>

<style scoped>
.creation-view {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem;
}

.creation-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.creation-form {
  margin-top: 2rem;
}

.poem-editor {
  font-family: 'KaiTi', '楷体', serif;
  font-size: 16px;
  line-height: 1.8;
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

.creation-actions {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
}
</style>