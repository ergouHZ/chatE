import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import { createPinia } from 'pinia'; //全局变量储存访问
import { createApp } from 'vue';
import App from './App.vue';
import router from './components/router';
import { useThemeStore } from './stores/darkTheme'; //darkThemeStore
// 引入全部icon
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
//components
import CaptchaForm from './components/public/CaptchaForm.vue';




const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.mount('#app')
app.component('CaptchaForm',CaptchaForm)

//引入icon
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

const pinia = createPinia()
const themeStore = useThemeStore(pinia)
