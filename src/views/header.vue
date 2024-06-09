<template>
  <div class="container">
    <el-button @click="toggleShowNav"
            style="margin-left: 0px; width: 50px;border: none; height: 47px;margin: 2px;">
            <el-icon v-if="!headerStore.isShowNav">
                <More />
            </el-icon>
            <el-icon v-else>
                <Switch />
            </el-icon>
        </el-button>
    <div class="left-content">
      <el-avatar
        :size="32"
        class="mr-3"
        :src="modelAvatar"
      />
      <span class="text-large font-600 mr-3" style="margin-left:20px;justify-content:center">  {{model}}</span>
      <span class="text-sm mr-2" style="color: var(--el-text-color-regular)">
      </span>
    </div>
    <div class="right-content">
      <!-- <el-button @click="toggleDark()"  round style="letter-spacing: 0.1em;">
            <el-icon v-if="!isDark">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" ><path fill="currentColor" d="M512 704a192 192 0 1 0 0-384 192 192 0 0 0 0 384m0 64a256 256 0 1 1 0-512 256 256 0 0 1 0 512m0-704a32 32 0 0 1 32 32v64a32 32 0 0 1-64 0V96a32 32 0 0 1 32-32m0 768a32 32 0 0 1 32 32v64a32 32 0 1 1-64 0v-64a32 32 0 0 1 32-32M195.2 195.2a32 32 0 0 1 45.248 0l45.248 45.248a32 32 0 1 1-45.248 45.248L195.2 240.448a32 32 0 0 1 0-45.248zm543.104 543.104a32 32 0 0 1 45.248 0l45.248 45.248a32 32 0 0 1-45.248 45.248l-45.248-45.248a32 32 0 0 1 0-45.248M64 512a32 32 0 0 1 32-32h64a32 32 0 0 1 0 64H96a32 32 0 0 1-32-32m768 0a32 32 0 0 1 32-32h64a32 32 0 1 1 0 64h-64a32 32 0 0 1-32-32M195.2 828.8a32 32 0 0 1 0-45.248l45.248-45.248a32 32 0 0 1 45.248 45.248L240.448 828.8a32 32 0 0 1-45.248 0zm543.104-543.104a32 32 0 0 1 0-45.248l45.248-45.248a32 32 0 0 1 45.248 45.248l-45.248 45.248a32 32 0 0 1-45.248 0"></path></svg>
            </el-icon>
            <el-icon v-if="isDark">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" ><path fill="currentColor" d="M240.448 240.448a384 384 0 1 0 559.424 525.696 448 448 0 0 1-542.016-542.08 390.592 390.592 0 0 0-17.408 16.384zm181.056 362.048a384 384 0 0 0 525.632 16.384A448 448 0 1 1 405.056 76.8a384 384 0 0 0 16.448 525.696"></path></svg></el-icon>
                
            </el-button> -->
            <el-button @click="navToHome"
            style="margin-left: 0px; width: 50px;border: none; height: 47px;margin: 2px;">
            <el-icon><House /></el-icon>
        </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHeaderStore } from "@/stores/header";
import { changeToThumb, modifyName } from "@/utils";
import {
House,
More,
Switch
} from '@element-plus/icons-vue';
import { useDark, useToggle } from "@vueuse/core";
import { useRouter } from "vue-router";
const isDark = useDark();
const toggleDark = useToggle(isDark);
const headerStore = useHeaderStore();
const model = ref('');
const modelAvatar = ref('')
const router = useRouter()

watch(() => headerStore.model, (newModel) => {
  model.value = newModel;
  modelAvatar.value = changeToThumb(newModel);
  model.value = modifyName(newModel);
}
  , { immediate: true }   //组件挂载的时候执行
);

onMounted(() => {
  model.value = headerStore.model;
  modelAvatar.value = changeToThumb(model.value);
  model.value = modifyName(model.value);
})

const toggleShowNav = ()=>{
  headerStore.isShowNav =!headerStore.isShowNav;
}

const navToHome = ()=>{
  router.push({
    path: "/chat",
  })
}
</script>

<style scope>

</style>

<style scoped>
.container {
  background-color: var(--ep-color-primary-light-9, #b9b9b924);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.left-content {
  display: flex;
  align-items: center;
}

.right-content {
  display: flex;
  align-items: center;
}


</style>