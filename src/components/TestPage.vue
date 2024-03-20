<script setup lang="ts">
import { useApiStore } from '@/stores/apiStore';
import { useCounterStore } from '@/stores/counter';
import { ref } from 'vue';
import BlogPost from '../views/BlogPost.vue';

const posts = ref([
    { id: 1, title: 'My journey with Vue', body: 'ok1111' },
    { id: 2, title: 'Blogging with Vue', body: 'oka222y' }
])

const postFontSize = ref(1)

const counterStore = useCounterStore()
const apiStore = useApiStore()

function oukei(){
    counterStore.count = counterStore.doubleCount
    console.log(counterStore.count);

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
    </div>
</template>./view/BlogPost.vue