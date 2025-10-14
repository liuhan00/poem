# 诗词鉴赏平台

基于Vue.js + Supabase的智能诗词鉴赏平台，采用L.I.G.H.T.架构模式，为诗词爱好者提供AI赋能的个性化学习体验。

## 🌟 项目特色

### 核心理念
- **智能鉴赏赋能**: AI为每位用户提供个性化诗词解读和创作指导
- **知识图谱构建**: 建立诗词、作者、典故、意象的关联网络
- **互动学习社区**: 构建诗词爱好者交流创作的数字空间
- **文化传承创新**: 通过技术手段活化传统文化资源
- **多模态体验**: 结合文字、音频、图像的全方位诗词展示

### 三级AI智能体架构

#### 1. 平台级AI智能体 (Platform AI)
- **角色**: 平台的"智能馆长"或"文化策展AI"
- **职责**: 全局内容洞察、知识图谱优化、内容质量监控、趋势预测预警

#### 2. 鉴赏级AI智能体 (Appreciation AI)
- **角色**: 用户的"专业诗词导师"与"鉴赏顾问"
- **职责**: 深度诗词解析、个性化推荐、创作指导辅助、知识问答服务

#### 3. 交互级AI智能体 (Interaction AI)
- **角色**: 每个用户的"专属诗词伙伴"
- **职责**: 实时对话交互、多模态内容生成、学习进度跟踪、情感化交流

## 🏗️ 技术架构 (L.I.G.H.T.)

### L - Lean Backend (最少的后端)
- **Supabase**: PostgreSQL + pgvector构建诗词知识库
- **Edge Functions**: Serverless业务逻辑处理
- **Real-time**: 实时数据同步和推送

### I - Intelligent Frontend (最强的前端智能)
- **Vue 3 + Composition API**: 现代化响应式前端框架
- **TypeScript**: 类型安全的开发体验
- **Element Plus**: 企业级UI组件库
- **Pinia**: 轻量级状态管理

### G - Git-driven Collaboration (Git驱动的工程协作)
- **Monorepo**: 统一管理前端、后端配置、AI工作流
- **版本控制**: Git管理代码版本和协作开发
- **CI/CD**: 自动化构建和部署流程

### H - Hyper-scalable Data (可弹性伸缩的数据层)
- **PostgreSQL**: 关系型数据库存储核心数据
- **pgvector**: 向量数据库支持语义搜索
- **缓存策略**: Redis缓存热点数据

### T - Templated AI Agents (模板化的AI智能体)
- **n8n工作流**: AI智能体编排和协调
- **多模型支持**: OpenAI、文心一言、智谱AI等
- **模板化部署**: 标准化AI智能体配置

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn
- 现代浏览器支持

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd poem-appreciation-platform
```

2. **安装依赖**
```bash
npm install
```

3. **启动开发服务器**
```bash
npm run dev
```

4. **访问应用**
打开浏览器访问 `http://localhost:3000`

### 构建生产版本
```bash
npm run build
```

### 运行测试
```bash
# 单元测试
npm run test:unit

# E2E测试
npm run test:e2e
```

## 📁 项目结构

```
poem-appreciation-platform/
├── src/
│   ├── components/          # 可复用组件
│   │   ├── NavBar.vue      # 导航栏组件
│   │   └── FooterBar.vue   # 页脚组件
│   ├── views/              # 页面组件
│   │   ├── HomeView.vue    # 首页
│   │   ├── AppreciationView.vue  # 智能鉴赏页
│   │   ├── CreationView.vue      # 创作辅导页
│   │   ├── KnowledgeView.vue     # 知识探索页
│   │   └── PoemDetailView.vue    # 诗词详情页
│   ├── stores/             # 状态管理
│   │   └── index.ts        # Pinia stores
│   ├── router/             # 路由配置
│   │   └── index.ts        # Vue Router配置
│   ├── types/              # TypeScript类型定义
│   │   └── index.ts        # 通用类型定义
│   ├── utils/              # 工具函数
│   │   └── index.ts        # 通用工具函数
│   ├── assets/             # 静态资源
│   │   ├── css/           # 样式文件
│   │   └── images/        # 图片资源
│   ├── App.vue            # 根组件
│   └── main.ts            # 应用入口
├── public/                # 公共静态资源
├── package.json           # 项目配置
├── vite.config.ts         # Vite配置
├── tsconfig.json          # TypeScript配置
└── README.md             # 项目文档
```

## 🎯 核心功能

### 1. 智能鉴赏工作台
- **三栏布局设计**: 左侧导航、中间内容、右侧AI助手
- **个性化推荐**: AI根据用户偏好推荐诗词
- **智能搜索**: 自然语言搜索诗词内容
- **多标签展示**: 原文、注释、AI赏析、关联作品
- **实时AI问答**: 常驻AI助手提供即时帮助

### 2. 创作辅导界面
- **智能创作编辑器**: 实时格律检查、韵脚提示
- **AI创作建议**: 基于关键词生成意境建议
- **典故引用助手**: 智能推荐相关典故和化用方案
- **作品分享社区**: 一键分享到平台社区
- **创作历程记录**: 版本管理和修改建议

### 3. 知识探索大屏
- **动态知识图谱**: 可视化展示诗词关联网络
- **时空分布图**: 作者、作品的时空分布可视化
- **风格分析面板**: 诗词风格聚类和分析
- **研究工具集**: 数据导出、对比分析功能

### 4. 用户个性化体验
- **学习进度跟踪**: 个人学习轨迹和成就系统
- **收藏管理**: 个性化诗词收藏和分类
- **多模态交互**: 支持文字、语音、图像交互
- **响应式设计**: 适配桌面端和移动端

## 🔧 开发指南

### 代码规范
- 使用 TypeScript 进行类型检查
- 遵循 Vue 3 Composition API 最佳实践
- 使用 ESLint 和 Prettier 保证代码质量
- 组件命名使用 PascalCase
- 文件命名使用 kebab-case

### 状态管理
使用 Pinia 进行状态管理：
- `useUserStore`: 用户认证和个人数据
- `usePoemStore`: 诗词数据和搜索结果
- `useAIStore`: AI交互和对话历史

### 路由设计
- `/`: 首页展示
- `/appreciation`: 智能鉴赏工作台
- `/creation`: 创作辅导界面
- `/knowledge`: 知识探索大屏
- `/poem/:id`: 诗词详情页面

### API集成
- Supabase客户端配置
- 实时数据订阅
- 文件上传和存储
- 用户认证和授权

## 🎨 UI/UX设计

### 设计原则
1. **文化美学**: 界面设计体现中国传统美学韵味
2. **角色化体验**: 为不同用户群体提供专属界面
3. **AI原生交互**: 以对话式交互为核心，降低使用门槛
4. **渐进式呈现**: 复杂信息分层展示，避免认知过载
5. **多模态融合**: 无缝整合文字、语音、图像交互

### 色彩系统
- **主色调**: #667eea（科技蓝） - #764ba2（优雅紫）
- **辅助色**: #2c3e50（深灰蓝）、#7f8c8d（中性灰）
- **功能色**: 成功绿、警告橙、错误红
- **背景色**: 渐变背景营造层次感

### 字体系统
- **内容字体**: PingFang SC, Microsoft YaHei（现代感）
- **诗词字体**: KaiTi, 楷体（传统韵味）
- **标题字体**: 加粗处理，突出层次

## 📊 性能优化

### 前端优化
- **代码分割**: 路由级别的懒加载
- **组件懒加载**: 按需加载大型组件
- **图片优化**: WebP格式、懒加载
- **缓存策略**: 浏览器缓存和Service Worker

### 数据库优化
- **索引优化**: 为常用查询字段建立索引
- **向量检索**: 使用HNSW索引加速语义搜索
- **查询优化**: 使用Materialized View缓存复杂查询
- **分页加载**: 大数据集分页处理

### AI服务优化
- **成本控制**: 智能路由选择合适的模型
- **响应缓存**: 缓存常见问答结果
- **流式输出**: 实现AI响应的流式显示
- **并发限制**: 防止AI服务过载

## 🔐 安全措施

### 数据安全
- **行级安全(RLS)**: Supabase数据库权限控制
- **数据脱敏**: 用户行为数据匿名化处理
- **审计日志**: 记录所有敏感操作

### AI安全
- **输入验证**: 防止Prompt注入攻击
- **内容过滤**: AI生成内容的合规性检查
- **权限控制**: 限制AI访问敏感数据
- **人工审核**: 重要内容的人工复核机制

## 🚀 部署指南

### 开发环境
```bash
npm run dev
```

### 生产环境
```bash
npm run build
npm run preview
```

### Docker部署
```bash
docker build -t poem-platform .
docker run -p 3000:3000 poem-platform
```

### Vercel部署
1. 连接GitHub仓库
2. 配置环境变量
3. 自动部署

## 🤝 贡献指南

### 开发流程
1. Fork项目仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

### 代码提交规范
- `feat`: 新功能
- `fix`: 修复问题
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建工具或辅助工具的变动

## 📈 项目路线图

### 阶段一: 核心功能MVP (已完成)
- ✅ 基础项目架构搭建
- ✅ Vue.js前端框架配置
- ✅ 核心页面组件开发
- ✅ 路由和状态管理
- ✅ UI组件库集成

### 阶段二: AI智能体集成 (进行中)
- 🔄 Supabase后端配置
- 🔄 AI智能体接口设计
- 🔄 实时对话功能
- 🔄 诗词数据库构建
- 🔄 语义搜索实现

### 阶段三: 高级功能开发 (计划中)
- 📋 知识图谱可视化
- 📋 多模态内容生成
- 📋 用户社区功能
- 📋 移动端应用
- 📋 性能优化和监控

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Vue.js](https://vuejs.org/) - 渐进式JavaScript框架
- [Supabase](https://supabase.com/) - 开源Firebase替代方案
- [Element Plus](https://element-plus.org/) - Vue 3组件库
- [TypeScript](https://www.typescriptlang.org/) - JavaScript的超集
- [Vite](https://vitejs.dev/) - 下一代前端构建工具

---

**传承中华诗词文化，让AI与传统文化完美融合** 🌸