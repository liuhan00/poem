<template>
  <div class="appreciation-workspace">
    <!-- 使用AI智能鉴赏组件 -->
    <AIAppreciation />
  </div>
</template>

<script setup lang="ts">
import AIAppreciation from '../components/AIAppreciation.vue'
</script>

<style scoped>
.appreciation-workspace {
  min-height: 100vh;
  background: #f8f9fa;
}
</style>