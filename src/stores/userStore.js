import { defineStore } from "pinia";


export const useUserStore = defineStore("store", {
  state: () => ({
    session: {
      userId: null,
      username: "",
      password: "",
      isLoggedIn: false,
      permissions: 0,
      roles: null,
      subscribeExpired: null,//会员过期时间

      credit: 0,
      expiresAt: null,//session过期时间

      token:"", //服务器令牌

      isUpdating: false,//监测是否有新窗口创建
      isNavToNewWindow: false, //是否需要切换到新窗口，新窗口创建时，发送消息结束后设置此值，自动切换
      isInHistoryList:false, //是否从历史页面切到了其他页面
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
    afterLoginSetSession(user) {
      const session = {
        userId: user.userId,
        username: user.username,
        password: user.password,
        isLoggedIn: true,
        permissions: user.authority, //是否有权限
        credit: user.credit,
        roles: user.roles,
        subscribeExpired:user.endTime,
        expiresAt: new Date().getTime() + 21 * 24 * 3600 * 1000, // 令牌过期时间为3周
      };
      this.setSession(session); // 将生成的所有的信息，保存到新的本地用户会话
    },

    updateToken(token){
      this.session.token = token;
      localStorage.setItem("session", JSON.stringify(this.session)); // 存储到本地存储
    },

    logout() {
      this.setSession({
        userId: null,
        username: "",
        isLoggedIn: false,
        password: "",
        permissions: 0,
        roles: null,
        credit: 0,
        subscribeExpired: null,//会员过期时间
        expiresAt: null,
        token:"",

        
      });
      this.session.isUpdating = true
      localStorage.removeItem("session"); // 清除本地存储
      localStorage.removeItem("windows");
    },

    setSession(session) {
      this.session = session;
      localStorage.setItem("session", JSON.stringify(session)); // 存储到本地存储
    },

    fakeLogin() {
      const session = {
        userId: 0,
        username: "test",
        isLoggedIn: true,
        password: "",
        permissions: 1,
        roles: 1,
        credits: 10000,

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
