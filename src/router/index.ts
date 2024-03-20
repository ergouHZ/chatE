import ChatWindow from '@/components/ChatWindow.vue'
import LoginForm from '@/components/LoginForm.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: LoginForm
    },
    {
      path: '/chat',
      name: 'Chat',
      component: ChatWindow
    }
  ]
})

export default router
