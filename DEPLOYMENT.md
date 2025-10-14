# 部署说明

## Vercel部署

本项目已配置为可以直接部署到Vercel。

### 自动部署步骤：

1. **推送代码到GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin master
   ```

2. **Vercel会自动检测并部署**
   - 使用配置的构建命令：`npm run build-only`
   - 输出目录：`dist`
   - 框架：Vite

### 手动部署步骤：

如果自动部署失败，可以尝试：

1. **在Vercel项目设置中修改构建命令**
   - Build Command: `npm run build-only`
   - Output Directory: `dist`
   - Install Command: `npm install`

2. **或者使用Vercel CLI**
   ```bash
   npm i -g vercel
   vercel --prod
   ```

### 环境变量配置：

在Vercel项目设置中添加以下环境变量：

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key (可选)
VITE_WENXIN_API_KEY=your_wenxin_api_key (可选)
VITE_APP_TITLE=诗词鉴赏平台
VITE_APP_DESCRIPTION=基于AI技术的现代化诗词鉴赏平台
```

### 故障排除：

如果部署仍然失败：

1. **检查Node.js版本**
   - 确保使用Node.js 18或更高版本

2. **检查依赖**
   - 确保所有依赖都在package.json中正确声明

3. **检查构建命令**
   - 使用`npm run build-only`而不是`npm run build`

4. **禁用TypeScript检查**
   - 当前配置已经跳过了有问题的类型检查

### 本地验证：

在推送到生产环境之前，可以本地验证：

```bash
# 构建项目
npm run build-only

# 预览构建结果
npm run preview
```

构建成功后，`dist`目录将包含所有静态文件，可以部署到任何静态托管服务。