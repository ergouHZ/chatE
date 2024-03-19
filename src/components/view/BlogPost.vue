<script setup>
defineProps(['title', 'body'])
defineEmits(['enlarge-text'])
</script>

<template>
    <div class="blog-post">
        <h4>{{ title }}</h4>
        <p>{{ body }}</p>
        <button @click="$emit('enlarge-text')">Enlarge text</button>
    </div>
</template>