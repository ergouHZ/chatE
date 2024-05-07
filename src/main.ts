
/* // collapse
import { ElCollapseTransition } from 'element-plus'
// fade/zoom
import 'element-plus/lib/theme-chalk/base.css'
 */
import axios from "axios"
import "element-plus/dist/index.css"
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.mount('#app')

//axios配置
axios.defaults.baseURL = 'http://localhost:8080';
//axios.defaults.baseURL = 'https://chatserver.eeeegou.com';
axios.defaults.withCredentials=true;  //携带cookie