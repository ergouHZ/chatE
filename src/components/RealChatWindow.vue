<template>
    <div class="real-chat-container">
        <!-- 用户的message部分 -->
        <div class="messages" v-if="messages.length > 0">
            <div v-for="(message, index) in messages" :key="index"
                :class="{ 'user-message': message.isUser, 'server-message': !message.isUser }">
                <span v-if="message.isUser" class="message-content">{{ message.text }}</span>
                <!-- 对于非用户消息 -->
                <template v-else>
                    <!-- 如果消息在实时流中，实时显示内容 -->
                    <span v-if="isStreaming" class="message-content">{{ message.text }}</span>
                    <!-- 非实时流的消息，显示处理后的内容（假设是 Markdown 内容） -->
                    <span v-else class="message-content" v-markdown="message.text"></span>
                </template>
            </div>
        </div>
        <!-- model使用部分 -->
        <div class="chat-info" v-else>
            您正在使用 {{ model }}
        </div>
        <!-- 是否展示loading -->
        <div v-if="isLoading" class="loading-indicator">Loading...</div>
        <!-- chat input部分 -->
        <div class="chat-input">
            <el-input style="min-width: 600px" type="text" v-model="newMessage" :disabled="isLoading"
                @keyup.enter="sendMessage" placeholder="今天可以怎么帮助你" class="chat-input">
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
import { useUserStore } from '@/stores/userStore';
import axios from 'axios';
import { getCurrentInstance } from 'vue';

interface Messages {
    text: string;
    isUser: boolean;
}


export default {
    mounted() {
    },


    data() {
        return {
            messages: [] as Messages[], // 页面展示的message
            newMessage: '',
            apiUrl: "/chat/send2openai",
            apiClaude: "/chat/send2claude",
            MODEL: "gpt-3.5-turbo-0125",
            CMODEL: "claude-instant-1.2",
            saveMsg: <any>[],
            isLoading: false,
            model: this.$route.query.model,  // 获取model,通过query获取参数
            isStreaming: false, //是否在流式
        };
    },
    setup() {
        const UserStore = useUserStore()
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
    },
    methods: {
        async sendMessage() {
            // 判断输入框不为空
            if (this.newMessage.trim() !== '') {
                this.isLoading = true
                //把用户新输入的信息更新进页面上的队列中
                this.messages.push({ text: this.newMessage, isUser: true });
                //用户新输入的信息放入保存的消息列表，这个列表用于以后的发送
                this.saveMsg.push({ role: "user", content: this.newMessage })
                await this.requestTestGPTStream()
                this.isLoading = false
                this.newMessage = '';
            }
        },

        async requestTestGPTStream() {

            const UserStore = useUserStore()//获取用户session,获取token
            const response = await fetch(
                //'https://chatserver.eeeegou.com/chat/send2openai/stream'
                'http://localhost:8080/chat/send2openai/stream'
                , {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': UserStore.session.token //获取访问令牌
                    },
                    body: JSON.stringify({
                        model: this.CMODEL,
                        max_tokens: 800,
                        temperature: 0.1,
                        stream: true,
                        messages: this.saveMsg
                    })
                });
            this.messages.push({ text: '', isUser: false }); //队列加一条新消息开始传输
            let currentMessageIndex = this.messages.length - 1; // 获取当前消息的索引
            this.isStreaming = true; // 标记为实时更新 流式传输状态

            const reader = response.body!!.getReader();
            const decoder = new TextDecoder('utf-8');
            let result = ''; //获取字符串
            //解析并动态解析到返回流
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const text = decoder.decode(value);
                const lines = text.split('\n');
                for (const line of lines) {
                    if (line.startsWith('data:')) {
                        const data = line.slice(5).trim(); //去除data:{     ,解析剩下的内容}
                        if (data === '[DONE]' || data === '{"type":"message_stop"}') { //信息获取完毕
                            console.log('Stream completed');
                            console.log('Final result:', result);
                            this.saveMsg.push({ role: "assistant", content: result });//最后所有的信息更新进将来要一起发送的队列
                            this.isStreaming = false;//结束流式
                            return;
                        }
                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.choices) { // 如果是第一种格式,即openai,deeepseek,按下面格式解析.因为两者返还不一样
                                const content = parsed.choices[0].delta?.content;
                                if (content) {
                                    this.messages[currentMessageIndex].text += content; // 实时更新
                                    result += content; //累计最后的结果
                                    console.log('Received:', content);
                                }
                            } else if (parsed.delta && parsed.delta?.text) { // 如果是第二种格式,即claude,按下面格式解析
                                const text = parsed.delta?.text;
                                this.messages[currentMessageIndex].text += text;//页面上的最后一项，即正在更新的ai输入，实时更新
                                result += text; //累计最后的结果
                                console.log('Received:', text);
                            }
                        } catch (error) {
                            console.error('Error parsing JSON:', error);
                        }
                    }
                }
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
                this.saveMsg.push({ role: "assistant", content: serverMessage });
                this.messages.push({ text: serverMessage, isUser: false });
            } catch (error) {
                console.error('Error fetching response from ChatGPT API:', error);
                this.messages.push({ text: 'Error fetching response from server', isUser: false });
            }
        },

        // claude发送方式
        async handleClaudMessageSending() {
            await axios.post('/chat/send2claude', {
                model: this.CMODEL,
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
    
    align-self: flex-start;
    border-radius: 10px;
    padding: 5px 20px;
}

.server-message pre code {
    color: inherit;
    /* 让代码块内的文字颜色继承自高亮库的设置*/
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



/* Visual Studio Theme */
.hljs {
    color: #dcdcdc;
    background: #1e1e1e;
}

.hljs-keyword,
.hljs-literal,
.hljs-symbol,
.hljs-name {
    color: #569cd6;
}

.hljs-link {
    color: #569cd6;
    text-decoration: underline;
}

.hljs-built_in,
.hljs-type {
    color: #4ec9b0;
}

.hljs-number,
.hljs-class {
    color: #b8d7a3;
}

.hljs-string,
.hljs-meta-string {
    color: #d69d85;
}

.hljs-regexp,
.hljs-template-tag {
    color: #9a5334;
}
</style>