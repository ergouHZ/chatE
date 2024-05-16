<template>
    <div v-if="isShownCaptcha">
        <img :src="captchaUrl" alt="刷新次数过多,请稍候" @click="refreshCaptcha" />
        <div class="captcah-input-area">
        <el-input type="text" v-model="captchaInput" placeholder="Input captcha please"></el-input>
        <el-button type="primary" :disabled="isDisable" @click="submitForm">提交</el-button>
        <span v-if="isValidated">okay</span>
    </div>
    </div>
</template>

<script setup lang="ts">
import { useApiStore } from '@/stores/apiStore';
import { defineComponent, onMounted, ref } from 'vue';
const apiStore = useApiStore();
const baseUrl = apiStore.baseUrl;//get global url

const data = ref<any>(null)
const isValidated = ref<boolean>(false)
const isDisable = ref<boolean>(true)
const isShownCaptcha = ref<boolean>(true)
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
    try {
    console.log("the cookie code: "+getCookie('captcha'));
    if (captchaInput.value== getCookie('captcha')){
        isValidated.value = true;
        isShownCaptcha.value = false;
        console.log("valid!: "+isValidated.value);
    }}
    catch (error){
        console.log(error);
    }finally {
        refreshCaptcha()//提交之后刷新验证码
    }
}


function getCookie(name) {
    if (typeof document === 'undefined' || typeof document.cookie !== 'string') {
        throw new Error('document.cookie is not available');
    }

    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        // Does this cookie string begin with the name we want?
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
            const cookieValue = cookie.substring(name.length + 1);
            if (cookieValue.length > 0) {
                return decodeURIComponent(cookieValue);
            }
        }
    }

    return null; // The cookie was not found
}

defineComponent({


})

</script>