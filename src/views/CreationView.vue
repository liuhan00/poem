<template>
  <div class="creation-view">
    <div class="creation-container">
      <h2>创作辅导界面</h2>
      <p>AI创作辅导功能正在开发中...</p>
      
      <div class="creation-editor">
        <el-input
          v-model="poemContent"
          type="textarea"
          placeholder="在此开始您的诗词创作..."
          :rows="10"
          class="poem-editor"
        />
        
        <div class="creation-actions">
          <el-button type="primary">
            <el-icon><EditPen /></el-icon>
            AI辅助创作
          </el-button>
          <el-button>
            <el-icon><Check /></el-icon>
            格律检查
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { EditPen, Check } from '@element-plus/icons-vue'

const poemContent = ref('')
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

.creation-editor {
  margin-top: 2rem;
}

.poem-editor {
  font-family: 'KaiTi', '楷体', serif;
  font-size: 16px;
  line-height: 1.8;
}

.creation-actions {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
}
</style>