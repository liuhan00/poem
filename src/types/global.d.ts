// 全局类型定义文件

declare global {
  interface Window {
    // 可以在这里添加全局的Window属性
  }
}

// Vite环境变量类型定义
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_WENXIN_API_KEY: string
  readonly VITE_ZHIPU_API_KEY: string
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_DESCRIPTION: string
  readonly VITE_DEV_PORT: string
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// 导出空对象以使这个文件成为模块
export {}