
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
// 在 main.js 或其他 Vue 入口文件中引入 markdown-it 库
import MarkdownIt from 'markdown-it'

// 创建一个 Markdown 解析器实例
const md = new MarkdownIt();


const app = createApp(App)

// 创建一个 Vue 自定义指令
app.directive('markdown', {
    // 当绑定元素插入到 DOM 中时执行
    mounted: function (el, binding) {
        // 解析 Markdown，并将结果设置为元素的 HTML 内容
        el.innerHTML = md.render(binding.value);
    }
});
app.use(createPinia())
app.use(router)
app.mount('#app')

//axios配置
//axios.defaults.baseURL = 'http://localhost:8080';
axios.defaults.baseURL = 'https://chatserver.eeeegou.com';
axios.defaults.withCredentials=true;  //携带cookie
/* axios.defaults.headers.common['authorization'] = 'aoiodiqjono1n24oi15on6o1n62ion62n4jk1n4j1n5k32naogoani2on5i2'; */
