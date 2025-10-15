# 部署指南

## Supabase 项目设置

### 1. 创建 Supabase 项目

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 点击 "New Project"
3. 填写项目信息：
   - **Name**: poem-platform
   - **Database Password**: 设置安全密码
   - **Region**: 选择离用户最近的区域（如 ap-southeast-1）
4. 等待项目创建完成

### 2. 获取连接信息

项目创建后，在 Settings > API 中获取：
- **Project URL**: https://your-project-ref.supabase.co
- **anon/public key**: 以 `eyJ` 开头的长字符串

### 3. 配置环境变量

将获取的信息填入 `.env` 文件：
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## 数据库部署

### 1. 安装 Supabase CLI

```bash
# 使用 npm 安装
npm install -g supabase

# 或使用其他包管理器
yarn global add supabase
```

### 2. 登录 Supabase

```bash
supabase login
```

### 3. 链接项目

```bash
supabase link --project-ref your-project-ref
```

### 4. 部署数据库架构

```bash
# 部署迁移文件
supabase db push
```

### 5. 验证部署

在 Supabase Dashboard 的 Table Editor 中检查表是否创建成功。

## Edge Functions 部署

### 1. 部署所有函数

```bash
# 部署诗词搜索函数
supabase functions deploy poem-search --no-verify-jwt

# 部署AI对话函数
supabase functions deploy ai-conversation --no-verify-jwt

# 部署推荐函数
supabase functions deploy poem-recommendations --no-verify-jwt

# 部署收藏函数
supabase functions deploy user-favorites --no-verify-jwt
```

### 2. 设置函数环境变量（如果需要）

```bash
# 例如设置AI服务密钥
supabase secrets set OPENAI_API_KEY=your-key
```

## 前端部署

### Vercel 部署（推荐）

1. **准备部署**
   ```bash
   # 确保项目可以正常构建
   npm run build
   ```

2. **Vercel 部署步骤**
   - 将代码推送到 GitHub
   - 在 [Vercel](https://vercel.com) 中导入项目
   - 配置环境变量：
     - `VITE_SUPABASE_URL`: 你的 Supabase URL
     - `VITE_SUPABASE_ANON_KEY`: 你的 anon key
   - 点击部署

3. **自定义域名**（可选）
   - 在 Vercel 项目设置中添加自定义域名
   - 配置 DNS 记录

### 其他部署平台

#### Netlify
```bash
# 构建命令
npm run build

# 发布目录
dist
```

#### 静态文件托管
```bash
# 构建项目
npm run build

# 将 dist 目录上传到任何静态文件托管服务
```

## 生产环境配置

### 1. 安全配置

1. **启用 Row Level Security (RLS)**
   - 迁移文件中已包含 RLS 策略
   - 验证所有表都启用了 RLS

2. **配置 CORS**
   - 在 Supabase Dashboard 中配置允许的域名
   - 添加你的前端域名到 CORS 设置

### 2. 性能优化

1. **数据库索引**
   - 迁移文件中已包含必要的索引
   - 监控查询性能，根据需要添加索引

2. **缓存策略**
   - 配置 CDN 缓存
   - 使用 Supabase 的缓存功能

### 3. 监控和日志

1. **Supabase 监控**
   - 使用 Supabase Dashboard 监控数据库性能
   - 设置警报规则

2. **应用监控**
   - 集成错误监控服务（如 Sentry）
   - 设置性能监控

## 故障排除

### 常见问题

1. **CORS 错误**
   - 检查 Supabase CORS 配置
   - 确认前端域名已添加到允许列表

2. **认证错误**
   - 验证 JWT token 是否正确
   - 检查 RLS 策略配置

3. **函数部署失败**
   - 检查函数代码语法
   - 查看部署日志获取详细错误信息

### 调试步骤

1. **前端调试**
   ```javascript
   // 在浏览器控制台检查
   console.log('Supabase config:', import.meta.env.VITE_SUPABASE_URL)
   ```

2. **API 调试**
   - 使用 Supabase Dashboard 的 API 日志
   - 检查 Edge Functions 日志

3. **数据库调试**
   - 使用 Supabase 的 SQL 编辑器测试查询
   - 检查表关系和约束

## 备份和恢复

### 数据库备份

```bash
# 使用 Supabase CLI 备份
supabase db dump --file backup.sql
```

### 恢复备份

```bash
# 恢复数据库
supabase db reset
```

## 更新部署

### 前端更新
1. 推送代码到 GitHub
2. Vercel 会自动重新部署

### 后端更新
1. 更新迁移文件
2. 部署数据库变更
   ```bash
   supabase db push
   ```
3. 重新部署 Edge Functions
   ```bash
   supabase functions deploy --all
   ```

## 支持联系方式

如遇部署问题，请检查：
1. Supabase 官方文档
2. 项目 GitHub Issues
3. 社区支持论坛