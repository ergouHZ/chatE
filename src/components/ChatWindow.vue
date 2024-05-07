<template>
    <div class="chat-container">
        <div class="messages" v-if="messages.length > 0">
            <div v-for="(message, index) in messages" :key="index"
                :class="{ 'user-message': message.isUser, 'server-message': !message.isUser }">
                {{ !message.isUser ? radio1 : "You" }}
                <span class="message-content">
                    {{ message.text }}
                </span>
            </div>
        </div>
        <!-- Loading indicator -->
        <div v-else>
            <div class="welcome-title">Your personal AI helper</div>
            <div class="place-holder">
                <div class="select-title">Select and start</div>
                <el-radio-group v-model="radio1">
                    <el-radio value="gpt" size="large" border>Chat-GPT</el-radio>
                    <el-radio value="claude" size="large" border>Claude</el-radio>
                </el-radio-group>
            </div>
        </div>
        <div v-if="isLoading" class="loading-indicator">Loading...</div>
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
    </div>
</template>

<script lang="ts">
import axios from 'axios';
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/userStore';
interface Messages {
    // id: number;
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
            // apiKey: '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', // Replace with your ChatGPT API key
            // apiUrl: 'https://api.openai.com/v1/chat/completions',
            // MODEL: "gpt-3.5-turbo",
            MODEL: "gpt-3.5-turbo-0125",
            CMDOEL: "claude-instant-1.2",
            saveMsg: <any>[],
            isLoading: false
        };
    },
    methods: {
        async sendMessage() {
            // 判断输入框不为空
            if (this.newMessage.trim() !== '') {
                this.isLoading = true
                console.log(this.radio1);

                //判断选择的模型
                switch (this.radio1) {
                    case "gpt":
                        this.messages.push({ text: this.newMessage, isUser: true });
                        this.saveMsg.push({ role: "user", content: this.newMessage })
                        await this.handleGptMessageSending()
                        break;
                    case "claude":
                        this.messages.push({ text: this.newMessage, isUser: true });
                        this.saveMsg.push({
                            role: "user", content: [{ "type": "text", "text": this.newMessage }]
                        })
                        //判断选择的模型
                        await this.handleClaudMessageSending()
                        break;
                    default:
                        ElMessage.error('Please Select')
                }
                this.isLoading = false
                this.newMessage = '';
            }
        },
        // gpt发送方式
        async handleGptMessageSending() {
            try {
                const response = await axios.post(this.apiUrl, {
                    model: this.MODEL,
                    prompt: this.newMessage,
                    messages: this.saveMsg,
                    max_tokens: 800,
                    temperature: 0.1,
                });
                const serverMessage = JSON.parse(response.data[1]).choices[0].message.content.trim();
                this.saveMsg.push({ role: "system", content: serverMessage });
                this.messages.push({ text: serverMessage, isUser: false });
            } catch (error) {
                console.error('Error fetching response from ChatGPT API:', error);
                this.messages.push({ text: 'Error fetching response from server', isUser: false });
            }
        },

        // claude发送方式
        async handleClaudMessageSending() {
            await axios.post('/chat/send2claude', {
                model: this.CMDOEL,
                max_tokens: 2059,
                temperature: 0.1,
                // prompt: this.newMessage,
                messages: this.saveMsg
            }).then((res) => {
                console.log(res);
                console.log(JSON.parse(res.data[1]));
                const claudeRes = JSON.parse(res.data[1]).content[0].text
                const claudeResFormat = [{ type: "text", text: claudeRes }]

                this.saveMsg.push({ role: "assistant", content: claudeResFormat });
                this.messages.push({ text: claudeRes, isUser: false });
            }).catch((error) => {
                console.error('Error fetching response from Claude API:', error);
                this.messages.push({ text: 'Error fetching response from server', isUser: false });
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
    justify-content: space-between;
    flex-direction: column;
    align-items: center;
    position: relative;
}

.place-holder {
    margin-top: 300px;
}

.message-content {
    margin: 0px 10px;
}

.messages {
    padding: 10px;
    width: 100%;
    max-height: 600px;
    overflow-y: auto;
}

.user-message {
    background-color: #e0f7fa;
    padding: 5px;
    margin: 5px;
    border-radius: 5px;
}

.model-select {
    width: 240px;
    margin-right: 10px;
}

.server-message {
    background-color: #f5f5f5;
    padding: 5px;
    margin: 5px;
    border-radius: 5px;
}

.chat-input {
    /* display: flex;
    width: 80%; */
}

.welcome-title {
    margin-bottom: 20px;
    font-size: 30px;
}

.select-title {
    margin-bottom: 20px;
    margin-left: 66px;
}
</style>