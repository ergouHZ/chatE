<template>
  <html>

  <body>
    <PageHeader />
    <el-container class="layout-container-demo" style="height: 100%">
      <el-aside width="200px">
        <NavMenu />
      </el-aside>

      <el-container>
        <el-header style="text-align: right; font-size: 12px">
        </el-header>
        <el-main>
          <RouterView />
        </el-main>
      </el-container>
    </el-container>
  </body>

  </html>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { RouterView } from 'vue-router';
import NavMenu from './views/NavMenu.vue';
import PageHeader from './views/PageHeader.vue';


const item = {
  date: '2016-05-02',
  name: 'Tom',
  address: 'No. 189, Grove St, Los Angeles',
}
const tableData = ref(Array.from({ length: 20 }).fill(item))
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
}

.layout-container-demo .toolbar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  right: 20px;
}

html {
  background-color: rgba(11, 122, 178, 0.282);
}
</style>
