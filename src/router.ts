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
        import(/* webpackChunkName: "dashboard" */ './views/dashboard/dashboard.vue'),
    },
    {
      path: '/first-time-setup',
      name: 'first-time-setup',
      component: () =>
        import(/* webpackChunkName: "first-time-setup" */ './views/first-time-setup/first-time-setup.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () =>
        import(/* webpackChunkName: "login" */ './views/login/login.vue'),
    },
    {
      path: '/queue',
      name: 'queue',
      component: () =>
        import(/* webpackChunkName: "queue" */ './views/queue/queue.vue'),
    },
    {
      path: '/list',
      name: 'list',
      component: () =>
        import(/* webpackChunkName: "list" */ './views/list/list.vue'),
    },
    {
      path: '/anime/:id',
      name: 'anime',
      component: () =>
        import(/* webpackChunkName: "anime" */ './views/anime/anime.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () =>
        import(/* webpackChunkName: "settings" */ './views/settings/settings.vue'),
    },
  ],
})
