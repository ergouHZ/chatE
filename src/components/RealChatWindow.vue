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

<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import axios from 'axios';
import Clipboard from 'clipboard';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import { default as MarkdownIt, default as markdownItHighlightjs } from 'markdown-it';
import { onBeforeUnmount, ref } from 'vue';
import { useRoute } from 'vue-router';

interface Messages {
    text: string;
    isUser: boolean;
}
const messages = ref<Messages[]>([]); //页面上显示的列表
const saveMsg = ref<any>([]); //需要发送的主体
const newMessage = ref(''); //此为用户输入
const apiUrl = '/chat/send2openai';
const apiClaude = '/chat/send2claude';
const MODEL = 'gpt-3.5-turbo-0125';
const CMODEL = 'claude-instant-1.2';
const isLoading = ref(false);
const route = useRoute();
const windowId = ref(route.query.model);
const model = ref(route.query.model);
const isStreaming = ref(false);

// 创建MarkdownIt实例并配置代码高亮
const md = new MarkdownIt({
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                const result = hljs.highlight(str, { language: lang, ignoreIllegals: true });
                const uniqueId = 'code-' + Date.now() + '-' + Math.floor(Math.random() * 1000); // 生成唯一ID
                const div = document.createElement('div');
                div.innerHTML = `<div class="code-block">
                    <div class="code-block-header" style="display: flex; justify-content: space-between; align-items: center;">
                        <span class="code-block-language">${lang}</span>
                        <button class="code-block-copy-button" data-clipboard-target="#${uniqueId}">Copy</button>
                    </div>
                    <pre class="hljs"><code id="${uniqueId}">${result.value}</code></pre>
                </div>`;

                return div.innerHTML;
            } catch (err) {
                console.error(err);
            }
        }
        return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
    }
});

// 渲染Markdown的方法
md.use(markdownItHighlightjs);
const renderMarkdown = (text: string) => {
    const dirtyHtml = md.render(text);
    return DOMPurify.sanitize(dirtyHtml);
};

// 初始化Clipboard ，为每个块赋予按钮
const clipboardInstances: any = [];
const copyButtons = document.querySelectorAll('.code-block-copy-button');
copyButtons.forEach((button) => {
    const clipboardInstance = new Clipboard(button);
    clipboardInstances.push(clipboardInstance);
});

// 设置Axios的默认头部
const UserStore = useUserStore();
axios.defaults.headers.common['Authorization'] = UserStore.session.token;

// 创建AbortController
const controller = new AbortController();
const signal = controller.signal; //是否中断的信号

// 在组件卸载前的方法
onBeforeUnmount(() => {
    //卸载时取消请求 发送信号
    controller.abort();
});

// 发送消息的方法
const sendMessage = async () => {
    if (newMessage.value.trim() !== '') {
        if (saveMsg.value.length == 0) { //如果是第一条消息
            console.log(model.value);
            createChatWindow()
        }
        isLoading.value = true;
        messages.value.push({ text: newMessage.value, isUser: true }); //显示的内容
        saveMsg.value.push({ role: 'user', content: newMessage.value });//发送的内容
        await requestTestGPTStream();
        isLoading.value = false;
        newMessage.value = '';
    }
};

async function createChatWindow() {
    try {
        const response = await axios.post(`/message/window`, {
            userId: UserStore.session.userId,
            firstMessage: newMessage.value,
            aiModel:model.value
        });

        // 处理响应数据
        if (response.data.success) {
            console.log('Chat window created with ID:', response.data.data);
            windowId.value= response.data.data; // 返回聊天框ID
        } else {
            console.error('Failed to create chat window:', response.data.message);
            return null;
        }
    } catch (error) {
        console.error('Error creating chat window:', error);
        return null;
    }
};
// 处理流式请求的方法
const requestTestGPTStream = async () => {
    // 创建一个AbortController实例
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
                model: model.value,
                max_tokens: 800,
                temperature: 0.1,
                stream: true,
                messages: saveMsg.value,
                signal: signal // 将signal传递给fetch请求
            }),
        });

    messages.value.push({ text: '', isUser: false }); //队列加一条新消息开始传输
    let currentMessageIndex = messages.value.length - 1; // 获取当前消息的索引
    isStreaming.value = true; // 标记为实时更新 流式传输状态

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
                const data = line.slice(5).trim(); //去除'data:'   ,解析剩下的内容}
                const trimmedData = data.replace(/\s+/g, ''); // 去除字符串中间的所有空格
                if (data === '[DONE]' || trimmedData === '{"type":"message_stop"}') { //信息获取完毕
                    console.log('data: ' + data);
                    console.log('Final result:', result);
                    saveMsg.value.push({ role: "assistant", content: result });//最后所有的信息更新进将来要一起发送的队列
                    isStreaming.value = false;//结束流式
                    //储存到数据库,这个数组最后一条是刚更新的ai,上一条是用户
                    sendResultRequest(messages.value[currentMessageIndex - 1].text, messages.value[currentMessageIndex].text);
                    return;
                }
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.choices) { // 如果是第一种格式,即openai,deeepseek,按下面格式解析.因为两者返还不一样
                        const content = parsed.choices[0].delta?.content;
                        if (content) {

                            messages.value[currentMessageIndex].text += content; // 实时更新，因为使用了ref数组，所以现需要用ref获取值，在用index获取位置
                            result += content; //累计最后的结果
                        }
                    } else if (parsed.delta && parsed.delta?.text) { // 如果是第二种格式,即claude,按下面格式解析
                        const text = parsed.delta?.text;
                        messages.value[currentMessageIndex].text += text;//页面上的最后一项，即正在更新的ai输入，实时更新
                        result += text; //累计最后的结果
                    }
                } catch (error) {

                    console.error('An error occurred:', error);

                }
            }
        }
        //如果有信号,页面卸载,则执行方法,防止终端的信息未储存
        if (signal.aborted) {
            break;
            sendResultRequest(messages.value[currentMessageIndex - 1].text, messages.value[currentMessageIndex].text);
        }
    }

};

// 发送结果请求的方法，更新数据库中的消息列表
const sendResultRequest = (userContent: string, aiContent: String) => {
    // ... 你的发送请求逻辑 ...

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