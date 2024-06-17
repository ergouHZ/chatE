import { defineStore } from 'pinia'

export const useHeaderStore = defineStore('counter', {
  state: () => ({
    model:'AURA',
    modelAvatarUrl: 'https://www.auraxplorers.com/cdn/image/logo.png',
    isShow:false, //是否显示标题，这玩意等价于手机模式
    isShowNav:false,
  }),
  getters: {
    getModel: (state) => state.model,
    getAvatar: (state) => state.modelAvatarUrl
  },
  actions:{
    setModel(model){
      this.model = model
    },


    clear(){
      this.model = 'AURA'
      this.modelAvatarUrl = 'https://www.auraxplorers.com/cdn/image/logo.png'
    }
  }
})
