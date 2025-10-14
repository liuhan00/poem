<template>
  <el-footer class="footer">
    <div class="footer-content">
      <div class="footer-section">
        <h4>诗词鉴赏平台</h4>
        <p>基于L.I.G.H.T.架构构建的智能诗词平台</p>
        <p>让AI与传统文化完美融合</p>
      </div>
      
      <div class="footer-section">
        <h4>功能特色</h4>
        <ul>
          <li>AI智能鉴赏</li>
          <li>知识图谱构建</li>
          <li>创作辅导</li>
          <li>多模态学习</li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h4>技术架构</h4>
        <ul>
          <li>Vue 3 + TypeScript</li>
          <li>Supabase 后端</li>
          <li>Element Plus UI</li>
          <li>AI智能体集成</li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h4>联系我们</h4>
        <p>传承中华诗词文化，弘扬传统文学艺术</p>
        <div class="social-links">
          <el-button type="text" class="social-btn">
            <el-icon><Message /></el-icon>
            <span>邮箱</span>
          </el-button>
          <el-button type="text" class="social-btn">
            <el-icon><ChatDotRound /></el-icon>
            <span>微信</span>
          </el-button>
        </div>
      </div>
    </div>
    
    <div class="footer-bottom">
      <p>&copy; 2025 诗词鉴赏平台. All rights reserved.</p>
      <p>Powered by Vue.js + Supabase + AI</p>
    </div>
  </el-footer>
</template>

<script setup lang="ts">
import { Message, ChatDotRound } from '@element-plus/icons-vue'
</script>

<style scoped>
.footer {
  background: #2c3e50;
  color: white;
  padding: 3rem 0 1rem;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  padding: 0 2rem;
}

.footer-section h4 {
  color: #ecf0f1;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.footer-section p {
  color: #bdc3c7;
  line-height: 1.6;
  margin-bottom: 0.5rem;
}

.footer-section ul {
  list-style: none;
  padding: 0;
}

.footer-section li {
  color: #bdc3c7;
  margin-bottom: 0.5rem;
  padding-left: 1rem;
  position: relative;
}

.footer-section li::before {
  content: '•';
  color: #667eea;
  font-weight: bold;
  position: absolute;
  left: 0;
}

.social-links {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.social-btn {
  color: #bdc3c7;
  padding: 0.5rem;
}

.social-btn:hover {
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.footer-bottom {
  border-top: 1px solid #34495e;
  margin-top: 2rem;
  padding: 1rem 2rem;
  text-align: center;
}

.footer-bottom p {
  color: #95a5a6;
  margin: 0.25rem 0;
  font-size: 0.9rem;
}

.footer-bottom p:first-child {
  font-weight: 600;
  color: #ecf0f1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 0 1rem;
  }
  
  .social-links {
    justify-content: center;
  }
  
  .footer-bottom {
    padding: 1rem;
  }
}
</style>