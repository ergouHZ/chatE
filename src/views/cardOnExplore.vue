<template>
    <div class="ai-card">
        <el-card :disabled="false" v-for="model in aiModels" :key="model.ai_id"
            @click="handleClick(model.modelName, model.authority)" class="select-card" shadow="hover">
            <div class="card-header">
                <!-- 这里是模型图标的位置 -->
                <div class="model-icon">
                    <div class="model-avatar">
                        <el-avatar shape="square" :size="36" :src="changeToThumb(model.modelName)" />
                    </div>
                </div>
                <div class="title-name">{{ model.titleName }}</div>
                <div v-if="model.authority > 0" @click.stop="onHandleClickTag()">
                    <el-tag type="primary" effect="light" round size="large">
                        PRO
                    </el-tag>
                </div>
            </div>
            <div class="card-body">
                <!-- 卡片主体部分，可以根据需要调整样式 -->
                <div class="description">{{ model.description }}</div>
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import { changeToThumb } from '@/utils';
import axios from 'axios';
import { ElNotification } from 'element-plus';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

interface Model {
    ai_id: number;
    modelName: string;
    titleName: string;
    description: string;
    authority: number;
}

// 获取用户存储
const UserStore = useUserStore();
axios.defaults.headers.common['Authorization'] = UserStore.session.token;
const auth: number = UserStore.session.permissions;
const aiModels = ref<Model[]>([]);

// 获取路由实例
const router = useRouter();

// 定义方法
const fetchAIModels = async () => {
    if (localStorage.getItem("aimodels") !== null) {
        try { //先尝试从本地储存获取模型
            const items = JSON.parse(localStorage.getItem("aimodels")!);
            if (items.expiry > new Date().getTime()) {
                //没过期
                aiModels.value = items.value;
                return;
            } else {//如果过期
                localStorage.removeItem("aimodels") //移除该项，改为从服务器获取
                return fetchAIModels();//再从服务器获取一次
            }
        } catch (error) {
            console.error("Failed to parse JSON from localStorage:", error);
            localStorage.removeItem("aimodels") //出错移除
            return fetchAIModels();//再从服务器获取一次
        }
    } else {
        try {
            const response = await axios.get('/chat/models');
            aiModels.value = response.data;
            const now = new Date();
            // `item` 是一个对象，包含实际的值和过期时间，设置每过12小时要强制更新，但是减少请求
            const item = {
                value: response.data,
                expiry: now.getTime() + 1 * 12 * 3600 * 1000,
            };
            localStorage.setItem("aimodels", JSON.stringify(item));
        } catch (error) {
            ElNotification({
                title: 'Error',
                message: "获取数据错误,请稍后再试",
                type: 'error',
                duration: 5000
            });
        }
    }
};

const handleClick = (model: string, authModel) => {
    if (auth < authModel) {
        ElNotification({
            title: 'Plan',
            message: "使用pro版AI请联系管理员进行订阅,目前未开通平台支付功能",
            type: 'warning',
            duration: 5000
        });
        return;
    } else {
        router.push({
            path: '/chat-ai', query: {
                model: model,
                message: '',
            }
        });
    }
};

// 在组件挂载时调用 fetchAIModels
onMounted(() => {
    fetchAIModels();
});

const onHandleClickTag = () => {
    console.log("onHandleClick tag");
    router.push({
        path: 'subscribe',
    });
}
</script>

<style scoped>
.ai-card {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

}

.select-card {
    flex: 0 0 calc(50% - 10px);
    /* 两列布局，每列宽度为50% */
    margin-bottom: 20px;

}

.card-header {
    display: flex;
    align-items: center;
}

.title-name {
    font-size: 1.0em;
    font-weight: bold;
}

.card-body {
    margin-top: 10px;
}

.description {
    font-size: 0.8em;
    color: #666;
}

@media (max-width: 1090px) {
    .select-card {
        /* 每个卡片占据一整行（减去间距） */
        flex: 1 1 calc(100% - 10px);
        margin-bottom: 20px;
    }
}
</style>