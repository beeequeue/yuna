import { Response } from 'superagent'
import { Location, VueRouter } from 'vue-router/types/router'

export interface RequestSuccess<B extends object> extends Response {
  status: 200
  ok: true
  body: B
}

export interface RequestError<B extends object> extends Response {
  status: 200 | 400 | 401 | 404 | 500 | 502
  ok: false
  body: B
}

export const goToLogin = (router: VueRouter) => {
  const options: Location = {
    path: 'login',
  }

  if (router.currentRoute.path !== '/') {
    options.query = {
      redirect: router.currentRoute.path,
    }
  }

  router.push(options)
}
