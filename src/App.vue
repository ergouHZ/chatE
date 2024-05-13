<template>
  <html>

  <body>

       <div v-if="userSession.session.isLoggedIn" class="mainPage">
        <el-container class="layout-container-demo" style="height: 100%">
          <el-aside width="240px">
            <NavMenu />
          </el-aside>
          <el-container>
            <el-header style="text-align: right; font-size: 12px">
              <PageHeader />
            </el-header>
            <el-main>
              <RouterView />
            </el-main>
          </el-container>
        </el-container>
    </div>
    <div v-if="!userSession.session.isLoggedIn" class="loginPage">
      <LoginForm />
    </div>

  </body>

  </html>
</template>

<script lang="ts" setup>
import { RouterView } from 'vue-router';
import LoginForm from './components/LoginForm.vue';
import { useApiStore } from './stores/apiStore';
import { useUserStore } from './stores/userStore';
import NavMenu from './views/NavMenu.vue';
import PageHeader from './views/PageHeader.vue';

const apiStore = useApiStore();
const baseUrl = apiStore.baseUrl;//get global url

const userSession = useUserStore();

onBeforeMount(() => {
  userSession.initSession();
  console.log(userSession.session);
})


</script>

<style scoped>
.layout-container-demo .el-header {
  position: relative;
  background-color: var(--el-color-primary-light-8);
  color: var(--el-text-color-secondary);
}

.layout-container-demo .el-aside {
  color: var(--el-text-color-primary);
  background: var(--el-color-primary-light-4);
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

html {
  background-color: rgba(2, 135, 244, 0.177);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin: 0;
  padding: 0;
  border: none;
  /* 或者 border: 0; */
}

html.dark {
  padding: 0 !important;
  border: 0 !important;
  border: none !important;
  /* 添加这一行 */
}

body {
  margin: 0;
  padding: 0;
}


</style>
