<template>
  <div id="app">
    <RouterView />
    <FloatingAIAssistant />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import FloatingAIAssistant from './components/FloatingAIAssistant.vue'
</script>

<style>
/* 全局样式重置 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  height: 100%;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  line-height: 1.6;
  color: #2c3e50;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.main-container {
  flex: 1;
  width: 100%;
}

/* 中式设计元素 */
.chinese-style {
  background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
  border: 1px solid #e1ddd7;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 诗词文本样式 */
.poem-text {
  font-family: 'KaiTi', '楷体', serif;
  font-size: 18px;
  line-height: 2;
  color: #2c3e50;
  text-align: center;
  padding: 20px;
}

/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Element Plus 样式覆盖 */
.el-header {
  padding: 0 !important;
}

.el-footer {
  padding: 0 !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .poem-text {
    font-size: 16px;
    padding: 15px;
  }
}
</style>