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

//这是发claude的格式
async function requestTest() {
    try {
        const response = await axios.post('/chat/send2claude',
            ({
                model: "claude-instant-1.2",
                max_tokens: 2059,
                temperature: 0.1,
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: "介绍一下你自己"
                            }

                        ]
                    },
                    {
                        role: "assistant",
                        content: [
                            {
                                type: "text",
                                text: "我是claude"
                            }

                        ]
                    }
                ]
            })
        )
        console.log(response.data[1]);
    } catch (error) {
        console.log(error);
    }
}

//发送到gtp的格式
async function requestTestGPT() {
    try {
        const response = await axios.post('/chat/send2openai',
            ({
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
                        content: "我是GPT"
                    },
                ]
            })
        )
        console.log(response.data[1]);
    } catch (error) {
        console.log(error);
    }
}

//验证权限，密钥在注册账户时存进了cookie，需要验证这一步才能建立AI的聊天框
async function validateTest() {
    try {
        const res = await axios.post('/chat/validate',
            {
                username:UserStore.session.username
            }
        )
        console.log(res);
    } catch (error) {
        console.log(error);
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
    </div>
</template>./view/BlogPost.vue