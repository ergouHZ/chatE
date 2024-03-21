import axios from "axios";
import { defineStore } from "pinia";

export const useUserStore = defineStore("store", {
  state: () => ({
    session: {
      username: null,
      token: null,
      isLoggedIn: false,
      permissions: [],
      roles: [],
      credits: [],
      expiresAt: null,
    },
  }),
  actions: {
    //初始化用户会话，如果有则直接读取
    initSession() {
      // 从本地存储(localStorage/sessionStorage)或服务器获取session数据
      const session = JSON.parse(localStorage.getItem("session"));

      if (session && session.expiresAt <= new Date().getTime()) {
        this.logout();
      } //如果过期直接登出
      if (session) {
        this.setSession(session);
      }
    },

    //在用户登录之后创建session,并通过服务器获得令牌，令牌存储到了http中
    //然后可以访问，然后从服务器获取权限和其他信息，获取ai api也需要这个方法
    async afterLoginForm(username) {
      try {
        const response = await axios.post("/user/session", {
          username: username,
        });
        const session = {
          username: response.data.data.username,
          isLoggedIn: true,
          permissions: response.data.data.authority,
          credits: response.data.data.credits,
          roles: response.data.data.roles,
          expiresAt: new Date().getTime() + 14 * 24 * 3600 * 1000, // 令牌过期时间为1周
        };
        this.setSession(session); // 将生成的所有的信息，保存到新的本地用户会话
        localStorage.setItem("session", JSON.stringify(session)); // 存储到本地存储
      } catch (error) {
        console.log(error);
        
      }
    },

    logout() {
      this.setSession({
        username: null,
        token: null,
        isLoggedIn: false,
        permissions: [],
        roles: [],
        credits: [],
        expiresAt: null,
      });
      
      localStorage.removeItem("session"); // 清除本地存储
      const session = JSON.parse(localStorage.getItem("session"));
    },

    setSession(session) {
      this.session = session;
    },
    generateToken() {
      // 这里可以使用任何令牌生成算法,例如JWT
      return (
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15)
      );
    },
  },
});
