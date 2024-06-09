<template>

        <transition name="el-fade-in">
    <div v-if="isShowAnime">
        <br><br>
        <el-row v-if="!isMobileMode" align="middle" class="statics" :gutter="50">
            <el-col :span="4" :offset="2">
                <div class="hover-statistic" style="margin-top:80px;">
                    <el-progress class="hover-progress" type="dashboard" :stroke-width="10" :percentage="percentage"
                        :color="colors" :width="150">
                        <template #default="{ percentage }">
                            <span class="percentage-value">{{ percentage }}%
                                <el-icon class="hover-icon" color="#409efc" size="15">
                                    <Cpu />
                                </el-icon>
                            </span>
                            <span class="percentage-label">/{{ userCredit }}</span>
                        </template>
                    </el-progress>
                    
                </div>
                <el-icon class="hover-icon" size="30" @click="drawer = true">
                        <QuestionFilled />
                    </el-icon>
            </el-col>
            <el-col :span="4" :offset="2" style="margin-top:60px;">
                <el-countdown format="DD [days]" :value="value2">
                    <template #title>
                        <div style="display: inline-flex; align-items: center">
                            <el-icon style="margin-right: 4px" :size="12">
                                <Calendar />
                            </el-icon>
                            End
                        </div>
                    </template>
                </el-countdown>
                <div class="countdown-footer">{{ dayjs(value2).format('YYYY-MM-DD') }}</div>
            </el-col>
            <el-col :span="4" :offset="2">
                <el-statistic class="hover-statistic" title="总额度" style="margin-top:60px;" :value="maxScore" />
            </el-col>

            <el-col :span="4">
                <el-statistic class="hover-statistic" title="Total Usage" style="margin-top:60px;"
                    :value="outputValue" />
            </el-col>
            
        </el-row>

        <div v-if="isMobileMode">
            <el-row align="middle">
                
                <el-col :span="8" :offset="2" :gutter="30">
                    <el-icon size="30" @click="drawer = true">
                    <QuestionFilled />
                </el-icon>
                    <el-progress type="dashboard" :stroke-width="10" :percentage="percentage" :color="colors">
                        <template #default="{ percentage }">
                            <span class="percentage-value">{{ percentage }}%
                                <el-icon color="#409efc" size="15">
                                    <Cpu />
                                </el-icon>
                            </span>
                            <span class="percentage-label">/{{ userCredit }}</span>
                        </template>
                    </el-progress>
                </el-col>
                
                <el-col :span="6" :offset="1">
                <el-countdown format="DD [days]" :value="value2">
                    <template #title>
                        <div style="display: inline-flex; align-items: center">
                            <el-icon style="margin-right: 4px" :size="12">
                                <Calendar />
                            </el-icon>
                            End
                        </div>
                    </template>
                </el-countdown>
                <div class="countdown-footer">{{ dayjs(value2).format('YYYY-MM-DD') }}</div>
            </el-col>
            </el-row>

            <el-row>
                <el-col :span="6" :offset="4">
                    <el-statistic title="总额度" :value="maxScore" />
                </el-col>
                <el-col :span="6" :offset="4">
                    <el-statistic title="Total Usage" :value="outputValue" />
                </el-col>
                
            </el-row>
        </div>
    </div>
</transition>

    <br>
    <div>
        <el-row>
            <el-col :span="8" :offset="4">
                <p>邀请码</p>
                <p>Subscribe Code</p>
                <el-input v-model="input" style="width: 300px" size="large" placeholder="Please input" clearable />
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="6" :offset="4">
                <el-button type="primary" @click="updateUserPermission">提交</el-button>
            </el-col>
            <el-col :span="6">
                <el-button type="" @click="reset">重置</el-button>
            </el-col>
        </el-row>
    </div>


    <el-drawer v-model="drawer" title="使用指南" direction="rtl" :before-close="handleClose" size="50%">
        <span>免费是用每个月有800的<el-icon color="#409efc" size="15">
                <Cpu />
            </el-icon>额度,可以使用一些基础的模型 <br>具体可以查看[搜索]栏 <br><br>目前阶段给Aura使用更好的芯片可以缓解一些服务器的压力<br>每个月可以有300,000的<el-icon
                color="#409efc" size="15">
                <Cpu />
            </el-icon>额度,使用千次以上的GPT4o~<br><br>有需求请联系管理员<br>后续会不断更新新模型~</span>
    </el-drawer>

</template>

<script setup lang="ts">
import { useHeaderStore } from '@/stores/header';
import { useUserStore } from '@/stores/userStore';
import {
Calendar,
Cpu,
QuestionFilled
} from '@element-plus/icons-vue';
import { useTransition } from '@vueuse/core';
import axios from 'axios';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
const input = ref('')
const maxScore = ref(300000)
const userStore = useUserStore()
const userCredit = ref(userStore.session.credit)

const percentage = ref(100)
const router = useRouter();
const headerStore = useHeaderStore()
const isMobileMode = ref<boolean>(headerStore.isShow)

import dayjs from 'dayjs';
// 假设从 MySQL 数据库获取的日期字符串
const mysqlDateString = userStore.session.subscribeExpired;
const value2 = ref(dayjs(mysqlDateString).valueOf());  // 设置为下个月初的时间戳
const isShowAnime=ref(false); //

onMounted(() => {
    headerStore.model = '订阅 Subscription';
    isShowAnime.value=true;
    if (userStore.session.permissions == 0) {
        maxScore.value = 800
    }
    source.value = maxScore.value - userCredit.value
    const interval = setInterval(() => {
        if (percentage.value <= (userCredit.value / maxScore.value) * 100) {
            clearInterval(interval);
            return
        }
        percentage.value -= 1;
    }, 50);
})

onUnmounted(() => {
    headerStore.clear(); //标题清空
    isShowAnime.value=false;
});

const colors = [
    { color: '#f56c6c', percentage: 20 },
    { color: '#e6a23c', percentage: 40 },
    { color: '#5cb87a', percentage: 60 },
    { color: '#1989fa', percentage: 80 },
    { color: '#6f7ad3', percentage: 100 },
]

const updateUserPermission = () => {
    if (input.value.length !== 20) {
        ElMessage({
            message: '验证码长度为20',
            type: 'warning',
        })
        return
    }
    postToken()
    
}

const reset = () => {
    input.value = ''
}
const source = ref(0)
const outputValue = useTransition(source, {
    duration: 1500,
})



// 提示部分
const drawer = ref(false)
const handleClose = (done: () => void) => {
    done()
}

const postToken = async () => {
    try {
        const res = await axios.post('/user/subscribe', {
            token: input.value
        })
        if (res.data.status === 200) {
            ElMessage({
                message: res.data.message,
                type: 'success',
            })
            userStore.afterLoginSetSession(res.data.data);//更新session信息
            userStore.updateToken(res.data.token)

            drawer.value = false
            input.value = ''
            router.push({
                path: '/chat',
            })
        } else {
            ElMessage({
                message: res.data.message,
                type: 'warning',
            })
        }
    } catch (error) {
        console.error(error)
    }
}
// const desc= ref('')
</script>

<style scoped>
.percentage-value {
    display: block;
    margin-top: 10px;
    font-size: 20px;
}

.percentage-label {
    display: block;
    margin-top: 10px;
    font-size: 12px;
}

.demo-progress .el-progress--line {
    margin-bottom: 15px;
    max-width: 600px;
}

.demo-progress .el-progress--circle {
    margin-right: 15px;
}

p {
    margin: 4px;
}

.hover-progress:hover {
    transform: scale(1.05);
    transition: transform 0.3s ease;
}

.hover-icon:hover {
    color: #66b1ff;
    cursor: pointer;
    transition: color 0.3s ease;
}

.hover-statistic:hover {
    background-color: #f5f5f56e;
    border-radius: 5px;
    transition: background-color 0.3s ease;
}
</style>