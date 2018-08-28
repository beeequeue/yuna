import Vue from 'vue'
import Router from 'vue-router'

const { BASE_URL, IS_ELECTRON } = process.env

Vue.use(Router)

export const router = new Router({
  mode: IS_ELECTRON ? 'hash' : 'history',
  base: IS_ELECTRON ? '/' : BASE_URL,
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () =>
        import(/* webpackChunkName: "login" */ './views/Login.vue'),
    },
    {
      path: '/queue',
      name: 'queue',
      component: () =>
        import(/* webpackChunkName: "queue" */ './views/Queue.vue'),
    },
    {
      path: '/list',
      name: 'list',
      component: () =>
        import(/* webpackChunkName: "list" */ './views/List.vue'),
    },
  ],
})
