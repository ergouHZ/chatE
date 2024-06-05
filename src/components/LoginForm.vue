<script setup lang="ts">
import { useApiStore } from '@/stores/apiStore';
import { useUserStore } from '@/stores/userStore';
import axios from 'axios';
import { ElLoading, ElNotification } from 'element-plus';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

// 定义响应式数据
const data = ref<any>(null)
const error = ref<string | null>(null)
const loading = ref<boolean>(false)
const dialogVisible = ref(false)//对话框
const isFirstTime = ref(false)//是否需要注册模式
const userStore = useUserStore(); // get the user info session
const apiStore = useApiStore(); // get the api info
const router = useRouter();
const baseUrl: string = apiStore.baseUrl;//get global url

const username = ref('')
const password = ref('')
const passwordConfirm = ref('')
//responsev error data
const usernameError = ref<string | null>(null)
const passwordError = ref<string | null>(null)

//密码账号正则表达式
const usernameRegex = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/; //邮箱的表达格式
const passwordRegex = /^[\w!@#$%^&*(),.?":{}|<>]{6,20}$/;
const fits = 'contain'
const url =
    'https://www.auraxplorers.com/cdn/image/brand.png'
// validate username and password
function validateUsername(username: string): string | null {
    if (!usernameRegex.test(username)) {
        ElMessage({
            message: '请输入有效的电子邮件地址',
            type: 'warning'
        })
        return '请输入有效的电子邮件地址';
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
    if (password.value === passwordConfirm.value) {
        if (!usernameError.value && !passwordError.value) {
            postUser("register")
        }
    } else {
        ElMessage({
            message: '两次输入的密码不一致',
            type: 'warning'
        })
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
            const status = res.data.status
            const message = res.data.message
            if (status == 200) {
                ElMessage({
                    message: message,
                    type: 'success'
                })
                loading.value = false
                userStore.session.isUpdating = true
                router.push({
                    path: '/chat'
                });
            } else {
                ElNotification({
                    title: '登录注册' + status.status,
                    message: message,
                    type: 'warning'
                })
                loading.value = false
            }
        })
        .catch((error) => {
            loading.value = false
            const data = error.response.data
            ElMessage({
                message: data.status + ': ' + data.message,
                type: 'error'
            })
        }).finally(() => {

            setTimeout(() => {
                loadingVue.close()
            }, 500)

        })

}

//验证码块
const isValidatedEmail = ref<boolean>(true) //是否通过邮箱验证码，修改密码用
const isDisable = ref<boolean>(false) //账号密码是否禁用
const isShownCaptcha = ref<boolean>(false) //是否显示验证块
const isValidating = ref<boolean>(false) //是否正在验证中，用cloudflare
const captchaInput = ref('');


async function submitForm() {
    await axios.post('captcha/validate', {
        username: username.value,
        captcha: captchaInput.value.trim(),
    })
        .then((res) => {
            const status = res.data.status
            const message = res.data.message
            if (status == 200) {
                ElNotification({
                    title: '验证码' + status,
                    message: message,
                    type: 'success'
                })
                loading.value = false
                isDisable.value = false; //解禁
                isShownCaptcha.value = false; //隐藏验证码块
                dialogVisible.value = false; //隐藏对话框
                isValidatedEmail.value = true;
            } else if (status == 201) {
                ElNotification({
                    title: '验证码验证' + status,
                    message: message,
                    type: 'warning'
                })
                loading.value = false
                isDisable.value = false; //解禁
                isShownCaptcha.value = false; //隐藏验证码块
                dialogVisible.value = false; //隐藏对话框
                isValidatedEmail.value = true;
                isFirstTime.value = false; //不需要密码，第一次登录
            } else {
                ElNotification({
                    title: '验证码验证' + status,
                    message: message,
                    type: 'warning'
                })
                loading.value = false
            }
        })
        .catch((error) => {
            console.log(error)
            loading.value = false
            ElNotification({
                title: '验证码',
                message: "服务器错误;如果第一次登录,请设置密码",
                type: 'error'
            })
            loading.value = false
            isDisable.value = false; //解禁
        })
}

async function sendTheCaptchaEmail() {
    if (!usernameError.value && username.value.trim() !== '') {
        dialogVisible.value = true
        error.value = null
        await axios.post('captcha', {
            username: username.value,
        })
            .then((res) => {
                const status = res.data.status
                const message = res.data.message
                if (status == 200) {
                    ElNotification({
                        title: '验证码',
                        message: message,
                        type: 'success'
                    })
                    loading.value = false

                } else {
                    ElNotification({
                        title: '验证码' + status,
                        message: message,
                        type: 'warning'
                    })
                    loading.value = false
                    dialogVisible.value = false; //隐藏对话框
                }
            })
            .catch((error) => {
                loading.value = false
                ElNotification({
                    title: '验证码' + error.data.status,
                    message: error.data.message,
                    type: 'error'
                })
            })
    } else {
        ElNotification({
            title: '验证码',
            message: '请输入正确账号',
            type: 'error'
        })
    }
}

const logout = () => userStore.logout();

const onSubmit = async () => {
    try {
        const response = await axios.post('/captcha/validate/cloudflare', {
            turnstileToken: turnSiteCaptcha.value,
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const result = await response.data;
        if (result.success) {
            isValidating.value = false;
        } else {
            isDisable.value=true;
        }
    } catch (error) {
        // Handle network or server errors
        console.error('Error during POST request:', error);
    } finally {
        isValidating.value = false;
    }
};

const turnSiteCaptcha = ref('')

onMounted(() => {
    window.onloadTurnstileCallback = () => {
        isValidating.value = true; //这个组件能加载再开始验证
        turnstile.render('#example-container', {
            //sitekey:'0x4AAAAAAAb6pw3rG5Kf0Y9E',
            sitekey: '0x4AAAAAAAb6w1pqMDKCnZeY',  //部属用
            callback: function (token: string) {
                turnSiteCaptcha.value = token;
                onSubmit()
            },
        });
    };
    
});
</script>

<template>

    <body v-if="!userStore.session.isLoggedIn">
        <div class="login-form-layout">
            <div>
                <el-image class="logo-image" style="width: 500px;padding:20px" :src="url" :fit=fits />
            </div>
            <el-card id="example-container" class="box-card"
                style="width: 450px;background-color: #b6b6b666;border: none; color: black;">
                <template #header>
                    <div class="card-header">
                        <span style="margin: 30px;">邮箱</span>
                        <el-input v-model="username" @blur="validateOnBlur('username')"
                            @click="validateOnClick('username')" style="width: 240px;" placeholder="请输入邮箱,用于注册本站账号" />
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
                <div class="text item">
                    <div v-if="isFirstTime" class="card-header">
                        <span style="margin: 14px;">确认密码</span>
                        <el-input type="password" v-model="passwordConfirm" @blur="validateOnBlur('password')"
                            @click="validateOnClick('password')" style="width: 240px" placeholder="请输入密码" />
                        <!-- <span class="errorReminder" v-if="passwordError"><br>{{ passwordError }}</span> -->
                    </div>
                </div>
                
                <div class="cf-turnstile" data-sitekey="0x4AAAAAAAb6w1pqMDKCnZeY" data-callback="javascriptCallback" style="display: none;"></div>
                <!-- TODO 部署的时候需要更换sitekey -->
                <div style="display: flex; align-items: center; justify-content: center;">
                    <!-- <div v-if="isShownCaptcha"><el-button type="primary" size="large" round
                        @click="sendTheCaptchaEmail">验证邮箱</el-button></div>
                <div v-else> -->
                    <!-- <div v-if="isValidating" style="justify-content: center;align-items: center;">
                    验证中
                    </div> -->
                    <el-button v-if="!isFirstTime" v-loading="isValidating" size="large" type="primary" style="" :disabled="isDisable" round
                        @click="login">登录</el-button>
                    <el-button v-else size="large" v-loading="isValidating" type="primary" :disabled="isDisable" round plain
                        @click="register">注册</el-button>
                    <el-switch v-model="isFirstTime" class="mb-2" active-text="注册账号" inactive-text=""
                        style="margin-left: 50px;" />

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
        </div>
    </body>

    <div v-else class="profile-form">
        <el-card class="box-card" style="width: 450px;background-color: #b6b6b622;border: none;">
            <template #header>
                <div class="card-header">
                    更改密码
                    <span style="margin: 30px;">邮箱</span>
                    <el-input v-model="username" @blur="validateOnBlur('username')" @click="validateOnClick('username')"
                        style="width: 240px;" placeholder="请输入邮箱" />
                    <!-- <span class="errorReminder" v-if="usernameError"><br>{{ usernameError }}</span> -->
                </div>
            </template>

            <div class="text item">
                <div class="text item">
                    <div v-if="isValidatedEmail" class="card-header">
                        <span style="margin: 30px;">密码</span>
                        <el-input type="password" v-model="password" @blur="validateOnBlur('password')"
                            @click="validateOnClick('password')" style="width: 240px" placeholder="请输入密码" />
                        <!-- <span class="errorReminder" v-if="passwordError"><br>{{ passwordError }}</span> -->
                    </div>
                </div>
                <br>
                <div class="text item">
                    <div v-if="isValidatedEmail" class="card-header">
                        <span style="margin: 14px;">确认密码</span>
                        <el-input type="password" v-model="passwordConfirm" @blur="validateOnBlur('password')"
                            @click="validateOnClick('password')" style="width: 240px" placeholder="请输入密码" />
                        <!-- <span class="errorReminder" v-if="passwordError"><br>{{ passwordError }}</span> -->
                    </div>
                </div>
            </div>
            <br>
            <el-dialog v-model="dialogVisible" title="验证码" width="400">
                <span></span>
                <template #footer>
                    请输入发送至邮箱的验证码
                    <div class="captcah-input-area">
                        <el-input type="text" v-model="captchaInput" style="width: 240px"
                            placeholder="请输入发送至邮箱的验证码"></el-input>
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
                        @click="sendTheCaptchaEmail">验证邮箱</el-button></div>
                <div v-else>
                    <el-button size="large" type="primary" :disabled="isDisable" round plain
                        @click="register">设置密码</el-button>
                </div>
            </div>

        </el-card>

        <el-popconfirm title="确定退出么?" @confirm="logout">
            <template #reference>
                <el-button type="warning">退出登录</el-button>
            </template>
        </el-popconfirm>

    </div>
</template>


<style scoped>
.el-card {
    z-index: 10;
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


.login-form-layout {
    display: inline-flex
}
</style>