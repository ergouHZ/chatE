<template>
    <!-- mark down 的主题 -->
    <!-- <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.4.0/styles/vs.min.css"> -->
    <link rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.4.0/styles/atom-one-dark.min.css">
    <!-- 用户的message部分 -->

    <div class="chat-container">
        <div ref="containerRef" class="messages-container">
            <el-card @click="" class="select-card" shadow="hover">gpt-4o</el-card>
            <div v-for="(message, index) in messages" :key="index"
                :class="{ 'user-message': message.isUser, 'server-message': !message.isUser }">
                <span v-if="message.isUser" class="message-content">{{ message.text }}</span>
                <!-- 对于非用户消息 -->
                <template v-else>
                    <div class="model-info">
                        <el-avatar class="model-avatar" shape="circle" :size="36" :src="changeToThumb(model)" />

                    </div>
                    <span class="message-content" v-html="renderMarkdown(message.text)"></span>
                </template>
            </div>
        </div>
        <!-- model使用部分 -->
        <!--  <div class="chat-info" v-else>
        您正在使用 {{ model }}
    </div> -->
        <!-- 是否展示loading -->
        <!--     <div v-if="isLoading" class="loading-indicator">Loading...</div> -->
        <!-- chat input部分 -->
        <div class="chat-input-container">
            <el-input v-model="newMessage" style="min-width: 400px;font-weight: bolder ;"
                :autosize="{ minRows: 4, maxRows: 7 }" type="textarea" placeholder="今天想聊什么" class="chat-input-in-real"
                :disabled="isLoading" @keyup.enter="sendMessage">
            </el-input>
            <el-button v-if="!isLoading" :loading="isLoading" :disabled="isLoading" @click="sendMessage">
                发送
                <el-icon class="el-icon--right">
                    <ArrowRight />
                </el-icon>
            </el-button>
            <el-button v-if="isLoading" :disabled="!isLoading" @click="abortMessage">
                停止
                <el-icon class="el-icon--right">
                    <Close />
                </el-icon>
            </el-button>
        </div>
    </div>

</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import { changeToThumb } from '@/utils';
import {
ArrowRight,
Close
} from '@element-plus/icons-vue';
import axios from 'axios';
import Clipboard from 'clipboard'; //按键粘贴板
import CryptoJS from 'crypto-js';
import DOMPurify from 'dompurify'; //文本使用html渲染，这里要防止注入攻击
import { ElLoading, ElNotification } from 'element-plus';
import hljs from 'highlight.js';
import { default as MarkdownIt, default as markdownItHighlightjs } from 'markdown-it';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

interface Messages {
    text: string;
    isUser: boolean;
}
const messages = ref<Messages[]>([]); //页面上显示的列表
const MAX_LENGTH = 7; // 设置最大长度为 8，这个是发送的最大的队列数
const saveMsg = ref<any>([]); //需要发送的主体
const newMessage = ref(''); //此为用户输入
const isLoading = ref(false);
const isUserScrolling = ref(false); //如果用户滚动，则不需要自动滚动

const route = useRoute();
const router = useRouter();

//获取传输参数
const secretKey = 'asdhiu(2398*&*(8213has^72*7^%' //防君子不防小人，真正的信息获取办法在服务器里面，这个只是给路径上遮罩
const windowId = ref(route.query.windowId);
const model = ref(route.query.model);
const isStreaming = ref(false);

const clearData = () => {
    messages.value = [];
    saveMsg.value = [];
}
// 创建一个ref来引用容器元素
const containerRef = ref<HTMLElement | null>(null);

// 滚动到容器底部的函数，有点太花了，暂时先不用
const scrollToBottomWhenInit = () => {
    if (containerRef.value) {
        const container = containerRef.value;
        const lastChild = container.lastElementChild;
        if (lastChild) {
            lastChild.scrollIntoView({
                behavior: 'smooth',
                block: 'end',
                inline: 'nearest',
            });
        }
    }
};

//两者动画不一样，这个是流式传输的滚动
const scrollToBottom = () => {
    if (containerRef.value) {
        const container = containerRef.value;
        container.scrollTop = container.scrollHeight;
    }
};

// 创建AbortController
const controller = ref()

// 监听 route.query 的变化
watch(() => route.query, (newQuery) => {
    controller.value = new AbortController();
    controller.value.abort();
    clearData();  //更新所有信息并清空记录
    decryptThePath(route.query.pa);//解析路径
    if (windowId.value) {
        getMessageContent(windowId.value);
    }
}
    //, { immediate: true }   //组件挂载的时候执行
);


// 创建MarkdownIt实例并配置代码高亮
const md = new MarkdownIt({
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                const result = hljs.highlight(str, { language: lang, ignoreIllegals: true });
                const uniqueId = 'code-' + Date.now() + '-' + Math.floor(Math.random() * 1000); // 生成唯一ID
                //markdown 的样式
                const div = document.createElement('div');
                div.innerHTML = `<div class="code-block-header" style="display: flex; justify-content: space-between; align-items: center;">
          <div class="code-block-language">${lang}</div>
          <button class="code-block-copy-button" data-clipboard-target="#${uniqueId}">Copy</button>
        </div>
        <pre class="hljs"><code id="${uniqueId}">${result.value}</code></pre>`;
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
// 初始化Clipboard ，为每个块赋予按钮
const clipboardInstances: any = [];
//页面元素渲染
const renderMarkdown = (text: string) => {
    const dirtyHtml = md.render(text);
    const sanitizedHtml = DOMPurify.sanitize(dirtyHtml);
    // 在下一个 DOM 更新周期中绑定复制按钮的事件
    nextTick(() => {
        const copyButtons = document.querySelectorAll('.code-block-copy-button');
        copyButtons.forEach((button) => {
            const clipboardInstance = new Clipboard(button);
            clipboardInstances.push(clipboardInstance);
            //添加 click 事件监听器
            button.addEventListener('click', () => {
                // 取消选中的痕迹
                window.getSelection()?.removeAllRanges();
                // 显示"已复制"的弹窗
                if (!isUserScrolling.value) {
                    ElMessage({
                        message: 'Copied.',
                        type: 'success',
                    })
                    isUserScrolling.value = true //借用以下这个值,防止重复弹窗
                }
                setTimeout(() => {
                    isUserScrolling.value = false
                }, 50);
            });
        });
    });
    return sanitizedHtml;
};

// 设置Axios的默认头部
const UserStore = useUserStore();
axios.defaults.headers.common['Authorization'] = UserStore.session.token;

//载入的时候清空
onBeforeMount(() => {
    decryptThePath(route.query.pa);//解析路径
    clearData()
});

onMounted(() => {
    //这里不加在新内容，由watch负责，不然会重复
    if (windowId.value) {
        getMessageContent(windowId.value);
    }
});

// 在组件卸载前的方法
onUnmounted(() => {
    //卸载时取消请求 发送信号
    controller.value = new AbortController();
    controller.value.abort();
    //这个会触发是因为点击一次停止按钮之后,之后的都会带这个信息,要修改一下
});

const decryptThePath = async (codePath) => {
    const bytes = CryptoJS.AES.decrypt(codePath, secretKey);
    const code = bytes.toString(CryptoJS.enc.Utf8)
    var modelRegex = /model=([^&]+)/;
    var modelMatch = code.match(modelRegex);
    var modelInPath = modelMatch ? modelMatch[1] : null; // 提取 model 参数的值

    // 提取 windowId 参数
    var windowIdRegex = /windowId=([^&]+)/;
    var windowIdMatch = code.match(windowIdRegex);
    var windowInPath = windowIdMatch ? windowIdMatch[1] : null; // 提取 windowId 参数的值

    model.value = modelInPath //赋值
    windowId.value = windowInPath
}

const abortMessage = () => {
    if (isLoading) { controller.value.abort(); }
}

// 发送消息的方法
const sendMessage = async () => {
    if (newMessage.value.trim() !== '') {
        if (saveMsg.value.length == 0) { //如果是第一条消息
            console.log(model.value);
            createChatWindow()
        }
        isLoading.value = true;
        messages.value.push({ text: newMessage.value, isUser: true }); //显示的内容

        if (saveMsg.value.length >= MAX_LENGTH) {
            // 移除最早的一项
            saveMsg.value.shift();
            saveMsg.value.shift();
        }
        saveMsg.value.push({ role: 'user', content: newMessage.value });//发送的内容
        console.log("the sagemessage:" + saveMsg.value[0].content)
        scrollToBottom();
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
            aiModel: model.value
        });

        // 处理响应数据
        if (response.data.success) {
            console.log('Chat window created with ID:', response.data.data);
            windowId.value = response.data.data; // 返回聊天框ID
            UserStore.session.isUpdating = true; //通知客户端有记录更新
            console.log("new chat window updated:");
        } else {
            ElNotification({
                title: 'Warning',
                message: 'waiting for network update',
                type: 'warning',
            })
            return null;
        }
    } catch (error) {
        ElNotification({
            title: 'Warning',
            message: 'waiting for network update',
            type: 'error',
        })
        return null;
    }
};
// 处理流式请求的方法
const requestTestGPTStream = async () => {
    // 在发送请求之前,创建一个新的 AbortController 实例,重置信号
    controller.value = new AbortController();
    const signal = controller.value.signal;
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
                max_tokens: 2400,
                temperature: 0.6,
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
                            scrollToBottom();
                        }
                    } else if (parsed.delta && parsed.delta?.text) { // 如果是第二种格式,即claude,按下面格式解析
                        const text = parsed.delta?.text;
                        messages.value[currentMessageIndex].text += text;//页面上的最后一项，即正在更新的ai输入，实时更新
                        result += text; //累计最后的结果
                        //滚动的方法
                        scrollToBottom();
                    }
                } catch (error) {
                    ElNotification({
                        title: 'Error',
                        message: 'Empty response',
                        type: 'error',
                    })
                }
            }
        }
        //如果有信号,页面卸载,则执行方法,防止终端的信息未储存
        if (signal.aborted) {
            console.error('request aborted:');
            sendResultRequest(messages.value[currentMessageIndex - 1].text, result);
            saveMsg.value.push({ role: "assistant", content: result });//中断的时候也要储存，不然会出问题
            break;
        }
    }
};

// 发送结果请求的方法，更新数据库中的消息列表
const sendResultRequest = async (userContent: string, aiContent: String) => {
    console.log("db started: " + aiContent);
    try {
        const response = await axios.post('/message/content', {
            userContent: userContent,
            aiContent: aiContent,
            messageBoxId: windowId.value,
        });
    } catch (error) {
        ElNotification({
                title: 'Error',
                message: 'Empty response',
                type: 'error',
            })
    }
};

// 获取消息记录的方法
async function getMessageContent(messageBoxId) {
    isLoading.value = true;  // 开始加载
    const loading = ElLoading.service({
        lock: false,
        text: 'Loading',
        background: 'rgba(0, 0, 0, 0.5)',
    })
    try {
        const response = await axios.post('/message/content/get', null, {
            params: {
                messageBoxId: messageBoxId,
            },
        });

        if (response.data.status === 200) {
            const messageData = response.data.data;
            // 处理消息数据并赋值给 messages 和 saveMsg
            const processedMessages: Messages[] = [];
            const processedSaveMsg: any[] = [];
            for (const message of messageData) {
                processedMessages.push(
                    { text: message.userContent, isUser: true },
                    { text: message.aiContent, isUser: false }
                );
                if (saveMsg.value.length >= MAX_LENGTH) {
                    // 移除最早的一项
                    saveMsg.value.shift();
                }
                processedSaveMsg.push(
                    { role: 'user', content: message.userContent },
                    { role: 'assistant', content: message.aiContent }
                );
            }

            messages.value = processedMessages;
            saveMsg.value = processedSaveMsg;
        } else if (response.data.status === 201) {
            ElNotification({
                title: 'warning',
                message: 'No message found',
                type: 'warning',
            })
            console.log("window success: no message " + response.data.message);
        } else {
            ElNotification({
                title: 'Error',
                message: 'Empty response',
                type: 'error',
            })
        }
    } catch (error) {
        ElNotification({
            title: 'Error',
            message: 'Empty response',
            type: 'error',
        })
        console.error('Error fetching message content:', error);
    } finally {
        setTimeout(() => {
            scrollToBottom();
        }, 10)
        setTimeout(() => {
            //scrollToBottomWhenInit(); //更新完之后滚到底部
            loading.close()
        }, 300)
        isLoading.value = false;  // 加载结束
    }
}
</script>
<style scope>
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

@media (max-width: 1080px) {}

/* 当视口宽度介于630px和100px之间时应用以下样式 */


/* 滚动条 */
.messages-container::-webkit-scrollbar-track {
    background-color: #f1f1f1;
    /* 设置滚动条背景颜色 */
}

.chat-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    /* 使容器占满整个视口高度 */
    background-color: Transparent;
    border: none;
    padding: 0;
    overflow: hidden
}

.messages-container {
    flex: 1;
    padding-left: 16%;
    padding-right: 14%;
    overflow-y: auto;
    overflow-x: hidden;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    /* 竖直排列消息 */
    align-items: center;
    /* 用户消息靠右显示 */
}

.user-message,
.server-message {
    /*  background-color: #badafb31; */
    margin-bottom: 2em;
    align-self: flex-start;
    padding: 5px;
    width: 800px;
    max-width: 100%;
    font-size: medium;
    /* border: 1.5px solid #71707073; */
}

.user-message {
    text-align: right;
}


/* 模型信息部分 */
.model-info {
    display: flex;
    align-items: center;
    justify-content: flex-start;
}

.model-avatar {
    margin-right: 10px;
    /* 根据需要调整间距 */
}

.model-name {
    margin: 0;
    /* 重置默认的外边距 */
    font-size: medium;
    font-weight: bold;
}

.chat-input-container {
    display: flex;
    align-items: center;
    background-color: transparent;
    position: sticky;
    bottom: 0;
    width: 80%;
    max-width: 900px;
}

.chat-input-in-real {
    flex: 1;
    margin: 16px;

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

.code-block {
    margin: 0;
    padding: 0;
}

pre,
code {
    margin: 0;
    padding: 0;
    line-height: 1.2;
    width: inherit !important;
    font-size: 1em;
    /* Optional, only if needed */
}

pre {
    overflow-x: hidden;
    overflow-y: hidden;
}

.hljs {
    overflow-x: scroll;
    overflow-y: hidden;
    margin: 0;
    padding: 0;
}
</style>