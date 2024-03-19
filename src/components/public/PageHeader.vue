<template lang="">
    <el-page-header :icon="null">
      <template #content>
        <div class="flex items-center">
          <el-avatar :size="32" class="mr-3"
            src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
          <span class="text-large font-600 mr-3"> Title </span>
          <span class="text-sm mr-2" style="color: var(--el-text-color-regular)">
            Sub title
          </span>
          <el-tag>Default</el-tag>
        </div>
      </template>
<template #extra>
        <div class="flex items-center">
          <el-button @click="toggleTheme">Theme</el-button>
          <el-button type="primary" class="ml-2">Edit</el-button>
        </div>
      </template>

</el-page-header>


<div class="wrapper">
  <nav>

  </nav>
</div>
</template>
<script setup lang="ts">
import { useThemeStore } from '@/stores/darkTheme';
// 访问 isDarkTheme 的值
const themeStore = useThemeStore()
// 更改 isDarkTheme 的值
function toggleTheme() {
  console.log("Toggling theme")
  themeStore.toggleTheme()
}



</script>
<style lang="">

</style>