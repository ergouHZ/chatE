import { defineStore } from "pinia";
import { useApiStore } from "./apiStore";

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

      if (session && session.expiresAt >= new Date().getTime()) {
        this.logout();
      } //如果过期直接登出

      if (session) {
        this.setSession(session);
        this.login();
      }
    },

    //在用户登录之后创建session,生成令牌，把令牌更新到服务器，然后从服务器获取权限和其他信息
    async afterLoginForm (username){
      const apiStore = useApiStore();
      axiosInstance = apiStore.axiosInstance;

      try{
      const response=await axiosInstance.get('/user/session',{
        username: username,
        token:this.generateToken()
      });
      console.log(response.data);
      const session = {
        username: response.data.username,
        token: this.generateToken(), // 生成令牌
        isLoggedIn: true,
        permissions: response.data.permissions,
        credits: response.data.credits,
        roles: response.data.roles,
        expiresAt: new Date().getTime() + 36000000, // 令牌过期时间为1周
      };
      this.setSession(session); // 将生成的所有的信息，保存到新的本地用户会话
      localStorage.setItem("session", JSON.stringify(session)); // 存储到本地存储
      }catch (error) {
        console.log(error);
      }
    },


    //读取之后直接进行后台使用令牌登录
    async login() {
      const apiStore = useApiStore();
      axiosInstance = apiStore.axiosInstance;
      try {
        const response = await axiosInstance.post("/user/session", {
          token: this.session.token,  //通过令牌进行验证
          username: this.session.username,
        });
        console.log(response.data);
        const session = {
          username: response.data.username,
          token: this.generateToken(), // 生成令牌
          isLoggedIn: true,
          permissions: response.data.permissions,
          credits: response.data.credits,
          roles: response.data.roles,
          expiresAt: new Date().getTime() + 36000000, // 令牌过期时间为1周
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
