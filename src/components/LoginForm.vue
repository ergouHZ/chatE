<script setup lang="ts">
import { useApiStore } from '@/stores/apiStore';
import { useUserStore } from '@/stores/userStore';
import CaptchaForm from '@/views/CaptchaForm.vue';
import axios from 'axios';
import { ref } from 'vue';

// 定义响应式数据
const data = ref<any>(null)
const error = ref<string | null>(null)
const loading = ref<boolean>(false)

const userStore = useUserStore(); // get the user info session
const apiStore = useApiStore(); // get the api info
const baseUrl: string = apiStore.baseUrl;//get global url

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

//Click，unpop the error message，如果指针移到外面，显示另一个的错误
function validateOnClick(field: 'username' | 'password') {
    if (field === 'username') {
        usernameError.value = null
    } else {
        passwordError.value = null
    }
}

function login() {
    usernameError.value = validateUsername(username.value) //进行验证，无错误则登录验证，有错误则显示错误
    passwordError.value = validatePassword(password.value)
    if (!usernameError.value && !passwordError.value) {
        postUser("login")
    }
}
function register() {
    usernameError.value = validateUsername(username.value)
    passwordError.value = validatePassword(password.value)
    if (!usernameError.value && !passwordError.value) {
        postUser("register")
    }
}


//the post function ,registers and login
const postUser = async (postMethod: string) => {
    loading.value = true
    error.value = null

    await axios.post(`/user/${postMethod}`, {
        username: username.value,
        password: password.value
    })
        .then((res) => {
            userStore.afterLoginForm(username.value);//手动登录后，生成令牌存到服务器；然后获取权限，存入用户session
            data.value = res.data
            console.log(data.value)
            loading.value = false
        })
        .catch((error) => {
            console.log(error.response.data.error)
            error.value = error.response.data.error
            loading.value = false
        })

}

const captchaUrl = ref('');

const refreshCaptcha = () => {
    captchaUrl.value = `${baseUrl}/captcha?t=${new Date().getTime()}`;
};

refreshCaptcha(); // 初始化时获取验证码

const logout = () => userStore.logout();
const session = () => userStore.afterLoginForm(username.value)
const fakeLogin = () => userStore.fakeLogin();
</script>

<template>

    <div>
        <el-space wrap>
            <el-card class="box-card" style="width: 500px">
                <template #header>
                    <div class="card-header">
                        <span>username</span>
                        <el-input v-model="username" @blur="validateOnBlur('username')"
                            @click="validateOnClick('username')" style="width: 240px"
                            placeholder="Please input username" />
                        <span class="errorReminder" v-if="usernameError">{{ usernameError }}</span>
                    </div>
                </template>
                <div class="text item">
                    <div class="card-header">
                        <span>password</span>
                        <el-input type="password" v-model="password" @blur="validateOnBlur('password')"
                            @click="validateOnClick('password')" style="width: 240px" placeholder="input password" />
                        <span class="errorReminder" v-if="passwordError">{{ passwordError }}</span>
                    </div>
                    <CaptchaForm />
                </div>
                <br>
                <el-button type="primary" round @click="login">Login</el-button>
                <el-button type="info" round @click="register">Register</el-button>
            </el-card>
            <el-button type="warning" @click="logout">登出测试</el-button>
            <el-button type="warning" @click="session">session测试</el-button>
            <el-button type="warning" @click="fakeLogin">假登录</el-button>
        </el-space>
    </div>


</template>


<style lang="">

</style>