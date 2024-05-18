<template>
    <div class="chat-container">
        <!-- Loading indicator -->
        <div class="select-holder">
            <div class="select-title">Select and start</div>
            <el-radio-group v-model="radio1">
                <el-radio value="gpt" size="large" border>Chat-GPT</el-radio>
                <el-radio value="claude" size="large" border>Claude</el-radio>
            </el-radio-group>
        </div>
        <div class="chat-input">
            <el-input style="min-width: 600px" type="text" v-model="newMessage" @keyup.enter="sendMessage"
                placeholder="Type your message..." class="chat-input">
                <template #append>
                    <el-button @click="sendMessage">
                        <el-icon class="el-icon--right">
                            <Upload />
                        </el-icon>
                    </el-button>
                </template>
            </el-input>
        </div>
        <div class="select-cards-container">
            <el-card @click="handleClick('gpt-3.5-turbo-0125')" class="select-card" shadow="hover">Chat-GPT 3.5</el-card>
            <el-card @click="handleClick('claude-instant-1.2')" class="select-card" shadow="hover">Claude-Instant</el-card>
            <el-card @click="handleClick('deepseek-chat')"class="select-card" shadow="hover">Deep seek Chat</el-card>
            <el-card @click="handleClick('deepseek-coder')"class="select-card" shadow="hover">Deep seek Coder</el-card>
            <el-card @click="handleClick('gpt-4o-2024-05-13')" class="select-card" shadow="hover">gpt-4o</el-card>
            <el-card @click="handleClick('claude-3-sonnet-20240229')" class="select-card" shadow="hover">claude-3-sonnet</el-card>
            <el-card @click="handleClick('dall-e-3')" class="select-card"  shadow="hover">dall-e-3</el-card>
            <el-card @click="handleClick('dall-e-2')" class="select-card"  shadow="hover">dall-e-2</el-card>
            <el-card @click="handleClick('sd3')" class="select-card"  shadow="hover">stable-diffusion</el-card>
            <el-card class="select-card" shadow="hover">Hover</el-card>
        </div>
    </div>
</template>

<script lang="ts">
import { useUserStore } from '@/stores/userStore';
import axios from 'axios';
import { ref } from 'vue';
interface Messages {
    text: string;
    isUser: boolean;
}

export default {
    setup() {
        const UserStore = useUserStore()
        axios.defaults.headers.common['Authorization'] = UserStore.session.token;
    },
    data() {
        return {
            messages: [] as Messages[], // 页面展示的message
            radio1: ref('gpt'),
            newMessage: '',
            apiUrl: "/chat/send2openai",
            apiClaude: "/chat/send2claude",
            MODEL: "gpt-3.5-turbo-0125",
            CMDOEL: "claude-instant-1.2",
            saveMsg: <any>[],
            isLoading: false,
        };
    },
    methods: {
        async sendMessage() {
            // 判断输入框不为空
            if (this.newMessage.trim() !== '') {
                console.log(this.radio1);
                this.$router.push({ path: '/chat-ai', query: { model: this.radio1, message: this.newMessage } });
            } else {
                this.$router.push({ path: '/chat-ai', query: { model: this.radio1, message: '' } });
            }
        },
        handleClick(model) {
            this.$router.push({
                path: '/chat-ai', query: {
                    model: model,
                    message: '',
                    
                }
            });
        }
    }
};
</script>
<style>
.chat-container {
    min-height: 700px;
    border-radius: 20px;
    border: 1px solid #ccc;
    background-color: #fff;
    padding: 20px;
    display: flex;
    justify-content: space-evenly;
    flex-direction: column;
    align-items: center;
    position: relative;
}

.place-holder {
    margin-top: 300px;
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
    /* margin-top: 200px; */
}

.select-title {
    margin-bottom: 20px;
    margin-left: 66px;
}

.select-cards-container {
    display: flex;
    flex-wrap: wrap;
}

.select-card {
    width: 300px;
    margin-left: 30px;
    margin-top: 10px;
    cursor: pointer;
}
</style>