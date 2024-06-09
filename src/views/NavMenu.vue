<template>
    <el-menu v-if="!isMobileMode || headerStore.isShowNav" default-active="10" class="el-menu-vertical-demo"
        :collapse="isCollapse" @open="handleOpen" @close="handleClose">
        <div v-if="!isMobileMode">
            <el-button @click="toggleCollapse"
                style="margin-bottom: 5px;width: 64px;border: 1.5px solid #71707073 ;height: 40px;">
                <el-icon v-if="isCollapse">
                    <More />
                </el-icon>
                <el-icon v-else>
                    <Switch />
                </el-icon>
            </el-button>
        </div>
        <RouterLink to="/chat">
            <div v-if="isCollapse">
                <el-menu-item index="10">
                    <el-icon>
                        <House />
                    </el-icon>
                    <template #title>主页</template>
                </el-menu-item>
            </div>
            <div class="logo-image" v-else>
                <el-menu-item index="10" style="height: 100px;border: 0;padding: 0;">
                    <el-image style="width: 220px; height: 84px;padding:20px" :src="url" :fit=fits />
                </el-menu-item>
            </div>
        </RouterLink>
        <el-sub-menu index="1">
            <template #title>
                <el-icon>
                    <EditPen />
                </el-icon>
                <span>消息记录</span>
            </template>
            <!-- <div class="histories-window">
                <historyCard :windows="windows" />
            </div> -->
            <el-scrollbar class="messages-history-window" height="50vh">
                <div class="card-scroll-bar">
                    <historyCard :windows="windows" />
                </div>
            </el-scrollbar>
        </el-sub-menu>
        <div>
            <RouterLink to="/chat" class="menu-item">
                <el-menu-item index="2">
                    <el-icon>
                        <ChatLineSquare />
                    </el-icon>
                    <template #title>搜索</template>
                </el-menu-item>
            </RouterLink>
            <RouterLink to="/subscribe" class="menu-item">
                <el-menu-item index="3">
                    <el-icon>
                        <Bell />
                    </el-icon>
                    <template #title>订阅</template>
                </el-menu-item>
            </RouterLink>
        </div>
        <!-- <div class="custom-menu-container" v-else>
            <RouterLink to="/user" class="menu-item">
                <el-menu-item index="3" style="height: 80px;width: 100%; /* 使 el-menu-item 占满 RouterLink */ 
                display: flex;
                align-items: center;
                ">
                    <el-icon><Bell /></el-icon>
                    <template #title>订阅</template>
                </el-menu-item>
            </RouterLink>
            <RouterLink to="/chat" class="menu-item">
                <el-menu-item index="2" style="height: 80px;width: 100%; /* 使 el-menu-item 占满 RouterLink */
                display: flex;
                align-items: center;">
                    <el-icon size="20" color="#409efc" >
                        <ChatLineSquare />
                    </el-icon>
                    
                    <template #title>搜索</template>
                </el-menu-item>
            </RouterLink>
        </div> -->
        <RouterLink to="/user" class="menu-item">
            <el-menu-item index="4">
                <el-icon>
                    <setting />
                </el-icon>
                <template #title>用户</template>
            </el-menu-item>
        </RouterLink>  
        <div class="menu-footer">
            <el-switch v-model="isDark" size="large" style="--el-switch-on-color:#2e55d497">
                <template #inactive-action>
                    <span class="custom-active-action"><el-icon>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                                <path fill="currentColor"
                                    d="M512 704a192 192 0 1 0 0-384 192 192 0 0 0 0 384m0 64a256 256 0 1 1 0-512 256 256 0 0 1 0 512m0-704a32 32 0 0 1 32 32v64a32 32 0 0 1-64 0V96a32 32 0 0 1 32-32m0 768a32 32 0 0 1 32 32v64a32 32 0 1 1-64 0v-64a32 32 0 0 1 32-32M195.2 195.2a32 32 0 0 1 45.248 0l45.248 45.248a32 32 0 1 1-45.248 45.248L195.2 240.448a32 32 0 0 1 0-45.248zm543.104 543.104a32 32 0 0 1 45.248 0l45.248 45.248a32 32 0 0 1-45.248 45.248l-45.248-45.248a32 32 0 0 1 0-45.248M64 512a32 32 0 0 1 32-32h64a32 32 0 0 1 0 64H96a32 32 0 0 1-32-32m768 0a32 32 0 0 1 32-32h64a32 32 0 1 1 0 64h-64a32 32 0 0 1-32-32M195.2 828.8a32 32 0 0 1 0-45.248l45.248-45.248a32 32 0 0 1 45.248 45.248L240.448 828.8a32 32 0 0 1-45.248 0zm543.104-543.104a32 32 0 0 1 0-45.248l45.248-45.248a32 32 0 0 1 45.248 45.248l-45.248 45.248a32 32 0 0 1-45.248 0">
                                </path>
                            </svg>
                        </el-icon></span>
                </template>
                <template #active-action>
                    <span class="custom-inactive-action"><el-icon>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                                <path fill="currentColor"
                                    d="M240.448 240.448a384 384 0 1 0 559.424 525.696 448 448 0 0 1-542.016-542.08 390.592 390.592 0 0 0-17.408 16.384zm181.056 362.048a384 384 0 0 0 525.632 16.384A448 448 0 1 1 405.056 76.8a384 384 0 0 0 16.448 525.696">
                                </path>
                            </svg></el-icon>
                    </span>
                </template>
            </el-switch>
        </div>
    </el-menu>
</template>

<script setup lang="ts">
import {
Bell,
ChatLineSquare,
EditPen,
House,
More,
Setting,
Switch
} from '@element-plus/icons-vue';
import { useDark, useToggle } from "@vueuse/core";
import axios from 'axios';
import { ElLoading } from 'element-plus';
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useHeaderStore } from '../stores/header';
import { useUserStore } from '../stores/userStore';
import historyCard from './historyCard.vue';

const headerStore = useHeaderStore()
const fits = 'contain'
const url = 'https://www.auraxplorers.com/cdn/image/brand.png'
const isDark = useDark();
const toggleDark = useToggle(isDark);
const userStore = useUserStore();
const isMobileMode = ref<boolean>(false);

interface Window {
    id: any;
    name: any;
    date: any;
    content: any;
}
const windows = ref<Window[]>([]);
defineProps<{
    title?: string
    likes?: number
}>()
//加载的时候获取所有聊天记录
onMounted(() => {
    //getUserWindowsAndUpdate()
    const windowsInStorage = localStorage.getItem("windows")
    if (windowsInStorage) {
        windows.value = JSON.parse(windowsInStorage).map(window => ({
            id: window.id,
            name: window.name,
            date: window.date,
            content: window.content
        }
        ));
    }
    //监听器
    window.addEventListener('resize', handleResize)
    handleResize() // 初始化时检查页面宽度
})

onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
})

// 监听 userStore.session.isUpdating 的变化，有信息更新，重新获取
watch(() => userStore.session.isUpdating, (newState) => {
    if (newState == true) {
        getUserWindowsAndUpdate()
        //更新完，设置状态
        userStore.session.isUpdating = false;
    }
}, { immediate: true });

function getUserWindowsAndUpdate() {
    getUserWindows()
        .then(windowsData => {
            // 将获取到的聊天窗口信息赋值给 windows 数组
            windows.value = windowsData.map(window => ({
                id: window.messageBoxId,
                name: window.aiModel,
                date: window.startDate,
                content: window.firstMessage
            }));
            localStorage.setItem("windows", JSON.stringify(windows.value));
        })
        .catch(error => {
            // 处理错误
            console.error(error);
        });
}

axios.defaults.baseURL = 'https://www.auraxplorers.com/api';
//axios.defaults.baseURL = 'http://localhost:8080/api';
axios.defaults.headers.common['Authorization'] = userStore.session.token; //设置头部
async function getUserWindows() {
    const loading = ElLoading.service({
        lock: false,
        text: '加载..',
        background: 'rgba(0, 0, 0, 0.5)',
    })
    try {
        const response = await axios.post(`/message/window/get`, null, {
            params: {
                userId: userStore.session.userId,
            },
        });
        if (response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message);
        }
    } catch (error) {
        throw error;
    }
    finally {
        loading.close();
    }
};

const isCollapse = ref(false)
const handleOpen = (key: string, keyPath: string[]) => {

}
const handleClose = (key: string, keyPath: string[]) => {

}

function toggleCollapse() {
    isCollapse.value = !isCollapse.value

}

const handleResize = () => {
    const windowWidth = window.innerWidth
    if (windowWidth < 1090) {
        isCollapse.value = true
    } else {
        isCollapse.value = false
    }
    if (windowWidth < 800) {
        isMobileMode.value = true //是否手机模式，决定有些参数如何更改
        headerStore.isShow = true //手机显示header，桌面端不显示
    } else {
        isCollapse.value =
            isMobileMode.value = false
        headerStore.isShow = false
    }
}
</script>

<style scope>
/* 风格见/style里 */
.card-scroll-bar {
    margin: 0;
    padding: 0;
}

.card-scroll-bar {
    overflow-x: hidden;
}

/* 横着的那两个键 */
.custom-menu-container {
    display: flex;
    gap: 16px;
    /* 可根据需要调整间距 */
}

.menu-item {
    flex: 1;
    /* 每个菜单项占据一半的空间 */
    text-decoration: none;
    /* 去除下划线 */

}

.menu-footer {
    position: fixed;
    bottom: 1vh;
    left: 1vh;
    text-align: center;
    /* 内容居中 */
    padding: 10px 0;
    /* 内边距，可以根据需要修改 */

}

.messages-history-window {
    /* flex: 1; */
}

/* menu的hover */
:root {
    --el-menu-hover-bg-color: #82828257;

}
</style>