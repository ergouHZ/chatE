import { defineStore } from 'pinia';

export const useApiStore = defineStore('api', {
    state: () => ({
        baseUrl: 'http://localhost:8080',
        openAiApiKey: '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', //访问chatGPT4
        anthropicApiKey: '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',//访问Claude
    }),
})

//如果需要引用api或者baseURL
//import {useApiStore} from '
//apiStore = useApiStore()
// THE_KEY_NEED = apiStore.THE_KEY_NEED

//弃用，main主页直接全局定义请求头
//其他页面请求方法
//axiosInstance= apiStore.axiosInstance
/* const response = await axiosInstance.post(`/user/${postMethod}`, {
    username: username.value,
    password: password.value
}) */