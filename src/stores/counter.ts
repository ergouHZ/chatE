import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 1,
  }),
  getters: {
    doubleCount: (state) => state.count * 2,
    countPlus: (state) => state.count++
  },
})
