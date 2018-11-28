import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export const router = new Router({
  mode: 'hash',
  base: '/',
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () =>
        import(/* webpackChunkName: "dashboard" */ './views/Dashboard.vue'),
    },
    {
      path: '/first-time-setup',
      name: 'first-time-setup',
      component: () =>
        import(/* webpackChunkName: "first-time-setup" */ './views/FirstTimeSetup.vue'),
    },
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
    {
      path: '/anime/:id',
      name: 'anime',
      component: () =>
        import(/* webpackChunkName: "anime" */ './views/Anime.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () =>
        import(/* webpackChunkName: "settings" */ './views/Settings.vue'),
    },
  ],
})
