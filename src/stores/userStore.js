import { defineStore } from "pinia";

export const useUserStore = defineStore("store", {
  state: () => ({
    session: {
      username: null,
      password: "",
      isLoggedIn: false,
      permissions: [],
      roles: [],
      credits: "",
      
      expiresAt: null,
      thunmbnail: "",

      token:"",
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
    //用户session存储在本地cookie
    afterLoginForm(user,token) {
      const session = {
        username: user.username,
        password: user.password,
        isLoggedIn: true,
        permissions: user.authority,
        credits: user.credits,
        roles: user.roles,
        thumbnail: user.thumbnail,
        expiresAt: new Date().getTime() + 14 * 24 * 3600 * 1000, // 令牌过期时间为1周
        
        token:token
      };
      this.setSession(session); // 将生成的所有的信息，保存到新的本地用户会话
    },

    logout() {
      this.setSession({
        username: null,
        isLoggedIn: false,
        password: "",
        permissions: [],
        roles: [],
        credits: [],
        thumbnail:"",
        expiresAt: null,
        token:"",
      });

      localStorage.removeItem("session"); // 清除本地存储
      const session = JSON.parse(localStorage.getItem("session"));
    },

    setSession(session) {
      this.session = session;
      localStorage.setItem("session", JSON.stringify(session)); // 存储到本地存储
    },

    fakeLogin() {
      const session = {
        username: "test",
        isLoggedIn: true,
        password: "",
        permissions: [1],
        roles: [1],
        credits: 10000,
        thumbnail:"",
        expiresAt: new Date().getTime() + 14 * 24 * 3600 * 1000, // 令牌过期时间为1周
      };
      this.setSession(session);
      localStorage.setItem("session", JSON.stringify(session)); // 存储到本地存储
    },

    generateToken() {
      // 这里可以使用任何令牌生成算法,例如JWT
      return (
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15)
      );
    },
  },
  getters: {
    getLoginstate() {
      return this.session.isLoggedIn;
    },
  },
});
