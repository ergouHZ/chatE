import { defineStore } from "pinia"


export const useThemeStore = defineStore('theme', {
    state: () => ({
        isDarkTheme: true
    }),
    actions: {
        toggleTheme() {
            console.log(this.isDarkTheme)
            this.isDarkTheme = !this.isDarkTheme
            

            if (this.isDarkTheme) {
                console.log('Dark theme'+this.isDarkTheme)
                import('element-plus/theme-chalk/dark/css-vars.css')
            }
            
        }
    }
})