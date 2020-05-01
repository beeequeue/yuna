import Vue from 'vue'
import Router, { RawLocation } from 'vue-router'
import { ErrorHandler } from 'vue-router/types/router'

Vue.use(Router)

export enum View {
  Dashboard = 'dashboard',
  FirstTimeSetup = 'first-time-setup',
  Login = 'login',
  List = 'list',
  Queue = 'queue',
  Anime = 'anime',
  Settings = 'settings',
  Player = 'player',
}

export const router = new Router({
  mode: 'hash',
  base: '/',
  routes: [
    {
      path: '/',
      name: View.Dashboard,
      component: () =>
        import(
          /* webpackChunkName: "dashboard" */ './views/dashboard/dashboard.vue'
        ),
    },
    {
      path: '/first-time-setup',
      name: View.FirstTimeSetup,
      component: () =>
        import(
          /* webpackChunkName: "first-time-setup" */ './views/first-time-setup/first-time-setup.vue'
        ),
    },
    {
      path: '/login',
      name: View.Login,
      component: () =>
        import(/* webpackChunkName: "login" */ './views/login/login.vue'),
    },
    {
      path: '/queue',
      name: View.Queue,
      component: () =>
        import(/* webpackChunkName: "queue" */ './views/queue/queue.vue'),
    },
    {
      path: '/list',
      name: View.List,
      component: () =>
        import(/* webpackChunkName: "list" */ './views/list/list.vue'),
    },
    {
      path: '/anime/:id',
      name: View.Anime,
      component: () =>
        import(/* webpackChunkName: "anime" */ './views/anime/anime.vue'),
    },
    {
      path: '/settings',
      name: View.Settings,
      component: () =>
        import(
          /* webpackChunkName: "settings" */ './views/settings/settings.vue'
        ),
    },
  ],
})

/*
 * Preventing "NavigationDuplicated" errors in console in Vue-router >= 3.1.0
 * https://github.com/vuejs/vue-router/issues/2881#issuecomment-520554378
 */

const routerMethods = ['push', 'replace'] as const

routerMethods.forEach(method => {
  const originalCall = Router.prototype[method]

  Router.prototype[method] = function (
    location: RawLocation,
    onResolve?: Function,
    onReject?: ErrorHandler,
  ) {
    if (onResolve || onReject) {
      return originalCall.call(this, location, onResolve, onReject)
    }

    return (originalCall.call(this, location) as any).catch((err: any) => err)
  }
})
