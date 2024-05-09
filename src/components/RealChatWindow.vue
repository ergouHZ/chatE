<template>
    <div class="real-chat-container">
        <!-- 用户的message部分 -->
        <div class="messages" v-if="messages.length > 0">
            <div v-for="(message, index) in messages" :key="index"
                :class="{ 'user-message': message.isUser, 'server-message': !message.isUser }">
                <span v-if="message.isUser" class="message-content">{{ message.text }}</span>
                <span v-else class="message-content" v-markdown="message.text"></span>
            </div>
        </div>
        <!-- model使用部分 -->
        <div class="chat-info" v-else>
            您正在使用 {{ model }}
        </div>
        <!-- 是否展示loading -->
        <div v-if="isLoading" class="loading-indicator">{{ model }} 正在思考...</div>
        <!-- chat input部分 -->
        <div class="chat-input">
            <el-input style="min-width: 600px" type="text" v-model="newMessage" :disabled="isLoading"
                @keyup.enter="sendMessage" placeholder="发送消息" class="chat-input">
                <template #append>
                    <el-button :loading="isLoading" :disabled="isLoading" @click="sendMessage">
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
import { onMounted, getCurrentInstance } from 'vue';
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/userStore';
interface Messages {
    text: string;
    isUser: boolean;
}


export default {

    data() {
        return {
            messages: [] as Messages[], // 页面展示的message
            newMessage: '',
            apiUrl: "/chat/send2openai",
            apiClaude: "/chat/send2claude",
            MODEL: "gpt-3.5-turbo-0125",
            CMDOEL: "claude-instant-1.2",
            saveMsg: <any>[],
            isLoading: false,
            model: this.$route.query.model,  // 获取model
            accStatus: 0
        };
    },
    setup() {
        const UserStore = useUserStore()
        const username = UserStore.session.username
        //通过映射来判断用户的权限
        const permissionMapping = {
            200: ['gpt', 'claude'],
            201: ['gpt', 'claude'],
        };
        // 根据用户权限获取允许的模型列表
        function getAllowedModels(userPermission) {
            return permissionMapping[userPermission] || [];
        }
        // 检查用户是否有权限使用指定模型
        function hasPermissionForModel(userPermission, model) {
            const allowedModels = getAllowedModels(userPermission);
            return allowedModels.includes(model);
        }
        axios.defaults.headers.common['Authorization'] = UserStore.session.token;
        // 获取当前组件实例
        const instance = getCurrentInstance();

        // 在组件加载时执行一次 sendMessage 方法
        // onMounted(() => {
        //     // 从当前组件实例中获取 $route 和 sendMessage 方法
        //     const route = instance?.appContext.config.globalProperties.$route;
        //     // const sendMessage = instance?.proxy.sendMessage;

        //     // 如果 $route 中有 message 参数，则调用 sendMessage 方法
        //     if (route?.query.message) {
        //         // sendMessage();
        //         console.log();

        //     }
        // });
        onMounted(() => {
            // 页面加载之后验证用户身份
            const validate = async () => {
                try {
                    const response = await axios.post('/chat/validate', {
                        username
                    });
                    const accStatus = response.data.status
                    const res = hasPermissionForModel(accStatus, "gpt")
                    console.log(res);
                    

                } catch (error) {
                    console.error('Error fetching response from API:', error);
                }
            }
            validate()
        });
    },
    methods: {
        async sendMessage() {
            // 判断输入框不为空
            if (this.newMessage.trim() !== '') {
                this.isLoading = true
                //判断选择的模型，根据模型选择不同的发送格式
                switch (this.model) {
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
.real-chat-container {
    min-height: 800px;
    width: 100%;
    height: 100%;
    background-color: #fff;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center
}

.chat-info {}

.message-content {
    margin: 5px;
    border-radius: 10px;
    max-width: 70%;
    /* 最大宽度 */
    word-wrap: break-word;
    /* 超出宽度自动换行 */
}

.message-content p {
    margin: 0;
}

.messages {
    padding: 10px 300px;
    width: 100%;
    max-height: 700px;
    overflow-y: auto;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    /* 竖直排列消息 */
    align-items: flex-end;
    /* 用户消息靠右显示 */
}

.user-message {
    background-color: #15b8ce;
    margin-bottom: 10px;
    color: #fff;
    align-self: flex-end;
    border-radius: 10px;
    padding: 5px 20px;
}

.server-message {
    background-color: #f5f5f5;
    margin-bottom: 10px;
    color: #000;
    align-self: flex-start;
    border-radius: 10px;
    padding: 5px 20px;
}

.chat-input {
    display: flex;
    width: 80%;
    margin: 0 auto;
    margin-bottom: 20px;
}

.loading-indicator {
    margin: 0 auto;
}
</style>