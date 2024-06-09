import ChatWindow from '@/components/ChatWindow.vue';
import LoginForm from '@/components/LoginForm.vue';
import Subscribe from '@/components/Subscribe.vue';
// 注册真正的聊天框
import RealChatWindow from '@/components/RealChatWindow.vue';
import CryptoJS from 'crypto-js';
import { createRouter, createWebHistory } from 'vue-router';
const router = createRouter({
  //history: createWebHistory(),  
  history: createWebHistory(import.meta.env.BASE_URL),  
  //history: createWebHashHistory(), //部署的时候要设置成这个，不然服务器好像有问题
  routes: [
    {
      path: '/',
      redirect: '/chat', //默认路径
     // meta: { requiresAuth: true }//是否是要认证
     //这是首页，不用认证
    },
    {
      path: '/user',
      name: 'user',
      component: LoginForm,
    },
    {
      path: '/chat',
      name: 'Chat',
      component: ChatWindow,
      meta: { requiresAuth: true }
    },
    {
      path: '/chat-ai',
      name: 'ChatAi',
      component: RealChatWindow,
      meta: {
        requiresEncryption: true,
        requiresAuth: true
      }
    },
    {
      path: '/subscribe',
      name: 'subscribe',
      component: Subscribe,
      meta: { requiresAuth: true }
    },
    {

      path: '/e',
      name: 'EncryptedRealChat',
      component: RealChatWindow,
      meta: {
        requiresDecryption: true,
        requiresAuth: true
      }

    },
  ]
})
const privateKey = 'asdhiu(2398*&*(8213has^72*7^%'  //真正的验证在后台，这个只是防君子

router.beforeEach((to, from, next) => {
  const requiresEncryption = to.meta.requiresEncryption; // 检查路由的元信息
  if (requiresEncryption) {
    const encryptedPath = CryptoJS.AES.encrypt(to.fullPath, privateKey).toString();
    // 将加密后的路径作为查询参数传递
    next({ path: '/e', query: {
      pa: encryptedPath
    } });
  } else {
    next(); // 不需要加密，直接继续导航
  }
});

export default router
