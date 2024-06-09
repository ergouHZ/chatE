<style scoped>
.message-container {
    display: flex;
    align-items: flex-start;
}

.model-avatar {
    align-items: center;
    margin: 8px;
    margin-right: 5px;
    margin-left: 4px;
    margin-bottom: 0;
}

/* 本体 */
.message-card {
    padding: 0;
    margin-bottom: 0.8px;
    max-width: 260px;
}

/* 激活的颜色 */
.window-card-active {
    /* 激活时的样式，例如改变背景颜色或添加阴影效果 */
    background-color: #7a7a7a7f;
    box-shadow: 0 0 6px rgba(108, 107, 107, 0.381);
}

.message-content-container {
    flex: 1;
    padding: 0px;
}

.message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
    flex-wrap: nowrap;
    /* 确保不换行 */
}

.model-name-in-card {
    margin: 0;
    font-size: 0.8rem;
    flex: 1 0.4 auto;
    /* 确保占据剩余空间 */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 110px
}

.message-date {
    font-size: small;
    margin: 0;
    color: #99999992;
    flex: 0.1 1 auto;
    margin-left: 0px;
    /* 添加一些间距 */
}

.message-content {
    /* font-weight: bold; */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin: 2px;
    margin-left: 0;
    font-size: 0.8rem;
    width: 250px;
    padding-bottom: 3px;
}

.right-icon {
    margin-left: 0px;
    scale: 0.8;
    flex: 2 1 auto;
}

.message-card:hover {
    box-shadow: 0 2px 12px 0 #376ca4;
    transition: box-shadow 0.3s ease;
    color: #b1b3b8;
}

.right-icon:hover {
    color: #ff4949;
    /* 设置悬停时的颜色 */
    cursor: pointer;
    /* 设置鼠标指针为手型 */
    transition: color 0.3s ease;
    /* 添加过渡效果 */
}
</style>

<template>
    <div>
        <div v-for="(window, index) in props.windows" :key="`${window.id}-${index}`" class="message-card"
            :body-style="{ padding: '0' }" style="font-family:Arial, Helvetica, sans-serif">
            <div class="window-card" :class="{ 'window-card-active': activeWindowId === window.id }"
                @click="handleClick(window.id, window.name)">
                <div class="message-container" @click="handleClick(window.id, window.name)">
                    <div class="model-avatar">
                        <el-avatar shape="square" :size="36" :src="changeToThumb(window.name)" />
                    </div>
                    <div class="message-content-container">
                        <div class="message-header">
                            <p class="model-name-in-card">{{ modifyName(window.name) }}</p>
                            <p class="message-date">{{ formatDate(window.date) }}</p>
                            <!-- 删除按钮 -->
                            <div class="right-icon" @click.stop="onHandleDelete(window.id)"><el-icon>
                                    <Delete />
                                </el-icon></div>
                        </div>
                        <p class="message-content">{{ window.content }}</p>
                    </div>
                </div>
                <el-dialog v-model="dialogVisible[window.id]" title="Alert" width="24rem">
                    <span>确定删除这一条记录吗</span>
                    <template #footer>
                        <div class="dialog-footer">
                            <el-button @click="dialogVisible[window.id] = false">取消</el-button>
                            <el-button type="primary" @click="handleDelete(window.id, index)">
                                确定
                            </el-button>
                        </div>
                    </template>
                </el-dialog>
            </div>
        </div>
    </div>


</template>



<script setup lang="ts">
import {
Delete
} from '@element-plus/icons-vue';
import axios from 'axios';
import { ElLoading, ElNotification } from 'element-plus';
import { defineProps, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import { changeToThumb, modifyName } from '../utils';

const activeWindowId = ref(null); //激活的id
const userStore = useUserStore();
const router = useRouter()
//给下面的props提供一个接口
interface Window {
    id: string | number;
    name: string;
    content: string;
    date: string;
}

router.beforeEach((to, from, next) => {
    if (to.name != 'EncryptedRealChat'){activeWindowId.value=null;} //如果去其他路径，则当前状态取消激活
    next();
});

const props = defineProps<{
    windows: Window[];
}>();

// 监听 userStore.session.isUpdating 的变化，有新窗口创建，则切换
watch(() => userStore.session.isNavToNewWindow, (newState) => {
    if (newState == true) {
        const nextIndex = 0;
        const nextId = props.windows[nextIndex].id; //找到最新的当前窗口，切换
        const nextModel = props.windows[nextIndex].name;
        handleClick(nextId, nextModel);

        //更新完，设置状态
        userStore.session.isNavToNewWindow = false;
    }
}, { immediate: false });

const formatDate = (dateString) => {
    const date = new Date(dateString)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${month}-${day}`
}
const dialogVisible = ref({})
const onHandleDelete = (id) => {
    dialogVisible.value[id] = true

}
const handleDelete = (id, index) => {
    dialogVisible.value[id] = false
    deleteWindowContent(id, index) //这个Index来找到下一个窗口并激活
}

//点击的时候传输modelname 和窗口id
const handleClick = async (id, model) => {
    activeWindowId.value = id; // 设置当前激活的窗口 ID
    const targetPath = `/chat-ai?windowId=${id}&model=${model}`;
    await router.push({
        path: '/chat-ai',
        query: {
            model: model,
            windowId: id,
        }
    });
};

//发送删除信息
async function deleteWindowContent(messageBoxId, index) {
    const loading = ElLoading.service({
        lock: false,
        text: 'Loading',
        background: 'rgba(0, 0, 0, 0.5)',
    })
    try {
        const response = await axios.post('/message/window/delete', null, {
            params: {
                messageBoxId: messageBoxId,
            },
        });
        if (response.data.status === 200) {
            ElMessage.success('删除成功')
            const nextIndex = (index + 1) % props.windows.length;
            const nextId = props.windows[nextIndex].id; //找到下一个index对应的id，以及对应的模型
            const nextModel = props.windows[nextIndex].name;
            handleClick(nextId, nextModel)
        } else if (response.data.status === 201) {
            ElNotification({
                title: 'warning',
                message: 'No message found',
                type: 'warning',
            })
        } else {
            ElNotification({
                title: 'Error',
                message: 'Empty response get content',
                type: 'error',
            })
        }
    } catch (error) {
        ElNotification({
            title: 'Error',
            message: 'Empty response get delete',
            type: 'error',
        })
        console.error('Error fetching message content:', error);
    } finally {
        userStore.session.isUpdating = true;
        setTimeout(() => {
            //scrollToBottomWhenInit(); //更新完之后滚到底部
            loading.close()
        }, 150)

    }
}
</script>
