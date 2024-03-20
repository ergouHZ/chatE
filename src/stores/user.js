// store/index.js
import axios from "axios";
import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    session: {
      user: null,
      token: null,
      isLoggedIn: false,
      permissions: [],
      roles: [],
      expiresAt: null,
    },
  },
  mutations: {
    setSession(state, session) {
      state.session = session;
    },
  },
  actions: {
    initSession({ commit }) {
      // 从本地存储(localStorage/sessionStorage)或服务器获取session数据
      const session = JSON.parse(localStorage.getItem("session"));
      if (session) {
        commit("setSession", session);
      }
    },
    login({ commit }, credentials) {
      return axios.post("/login", credentials).then((response) => {
        const session = {
          user: response.data.user,
          token: generateToken(), // 生成令牌
          isLoggedIn: true,
          permissions: response.data.permissions,
          roles: response.data.roles,
          expiresAt: new Date().getTime() + 3600000, // 令牌过期时间为1小时
        };
        commit("setSession", session);
        localStorage.setItem("session", JSON.stringify(session)); // 存储到本地存储
        return session;
      });
    },
    logout({ commit }) {
      commit("setSession", {
        user: null,
        token: null,
        isLoggedIn: false,
        permissions: [],
        roles: [],
        expiresAt: null,
      });
      localStorage.removeItem("session"); // 清除本地存储
    },
  },
});

// 生成令牌的函数
function generateToken() {
  // 这里可以使用任何令牌生成算法,例如JWT
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export default store;
