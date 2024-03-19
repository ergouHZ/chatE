<template lang="">
    <div class="chat-container">
        <div class="chat-content">

        </div>
        <div class="chat-input">
        <el-input
            v-model="input3"
            style="min-width: 600px"
            placeholder="Please input"
            class="chat-input"
        >
        <template #append>
            <el-button >
                <el-icon class="el-icon--right"><Upload /></el-icon>
            </el-button>
        </template>
</el-input>
</div>
</div>
</template>

<script setup lang="ts">

</script>
<style>
.chat-container {
    min-height: 500px;
    border-radius: 20px;
    border: 1px solid #ccc;
    background-color: #fff;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.chat-content {
    min-height: 500px
}
</style>