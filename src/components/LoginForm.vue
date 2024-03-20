<script setup lang="ts">

import CaptchaForm from '@/views/CaptchaForm.vue';
import axios from 'axios';
import { ref } from 'vue';

// 定义响应式数据
const data = ref<any>(null)
const error = ref<string | null>(null)
const loading = ref<boolean>(false)

import { inject } from 'vue';
const baseUrl = inject('baseUrl');//get global url

const username = ref('')
const password = ref('')

//responsev error data
const usernameError = ref<string | null>(null)
const passwordError = ref<string | null>(null)

//密码账号正则表达式
const usernameRegex = /^[a-zA-Z][a-zA-Z0-9]{5,19}$/;
const passwordRegex = /^[\w!@#$%^&*(),.?":{}|<>]{6,20}$/;

// validate username and password
function validateUsername(username: string): string | null {
    if (!usernameRegex.test(username)) {
        if (username.length < 6) {
            return 'The account length cannot be less than 6 characters';
        } else if (username.length > 20) {
            return 'The account length cannot exceed 20 characters';
        } else if (!/^[a-zA-Z]/.test(username)) {
            return 'Account must start with a letter';
        } else if (/[^a-zA-Z0-9]/.test(username)) {
            return 'The account can only contain letters and numbers';
        }
    }
    return null;
}

function validatePassword(password: string): string | null {
    if (!passwordRegex.test(password)) {
        if (password.length < 6) {
            return 'The password length cannot be less than 6 characters';
        } else if (password.length > 20) {
            return 'The password length cannot exceed 20 characters';
        } else {
            return 'The account can only contain letters, numbers and special symbols';
        }
    }
    return null;
}

//Out of focus, verify and report errors
function validateOnBlur(field: 'username' | 'password') {
    if (field === 'username') {
        usernameError.value = validateUsername(username.value)
    } else {
        passwordError.value = validatePassword(password.value)
    }
}

//Click，unpop the error message
function validateOnClick(field: 'username' | 'password') {
    if (field === 'username') {
        usernameError.value = null
    } else {
        passwordError.value = null
    }
}

function login() {
    if (!usernameError.value) {
        postUser("login")
    }
}
function register() {
    if (!usernameError.value) {
        postUser("register")
    }
}


//the post function ,registers and login
const postUser = async (postMethod: string) => {
    loading.value = true
    error.value = null
    //post method means "login" or "register" etc.
    try {
        const response = await axios.post(`${baseUrl}/${postMethod}`, {

            username: username.value,
            password: password.value

        })
        data.value = response.data
    } catch (err: any) {
        error.value = err.message
    } finally {
        loading.value = false
    }

    console.log(data.value);
}

const captchaUrl = ref('');

const refreshCaptcha = () => {
    captchaUrl.value = `${baseUrl}/captcha?t=${new Date().getTime()}`;
};

refreshCaptcha(); // 初始化时获取验证码

</script>

<template>

<div>
    <el-space wrap>
    <el-card class="box-card" style="width: 500px">
    <template #header>
        <div class="card-header">
        <span>username</span>
        <el-input v-model="username"
        @blur="validateOnBlur('username')"
        @click="validateOnClick('username')"
        style="width: 240px" placeholder="Please input username" />
        <span v-if="usernameError">{{ usernameError }}</span>
        </div>
    </template>
<div class="text item">
    <div class="card-header">
        <span>password</span>
        <el-input v-model="password" @blur="validateOnBlur('password')" @click="validateOnClick('password')"
            style="width: 240px" placeholder="input password" />
        <span v-if="passwordError">{{ passwordError }}</span>
    </div>
    <CaptchaForm />
</div>
<br>
<el-button type="primary" round @click="login">Login</el-button>
<el-button type="info" round @click="register">Register</el-button>
</el-card>
</el-space>
</div>


</template>


<style lang="">

</style>