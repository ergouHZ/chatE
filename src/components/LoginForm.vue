<script setup lang="ts">
import { useApiStore } from '@/stores/apiStore';
import { useUserStore } from '@/stores/userStore';
import axios from 'axios';
import { ElLoading } from 'element-plus';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
// 定义响应式数据
const data = ref<any>(null)
const error = ref<string | null>(null)
const loading = ref<boolean>(false)
const dialogVisible = ref(false)//对话框
const userStore = useUserStore(); // get the user info session
const apiStore = useApiStore(); // get the api info
const router = useRouter();
const baseUrl: string = apiStore.baseUrl;//get global url

const username = ref('')
const password = ref('')

//responsev error data
const usernameError = ref<string | null>(null)
const passwordError = ref<string | null>(null)

//密码账号正则表达式
const usernameRegex = /^[a-zA-Z][a-zA-Z0-9]{5,19}$/;
const passwordRegex = /^[\w!@#$%^&*(),.?":{}|<>]{6,20}$/;
const fits = 'contain'
const url =
    '../../public/brand.png'
// validate username and password
function validateUsername(username: string): string | null {
    if (!usernameRegex.test(username)) {
        if (username.length < 6) {
            ElMessage({
                message: '账户名不能少于六位数',
                type: 'warning'
            })
            return 'The account length cannot be less than 6 characters';
        } else if (username.length > 20) {
            ElMessage({
                message: '账户名不能超过20位',
                type: 'warning'
            })
            return 'The account length cannot exceed 20 characters';
        } else if (!/^[a-zA-Z]/.test(username)) {
            ElMessage({
                message: '账户名必须以字母开始',
                type: 'warning'
            })
            return 'Account must start with a letter';
        } else if (/[^a-zA-Z0-9]/.test(username)) {
            ElMessage({
                message: '账户名只能包括字母和数字',
                type: 'warning'
            })
            return 'The account can only contain letters and numbers';
        }
    }
    return null;
}

function validatePassword(password: string): string | null {
    if (!passwordRegex.test(password)) {
        if (password.length < 6) {
            ElMessage({
                message: '密码不能小于6位数',
                type: 'warning'
            })
            return 'The password length cannot be less than 6 characters';
        } else if (password.length > 20) {
            ElMessage({
                message: '密码不能超过20位',
                type: 'warning'
            })
            return 'The password length cannot exceed 20 characters';
        } else {
            ElMessage({
                message: '密码只能包括字母和数字',
                type: 'warning'
            })
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
    const loadingVue = ElLoading.service({
        lock: false,
        text: 'Loading',
        background: 'rgba(0, 0, 0, 0.5)',
    })
    await axios.post(`/user/${postMethod}`, {
        username: username.value,
        password: password.value
    })
        .then((res) => {
            userStore.afterLoginForm(res.data.data, res.data.token);//手动登录或注册后，存入用户信息到session
            data.value = res.data
            ElMessage({
                message: res.data.message,
                type: 'success'
            })
            loading.value = false
            router.push({
                path: '/chat'
            });
        })
        .catch((error) => {
            console.log(error.response.data.error)
            error.value = error.response.data.error
            loading.value = false
            ElMessage({
                message: error.response.data.error,
                type: 'error'
            })
        }).finally(() => {
            userStore.session.isUpdating = true
            setTimeout(() => {
                loadingVue.close()
            }, 500)

        })

}

//验证码块
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
        console.log("the cookie code: " + getCookie('captcha'));
        if (captchaInput.value == getCookie('captcha')) {
            isDisable.value = false; //解禁
            isShownCaptcha.value = false; //隐藏验证码块
            dialogVisible.value = false; //隐藏对话框
            ElMessage({
                message: '验证成功!',
                type: 'success',
            })
        }
    }
    catch (error) {
        console.log(error);
    } finally {
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


const logout = () => userStore.logout();
</script>

<template>

    <body v-if="!userStore.session.isLoggedIn">
        <div class="logo-image">
            <el-image style="width: 500px;padding:20px" :src="url" :fit=fits />
        </div>
        <el-card class="box-card" style="width: 450px;background-color: transparent;border: none;">
            <template #header>
                <div class="card-header">
                    <span style="margin: 30px;">账号</span>
                    <el-input v-model="username" @blur="validateOnBlur('username')" @click="validateOnClick('username')"
                        style="width: 240px" placeholder="请输入用户名" />
                    <!-- <span class="errorReminder" v-if="usernameError"><br>{{ usernameError }}</span> -->
                </div>
            </template>
            <div class="text item">
                <div class="card-header">
                    <span style="margin: 30px;">密码</span>
                    <el-input type="password" v-model="password" @blur="validateOnBlur('password')"
                        @click="validateOnClick('password')" style="width: 240px" placeholder="请输入密码" />
                    <!-- <span class="errorReminder" v-if="passwordError"><br>{{ passwordError }}</span> -->

                </div>
            </div>
            <br>
            <el-dialog v-model="dialogVisible" title="验证码" width="400">
                <span></span>
                <template #footer>
                    <img :src="captchaUrl" alt="刷新次数过多,请稍候" @click="refreshCaptcha" />
                    <div class="captcah-input-area">
                        <el-input type="text" v-model="captchaInput" style="width: 240px"
                            placeholder="请输入验证码"></el-input>
                    </div>
                    <div class="dialog-footer">
                        <br>
                        <el-button size="large" round @click="dialogVisible = false">取消</el-button>
                        <el-button size="large" round type="primary" @click="submitForm">
                            确认
                        </el-button>
                    </div>
                </template>
            </el-dialog>
            <br>
            <div style="display: flex; align-items: center; justify-content: center;">
                <div v-if="isShownCaptcha"><el-button type="primary" size="large" round
                        @click="dialogVisible = true">验证码</el-button></div>
                <div v-else>
                    <el-button size="large" type="primary" :disabled="isDisable" round @click="login">登录</el-button>
                    <el-button size="large" type="primary" :disabled="isDisable" round plain
                        @click="register">注册</el-button>
                </div>
            </div>
        </el-card>
        <ul class="bg-squares">
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
        </ul>
    </body>

    <div v-else class="profile-form"><el-button type="warning" @click="logout">登出测试</el-button></div>
</template>


<style scoped>
.el-card {
    z-index: 2;
    /* 防止无法互动 */
}

* {
    /* 初始化 */
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

/* 背景方块 */
body {
    height: 100vh;
    /* 弹性布局 居中显示 */
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    min-height: 100vh;
    /* 使容器占满整个视口高度 */
    overflow: hidden;
    /* 防止背景动画超出容器 */
    background: linear-gradient(45deg, #f2f2f2, #a9d9d9, #ffbfbf, #a6a6a6);
    background-size: 300% 400%;
    /* 使渐变背景更大，以便动画效果更加明显 */
    animation: gradientBackground 15s ease infinite;
    /* 渐变背景动画 */
}

@keyframes gradientBackground {
    0% {
        background-position: 0% 50%;
    }

    50% {
        background-position: 100% 50%;
    }

    100% {
        background-position: 0% 50%;
    }
}

/* 背景方块 */
.bg-squares {
    list-style: none;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
}

.bg-squares li {
    width: 40px;
    height: 40px;
    background-color: rgba(255, 255, 255, 0.15);
    position: absolute;
    bottom: -160px;
    /* 执行动画：动画名 时长 线性 无限次播放 */
    animation: square 20s linear infinite;
    pointer-events: none;
}

/* 为每一个方块设置不同的位置、大小、动画延迟时间、动画时长、背景色 */
.bg-squares li:nth-child(1) {
    left: 10%;
}

.bg-squares li:nth-child(2) {
    left: 20%;
    width: 80px;
    height: 80px;
    /* 动画延迟时间 */
    animation-delay: 2s;
    /* 动画时长 */
    animation-duration: 17s;
}

.bg-squares li:nth-child(3) {
    left: 25%;
    animation-delay: 4s;
}

.bg-squares li:nth-child(4) {
    left: 40%;
    width: 60px;
    height: 60px;
    background-color: rgba(255, 255, 255, 0.25);
    animation-duration: 22s;
}

.bg-squares li:nth-child(5) {
    left: 70%;
}

.bg-squares li:nth-child(6) {
    left: 80%;
    width: 120px;
    height: 120px;
    background-color: rgba(255, 255, 255, 0.2);
    animation-delay: 3s;
}

.bg-squares li:nth-child(7) {
    left: 32%;
    width: 160px;
    height: 160px;
    animation-delay: 7s;
}

.bg-squares li:nth-child(8) {
    left: 55%;
    width: 20px;
    height: 20px;
    animation-delay: 15s;
    animation-duration: 40s;
}

.bg-squares li:nth-child(9) {
    left: 25%;
    width: 10px;
    height: 10px;
    background-color: rgba(255, 255, 255, 0.3);
    animation-delay: 2s;
    animation-duration: 40s;
}

.bg-squares li:nth-child(10) {
    left: 90%;
    width: 160px;
    height: 160px;
    animation-delay: 11s;
}

.container.success h1 {
    transform: translateY(75px);
}

.container.success .form {
    opacity: 0;
    visibility: hidden;
}

/* 定义动画 */
@keyframes square {
    0% {
        transform: translateY(0);
    }

    100% {
        transform: translateY(-120vh) rotate(600deg);
    }
}
</style>