<template>
    <div>
        <img :src="captchaUrl" alt="刷新次数过多,请稍候" @click="refreshCaptcha" />
        <el-input type="text" v-model="captchaInput" placeholder="Input captcha please"></el-input>
        <el-button type="primary" @click="submitForm">提交</el-button>
        <span v-if="isValidated">okay</span>
    </div>
</template>

<script setup lang="ts">
import { useApiStore } from '@/stores/apiStore';
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
    console.log(captchaInput.value);
    console.log(getCookie('captcha').value);
    if (captchaInput.value== getCookie('captcha')){
        isValidated.value = true;
        console.log("valid!: "+isValidated.value);
    }
}


function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts: any = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

defineComponent({


})

</script>