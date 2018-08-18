import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
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
