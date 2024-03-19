import ChatWindow from '@/components/ChatWindow.vue'
import LoginForm from '@/components/LoginForm.vue'
import TestPage from '@/components/TestPage.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/test',
      name: 'home',
      component: TestPage
    },
    {
      path: '/user/login',
      name: 'login',
      component: LoginForm
    },
    {
      path: '/ChatWindow',
      name: 'chatWindow',
      component: ChatWindow
    },
  ]
})

export default router
