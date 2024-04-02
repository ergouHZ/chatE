<template>
    <div class="chat-container">
        <div class="messages" v-if="messages.length > 0">
            <div v-for="(message, index) in messages" :key="index"
                :class="{ 'user-message': message.isUser, 'server-message': !message.isUser }">
                {{ !message.isUser ? "GPT" : "You" }}
                <span class="message-content">
                    {{ message.text }}
                </span>
            </div>
        </div>
        <!-- Loading indicator -->
        <div v-else class="place-holder">How can I help you today?</div>
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
interface Messages {
    // id: number;
    text: string;
    isUser: boolean;
}

export default {
    data() {
        return {
            messages: [] as Messages[],
            newMessage: '',
            apiUrl: "/chat/send2claude",
            // apiKey: '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', // Replace with your ChatGPT API key
            // apiUrl: 'https://api.openai.com/v1/chat/completions',
            // MODEL: "gpt-3.5-turbo",
            MODEL: "claude-instant-1.2",
            saveMsg: <any>[],
            isLoading: false
        };
    },
    methods: {
        async sendMessage() {
            this.isLoading = true
            if (this.newMessage.trim() !== '') {
                this.messages.push({ text: this.newMessage, isUser: true });
                this.saveMsg.push({ role: "user", content: this.newMessage })
                try {
                    const response = await axios.post(this.apiUrl, {
                        model: this.MODEL,
                        prompt: this.newMessage,
                        messages: this.saveMsg,
                        max_tokens: 2059,
                        temperature: 0.1,
                    }
                        // , {
                        //     headers: {
                        //         'Authorization': `Bearer ${this.apiKey}`,
                        //         'Content-Type': 'application/json'
                        //     }
                        // }
                    )
                    const serverMessage = response.data.choices[0].message.content.trim();
                    this.saveMsg.push({ role: "system", content: serverMessage })
                    this.messages.push({ text: serverMessage, isUser: false });
                } catch (error) {
                    console.error('Error fetching response from ChatGPT API:', error);
                    this.messages.push({ text: 'Error fetching response from server', isUser: false });
                }
                this.isLoading = false
                this.newMessage = '';
            }
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

.server-message {
    background-color: #f5f5f5;
    padding: 5px;
    margin: 5px;
    border-radius: 5px;
}

.chat-input {
    width: 50%;
}
</style>