# 诗词鉴赏平台

基于Vue.js + Supabase构建的现代化诗词鉴赏平台，采用L.I.G.H.T.架构模式。

## 项目特色

- 🎯 **AI智能鉴赏**: 三级AI智能体提供个性化诗词学习体验
- 📚 **知识图谱**: 构建诗词、作者、典故的关联网络
- ✍️ **创作辅导**: AI辅助诗词创作和格律检查
- 🎨 **中式美学**: 融合传统美学与现代设计的用户界面
- 🔍 **智能搜索**: 支持自然语言搜索和语义理解

## 技术架构

### 前端技术栈
- **Vue 3** - 现代化前端框架
- **TypeScript** - 类型安全的JavaScript
- **Element Plus** - UI组件库
- **Vite** - 快速构建工具

### 后端技术栈
- **Supabase** - 后端即服务(BaaS)
- **PostgreSQL** - 关系型数据库
- **pgvector** - 向量搜索扩展
- **Edge Functions** - 无服务器函数

### AI集成
- 三级AI智能体架构（平台级、鉴赏级、交互级）
- 语义搜索和智能推荐
- 自然语言对话交互

## 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd poem
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
cp .env.example .env
```
编辑`.env`文件，配置Supabase连接信息：
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. **启动开发服务器**
```bash
npm run dev
```

### Supabase配置

1. **创建Supabase项目**
   - 访问 [Supabase官网](https://supabase.com) 创建新项目
   - 获取项目URL和anon key

2. **部署数据库架构**
```bash
# 使用Supabase CLI部署迁移
supabase db push
```

3. **部署Edge Functions**
```bash
# 部署所有Edge Functions
supabase functions deploy poem-search --no-verify-jwt
supabase functions deploy ai-conversation --no-verify-jwt
supabase functions deploy poem-recommendations --no-verify-jwt
supabase functions deploy user-favorites --no-verify-jwt
```

## 项目结构

```
poem/
├── src/                    # 前端源代码
│   ├── components/        # 可复用组件
│   ├── views/            # 页面组件
│   ├── router/           # 路由配置
│   ├── stores/           # 状态管理
│   ├── types/            # TypeScript类型定义
│   └── utils/            # 工具函数
├── supabase/             # 后端配置
│   ├── migrations/       # 数据库迁移文件
│   └── functions/        # Edge Functions
└── public/               # 静态资源
```

## 核心功能

### 1. 智能鉴赏
- 个性化诗词推荐
- 多维度诗词解析
- AI对话式学习助手

### 2. 知识探索
- 诗词知识图谱可视化
- 作者关系网络
- 时空分布分析

### 3. 创作辅导
- AI辅助诗词创作
- 格律检查和韵脚提示
- 典故引用建议

### 4. 用户系统
- 个性化学习进度跟踪
- 收藏和分享功能
- 学习成就系统

## API文档

### 诗词搜索
```javascript
POST /functions/v1/poem-search
{
  "query": "明月",
  "dynasty": "唐",
  "tags": ["思乡"],
  "page": 1,
  "limit": 10
}
```

### AI对话
```javascript
POST /functions/v1/ai-conversation
{
  "message": "请解析《静夜思》的意境",
  "session_id": "session-uuid"
}
```

### 诗词推荐
```javascript
POST /functions/v1/poem-recommendations
{
  "limit": 10,
  "based_on": "user_preferences"
}
```

## 部署指南

### Vercel部署
1. Fork项目到GitHub
2. 在Vercel中导入项目
3. 配置环境变量
4. 自动部署

### 本地构建
```bash
npm run build
```

## 开发指南

### 添加新功能
1. 在`src/types/`中定义类型
2. 在`src/utils/api.ts`中添加API函数
3. 创建对应的Vue组件
4. 更新路由配置

### 数据库变更
1. 在`supabase/migrations/`中创建迁移文件
2. 使用Supabase CLI部署迁移
3. 更新TypeScript类型定义

## 贡献指南

欢迎提交Issue和Pull Request来改进项目！

## 许可证

MIT License

## 联系方式

如有问题请联系项目维护者。

---

**让AI与传统文化完美融合，传承中华诗词之美**