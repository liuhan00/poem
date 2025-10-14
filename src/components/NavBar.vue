<template>
  <el-header class="navbar">
    <div class="nav-container">
      <div class="logo">
        <router-link to="/" class="logo-link">
          <h1>诗词鉴赏平台</h1>
          <span class="subtitle">智慧传承古韵之美</span>
        </router-link>
      </div>
      
      <nav class="nav-menu">
        <el-menu 
          mode="horizontal" 
          :default-active="activeIndex" 
          @select="handleSelect"
          class="nav-menu-items"
        >
          <el-menu-item index="/">
            <el-icon><HomeFilled /></el-icon>
            <span>首页</span>
          </el-menu-item>
          <el-menu-item index="/appreciation">
            <el-icon><Reading /></el-icon>
            <span>智能鉴赏</span>
          </el-menu-item>
          <el-menu-item index="/creation">
            <el-icon><EditPen /></el-icon>
            <span>创作辅导</span>
          </el-menu-item>
          <el-menu-item index="/knowledge">
            <el-icon><DataAnalysis /></el-icon>
            <span>知识探索</span>
          </el-menu-item>
        </el-menu>
      </nav>

      <div class="nav-actions">
        <el-button type="text" class="user-btn">
          <el-icon><User /></el-icon>
          <span>登录</span>
        </el-button>
      </div>
    </div>
  </el-header>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { HomeFilled, Reading, EditPen, DataAnalysis, User } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const activeIndex = ref('/')

// 监听路由变化更新激活菜单
watch(() => route.path, (newPath) => {
  activeIndex.value = newPath
}, { immediate: true })

const handleSelect = (key: string) => {
  activeIndex.value = key
  router.push(key)
}
</script>

<style scoped>
.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0;
  height: 70px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 2rem;
}

.logo-link {
  text-decoration: none;
  color: inherit;
}

.logo h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
}

.logo .subtitle {
  font-size: 0.8rem;
  opacity: 0.9;
  color: white;
}

.nav-menu-items {
  background: transparent;
  border: none;
}

.nav-menu-items .el-menu-item {
  color: white;
  border: none;
}

.nav-menu-items .el-menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-menu-items .el-menu-item.is-active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
}

.nav-actions .user-btn {
  color: white;
}

.nav-actions .user-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    height: auto;
    padding: 1rem;
  }
  
  .logo {
    margin-bottom: 1rem;
  }
  
  .nav-menu {
    width: 100%;
  }
  
  .nav-actions {
    margin-top: 1rem;
  }
}
</style>