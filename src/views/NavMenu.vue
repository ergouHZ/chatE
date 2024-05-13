<template>
    <el-radio-group v-model="isCollapse" style="margin-bottom: 20px">
        <el-radio-button :value="false">expand</el-radio-button>
        <el-radio-button :value="true">collapse</el-radio-button>
    </el-radio-group>
    <el-menu default-active="2" class="el-menu-vertical-demo" :collapse="isCollapse" @open="handleOpen"
        @close="handleClose">
        <el-sub-menu index="1">
            <template #title>
                <el-icon>
                    <location />
                </el-icon>
                <span>Navigator One</span>
            </template>
            <el-menu-item-group>
                <template #title><span>Group One</span></template>
                <historyCard />
            </el-menu-item-group>
            <el-menu-item-group title="Group Two">
                <el-menu-item index="1-3">item three</el-menu-item>
            </el-menu-item-group>
            <el-sub-menu index="1-4">
                <template #title><span>item four</span></template>
                <el-menu-item index="1-4-1">item one</el-menu-item>
            </el-sub-menu>
        </el-sub-menu>
        <RouterLink to="/user">
            <el-menu-item index="2">
                <el-icon><icon-menu /></el-icon>
                <template #title>Navigator Two</template>
            </el-menu-item>
        </RouterLink>
        <RouterLink to="/chat">
            <el-menu-item index="3">
                <el-icon><ChatLineSquare /></el-icon>
                <template #title>Chat</template>
            </el-menu-item>
        </RouterLink>
        <RouterLink to="/login">
            <el-menu-item index="4">
                <el-icon>
                    <setting />
                </el-icon>
                <template #title>Navigator Four</template>
            </el-menu-item>
        </RouterLink>
    </el-menu>
</template>

<script setup lang="ts">
import {
ChatLineSquare,
Menu as IconMenu,
Location,
Setting
} from '@element-plus/icons-vue';
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import historyCard from './historyCard.vue';

defineProps<{
    title?: string
    likes?: number
}>()

const isCollapse = ref(false)
const handleOpen = (key: string, keyPath: string[]) => {
    console.log(key, keyPath)
}
const handleClose = (key: string, keyPath: string[]) => {
    console.log(key, keyPath)
}





</script>

<style>
.el-menu-vertical-demo:not(.el-menu--collapse) {
    width: 240px;
    min-height: 400px;
}
</style>