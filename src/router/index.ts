import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/appreciation',
      name: 'appreciation',
      component: () => import('../views/AppreciationView.vue')
    },
    {
      path: '/creation',
      name: 'creation',
      component: () => import('../views/CreationView.vue')
    },
    {
      path: '/knowledge',
      name: 'knowledge',
      component: () => import('../views/KnowledgeView.vue')
    },
    {
      path: '/knowledge-graph',
      name: 'knowledge-graph',
      component: () => import('../views/KnowledgeView.vue')
    },
    {
      path: '/poem/:id',
      name: 'poem-detail',
      component: () => import('../views/PoemDetailView.vue')
    }
  ]
})

export default router