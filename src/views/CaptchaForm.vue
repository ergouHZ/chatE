<template>
    <div>
        <img :src="captchaUrl" alt="Refresh too many times, pleas wait" @click="refreshCaptcha" />
        <el-input type="text" v-model="captchaInput" placeholder="Input captcha please"></el-input>
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button type="info" @click="verifyVerificationCode">validate</el-button>
        <span v-if="isValidated">okay</span>
    </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { defineComponent, inject, onMounted, ref } from 'vue';
const baseUrl = inject('baseUrl');//get global url

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
        .post(`${baseUrl}/captcha`, formData, {
            withCredentials: true //携带cookie,因为验证码储存在http session里
        })
        .then((response) => {
            isValidated.value = response.data;
        })
        .catch((error) => {
            // 处理错误
        });
}

function getVerificationCode() {
    axios.get('/api/verification-code')
        .then(response => {
            // 将验证码存储在 Session 中
            sessionStorage.setItem('verificationCode', response.data)
        })
        .catch(error => {
            console.error(error)
        })
}

// 验证验证码
function verifyVerificationCode() {
    // 从 Session 中获取验证码
    const storedCode = sessionStorage.getItem("captchaCode")
    console.log(storedCode);

    if (captchaInput.value === storedCode) {
        // 验证成功
        return true
    } else {
        // 验证失败
        return false
    }
}

defineComponent({


})

</script>