<template>
    <div>
        <img :src="captchaUrl" alt="Refresh too many times, pleas wait" @click="refreshCaptcha" />
        <el-input type="text" v-model="captchaInput" placeholder="Input captcha please"></el-input>
        <el-button type="primary" @click="submitForm">提交</el-button>
        <span v-if="isValidated">okay</span>
    </div>
</template>

<script setup lang="ts">
import { useApiStore } from '@/stores/apiStore';
import axios from 'axios';
import { defineComponent, onMounted, ref } from 'vue';
const apiStore = useApiStore();
const baseUrl = apiStore.baseUrl;//get global url

const data = ref<any>(null)
const isValidated = ref<boolean>(false)
const captchaUrl = ref('');
const captchaInput = ref('');

const refreshCaptcha = () => {
    captchaUrl.value = `${baseUrl}/captcha?t=${new Date().getTime()}`;
    if (captchaUrl.value === null) { console.log("cap"); }
};

onMounted(() => {
    refreshCaptcha(); // 初始化时获取验证码
})

function submitForm() {
    // 创建 FormData 对象
    let formData = new FormData();
    formData.append('captchaInput', captchaInput.value);

    axios
        .post(`${baseUrl}/captcha`, formData)
        .then((response) => {
            isValidated.value = response.data;
        })
        .catch((error) => {
            // 处理错误
        });
}



defineComponent({


})

</script>