<template>
    <!-- mark down 的主题 -->
    <!-- <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.4.0/styles/vs.min.css"> -->

    <link rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.4.0/styles/atom-one-dark.min.css">
    <div class="real-chat-container">
        <!-- 用户的message部分 -->
        <div class="messages" v-if="messages.length > 0">
            <div v-for="(message, index) in messages" :key="index"
                :class="{ 'user-message': message.isUser, 'server-message': !message.isUser }">
                <span v-if="message.isUser" class="message-content">{{ message.text }}</span>
                <!-- 对于非用户消息 -->
                <template v-else>
                    <span class="message-content" v-html="renderMarkdown(message.text)"></span>
                    <!-- 如果消息在实时流中，且是最后一项，实时显示内容 -->
                    <!-- <span v-if="isStreaming && index === messages.length - 1" class="message-content">{{ message.text }}</span> -->
                    <!-- 非实时流的消息，显示处理后的内容（假设是 Markdown 内容） -->
                    <!-- <span v-else class="message-content" v-markdown="message.text"></span> -->
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
                            发送
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
//清洗markdown内容
import DOMPurify from 'dompurify';
//markdown里渲染代码块需要的
import Clipboard from 'clipboard'; //提供代码粘贴板
import hljs from 'highlight.js';
import { default as MarkdownIt, default as markdownItHighlightjs } from 'markdown-it';
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
            markdownIt: new MarkdownIt(),  // 创建MarkdownIt实例

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
        //markdown中的渲染器，渲染代码块
        const md = new MarkdownIt({
            highlight: function (str, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    const code = hljs.highlight(lang, str, true).value;
                    const uniqueId = 'code-' + Date.now() + '-' + Math.floor(Math.random() * 1000); // 生成唯一ID
                    const div = document.createElement('div');
                    div.innerHTML = `<div class="code-block">
                <div class="code-block-header" style="display: flex; justify-content: space-between; align-items: center;">
                    <span class="code-block-language">${lang}</span>
                    <button class="code-block-copy-button" data-clipboard-target="#${uniqueId}">Copy</button>
                </div>
                <pre class="hljs"><code id="${uniqueId}">${code}</code></pre>
            </div>`;

                    return div.innerHTML;
                }
                return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
            }
        });

        // 实例化Clipboard
        const clipboardInstances: any = [];
        const copyButtons = document.querySelectorAll('.code-block-copy-button');
        copyButtons.forEach(button => {
            const clipboardInstance = new Clipboard(button);
            clipboardInstances.push(clipboardInstance);
        });

        // 使用markdown-it-highlightjs插件
        md.use(markdownItHighlightjs);
        const renderMarkdown = (text) => {
            const dirtyHtml = md.render(text);
            return DOMPurify.sanitize(dirtyHtml);  // 清洗HTML内容
        };

        //使用userstore获取令牌
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

        //控制器，用于控制是否用户中途离开
        const controller = new AbortController();
        const signal = controller.signal;
        const result = ref(''); // 用于累积结果的变量

        onBeforeUnmount(() => {
            controller.abort(); // 取消fetch请求
        });
        return {
            renderMarkdown,
        };
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

        //实时渲染到页面 并保留格式

        async requestTestGPTStream() {
            // 创建一个AbortController实例
            const controller = new AbortController();
            const signal = controller.signal; //这个用于判断用户是否流式的过程中离开

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
                        model: 'deepseek-coder',
                        max_tokens: 800,
                        temperature: 0.1,
                        stream: true,
                        messages: this.saveMsg
                    }),
                    signal // 将signal传递给fetch请求
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
                        const trimmedData = data.replace(/\s+/g, ''); // 去除字符串中间的所有空格
                        if (data === '[DONE]' || trimmedData === '{"type":"message_stop"}') { //信息获取完毕
                            console.log('data: ' + data);
                            console.log('Stream completed');
                            console.log('Final result:', result);
                            this.saveMsg.push({ role: "assistant", content: result });//最后所有的信息更新进将来要一起发送的队列
                            this.isStreaming = false;//结束流式
                            //this.handleScroll()
                            return;
                        }
                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.choices) { // 如果是第一种格式,即openai,deeepseek,按下面格式解析.因为两者返还不一样
                                const content = parsed.choices[0].delta?.content;
                                if (content) {
                                    this.messages[currentMessageIndex].text += content; // 实时更新
                                    result += content; //累计最后的结果
                                }
                            } else if (parsed.delta && parsed.delta?.text) { // 如果是第二种格式,即claude,按下面格式解析
                                const text = parsed.delta?.text;
                                this.messages[currentMessageIndex].text += text;//页面上的最后一项，即正在更新的ai输入，实时更新
                                result += text; //累计最后的结果
                            }
                        } catch (error) {
                            if (error.message === 'AbortError') {
                                console.log('Request was aborted by the user.');
                                // 发送包含当前结果的请求
                                this.sendResultRequest(result);
                            } else {
                                console.error('An error occurred:', error);
                            }
                        }
                    }
                }
            }
            this.sendResultRequest(result);
        },

        sendResultRequest(result) {
            // 发送包含当前结果的请求
            // 你可以在这里添加代码来发送请求
        },
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

.chat-input {
    display: flex;
    width: 80%;
    margin: 0 auto;
    margin-bottom: 20px;
}

.loading-indicator {
    margin: 0 auto;
}

/* 代码区块 */
.code-block-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0px;
    background-color: #77767662;
    /* 轻微的背景颜色 */
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    margin: 0px;
}

.code-block-language {
    font-weight: bold;
    /* 加粗显示语言名称 */
}

/* 
复制按钮 */
.code-block-copy-button {
    padding: 5px 10px;
    background-color: #007bff;
    color: #ffffff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    /* 鼠标悬停时显示手型指针 */
}

.code-block-copy-button:hover {
    background-color: #0056b3;
    /* 鼠标悬停时的背景颜色 */
}

.hljs {
    margin-top: 0;
    /* 移除上部的margin，让标题和代码块更紧凑 */
    padding: 0;
}

pre,
code {
    margin: 0;
    padding: 0;
    line-height: 1.2;
}
</style>