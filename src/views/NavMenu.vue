<template>
    <el-menu default-active="10" class="el-menu-vertical-demo" :collapse="isCollapse" @open="handleOpen"
        @close="handleClose"
        >

        <el-button @click="toggleCollapse" style="margin-bottom: 5px;width: 64px;border: 1.5px solid #71707073 ;height: 40px;">
            <el-icon v-if="isCollapse">
                <More />
            </el-icon>
            <el-icon v-else>
                <Switch />
            </el-icon>
        </el-button>
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
            <el-scrollbar class="messages-history-window" height="45vh">
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
            <el-button @click="toggleDark()" size="large" round style="letter-spacing: 0.1em;"><el-icon>
                    <setting />
                </el-icon>
                <div v-if="!isCollapse">主题</div>
            </el-button>
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
import { useUserStore } from '../stores/userStore';
import historyCard from './historyCard.vue';

const fits = 'contain'
const url ='https://www.auraxplorers.com/cdn/image/brand.png'
const isDark = useDark();
const toggleDark = useToggle(isDark);
const userStore = useUserStore();

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
    getUserWindowsAndUpdate()
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
}, { immediate: false });

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
        })
        .catch(error => {
            // 处理错误
            console.error(error);
        });
}

axios.defaults.baseURL = 'https://www.auraxplorers.com/api';
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