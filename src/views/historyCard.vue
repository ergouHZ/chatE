<style scoped>
.message-container {
    display: flex;
    align-items: flex-start;
}

.model-avatar {
    align-items: center;
    margin: 10px;
    margin-right: 0;
}

.message-content-container {
    flex: 1;
    padding: 5px;
}

.message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
    flex-wrap: nowrap;
    /* 确保不换行 */
}

.model-name {
    margin: 0;
    font-size: small;
    flex: 0 0 auto;
    /* 确保占据剩余空间 */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.message-date {
    margin: 0;
    color: #99999992;
    flex: 1 1 auto;
    margin-left: 10px;
    /* 添加一些间距 */
}

.message-content {
    font-weight: bold;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin: 3px;
    margin-left: 0;
    font-size: small;
    width: 220px;
}

.right-icon {
    margin-left: 10px;
    scale: 0.8;
    flex: 1 0 auto;
}
</style>

<template>
    <div>
        <el-card v-for="message in messages" :key="message.id" class="message-card" :body-style="{ padding: '0' }">
            <div class="message-container">
                <div class="model-avatar">
                    <el-avatar shape="square" :size="36" :src="changeToThumb(message.avatar)" />
                </div>
                <div class="message-content-container">
                    <div class="message-header">
                        <p class="model-name">{{ message.name }}</p>
                        <p class="message-date">{{ formatDate(message.date) }}</p>
                        <!-- 删除按钮 -->
                        <div class="right-icon" @click="dialogVisible = true"><el-icon>
                                <Delete />
                            </el-icon></div>
                    </div>
                    <p class="message-content">{{ message.content }}</p>
                </div>
            </div>
            <el-dialog v-model="dialogVisible" title="Alert" width="500">
                <span>确定删除这一条记录吗</span>
                <template #footer>
                    <div class="dialog-footer">
                        <el-button @click="dialogVisible = false">取消</el-button>
                        <el-button type="primary" @click="handleDelete(message.id)">
                            确定
                        </el-button>
                    </div>
                </template>
            </el-dialog>
        </el-card>
    </div>


</template>



<script setup lang="ts">
import {
Delete
} from '@element-plus/icons-vue';
import { ref } from 'vue';

const dialogVisible = ref(false)
const messages = ref([
    {
        id: 1,
        avatar: 'gpt-3.5-turbo-0125',
        name: 'Model A',
        date: '2023-04-20',
        content: 'Hello, how are you?'
    },
    {
        id: 2,
        avatar: 'claude-instant-1.2',
        name: 'Model B',
        date: '2023-04-21',
        content: 'I am doing well, thank you for asking222222222222222222222222222222222222222222222.'
    }
])

const formatDate = (dateString) => {
    const date = new Date(dateString)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${month}-${day}`
}


const changeToThumb = (modelName) => {
    if (modelName === 'claude-instant-1.2') {
        return 'https://qph.cf2.poecdn.net/main-thumb-pb-1011-200-phggnnskbfadkgntvkacpazkogidumhg.jpeg'
    } else if (modelName === 'gpt-3.5-turbo-0125') {
        return 'https://qph.cf2.poecdn.net/main-thumb-pb-3004-200-jougqzjtwfqfyqprxbdwofvnwattmtrg.jpeg'
    }
    // 如果没有匹配的模型名称，可以返回一个默认图片或者空字符串
    return ''
}

const handleDelete = (id) => {
    console.log(id)
    dialogVisible.value=false
}

</script>
