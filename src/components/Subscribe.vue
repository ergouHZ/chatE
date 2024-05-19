<template>
     <div class="ai-card">
        <el-card :disabled="false" class="select-card" shadow="hover">
            <div class="card-header">
                <div class="model-icon">
                    <div class="model-avatar">
                    </div>
                </div>
                <div class="title-name"></div>
                <div style="display: inline-flex;">
                    <div class="charge" style="margin-left: 20px;padding: 5px;padding-right:0;">
                        <el-icon color="#409efc"><Cpu /></el-icon>
                    </div>
                </div>
            </div>
            <div class="card-body">
                目前订阅的支付功能还在开发中,
                <br>
                需要pro权限请联系管理员开通
                <div class="description"></div>
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const inputValue = ref('')
const userScore = ref(200000)
const maxScore = 300000

const percentage = computed(() => {
    return (userScore.value / maxScore) * 100
})

const progressStatus = computed(() => {
    if (percentage.value < 30) {
        return 'exception'
    } else if (percentage.value < 70) {
        return 'warning'
    } else {
        return 'success'
    }
})

const updateUserPermission = (input:string) => {
    console.log(input);
}

const handleInput = (input:string) => {
    updateUserPermission(input)
}

</script>

<style scoped>
.el-progress {
    margin-top: 20px;
}
</style>