<script setup lang="ts">
import { useCounterStore } from '@/stores/counter';
import { useUserStore } from '@/stores/userStore';
import axios from 'axios';
import { ref } from 'vue';
import BlogPost from '../views/BlogPost.vue';

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
    await axios.post('/chat/send2claude', {
        model: "claude-instant-1.2",
        max_tokens: 2059,
        temperature: 0.1,
        messages: [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "介绍一下你自己"
                    }
                ]
            },
            {
                "role": "assistant",
                "content": [
                    {
                        "type": "text",
                        "text": "当然可以"
                    }
                ]
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "详细一些"
                    }
                ]
            },
            {
                "role": "assistant",
                "content": [
                    {
                        "type": "text",
                        "text": "我可以做很多事"
                    }
                ]
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "具体有哪些"
                    }
                ]
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
        model: "gpt-3.5-turbo-0125",
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
    await axios.post(`chat/validate`, {
        username: UserStore.session.username
    }).then((res) => {
        console.log(res.data);
    }).catch((error) => {
        console.log(error);
    });

}

async function requestTestGPTStream() {
    const response = await fetch('https://chatserver.eeeegou.com/chat/send2openai/stream', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': UserStore.session.token
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo-0125",
            max_tokens: 800,
            temperature: 0.1,
            stream: true,
            messages: [
                {
                    role: "user",
                    content: "介绍一下你自己"
                }
            ]
        })
    });

    const reader = response.body!!.getReader();
    const decoder = new TextDecoder('utf-8');
    let result = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n');

        for (const line of lines) {
            if (line.startsWith('data:')) {
                const data = line.slice(5).trim();
                if (data === '[DONE]') {
                    console.log('Stream completed');
                    console.log('Final result:', result);
                    return;
                }
                try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices[0].delta.content;
                    if (content) {
                        result += content;
                        console.log('Received:', content);
                    }
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                }
            }
        }
    }
}

async function requestTestStream() {
    const response = await fetch('http://localhost:8080/chat/send2claude/stream', {
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
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "介绍一下你自己"
                    }
                ]
            },
            {
                "role": "assistant",
                "content": [
                    {
                        "type": "text",
                        "text": "当然可以"
                    }
                ]
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "详细一些"
                    }
                ]
            }
        ]
        })
    });

    const reader = response.body!!.getReader();
    const decoder = new TextDecoder('utf-8');
    let result = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n');

        for (const line of lines) {
            if (line.startsWith('data:')) {
                const data = line.slice(5).trim();
                if (data === '[DONE]') {
                    console.log('Stream completed');
                    console.log('Final result:', result);
                    return;
                }
                try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices[0].delta.content;
                    if (content) {
                        result += content;
                        console.log('Received:', content);
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
    <div>
        <button @click="oukei">{{ counterStore.count }}</button>
        <p>Double count is {{ counterStore.doubleCount }}</p>
        <el-button @click="requestTest" type="primary">claude发送测试</el-button>
        <el-button @click="validateTest" type="warning">验证测试</el-button>
        <el-button @click="requestTestGPT" type="info">gpt发送测试</el-button>
        <el-button @click="requestTestStream" type="primary">claude流式测试</el-button>
        <el-button @click="requestTestGPTStream" type="info">gpt流式测试</el-button>
    </div>
</template>./view/BlogPost.vue