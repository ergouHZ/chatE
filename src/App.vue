<template>

  <html v-if="userSession.session.isLoggedIn">
  <body>
    <el-header v-if="isShowHeader" style="padding: 0;height: 51px;"><headerCus /></el-header>
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
import { useHeaderStore } from './stores/header';
import { useUserStore } from './stores/userStore';
import NavMenu from './views/NavMenu.vue';
import headerCus from './views/header.vue';
// import from "https://www.google.com/recaptcha/enterprise.js?render=6LeJ4u8pAAAAANhvSVeF4GMVAhPmM2kgwEWkKSZd"

const router = useRouter()
const apiStore = useApiStore();
const headerStore = useHeaderStore();
const baseUrl = apiStore.baseUrl;//get global url
const userSession = useUserStore();
const isMobileMode = ref<boolean>(false);
const isShowHeader = ref<boolean>(false);

watch(() => headerStore.isShow, (newState) => {
    isShowHeader.value=newState
,{immediate: true}})

onBeforeMount(() => {
  userSession.initSession();
})

onMounted(() => {
  if (userSession.session.isLoggedIn) {
    renewUserSession();
  }
});

async function renewUserSession() {
  if(userSession.session.expiresAt && userSession.session.expiresAt - new Date().getTime() <=21* 24 * 3600 * 1000-20*1000 ){ //令牌过期20秒，减少刷新次数，但是用户的plan需要实时更新
  await axios.post('/user/login', {
    username: userSession.session.username,
    password: userSession.session.password,
  })
    .then((res) => {
      userSession.afterLoginSetSession(res.data.data);//手动登录或注册后，存入用户信息到session
      userSession.updateToken(res.data.token)
    })
    .catch((error) => {
      console.log(error.response.data.error)
      error.value = error.response.data.error
    })
}
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

.el-header{
  padding-left: 0;
}

</style>
