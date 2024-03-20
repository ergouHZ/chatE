<template lang="">
    <div class="chat-container">
        <div class="messages">
      <div v-for="(message, index) in messages" :key="index" :class="{ 'user-message': message.isUser, 'server-message': !message.isUser }">
        {{ message.text }}
      </div>
    </div>
        <div class="chat-input">
        <el-input
            style="min-width: 600px"
            type="text" v-model="newMessage"
            @keyup.enter="sendMessage"
            placeholder="Type your message..."
            class="chat-input"
        >
        <template #append>
            <el-button @click="sendMessage">
                <el-icon class="el-icon--right"><Upload /></el-icon>
            </el-button>
        </template>
</el-input>
</div>
</div>
</template>

<script lang="ts">

import axios from 'axios';

export default {
    data() {
        return {
            messages: <any>[],
            newMessage: '',
            apiKey: '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', // Replace with your ChatGPT API key
            apiUrl: 'https://api.openai.com/v1/chat/completions',
            MODEL: "gpt-3.5-turbo",
            // MODEL: "davinci-002",

            saveMsg: <any>[]
        };
    },
    methods: {
        async sendMessage() {
            console.log(this.newMessage);

            if (this.newMessage.trim() !== '') {
                this.messages.push({ text: this.newMessage, isUser: true });
                this.saveMsg.push({ role: "user", content: this.newMessage })
                try {
                    const response = await axios.post(this.apiUrl, {
                        model: this.MODEL,
                        // prompt: this.newMessage,
                        messages: this.saveMsg
                    }, {
                        headers: {
                            'Authorization': `Bearer ${this.apiKey}`,
                            'Content-Type': 'application/json'
                        }
                    })
                    const serverMessage = response.data.choices[0].message.content.trim();
                    this.saveMsg.push({ role: "system", content: serverMessage })
                    this.messages.push({ text: serverMessage, isUser: false });
                } catch (error) {
                    console.error('Error fetching response from ChatGPT API:', error);
                    this.messages.push({ text: 'Error fetching response from server', isUser: false });
                }
                this.newMessage = '';
            }
        }
    }
};
</script>
<style>
.chat-container {
    min-height: 500px;
    border-radius: 20px;
    border: 1px solid #ccc;
    background-color: #fff;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.messages {
    padding: 10px;
    max-height: 300px;
    overflow-y: auto;
}

.user-message {
    background-color: #e0f7fa;
    padding: 5px;
    margin: 5px;
    border-radius: 5px;
    text-align: right;
}

.server-message {
    background-color: #f5f5f5;
    padding: 5px;
    margin: 5px;
    border-radius: 5px;
    text-align: left;
}
</style>