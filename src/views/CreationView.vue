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
          <el-button @click="aiAssist" type="success">
            <el-icon><MagicStick /></el-icon>
            AI辅助创作
          </el-button>
          <el-button @click="checkRhythm" type="warning">
            <el-icon><DocumentChecked /></el-icon>
            格律检查
          </el-button>
          <el-button @click="clearForm" type="danger">
            <el-icon><Delete /></el-icon>
            清空表单
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { EditPen, Plus, Delete, MagicStick, DocumentChecked } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
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
      translation: poemForm.translation,
      difficulty_level: 3,
      popularity: 0
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

// 清空表单
const clearForm = () => {
  ElMessageBox.confirm(
    '确定要清空表单吗？所有输入内容将被清除。',
    '清空表单',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    Object.assign(poemForm, {
      title: '',
      author: '',
      dynasty: '唐',
      content: '',
      tags: [],
      annotation: '',
      translation: ''
    })
    ElMessage.success('表单已清空')
  }).catch(() => {
    // 用户取消操作
  })
}

// 格律检查
const checkRhythm = async () => {
  if (!poemForm.content) {
    ElMessage.warning('请先输入诗词内容')
    return
  }

  try {
    const rhythmResult = await analyzeRhythm(poemForm.content)
    ElMessage.success('格律检查完成')
    
    // 显示格律检查结果
    ElMessageBox.alert(rhythmResult.analysis, '格律检查结果', {
      confirmButtonText: '确定',
      dangerouslyUseHTMLString: true
    })
  } catch (error) {
    ElMessage.error('格律检查失败')
  }
}

// AI辅助创作
const aiAssist = async () => {
  if (!poemForm.title && !poemForm.content) {
    ElMessage.warning('请先输入标题或部分内容')
    return
  }

  try {
    const aiResult = await getAICreationAssistance({
      title: poemForm.title,
      content: poemForm.content,
      tags: poemForm.tags,
      style: 'classical'
    })
    
    // 应用AI建议
    if (aiResult.suggestions) {
      poemForm.content = aiResult.content || poemForm.content
      poemForm.annotation = aiResult.annotation || poemForm.annotation
      poemForm.translation = aiResult.translation || poemForm.translation
      
      ElMessage.success('AI创作辅导完成')
    }
  } catch (error) {
    ElMessage.error('AI辅助创作失败')
  }
}

// 模拟格律检查API
const analyzeRhythm = async (content: string) => {
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const lines = content.split('\n').filter(line => line.trim())
  const analysis = `
    <div style="text-align: left; font-family: 'KaiTi', serif;">
      <h3>格律分析结果</h3>
      <p><strong>诗词内容：</strong>${content}</p>
      <p><strong>行数：</strong>${lines.length}行</p>
      <p><strong>字数统计：</strong>${content.replace(/[\s\n]/g, '').length}字</p>
      <div style="margin-top: 1rem;">
        <h4>格律建议：</h4>
        <ul>
          <li>${lines.length === 4 ? '符合绝句格式' : lines.length === 8 ? '符合律诗格式' : '自由体诗词'}</li>
          <li>建议注意平仄搭配</li>
          <li>押韵位置需要调整</li>
          <li>意象运用较为恰当</li>
        </ul>
      </div>
    </div>
  `
  
  return { analysis }
}

// 模拟AI创作辅导API
const getAICreationAssistance = async (params: any) => {
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  const { title, content, tags, style } = params
  const theme = tags.length > 0 ? tags[0] : '自然'
  
  return {
    suggestions: [
      '优化意象组合，增强画面感',
      '调整平仄节奏，提升韵律美',
      '丰富情感表达，深化主题',
      '注意对仗工整，增强形式美'
    ],
    content: content || `《${title || '无题'}`,
    annotation: 'AI为您提供的注释和解析...',
    translation: 'AI为您提供的现代译文...'
  }
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