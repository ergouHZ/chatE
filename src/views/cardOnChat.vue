<template>
    <transition name="el-zoom-in-top">
    <div class="ai-card" v-if="isShowCard">
        <el-card :disabled="false" :key="aiModel?.ai_id" class="select-card" shadow="hover">
            <div class="card-header">
                <div class="model-icon">
                    <div class="model-avatar">
                        <el-avatar shape="square" :size="36" :src="changeToThumb(aiModel?.modelName)" />
                    </div>
                </div>
                <div class="title-name">{{ aiModel?.titleName }}</div>
                <div @click.stop="onHandleClickTag()" style="display: inline-flex;">
                    <el-tag v-if="aiModel?.authority == 1" type="primary" effect="light" round size="large">
                        PRO
                    </el-tag>
                    <div class="charge" style="margin-left: 20px;padding: 5px;padding-right:0;">
                        {{ aiModel?.charge }}
                        <el-icon color="#409efc">
                            <Cpu />
                        </el-icon>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <!-- 卡片主体部分，可以根据需要调整样式 -->
                <div class="description">{{ aiModel?.description }}</div>
            </div>
        </el-card>
    </div>
</transition>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import { changeToThumb } from '@/utils';
import {
Cpu
} from '@element-plus/icons-vue';
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
    charge: number;
}

const aiModel = ref<Model>();
const props = defineProps<{
    model: string;
}>();

watch(() => props.model, (newModel) => {
    isShowCard.value = false
    fetchAIModels(newModel); 

    return
}
    //, { immediate: true }   //组件挂载的时候执行
);

// 获取用户存储
const UserStore = useUserStore();
axios.defaults.headers.common['Authorization'] = UserStore.session.token;
const auth: number = UserStore.session.permissions;
const isShowCard = ref(false);

// 获取路由实例
const router = useRouter();

// 定义方法
const fetchAIModels = async (modelName?: string) => {
    console.log("on card: ", modelName);
    let models: Model[] = [];
    if (localStorage.getItem("aimodels") !== null) {
        try {
            const items = JSON.parse(localStorage.getItem("aimodels")!);
            if (items.expiry > new Date().getTime()) {
                models = items.value;
            } else {
                localStorage.removeItem("aimodels");
                return fetchAIModels()//如果出错，则再执行一次，从服务器列表获取
            }
        } catch (error) {
            console.error("Failed to parse JSON from localStorage:", error);
            localStorage.removeItem("aimodels");
            return fetchAIModels() //如果出错，则再执行一次，从服务器列表获取
        }
    } else {
        try {
            const response = await axios.get('/chat/models');
            models = response.data;
            const now = new Date();
            const item = {
                value: response.data,
                expiry: now.getTime() + 1 * 12 * 3600 * 1000,
            };
            localStorage.setItem("aimodels", JSON.stringify(item));
        } catch (error) {
            isShowCard.value = false;
            return; //如果服务器也没有数据，结束，这里是出口
        }
    }

    if (modelName) {
        const foundModel = models.find(model => model.modelName === modelName);
        if (foundModel) {
            aiModel.value = foundModel;
        } else {
            ElNotification({
                title: 'Error',
                message: "未找到指定的模型",
                type: 'error',
                duration: 5000
            });
        }
        isShowCard.value = true
    } else {
        aiModel.value = models[0]; // 如果没有指定模型名，默认使用第一个模型
    }
};

// 在组件挂载时调用 fetchAIModels
onMounted(() => {
    isShowCard.value = true;
    if (aiModel.value) {
        if (aiModel.value.authority > auth) {
            ElNotification({
                title: 'Error',
                message: "请重新续费",
                type: 'error',
                duration: 5000
            });
        }
    }
    fetchAIModels(props.model);
});

onUnmounted(() => {
  
})

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
    padding: 0;

}

.el-card__body {
    padding: 0;
}

.select-card {
    flex: 0 0 100%;
    margin-bottom: 20px;

}

.card-header {
    display: flex;
    align-items: center;
}

.title-name {
    font-size: 1.2em;
    font-weight: bold;
}

.card-body {
    margin-top: 10px;
}

.description {
    font-size: 0.9em;
    color: #666;
}

.el-zoom-in-top-enter-active, .el-zoom-in-top-leave-active {
  transition: all 0.5s ease; /* 你可以根据需求调整时间和缓动函数 */
}
</style>