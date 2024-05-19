<template>

  <html v-if="userSession.session.isLoggedIn">
  <body>
      <el-container class="layout-container-demo" style="height: 100vh">
        <NavMenu />
        <el-container>
          <el-main style="height: 100vh; overflow: auto">
            <RouterView />
          </el-main>
        </el-container>
      </el-container>
  </body>
  </html>
  <html v-else>
    <RouterView />
  </html>
</template>

<script lang="ts" setup>
import axios from 'axios';
import { RouterView, useRouter } from 'vue-router';
import { useApiStore } from './stores/apiStore';
import { useUserStore } from './stores/userStore';
import NavMenu from './views/NavMenu.vue';

const router = useRouter()
const apiStore = useApiStore();
const baseUrl = apiStore.baseUrl;//get global url
const userSession = useUserStore();

onBeforeMount(() => {
  userSession.initSession();
})

onMounted(() => {
  if (userSession.session.isLoggedIn) {
    renewUserSession();
  }else{
    router.push('/user');
  }
});

async function renewUserSession() {
  if(userSession.session.expiresAt && userSession.session.expiresAt - new Date().getTime() <=21* 24 * 3600 * 1000-20*1000 ){ //令牌过期20秒，减少刷新次数，但是用户的plan需要实时更新
  await axios.post('/user/login', {
    username: userSession.session.username,
    password: userSession.session.password,
  })
    .then((res) => {
      userSession.afterLoginForm(res.data.data, res.data.token);//手动登录或注册后，存入用户信息到session
    })
    .catch((error) => {
      console.log(error.response.data.error)
      error.value = error.response.data.error
    })
}


router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth) && !userSession.session.isLoggedIn) {
    next({ path:'/user' });
  } else {
    next();
  }
});
}
</script>

<style scoped>
.layout-container-demo .el-header {
  position: relative;
}

.layout-container-demo .el-aside {
}

.layout-container-demo .el-menu {
  border-right: none;
}

.layout-container-demo .el-main {
  padding: 0;
  border: none;

}

.layout-container-demo .toolbar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  right: 20px;
}
</style>
