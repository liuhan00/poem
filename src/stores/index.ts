import { defineStore } from 'pinia'

// 用户状态管理
export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    favorites: [],
    learningProgress: 0
  }),
  
  actions: {
    setUser(userData: any) {
      this.user = userData
      this.isAuthenticated = true
    },
    
    logout() {
      this.user = null
      this.isAuthenticated = false
      this.favorites = []
      this.learningProgress = 0
    },
    
    addToFavorites(poemId: string) {
      if (!this.favorites.includes(poemId)) {
        this.favorites.push(poemId)
      }
    },
    
    removeFromFavorites(poemId: string) {
      const index = this.favorites.indexOf(poemId)
      if (index > -1) {
        this.favorites.splice(index, 1)
      }
    }
  }
})

// 诗词数据状态管理
export const usePoemStore = defineStore('poem', {
  state: () => ({
    poems: [],
    selectedPoem: null,
    searchResults: [],
    loading: false
  }),
  
  actions: {
    async fetchPoems() {
      this.loading = true
      try {
        // 这里会调用API获取诗词数据
        // const poems = await api.getPoems()
        // this.poems = poems
        
        // 临时模拟数据
        this.poems = [
          {
            id: 1,
            title: '静夜思',
            author: '李白',
            dynasty: '唐',
            content: '床前明月光，疑是地上霜。举头望明月，低头思故乡。'
          }
        ]
      } catch (error) {
        console.error('获取诗词失败:', error)
      } finally {
        this.loading = false
      }
    },
    
    selectPoem(poem: any) {
      this.selectedPoem = poem
    },
    
    async searchPoems(query: string) {
      this.loading = true
      try {
        // 这里会调用搜索API
        this.searchResults = this.poems.filter(poem => 
          poem.title.includes(query) || 
          poem.author.includes(query) ||
          poem.content.includes(query)
        )
      } catch (error) {
        console.error('搜索失败:', error)
      } finally {
        this.loading = false
      }
    }
  }
})