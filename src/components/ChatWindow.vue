<template>
    <div style="">
        <el-scrollbar height="100vh" class="chat-container">
            <div class="top-part">
                <!-- Loading indicator -->
                <div class="select-holder">
                    <div class="select-title">
                        Select and Start
                    </div>
                <!--     <el-radio-group v-model="radio1">
                        <el-radio value="gpt-3.5-turbo-0125" size="large" border>Chat-GPT</el-radio>
                        <el-radio value="claude-3-haiku-20240307" size="large" border>Claude</el-radio>
                    </el-radio-group>
                </div>
                <div class="chat-input">
                    <el-input style="min-width: 600px;width: 75%;margin-top: 3%;" type="text" v-model="newMessage" @keyup.enter="sendMessage"
                        placeholder="Type your message..." class="chat-input">
                        <template #append>
                            <el-button @click="sendMessage">
                                <el-icon class="el-icon--right">
                                    <Upload />
                                </el-icon>
                            </el-button>
                        </template>
                    </el-input> -->
                </div>
            </div>
            <div class="select-cards-container">
                <!--  <el-scrollbar height="60vh">
                <cardOnExplore />
            </el-scrollbar> -->
                <cardOnExplore />
            </div>
        </el-scrollbar>
    </div>
</template>
<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import cardOnExplore from '@/views/cardOnExplore.vue';
import axios from 'axios';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

interface Messages {
    text: string;
    isUser: boolean;
}

interface Model {
    ai_id: number;
    model_name: string;
    title_name: string;
    description: string;
    model_url: string;
}

// 获取用户存储
const UserStore = useUserStore();
axios.defaults.headers.common['Authorization'] = UserStore.session.token;

// 定义响应式数据
const messages = ref<Messages[]>([]); // 页面展示的message
const radio1 = ref('gpt');
const newMessage = ref('');
const saveMsg = ref<any[]>([]);
const isLoading = ref(false);


// 获取路由实例
const router = useRouter();

const sendMessage = async () => {
    // 判断输入框不为空
    if (newMessage.value.trim() !== '') {
        router.push({ path: '/chat-ai', query: { model: radio1.value, message: newMessage.value } });
    } else {
        router.push({ path: '/chat-ai', query: { model: radio1.value, message: '' } });
    }
};
</script>

<style>
.chat-container {
    min-height: 200px;
    border-radius: 20px;
    padding: 20px;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
}

.top-part {
    height: 10vh;
    align-items: center;
    padding-left: 15%;padding-right: 10%;
}

.place-holder {
    margin-top: 100px;
}

.messages {
    padding: 10px;
    width: 100%;
    max-height: 600px;
    overflow-y: auto;
}

.model-select {
    width: 240px;
    margin-right: 10px;
}



.welcome-title {
    margin-bottom: 20px;
    font-size: 30px;
}

.select-holder {
    margin-top: 50px;
    align-content: center;
}

.select-title {
    margin-bottom: 20px;
    margin-left: 35%;
    font-weight: 700;
}

.select-cards-container {
    display: flex;
    flex-wrap: wrap;
    height: 100%;
    padding-left: 10%;padding-right: 10%;
}

@media (max-width: 1090px) {
    .select-title {
        font-size: 1rem;
        margin-left: 3rem;
}
}
</style>