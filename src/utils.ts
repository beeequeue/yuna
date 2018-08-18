import { Response } from 'superagent'
import { Location, VueRouter } from 'vue-router/types/router'

export interface RequestSuccess<B extends object = any> extends Response {
  status: 200
  ok: true
  body: B
}

export interface RequestError<
  S extends number = 400 | 404 | 500,
  B extends object = any
> extends Response {
  status: S | 500
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
