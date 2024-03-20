import axios, { type AxiosInstance } from 'axios';
import { defineStore } from 'pinia';

//定义包含APIKEY的请求头，之后其他页面请求方法见底端
const instance: AxiosInstance = axios.create({
    baseURL: 'http://localhost:8080',
    timeout: 500,
    headers: { 'Authorization': "asjhi(&*(123hkjnskf(HIH>,412.oharmasnoqwrjnask1" }
});

export const useApiStore = defineStore('api', {
    state: () => ({
        baseUrl: 'http://localhost:8080',
        serverApiKey: 'asjhi(&*(123hkjnskf(HIH>,412.oharmasnoqwrjnask1',
        openAiApiKey: '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', //访问chatGPT4
        anthropicApiKey: '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',//访问Claude
        axiosInstance: instance
    }),
})

//如果需要引用api或者baseURL
//import {useApiStore} from '
//apiStore = useApiStore()
// THE_KEY_NEED = apiStore.THE_KEY_NEED


//其他页面请求方法
//axiosInstance= apiStore.axiosInstance
/* const response = await axiosInstance.post(`/user/${postMethod}`, {
    username: username.value,
    password: password.value
}) */