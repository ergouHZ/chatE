<script setup lang="ts">
import { provide } from 'vue';
import { RouterView } from 'vue-router';
import CaptchaForm from './components/public/CaptchaForm.vue';
import NavMenu from './components/public/NavMenu.vue';
import PageHeader from './components/public/PageHeader.vue';


//这里定义全局的url
const baseUrl = 'http://localhost:8080';
provide('baseUrl', baseUrl);


</script>

<template>

  <html class="dark">



  <div class="common-layout">
    <el-container>
      <el-header>
        <PageHeader />
      </el-header>
      <el-container>
        <el-aside width="200px">
          <NavMenu />
        </el-aside>
        <el-container>
          <el-main>
            <RouterView />
            <el-row :gutter="20">
              <el-col :span="6">
                <div class="grid-content ep-bg-purple" />
              </el-col>
              <el-col :span="6">
                <div class="grid-content ep-bg-purple" />
              </el-col>
              <el-col :span="6">
                <div class="grid-content ep-bg-purple" />
              </el-col>
              <el-col :span="6">
                <div class="grid-content ep-bg-purple" />
              </el-col>
            </el-row>

          </el-main>
          <el-footer>Footer</el-footer>
          <CaptchaForm />
        </el-container>
      </el-container>
    </el-container>
  </div>



  </html>
</template>

<style>
html {
  /* custom dark bg color */
  --el-bg-color: #626aef;
}

body {
  font-family: Inter, system-ui, Avenir, "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
  background-color: #69b6f16e;
}

a {
  color: var(--ep-color-primary);
}

.el-row {
  margin-bottom: 20px;
}

.el-row:last-child {
  margin-bottom: 0;
}

.el-col {
  border-radius: 4px;
}

.grid-content {
  border-radius: 4px;
  min-height: 36px;
}

code {
  border-radius: 2px;
  padding: 2px 4px;
  background-color: var(--ep-color-primary-light-9);
  color: var(--ep-color-primary);
}
</style>