
/* // collapse
import { ElCollapseTransition } from 'element-plus'
// fade/zoom
import 'element-plus/lib/theme-chalk/base.css'
 */
import "element-plus/dist/index.css"
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'


const app = createApp(App)
app.provide('baseUrl','http://localhost:8080')

app.use(createPinia())
app.use(router)

app.mount('#app')
