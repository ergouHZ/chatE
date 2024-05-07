import { defineStore } from 'pinia';

export const useApiStore = defineStore('api', {
    state: () => ({
        //baseUrl: 'https://chatserver.eeeegou.com',
        baseUrl: 'http://localhost:8080',
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