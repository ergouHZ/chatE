<script setup lang="ts">
import { useCounterStore } from '@/stores/counter';
import { useUserStore } from '@/stores/userStore';
import axios from 'axios';
import { reactive, ref } from 'vue';
import BlogPost from '../views/BlogPost.vue';
import historyCard from './../views/historyCard.vue'

const state = reactive({
    circleUrl:
        'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    squareUrl:
        'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
    sizeList: ['small', '', 'large'] as const,
})

const squareUrl = 'https://qph.cf2.poecdn.net/main-thumb-pb-1011-200-phggnnskbfadkgntvkacpazkogidumhg.jpeg'
const deepSeekThumb = '@public/deepseekICON.html'

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




</script>

<template>
    <historyCard />
    <div class="ai-model-avatar">
        <el-avatar shape="square" :size="36" :src="squareUrl" />
        
    </div>
    <el-icon><ArrowRight /></el-icon>
    <div class="block">
        <el-avatar shape="square" :size="36" :src="deepSeekThumb" />
    </div>
    <el-icon><Right /></el-icon>
    <div :style="{ fontSize: postFontSize + 'em' }">
        <BlogPost v-for="post in posts" :key="post.id" :title="post.title" :body="post.body"
            @enlarge-text="postFontSize += 0.1"></BlogPost>
    </div>

    <p>result:{{ result }}</p>
    <div>
        <button @click="oukei">{{ counterStore.count }}</button>
        <p>Double count is {{ counterStore.doubleCount }}</p>

    </div>
</template>./view/BlogPost.vue