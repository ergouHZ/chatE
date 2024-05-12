<script setup lang="ts">
import { useCounterStore } from '@/stores/counter';
import { useUserStore } from '@/stores/userStore';
import axios from 'axios';
import { ref } from 'vue';
import BlogPost from '../views/BlogPost.vue';

let result = ref('')//页面上的动态更新内容
const posts = ref([
    { id: 1, title: 'My journey with Vue', body: 'ok1111' },
    { id: 2, title: 'Blogging with Vue', body: 'oka222y' }
])

const postFontSize = ref(1)

const counterStore = useCounterStore()
const UserStore = useUserStore()

function oukei() {
    axios.get('/hello', {
    })
        .then(response => {
            console.log(response);
        })
        .catch(error => {
            console.log(error);
        });
}


axios.defaults.headers.common['Authorization'] = UserStore.session.token;
//这是发claude的格式
async function requestTest() {
    await axios.post('/chat/send2openai', {
        model: "deepseek-chat",
        max_tokens: 2059,
        temperature: 0.1,
        messages: [
            {
                role: "user",
                content: "介绍一下你自己"
            },
            {
                role: "assistant",
                content: "我是GPT,一个由OpenAI开发的大型语言模型,我可以帮助您完成各种任务,如写作、编程、问答等。"
            }
        ]
    }).then((res) => {
        console.log(res.data[1]);
    }).catch((error) => {
        console.error(error);
    });
}

async function requestTestGPT() {
    await axios.post('/chat/send2openai', {
        model: "claude-instant-1.2",
        max_tokens: 800,
        temperature: 0.1,

        messages: [
            {
                role: "user",
                content: "介绍一下你自己"
            },
            {
                role: "assistant",
                content: "我是GPT,一个由OpenAI开发的大型语言模型,我可以帮助您完成各种任务,如写作、编程、问答等。"
            }
        ]
    }).then((res) => {
        console.log(res.data[1]);
    }).catch((error) => {
        console.error(error);
    });
}
async function validateTest() {
    result.value = '1';
    await axios.post(`chat/validate`, {
        username: UserStore.session.username
    }).then((res) => {
        console.log(res);
        console.log(res.data);
    }).catch((error) => {
        console.log(error);
    });

}

async function requestTestGPTStream() {
    const response = await fetch(
        //'https://chatserver.eeeegou.com/chat/send2openai/stream'
        'http://localhost:8080/chat/send2openai/stream'
        , {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': UserStore.session.token
        },
        body: JSON.stringify({
            model: "claude-instant-1.2",
            max_tokens: 800,
            temperature: 0.1,
            stream: true,
            messages: [
                {
                    role: "user",
                    content: "介绍一下你自己"
                },
                {
                    role: "assistant",
                    content: "好的"
                }
            ]
        })
    });

    const reader = response.body!!.getReader();
    const decoder = new TextDecoder('utf-8');

    //解析并动态解析到返回流
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        const lines = text.split('\n');
        for (const line of lines) {
            if (line.startsWith('data:')) {
                const data = line.slice(5).trim(); //去除data:{     ,解析剩下的内容}
                if (data === '[DONE]') {
                    console.log('Stream completed');
                    console.log('Final result:', result);
                    return;
                }
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.choices) { // 如果是第一种格式,即openai,deeepseek,按下面格式解析.因为两者返还不一样
                        const content = parsed.choices[0].delta.content;
                        if (content) {
                            result.value += content;
                            console.log('Received:', content);
                        }
                    } else if (parsed.delta && parsed.delta.text) { // 如果是第二种格式,即claude,按下面格式解析
                        const text = parsed.delta.text;
                        result.value += text;
                        console.log('Received:', text);
                    }
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                }
            }
        }
    }
}

</script>

<template>
    <div :style="{ fontSize: postFontSize + 'em' }">
        <BlogPost v-for="post in posts" :key="post.id" :title="post.title" :body="post.body"
            @enlarge-text="postFontSize += 0.1"></BlogPost>
    </div>

    <p>result:{{ result }}</p>
    <div>
        <button @click="oukei">{{ counterStore.count }}</button>
        <p>Double count is {{ counterStore.doubleCount }}</p>
        <el-button @click="requestTest" type="primary">claude发送测试</el-button>
        <el-button @click="validateTest" type="warning">验证测试</el-button>
        <el-button @click="requestTestGPT" type="primary">gpt发送测试</el-button>
        <el-button @click="requestTestGPTStream" type="info">gpt流式测试</el-button>
    </div>
</template>./view/BlogPost.vue